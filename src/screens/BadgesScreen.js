import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Image, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const BadgesScreen = ({ navigation }) => {
  const [badges, setBadges] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey'); // Default color
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const userRef = doc(db, 'Users', userId);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBackgroundColor(userData.equippedItems?.backgroundColour || 'lightgrey');
      }
    });
    fetchUserBadges(userId).then(setBadges);
  }, []);

  const fetchUserBadges = async (userId) => {
    console.log(`Fetching badges for user: ${userId}`);
    const userRef = doc(db, 'Users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('No such user document!');
      return [];
    }

    const userData = userSnap.data();
    console.log(`User data: ${JSON.stringify(userData)}`);
    
    if (!userData.badges) {
      console.log('User has no badges field.');
      return [];
    }

    // Fetch details for each badge
    const badgesDetails = await Promise.all(
      userData.badges.map(async (userBadge) => {
        console.log(`Fetching badge with ID: ${userBadge.badgeId}`);
        const badgeRef = doc(db, 'Badges', userBadge.badgeId);
        const badgeSnap = await getDoc(badgeRef);
        
        if (badgeSnap.exists()) {
          const badgeData = badgeSnap.data();
          console.log(`Badge data: ${JSON.stringify(badgeData)}`);
          const tierInfo = badgeData.tiers.find(tier => tier.tier === userBadge.highestTierAchieved);
          
          return {
            id: userBadge.badgeId,
            title: badgeData.title,
            description: tierInfo ? tierInfo.tierDescription : badgeData.baseDescription,
            tier: userBadge.highestTierAchieved,
            imageURL: tierInfo.imageURL,
          };
        } else {
          console.log(`No badge found with ID: ${userBadge.badgeId}`);
          return null;
        }
      })
    );

    console.log(`Badges details fetched: ${JSON.stringify(badgesDetails)}`);
    return badgesDetails.filter(badge => badge !== null);
  };

  const BadgeItem = ({ badge }) => (
    <View style={styles.badgeItem}>
      <Image
        style={styles.badgeIcon}
        source={{ uri: badge.imageURL }}
      />
      <Text style={styles.badgeTitle}>{badge.title} - Tier {badge.tier}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight || 0 }]}>
        <Text style={styles.headerTitle}>Badges</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={badges}
        renderItem={({ item }) => <BadgeItem badge={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'white', // Change to white
    backgroundColor: '#ff6f00', // Change to #ff6f00
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white', // Change to white
  },
  closeButton: {
    padding: 10,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  badgeItem: {
    flexDirection: 'row', // Arrange image and text in a row
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ff6f00',
  },
  badgeIcon: {
    width: 120, // Increase image size
    height: 120, // Increase image size
    resizeMode: 'contain',
  },
  badgeTitle: {
    fontSize: 18, // Increase font size
    fontWeight: 'bold',
    color: '#ff6f00', // Set text color
    flexShrink: 1, // Ensure text doesn't push the layout
    marginLeft: 12, // Add space between the image and text
  },
  badgeDescription: {
    fontSize: 14, // Increase font size
    color: '#ff6f00', // Set text color
    marginTop: 4,
    textAlign: 'center',
    flexShrink: 1, // Ensure text doesn't push the layout
  },
});

export default BadgesScreen;