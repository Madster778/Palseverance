import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

function LoginScreen({ navigation }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '792104178872-ojeuu42fdqp8ql8ejv8dnt0cr90d3be1.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const googleCredential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, googleCredential)
        .then(async (authResult) => {
          // Check for the user's data in Firestore and create it if it doesn't exist
          const userRef = doc(db, 'Users', authResult.user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              username: authResult.user.displayName,
              firstName: authResult.user.displayName.split(' ')[0],
              lastName: authResult.user.displayName.split(' ')[1],
              petName: 'Pal',
              currency: 0,
              highestStreak: 0,
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
            });
          }

          navigation.replace('Home');
        })
        .catch(error => console.error(error));
    }
  }, [response, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/palseverance-logo.png')} // Replace with the actual path to your logo
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Tracking Habits with Purr-fection!</Text>
      <TouchableOpacity
        onPress={() => promptAsync()}
        style={styles.button}
        disabled={!request}
      >
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
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