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

  // Select glasses image based on equipped glasses
  const glassesImageKey = userData.equippedItems?.glasses
    ? `glasses${userData.equippedItems.glasses.charAt(0).toUpperCase() + userData.equippedItems.glasses.slice(1)}`
    : null;
  const glassesImageSrc = glassesImageKey ? petImages[glassesImageKey] : null;

  // Select hat image based on equipped hat
  const hatImageKey = userData.equippedItems?.hat
    ? `hat${userData.equippedItems.hat.charAt(0).toUpperCase() + userData.equippedItems.hat.slice(1)}`
    : null;
  const hatImageSrc = hatImageKey ? petImages[hatImageKey] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: userData.equippedItems?.backgroundColour || 'white' }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>{`${userData.username || 'User'}'s Profile`}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContent}>
        <View style={styles.petImageContainer}>
          <Image source={petImageSrc} style={styles.petImage} />
          {hatImageSrc && (
            <Image source={hatImageSrc} style={styles.hatImage} />
          )}
          {glassesImageSrc && (
            <Image source={glassesImageSrc} style={styles.glassesImage} />
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
    overflow: 'visible',
    marginBottom: 20,
  },
  petImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  hatImage: {
    position: 'absolute',
    width: 300,
    resizeMode: 'contain',
    top: -460,
    zIndex: 1,
  },
  glassesImage: {
    position: 'absolute',
    width: 300, 
    height: 430,
    resizeMode: 'contain',
    top: -115,
    right: -1,
    zIndex: 0,
  },
  infoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ff6f00',
  },
});

export default ProfileScreen;