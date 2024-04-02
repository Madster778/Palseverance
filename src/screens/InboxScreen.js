import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, Modal, Alert, Button } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';

const InboxScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const functions = getFunctions();
  const [resolvedUsernames, setResolvedUsernames] = useState({});

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "Users", auth.currentUser.uid);
  
    const unsubscribe = onSnapshot(userRef, (doc) => {
      const userData = doc.data();
      const incomingReqIds = userData.incomingRequests || [];
  
      // Only resolve usernames if there are any incoming requests
      if (incomingReqIds.length > 0) {
        resolveUsernames(incomingReqIds);
      } else {
        // Handle the case where there are no incoming requests, if necessary
        setResolvedUsernames({});
      }
  
      setIncomingRequests(incomingReqIds);
    });
  
    return () => unsubscribe();
  }, []);

  const resolveUsernames = async (userIds) => {
    const usersCollectionRef = collection(db, 'Users');
    let newResolvedUsernames = { ...resolvedUsernames };
  
    // Only perform the query if there's at least one userId to look up
    if (userIds.length > 0) {
      const userDocs = await getDocs(query(usersCollectionRef, where('__name__', 'in', userIds)));
      userDocs.forEach((doc) => {
        const userData = doc.data();
        newResolvedUsernames[doc.id] = userData.username; // Assuming the field is 'username'
      });
  
      setResolvedUsernames(newResolvedUsernames);
    }
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
      console.log(result.data); // Success
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
        console.log(result.data); // Success
      })
      .catch((error) => {
        console.error("Error rejecting friend request: ", error.message);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.button, styles.viewRequestButton]}>
          <Text style={styles.buttonText}>View Requests</Text>
        </TouchableOpacity>
        <TextInput 
          placeholder="Enter Username" 
          style={styles.searchInput} 
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity onPress={sendFriendRequest} style={[styles.button, styles.sendRequestButton]}>
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Incoming Requests</Text>
            <AntDesign name="closecircleo" size={24} color="black" onPress={() => setModalVisible(false)} style={styles.modalCloseButton} />
            {incomingRequests.length > 0 ? (
              <FlatList
              data={incomingRequests}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.friendRequestBox}>
                  <Text style={styles.friendRequestName}>{resolvedUsernames[item]}</Text>
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
              <Text>No incoming requests</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInput: {
    flex: 2,
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 8,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ff6f00',
    flex: 1,
    marginHorizontal: 4, // Adds spacing between buttons
    borderRadius: 5, // Rounded corners for buttons
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  friendItem: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendName: {
    fontSize: 18,
  },
  listContentContainer: {
    paddingTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    marginTop: 50, // Push down from the top
    width: '95%', // Increase width if necessary
    backgroundColor: 'white',
    borderRadius: 20,
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
    marginBottom: 20, // Space between title and content
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  modalContentContainer: {
    width: '100%',
  },
  friendRequestBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align items to start
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12, // Adjust padding as necessary
    marginVertical: 8,
    width: '100%', // Box takes the full width of the modal
    elevation: 1,
  },
  friendRequestName: {
    fontWeight: 'bold',
    fontSize: 16,
    maxWidth: '50%', // Set max width to accommodate the buttons
  },
  friendRequestButtons: {
    flexDirection: 'row',
    marginLeft: 'auto', // Push the buttons to the end of the container
  },
  acceptButton: {
    backgroundColor: '#34C759',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12, // Reduce padding to decrease width
    marginRight: 8, // Space between the ACCEPT and DECLINE buttons
    minWidth: 80, // Set a minimum width for the buttons
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12, // Reduce padding to decrease width
    minWidth: 80, // Set a minimum width for the buttons
  },
});

export default InboxScreen;
