import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

function HomeScreen({ navigation }) {
  const username = "Username";
  // Make sure to update the path to your actual pet image
  const petImage = require('../assets/images/default-pet.png');
  const petName = "Pet Name"; // Update as needed
  const happinessLevel = 75; // Example happiness level (0-100)
  // Calculate the happiness bar height as a percentage of the view height
  const happinessBarHeight = `${happinessLevel}%`;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.username}>{username}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={30} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.petSection}>
        <View style={[styles.happinessBar, { height: happinessBarHeight }]} />
        <Image source={petImage} style={styles.petImage} />
        <Text style={styles.petName}>{petName}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {['Habits', 'Badges', 'Shop', 'Inbox', 'Rank'].map((screen) => (
          <TouchableOpacity
            key={screen}
            style={styles.navButton}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.navButtonText}>{screen}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // or your preferred background color
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  username: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  petSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  happinessBar: {
    position: 'absolute',
    left: 10,
    width: 20,
    backgroundColor: 'green',
    bottom: 100, // Adjust this value to align with the pet image's bottom
  },
  petImage: {
    width: 350,
    height: 400,
    resizeMode: 'contain',
  },
  petName: {
    marginTop: 10,
    fontSize: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#DDD',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 75, // Adjust for square buttons
    width: 75, // This makes the button square
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
