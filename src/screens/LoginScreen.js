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
      setIsLoading(true); // Start loading
      const { id_token } = response.params;
      const googleCredential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, googleCredential)
        .then(async (authResult) => {
          const userRef = doc(db, 'Users', authResult.user.uid);
          const userSnap = await getDoc(userRef);
        
          // Split the displayName by space. Assume first part is the first name, and the rest is the last name.
          const nameParts = authResult.user.displayName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Join back the rest if there are multiple parts, else set lastName to empty string
        
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              username: authResult.user.displayName || firstName, // Use displayName or firstName as fallback
              firstName: firstName,
              lastName: lastName, // This can be an empty string if lastName does not exist
              petName: 'Pal',
              currency: 0, // Current available currency
              totalCurrencyEarned: 0, // Total currency earned over time
              longestCurrentStreak: 0, // This will be the highest streak ever achieved across all habits
              longestObtainedStreak: 0, // The highest active streak among current habits
              happinessMeter: 100,
              friends: [],
              badges: [],
              ownedItems: [],
              equippedItems: {
                backgroundColour: 'lightgrey',
                petColour: 'white',
                glasses: false,
              },
              settings: {
                musicEnabled: true,
                soundEnabled: true,
              },
              incomingRequests: [], // Initialize as empty array
              outgoingRequests: [] // Initialize as empty array
            });
          }
          setIsLoading(false); // End loading
          navigation.replace('Home');
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false); // End loading on error
        });
    }
  }, [response, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/palseverance-logo.png')} // Replace with your actual logo path
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Tracking Habits with Purr-fection!</Text>
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
    height: width * 0.6 * (171 / 250), // Keep the logo aspect ratio
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;