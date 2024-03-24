import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';

function LoginScreen({ navigation }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '792104178872-ojeuu42fdqp8ql8ejv8dnt0cr90d3be1.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Here you would typically navigate to your app's main screen and pass along the authentication token
      navigation.navigate('Home');
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/palseverance-logo.png')} // Replace with your logo path
        style={styles.logo}
        resizeMode="contain" // This ensures the entire logo is visible, scaled to fit
      />
      <View style={styles.loginBox}>
        <TouchableOpacity
          onPress={() => {
            promptAsync();
          }}
          style={styles.button}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpLink}>
          <Text style={styles.signUpText}>Don't Have Account? Sign Up Now</Text>
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
    width: 500 / 2, // Adjust width as needed
    height: 342 / 2, // Adjust height as needed; maintain aspect ratio
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
