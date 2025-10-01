import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config";
import { useNavigation } from "@react-navigation/native";
import AppService from "../services/AppService";
import { useSocket, useRealTimeUpdates } from "../services/socketService";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [productsOpacity] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1)); // For real-time update animations
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set([2, 4]));
  const [user, setUser] = useState("");
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Enhanced socket integration with real-time updates
  const { socket, isConnected, connectionStatus, on, off } = useSocket();
  const { updates } = useRealTimeUpdates(["product", "category", "user"]);

  // Category configuration with icons and colors
  const categoryIcons = {
    Popular: {
      icon: "🔥",
      color: "#ff6b6b",
      gradient: ["#ff6b6b", "#ff8e8e"],
    },
    Asian: {
      icon: "🍜",
      color: "#4ecdc4",
      gradient: ["#4ecdc4", "#7fddda"],
    },
    Healthy: {
      icon: "🥗",
      color: "#95e1d3",
      gradient: ["#95e1d3", "#b8e6dc"],
    },
    Fast: { icon: "⚡", color: "#ffa726", gradient: ["#ffa726", "#ffb74d"] },
  };

  // Food emojis mapping
  const foodEmojis = {
    Asian: ["🍣", "🍜", "🥢", "🍱", "🥟"],
    Healthy: ["🥗", "🥣", "🥑", "🥕", "🍎"],
    Fast: ["🍔", "🍕", "🌭", "🍟", "🌯"],
    Popular: ["🍕", "🍔", "🍣", "🍜", "🥗"],
  };

  const quickActions = [
    { title: "My Orders", icon: "receipt", color: "#667eea", count: "3" },
    {
      title: "Favorites",
      icon: "heart",
      color: "#ff6b6b",
      count: favorites.size.toString(),
    },
    { title: "Rewards", icon: "gift", color: "#4ecdc4", count: "New" },
    { title: "Wallet", icon: "card", color: "#ffa726", count: "R45" },
  ];

  const api = {
    getProducts: async (params = {}) => {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      try {
        const data = await AppService.get(`/products/getAll?${queryParams}`);
        return data.success ? data.data : { products: [], pagination: {} };
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock data if API fails
        return {
          products: [
            {
              id: 1,
              name: "Sushi Platter",
              description: "Fresh salmon, tuna, and avocado rolls",
              price: 25.5,
              category: { name: "Asian" },
              isVeg: false,
              isVegan: false,
              isGlutenFree: false,
              isAvailable: true,
              rating: 4.9,
              reviewCount: 245,
              preparationTime: 20,
              image: null,
            },
            {
              id: 2,
              name: "Vegan Salad",
              description: "Mixed greens with quinoa and tahini",
              price: 12.0,
              category: { name: "Healthy" },
              isVeg: true,
              isVegan: true,
              isGlutenFree: true,
              isAvailable: true,
              rating: 4.7,
              reviewCount: 189,
              preparationTime: 10,
              image: null,
            },
            {
              id: 3,
              name: "Classic Burger",
              description: "Juicy beef patty with fresh lettuce and tomato",
              price: 18.0,
              category: { name: "Fast" },
              isVeg: false,
              isVegan: false,
              isGlutenFree: false,
              isAvailable: true,
              rating: 4.5,
              reviewCount: 320,
              preparationTime: 15,
              image: null,
            },
          ],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 3 },
        };
      }
    },

    getCategories: async () => {
      try {
        const data = await AppService.get(`/categories/getAll`);
        return data.success && Array.isArray(data.data)
          ? data.data
          : data.success
          ? [data]
          : Array.isArray(data)
          ? data
          : [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [
          { id: 1, name: "Popular", sortOrder: 1 },
          { id: 2, name: "Asian", sortOrder: 2 },
          { id: 3, name: "Healthy", sortOrder: 3 },
          { id: 4, name: "Fast", sortOrder: 4 },
        ];
      }
    },
  };

  // Enhanced real-time update handlers with better animations and feedback
  const handleProductUpdate = useCallback(
    async (data) => {
      console.log("🔄 Product update received:", data);

      if (!data || !data.data) return;

      const { action, data: productData } = data;

      // Update timestamp for last update indicator
      setLastUpdateTime(Date.now());

      // Pulse animation for visual feedback
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        switch (action) {
          case "created":
            // Add new product to list if it matches current filters
            if (
              !selectedCategory ||
              productData.categoryId === selectedCategory ||
              productData.category?.id === selectedCategory
            ) {
              setProducts((prev) => {
                // Check if product already exists to avoid duplicates
                const exists = prev.some((p) => p.id === productData.id);
                if (exists) return prev;

                const newProducts = [productData, ...prev];
                console.log("✅ Product added to list:", productData.name);

                // Show success animation
                Animated.sequence([
                  Animated.timing(productsOpacity, {
                    toValue: 0.7,
                    duration: 200,
                    useNativeDriver: true,
                  }),
                  Animated.timing(productsOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                ]).start();

                return newProducts;
              });
            }
            break;

          case "updated":
          case "availability_toggled":
            // Update existing product with smooth animation
            setProducts((prev) => {
              const updated = prev.map((product) =>
                product.id === productData.id
                  ? {
                      ...product,
                      ...productData,
                      // Ensure category is properly updated
                      category: productData.category || product.category,
                    }
                  : product
              );

              const updatedProduct = updated.find(
                (p) => p.id === productData.id
              );
              if (updatedProduct) {
                console.log("🔄 Product updated:", updatedProduct.name);
              }

              return updated;
            });

            // Smooth update animation
            Animated.timing(productsOpacity, {
              toValue: 0.8,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              Animated.timing(productsOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }).start();
            });
            break;

          case "deleted":
            // Remove product from list with fade out animation
            const productId = productData.id || data.productId;
            setProducts((prev) => {
              const filtered = prev.filter(
                (product) => product.id !== productId
              );
              console.log("🗑️ Product removed from list");
              return filtered;
            });

            // Fade out animation
            Animated.timing(productsOpacity, {
              toValue: 0.6,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              Animated.timing(productsOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            });
            break;

          default:
            // If we can't determine the specific action, refresh the products
            console.log("🔄 Unknown product action, refreshing products");
            loadProducts();
        }
      } catch (error) {
        console.error("Error handling product update:", error);
        // Show error and fallback to reload
        Alert.alert("Update Error", "Failed to update product. Refreshing...");
        loadProducts();
      }
    },
    [selectedCategory, pulseAnim, productsOpacity]
  );

  const handleCategoryUpdate = useCallback(
    async (data) => {
      console.log("🔄 Category update received:", data);

      if (!data || !data.data) return;

      const { action, data: categoryData } = data;

      // Update timestamp
      setLastUpdateTime(Date.now());

      try {
        switch (action) {
          case "created":
            // Add new category with animation
            setCategories((prev) => {
              const exists = prev.some((c) => c.id === categoryData.id);
              if (exists) return prev;

              const newCategories = [...prev, categoryData].sort(
                (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
              );
              console.log("✅ Category added:", categoryData.name);
              return newCategories;
            });
            break;

          case "updated":
            // Update existing category
            setCategories((prev) => {
              const updated = prev
                .map((category) =>
                  category.id === categoryData.id
                    ? { ...category, ...categoryData }
                    : category
                )
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

              console.log("🔄 Category updated:", categoryData.name);
              return updated;
            });
            break;

          case "deleted":
            // Remove category and handle selected category change
            const deletedId = categoryData.id || data.categoryId;
            setCategories((prev) => {
              const filtered = prev.filter(
                (category) => category.id !== deletedId
              );

              // If deleted category was selected, switch to first available category
              if (selectedCategory === deletedId && filtered.length > 0) {
                setSelectedCategory(filtered[0].id);
                console.log("🔄 Switched to category:", filtered[0].name);
              }

              console.log("🗑️ Category removed");
              return filtered;
            });
            break;

          default:
            // Fallback: reload categories
            console.log("🔄 Unknown category action, refreshing categories");
            const updatedCategories = await api.getCategories();
            setCategories(updatedCategories);
        }
      } catch (error) {
        console.error("Error handling category update:", error);
        Alert.alert("Update Error", "Failed to update category. Refreshing...");
        const updatedCategories = await api.getCategories();
        setCategories(updatedCategories);
      }
    },
    [selectedCategory]
  );

  // Handle notifications and system announcements
  const handleNotification = useCallback((data) => {
    console.log("🔔 Notification received:", data);

    // Show toast-like notification
    if (data.message) {
      Alert.alert(
        data.title || "Notification",
        data.message,
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
    }
  }, []);

  const handleSystemAnnouncement = useCallback((data) => {
    console.log("📢 System announcement:", data);

    if (data.message && data.important) {
      Alert.alert(
        "System Announcement",
        data.message,
        [{ text: "Understood", style: "default" }],
        { cancelable: false }
      );
    }
  }, []);

  // Enhanced socket listeners setup
  useEffect(() => {
    console.log("🔌 Setting up enhanced socket listeners");

    // Core real-time update listeners
    on("productUpdated", handleProductUpdate);
    on("categoryUpdated", handleCategoryUpdate);

    // Individual product event listeners for more granular control
    on("productCreated", (data) => {
      handleProductUpdate({ action: "created", data });
    });

    on("productDeleted", (data) => {
      handleProductUpdate({ action: "deleted", data });
    });

    on("productAvailabilityToggled", (data) => {
      handleProductUpdate({ action: "availability_toggled", data });
    });

    // Individual category event listeners
    on("categoryCreated", (data) => {
      handleCategoryUpdate({ action: "created", data });
    });

    on("categoryDeleted", (data) => {
      handleCategoryUpdate({ action: "deleted", data });
    });

    // Notification listeners
    on("notification", handleNotification);
    on("systemAnnouncement", handleSystemAnnouncement);

    // Connection status listeners with user feedback
    on("socketConnected", () => {
      console.log("✅ Socket connected - real-time updates active");
    });

    on("socketDisconnected", () => {
      console.log("❌ Socket disconnected - using cached data");
    });

    on("socketReconnected", () => {
      console.log("🔄 Socket reconnected - refreshing data");
      // Refresh data after reconnection
      loadProducts();
      loadInitialData();
    });

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up enhanced socket listeners");
      off("productUpdated", handleProductUpdate);
      off("categoryUpdated", handleCategoryUpdate);
      off("productCreated", handleProductUpdate);
      off("productDeleted", handleProductUpdate);
      off("productAvailabilityToggled", handleProductUpdate);
      off("categoryCreated", handleCategoryUpdate);
      off("categoryDeleted", handleCategoryUpdate);
      off("notification", handleNotification);
      off("systemAnnouncement", handleSystemAnnouncement);
    };
  }, [
    handleProductUpdate,
    handleCategoryUpdate,
    handleNotification,
    handleSystemAnnouncement,
    isConnected,
  ]);

  // Watch for real-time updates from the useRealTimeUpdates hook
  useEffect(() => {
    if (updates.product) {
      console.log("📦 Real-time product update detected:", updates.product);
    }
    if (updates.category) {
      console.log("📁 Real-time category update detected:", updates.category);
    }
    if (updates.user) {
      console.log("👤 Real-time user update detected:", updates.user);
    }
  }, [updates]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await loadInitialData();
      const sessionUser = await AppService.getUserIdFromToken();
      if (isMounted) {
        setUser(sessionUser);
      }
    };

    init();

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

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) {
      loadProducts();
    }
  }, [searchText, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [categoriesData] = await Promise.all([api.getCategories()]);
      setCategories(categoriesData);

      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);

    // Fade out animation for smooth transition
    Animated.timing(productsOpacity, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      const params = {
        page: 1,
        limit: 20,
        search: searchText || undefined,
        categoryId: selectedCategory || undefined,
        isAvailable: true,
      };

      const data = await api.getProducts(params);
      setProducts(data.products);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setProductsLoading(false);
      // Fade in animation
      Animated.timing(productsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCategoryPress = (categoryId) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
    }
  };

  const handleProductPress = (item) => {
    navigation.navigate("ItemDetails", { item });
  };

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    newFavorites.has(id) ? newFavorites.delete(id) : newFavorites.add(id);
    setFavorites(newFavorites);
  };

  const getProductEmoji = (product) => {
    if (product.image) {
      return product.image;
    }

    const categoryName = product.category?.name || "Popular";
    const emojis = foodEmojis[categoryName] || foodEmojis.Popular;
    const index = Math.abs(product.id.toString().charCodeAt(0)) % emojis.length;
    return emojis[index];
  };

  const getDiscountPercentage = (productId) => {
    const random = Math.abs(productId.toString().charCodeAt(0)) % 100;
    if (random > 70) return Math.floor(random % 20) + 10;
    return null;
  };

  const formatPrepTime = (minutes) => {
    if (!minutes) return "15-20 min";
    const baseTime = parseInt(minutes);
    const maxTime = baseTime + 5;
    return `${baseTime}-${maxTime} min`;
  };

  const safeParseFloat = (value) => {
    if (value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-400";
      case "connecting":
        return "bg-yellow-400";
      case "disconnected":
        return "bg-orange-400";
      case "error":
      case "failed":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live Updates Active";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Reconnecting...";
      case "error":
        return "Connection Error";
      case "failed":
        return "Offline Mode";
      default:
        return "Unknown Status";
    }
  };

  // Function to format last update time
  const getLastUpdateText = () => {
    const timeDiff = Date.now() - lastUpdateTime;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes === 0) {
      return "Just now";
    } else if (minutes === 1) {
      return "1 min ago";
    } else if (minutes < 60) {
      return `${minutes} mins ago`;
    } else {
      return "1+ hour ago";
    }
  };

  const CategoryChip = ({ item, index }) => {
    const categoryConfig = categoryIcons[item.name] || {
      icon: item.image || "📁",
      color: "#6b7280",
      gradient: ["#6b7280", "#9ca3af"],
    };
    const isSelected = selectedCategory === item.id;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 30 * (index + 1)],
              }),
            },
            { scale: pulseAnim }, // Add pulse animation for real-time updates
          ],
        }}
      >
        <TouchableOpacity
          className={`flex-row items-center px-5 py-3 rounded-full bg-white mr-3 shadow-md ${
            isSelected ? "shadow-lg" : ""
          }`}
          style={{
            backgroundColor: isSelected ? categoryConfig.color : "white",
            shadowColor: isSelected ? categoryConfig.color : "#000",
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: isSelected ? 8 : 4,
            elevation: isSelected ? 8 : 3,
          }}
          onPress={() => setSelectedCategory(item.id)}
          activeOpacity={0.8}
        >
          <View
            className="w-8 h-8 rounded-2xl justify-center items-center mr-2"
            style={{
              backgroundColor: isSelected
                ? "rgba(255,255,255,0.2)"
                : categoryConfig.color + "15",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: isSelected ? "white" : categoryConfig.color,
              }}
            >
              {categoryConfig.icon}
            </Text>
          </View>
          <Text
            className="text-sm"
            style={{
              color: isSelected ? "white" : "#333",
              fontWeight: isSelected ? "700" : "600",
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const QuickActionItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 items-center relative shadow-sm"
        style={{
          width: (width - 60) / 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.8}
      >
        <View
          className="w-10 h-10 rounded-xl justify-center items-center mb-2"
          style={{ backgroundColor: item.color + "15" }}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Text className="text-xs font-semibold text-gray-800 text-center">
          {item.title}
        </Text>
        <View
          className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full justify-center items-center px-1.5"
          style={{ backgroundColor: item.color }}
        >
          <Text className="text-xs font-bold text-white">{item.count}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const FoodCard = ({ item, index }) => {
    const discount = getDiscountPercentage(item.id);
    const emoji = getProductEmoji(item);
    const prepTime = formatPrepTime(item.preparationTime);

    return (
      <Animated.View
        className="bg-white rounded-2xl mb-5 overflow-hidden shadow-lg"
        style={{
          opacity: productsOpacity,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 * (index + 1)],
              }),
            },
            { scale: pulseAnim }, // Add pulse animation for updates
          ],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => handleProductPress(item)}
          activeOpacity={0.9}
        >
          <View className="relative">
            <View className="h-36 bg-gray-50 justify-center items-center">
              <Text className="text-6xl">{emoji}</Text>
              {discount && (
                <View className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-xl">
                  <Text className="text-xs font-bold text-white">
                    {discount}% OFF
                  </Text>
                </View>
              )}
              {/* Availability indicator */}
              {!item.isAvailable && (
                <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
                  <Text className="text-white font-bold text-lg">
                    Unavailable
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              className={`absolute top-4 right-4 w-9 h-9 rounded-full justify-center items-center shadow-sm ${
                favorites.has(item.id) ? "bg-red-500" : "bg-white"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              <Ionicons
                name={favorites.has(item.id) ? "heart" : "heart-outline"}
                size={20}
                color={favorites.has(item.id) ? "white" : "#ff6b6b"}
              />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            <View className="mb-2">
              <Text className="text-lg font-bold text-gray-800 mb-1">
                {item.name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text className="text-sm font-semibold text-gray-800 ml-1">
                  {safeParseFloat(item.rating || 4.5).toFixed(1)}
                </Text>
                <Text className="text-xs text-gray-400 ml-1">
                  ({parseInt(item.reviewCount || 0)})
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-500 mb-3 leading-5">
              {item.description}
            </Text>

            <View className="flex-row mb-4">
              <View className="flex-row items-center mr-5">
                <Ionicons name="time" size={14} color="#666" />
                <Text className="text-xs text-gray-500 ml-1">{prepTime}</Text>
              </View>
              {item.isVeg && (
                <View className="flex-row items-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                  <Text className="text-xs text-green-700 font-medium">
                    Veg
                  </Text>
                </View>
              )}
              {item.isVegan && (
                <View className="flex-row items-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                  <Text className="text-xs text-emerald-700 font-medium">
                    Vegan
                  </Text>
                </View>
              )}
              {item.isGlutenFree && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                  <Text className="text-xs text-blue-700 font-medium">GF</Text>
                </View>
              )}
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-0.5">
                  Total Price
                </Text>
                <Text className="text-xl font-bold text-gray-800">
                  R{safeParseFloat(item.price).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center"
                style={{
                  backgroundColor: item.isAvailable ? "#667eea" : "#9ca3af",
                  shadowColor: item.isAvailable ? "#667eea" : "#9ca3af",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                activeOpacity={0.8}
                disabled={!item.isAvailable}
                onPress={(e) => {
                  e.stopPropagation();
                  if (item.isAvailable) {
                    // Add to cart functionality here
                    console.log("Adding to cart:", item.name);
                  }
                }}
              >
                <Ionicons
                  name={item.isAvailable ? "add" : "close"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ProductsLoadingView = () => (
    <Animated.View
      className="items-center py-20 px-5"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View className="mb-6">
        <ActivityIndicator size="large" color="#667eea" />
      </View>
      <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
        Finding delicious meals...
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        Searching through our amazing collection
      </Text>
      <View className="flex-row">
        {["🍕", "🍔", "🍣", "🥗"].map((emoji, index) => (
          <Animated.Text
            key={index}
            className="text-2xl mx-1"
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5 * (index % 2 === 0 ? 1 : -1)],
                  }),
                },
              ],
            }}
          >
            {emoji}
          </Animated.Text>
        ))}
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#667eea" }}
      >
        <View className="items-center">
          <View className="mb-5">
            <ActivityIndicator size="large" color="white" />
          </View>
          <Text className="text-white text-lg font-semibold mb-2 text-center">
            Finding delicious meals for you...
          </Text>
          <Text className="text-white text-base opacity-80">
            🍽️ Almost ready!
          </Text>
        </View>
      </View>
    );
  }

  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name || "Popular";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="z-10">
        <View
          className="pb-8 rounded-b-3xl"
          style={{ backgroundColor: "#667eea" }}
        >
          <View className="flex-row justify-between items-center px-5 pt-2.5 mt-10">
            <View className="flex-1">
              <Animated.Text
                className="text-3xl font-bold text-white mb-1"
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                Hello, {user.firstName}! 👋
              </Animated.Text>
              <Animated.Text
                className="text-base text-white opacity-80"
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                What would you like to eat today?
              </Animated.Text>
            </View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center border-2"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-xl">
                  {user?.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : ""}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Enhanced Connection Status Indicator */}
          <View className="flex-row items-center justify-center mt-4">
            <Animated.View
              className={`w-2 h-2 rounded-full mr-2 ${getConnectionStatusColor()}`}
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            />
            <Text className="text-xs text-white opacity-70">
              {getConnectionStatusText()}
            </Text>
            {connectionStatus === "connected" && (
              <Text className="text-xs text-white opacity-50 ml-2">
                • Last update: {getLastUpdateText()}
              </Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Search Bar */}
        <Animated.View
          className="mx-5 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center bg-white rounded-2xl px-5 h-14">
            <Ionicons
              name="search"
              size={20}
              color="#667eea"
              style={{ marginRight: 15 }}
            />
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Search delicious food..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity className="p-1">
              <Ionicons name="options" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Animated.Text
            className="text-xl font-bold text-gray-800 mx-5 mb-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            Quick Actions
          </Animated.Text>
          <View className="flex-row justify-between px-5">
            {quickActions.map((item, index) => (
              <QuickActionItem key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-8">
          <Animated.Text
            className="text-xl font-bold text-gray-800 mx-5 mb-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            Categories
            {categories.length > 0 && (
              <Text className="text-sm font-normal text-gray-500 ml-2">
                ({categories.length})
              </Text>
            )}
          </Animated.Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categories.map((item, index) => (
              <CategoryChip
                key={item.id}
                item={item}
                index={index}
                isActive={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Food List */}
        <View className="flex-1">
          <Animated.Text
            className="text-xl font-bold text-gray-800 mx-5 mb-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }}
          >
            {selectedCategoryName === "Popular"
              ? "Popular Dishes"
              : `${selectedCategoryName} Food`}
            {products.length > 0 && (
              <Text className="text-sm font-normal text-gray-500 ml-2">
                ({products.length} items)
              </Text>
            )}
          </Animated.Text>

          {productsLoading ? (
            <ProductsLoadingView />
          ) : products.length > 0 ? (
            <View className="px-5">
              {products.map((item, index) => (
                <FoodCard key={item.id} item={item} index={index} />
              ))}
            </View>
          ) : (
            <Animated.View
              className="items-center py-15 px-5"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Text className="text-8xl mb-5">🍽️</Text>
              <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
                No delicious meals found
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-4">
                Try searching for something else or check a different category
              </Text>
              {!isConnected && (
                <TouchableOpacity
                  onPress={loadProducts}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Chat Button with Real-time Indicator */}
      <Animated.View
        className="absolute bottom-8 right-5"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          shadowColor: "#ff6b6b",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <TouchableOpacity
          className="w-15 h-15 rounded-full justify-center items-center relative"
          style={{ backgroundColor: "#ff6b6b" }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble" size={24} color="white" />
          {/* Live indicator */}
          {isConnected && (
            <Animated.View
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Debug Panel (remove in production) */}
      {__DEV__ && (
        <Animated.View
          className="absolute top-20 left-2 bg-black bg-opacity-80 p-2 rounded"
          style={{ opacity: fadeAnim }}
        >
          <Text className="text-white text-xs">Status: {connectionStatus}</Text>
          <Text className="text-white text-xs">
            Products: {products.length}
          </Text>
          <Text className="text-white text-xs">
            Categories: {categories.length}
          </Text>
          <Text className="text-white text-xs">
            Last Update: {getLastUpdateText()}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
