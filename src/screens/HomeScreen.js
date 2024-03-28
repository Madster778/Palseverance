import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import petImages from '../utils/petImages';

function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("Loading...");
  const [petName, setPetName] = useState("Loading...");
  const [happinessLevel, setHappinessLevel] = useState(100);
  const [petColor, setPetColor] = useState('default');
  const [backgroundColour, setBackgroundColour] = useState('grey'); // Default background color
  const [hasGlasses, setHasGlasses] = useState(false);
  const [buttonsPressed, setButtonsPressed] = useState({});


  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username || `${userData.firstName} ${userData.lastName}`);
          setPetName(userData.petName || "Pal");
          setHappinessLevel(userData.happinessMeter || 100);
          setPetColor(userData.equippedItems?.petColour || 'white');
          setBackgroundColour(userData.equippedItems?.backgroundColour || 'grey');
          setHasGlasses(userData.equippedItems?.glasses || false);
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

  const petMood = getPetMood().toLowerCase();
  const petImageKey = `${petColor}${petMood.charAt(0).toUpperCase() + petMood.slice(1)}`;
  const petImageSrc = petImages[petImageKey];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: backgroundColour}]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.petSection}>
        <View style={styles.petImageContainer}>
          <Image source={petImageSrc} style={styles.petImage} />
          {hasGlasses && <Image source={petImages.glassesOverlay} style={styles.glassesImage} />}
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
                  bottom: 0, // This ensures the bar grows upwards from the bottom
                }
              ]} />
            </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {['Habits', 'Badges', 'Shop', 'Inbox', 'Rank'].map((screen, index) => (
          <TouchableOpacity
            key={screen} // Assuming 'screen' is unique for each button
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
  username: {
    fontSize: 35, // Increased size
    fontWeight: 'bold',
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
    width: 350,
    height: 450,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  glassesImage: {
    position: 'absolute',
    width: 400, // Adjust as necessary
    height: 350,
    resizeMode: 'contain',
    right: -25, // Move to the right side
    bottom: 60,
    marginTop: 10,
  },
  petName: {
    fontSize: 50, // Increased font size for pet name
    fontWeight: 'bold',
    marginTop: -20,
    textAlign: 'center',
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
    backgroundColor: 'white', // This ensures the background is white
    width: '100%',
    height: '100%', // This fills the entire border
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
    backgroundColor: 'black', // Changed to black
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 75,
    width: 75,
  },
  navButtonPressed: {
    backgroundColor: '#333', // Darker shade for pressed state
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white', // Text color changed to white
  },
});

export default HomeScreen;
