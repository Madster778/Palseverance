import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, FlatList, Alert, Image } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

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

  useEffect(() => {
    const fetchShopItems = async () => {
      const querySnapshot = await getDocs(collection(db, "ShopItems"));
      const itemsByCategory = { backgroundColour: [], petColour: [], glasses: [] };
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        if (itemsByCategory[item.type]) {
          itemsByCategory[item.type].push(item);
        }
      });
      setShopItems(itemsByCategory);
    };
  
    fetchShopItems();
    fetchUserData();
  }, []);
  

  const handleBuyOrEquip = async (item) => {
    const userRef = doc(db, "Users", auth.currentUser.uid);
    const isOwned = userData.ownedItems.includes(item.id);
    let updateObject = {};
  
    if (!isOwned && userData.currency >= item.cost) {
      // Buying the item
      updateObject.currency = userData.currency - item.cost;
      updateObject.ownedItems = arrayUnion(item.id);
      Alert.alert("Purchase successful!");
    } else {
      // Check if the item is of type 'backgroundColour' and use colourCode
      if (item.type === 'backgroundColour') {
        const isEquipped = userData.equippedItems.backgroundColour === item.colourCode;
        updateObject['equippedItems.backgroundColour'] = isOwned && !isEquipped ? item.colourCode : 'lightgrey';
      } else if (item.type === 'petColour') {
        const isEquipped = userData.equippedItems.petColour === item.name;
        updateObject['equippedItems.petColour'] = isOwned && !isEquipped ? item.name : 'white';
      } else if (item.type === 'glasses') {
        updateObject['equippedItems.glasses'] = !userData.equippedItems.glasses;
      }
    }
  
    await updateDoc(userRef, updateObject);
    // After updating Firestore, fetch user data again to update local state
    fetchUserData().catch(console.error);
  };


  const renderItem = ({ item }) => {
    const isOwned = userData.ownedItems.includes(item.id);
    let isEquipped;
    
    // Check the equipped state based on the item type
    if (item.type === 'glasses') {
      isEquipped = userData.equippedItems.glasses;
    } else if (item.type === 'backgroundColour') {
      isEquipped = userData.equippedItems.backgroundColour === item.colourCode;
    } else if (item.type === 'petColour') {
      isEquipped = userData.equippedItems.petColour === item.name;
    }

    let iconComponent = <View />;
    switch (item.type) {
      case 'petColour':
      case 'backgroundColour':
        iconComponent = <FontAwesome name="paint-brush" size={24} color={item.colourCode || 'black'} />;
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
    <SafeAreaView style={[styles.container, { backgroundColor: userData.equippedItems.backgroundColour || '#FFFFFF' }]}>
      <StatusBar backgroundColor={userData.equippedItems.backgroundColour || '#FFFFFF'} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <Text style={styles.currencyText}>Currency: {userData.currency}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="#ff6f00" />
        </TouchableOpacity>
      </View>
      {Object.keys(shopItems).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={shopItems[category]}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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
  categoryContainer: {
    padding: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff6f00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6f00', // Currency text color
  },
  closeButton: {
    padding: 10,
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 10,
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
    width: 60, // Adjusted icon size to create more space
    height: 60, // Adjusted icon size
    marginBottom: 5, // Adjusted spacing
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