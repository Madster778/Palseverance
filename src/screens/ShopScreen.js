// Reference React Native Expo documentation: https://docs.expo.dev
// Reference Firebase documentation: https://firebase.google.com/docs

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert, Image } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import petImages from '../utils/petImages';

const ShopScreen = ({ navigation }) => {
  const [shopItems, setShopItems] = useState([]);
  const [userData, setUserData] = useState({ currency: 0, ownedItems: [], equippedItems: {} });

  const fetchUserData = async () => {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  // useEffect hook to fetch shop items and user data on component mount.
  useEffect(() => {
    const fetchShopItems = async () => {
      const querySnapshot = await getDocs(collection(db, "ShopItems"));
      const itemsByType = {};
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (!itemsByType[item.type]) {
          itemsByType[item.type] = [];
        }
        itemsByType[item.type].push(item);
      });
      setShopItems(itemsByType);
    };

    fetchShopItems();
    fetchUserData();
  }, []);

  // Function to format category names by inserting a space before capital letters and capitalizing the first letter.
  const formatCategoryName = (name) => {
    const formatted = name.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Function to update collector badges in response to new purchases, using a Firestore transaction for atomic updates.
  const updateCollectorBadge = async (newOwnedItems) => {
    const badgesRef = collection(db, 'Badges');
    const userRef = doc(db, 'Users', auth.currentUser.uid);
    const badgeSnap = await getDocs(badgesRef);
    const badgeData = {};

    badgeSnap.forEach((doc) => {
      badgeData[doc.id] = doc.data();
    });

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "User does not exist!";
      }

      let collectorBadge = userDoc.data().badges.find(badge => badge.badgeId === 'collector');
      const currentTier = collectorBadge ? collectorBadge.highestTierAchieved : 0;
      const nextTier = badgeData.collector.tiers.find(tier => tier.threshold === newOwnedItems.length);

      // If the next tier threshold is met and is higher than the current tier, update the badge
      if (nextTier && nextTier.tier > currentTier) {
        const updatedBadges = userDoc.data().badges.map(badge => {
          if (badge.badgeId === 'collector') {
            return { ...badge, highestTierAchieved: nextTier.tier };
          }
          return badge;
        });

        transaction.update(userRef, { badges: updatedBadges });
      }
    });
  };

  // Function to handle purchasing or equipping items. Includes validation checks and updates Firestore documents accordingly.
  const handleBuyOrEquip = async (item) => {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const isOwned = userData.ownedItems.includes(item.id);

    const confirmPurchase = async () => {
      if (userData.currency < item.cost) {
        Alert.alert("Insufficient funds", "Keep working on your habits!");
      } else {
        try {
          await updateDoc(userRef, {
            currency: userData.currency - item.cost,
            ownedItems: arrayUnion(item.id),
          });
          Alert.alert("Purchase successful", `You have purchased ${item.name}`);
          const newOwnedItems = [...userData.ownedItems, item.id];
          setUserData({ ...userData, currency: userData.currency - item.cost, ownedItems: newOwnedItems });
          await updateCollectorBadge(newOwnedItems);
          await fetchUserData();
        } catch (error) {
          console.error("Purchase failed", error);
          Alert.alert("Purchase failed", "There was an issue processing your purchase.");
        }
      }
    };

    if (!isOwned) {
      Alert.alert(
        "Confirm Purchase",
        `Do you want to purchase this item for ${item.cost} coins?`,
        [
          {
            text: "No",
            style: "cancel"
          },
          { text: "Yes", onPress: confirmPurchase }
        ]
      );
    } else {
      let updateObject = {};
      const isEquipped = item.type === 'glasses' ? userData.equippedItems.glasses === item.name : userData.equippedItems[item.type] === (item.type === 'backgroundColour' ? item.colourCode : item.name);

      if (item.type === 'glasses') {
        updateObject = { 'equippedItems.glasses': isEquipped ? 'none' : item.name };
      } else if (item.type === 'backgroundColour' && isEquipped) {
        // Setting default background colour when unequipping
        updateObject = { 'equippedItems.backgroundColour': 'lightgrey' };
      } else if (item.type === 'petColour' && isEquipped) {
        // Setting default pet colour when unequipping
        updateObject = { 'equippedItems.petColour': 'grey' };
      } else if (isEquipped) {
        // Unequipping non-color items
        updateObject = { [`equippedItems.${item.type}`]: 'none' };
      } else {
        // Equipping items
        updateObject = { [`equippedItems.${item.type}`]: item.type === 'backgroundColour' ? item.colourCode : item.name };
      }

      await updateDoc(userRef, updateObject);
    }
    await fetchUserData(); // Refresh user data
  };

  // Render function for shop items. Determines how each item in the shop is displayed, including its purchase and equip state.
  const renderItem = ({ item }) => {
    const isOwned = userData.ownedItems.includes(item.id);
    let isEquipped;

    // Determines if the item is equipped based on type-specific logic.
    if (item.type === 'glasses') {
      isEquipped = userData.equippedItems.glasses === item.name;
    } else {
      isEquipped = userData.equippedItems[item.type] === (item.type === 'backgroundColour' ? item.colourCode : item.name);
    }

    let iconComponent = <View style={styles.iconPlaceholder} />;
    switch (item.type) {
      case 'petColour':
        const color = item.name === 'ginger' ? 'orange' : item.name;
        iconComponent = (
          <FontAwesome
            name="paint-brush"
            size={24}
            color={color}
          />
        );
        break;
      case 'backgroundColour':
        iconComponent = (
          <FontAwesome
            name="paint-brush"
            size={24}
            color={item.colourCode || 'black'}
          />
        );
        break;
      case 'glasses':
      case 'hat':
        iconComponent = (
          <Image
            source={petImages[`${item.type}${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`]}
            style={styles.icon}
          />
        );
        break;
      default:
        break;
    }

    return (
      <View style={styles.item}>
        {iconComponent}
        <Text style={styles.itemName}>{item.name}</Text>
        <TouchableOpacity
          style={[
            styles.button,
            isOwned ? (isEquipped ? styles.buttonEquipped : styles.buttonOwned) : styles.buttonBuy
          ]}
          onPress={() => handleBuyOrEquip(item)}
        >
          <Text style={styles.buttonText}>
            {isEquipped ? 'Unequip' : isOwned ? 'Equip' : `Buy (${item.cost})`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: userData.equippedItems.backgroundColour || 'lightgrey' }]}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Shop</Text>
        <Text style={styles.currencyText}>Currency: {userData.currency}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="closecircleo" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={Object.keys(shopItems)}
        renderItem={({ item }) => (
          <View key={item} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{formatCategoryName(item)}</Text>
            <FlatList
              data={shopItems[item]}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              numColumns={3}
              style={styles.list}
            />
          </View>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.flatListContent}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white', 
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  categoryContainer: {
    padding: 5,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ff6f00',
  },
  list: {
    padding: 5,
  },
  item: {
    backgroundColor: '#ff6f00',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 3,
    padding: 8,
    margin: 4,
    flex: 1 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    minWidth: 70,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'white',
  },
  icon: {
    width: 50, 
    height: 50,
    marginBottom: 2,
    resizeMode: 'contain',
  },
  iconPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: 'transparent',
  },
  buttonOwned: {
    backgroundColor: '#4CAF50',
  },
  buttonBuy: {
    backgroundColor: '#2196F3',
  },
  buttonEquipped: {
    backgroundColor: '#f44336',
  },
  flatListContent: {
    paddingBottom: 10,
  },
});

export default ShopScreen;
