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
    //console.log(`User data: ${JSON.stringify(userData)}`);
    
    if (!userData.badges) {
      console.log('User has no badges field.');
      return [];
    }

    // Fetch details for each badge
    const badgesDetails = await Promise.all(
      userData.badges.map(async (userBadge) => {
        //console.log(`Fetching badge with ID: ${userBadge.badgeId}`);
        const badgeRef = doc(db, 'Badges', userBadge.badgeId);
        const badgeSnap = await getDoc(badgeRef);
        
        if (badgeSnap.exists()) {
          const badgeData = badgeSnap.data();
          //console.log(`Badge data: ${JSON.stringify(badgeData)}`);
          const tierInfo = badgeData.tiers.find(tier => tier.tier === userBadge.highestTierAchieved);
          
          return {
            id: userBadge.badgeId,
            title: badgeData.title,
            description: tierInfo ? tierInfo.tierDescription : badgeData.baseDescription,
            tier: userBadge.highestTierAchieved,
            imageURL: tierInfo.imageURL,
          };
        } else {
          //console.log(`No badge found with ID: ${userBadge.badgeId}`);
          return null;
        }
      })
    );

    //console.log(`Badges details fetched: ${JSON.stringify(badgesDetails)}`);
    return badgesDetails.filter(badge => badge !== null);
  };

  const BadgeItem = ({ badge }) => {
    return (
      <View style={styles.badgeItem}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.badgeIcon}
            source={{ uri: badge.imageURL }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.badgeTitle}>{badge.title} - Tier {badge.tier}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
      </View>
    );
  };  

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
        numColumns={1} // Set this to a fixed number that matches your desired column count
        key={'_'} // Adding a fixed key prop for consistent rendering
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  imageContainer: {
    width: 120, // Set a fixed width
    height: 120, // Set a fixed height
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensures the image does not break out of the boundary
  },
  badgeIcon: {
    width: 120, // New uniform width for all badges
    height: 120, // New uniform height for all badges
    resizeMode: 'contain', // This can be 'contain' or 'cover' depending on the desired effect
  },
  badgeTitle: {
    fontSize: 20, // Increase font size
    fontWeight: 'bold',
    color: '#ff6f00', // Keep this color or change as needed
    textAlign: 'center',
    marginTop: 8,
  },
  badgeDescription: {
    textAlign: 'center',
    color: '#ff6f00', // Change text color to #ff6f00
    fontSize: 18, // Increase font size
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default BadgesScreen;