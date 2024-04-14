import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { auth, db } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot, collection, query, getDocs, where } from 'firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPetName, setNewPetName] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPetName, setCurrentPetName] = useState('');
  const [backgroundColour, setBackgroundColour] = useState('lightgrey'); // For background color updates

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCurrentUsername(userData.username);
          setCurrentPetName(userData.petName);
          setMusicEnabled(userData.settings?.musicEnabled || false);
          setSoundEnabled(userData.settings?.soundEnabled || false);
          setBackgroundColour(userData.equippedItems?.backgroundColour || 'white'); // Listen for real-time updates
        }
      });
      return () => unsubscribe();
    }
  }, []);

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
    // If the field being updated is 'username', check if it's already taken
    if (field === 'username') {
      const usersRef = collection(db, 'Users');
      const querySnapshot = await getDocs(query(usersRef, where("username", "==", newValue.trim())));
  
      if (!querySnapshot.empty) {
        Alert.alert("Username Taken", "This username is already in use by someone else.");
        return;
      }
    }
    // Proceed with updating the document
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

  const handleToggleSetting = async (setting, value) => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, { [`settings.${setting}`]: value });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  const handleShowCredits = () => {
    Alert.alert("Credits", "App created by Your Name. Icons provided by Icon Provider.");
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
        <View style={styles.switchContainer}>
          <Text style={styles.labelBold}>Music</Text>
          <Switch
            value={musicEnabled}
            onValueChange={(value) => {
              setMusicEnabled(value);
              handleToggleSetting('musicEnabled', value);
            }}
            trackColor={{ false: "#ff0000", true: "#00ff00" }} // Red for false, green for true
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.labelBold}>Sound Effects</Text>
          <Switch
            value={soundEnabled}
            onValueChange={(value) => {
              setSoundEnabled(value);
              handleToggleSetting('soundEnabled', value);
            }}
            trackColor={{ false: "#ff0000", true: "#00ff00" }} // Red for false, green for true
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="New Username"
          placeholderTextColor="#ff6f00" // Ensure placeholder text is legible
          value={newUsername}
          onChangeText={setNewUsername}
        />
        <TouchableOpacity style={styles.button} onPress={() => handleUpdateField('username', newUsername, currentUsername)}>
          <Text style={styles.buttonText}>Update Username</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="New Pet Name"
          placeholderTextColor="#ff6f00" // Ensure placeholder text is legible
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // No changes needed here since background color changes dynamically
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 3,
    borderBottomColor: '#fff', // Change to white to match the header background
    backgroundColor: '#ff6f00', // Change to #ff6f00
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#fff', // Change text color to white
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
    color: '#ff6f00', // Change text color to white
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
    backgroundColor: '#ff6f00', // Change button background color
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Ensure text color is white
  },
});

export default SettingsScreen;
