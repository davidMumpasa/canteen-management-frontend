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
  Linking,
  Animated,
  StyleSheet,
  TextInput,
} from "react-native";
import { useSocket } from "../../services/socketService";
import AppService from "../../services/AppService";
import DeliveryService from "../../services/DeliveryService";

const ActiveDeliveriesScreen = ({ navigation }) => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [pickupCodeInput, setPickupCodeInput] = useState("");
  const [showPickupCodeModal, setShowPickupCodeModal] = useState(null);

  const { socket, isConnected, on, off } = useSocket();
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const getDriverId = async () => {
    try {
      const userData = await AppService.getUserIdFromToken();
      if (!userData) return null;

      console.log("🔍 Driver data:", userData);

      // For API calls, use driverId (DeliveryDriver table ID)
      return userData.driverId || userData.id;
    } catch (error) {
      console.error("Error getting driver ID:", error);
      return null;
    }
  };

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const currentDriverId = await getDriverId();

      if (!currentDriverId) {
        Alert.alert("Error", "Driver not found. Please log in again.");
        return;
      }

      setDriverId(currentDriverId);
      const response = await DeliveryService.getDriverActiveOrders(
        currentDriverId
      );

      if (response.success && response.data) {
        setActiveOrders(response.data);
        console.log(`🚚 Found ${response.count} active deliveries`);
      } else {
        setActiveOrders([]);
      }
    } catch (error) {
      console.error("❌ Error fetching active orders:", error);
      Alert.alert("Error", "Failed to fetch active deliveries.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = useCallback((data) => {
    console.log("📦 ActiveDeliveries received order update:", data);

    if (data.order) {
      const updatedOrder = data.order;
      console.log(`Order ${updatedOrder.id} status: ${updatedOrder.status}`);

      if (updatedOrder.status === "out_for_delivery") {
        setActiveOrders((prev) => {
          const exists = prev.find((o) => o.id === updatedOrder.id);
          if (!exists) {
            console.log("✅ Adding new active order:", updatedOrder.id);
            return [...prev, updatedOrder];
          }
          console.log("🔄 Updating existing active order:", updatedOrder.id);
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        });
      } else {
        console.log("➖ Removing order from active list:", updatedOrder.id);
        setActiveOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      }
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
  };

  const handleVerifyPickupCode = (order) => {
    setShowPickupCodeModal(order);
    setPickupCodeInput("");
  };

  const verifyAndStartDelivery = async () => {
    const order = showPickupCodeModal;

    if (!pickupCodeInput || pickupCodeInput.trim().length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit pickup code");
      return;
    }

    try {
      setVerifyingOrder(order.id);

      const response = await DeliveryService.verifyPickupCode(
        order.id,
        pickupCodeInput.trim(),
        driverId
      );

      console.log("✅ Verification response:", response);

      if (response && response.success === true) {
        // Order is now verified and ready for delivery
        setShowPickupCodeModal(null);
        setPickupCodeInput("");

        // Refresh the active orders to get updated data
        await fetchActiveOrders();

        Alert.alert(
          "Verified!",
          "Pickup code verified successfully! You can now deliver the order.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Verification Failed",
          response?.error || "Invalid pickup code. Please try again."
        );
      }
    } catch (error) {
      console.error("Error verifying pickup:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to verify pickup code. Please try again."
      );
    } finally {
      setVerifyingOrder(null);
    }
  };

  const handleMarkDelivered = async (order) => {
    Alert.alert(
      "Confirm Delivery",
      `Have you delivered Order #${order.orderNumber} to the customer?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delivered",
          onPress: async () => {
            try {
              setCompletingOrder(order.id);
              const response = await DeliveryService.markOrderDelivered(
                order.id,
                driverId
              );

              if (response && response.success === true) {
                setActiveOrders((prev) =>
                  prev.filter((o) => o.id !== order.id)
                );
                Alert.alert("Success", "Order marked as delivered!");
              } else {
                Alert.alert(
                  "Error",
                  response?.error || "Failed to mark as delivered."
                );
              }
            } catch (error) {
              console.error("Error marking delivered:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to mark order as delivered."
              );
            } finally {
              setCompletingOrder(null);
            }
          },
        },
      ]
    );
  };

  const handleNavigate = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open maps.")
    );
  };

  const handleCallCustomer = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("Error", "Customer phone number not available.");
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  useEffect(() => {
    let mounted = true;

    const initializeSocket = async () => {
      try {
        if (!mounted) return;

        await socket.init();

        if (!mounted) return;

        on("orderStatusChanged", handleOrderUpdate);
        on("orderUpdated", handleOrderUpdate);
        console.log("✅ Socket initialized for ActiveDeliveries");
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      off("orderStatusChanged", handleOrderUpdate);
      off("orderUpdated", handleOrderUpdate);
    };
  }, []); // Empty dependency array

  useEffect(() => {
    fetchActiveOrders();
    const unsubscribe = navigation.addListener("focus", fetchActiveOrders);
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
      <View
        style={stylesActive.gradientBg}
        className="flex-1 justify-center items-center"
      >
        <View
          className="bg-white rounded-3xl p-8 items-center"
          style={stylesActive.loadingCard}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-700 text-lg font-semibold">
            Loading deliveries...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={stylesActive.container}>
      <View style={stylesActive.headerGradient}>
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium mb-1">
                Delivering Now
              </Text>
              <Text className="text-white text-3xl font-bold mb-2">
                Active Deliveries
              </Text>
              <View
                className="bg-white/20 rounded-full px-4 py-2 self-start"
                style={stylesActive.badge}
              >
                <Text className="text-white font-semibold">
                  {activeOrders.length} delivery
                  {activeOrders.length !== 1 ? "ies" : ""} in progress
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      >
        <View className="px-4 pt-6 pb-24">
          {activeOrders.length === 0 ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="items-center justify-center py-16"
            >
              <View
                className="bg-blue-100 rounded-full p-8 mb-6"
                style={stylesActive.emptyIcon}
              >
                <Text className="text-7xl">🚚</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-3">
                No Active Deliveries
              </Text>
              <Text className="text-gray-500 text-center px-8 text-base leading-relaxed mb-8">
                Pick up orders from the Ready tab to start delivering.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ReadyOrders")}
                activeOpacity={0.8}
                style={stylesActive.navigateButton}
                className="px-8 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold text-base">
                  📦 View Ready Orders
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            activeOrders.map((order) => (
              <Animated.View
                key={order.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <View
                  className="bg-white rounded-3xl mb-6 overflow-hidden"
                  style={stylesActive.orderCard}
                >
                  <View style={stylesActive.orderHeader} className="px-6 py-5">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View className="bg-white/20 rounded-full px-3 py-1 mr-2">
                            <Text className="text-white text-xs font-bold uppercase">
                              In Delivery
                            </Text>
                          </View>
                          <Text className="text-white/80 text-sm">
                            #{order.orderNumber}
                          </Text>
                        </View>
                        <Text className="text-white text-2xl font-bold mb-1">
                          Order #{order.orderNumber.split("-").pop()}
                        </Text>
                        <Text className="text-white/90 text-sm">
                          🕐 Picked up at {formatTime(order.pickedUpAt)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="px-6 py-5 border-b border-gray-100">
                    <Text className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-3">
                      Customer
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          style={stylesActive.avatar}
                          className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                        >
                          <Text className="text-white font-bold text-2xl">
                            {order.user?.firstName?.charAt(0) || "?"}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-gray-900 mb-1">
                            {order.user?.firstName} {order.user?.lastName}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {order.user?.phoneNumber || "No phone"}
                          </Text>
                        </View>
                      </View>
                      {order.user?.phoneNumber && (
                        <TouchableOpacity
                          onPress={() =>
                            handleCallCustomer(order.user.phoneNumber)
                          }
                          style={stylesActive.callButton}
                          className="px-4 py-3 rounded-xl"
                        >
                          <Text className="text-white font-bold text-sm">
                            📞 Call
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {order.deliveryAddress && (
                    <View className="px-6 py-5 bg-gray-50">
                      <Text className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-3">
                        Delivery Address
                      </Text>
                      <View className="flex-row items-start mb-4">
                        <View className="bg-blue-100 rounded-xl p-3 mr-3">
                          <Text className="text-xl">📍</Text>
                        </View>
                        <Text className="flex-1 text-base text-gray-900 leading-relaxed">
                          {order.deliveryAddress}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleNavigate(order.deliveryAddress)}
                        style={stylesActive.navigateButton}
                        className="rounded-xl py-3 items-center"
                      >
                        <Text className="text-white font-bold text-sm">
                          🗺️ Navigate to Address
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View className="px-6 py-5 border-t border-gray-100">
                    <View className="flex-row justify-around">
                      <View className="items-center flex-1">
                        <View
                          className="bg-blue-50 rounded-2xl p-4 mb-2"
                          style={stylesActive.statBox}
                        >
                          <Text className="text-3xl font-bold text-blue-600">
                            {getTotalItems(order.orderItems)}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">
                          Items
                        </Text>
                      </View>
                      <View className="w-px bg-gray-200" />
                      <View className="items-center flex-1">
                        <View
                          className="bg-green-50 rounded-2xl p-4 mb-2"
                          style={stylesActive.statBox}
                        >
                          <Text className="text-3xl font-bold text-green-600">
                            R{parseFloat(order.totalAmount).toFixed(0)}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-500 font-medium">
                          Total
                        </Text>
                      </View>
                    </View>
                  </View>

                  {order.specialInstructions && (
                    <View className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
                      <View className="flex-row items-start">
                        <View className="bg-yellow-200 rounded-full p-2 mr-3">
                          <Text className="text-base">⚠️</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-yellow-700 uppercase font-bold mb-1">
                            Special Instructions
                          </Text>
                          <Text className="text-sm text-gray-900">
                            {order.specialInstructions}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Verify Pickup Code Section */}
                  <View className="px-6 py-5 bg-orange-50 border-t border-orange-200">
                    <View className="items-center mb-4">
                      <View className="bg-orange-100 rounded-full p-4 mb-3">
                        <Text className="text-4xl">🔐</Text>
                      </View>
                      <Text className="text-base font-bold text-gray-900 mb-2">
                        Verification Required
                      </Text>
                      <Text className="text-sm text-gray-600 text-center px-4">
                        Ask the customer for their 6-digit pickup code to verify
                        this order
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleVerifyPickupCode(order)}
                      activeOpacity={0.8}
                      disabled={verifyingOrder === order.id}
                      style={[
                        stylesActive.verifyCodeButton,
                        verifyingOrder === order.id &&
                          stylesActive.verifyCodeButtonDisabled,
                      ]}
                      className="rounded-2xl py-4 items-center"
                    >
                      {verifyingOrder === order.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-base">
                          🔐 Verify Pickup Code
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Pickup Code Verification Modal */}
      {showPickupCodeModal && (
        <View style={stylesActive.modalOverlay}>
          <View
            style={stylesActive.modalContent}
            className="bg-white rounded-3xl p-6 mx-4"
          >
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Verify Pickup Code
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Order #{showPickupCodeModal.orderNumber.split("-").pop()}
            </Text>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Enter 6-Digit Pickup Code
              </Text>
              <TextInput
                style={stylesActive.codeInput}
                className="bg-gray-50 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                value={pickupCodeInput}
                onChangeText={setPickupCodeInput}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowPickupCodeModal(null);
                  setPickupCodeInput("");
                }}
                style={stylesActive.cancelButton}
                className="flex-1 py-4 rounded-2xl"
                disabled={verifyingOrder !== null}
              >
                <Text className="text-gray-700 font-bold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={verifyAndStartDelivery}
                style={[
                  stylesActive.verifyButton,
                  verifyingOrder !== null && stylesActive.verifyButtonDisabled,
                ]}
                className="flex-1 py-4 rounded-2xl"
                disabled={verifyingOrder !== null}
              >
                {verifyingOrder !== null ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-center text-base">
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const stylesActive = StyleSheet.create({
  container: { backgroundColor: "#EFF6FF" },
  gradientBg: { backgroundColor: "#3B82F6" },
  loadingCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
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
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  navigateButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
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
  orderHeader: { backgroundColor: "#3B82F6" },
  avatar: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  callButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
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
  verifyCodeButton: {
    backgroundColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyCodeButtonDisabled: {
    backgroundColor: "#FFA500",
    opacity: 0.7,
  },
  deliveredButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  deliveredButtonDisabled: { backgroundColor: "#86EFAC", opacity: 0.7 },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    width: "90%",
    maxWidth: 400,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: "#93C5FD",
    opacity: 0.7,
  },
});

export default ActiveDeliveriesScreen;
