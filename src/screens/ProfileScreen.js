// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import petImages from '../utils/petImages';

const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  // Get userId from route params, default to current user if not provided
  const userId = route.params?.userId || auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      const userDocRef = doc(db, 'Users', userId);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // Handle case where user data does not exist (e.g., invalid userId)
          console.log("No user data found.");
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

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
    : 'whiteHappy';
  const petImageSrc = petImages[petColorKey];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: userData.equippedItems?.backgroundColour || 'white' }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>{`${userData.username || 'User'}'s Profile`}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
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
        <Text style={styles.infoText}>{`Current Habit Streak: ${userData.longestCurrentStreak || 0} Days`}</Text>
        <Text style={styles.infoText}>{`Longest Habit Streak: ${userData.longestObtainedStreak || 0} Days`}</Text>
        <Text style={styles.infoText}>{`Total Currency Earned: ${userData.totalCurrencyEarned || 0} Coins`}</Text>
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
    padding: 18,
    borderBottomWidth: 3,
    borderBottomColor: 'white',
    backgroundColor: '#ff6f00',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: 'white', 
  },
  closeButton: {
    position: 'absolute',
    right: 10,
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petImageContainer: {
    width: 300, 
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', 
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  glassesImage: {
    position: 'absolute',
    width: 330, 
    height: 500,
    resizeMode: 'contain',
    top: -110,
    left: -15,
  },
  infoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ff6f00',
  },
});

export default ProfileScreen;
