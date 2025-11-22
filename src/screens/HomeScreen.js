import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import AppService from "../services/AppService";
import { useSocket } from "../services/socketService";

// Import components
import HomeHeader from "../components/HomeHeader";
import SearchBar from "../components/SearchBar";
import QuickActions from "../components/QuickActions";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";
import FloatingChatButton from "../components/FloatingChatButton";
import ConnectionStatus from "../components/ConnectionStatus";
import DebugPanel from "../components/DebugPanel";
import LoadingScreen from "../components/LoadingScreen";

// Import hooks
import { useAnimations } from "./Home/hooks/useAnimations";
import { useProducts } from "./Home/hooks/useProducts";
import { useCategories } from "./Home/hooks/useCategories";
import { useNotifications } from "./Home/hooks/useNotifications";
import { useSocketHandlers } from "./Home/hooks/useSocketHandlers";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null); // Start with null
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Animations
  const animations = useAnimations();

  // Socket connection
  const { socket, isConnected, connectionStatus, on, off } = useSocket();

  // Products management
  const {
    products,
    setProducts,
    productsLoading,
    loadProducts,
    loadFavoriteProducts,
  } = useProducts(selectedCategory, searchText, animations.productsOpacity);

  // Categories management
  const { categories, setCategories, loadCategories } = useCategories();

  // ✅ CORRECT USAGE: Pass user?.id (will trigger fetch when user is set)
  const {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    fetchNotifications,
    fetchUnreadCount,
  } = useNotifications(user?.id);

  // Socket event handlers
  const {
    handleProductUpdate,
    handleCategoryUpdate,
    handleNotificationUpdate,
  } = useSocketHandlers({
    selectedCategory,
    setProducts,
    setCategories,
    setNotifications,
    setUnreadCount,
    loadProducts,
    loadCategories,
    fetchUnreadCount,
    animations,
  });

  // Setup socket listeners
  useEffect(() => {
    console.log("🔌 Setting up socket listeners");

    // Product events
    on("productUpdated", handleProductUpdate);
    on("productCreated", (data) =>
      handleProductUpdate({ action: "created", data })
    );
    on("productDeleted", (data) =>
      handleProductUpdate({ action: "deleted", data })
    );
    on("productAvailabilityToggled", (data) =>
      handleProductUpdate({ action: "availability_toggled", data })
    );

    // Category events
    on("categoryUpdated", handleCategoryUpdate);
    on("categoryCreated", (data) =>
      handleCategoryUpdate({ action: "created", data })
    );
    on("categoryDeleted", (data) =>
      handleCategoryUpdate({ action: "deleted", data })
    );

    // Notification events - IMPORTANT: These handle real-time updates
    on("notificationCreated", (data) => {
      handleNotificationUpdate({ action: "created", data });
    });
    on("notificationRead", (data) => {
      handleNotificationUpdate({ action: "read", data });
    });
    on("notificationDeleted", (data) => {
      handleNotificationUpdate({ action: "deleted", data });
    });
    on("notificationsAllRead", (data) => {
      handleNotificationUpdate({ action: "allRead", data });
    });
    on("notificationUpdated", (data) => {
      console.log("🔔 Socket event: notificationUpdated", data);
      handleNotificationUpdate({ action: "updated", data });
    });

    // Connection events
    on("socketReconnected", () => {
      console.log("🔄 Socket reconnected - refreshing data");
      loadProducts();
      loadCategories();
      if (user?.id) {
        fetchNotifications(); // Refresh notifications on reconnect
      }
    });

    return () => {
      console.log("🔌 Cleaning up socket listeners");
      off("productUpdated", handleProductUpdate);
      off("productCreated", handleProductUpdate);
      off("productDeleted", handleProductUpdate);
      off("productAvailabilityToggled", handleProductUpdate);
      off("categoryUpdated", handleCategoryUpdate);
      off("categoryCreated", handleCategoryUpdate);
      off("categoryDeleted", handleCategoryUpdate);
      off("notificationCreated", handleNotificationUpdate);
      off("notificationRead", handleNotificationUpdate);
      off("notificationDeleted", handleNotificationUpdate);
      off("notificationsAllRead", handleNotificationUpdate);
      off("notificationUpdated", handleNotificationUpdate);
      off("socketReconnected");
    };
  }, [
    handleProductUpdate,
    handleCategoryUpdate,
    handleNotificationUpdate,
    isConnected,
    user?.id,
    on,
    off,
  ]);

  // Initial data load - ONLY ONCE
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const sessionUser = await AppService.getUserIdFromToken();
        if (isMounted && sessionUser) {
          console.log("👤 User loaded:", sessionUser);
          setUser(sessionUser); // ✅ This triggers useNotifications to fetch

          // Load categories
          await loadCategories();

          // Load user's favorite products
          const favoriteProducts = await loadFavoriteProducts(sessionUser.id);

          if (favoriteProducts && favoriteProducts.length > 0) {
            setProducts(favoriteProducts);
          } else {
            await loadProducts();
          }

          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        if (isMounted) {
          setTimeout(() => setLoading(false), 1200);
        }
      }
    };

    init();
    animations.startInitialAnimations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load products when category or search changes
  useEffect(() => {
    if (initialLoadComplete && !loading) {
      loadProducts();
    }
  }, [searchText, selectedCategory]);

  // Optional: Periodic unread count refresh
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [user?.id, fetchUnreadCount]);

  const handleNotificationPress = () => {
    console.log("🔔 Opening notifications, unread count:", unreadCount);
    navigation.navigate("Notifications");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <HomeHeader
        user={user}
        unreadCount={unreadCount} // ✅ Pass unread count to header
        onNotificationPress={handleNotificationPress}
        animations={animations}
      />

      <ConnectionStatus
        connectionStatus={connectionStatus}
        isConnected={isConnected}
        animations={animations}
      />

      <ScrollView
        className="flex-1 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Your other components */}
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          animations={animations}
        />

        <QuickActions
          favorites={favorites}
          onActionPress={(action) => {
            /* handle actions */
          }}
          animations={animations}
          user={user}
        />

        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryPress={setSelectedCategory}
          animations={animations}
        />

        <ProductList
          products={products}
          selectedCategoryName={
            categories.find((cat) => cat.id === selectedCategory)?.name ||
            "For You"
          }
          productsLoading={productsLoading}
          favorites={favorites}
          onProductPress={(item) =>
            navigation.navigate("ItemDetails", { item })
          }
          onToggleFavorite={(id) => {
            const newFavorites = new Set(favorites);
            newFavorites.has(id)
              ? newFavorites.delete(id)
              : newFavorites.add(id);
            setFavorites(newFavorites);
          }}
          onRetry={loadProducts}
          isConnected={isConnected}
          animations={animations}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingChatButton
        onPress={() => {
          try {
            console.log("Navigating to Chatbot from FloatingChatButton");
            navigation.navigate("Home", { screen: "Chatbot" });
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }}
        isConnected={false}
      />

      {/* {__DEV__ && (
        <DebugPanel
          connectionStatus={connectionStatus}
          productsCount={products.length}
          categoriesCount={categories.length}
          notificationsCount={notifications.length}
          unreadCount={unreadCount}
          animations={animations}
        />
      )} */}
    </SafeAreaView>
  );
};

export default HomeScreen;
