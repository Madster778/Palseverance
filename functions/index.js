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

exports.sendFriendRequest = functions.https.onCall(async (data, context) => {
  // Ensure authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send friend requests.');
  }

  const requesterId = context.auth.uid; // ID of the user sending the request
  const { recipientId } = data; // ID of the user receiving the request

  const db = admin.firestore();
  const requesterRef = db.collection('Users').doc(requesterId);
  const recipientRef = db.collection('Users').doc(recipientId);

  try {
    await db.runTransaction(async (transaction) => {
      transaction.update(requesterRef, {
        outgoingRequests: admin.firestore.FieldValue.arrayUnion(recipientId),
      });
      transaction.update(recipientRef, {
        incomingRequests: admin.firestore.FieldValue.arrayUnion(requesterId),
      });
    });

    return { success: true, message: 'Friend request sent successfully.' };
  } catch (error) {
    console.error("Error sending friend request: ", error);
    return { success: false, error: error.message };
  }
});

exports.acceptFriendRequest = functions.https.onCall(async (data, context) => {
  const { requesterId, recipientId } = data; // IDs of the users involved in the friend request

  const db = admin.firestore();
  const requesterRef = db.collection('Users').doc(requesterId);
  const recipientRef = db.collection('Users').doc(recipientId);

  // Transaction to ensure atomic updates
  try {
    await db.runTransaction(async (transaction) => {
      // Update the requester's document
      transaction.update(requesterRef, {
        outgoingRequests: admin.firestore.FieldValue.arrayRemove(recipientId),
        friends: admin.firestore.FieldValue.arrayUnion(recipientId),
      });

      // Update the recipient's document
      transaction.update(recipientRef, {
        incomingRequests: admin.firestore.FieldValue.arrayRemove(requesterId),
        friends: admin.firestore.FieldValue.arrayUnion(requesterId),
      });
    });

    console.log(`Friend request accepted between ${requesterId} and ${recipientId}`);
    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request: ", error);
    return { success: false, error: error.message };
  }
});

exports.rejectFriendRequest = functions.https.onCall(async (data, context) => {
  const { requesterId, recipientId } = data;

  const db = admin.firestore();
  const requesterRef = db.collection('Users').doc(requesterId);
  const recipientRef = db.collection('Users').doc(recipientId);

  try {
    await db.runTransaction(async (transaction) => {
      transaction.update(requesterRef, {
        outgoingRequests: admin.firestore.FieldValue.arrayRemove(recipientId),
      });

      transaction.update(recipientRef, {
        incomingRequests: admin.firestore.FieldValue.arrayRemove(requesterId),
      });
    });

    console.log(`Friend request rejected between ${requesterId} and ${recipientId}`);
    return { success: true };
  } catch (error) {
    console.error("Error rejecting friend request: ", error);
    return { success: false, error: error.message };
  }
});

