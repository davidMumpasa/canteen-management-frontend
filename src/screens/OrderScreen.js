import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config";
import axios from "axios";
import { useSocket } from "../services/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppService from "../services/AppService";
import { ReviewModal } from "../components/ReviewComponents";

const OrderScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [userId, setUserId] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [completedOrderForReview, setCompletedOrderForReview] = useState(null);

  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [showItemReviewModal, setShowItemReviewModal] = useState(false);

  const { socket, isConnected, joinOrderRoom, leaveOrderRoom, on, off } =
    useSocket();

  // Get user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const userData = await AppService.getUserIdFromToken();
      if (userData) {
        return userData.id;
      }
      return null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  const handleOrderUpdate = useCallback(
    (data) => {
      console.log("🔄 Received order update:", data);

      if (data.order && order && data.order.id === order.id) {
        const updatedOrder = data.order;

        // Handle completed orders - show review modal
        if (updatedOrder.status === "completed") {
          setCompletedOrderForReview(updatedOrder);
          setShowReviewModal(true);

          return;
        }

        // Handle cancelled orders
        if (updatedOrder.status === "cancelled") {
          Alert.alert("Order Cancelled", "Your order has been cancelled.", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Main", { screen: "Home" }),
            },
          ]);
          return;
        }

        setOrder(updatedOrder);
        setCurrentStep(getStatusStep(updatedOrder.status));
      }
    },
    [order, navigation]
  );

  // Initialize socket connection and listeners
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log("🔌 Initializing socket connection...");
        await socket.init();

        // Set up order update listeners
        on("orderStatusChanged", handleOrderUpdate);
        on("orderCreated", handleOrderUpdate);
        on("orderUpdated", handleOrderUpdate); // Additional listener for order updates

        setConnectionStatus(isConnected ? "connected" : "disconnected");
        console.log("✅ Socket initialized and listeners set up");
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        setConnectionStatus("error");
      }
    };

    initializeSocket();

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up socket listeners...");
      off("orderStatusChanged", handleOrderUpdate);
      off("orderCreated", handleOrderUpdate);
      off("orderUpdated", handleOrderUpdate);
      if (order?.id) {
        leaveOrderRoom(order.id);
      }
    };
  }, [handleOrderUpdate]);

  // Update connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  // Join order room when order is found
  useEffect(() => {
    if (order?.id) {
      joinOrderRoom(order.id);

      return () => {
        leaveOrderRoom(order.id);
      };
    }
  }, [order?.id]);

  // Fetch active orders for user
  const fetchActiveOrder = async () => {
    try {
      setLoading(true);

      const currentUserId = await getUserId();
      if (!currentUserId) {
        Alert.alert("Error", "User not found. Please log in again.", [
          {
            text: "OK",
          },
        ]);
        return;
      }

      setUserId(currentUserId);

      // Use AppService to make authenticated request to get user orders
      const response = await AppService.get(
        `/orders/getUserOderById/${currentUserId}`
      );

      if (response.success && response.data) {
        const userOrders = response.data;

        // Filter orders to find active ones (not completed or cancelled)
        const activeOrders = userOrders.filter(
          (order) =>
            order.status !== "completed" && order.status !== "cancelled"
        );

        if (activeOrders.length > 0) {
          // Get the most recent active order (orders are sorted by createdAt DESC)
          const activeOrder = activeOrders[0];
          console.log(
            "📦 Found active order:",
            activeOrder.id,
            "Status:",
            activeOrder.status
          );
          setOrder(activeOrder);
          setCurrentStep(getStatusStep(activeOrder.status));

          // Join the order room for real-time updates
          if (isConnected) {
            joinOrderRoom(activeOrder.id);
            console.log("🏠 Joined order room:", activeOrder.id);
          }
        } else {
          // No active orders found
          console.log("📭 No active orders found");
          setOrder(null);
        }
      } else {
        // No orders found for user or API error
        setOrder(null);
      }
    } catch (error) {
      console.error("❌ Error fetching active order:", error.message);

      // Handle different error scenarios
      if (error.response?.status === 404) {
        // No orders found - this is normal, just set order to null
        setOrder(null);
      } else {
        // Other errors - show retry option
        Alert.alert(
          "Error",
          "Failed to fetch order details. Please try again.",
          [
            {
              text: "Retry",
              onPress: () => fetchActiveOrder(),
            },
            {
              text: "Go Back",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const statusMap = {
      pending: 0,
      confirmed: 1,
      paid: 1,
      preparing: 2,
      ready: 3,
      // completed orders are filtered out, but just in case
      completed: 4,
      delivered: 4,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEstimatedTime = (readyTime) => {
    const now = new Date();
    const ready = new Date(readyTime);
    const diff = Math.max(0, Math.ceil((ready - now) / (1000 * 60)));
    return diff > 0 ? `${diff} minutes` : "Ready now";
  };

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchActiveOrder();
  };

  const statusSteps = [
    {
      label: "Order Placed",
      icon: "checkmark-circle",
      description: "Order confirmed",
      time: order ? formatTime(order.createdAt) : "",
    },
    {
      label: "Payment Verified",
      icon: "card",
      description: "Payment successful",
      time: order ? formatTime(order.createdAt) : "",
    },
    {
      label: "Preparing",
      icon: "restaurant",
      description: "Chef is cooking",
      time: "Now",
    },
    {
      label: "Ready for Pickup",
      icon: "bag-handle",
      description: "Come collect",
      time: order ? `~${formatTime(order.estimatedReadyTime)}` : "",
    },
  ];

  // Fetch order on component mount
  useEffect(() => {
    fetchActiveOrder();
  }, []);

  useEffect(() => {
    // Pulse animation for active step
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / statusSteps.length,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    return () => pulse.stop();
  }, [currentStep]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#667eea" />
        <Text className="mt-4 text-gray-600">Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View className="absolute top-12 left-5">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>

          <View className="items-center max-w-sm">
            {/* Icon */}
            <View className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full justify-center items-center mb-8 shadow-lg">
              <Ionicons name="restaurant-outline" size={64} color="#667eea" />
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              No Active Orders
            </Text>

            {/* Description */}
            <Text className="text-base text-gray-600 text-center leading-relaxed mb-8">
              You don't have any active orders at the moment. Ready to satisfy
              your cravings? Browse our delicious menu and place your next
              order!
            </Text>

            {/* Action Buttons */}
            <View className="w-full space-y-3">
              <TouchableOpacity
                onPress={() => navigation.navigate("Main", { screen: "Home" })}
                className="w-full bg-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md"
              >
                <Ionicons name="restaurant" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Browse Menu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Main", { screen: "Orders" })
                }
                className="w-full bg-white border-2 border-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md"
              >
                <Ionicons name="receipt" size={20} color="#667eea" />
                <Text className="text-indigo-600 font-bold text-lg ml-2">
                  View Order History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRefresh}
                className="w-full bg-gray-100 py-3 px-6 rounded-2xl flex-row justify-center items-center"
              >
                <Ionicons name="refresh" size={18} color="#6B7280" />
                <Text className="text-gray-600 font-semibold ml-2">
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>

            {/* Additional Help Text */}
            <View className="mt-8 p-4 bg-blue-50 rounded-2xl w-full">
              <View className="flex-row items-start">
                <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-blue-900 mb-1">
                    Quick Tip
                  </Text>
                  <Text className="text-sm text-blue-700 leading-relaxed">
                    Once you place an order, you can track its progress in
                    real-time right here. Get notified when it's ready for
                    pickup!
                  </Text>
                </View>
              </View>
            </View>

            {/* Fun motivational message */}
            <View className="mt-4 p-4 bg-orange-50 rounded-2xl w-full">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-3">🍽️</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-orange-900 mb-1">
                    Hungry? We've Got You Covered!
                  </Text>
                  <Text className="text-sm text-orange-700 leading-relaxed">
                    From quick snacks to hearty meals, our kitchen is ready to
                    serve you something delicious.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Connection Status Indicator */}
        <View className="px-5 pt-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <Text className="text-xs text-gray-600">
                {connectionStatus === "connected"
                  ? "Live Updates Active"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Offline Mode"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRefresh}>
              <Ionicons name="refresh" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Section */}
        <View
          className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-5 pb-8 rounded-b-3xl"
          style={{ backgroundColor: "#667eea" }}
        >
          <View className="px-5">
            <View className="flex-row justify-between items-center mb-5">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-3xl font-bold text-white">
                Order Tracking
              </Text>
              <View className="bg-white/20 px-3 py-2 rounded-2xl">
                <Text className="text-white font-semibold text-sm">
                  #{order.orderNumber?.split("-")[1]?.slice(-4) || order.id}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <View className="flex-row items-center bg-white/15 px-4 py-3 rounded-2xl mb-2">
                <View className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                <Text className="text-white font-semibold text-base">
                  {order.status === "preparing"
                    ? "Preparing Your Order"
                    : order.status === "ready"
                    ? "Ready for Pickup"
                    : order.status === "pending"
                    ? "Order Received"
                    : order.status === "confirmed"
                    ? "Order Confirmed"
                    : order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                </Text>
              </View>
              <Text className="text-white/90 text-base font-medium">
                🕐 Ready in {getEstimatedTime(order.estimatedReadyTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View className="px-5 -mt-4 mb-5">
          <View className="h-1 bg-white rounded-full shadow-sm overflow-hidden">
            <View className="absolute inset-0 bg-gray-200 rounded-full" />
            <Animated.View
              className="h-full bg-indigo-600 rounded-full"
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        </View>

        {/* Status Steps */}
        <View className="px-5 mb-5">
          {statusSteps.map((step, index) => (
            <View key={index} className="mb-1">
              <View className="flex-row items-start">
                <View className="items-center mr-4">
                  <Animated.View
                    style={[
                      {
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        backgroundColor:
                          index <= currentStep ? "#667eea" : "#f5f6fa",
                        borderColor:
                          index <= currentStep ? "#667eea" : "#e0e0e0",
                        shadowColor: "#667eea",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                      index === currentStep && {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={24}
                      color={index <= currentStep ? "white" : "#999"}
                    />
                  </Animated.View>
                  {index < statusSteps.length - 1 && (
                    <View
                      className="w-0.5 h-10 mt-1"
                      style={{
                        backgroundColor:
                          index < currentStep ? "#667eea" : "#e0e0e0",
                      }}
                    />
                  )}
                </View>

                <View className="flex-1 pt-2">
                  <Text
                    className="text-base font-semibold mb-1"
                    style={{ color: index <= currentStep ? "#333" : "#999" }}
                  >
                    {step.label}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    {step.description}
                  </Text>
                  <Text className="text-gray-400 text-xs">{step.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pickup Details Card */}
        <View className="mx-5 mb-5 bg-white rounded-3xl shadow-lg overflow-hidden">
          <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl justify-center items-center mr-3">
              <Ionicons name="location" size={24} color="#667eea" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Pickup Information
            </Text>
          </View>

          <View className="p-5">
            <View className="space-y-3">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 flex-1">Location</Text>
                <Text className="font-semibold text-gray-900 flex-2 text-right">
                  Main Campus Canteen
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 flex-1">Counter</Text>
                <Text className="font-semibold text-gray-900 flex-2 text-right">
                  Express Pickup - Counter 3
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 flex-1">Prepared by</Text>
                <Text className="font-semibold text-gray-900 flex-2 text-right">
                  👨‍🍳 Chef Mario
                </Text>
              </View>
            </View>

            <View className="items-center mt-6">
              <Text className="text-gray-600 mb-3">Your Pickup Code</Text>
              <View className="bg-indigo-600 px-6 py-4 rounded-2xl shadow-lg">
                <Text className="text-white font-bold text-4xl tracking-widest">
                  {order.pickupCode}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mt-4 p-4 bg-red-50 rounded-2xl">
              <Ionicons name="bulb" size={20} color="#ff6b6b" />
              <Text className="text-gray-700 text-sm ml-3 flex-1 leading-5">
                Show this code at the pickup counter to collect your order
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary Card */}
        <View className="mx-5 mb-5 bg-white rounded-3xl shadow-lg overflow-hidden">
          <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl justify-center items-center mr-3">
              <Ionicons name="receipt" size={24} color="#667eea" />
            </View>
            <Text className="text-lg font-bold text-gray-900">
              Order Summary
            </Text>
          </View>

          <View className="p-5">
            {order.orderItems?.map((item, index) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center mb-4"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{item.product.image}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-base">
                      {item.product.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      Qty: {item.quantity}
                    </Text>
                    {item.specialRequests && (
                      <Text className="text-gray-500 text-xs italic">
                        {item.specialRequests}
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="font-bold text-gray-900">
                  ${parseFloat(item.totalPrice).toFixed(2)}
                </Text>
              </View>
            ))}

            {parseFloat(order.discount || 0) > 0 && (
              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <Text className="text-green-600">Discount</Text>
                <Text className="font-semibold text-green-600">
                  -${parseFloat(order.discount).toFixed(2)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <Text className="text-lg font-bold text-gray-900">
                Total Amount
              </Text>
              <Text className="text-xl font-bold text-indigo-600">
                ${parseFloat(order.totalAmount).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-5 pb-8 space-x-4">
          <TouchableOpacity className="flex-1 bg-white border-2 border-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md mr-2">
            <Ionicons name="call" size={20} color="#667eea" />
            <Text className="text-indigo-600 font-bold ml-2">
              Contact Canteen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md ml-2">
            <Ionicons name="navigate" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Get Directions</Text>
          </TouchableOpacity>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Review Completion Modal */}
      {showReviewModal && completedOrderForReview && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-5 z-50">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Order Completed! 🎉
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Your order has been completed successfully. How was your
                experience?
              </Text>
            </View>

            {/* Order Items for Review */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Rate Your Items:
              </Text>
              <ScrollView className="max-h-60">
                {completedOrderForReview.orderItems?.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      console.log("Item clicked:", item);
                      setSelectedItemForReview({
                        ...item.product,
                        orderId: completedOrderForReview.id,
                        productId: item.productId,
                      });
                      setShowItemReviewModal(true);
                    }}
                    className="flex-row items-center bg-gray-50 rounded-2xl p-3 mb-2"
                  >
                    <Text className="text-3xl mr-3">{item.product.image}</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {item.product.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        Tap to review
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#667eea"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => {
                  setShowReviewModal(false);
                  navigation.navigate("Main", { screen: "Home" });
                }}
                className="bg-indigo-600 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Continue Shopping
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowReviewModal(false);
                  navigation.navigate("Main", { screen: "Orders" });
                }}
                className="bg-white border-2 border-indigo-600 py-4 rounded-2xl items-center"
              >
                <Text className="text-indigo-600 font-bold text-lg">
                  View Orders
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Review Modal Component */}
      {selectedItemForReview && (
        <ReviewModal
          visible={showItemReviewModal}
          onClose={() => {
            setShowItemReviewModal(false);
            setSelectedItemForReview(null);
          }}
          userId={userId}
          menuItemId={selectedItemForReview.id}
          orderId={selectedItemForReview.orderId}
          productId={selectedItemForReview.productId}
          onReviewSubmitted={() => {
            setShowItemReviewModal(false);
            setSelectedItemForReview(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;
