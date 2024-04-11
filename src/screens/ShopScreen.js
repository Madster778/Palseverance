import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert, Image } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';

const ShopScreen = ({ navigation }) => {
  const [shopItems, setShopItems] = useState([]);
  const [userData, setUserData] = useState({ currency: 0, ownedItems: [], equippedItems: {} });

  // Function to fetch user data
  const fetchUserData = async () => {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

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

  const formatCategoryName = (name) => {
    const formatted = name.replace(/([A-Z])/g, ' $1'); // Inserts a space before capital letters
    return formatted.charAt(0).toUpperCase() + formatted.slice(1); // Capitalizes the first letter
  };

  // Add this function within your ShopScreen component
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
        const isEquipped = item.type === 'glasses' ? userData.equippedItems.glasses : userData.equippedItems[item.type] === (item.type === 'backgroundColour' ? item.colourCode : item.name);

        if (item.type === 'glasses') {
            updateObject = {'equippedItems.glasses': !userData.equippedItems.glasses};
        } else if (item.type === 'backgroundColour' && isEquipped) {
            // Setting default background colour when unequipping
            updateObject = {'equippedItems.backgroundColour': 'lightgrey'};
        } else if (item.type === 'petColour' && isEquipped) {
            // Setting default pet colour when unequipping
            updateObject = {'equippedItems.petColour': 'white'};
        } else if (isEquipped) {
            // Unequipping non-color items
            updateObject = {[`equippedItems.${item.type}`]: 'none'};
        } else {
            // Equipping items
            updateObject = {[`equippedItems.${item.type}`]: item.type === 'backgroundColour' ? item.colourCode : item.name};
        }

        await updateDoc(userRef, updateObject);
      }
    await fetchUserData(); // Refresh user data
  };
  
  const renderItem = ({ item }) => {
    const isOwned = userData.ownedItems.includes(item.id);
    let isEquipped;

    if (item.type === 'glasses') {
        isEquipped = userData.equippedItems.glasses;
    } else {
        isEquipped = userData.equippedItems[item.type] === (item.type === 'backgroundColour' ? item.colourCode : item.name);
    }
    
    let iconComponent = <View />;
    switch (item.type) {
      case 'petColour':
        const color = item.name === 'ginger' ? 'orange' : item.name;
        iconComponent = (
        <FontAwesome 
          name="paint-brush" 
          size={24} 
          color={color} // Use specific colors based on the item name
          />
        );
        break;
      case 'backgroundColour':
        iconComponent = (
        <FontAwesome 
          name="paint-brush" 
          size={24} 
          color={item.colourCode || 'black'} // This will use the color from the item object
          />
        );
        break;
      case 'glasses':
          iconComponent = <Image source={require('../assets/images/glasses-overlay.png')} style={styles.icon} />;
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
    <SafeAreaView style={[styles.container, {backgroundColor: userData.equippedItems.backgroundColour || 'lightgrey'}]}>
        <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
          <Text style={styles.headerTitle}>Shop</Text>
          <Text style={styles.currencyText}>Currency: {userData.currency}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <AntDesign name="closecircleo" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {Object.keys(shopItems).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{formatCategoryName(category)}</Text>
          <FlatList
            data={shopItems[category]}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            style={styles.list}
            />
          </View>
        ))}
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
    borderBottomColor: '#fff', // Change to white
    backgroundColor: '#ff6f00', // Change to #ff6f00
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff', // Change to white
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // Also change the currency text color to white for consistency
  },
  closeButton: {
    padding: 10,
  },
  categoryContainer: {
    padding: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff6f00',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#ff6f00', // Set the border color to white
    borderWidth: 3, // Set the border width, adjust as needed
    padding: 8, // Slightly reduced padding
    margin: 4, // Reduced margin to give more space
    flex: 1 / 3, // Keeps 3 items per row
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160, // Adjust the minHeight to ensure items have enough space
  },
  itemName: {
    fontSize: 16, // Adjusted font size if necessary
    fontWeight: 'bold',
    marginBottom: 4, // Adjusted spacing
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingHorizontal: 12, // Reduced padding
    paddingVertical: 6, // Reduced padding
    borderRadius: 5,
    minWidth: 70, // Ensure a minimum width for the button
    height: 30, // Set a fixed height to make sure it fits within the item container
    justifyContent: 'center', // Centers text vertically
    alignItems: 'center', // Centers text horizontally
  },
  buttonText: {
    fontSize: 14, // Or any other size you previously set
    textAlign: 'center', // Keeps text centered
    color: 'white', // Changes text color to white
  },
  icon: {
    width: 70, // Adjusted icon size to create more space
    height: 70, // Adjusted icon size
    marginBottom: 2, // Adjusted spacing
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
});

export default ShopScreen;
