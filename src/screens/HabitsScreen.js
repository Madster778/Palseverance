import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, onSnapshot, collection, addDoc, orderBy, query } from 'firebase/firestore';


const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [currency, setCurrency] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF'); // Default white background

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      onSnapshot(userRef, (doc) => {
        const userData = doc.data();
        setCurrency(userData.currency);
        setBackgroundColor(userData.equippedItems?.backgroundColour || '#FFFFFF');
      });
  
      // Create a query that orders habits by createdAt in ascending order
      const habitsQuery = query(collection(db, "Users", user.uid, "Habits"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
        const loadedHabits = [];
        snapshot.forEach((doc) => loadedHabits.push({ id: doc.id, ...doc.data() }));
        setHabits(loadedHabits);
      });
      return () => unsubscribe();
    }
  }, []);
  
  const addNewHabit = async () => {
    if (newHabitName.trim() === '') {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    try {
      await addDoc(collection(db, "Users", auth.currentUser.uid, "Habits"), {
        name: newHabitName,
        streak: 0,
        status: "pending",
        lastUpdated: new Date(), // You already have this
        createdAt: new Date(), // Add this for sorting
      });
      setNewHabitName('');
    } catch (error) {
      console.error("Error adding habit: ", error);
      Alert.alert("Error", "Failed to add habit");
    }
  };

  // Prompt for habit completion
  const confirmHabitCompletion = (habitId) => {
    Alert.alert(
      'Complete Habit',
      'Did you complete this habit today?',
      [
        { text: 'Not Yet' },
        { text: 'Yes', onPress: () => completeHabit(habitId) },
      ]
    );
  };

  // Complete a habit
  const completeHabit = async (habitId) => {
    // Additional logic to update the habit status, streak, and potentially update pet happiness
    console.log(`Habit ${habitId} completed today!`); // Placeholder for your logic
  };

  // Delete a habit from Firestore
  const deleteHabit = async (habitId) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteDoc(doc(db, "Users", auth.currentUser.uid, "Habits", habitId));
        },
      },
    ]);
  };

  // Render each habit item
  const renderHabitItem = ({ item }) => (
    <TouchableOpacity style={styles.habitItem} onPress={() => confirmHabitCompletion(item.id)}>
      <Text style={styles.habitName}>{item.name}</Text>
      <Text style={styles.habitStreak}>{`${item.streak} days`}</Text>
      <TouchableOpacity style={styles.habitDelete} onPress={() => deleteHabit(item.id)}>
        <MaterialCommunityIcons name="minus-circle-outline" size={24} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: backgroundColor}]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={[styles.header, { marginTop: StatusBar.currentHeight || 0 }]}>
          <Text style={styles.headerTitle}>Habits</Text>
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyText}>{`${currency} Coins`}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
        <View style={styles.addNewHabitContainer}>
          <TextInput
            placeholder="Enter new habit"
            placeholderTextColor="#000" // Ensure placeholder text is legible
            value={newHabitName}
            onChangeText={setNewHabitName}
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
  currencyContainer: {
    position: 'absolute',
    width: '100%', // Take up the full container width
    alignItems: 'center', // Center content horizontally
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 5,
    backgroundColor: '#ff6f00',
    borderRadius: 10,
  },
  habitName: {
    fontSize: 18,
    color: 'white',
    flex: 1,
  },
  habitStreak: {
    color: 'white',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newHabitInput: {
    backgroundColor: '#FFFFFF', // Keep input background white
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 5,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#ff6f00', // Button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 60, // Increase bottom padding to ensure list content does not overlap with the input field and button
    paddingTop: 20, // Ensures there's a gap between the header and the first habit
  },
});

export default HabitsScreen;