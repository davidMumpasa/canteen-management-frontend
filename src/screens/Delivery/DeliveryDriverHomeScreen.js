import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { useSocket } from "../../services/socketService";
import AppService from "../../services/AppService";
import DeliveryService from "../../services/DeliveryService";

const DeliveryDriverHomeScreen = ({ navigation }) => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [driverId, setDriverId] = useState(null);
  const { socket, isConnected, on, off } = useSocket();

  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const getDriverId = async () => {
    try {
      const userData = await AppService.getUserIdFromToken();
      if (!userData) return null;
      console.log("🔍 Driver data:", userData);
      return userData.driverId || userData.id;
    } catch (error) {
      console.error("Error getting driver ID:", error);
      return null;
    }
  };

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const currentDriverId = await getDriverId();
      if (!currentDriverId) {
        Alert.alert("Error", "Driver not found. Please log in again.");
        return;
      }
      setDriverId(currentDriverId);

      const response = await DeliveryService.getReadyOrders(currentDriverId);
      if (response.success && Array.isArray(response.data)) {
        setReadyOrders(response.data);
        console.log(`📦 Found ${response.data.length} ready orders`);
      } else if (Array.isArray(response)) {
        setReadyOrders(response);
        console.log(`📦 Found ${response.length} ready orders`);
      } else {
        setReadyOrders([]);
        console.warn("⚠️ Unexpected response format:", response);
      }
    } catch (error) {
      console.error("❌ Error fetching ready orders:", error);
      Alert.alert("Error", "Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = useCallback(
    (data) => {
      if (data.order) {
        const updatedOrder = data.order;

        // ✅ FILTER: Only process orders assigned to THIS driver
        if (updatedOrder.deliveryDriverId !== driverId) {
          console.log("⏭️ Skipping order - not assigned to this driver");
          return;
        }

        // ✅ FILTER: Skip pickup counter orders
        if (
          updatedOrder.deliveryAddress
            ?.toLowerCase()
            .includes("main canteen pickup counter")
        ) {
          console.log("⏭️ Skipping order - pickup counter order");
          return;
        }

        console.log(`Order ${updatedOrder.id} status: ${updatedOrder.status}`);

        // Handle out_for_delivery status - redirect to Active Orders
        if (updatedOrder.status === "out_for_delivery") {
          console.log("🚗 Order out for delivery, redirecting...");
          setReadyOrders((prev) =>
            prev.filter((o) => o.id !== updatedOrder.id)
          );

          Alert.alert(
            "Pickup Verified!",
            `Order #${updatedOrder.orderNumber
              .split("-")
              .pop()} is now out for delivery.`,
            [
              {
                text: "Go to Active Orders",
                onPress: () => navigation.navigate("ActiveOrders"),
              },
            ]
          );
          return;
        }

        if (updatedOrder.status === "ready") {
          setReadyOrders((prev) => {
            const exists = prev.find((o) => o.id === updatedOrder.id);
            if (!exists) {
              console.log("✅ Adding new ready order:", updatedOrder.id);
              return [...prev, updatedOrder];
            }
            console.log("🔄 Updating existing order:", updatedOrder.id);
            return prev.map((o) =>
              o.id === updatedOrder.id ? updatedOrder : o
            );
          });
        } else {
          console.log("➖ Removing order from ready list:", updatedOrder.id);
          setReadyOrders((prev) =>
            prev.filter((o) => o.id !== updatedOrder.id)
          );
        }
      }
    },
    [driverId, navigation]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadyOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log("🔌 Initializing socket connection...");
        await socket.init();

        // Get driver ID first
        const currentDriverId = await getDriverId();
        if (currentDriverId) {
          setDriverId(currentDriverId);

          // Join both the general driver room AND the specific driver room
          socket.joinDriverRoom(); // General room for all ready orders
          socket.emit("join-driver-specific", currentDriverId); // Specific room for assigned orders
        }

        on("orderStatusChanged", handleOrderUpdate);
        on("orderCreated", handleOrderUpdate);
        on("orderUpdated", handleOrderUpdate);

        setConnectionStatus(isConnected ? "connected" : "disconnected");
        console.log("✅ Socket initialized and listeners set up");
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        setConnectionStatus("error");
      }
    };

    initializeSocket();

    return () => {
      console.log("🧹 Cleaning up socket listeners...");
      off("orderStatusChanged", handleOrderUpdate);
      off("orderCreated", handleOrderUpdate);
      off("orderUpdated", handleOrderUpdate);
    };
  }, [handleOrderUpdate, socket]);

  // Update connection status (matching OrderScreen pattern)
  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  // Fetch orders on mount and focus (matching OrderScreen pattern)
  useEffect(() => {
    fetchReadyOrders();

    // Add focus listener to refresh when navigating back
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 Screen focused, refreshing orders...");
      fetchReadyOrders();
    });

    return unsubscribe;
  }, [navigation]);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalItems = (orderItems) => {
    return orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { flex: 1 }]}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="text-gray-600 mt-4 text-base">
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B00"
            colors={["#FF6B00"]}
          />
        }
      >
        {/* Header */}
        <View
          style={styles.headerGradient}
          className="px-6 pt-8 pb-6 rounded-b-3xl"
        >
          <Text className="text-white/80 text-base font-medium mb-1">
            Welcome back!
          </Text>
          <Text className="text-white text-3xl font-bold mb-4">
            Ready for Pickup
          </Text>
          <View className="flex-row items-center justify-between">
            <View
              style={styles.badge}
              className="bg-white/20 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-bold text-sm">
                {readyOrders.length} order
                {readyOrders.length !== 1 ? "s" : ""} waiting
              </Text>
            </View>
            <View
              style={styles.badge}
              className={`px-3 py-1.5 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500/30"
                  : "bg-red-500/30"
              }`}
            >
              <Text className="text-white text-xs font-medium">
                {connectionStatus}
              </Text>
            </View>
          </View>
        </View>

        {readyOrders.length === 0 ? (
          <View className="items-center justify-center px-6 mt-20">
            <View
              style={styles.emptyIcon}
              className="bg-orange-100 w-32 h-32 rounded-full items-center justify-center mb-6"
            >
              <Text className="text-6xl">📦</Text>
            </View>
            <Text className="text-gray-800 text-2xl font-bold mb-3 text-center">
              All Clear!
            </Text>
            <Text className="text-gray-600 text-base text-center mb-8 leading-6">
              No orders ready for pickup right now.{"\n"}
              New orders will appear here when they're ready.
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.refreshButton}
              className="px-8 py-4 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                🔄 Refresh Orders
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4 mt-6 space-y-4">
            {readyOrders.map((order) => (
              <View
                key={order.id}
                style={styles.orderCard}
                className="bg-white rounded-3xl overflow-hidden mb-4"
              >
                <View style={styles.orderHeader} className="px-5 py-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-lg font-bold">
                      Order #{order.orderNumber.split("-").pop()}
                    </Text>
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        Ready
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white/90 text-sm mt-1">
                    🕐 Ready at{" "}
                    {formatTime(
                      order.actualReadyTime || order.estimatedReadyTime
                    )}
                  </Text>
                </View>

                <View className="p-5">
                  {/* Driver Verification Code */}
                  <View className="bg-amber-50 p-4 rounded-2xl mb-4 border-2 border-amber-200">
                    <Text className="text-amber-800 text-xs font-semibold mb-1 uppercase tracking-wide">
                      Driver Verification Code
                    </Text>
                    <Text className="text-amber-900 text-3xl font-bold tracking-widest text-center mt-2">
                      {order.driverVerificationCode || "N/A"}
                    </Text>
                  </View>

                  {/* Customer Info */}
                  <View className="mb-4">
                    <Text className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                      Customer
                    </Text>
                    <View className="flex-row items-center">
                      <View
                        style={styles.avatar}
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      >
                        <Text className="text-white font-bold text-lg">
                          {order.user?.firstName?.charAt(0) || "?"}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-base">
                          {order.user?.firstName} {order.user?.lastName}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {order.user?.email}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <View className="mb-4">
                      <Text className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
                        Delivery Address
                      </Text>
                      <View className="bg-gray-50 p-3 rounded-xl">
                        <Text className="text-gray-800 text-sm leading-5">
                          📍 {order.deliveryAddress}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Order Stats */}
                  <View className="flex-row mb-4">
                    <View
                      style={styles.statBox}
                      className="flex-1 bg-orange-50 p-3 rounded-xl mr-2"
                    >
                      <Text className="text-orange-600 text-xs font-semibold mb-1">
                        Items
                      </Text>
                      <Text className="text-orange-800 font-bold text-lg">
                        {getTotalItems(order.orderItems)}
                      </Text>
                    </View>
                    <View
                      style={styles.statBox}
                      className="flex-1 bg-green-50 p-3 rounded-xl ml-2"
                    >
                      <Text className="text-green-600 text-xs font-semibold mb-1">
                        Total
                      </Text>
                      <Text className="text-green-800 font-bold text-lg">
                        R{parseFloat(order.totalAmount).toFixed(0)}
                      </Text>
                    </View>
                  </View>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <Text className="text-yellow-800 text-xs font-semibold mb-2">
                        ⚠️ Special Instructions
                      </Text>
                      <Text className="text-yellow-900 text-sm leading-5">
                        {order.specialInstructions}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8F0",
  },
  loadingCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    backgroundColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    shadowColor: "#FF8A00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  refreshButton: {
    backgroundColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  orderCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  orderHeader: {
    backgroundColor: "#FF6B00",
  },
  avatar: {
    backgroundColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statBox: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default DeliveryDriverHomeScreen;
