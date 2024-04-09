import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, onSnapshot, collection, addDoc, deleteDoc, orderBy, query, runTransaction } from 'firebase/firestore';

const HabitsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [currency, setCurrency] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey'); // Default white background

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      onSnapshot(userRef, (doc) => {
        const userData = doc.data();
        setCurrency(userData.currency);
        setBackgroundColor(userData.equippedItems?.backgroundColour);
      });
  
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
        lastUpdated: new Date(),
        createdAt: new Date(),
      });
      setNewHabitName('');
    } catch (error) {
      console.error("Error adding habit: ", error);
      Alert.alert("Error", "Failed to add habit");
    }
  };

  // Prompt for habit completion
  const confirmHabitCompletion = async (habit) => {
    // Ensure habit is defined and has a lastUpdated field
    if (!habit || !habit.lastUpdated) {
      console.error("No lastUpdated field for habit:", habit);
      Alert.alert("Error", "Habit data is incomplete.");
      return;
    }
  
    const now = new Date();
    const lastUpdated = habit.lastUpdated.toDate(); // Convert Firestore Timestamp to JavaScript Date
    const diffDays = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
  
    if (habit.status === "complete" && diffDays < 1) {
      Alert.alert("Habit already completed today");
      return;
    }
  
    Alert.alert(
      'Complete Habit',
      'Did you complete this habit today?',
      [
        { text: 'Not Yet' },
        { text: 'Yes', onPress: () => completeHabit(habit.id) },
      ]
    );
  };
  

  // Complete a habit
  const completeHabit = async (habitId) => {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const habitRef = doc(db, "Users", auth.currentUser.uid, "Habits", habitId);
  
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const habitDoc = await transaction.get(habitRef);
        if (!habitDoc.exists()) {
          console.error("Document does not exist!");
          return;
        }
        const habitData = habitDoc.data();
        const newStreak = habitData.streak + 1;
        const currencyIncrement = 10 * newStreak; // Assuming 10 is the currency reward for completing a habit
        const newCurrency = userDoc.data().currency + currencyIncrement;
        const newHappiness = Math.min(userDoc.data().happinessMeter + 5, 100); // Increment happiness by 5, capped at 100
  
        let longestCurrentStreak = userDoc.data().longestCurrentStreak || 0;
        let totalCurrencyEarned = userDoc.data().totalCurrencyEarned || 0;
        let longestObtainedStreak = userDoc.data().longestObtainedStreak || 0;
  
        totalCurrencyEarned += currencyIncrement;
  
        if (newStreak > longestCurrentStreak) {
          longestCurrentStreak = newStreak;
        }
  
        if (newStreak > longestObtainedStreak) {
          longestObtainedStreak = newStreak;
        }
  
        // Update the habit document with the new streak and set its status to 'complete'
        transaction.update(habitRef, { streak: newStreak, status: "complete", lastUpdated: new Date() });
  
        // Update the user document with the new currency, happiness, total currency earned, longest current streak, and longest obtained streak
        transaction.update(userRef, { 
          currency: newCurrency, 
          happinessMeter: newHappiness,
          totalCurrencyEarned: totalCurrencyEarned,
          longestCurrentStreak: longestCurrentStreak,
          longestObtainedStreak: longestObtainedStreak
        });
      });
      console.log("Habit completed successfully");
    } catch (e) {
      console.error("Transaction failed: ", e);
    }
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
    <TouchableOpacity style={styles.habitItem} onPress={() => confirmHabitCompletion(item)}>
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
            <Text style={styles.currencyText}>{`Currency: ${currency} `}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
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
            placeholderTextColor="#ff6f00" // Ensure placeholder text is legible
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
    paddingVertical: 18,
    borderBottomWidth: 3,
    borderBottomColor: 'white', // Change to white
    backgroundColor: '#ff6f00', // Change to #ff6f00
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white', // Change to white
  },
  currencyContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Currency text color to white
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
    backgroundColor: '#ff6f00',
    borderColor: 'white',
    borderWidth: 3,
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',
  },
  habitName: {
    fontSize: 18,
    color: 'white', // Update text color
    flex: 1,
  },
  habitStreak: {
    color: 'white', // Update text color
    marginRight: 10,
    fontSize: 16,
  },
  habitDelete: {
    padding: 8,
  },
  addNewHabitContainer: {
    borderTopWidth: 3,
    borderTopColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newHabitInput: {
    fontSize: 16,
    borderWidth: 3,
    borderColor: '#ff6f00',
    backgroundColor: 'white',
    padding: 10,
    marginRight: 8,
    borderRadius: 5,
    flex: 1,
    color: '#ff6f00', // Set text input color to match
  },
  addButton: {
    backgroundColor: '#ff6f00', // Button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 3,
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