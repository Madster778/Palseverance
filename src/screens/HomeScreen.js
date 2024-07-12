// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import petImages from '../utils/petImages';

function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("Loading...");
  const [petName, setPetName] = useState("Loading...");
  const [happinessLevel, setHappinessLevel] = useState(100);
  const [petColor, setPetColor] = useState('grey');
  const [backgroundColour, setBackgroundColour] = useState('lightgrey');
  const [glasses, setGlasses] = useState('');
  const [hat, setHat] = useState('');
  const [buttonsPressed, setButtonsPressed] = useState({});

  // Real-time data fetch from Firestore when component mounts
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username); 
          setPetName(userData.petName); 
          setHappinessLevel(userData.happinessMeter); 
          setPetColor(userData.equippedItems?.petColour);
          setBackgroundColour(userData.equippedItems?.backgroundColour);
          setGlasses(userData.equippedItems?.glasses);
          setHat(userData.equippedItems?.hat);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const getPetMood = () => {
    if (happinessLevel <= 33.3) return 'Sad';
    if (happinessLevel <= 66.6) return 'Neutral';
    return 'Happy';
  };

  const getPetMoodColor = () => {
    const mood = getPetMood();
    switch (mood) {
      case 'Sad': return 'red';
      case 'Neutral': return 'orange';
      case 'Happy': return 'green';
      default: return 'green';
    }
  };

  // Calculate pet mood and select the correct image source based on the pet's current mood and color
  const petMood = getPetMood().toLowerCase();
  const petImageKey = `${petColor}${petMood.charAt(0).toUpperCase() + petMood.slice(1)}`;
  const petImageSrc = petImages[petImageKey];

  // Select glasses image based on equipped glasses
  const glassesImageKey = glasses
    ? `glasses${glasses.charAt(0).toUpperCase() + glasses.slice(1)}`
    : null;
  const glassesImageSrc = glassesImageKey ? petImages[glassesImageKey] : null;

  // Select hat image based on equipped hat
  const hatImageKey = hat
    ? `hat${hat.charAt(0).toUpperCase() + hat.slice(1)}`
    : null;
  const hatImageSrc = hatImageKey ? petImages[hatImageKey] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColour }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.usernameButton}>
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.closeButton}>
          <MaterialIcons name="settings" size={40} color="#ff6f00" />
        </TouchableOpacity>
      </View>

      <View style={styles.petSection}>
        <View style={styles.petImageContainer}>
          <Image source={petImageSrc} style={styles.petImage} />
          {hatImageSrc && (
            <Image source={hatImageSrc} style={styles.hatImage} />
          )}
          {glassesImageSrc && (
            <Image source={glassesImageSrc} style={styles.glassesImage} />
          )}
        </View>
        <Text style={styles.petName}>{petName}</Text>
        <View style={styles.happinessBarBorder}>
          <View style={styles.happinessBarBackground}>
            <View style={[
              styles.happinessBar,
                {
                  backgroundColor: getPetMoodColor(),
                  height: `${happinessLevel}%`,
                  position: 'absolute',
                  bottom: 0,
                }
              ]} />
            </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {['Habits', 'Badges', 'Shop', 'Inbox', 'Rank'].map((screen) => (
          <TouchableOpacity
            key={screen} 
            style={[styles.navButton, buttonsPressed[screen] ? styles.navButtonPressed : {}]}
            onPressIn={() => setButtonsPressed(prevState => ({ ...prevState, [screen]: true }))}
            onPressOut={() => setButtonsPressed(prevState => ({ ...prevState, [screen]: false }))}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.navButtonText}>{screen}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 1,
  },
  usernameButton: {
    zIndex: 10,
  },
  closeButton: {
    zIndex: 10,
  },
  username: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  petSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 330,
    height: 430,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  hatImage: {
    position: 'absolute',
    width: 330,
    resizeMode: 'contain',
    top: -410,
    right: 0,
    zIndex: 1,
  },
  glassesImage: {
    position: 'absolute',
    width: 330,
    height: 430,
    resizeMode: 'contain',
    right: -1,
    bottom: 55,
    zIndex: 0,
  },
  petName: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: -20,
    textAlign: 'center',
    color: '#ff6f00',
    marginLeft: 20,
  },
  happinessBarBorder: {
    position: 'absolute',
    left: 15,
    bottom: 100,
    height: 500,
    width: 30,
    borderColor: 'black',
    borderWidth: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  happinessBarBackground: {
    backgroundColor: 'white', 
    width: '100%',
    height: '100%', 
  },
  happinessBar: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  navButton: {
    backgroundColor: '#ff6f00', 
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 75,
    width: 75,
  },
  navButtonPressed: {
    backgroundColor: '#e65c00', 
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white', 
  },
});

export default HomeScreen;
