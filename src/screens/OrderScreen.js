// OrderScreen.js - Main Component
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, ScrollView, Alert, View } from "react-native";
import { useSocket } from "../services/socketService";
import AppService from "../services/AppService";
import { ReviewModal } from "../components/ReviewComponents";

// Import sub-components
import OrderHeader from "../components/order/OrderHeader";
import OrderProgress from "../components/order/OrderProgress";
import OrderStatusSteps from "../components/order/OrderStatusSteps";
import PickupDetailsCard from "../components/order/PickupDetailsCard";
import OrderSummaryCard from "../components/order/OrderSummaryCard";
import OrderActionButtons from "../components/order/OrderActionButtons";
import NoActiveOrders from "../components/order/NoActiveOrders";
import LoadingScreen from "../components/order/LoadingScreen";
import OrderCompletionModal from "../components/order/OrderCompletionModal";

const OrderScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
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
      return userData?.id || null;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  const getStatusStep = (status) => {
    const statusMap = {
      pending: 0,
      confirmed: 1,
      paid: 1,
      preparing: 2,
      ready: 3,
      completed: 4,
      delivered: 4,
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const handleOrderUpdate = useCallback(
    (data) => {
      console.log("🔄 Received order update:", data);

      if (data.order && order && data.order.id === order.id) {
        const updatedOrder = data.order;

        // Handle completed orders - show review modal but keep order visible
        if (updatedOrder.status === "completed") {
          setCompletedOrderForReview({ ...order, status: "completed" });
          setShowReviewModal(true);
          // DON'T clear the order yet - let user finish reviewing first
          return;
        }

        // Handle cancelled orders
        if (updatedOrder.status === "cancelled") {
          Alert.alert("Order Cancelled", "Your order has been cancelled.", [
            {
              text: "OK",
              onPress: () => {
                setOrder(null);
                navigation.navigate("Home", {
                  screen: "HomeMain",
                });
              },
            },
          ]);
          return;
        }

        // For other status updates, update the active order
        setOrder(updatedOrder);
        setCurrentStep(getStatusStep(updatedOrder.status));
      }
    },
    [order, navigation]
  );

  // Fetch active orders for user
  const fetchActiveOrder = async () => {
    try {
      setLoading(true);

      const currentUserId = await getUserId();
      if (!currentUserId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      setUserId(currentUserId);

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
          const activeOrder = activeOrders[0];
          console.log(
            "📦 Found active order:",
            activeOrder.id,
            "Status:",
            activeOrder.status
          );
          setOrder(activeOrder);
          setCurrentStep(getStatusStep(activeOrder.status));

          if (isConnected) {
            joinOrderRoom(activeOrder.id);
            console.log("🏠 Joined order room:", activeOrder.id);
          }
        } else {
          console.log("📭 No active orders found");
          setOrder(null);
        }
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error("❌ Error fetching active order:", error.message);

      if (error.response?.status === 404) {
        setOrder(null);
      } else {
        Alert.alert(
          "Error",
          "Failed to fetch order details. Please try again.",
          [
            { text: "Retry", onPress: () => fetchActiveOrder() },
            { text: "Go Back", onPress: () => navigation.goBack() },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize socket and listeners
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        console.log("🔌 Initializing socket connection...");
        await socket.init();

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
      return () => leaveOrderRoom(order.id);
    }
  }, [order?.id]);

  // Fetch order on component mount and when screen comes into focus
  useEffect(() => {
    fetchActiveOrder();

    // Add focus listener to refresh when navigating back
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔄 Screen focused, refreshing order...");
      fetchActiveOrder();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = async () => {
    await fetchActiveOrder();
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setCompletedOrderForReview(null);
    // Clear the completed order from state after modal closes
    setOrder(null);
    setCurrentStep(0);
  };

  const handleContinueShopping = () => {
    handleReviewModalClose();
    // Navigate to Home screen
    navigation.navigate("Home", {
      screen: "HomeMain",
    });
  };

  const handleViewOrders = () => {
    handleReviewModalClose();
    // Navigate to MyOrders screen
    navigation.navigate("Orders", {
      screen: "MyOrders",
    });
  };

  const handleItemReviewPress = (item) => {
    console.log("Item clicked:", item);
    if (item.product) {
      setSelectedItemForReview({
        ...item.product,
        orderId: completedOrderForReview.id,
        productId: item.productId,
      });
      setShowItemReviewModal(true);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!order) {
    return <NoActiveOrders navigation={navigation} onRefresh={handleRefresh} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <OrderHeader
          connectionStatus={connectionStatus}
          order={order}
          navigation={navigation}
          onRefresh={handleRefresh}
        />

        <OrderProgress currentStep={currentStep} />

        <OrderStatusSteps order={order} currentStep={currentStep} />

        <PickupDetailsCard order={order} />

        <OrderSummaryCard order={order} />

        <OrderActionButtons />

        <View className="h-24" />
      </ScrollView>

      {/* Order Completion Modal */}
      {showReviewModal && completedOrderForReview && (
        <OrderCompletionModal
          order={completedOrderForReview}
          onContinueShopping={handleContinueShopping}
          onViewOrders={handleViewOrders}
          onItemPress={handleItemReviewPress}
        />
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
