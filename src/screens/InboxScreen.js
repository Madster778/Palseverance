import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, Modal, Button, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';

const InboxScreen = ({ navigation }) => {
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userFriends = await fetchUsersByIds(userData.friends);
          const userIncomingRequests = await fetchUsersByIds(userData.incomingRequests);
          setFriends(userFriends);
          setIncomingRequests(userIncomingRequests);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // UsernameInput component
  const UsernameInput = ({ onSendRequest }) => {
    const [input, setInput] = useState('');

    return (
      <View style={styles.usernameInputContainer}>
        <TextInput
          placeholder="Enter Username"
          value={input}
          onChangeText={setInput}
          style={styles.searchInput}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => {
            onSendRequest(input); // Pass the inputted username
            setInput(''); // Clear input after sending the request
          }}
          style={styles.sendRequestButton}
        >
          <Text>Send Request</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const fetchUserIdByUsername = async (username) => {
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    let userId = null;
    querySnapshot.forEach((doc) => {
      // Assuming that usernames are unique
      userId = doc.id;
    });
    return userId; // This will return `null` if no user is found
  };

  // Function to fetch user ID by username
  const fetchUsersByIds = async (userIds) => {
    const users = [];
    for (const userId of userIds) {
      const userDocRef = doc(db, 'Users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log('Fetched user data:', userDoc.data()); // Add this line to log fetched user data
        users.push({
          id: userDoc.id,
          ...userDoc.data(),
        });
      } else {
        console.log('No user found for ID:', userId); // Log when no user is found
      }
    }
    return users;
  };

  // Function to send friend requests
  const sendFriendRequest = async (username) => {
    const senderId = auth.currentUser.uid;
    const receiverUsername = username.trim();
  
    if (receiverUsername) {
      // Call fetchUserIdByUsername function to get the receiverId based on receiverUsername
      const receiverId = await fetchUserIdByUsername(receiverUsername);
      
      if (receiverId && receiverId !== senderId) {
        const senderRef = doc(db, 'Users', senderId);
        const receiverRef = doc(db, 'Users', receiverId);
        // Update the sender's outgoing requests
        await updateDoc(senderRef, {
          outgoingRequests: arrayUnion(receiverId),
        });
        // Update the receiver's incoming requests
        await updateDoc(receiverRef, {
          incomingRequests: arrayUnion(senderId),
        });
        Alert.alert('Success', 'Friend request sent.');
      } else if (receiverId === senderId) {
        Alert.alert('Error', 'You cannot send a friend request to yourself.');
      } else {
        Alert.alert('Error', 'User not found.');
      }
    } else {
      Alert.alert('Error', 'Username cannot be empty.');
    }
  };

  const acceptFriendRequest = async (requesterId) => {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'Users', userId);
    const requesterRef = doc(db, 'Users', requesterId);
    await updateDoc(userRef, {
      friends: arrayUnion(requesterId),
      incomingRequests: arrayRemove(requesterId),
    });
    await updateDoc(requesterRef, {
      friends: arrayUnion(userId),
      outgoingRequests: arrayRemove(userId),
    });
    Alert.alert('Success', 'Friend request accepted.');
    // Re-fetch friends and incoming requests here if necessary
  };

  const declineFriendRequest = async (requesterId) => {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      incomingRequests: arrayRemove(requesterId),
    });
    // Optionally, handle the declined request on the requester's side if necessary
    Alert.alert('Success', 'Friend request declined.');
    // Re-fetch incoming requests here if necessary
  };

  const openFriendRequestsModal = () => {
    setRequestsModalVisible(true);
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={openFriendRequestsModal} style={styles.viewRequestsButton}>
          <Text>View Requests</Text>
        </TouchableOpacity>
        <UsernameInput onSendRequest={sendFriendRequest} />
        <View style={{ width: 90 }} /> 
      </View>
    );
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
        <Text>{item.username}</Text>
      </TouchableOpacity>
      <View style={styles.requestActions}>
        <Button title="Accept" onPress={() => acceptFriendRequest(item.id)} />
        <Button title="Decline" onPress={() => declineFriendRequest(item.id)} />
      </View>
    </View>
  );
  
  // Function to render each friend item
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => console.log(`Navigate to messaging screen with: ${item.name}`)}
    >
      <Text style={styles.friendName}>{item.name}</Text>
    </TouchableOpacity>
  );

  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <SafeAreaView style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={requestsModalVisible}
          onRequestClose={() => {
            setRequestsModalVisible(!requestsModalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Friend Requests</Text>
                <TouchableOpacity
                  onPress={() => setRequestsModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <AntDesign name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={incomingRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={<Text>No incoming requests.</Text>}
              />
            </View>
          </View>
        </Modal>
  
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
    
        {/* The FlatList for displaying friends */}
        <FlatList
          ListHeaderComponent={renderHeader} // This renders your search and request buttons
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          ListFooterComponent={<View style={{ height: 20 }} />} // For spacing at the bottom
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 5, // Reduced padding to bring content higher up
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Use space-between to distribute items
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // This will ensure equal spacing
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to start
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewRequestsButton: {
    padding: 10,
    backgroundColor: '#ddd',
  },
  sendRequestButton: {
    padding: 10,
    backgroundColor: '#ddd',
    position: 'absolute',
    left: 175, // Adjust according to your layout
  },
  usernameInputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginRight: 9,
    flex: 1,
  },
  friendItem: {
    paddingVertical: 10,
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Set modal width
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 10,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Use space-around for even spacing
    alignItems: 'center', // Align items vertically
    padding: 10, // Add padding
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    width: '100%', // Make sure this is 100% of the modal width
  },
});

export default InboxScreen;