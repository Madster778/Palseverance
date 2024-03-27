import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { auth, db } from '../firebase/firebaseConfig.js'; // Make sure this export includes `db`
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
          // Assuming the user's data might not exist, check and create if necessary
          const userRef = doc(db, 'Users', authResult.user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // No user document exists, create a new one
            await setDoc(userRef, {
              username: `${authResult.user.displayName}`,
              firstName: authResult.user.displayName.split(' ')[0],
              lastName: authResult.user.displayName.split(' ')[1],
              petName: 'Pal',
              currency: 0,
              highestStreak: 0,
              happinessMeter: 100, // Setting initial happiness to 100%
              friends: [],
              badges: [],
              ownedItems: [],
              equippedItems: {
                backgroundColour: 'default',
                petColour: 'default',
                glasses: false,
              },
              settings: {
                music: true,
                soundEffects: true,
              },
            });
          }
      
          // Navigate to Home after ensuring the user document is in place
          navigation.navigate('Home');
        })
        .catch((error) => {
          // Handle errors here
          console.error(error);
        });
    }
  }, [response, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/palseverance-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.loginBox}>
        <TouchableOpacity
          onPress={() => promptAsync()}
          style={styles.button}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpLink}>
          <Text style={styles.signUpText}>Don't Have an Account? Sign Up Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 250, // Adjust based on your logo
    height: 171, // Adjust based on your logo
    marginBottom: 20,
  },
  loginBox: {
    width: '80%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  signUpLink: {
    marginTop: 20,
  },
  signUpText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
