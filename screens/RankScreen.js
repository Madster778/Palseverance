import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const RankScreen = ({ navigation }) => {
  const rankingData = [
    { id: '1', name: 'Yourself', rank: 1 },
    { id: '2', name: 'Friend 1', rank: 2 },
    // Include more friends as needed
  ];

  const RankItem = ({ rank, name }) => (
    <View style={styles.rankItem}>
      <Text style={styles.rankCircle}>{rank}</Text>
      <Text style={styles.rankName}>{name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Rank</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rankingData}
        renderItem={({ item }) => <RankItem rank={item.rank} name={item.name} />}
        keyExtractor={(item) => item.id}
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
    padding: 16,
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
    right: 10,
    padding: 10,
  },
  listContentContainer: {
    paddingTop: 20,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 16,
  },
  rankName: {
    fontSize: 18,
  },
});

export default RankScreen;
