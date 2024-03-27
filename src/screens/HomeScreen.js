import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import petImages from '../utils/petImages';

function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("Loading...");
  const [petName, setPetName] = useState("Loading...");
  const [happinessLevel, setHappinessLevel] = useState(100);
  const [petColor, setPetColor] = useState('default');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUsername(userData.username || `${userData.firstName} ${userData.lastName}`);
          setPetName(userData.petName);
          setHappinessLevel(userData.happinessMeter || 100);
          setPetColor(userData.equippedItems?.petColour || 'default');
        }
      }
    };

    fetchUserData();
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

  // Adjusted for slight extension beyond the pet
  const petImageHeight = 350; // Example height, adjust as needed
  const extraLength = 20; // Extra length to extend beyond the pet
  const containerHeight = Dimensions.get('window').height; // Get screen height
  const barHeight = ((happinessLevel / 100) * (petImageHeight + extraLength)); // Calculate bar height based on happiness level + extra length
  const barTopPosition = (containerHeight / 2) - (petImageHeight / 2); // Top position of the bar aligning with pet's top

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.petSection}>
        <Image source={petImageSrc} style={[styles.petImage, {height: petImageHeight}]} />
        <Text style={styles.petName}>{petName}</Text>
        <View style={[
          styles.happinessBar,
          {
            backgroundColor: getPetMoodColor(),
            height: barHeight,
            top: barTopPosition + petImageHeight - barHeight - 24, // Adjust for pet name alignment, with extra length
          }
        ]} />
      </View>

      <View style={styles.buttonContainer}>
        {['Habits', 'Badges', 'Shop', 'Inbox', 'Rank'].map((screen) => (
          <TouchableOpacity
            key={screen}
            style={styles.navButton}
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
    backgroundColor: 'white',
    justifyContent: 'space-between', // Ensures the content is spaced out to fill the screen
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  username: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  petSection: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  happinessBar: {
    position: 'absolute',
    left: 10,
    width: 20,
    bottom: 0, // Adjust if necessary
  },
  petImage: {
    width: 300, // Adjust as necessary
    resizeMode: 'contain',
  },
  petName: {
    marginTop: 10,
    fontSize: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 20, // Ensure buttons are pushed to the bottom
  },
  navButton: {
    backgroundColor: '#DDD',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 75,
    width: 75,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default HomeScreen;