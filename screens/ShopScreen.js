import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const ShopScreen = ({ navigation }) => {
  const currency = 1000; // Placeholder currency value

  const [shopCategories, setShopCategories] = useState({
    backgroundColour: [
      { id: 1, owned: false, equipped: false },
      { id: 2, owned: true, equipped: false },
      { id: 3, owned: true, equipped: false },
    ],
    petColour: [
      { id: 1, owned: false, equipped: false },
      { id: 2, owned: false, equipped: false },
      { id: 3, owned: false, equipped: false },
    ],
    glasses: [
      { id: 1, owned: false, equipped: false },
      { id: 2, owned: false, equipped: false },
      { id: 3, owned: false, equipped: false },
    ],
  });

  const updateItemState = (category, id, newState) => {
    // Update item state logic goes here
  };

  const ShopCategory = ({ title, items }) => (
    <View style={styles.shopCategory}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.itemsRow}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.placeholderImage}></View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => updateItemState(title, item.id, {})} // Update with correct state
            >
              <Text style={styles.buttonText}>{item.equipped ? 'Unequip' : item.owned ? 'Equip' : 'Buy'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { marginTop: StatusBar.currentHeight }]}>
        <Text style={styles.headerTitle}>Shop</Text>
        <Text style={styles.currencyDisplay}>Currency: {currency}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Additional top spacing for categories */}
      <View style={{ marginTop: 20 }}>
        {Object.keys(shopCategories).map((key) => (
          <ShopCategory key={key} title={key} items={shopCategories[key]} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  currencyDisplay: {
    fontSize: 18,
    position: 'absolute',
    right: 0,
    left: 0,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
  },
  shopCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 16,
    marginBottom: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    width: '30%',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ddd',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ShopScreen;
