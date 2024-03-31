const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import logger for logging messages
const logger = require("firebase-functions/logger");

exports.updateHabitStatusAndHappiness = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Europe/London')
  .onRun(async () => {
    const usersSnapshot = await admin.firestore().collection('Users').get();
  
    usersSnapshot.forEach(async (userDoc) => {
      const habitsSnapshot = await userDoc.ref.collection('Habits').get();
      let pendingCount = 0;
      let updatePromises = [];
  
      habitsSnapshot.forEach((habitDoc) => {
        const habit = habitDoc.data();
        if (habit.status === 'pending') {
          pendingCount++;
          updatePromises.push(habitDoc.ref.update({ streak: 0 })); // Reset streak for pending habits
        } else if (habit.status === 'complete') {
          updatePromises.push(habitDoc.ref.update({ status: 'pending' })); // Set complete habits to pending
        }
      });
  
      // Calculate the total happiness reduction
      const totalHappinessReduction = pendingCount * 10;
      const newHappiness = Math.max((userDoc.data().happinessMeter || 100) - totalHappinessReduction, 0);
  
      // Prepare the user happiness update promise
      updatePromises.push(userDoc.ref.update({ happinessMeter: newHappiness }));
  
      // Execute all updates together
      await Promise.all(updatePromises).then(() => {
        console.log(`User ${userDoc.id} updated: happiness and habit streaks reset.`);
      }).catch((error) => {
        console.error("Error updating user habits and happiness: ", error);
      });
    });
  
    console.log('All habit statuses and user happiness levels updated');
  });
  