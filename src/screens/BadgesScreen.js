// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Image, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const BadgesScreen = ({ navigation }) => {
  const [badges, setBadges] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('lightgrey'); 
  const userId = auth.currentUser.uid;

  // Loads user-specific data and their associated badges on component mount
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

  // Fetches detailed information on user badges, including descriptions and tiers
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

  // Component to render individual badge details
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
        numColumns={1}
        key={'_'}
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
    borderBottomColor: 'white', 
    backgroundColor: '#ff6f00', 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
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
    width: 120, 
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeIcon: {
    width: 120, 
    height: 120,
    resizeMode: 'contain',
  },
  badgeTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#ff6f00',
    textAlign: 'center',
    marginTop: 8,
  },
  badgeDescription: {
    textAlign: 'center',
    color: '#ff6f00',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default BadgesScreen;