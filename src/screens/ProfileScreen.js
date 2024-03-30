import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import petImages from '../utils/petImages'; // Ensure this is correctly imported

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'Users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      });
      return () => unsubscribe();
    }
  }, []);

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Select pet image based on equipped color and add default fallback
  const petColorKey = userData.equippedItems?.petColour
    ? `${userData.equippedItems.petColour}Happy`
    : 'whiteHappy'; // This should match the 'happy' key for a white pet in your petImages.js
  const petImageSrc = petImages[petColorKey];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: userData.equippedItems?.backgroundColour || 'white' }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>{`${userData.username}'s Profile`}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#ff6f00" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContent}>
        <Text style={styles.infoText}>{`${userData.firstName} ${userData.lastName}`}</Text>
        <View style={styles.petImageContainer}>
          <Image source={petImageSrc} style={styles.petImage} />
          {userData.equippedItems?.glasses && (
            <Image source={petImages.glassesOverlay} style={styles.glassesImage} />
          )}
        </View>
        <Text style={styles.infoText}>{`Pet Name: ${userData.petName}`}</Text>
        <Text style={styles.infoText}>{`Current Habit Streak: ${userData.highestStreak || 0} Days`}</Text>
        <Text style={styles.infoText}>{`Longest Habit Streak: ${userData.highestStreak || 0} Days`}</Text>
        <Text style={styles.infoText}>{`Currency Earned: ${userData.currency || 0} Coins`}</Text>
        <Text style={styles.infoText}>{`Number Of Friends: ${userData.friends?.length || 0}`}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#ff6f00', // Change text color to white
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    color: '#ff6f00', // Consider changing the icon color if necessary
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
    marginLeft: -30, // Adjust as needed
  },
  glassesImage: {
    position: 'absolute',
    width: 300,
    height: 500,
    resizeMode: 'contain',
    top: -110, // Adjust as needed
    left: -30, // Adjust as needed
  },
  infoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ff6f00', // Change text color to white
  },
});

export default ProfileScreen;
