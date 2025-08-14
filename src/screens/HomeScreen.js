import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const [orders] = useState([
    {
      id: 1,
      item_name: "Sushi Platter",
      quantity: 2,
      total_price: 25.5,
      category: "Asian",
      emoji: "🍣",
      rating: 4.9,
      reviews: 245,
      description: "Fresh salmon, tuna, and avocado rolls",
      prepTime: "15-20 min",
      discount: null,
    },
    {
      id: 2,
      item_name: "Vegan Salad",
      quantity: 1,
      total_price: 12.0,
      category: "Healthy",
      emoji: "🥗",
      rating: 4.7,
      reviews: 189,
      description: "Mixed greens with quinoa and tahini",
      prepTime: "5-10 min",
      discount: "15% OFF",
    },
    {
      id: 3,
      item_name: "Cheeseburger",
      quantity: 3,
      total_price: 18.75,
      category: "Fast",
      emoji: "🍔",
      rating: 4.6,
      reviews: 312,
      description: "Juicy beef patty with melted cheese",
      prepTime: "10-15 min",
      discount: null,
    },
    {
      id: 4,
      item_name: "Pizza Margherita",
      quantity: 1,
      total_price: 15.0,
      category: "Popular",
      emoji: "🍕",
      rating: 4.8,
      reviews: 428,
      description: "Classic tomato, mozzarella, and basil",
      prepTime: "12-18 min",
      discount: null,
    },
    {
      id: 5,
      item_name: "Ramen Bowl",
      quantity: 2,
      total_price: 22.0,
      category: "Asian",
      emoji: "🍜",
      rating: 4.8,
      reviews: 203,
      description: "Rich tonkotsu broth with fresh noodles",
      prepTime: "8-12 min",
      discount: "20% OFF",
    },
    {
      id: 6,
      item_name: "Smoothie Bowl",
      quantity: 1,
      total_price: 9.5,
      category: "Healthy",
      emoji: "🥣",
      rating: 4.5,
      reviews: 156,
      description: "Acai bowl with granola and berries",
      prepTime: "5-8 min",
      discount: null,
    },
  ]);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set([2, 4]));

  const categories = [
    { name: "Popular", icon: "flame", color: "#ff6b6b" },
    { name: "Asian", icon: "restaurant", color: "#4ecdc4" },
    { name: "Healthy", icon: "leaf", color: "#95e1d3" },
    { name: "Fast", icon: "flash", color: "#ffa726" },
  ];

  const quickActions = [
    { title: "My Orders", icon: "receipt", color: "#667eea", count: "3" },
    {
      title: "Favorites",
      icon: "heart",
      color: "#ff6b6b",
      count: favorites.size.toString(),
    },
    { title: "Rewards", icon: "gift", color: "#4ecdc4", count: "New" },
    { title: "Wallet", icon: "card", color: "#ffa726", count: "$45" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter((item) => {
    const matchesSearch = item.item_name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id);
    setFavorites(newFavorites);
  };

  const CategoryChip = ({ item, index }) => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 30 * (index + 1)],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          selectedCategory === item.name && {
            backgroundColor: item.color,
            shadowColor: item.color,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
        onPress={() => setSelectedCategory(item.name)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.categoryIconContainer,
            {
              backgroundColor:
                selectedCategory === item.name
                  ? "rgba(255,255,255,0.2)"
                  : item.color + "15",
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={selectedCategory === item.name ? "white" : item.color}
          />
        </View>
        <Text
          style={[
            styles.categoryText,
            {
              color: selectedCategory === item.name ? "white" : "#333",
              fontWeight: selectedCategory === item.name ? "700" : "600",
            },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const QuickActionItem = ({ item, index }) => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.quickAction} activeOpacity={0.8}>
        <View
          style={[
            styles.quickActionIcon,
            { backgroundColor: item.color + "15" },
          ]}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
        <View
          style={[styles.quickActionBadge, { backgroundColor: item.color }]}
        >
          <Text style={styles.quickActionBadgeText}>{item.count}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const FoodCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.foodCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 * (index + 1)],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.foodImageContainer}>
        <View style={styles.foodImage}>
          <Text style={styles.foodEmoji}>{item.emoji}</Text>
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            favorites.has(item.id) && styles.favoriteButtonActive,
          ]}
          onPress={() => toggleFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorites.has(item.id) ? "heart" : "heart-outline"}
            size={20}
            color={favorites.has(item.id) ? "white" : "#ff6b6b"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.foodContent}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodTitle}>{item.item_name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>
        </View>

        <Text style={styles.foodDescription}>{item.description}</Text>

        <View style={styles.foodMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.metaText}>{item.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cube" size={14} color="#666" />
            <Text style={styles.metaText}>Qty: {item.quantity}</Text>
          </View>
        </View>

        <View style={styles.foodFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.foodPrice}>${item.total_price.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
            <View style={styles.addButtonGradient}>
              <Ionicons name="add" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="white" />
            </View>
            <Text style={styles.loadingText}>
              Finding delicious meals for you...
            </Text>
            <Text style={styles.loadingSubText}>🍽️ Almost ready!</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Animated.Text
                style={[
                  styles.greeting,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                Hello, David! 👋
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.subGreeting,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                What would you like to eat today?
              </Animated.Text>
            </View>
            <Animated.View
              style={[
                styles.profileButton,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <TouchableOpacity style={styles.profileIcon} activeOpacity={0.8}>
                <Text style={styles.profileIconText}>D</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchGradient}>
            <Ionicons
              name="search"
              size={20}
              color="#667eea"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search delicious food..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Animated.Text
            style={[
              styles.sectionTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            Quick Actions
          </Animated.Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((item, index) => (
              <QuickActionItem key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Animated.Text
            style={[
              styles.sectionTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            Categories
          </Animated.Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((item, index) => (
              <CategoryChip key={item.name} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Food List */}
        <View style={styles.foodSection}>
          <Animated.Text
            style={[
              styles.sectionTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {selectedCategory === "Popular"
              ? "Popular Dishes"
              : `${selectedCategory} Food`}
          </Animated.Text>

          {filteredOrders.length > 0 ? (
            <View style={styles.foodList}>
              {filteredOrders.map((item, index) => (
                <FoodCard key={item.id} item={item} index={index} />
              ))}
            </View>
          ) : (
            <Animated.View
              style={[
                styles.emptyContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No delicious meals found</Text>
              <Text style={styles.emptySubText}>
                Try searching for something else
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Chat Button */}
      <Animated.View
        style={[
          styles.chatButton,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity style={styles.chatButtonGradient} activeOpacity={0.8}>
          <Ionicons name="chatbubble" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#667eea",
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  header: {
    zIndex: 10,
  },
  headerGradient: {
    backgroundColor: "#667eea",
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  profileButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  profileIconText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchGradient: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 55,
  },
  searchIcon: {
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    padding: 5,
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  quickAction: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    width: (width - 60) / 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  quickActionBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  quickActionBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },
  categoriesSection: {
    marginBottom: 30,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "white",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  foodSection: {
    flex: 1,
  },
  foodList: {
    paddingHorizontal: 20,
  },
  foodCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  foodImageContainer: {
    position: "relative",
  },
  foodImage: {
    height: 140,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  foodEmoji: {
    fontSize: 60,
  },
  discountBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: "#ff6b6b",
  },
  foodContent: {
    padding: 20,
  },
  foodHeader: {
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  foodMeta: {
    flexDirection: "row",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  foodPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  chatButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  chatButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
