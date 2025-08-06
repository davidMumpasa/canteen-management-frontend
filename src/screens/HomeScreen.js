import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { BASE_URL } from "../../config";

const categories = ["Popular", "Healthy", "Asian", "Fast"];

const HomeScreen = () => {
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders/getAll`);
      const json = await response.json();
      if (response.ok) {
        setOrders(json.orders);
      } else {
        console.error(json.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchText.toLowerCase()) &&
      selectedCategory === "Popular" // You can improve this later by adding a real `category` field
  );

  const handleLogin = () => {
    navigation.navigate("Cart");
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodImage}>
        <Text style={styles.foodEmoji}>🍽️</Text>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodTitle}>{item.item_name}</Text>
        <Text style={styles.foodDescription}>Quantity: {item.quantity}</Text>
        <View style={styles.foodFooter}>
          <Text style={styles.foodPrice}>${item.total_price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleLogin}>
            <Text style={styles.addButtonText}>Add +</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No items found.
            </Text>
          }
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.greeting}>Hello, David! 👋</Text>
                <View style={styles.profileIcon}>
                  <Text style={styles.profileIconText}>S</Text>
                </View>
              </View>

              <View style={styles.content}>
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#666"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for food..."
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>

                <View style={styles.categoriesContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category &&
                          styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategory === category &&
                            styles.categoryChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={24} color="#667eea" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="cart" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
          <Ionicons name="receipt" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("Chatbot")}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  foodEmoji: {
    fontSize: 50,
    marginRight: 16,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  categoryChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#667eea",
  },
  categoryChipText: {
    color: "#666",
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "white",
  },
  foodItem: {
    backgroundColor: "white",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  foodImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#ff9a56",
    justifyContent: "center",
    alignItems: "center",
  },
  foodInfo: {
    padding: 15,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  foodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  foodDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#667eea",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  chatButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#f97316", // orange
    padding: 14,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
