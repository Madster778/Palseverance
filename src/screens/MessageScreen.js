// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, onSnapshot, doc,addDoc, serverTimestamp } from 'firebase/firestore';

const MessageScreen = ({ navigation, route }) => {
  const [backgroundColor, setBackgroundColor] = useState('lightgrey');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { chatId, friendUsername, friendUserId } = route.params;

  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, 'Chats', chatId, 'Messages');
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const loadedMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(msg => msg.timestamp && typeof msg.timestamp.seconds === 'number')
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setMessages(loadedMessages);
      });
  
      return () => unsubscribe();
    }
  }, [chatId]);  
  
  useEffect(() => {
    const userRef = doc(db, 'Users', auth.currentUser.uid);
  
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setBackgroundColor(userData.equippedItems?.backgroundColour || 'lightgrey');
      } else {
        console.error('User document does not exist!');
        setBackgroundColor('lightgrey');
      }
    });
  
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [db]);

  const goToFriendProfile = () => {
    navigation.navigate('Profile', { userId: friendUserId });
  };

  // Function for users to send messages
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'Chats', chatId, 'Messages'), {
      text: newMessage,
      senderID: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  const renderMessageItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.senderID === auth.currentUser.uid ? styles.myMessage : styles.friendMessage,
    ]}>
      <Text style={[
        item.senderID === auth.currentUser.uid ? styles.myMessageText : styles.friendMessageText,
        styles.messageText,
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <TouchableOpacity onPress={goToFriendProfile}>
              <Text style={styles.headerTitle}>{friendUsername}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          inverted 
          contentContainerStyle={{ paddingTop: 10 }} 
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#ff6f00"
            multiline={true} 
            minHeight={40} 
            maxHeight={120}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#ff6f00" />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10, 
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#ff6f00', 
    borderBottomWidth: 3,
    borderBottomColor: 'white',
  },
  iconContainer: {
    zIndex: 10,
    paddingRight: 20,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -50,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  myMessage: {
    backgroundColor: '#ff6f00',
    alignSelf: 'flex-end',
    marginRight: 8,
    borderBottomRightRadius: 0,
  },
  friendMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    marginLeft: 8,
    borderBottomLeftRadius: 0, 
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: 'white',
  },
  friendMessageText: {
    color: '#ff6f00',
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 3,
    borderTopColor: 'white',
    backgroundColor: '#ff6f00', 
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    color: '#ff6f00',
  },
  sendButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageScreen;