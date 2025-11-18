import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AppService from "../services/AppService";
import { useSocket } from "../services/socketService";

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [user, setUser] = useState(null);
  const [navigationReady, setNavigationReady] = useState(false);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const hasInitialized = useRef(false);
  const isMounted = useRef(false);

  const { socket, isConnected, on, off } = useSocket();

  // Order status configuration
  const orderStatusConfig = {
    pending: {
      color: "#ffa726",
      icon: "time-outline",
      label: "Pending",
      gradient: ["#ffa726", "#ffb74d"],
    },
    confirmed: {
      color: "#4ecdc4",
      icon: "checkmark-circle-outline",
      label: "Confirmed",
      gradient: ["#4ecdc4", "#7fddda"],
    },
    preparing: {
      color: "#667eea",
      icon: "restaurant-outline",
      label: "Preparing",
      gradient: ["#667eea", "#8b9cf8"],
    },
    ready: {
      color: "#95e1d3",
      icon: "bag-check-outline",
      label: "Ready",
      gradient: ["#95e1d3", "#b8e6dc"],
    },
    delivering: {
      color: "#ff6b6b",
      icon: "bicycle-outline",
      label: "Out for Delivery",
      gradient: ["#ff6b6b", "#ff8e8e"],
    },
    delivered: {
      color: "#51cf66",
      icon: "checkmark-done-circle",
      label: "Delivered",
      gradient: ["#51cf66", "#7ae085"],
    },
    cancelled: {
      color: "#e74c3c",
      icon: "close-circle-outline",
      label: "Cancelled",
      gradient: ["#e74c3c", "#ec7063"],
    },
  };

  // CRITICAL FIX: Check if navigation is ready before doing anything
  useEffect(() => {
    isMounted.current = true;

    // Small delay to ensure navigation is fully initialized
    const timer = setTimeout(() => {
      if (isMounted.current) {
        console.log("====================================");
        console.log("✅ Navigation ready, setting navigationReady to true");
        console.log("====================================");
        setNavigationReady(true);
      }
    }, 50);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  // Load user data only after navigation is ready
  useEffect(() => {
    if (!navigationReady || !isFocused) {
      console.log("⏸️ Waiting for navigation/focus:", {
        navigationReady,
        isFocused,
      });
      return;
    }

    console.log("====================================");
    console.log("🔄 MyOrdersScreen mounted, isFocused: true");
    console.log("====================================");
    console.log("✅ Screen is focused, loading user data...");

    loadUserData();

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [navigationReady, isFocused]);

  const loadUserData = async () => {
    try {
      console.log("====================================");
      console.log("📋 Starting loadUserData...");
      setLoading(true);

      const sessionUser = await AppService.getUserIdFromToken();
      console.log("👤 User data retrieved:", sessionUser);

      if (sessionUser?.id) {
        console.log("✅ Valid user found, ID:", sessionUser.id);
        setUser(sessionUser);

        await fetchOrders(sessionUser.id);
        hasInitialized.current = true;
      } else {
        console.log("❌ No valid user found");
        setLoading(false);

        Alert.alert(
          "Session Expired",
          "Please login again to view your orders.",
          [
            {
              text: "Go to Login",
              onPress: () => {
                console.log("🔄 User chose to go to Login");
                if (navigation && navigationReady) {
                  navigation.navigate("Login");
                }
              },
            },
            {
              text: "Go to Home",
              onPress: () => {
                console.log("🏠 User chose to go to Home");
                if (navigation && navigationReady) {
                  navigation.navigate("Main", { screen: "Home" });
                }
              },
            },
          ]
        );
      }

      console.log("====================================");
    } catch (error) {
      console.error("====================================");
      console.error("❌ Error in loadUserData:", error);
      console.error("Error stack:", error.stack);
      console.error("====================================");

      setLoading(false);
      Alert.alert(
        "Error",
        "Failed to load user information. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => loadUserData(),
          },
          {
            text: "Go Back",
            onPress: () => {
              if (navigation && navigationReady && navigation.canGoBack()) {
                navigation.goBack();
              } else if (navigation && navigationReady) {
                navigation.navigate("Main", { screen: "Home" });
              }
            },
          },
        ]
      );
    }
  };

  const fetchOrders = async (userId) => {
    try {
      console.log("====================================");
      console.log("📦 Fetching orders for user:", userId);
      setLoading(true);

      const response = await AppService.get(
        `/orders/getUserOderById/${userId}`
      );

      console.log("📦 Orders response received");

      if (response.success && response.data) {
        const sortedOrders = Array.isArray(response.data)
          ? response.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          : [];

        console.log(`✅ Found ${sortedOrders.length} orders`);
        setOrders(sortedOrders);
      } else {
        console.log("⚠️ No orders found in response");
        setOrders([]);
      }
      console.log("====================================");
    } catch (error) {
      console.error("====================================");
      console.error("❌ Error fetching orders:", error.message);
      console.error("====================================");

      if (error.response?.status === 404) {
        console.log("ℹ️ 404 - No orders found");
        setOrders([]);
      } else {
        Alert.alert("Error", "Failed to fetch orders. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("✅ fetchOrders completed");
    }
  };

  // Socket listeners for real-time order updates
  useEffect(() => {
    if (isConnected && user?.id) {
      console.log("====================================");
      console.log("🔌 Setting up order update listeners for user:", user.id);
      console.log("====================================");

      on("orderUpdated", handleOrderUpdate);
      on("orderStatusChanged", handleOrderUpdate);
      on("orderCreated", handleNewOrder);
      on("orderCancelled", handleOrderCancellation);

      return () => {
        console.log("🔌 Cleaning up socket listeners");
        off("orderUpdated", handleOrderUpdate);
        off("orderStatusChanged", handleOrderUpdate);
        off("orderCreated", handleNewOrder);
        off("orderCancelled", handleOrderCancellation);
      };
    }
  }, [isConnected, user]);

  const handleOrderUpdate = useCallback((data) => {
    console.log("📦 Order update received:", data.id || data.data?.id);

    const orderData = data.data || data;
    const orderId = orderData.id || data.orderId;

    setOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex((o) => o.id === orderId);

      if (orderIndex !== -1) {
        console.log(`✅ Updating order at index ${orderIndex}`);
        const updatedOrders = [...prevOrders];
        updatedOrders[orderIndex] = {
          ...updatedOrders[orderIndex],
          ...orderData,
        };
        return updatedOrders;
      }
      console.log("⚠️ Order not found in list");
      return prevOrders;
    });
  }, []);

  const handleNewOrder = useCallback((data) => {
    console.log("🆕 New order received:", data.id || data.data?.id);

    const orderData = data.data || data;

    setOrders((prevOrders) => {
      const exists = prevOrders.some((o) => o.id === orderData.id);
      if (!exists) {
        console.log("✅ Adding new order to list");
        return [orderData, ...prevOrders];
      }
      console.log("⚠️ Order already exists in list");
      return prevOrders;
    });

    Alert.alert("New Order!", "Your order has been placed successfully.", [
      { text: "OK", style: "default" },
    ]);
  }, []);

  const handleOrderCancellation = useCallback((data) => {
    console.log("❌ Order cancelled:", data.orderId || data.data?.id);

    const orderId = data.orderId || data.data?.id;

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order
      )
    );
  }, []);

  const onRefresh = useCallback(() => {
    console.log("🔄 Refreshing orders...");

    if (user?.id) {
      setRefreshing(true);
      fetchOrders(user.id);
    } else {
      console.log("⚠️ No user ID available for refresh");
    }
  }, [user]);

  const toggleOrderExpansion = useCallback((orderId) => {
    console.log("🔽 Toggling order expansion:", orderId);
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return `R${numPrice.toFixed(2)}`;
  };

  const handleGoBack = useCallback(() => {
    console.log("🔙 handleGoBack called");

    try {
      if (!navigationReady) {
        console.log("⚠️ Navigation not ready yet");
        return;
      }

      if (navigation && navigation.canGoBack()) {
        console.log("✅ Going back");
        navigation.goBack();
      } else if (navigation && navigation.navigate) {
        console.log("✅ Navigating to Home");
        navigation.navigate("Main", { screen: "Home" });
      } else {
        console.log("❌ Navigation not available");
      }
    } catch (error) {
      console.error("❌ Error in handleGoBack:", error);
    }
  }, [navigation, navigationReady]);

  const OrderCard = React.memo(({ order, index }) => {
    const statusConfig =
      orderStatusConfig[order.status] || orderStatusConfig.pending;
    const isExpanded = expandedOrder === order.id;
    const totalItems =
      order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 * (index + 1)],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          onPress={() => toggleOrderExpansion(order.id)}
          activeOpacity={0.9}
          className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          {/* Order Header */}
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800 mb-1">
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </Text>
              </View>

              <View
                className="px-3 py-1.5 rounded-full flex-row items-center"
                style={{ backgroundColor: statusConfig.color + "20" }}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={16}
                  color={statusConfig.color}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center flex-1">
                <Ionicons name="restaurant" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </Text>
              </View>

              <Text className="text-xl font-bold text-gray-800">
                {formatPrice(order.totalAmount)}
              </Text>
            </View>

            {/* Expand/Collapse Indicator */}
            <View className="flex-row items-center justify-center pt-2 border-t border-gray-100">
              <Text className="text-xs text-gray-400 mr-1">
                {isExpanded ? "Hide" : "View"} Details
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color="#999"
              />
            </View>
          </View>

          {/* Order Items - Expanded View */}
          {isExpanded && (
            <View className="px-4 pb-4 border-t border-gray-100">
              <Text className="text-sm font-semibold text-gray-700 mt-3 mb-2">
                Order Items:
              </Text>

              {order.orderItems?.map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center py-2 border-b border-gray-50"
                >
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {item.product?.name || "Unknown Item"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-gray-800">
                    {formatPrice(item.quantity * item.price)}
                  </Text>
                </View>
              ))}

              {/* Order Total Breakdown */}
              <View className="mt-3 pt-3 border-t border-gray-200">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm text-gray-600">Subtotal</Text>
                  <Text className="text-sm text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                  <Text className="text-base font-bold text-gray-800">
                    Total
                  </Text>
                  <Text className="text-lg font-bold text-gray-800">
                    {formatPrice(order.totalAmount)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <View className="flex-row mt-4 space-x-2">
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert(
                        "Track Order",
                        "Order tracking feature coming soon!",
                        [{ text: "OK" }]
                      );
                    }}
                  >
                    <Text className="text-sm font-semibold text-gray-700">
                      Track Order
                    </Text>
                  </TouchableOpacity>

                  {order.status === "pending" && (
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl items-center ml-2"
                      style={{ backgroundColor: "#e74c3c" }}
                      activeOpacity={0.8}
                      onPress={() => {
                        Alert.alert(
                          "Cancel Order",
                          "Are you sure you want to cancel this order?",
                          [
                            { text: "No", style: "cancel" },
                            {
                              text: "Yes, Cancel",
                              style: "destructive",
                              onPress: () => {
                                console.log("Cancelling order:", order.id);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text className="text-sm font-semibold text-white">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  });

  // Wait for navigation to be ready
  if (!navigationReady) {
    console.log("⏸️ Waiting for navigation to be ready...");
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-600 mt-4 text-base">Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    console.log("🔄 Rendering loading state...");
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#667eea" />
          <Text className="text-gray-600 mt-4 text-base">
            {user ? "Loading your orders..." : "Checking authentication..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("✅ Rendering main screen with", orders.length, "orders");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="pb-6 rounded-b-3xl shadow-lg"
        style={{ backgroundColor: "#667eea" }}
      >
        <View className="flex-row items-center px-5 pt-2.5">
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-full justify-center items-center mr-3"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">My Orders</Text>
            <Text className="text-sm text-white opacity-80 mt-0.5">
              {orders.length} order{orders.length !== 1 ? "s" : ""} total
            </Text>
          </View>

          {/* Live Connection Indicator */}
          {isConnected && (
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              <Text className="text-xs text-white opacity-70">Live</Text>
            </View>
          )}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={["#667eea"]}
          />
        }
      >
        {orders.length > 0 ? (
          <>
            {orders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
            <View style={{ height: 20 }} />
          </>
        ) : (
          <Animated.View
            className="items-center justify-center py-20"
            style={{
              opacity: fadeAnim,
            }}
          >
            <Text className="text-6xl mb-4">🛒</Text>
            <Text className="text-xl font-bold text-gray-800 mb-2">
              No Orders Yet
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-6 px-10">
              Start exploring our delicious menu and place your first order!
            </Text>
            <TouchableOpacity
              onPress={() => {
                console.log("🏠 Navigating to Home from empty state");
                if (navigation && navigationReady) {
                  navigation.navigate("Main", { screen: "Home" });
                }
              }}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: "#667eea" }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Browse Menu</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyOrdersScreen;
