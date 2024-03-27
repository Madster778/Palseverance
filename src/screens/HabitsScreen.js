import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([
    { id: '1', name: 'Habit 1', streak: 3 },
    { id: '2', name: 'Habit 2', streak: 7 },
    { id: '3', name: 'Habit 3', streak: 8 },
  ]);
  const [newHabitName, setNewHabitName] = useState('');

  const addNewHabit = () => {
    if (newHabitName.trim() === '') {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    const newId = habits.length > 0 ? String(Math.max(...habits.map(h => parseInt(h.id))) + 1) : '1';
    setHabits(currentHabits => [
      ...currentHabits,
      { id: newId, name: newHabitName, streak: 0 },
    ]);
    setNewHabitName('');
  };

  const confirmHabitCompletion = (id) => {
    Alert.alert(
      'Complete Habit',
      'Did you complete this habit today?',
      [
        { text: 'No' },
        { text: 'Yes', onPress: () => console.log(`Habit ${id} completed today!`) },
      ]
    );
  };

  const deleteHabit = (id) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => setHabits(currentHabits => currentHabits.filter(habit => habit.id !== id)) },
    ]);
  };

  const renderHabitItem = ({ item }) => (
    <TouchableOpacity style={styles.habitItem} onPress={() => confirmHabitCompletion(item.id)}>
      <Text style={styles.habitName}>{item.name}</Text>
      <Text style={styles.habitStreak}>{`${item.streak} days`}</Text>
      <TouchableOpacity style={styles.habitDelete} onPress={() => deleteHabit(item.id)}>
        <MaterialCommunityIcons name="minus-circle-outline" size={24} color="black" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "android" ? null : "padding"} style={{ flex: 1 }}>
        <View style={[styles.header, { marginTop: StatusBar.currentHeight || 0 }]}>
          <Text style={styles.headerTitle}>Habits</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
        <View style={styles.addNewHabitContainer}>
          <TextInput
            placeholder="Enter new habit"
            value={newHabitName}
            onChangeText={(text) => setNewHabitName(text)}
            style={styles.newHabitInput}
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.addButton} onPress={addNewHabit}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {},
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  habitName: {
    fontSize: 18,
    flex: 1,
  },
  habitStreak: {
    marginRight: 10,
    fontSize: 16,
  },
  habitDelete: {
    padding: 8,
  },
  addNewHabitContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row', // Ensure TextInput and Button are in the same row
    justifyContent: 'space-between', // This keeps the text input and button adequately spaced
    alignItems: 'center', // Align items vertically
  },
  newHabitInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 5,
    flex: 1, // Allows text input to expand and fill available space
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 60, // Increase bottom padding to ensure list content does not overlap with the input field and button
    paddingTop: 20, // Ensures there's a gap between the header and the first habit
  },
});

export default HabitsScreen;

