import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    petName: 'Fluffy',
    currentHabitStreak: '10 Days',
    longestHabitStreak: '20 Days',
    currencyEarned: '200 Coins',
    numberOfFriends: '5',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContent}>
        <Image 
          source={require('../assets/images/default-happy-pet.png')} // Replace with your image path
          style={styles.petImage}
        />
        <Text style={styles.infoText}>{`${userData.firstName} ${userData.lastName}`}</Text>
        <Text style={styles.infoText}>{`Pet Name: ${userData.petName}`}</Text>
        <Text style={styles.infoText}>{`Current Habit Streak: ${userData.currentHabitStreak}`}</Text>
        <Text style={styles.infoText}>{`Longest Habit Streak: ${userData.longestHabitStreak}`}</Text>
        <Text style={styles.infoText}>{`Currency Earned: ${userData.currencyEarned}`}</Text>
        <Text style={styles.infoText}>{`Number Of Friends: ${userData.numberOfFriends}`}</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  petImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default ProfileScreen;
