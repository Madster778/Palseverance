import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebaseConfig'; // Update this path if needed
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import HabitsScreen from './screens/HabitsScreen';
import BadgesScreen from './screens/BadgesScreen';
import ShopScreen from './screens/ShopScreen';
import InboxScreen from './screens/InboxScreen';
import RankScreen from './screens/RankScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(null);

  useEffect(() => {
    // Check if user is signed in on app start
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsUserSignedIn(!!user); // !! converts truthy/falsy to boolean true/false
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isUserSignedIn ? "Home" : "Login"}
        screenOptions={{ headerShown: false }} // This will hide the header globally for all screens
      >
        {isUserSignedIn ? (
          // Screens that the user can navigate to when signed in
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
            <Stack.Screen name="Inbox" component={InboxScreen} />
            <Stack.Screen name="Rank" component={RankScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            {/* Add more screens as needed */}
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

