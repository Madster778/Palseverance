// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, onSnapshot, getDoc } from 'firebase/firestore';

const InboxScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [key, setKey] = useState(0);
  const [username, setUsername] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey'); 
  const functions = getFunctions();
  const [resolvedUsernames, setResolvedUsernames] = useState({});

  // Subscribe to the current user's document for real-time updates
  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'Users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      const userData = doc.data();
      setBackgroundColor(userData.equippedItems?.backgroundColour || 'lightgrey');
      setFriendsList(userData.friends || []);
      const incomingReqIds = userData.incomingRequests || [];
      if (incomingReqIds.length > 0) {
        resolveUsernames(incomingReqIds);
      } else {
        setResolvedUsernames({});
      }
      setIncomingRequests(incomingReqIds);
    });

    return unsubscribe;
  }, []);

  // Listener to force a component re-render when it comes into focus
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setKey(prevKey => prevKey + 1);
    });

    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    resolveUsernames(friendsList);
  }, [friendsList]);

  // Effect to resolve usernames whenever there's a change in incoming requests or friends list
  useEffect(() => {
    resolveUsernames([...incomingRequests, ...friendsList]);
  }, [incomingRequests, friendsList]);

  // Function to resolve user IDs to usernames
  const resolveUsernames = async (userIds) => {
    const usersCollectionRef = collection(db, 'Users');
    let usernamesMap = { ...resolvedUsernames };
    
    const userDocs = await Promise.all(userIds.map(id => getDoc(doc(usersCollectionRef, id))));
    userDocs.forEach((docSnap, index) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        usernamesMap[userIds[index]] = userData.username;
      } else {
        usernamesMap[userIds[index]] = 'Unknown';
      }
    });
  
    setResolvedUsernames(usernamesMap);
  };

  const navigateToProfile = (userId) => {
    navigation.navigate('Profile', { userId });
  };

  const sendFriendRequest = async () => {
    if (!username.trim()) {
      Alert.alert('Invalid Input', 'Username cannot be empty.');
      return;
    }
  
    const senderUid = auth.currentUser.uid;
  
    try {
      // Get the current user's data to check for existing relationships
      const senderDoc = await getDoc(doc(db, "Users", senderUid));
      const senderData = senderDoc.data();
  
      // Query for the recipient user by username
      const querySnapshot = await getDocs(query(collection(db, "Users"), where("username", "==", username.trim())));
      const recipientDoc = querySnapshot.docs[0];
  
      if (!recipientDoc) {
        Alert.alert('Invalid Input', 'User not found.');
        return;
      }
  
      const recipientUid = recipientDoc.id;
  
      // Perform checks against the recipient UID
      const alreadyRequested = senderData.outgoingRequests.includes(recipientUid);
      const alreadyFriends = senderData.friends.includes(recipientUid);
      const hasIncomingRequest = senderData.incomingRequests.includes(recipientUid);
  
      if (recipientUid === senderUid) {
        Alert.alert('Invalid Input', 'You cannot send a friend request to yourself.');
      } else if (alreadyRequested) {
        Alert.alert('Invalid Input', 'Outgoing friend request already sent.');
      } else if (alreadyFriends) {
        Alert.alert('Invalid Input', 'User already added as a friend.');
      } else if (hasIncomingRequest) {
        Alert.alert('Invalid Input', 'User has already sent you a friend request.');
      } else {
        // If none of the above checks are true, send the friend request
        const sendRequest = httpsCallable(functions, 'sendFriendRequest');
        sendRequest({ recipientId: recipientUid })
          .then((result) => {
            if (result.data.success) {
              Alert.alert('Success', 'Friend request sent.');
            } else {
              Alert.alert('Error', 'Could not send friend request.');
            }
          })
          .catch((error) => {
            console.error("Error sending friend request: ", error);
            Alert.alert('Error', 'Could not send friend request.');
          });
      }
    } catch (error) {
      console.error("Error during the friend request operation: ", error);
      Alert.alert('Error', 'An error occurred during the friend request operation.');
    }
  };
  

  // Call acceptFriendRequest Cloud Function
  const callAcceptFriendRequest = (requesterId) => {
    const acceptRequest = httpsCallable(functions, 'acceptFriendRequest');
    acceptRequest({ requesterId, recipientId: auth.currentUser.uid })
    .then((result) => {
      console.log(result.data);
    })
    .catch((error) => {
      console.error("Error accepting friend request: ", error.message);
    });
  };

  // Call rejectFriendRequest Cloud Function
  const callRejectFriendRequest = (requesterId) => {
    const rejectRequest = httpsCallable(functions, 'rejectFriendRequest');
    rejectRequest({ requesterId, recipientId: auth.currentUser.uid })
      .then((result) => {
        console.log(result.data);
      })
      .catch((error) => {
        console.error("Error rejecting friend request: ", error.message);
      });
  };

  const handleRemoveFriend = (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Do you want to remove this user from your friend list?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: () => confirmRemoveFriend(friendId)
        }
      ]
    );
  };
  
  const confirmRemoveFriend = async (friendId) => {
    // Remove the friend from the user's friend list calling the removeFriend Cloud Function
    const removeFriendFunction = httpsCallable(functions, 'removeFriend');
    try {
      const removeFriendResult = await removeFriendFunction({
          initiatorId: auth.currentUser.uid, 
          friendId
      });
            if (removeFriendResult.data.success) {
          // Delete the chat and messages between the two users calling the deleteUserChatMessages Cloud Funtion
          const deleteUserChatMessages = httpsCallable(functions, 'deleteUserChatMessages'); 
          const deleteUserChatMessagesResult = await deleteUserChatMessages({
              userId1: auth.currentUser.uid,
              userId2: friendId
          });
          
          if (deleteUserChatMessagesResult.data.success) {
              setFriendsList(currentList => currentList.filter(id => id !== friendId));
              Alert.alert('Success', 'Friend and chat history removed successfully.');
          } else {
              Alert.alert('Error', deleteUserChatMessagesResult.data.error || 'Failed to delete chat and messages.');
          }
      } else {
          Alert.alert('Error', removeFriendResult.data.error || 'Failed to remove friend.');
      }
    } catch (error) {
        Alert.alert('Error', error.message || 'An error occurred while removing the friend and chat.');
    }
  };
  
  // Function to handle opening a chat
  const openChat = async (friendUserId) => {
    // Attempt to find an existing chat document or create a new one if not found
    try {
      const chatsRef = collection(db, 'Chats');
      const q = query(chatsRef, where('participants', 'array-contains', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      let chatDoc = querySnapshot.docs.find((doc) => doc.data().participants.includes(friendUserId));
      let chatId;
  
      if (chatDoc) {
        chatId = chatDoc.id;
      } else {
        const docRef = await addDoc(chatsRef, {
          participants: [auth.currentUser.uid, friendUserId],
          messages: [],
        });
        chatId = docRef.id;
      }
  
      const userDoc = await getDoc(doc(db, 'Users', friendUserId));
      const friendUsername = userDoc.exists() ? userDoc.data().username : null;
  
      if (friendUsername) {
        // Navigate to the MessageScreen with the chatId and friendUsername
        navigation.navigate('MessageScreen', {
          userId: auth.currentUser.uid,
          chatId: chatId,
          friendUsername: friendUsername,
          friendUserId: friendUserId
        });
      } else {
        console.error('Failed to retrieve friend username');
        Alert.alert('Error', 'Failed to retrieve friend username.');
      }
    } catch (error) {
      console.error('Failed to open chat:', error);
      Alert.alert('Error', 'Failed to open chat.');
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItemContainer}
      onPress={() => openChat(item)}
    >
      <View style={styles.friendItem}>
        <Text style={styles.friendName}>{resolvedUsernames[item]}</Text>
        <TouchableOpacity onPress={() => handleRemoveFriend(item)} style={styles.friendDelete}>
          <MaterialCommunityIcons name="minus-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );  

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} key={key}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.button, styles.viewRequestButton]}>
          <Text style={styles.buttonText}>View Requests</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Enter Username"
          placeholderTextColor="#ff6f00"
          style={styles.searchInput}
          value={username}
          onChangeText={setUsername}
          maxLength={15}
        />
        <TouchableOpacity onPress={sendFriendRequest} style={[styles.button, styles.sendRequestButton]}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friendsList}
        keyExtractor={(item) => item}
        renderItem={renderFriendItem}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Incoming Requests</Text>
            <AntDesign name="closecircleo" size={24} color="black" onPress={closeModal} style={styles.modalCloseButton} />
            {incomingRequests.length > 0 ? (
              <FlatList
                data={incomingRequests}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <View style={styles.friendRequestBox}>
                    <TouchableOpacity onPress={() => navigateToProfile(item)}>
                      <Text style={styles.friendRequestName}>{resolvedUsernames[item]}</Text>
                    </TouchableOpacity>
                    <View style={styles.friendRequestButtons}>
                      <TouchableOpacity onPress={() => callAcceptFriendRequest(item)} style={styles.acceptButton}>
                        <Text style={styles.buttonText}>ACCEPT</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => callRejectFriendRequest(item)} style={styles.rejectButton}>
                        <Text style={styles.buttonText}>DECLINE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.modalContentContainer}
              />
            ) : (
              <Text style={styles.noRequestsText}>No incoming requests</Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'white', 
    backgroundColor: '#ff6f00',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchInput: {
    flex: 2,
    backgroundColor: 'white',
    borderColor: '#ff6f00',
    borderWidth: 3,
    height: 50,
    padding: 10,
    marginHorizontal: 8,
    color: '#ff6f00',
    borderRadius: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 0,
    backgroundColor: '#ff6f00',
    borderRadius: 5,
    marginHorizontal: 4,
    width: 110,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewRequestButton: {
    width: 100,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 3,
  },
  sendRequestButton: {
    width: 100,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 3,
  },
  friendItemContainer: {
    backgroundColor: '#ff6f00', 
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 8,
    alignSelf: 'center',
    width: '90%',
    borderWidth: 3, 
    borderColor: 'white',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 18,
    color: 'white', 
    flex: 1,
  },
  friendDelete: {
    marginLeft: 'auto',
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    marginTop: 50,
    width: '95%', 
    backgroundColor: '#ff6f00', 
    borderRadius: 20,
    borderColor: 'white', 
    borderWidth: 3,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: 'white',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    color: 'white',
  },
  modalContentContainer: {
    width: '100%',
  },
  friendRequestBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    width: '100%',
    elevation: 1,
  },
  friendRequestName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ff6f00',
    alignSelf: 'center',
  },
  friendRequestButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  noRequestsText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center', 
    marginTop: 20, 
  },
  acceptButton: {
    backgroundColor: '#34C759',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12, 
    marginRight: 8,
    minWidth: 80,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
});

export default InboxScreen;
