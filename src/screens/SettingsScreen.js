import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { auth, db } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [petName, setPetName] = useState('');
  const [username, setUsername] = useState(''); // State for username change

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username); // Set initial username
          setPetName(userData.petName); // Set initial pet name
        }
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateUsername = async () => {
    console.log('Username updated to:', username);
    // Add your logic here to update the username
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, {
        username: username,
        petName: petName, // Update pet name at the same time if changed
      });
      console.log("User and pet name updated");
    }
  };

  // Existing handleUpdatePetName function can remain as is, or you can merge it with handleUpdateUsername

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      navigation.replace('Login'); // Replace with your login screen route name
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Music</Text>
          <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Sound</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Change Pet Name" 
          value={petName} 
          onChangeText={setPetName} 
        />

        <TextInput 
          style={styles.input} 
          placeholder="Change Username" 
          value={username} 
          onChangeText={setUsername} 
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
          <Text style={styles.buttonText}>Update Profile</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
  label: {
    fontSize: 18,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
  },
});

export default SettingsScreen;
