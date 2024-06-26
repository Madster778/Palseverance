// Reference React Native Expo documentation: https://docs.expo.dev
// Base template for all screen css was inspired through the help of ChatGPT

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './src/firebase/firebaseConfig';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import ShopScreen from './src/screens/ShopScreen';
import InboxScreen from './src/screens/InboxScreen';
import MessageScreen from './src/screens/MessageScreen';
import RankScreen from './src/screens/RankScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is signed in on app start
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsUserSignedIn(!!user);
      setLoading(false); // Set loading to false once the user's sign-in status is resolved
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Render loading screen while checking auth state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isUserSignedIn ? "Home" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {isUserSignedIn ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="Inbox" component={InboxScreen} />
            <Stack.Screen name="MessageScreen" component={MessageScreen} />
            <Stack.Screen name="Rank" component={RankScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
