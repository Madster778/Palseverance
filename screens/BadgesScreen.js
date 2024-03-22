import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar } from 'react-native';
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
  // Use StatusBar height to adjust top padding for Android devices
  const topPadding = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: 20 }]}>
      <View style={[styles.header, { marginTop: topPadding }]}>
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
        contentContainerStyle={styles.listContentContainer}
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
    justifyContent: 'space-between',
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
  listContentContainer: {
    paddingTop: 20,
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
