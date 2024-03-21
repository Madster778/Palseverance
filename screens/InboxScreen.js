import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const InboxScreen = ({ navigation }) => {
  // Mock data for friends list
  const friends = [
    { id: '1', name: 'Friend 1' },
    { id: '2', name: 'Friend 2' },
    // ... more friends
  ];

  const messageFriend = (friendName) => {
    // Placeholder for navigation function - replace with your actual navigation logic
    console.log(`Navigate to messaging screen with: ${friendName}`);
    // navigation.navigate('MessagingScreen', { friendName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput 
          placeholder="Enter Name" 
          style={styles.searchInput} 
        />
        <TouchableOpacity style={styles.sendRequestButton}>
          <Text>Send Request</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.friendItem} 
            onPress={() => messageFriend(item.name)}
          >
            <Text style={styles.friendName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'left',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  searchInput: {
    flex: 1,
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    marginRight: 8,
  },
  sendRequestButton: {
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#ddd',
  },
  friendItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendName: {
    fontSize: 18,
  },
  listContentContainer: {
    paddingTop: 20, // Adjust this value for spacing between header and first item
  },
});

export default InboxScreen;
