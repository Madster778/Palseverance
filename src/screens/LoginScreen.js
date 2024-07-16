// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

function LoginScreen({ navigation }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '792104178872-ojeuu42fdqp8ql8ejv8dnt0cr90d3be1.apps.googleusercontent.com',
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state to manage button interaction

  React.useEffect(() => {
    if (response?.type === 'success') {
      setIsLoading(true); // Trigger loading state when authentication is successful
      const { id_token } = response.params;
      const googleCredential = GoogleAuthProvider.credential(id_token); // Create a Google credential with the ID token
      
      // Attempt to sign in with the obtained Google credential
      signInWithCredential(auth, googleCredential)
        .then(async (authResult) => {
          const userRef = doc(db, 'Users', authResult.user.uid);
          const userSnap = await getDoc(userRef);
        
          // Process the display name to separate first and last names then join the names back if possible
          const nameParts = authResult.user.displayName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
          const initialBadges = [
            { badgeId: "habitStreak", highestTierAchieved: 0 },
            { badgeId: "wealthBuilder", highestTierAchieved: 0 },
            { badgeId: "collector", highestTierAchieved: 0 }
          ];
          
          // If the user document doesn't exist, initialise it with default values
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              username: authResult.user.displayName || firstName,
              firstName: firstName,
              lastName: lastName,
              petName: 'Pal',
              currency: 0,
              totalCurrencyEarned: 0,
              longestCurrentStreak: 0,
              longestObtainedStreak: 0,
              happinessMeter: 100,
              friends: [],
              badges: initialBadges,
              ownedItems: [],
              equippedItems: {
                backgroundColour: 'lightgrey',
                petColour: 'grey',
                glasses: 'none',
                hat: 'none'
              },
              incomingRequests: [],
              outgoingRequests: []
            });
          }
          setIsLoading(false);  // Reset loading state
          navigation.replace('Home');  // Navigate to the Home screen after successful login and initialization
        })
        .catch(error => {
          console.error(error);  // Log any errors
          setIsLoading(false);  // Reset loading state in case of an error
        });
    }
  }, [response, navigation]);

  return (
    <View style={styles.container}>
      <Image
        // Logo was created using https://www.logomaker.com
        source={require('../assets/images/palseverance-logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Tracking Habits with Pal-tastic Results!</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ff6f00" />
      ) : (
        <TouchableOpacity
          onPress={() => {
            if (!isLoading) promptAsync();
          }}
          style={styles.button}
          disabled={!request || isLoading}
        >
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6 * (171 / 250),
  },
  tagline: {
    fontSize: 18,
    color: '#888',
    marginTop: 20,
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#ff6f00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;