import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const badges = new Array(12).fill(null).map((_, index) => ({
  id: String(index + 1),
  label: `Badge ${index + 1}`
}));

const BadgeItem = ({ label }) => (
  <View style={styles.badgeItem}>
    <View style={styles.badgeIcon}>
      <Text style={styles.badgeIconText}>★</Text>
    </View>
    <Text style={styles.badgeLabel}>{label}</Text>
  </View>
);

const BadgesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badges</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={badges}
        renderItem={({ item }) => <BadgeItem label={item.label} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContentContainer} // Added style for content container
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  listContentContainer: {
    paddingTop: 20, // Adds padding at the top of the list
  },
  badgeItem: {
    alignItems: 'center',
    width: '33%',
    marginBottom: 16,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconText: {
    color: '#FFF',
    fontSize: 30,
  },
  badgeLabel: {
    marginTop: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default BadgesScreen;
