// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Modal, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { auth, db } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot, collection, query, getDocs, where } from 'firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPetName, setNewPetName] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPetName, setCurrentPetName] = useState('');
  const [backgroundColour, setBackgroundColour] = useState('lightgrey');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCurrentUsername(userData.username);
          setCurrentPetName(userData.petName);
          setBackgroundColour(userData.equippedItems?.backgroundColour || 'lightgrey');
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Function to handle field updates (username or pet name)
  const handleUpdateField = async (field, newValue, currentValue) => {
    // Regex to check if the name contains only letters and numbers
    const validNameRegex = /^[a-zA-Z0-9]+$/;
  
    if (!validNameRegex.test(newValue.trim())) {
      Alert.alert("Invalid Input", "Name must contain only letters and numbers.");
      return;
    }
    if (newValue.trim() === '') {
      Alert.alert("Invalid Input", "Name cannot be blank.");
      return;
    }
    if (newValue === currentValue) {
      Alert.alert("No Change", "The new name is the same as the current name.");
      return;
    }
    if (newValue.length > 15) {
      Alert.alert("Invalid Input", "Name cannot be longer than 15 characters.");
      return;
    }
    if (field === 'username') {
      const usersRef = collection(db, 'Users');
      const querySnapshot = await getDocs(query(usersRef, where("username", "==", newValue.trim())));
  
      if (!querySnapshot.empty) {
        Alert.alert("Username Taken", "This username is already in use by someone else.");
        return;
      }
    }
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, { [field]: newValue.trim() });
      if (field === 'username') {
        setCurrentUsername(newValue.trim());
        Alert.alert("Update Successful", "Your username has been updated.");
      } else if (field === 'petName') {
        setCurrentPetName(newValue.trim());
        Alert.alert("Update Successful", "Your pet name has been updated.");
      }
    }
  };

  const handleShowCredits = () => {
    setModalVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColour }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="New Username"
          placeholderTextColor="#ff6f00"
          value={newUsername}
          onChangeText={setNewUsername}
        />
        <TouchableOpacity style={styles.button} onPress={() => handleUpdateField('username', newUsername, currentUsername)}>
          <Text style={styles.buttonText}>Update Username</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="New Pet Name"
          placeholderTextColor="#ff6f00"
          value={newPetName}
          onChangeText={setNewPetName}
        />
        <TouchableOpacity style={styles.button} onPress={() => handleUpdateField('petName', newPetName, currentPetName)}>
          <Text style={styles.buttonText}>Update Pet Name</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShowCredits}>
          <Text style={styles.buttonText}>Credits</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
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
            <Text style={styles.modalTitle}>Credits</Text>
            <AntDesign name="closecircleo" size={24} color="white" onPress={() => setModalVisible(false)} style={styles.modalCloseButton} />
            <Text style={styles.modalText}>App Designed by Mohammed Alom</Text>
            <Text style={styles.modalText}>App Created by Mohammed Alom</Text>

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 3,
    borderBottomColor: 'white', 
    backgroundColor: '#ff6f00', 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  labelBold: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6f00', 
  },
  input: {
    fontSize: 16,
    borderWidth: 3,
    borderColor: '#ff6f00',
    backgroundColor: 'white', 
    color: '#ff6f00',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#ff6f00',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', 
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#ff6f00',
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
    borderColor: 'white',
    borderWidth: 3
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15
  },
  modalText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  },
  modalCloseButton: {
    position: 'absolute',
    right: 10,
    top: 10
  }
});

export default SettingsScreen;
