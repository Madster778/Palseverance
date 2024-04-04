const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import logger for logging messages
const logger = require("firebase-functions/logger");

exports.updateHabitStatusAndHappiness = functions.pubsub.schedule('0 0 * * *')
.timeZone('Europe/London')
.onRun(async () => {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('Users').get();

  usersSnapshot.forEach(async (userDoc) => {
    const userHabitsRef = userDoc.ref.collection('Habits');
    const habitsSnapshot = await userHabitsRef.get();

    let pendingCount = 0;
    let completedHabitsToday = 0;
    let longestCurrentStreak = 0;

    habitsSnapshot.forEach((habitDoc) => {
      const habit = habitDoc.data();
      const lastUpdated = habit.lastUpdated.toDate();
      const now = new Date();

      // Check if habit was completed today
      if (habit.status === 'complete' && lastUpdated.setHours(0,0,0,0) === now.setHours(0,0,0,0)) {
        completedHabitsToday++;
        if (habit.streak > longestCurrentStreak) {
          longestCurrentStreak = habit.streak;
        }
      }

      if (habit.status === 'pending') {
        pendingCount++;
        // Reset streak for pending habits
        habitDoc.ref.update({ streak: 0, status: 'pending' });
      } else if (habit.status === 'complete') {
        // Set complete habits to pending for the next day
        habitDoc.ref.update({ status: 'pending' });
      }
    });

    const totalHappinessReduction = pendingCount * 10;
    const newHappiness = Math.max((userDoc.data().happinessMeter || 100) - totalHappinessReduction, 0);

    let userUpdates = {
      happinessMeter: newHappiness
    };

    // If no habits were completed today, reset the longest current streak
    if (completedHabitsToday === 0) {
      userUpdates.longestCurrentStreak = 0;
    } else {
      // Update the longest current streak if there's a new maximum
      userUpdates.longestCurrentStreak = longestCurrentStreak;
    }

    // Execute user update
    userDoc.ref.update(userUpdates);

    console.log(`User ${userDoc.id} updated: happiness and habit streaks reset. Longest current streak updated.`);
  });

  console.log('All habit statuses, user happiness levels, and longest current streaks updated.');
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

exports.removeFriend = functions.https.onCall(async (data, context) => {
  // Ensure the initiating user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The user must be authenticated to remove friends.');
  }

  const { initiatorId, friendId } = data; // IDs of the users involved in the friendship

  // Make sure the initiatorId matches the authenticated user to prevent unauthorized removals
  if (context.auth.uid !== initiatorId) {
    throw new functions.https.HttpsError('permission-denied', 'The user does not have permission to remove this friend.');
  }

  const db = admin.firestore();
  const initiatorRef = db.collection('Users').doc(initiatorId);
  const friendRef = db.collection('Users').doc(friendId);

  try {
    await db.runTransaction(async (transaction) => {
      const initiatorDoc = await transaction.get(initiatorRef);
      const friendDoc = await transaction.get(friendRef);

      if (!initiatorDoc.exists || !friendDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'One or both users do not exist.');
      }

      // Remove friendId from the initiator's friend list
      transaction.update(initiatorRef, {
        friends: admin.firestore.FieldValue.arrayRemove(friendId),
      });

      // Remove initiatorId from the friend's friend list
      transaction.update(friendRef, {
        friends: admin.firestore.FieldValue.arrayRemove(initiatorId),
      });
    });

    console.log(`Friendship removed between ${initiatorId} and ${friendId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing friendship: ", error);
    return { success: false, error: error.message };
  }
});


