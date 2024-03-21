import React, { useState } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleUpdatePassword = () => {
    // Add logic to update the password
    console.log('Update password');
  };

  const handleSignOut = () => {
    // Add logic for signing out
    console.log('Sign out logic goes here');
    // Navigate to the Login screen
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Music</Text>
          <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Sound</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="New Password" 
          secureTextEntry
          value={newPassword} 
          onChangeText={setNewPassword} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Confirm New Password" 
          secureTextEntry
          value={confirmNewPassword} 
          onChangeText={setConfirmNewPassword} 
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Credits</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
  },
});

export default SettingsScreen;
