import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const RankScreen = ({ navigation }) => {
  const [rankingData, setRankingData] = useState([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey');;

  const statTypes = ['longestCurrentStreak', 'longestObtainedStreak', 'totalCurrencyEarned'];

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Assuming 'equippedItems.backgroundColour' is the path where the background color is stored
        setBackgroundColor(docSnap.data().equippedItems.backgroundColour);
      } else {
        console.log("User document not found!");
      }
    };

    fetchUserData();
  }, []);

  const fetchRankingData = async (statType) => {
    const currentUserRef = doc(db, 'Users', auth.currentUser.uid);
    const currentUserSnap = await getDoc(currentUserRef);
  
    if (!currentUserSnap.exists()) {
      console.error('No current user data found.');
      return;
    }
  
    const currentUserData = { id: currentUserSnap.id, ...currentUserSnap.data() };
    
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

  useEffect(() => {
    const statType = statTypes[selectedTabIndex];
    fetchRankingData(statType);
  }, [selectedTabIndex]);

  const handleIndexChange = (index) => {
    setSelectedTabIndex(index);
  };

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
    backgroundColor: 'white', // or your preferred background color
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#fff', // Changed to white
    backgroundColor: '#ff6f00', // Changed to #ff6f00
    marginBottom: 10, // Add a bottom margin to create a gap after the header
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff', // Changed to white
  },
  closeButton: {
    padding: 10,
  },
  tabsContainerStyle: {
    marginVertical: 10, // Adjust as needed
    marginHorizontal: 20, // Adjust as needed
    alignSelf: 'center', // Center the control tab in the view
    width: '90%', // Match the width to the rankItem width
  },
  tabStyle: {
    borderColor: '#ff6f00', // Border color for the tabs
    backgroundColor: 'white', // Background color for the tabs
  },
  activeTabStyle: {
    backgroundColor: '#ff6f00', // Background color for the active tab
  },
  tabTextStyle: {
    color: '#ff6f00', // Text color for the tabs
  },
  activeTabTextStyle: {
    color: 'white', // Text color for the active tab
  },
  rankItem: {
    backgroundColor: '#ff6f00', // Rank item background color
    marginVertical: 8, // Space between items
    marginHorizontal: 16, // Space from the sides
    borderRadius: 10, // Rounded corners
    borderWidth: 3, // Add a border width for the white border
    borderColor: 'white', // Border color set to white
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center', // Center the rank item in the view
    justifyContent: 'space-around', // Adjusts spacing to distribute space around items
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white', // Rank circle background color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#ff6f00', // Rank number text color
    fontWeight: 'bold',
    marginLeft: 'auto',  // Ensures the username starts after the rank circle
    marginRight: 'auto', // Ensures the username is centered within the available space
  },
  rankName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center', // This will align text to center for the given space
    flex: 1, // This will allow the name to take up as much space as possible
  },
  rankStat: {
    position: 'relative', // Change from absolute to relative
    right: 20, // Position from the right
    marginLeft: 10, // Adjust space between the stats and the username
    fontWeight: 'bold',
    color: 'white', // Text color for the stats
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  // Add other styles as needed for your UI
});

export default RankScreen;
