// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const RankScreen = ({ navigation }) => {
  const [rankingData, setRankingData] = useState([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey');

  const statTypes = ['longestCurrentStreak', 'longestObtainedStreak', 'totalCurrencyEarned'];

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setBackgroundColor(docSnap.data().equippedItems?.backgroundColour || 'lightgrey');
      } else {
        console.log("User document not found!");
      }
    };

    fetchUserData();
  }, []);

  // Fetches ranking data based on the currently selected stat type
  const fetchRankingData = async (statType) => {
    const currentUserRef = doc(db, 'Users', auth.currentUser.uid);
    const currentUserSnap = await getDoc(currentUserRef);
  
    if (!currentUserSnap.exists()) {
      console.error('No current user data found.');
      return;
    }
  
    const currentUserData = { id: currentUserSnap.id, ...currentUserSnap.data() };
    
    // Collects data from each friend listed in the current user's friends array
    const friendsDataPromises = currentUserData.friends.map(friendId =>
      getDoc(doc(db, 'Users', friendId))
    );
    const friendsSnaps = await Promise.all(friendsDataPromises);
    const friendsData = friendsSnaps.map(snap => ({ id: snap.id, ...snap.data() })).filter(data => data);
    
    const combinedData = [currentUserData, ...friendsData];
  
    combinedData.sort((a, b) => {
      const aValue = a[statType] || 0;
      const bValue = b[statType] || 0;
      return bValue - aValue;
    });
  
    const rankedData = combinedData.map((user, index) => ({
      ...user,
      rank: index + 1,
      currentStreak: user.longestCurrentStreak || 0,
      longestStreak: user.longestObtainedStreak || 0,
      currencyEarned: user.totalCurrencyEarned || 0,
    }));
  
    setRankingData(rankedData);
  };  

  // Effect to fetch data whenever the selected stat type changes
  useEffect(() => {
    const statType = statTypes[selectedTabIndex];
    fetchRankingData(statType);
  }, [selectedTabIndex]);

  const handleIndexChange = (index) => {
    setSelectedTabIndex(index);
  };

  // Renders individual rank items, navigable to user profiles
  const RankItem = ({ id, rank, username, currentStreak, longestStreak, currencyEarned }) => (
    <TouchableOpacity
      style={styles.rankItem}
      onPress={() => navigation.navigate('Profile', { userId: id })}
    >
      <View style={styles.rankCircle}>
        <Text style={styles.rankNumber}>{rank}</Text>
      </View>
      <Text style={styles.rankName}>{username}</Text>
      <Text style={styles.rankStat}>
        {selectedTabIndex === 0 && `${currentStreak} Days`}
        {selectedTabIndex === 1 && `${longestStreak} Days`}
        {selectedTabIndex === 2 && `${currencyEarned} Coins`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Rank</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <SegmentedControlTab
        values={['Current Streak', 'Longest Streak', 'Currency Earned']}
        selectedIndex={selectedTabIndex}
        onTabPress={handleIndexChange}
        tabsContainerStyle={styles.tabsContainerStyle}
        tabStyle={styles.tabStyle}
        activeTabStyle={styles.activeTabStyle}
        tabTextStyle={styles.tabTextStyle}
        activeTabTextStyle={styles.activeTabTextStyle}
      />

      <FlatList
        data={rankingData}
        renderItem={({ item }) => <RankItem {...item} />}
        keyExtractor={item => item.id.toString()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'white', 
    backgroundColor: '#ff6f00', 
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  tabsContainerStyle: {
    marginVertical: 10,
    marginHorizontal: 20, 
    alignSelf: 'center', 
    width: '90%',
  },
  tabStyle: {
    borderColor: '#ff6f00',
    backgroundColor: 'white',
  },
  activeTabStyle: {
    backgroundColor: '#ff6f00', 
  },
  tabTextStyle: {
    color: '#ff6f00',
  },
  activeTabTextStyle: {
    color: 'white',
  },
  rankItem: {
    backgroundColor: '#ff6f00', 
    marginVertical: 8,
    marginHorizontal: 16, 
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-around',
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#ff6f00',
    fontWeight: 'bold',
    marginLeft: 'auto',  
    marginRight: 'auto', 
  },
  rankName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  rankStat: {
    position: 'relative',
    right: 20,
    marginLeft: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});

export default RankScreen;