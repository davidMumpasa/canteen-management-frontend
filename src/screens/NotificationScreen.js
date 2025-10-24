// NotificationScreen.js - React Native Expo with NativeWind
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  CreditCard,
  ShoppingBag,
  Gift,
  Info,
  AlertTriangle,
  RefreshCw,
  IdCard,
} from "lucide-react-native";
import { BASE_URL } from "../../config";
import AppService from "../services/AppService";

const getUserIdFromToken = async () => {
  try {
    const sessionUser = await AppService.getUserIdFromToken();
    if (!sessionUser?.id) {
      Alert.alert("Error", "User not found");
      return null;
    }
    const userId = sessionUser.id;
    return userId;
  } catch (err) {
    console.error("❌ Error decoding token:", err);
    return null;
  }
};

// API Service
const notificationAPI = {
  getUserNotifications: async (
    userId,
    page = 1,
    unreadOnly = false,
    type = null
  ) => {
    try {
      let url = `${BASE_URL}/notifications/user/${userId}?page=${page}&limit=20`;
      if (unreadOnly) url += "&unreadOnly=true";
      if (type) url += `&type=${type}`;

      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Return mock data for demo
      return {
        success: true,
        data: {
          notifications: generateMockNotifications(userId),
          pagination: { total: 10, page: 1, limit: 20, totalPages: 1 },
        },
      };
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/user/${userId}/unread-count`
      );
      const data = await response.json();
      return data.data.unreadCount;
    } catch (error) {
      return 3; // Mock count
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      return await response.json();
    } catch (error) {
      return { success: true };
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/user/${userId}/read-all`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      return await response.json();
    } catch (error) {
      return { success: true };
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } catch (error) {
      return { success: true };
    }
  },

  deleteAllRead: async (userId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/user/${userId}/read`,
        {
          method: "DELETE",
        }
      );
      return await response.json();
    } catch (error) {
      return { success: true };
    }
  },
};

// Mock data generator
const generateMockNotifications = (userId) => [
  {
    id: "1",
    userId: userId,
    title: "Order Confirmed ✅",
    message: "Your order #12345 has been confirmed and is being prepared.",
    type: "order",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    actionUrl: "/orders/12345",
  },
  {
    id: "2",
    userId: userId,
    title: "Payment Successful ✅",
    message: "Your payment of R250.00 has been processed successfully.",
    type: "success",
    priority: "high",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    actionUrl: "/payments/789",
  },
  {
    id: "3",
    userId: userId,
    title: "Special Offer! 🎁",
    message: "Get 20% off on your next order. Use code: SAVE20",
    type: "promotion",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    actionUrl: "/promotions/SAVE20",
  },
  {
    id: "4",
    userId: userId,
    title: "Order Out for Delivery 🚚",
    message: "Your order #12344 is on its way to you.",
    type: "order",
    priority: "urgent",
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    actionUrl: "/orders/12344",
  },
  {
    id: "5",
    userId: userId,
    title: "Wallet Credited 💵",
    message: "R150.00 has been added to your wallet. New balance: R500.00",
    type: "success",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: "/wallet",
  },
];

// Notification Icon Component
const NotificationIcon = ({ type, priority }) => {
  const iconProps = { size: 20, strokeWidth: 2 };

  const getIconConfig = () => {
    switch (type) {
      case "order":
        return { Icon: ShoppingBag, color: "#2563eb", bg: "#dbeafe" };
      case "payment":
        return { Icon: CreditCard, color: "#16a34a", bg: "#dcfce7" };
      case "success":
        return { Icon: Check, color: "#16a34a", bg: "#dcfce7" };
      case "error":
        return { Icon: AlertCircle, color: "#dc2626", bg: "#fee2e2" };
      case "warning":
        return { Icon: AlertTriangle, color: "#d97706", bg: "#fef3c7" };
      case "promotion":
        return { Icon: Gift, color: "#9333ea", bg: "#f3e8ff" };
      default:
        return { Icon: Info, color: "#6b7280", bg: "#f3f4f6" };
    }
  };

  const { Icon, color, bg } = getIconConfig();

  return (
    <View className="p-3 rounded-full" style={{ backgroundColor: bg }}>
      <Icon {...iconProps} color={color} />
    </View>
  );
};

// Individual Notification Card
const NotificationCard = ({ notification, onPress, onDelete, onMarkRead }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [swipeAnim] = useState(new Animated.Value(0));

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(swipeAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDelete(notification.id));
  };

  const getPriorityBorderColor = () => {
    switch (notification.priority) {
      case "urgent":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#3b82f6";
      default:
        return "#d1d5db";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: swipeAnim }],
      }}
      className="mb-3"
    >
      <TouchableOpacity
        onPress={() => {
          if (!notification.isRead) {
            onMarkRead(notification.id);
          }
          onPress(notification);
        }}
        activeOpacity={0.7}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: getPriorityBorderColor(),
        }}
      >
        <View className={`p-4 ${!notification.isRead ? "bg-blue-50/30" : ""}`}>
          <View className="flex-row items-start">
            <NotificationIcon
              type={notification.type}
              priority={notification.priority}
            />

            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className="text-base font-bold text-gray-900 flex-1"
                  numberOfLines={1}
                >
                  {notification.title}
                </Text>
                {!notification.isRead && (
                  <View className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                )}
              </View>

              <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                {notification.message}
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-400">
                  {formatTime(notification.createdAt)}
                </Text>

                <View className="flex-row gap-2">
                  {!notification.isRead && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e?.stopPropagation?.();
                        onMarkRead(notification.id);
                      }}
                      className="bg-blue-500 px-3 py-1 rounded-full"
                    >
                      <Text className="text-xs text-white font-medium">
                        Mark Read
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      handleDelete();
                    }}
                    className="bg-red-500 px-3 py-1 rounded-full flex-row items-center justify-center"
                    style={{ width: 28, height: 24 }}
                  >
                    <Trash2 size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Notification Screen
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch userId on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const fetchNotifications = async (isRefresh = false) => {
    if (!userId) return; // Don't fetch if userId is not available yet

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const unreadOnly = filter === "unread";
      const type = ["order", "payment", "promotion"].includes(filter)
        ? filter
        : null;

      const response = await notificationAPI.getUserNotifications(
        userId,
        1,
        unreadOnly,
        type
      );

      if (response.success) {
        setNotifications(response.data.notifications);
        const count = await notificationAPI.getUnreadCount(userId);
        setUnreadCount(count);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [filter, userId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      Alert.alert("Error", "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    console.log("===========================");
    console.log("Notification User ID: ", userId);
    console.log("===========================");
    try {
      await notificationAPI.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  const handleDeleteAllRead = async () => {
    if (!userId) return;
    Alert.alert(
      "Delete Read Notifications",
      "Are you sure you want to delete all read notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationAPI.deleteAllRead(userId);
              setNotifications((prev) => prev.filter((n) => !n.isRead));
              Alert.alert("Success", "Read notifications deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete notifications");
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const filters = [
    { key: "all", label: "All", icon: Bell },
    { key: "unread", label: "Unread", icon: BellRing },
    { key: "order", label: "Orders", icon: ShoppingBag },
    { key: "payment", label: "Payments", icon: CreditCard },
    { key: "promotion", label: "Offers", icon: Gift },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="bg-blue-500 p-2 rounded-xl">
                <BellRing size={28} color="white" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <Text className="text-sm text-gray-500">
                    {unreadCount} unread
                  </Text>
                )}
              </View>
            </View>

            {notifications.length > 0 && (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => fetchNotifications(true)}
                  disabled={refreshing}
                  className="bg-gray-100 p-2 rounded-lg"
                >
                  <RefreshCw
                    size={18}
                    color="#374151"
                    style={{
                      transform: [{ rotate: refreshing ? "360deg" : "0deg" }],
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMarkAllAsRead}
                  className="bg-blue-500 p-2 rounded-lg"
                >
                  <CheckCheck size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAllRead}
                  className="bg-red-500 p-2 rounded-lg"
                >
                  <Trash2 size={18} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((f) => {
              const FilterIcon = f.icon;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  className={`flex-row items-center gap-2 px-4 py-2 rounded-full ${
                    filter === f.key
                      ? "bg-blue-500"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <FilterIcon
                    size={16}
                    color={filter === f.key ? "white" : "#374151"}
                  />
                  <Text
                    className={`font-medium ${
                      filter === f.key ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-4">Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-100 p-8 rounded-full mb-6">
            <Bell size={64} color="#d1d5db" />
          </View>
          <Text className="text-2xl font-semibold text-gray-400 mb-2">
            No Notifications
          </Text>
          <Text className="text-gray-400 text-center">
            You're all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor="#3b82f6"
            />
          }
        >
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={handleNotificationPress}
              onDelete={handleDelete}
              onMarkRead={handleMarkAsRead}
            />
          ))}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Modal for Notification Details */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowModal(false)}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <View className="p-6">
              {selectedNotification && (
                <>
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-row items-start gap-3 flex-1">
                      <NotificationIcon
                        type={selectedNotification.type}
                        priority={selectedNotification.priority}
                      />
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900 mb-1">
                          {selectedNotification.title}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {new Date(
                            selectedNotification.createdAt
                          ).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                      <X size={24} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-700 mb-6 leading-6">
                    {selectedNotification.message}
                  </Text>

                  <View className="flex-row gap-3">
                    {selectedNotification.actionUrl && (
                      <TouchableOpacity
                        onPress={() => {
                          console.log(
                            "Navigate to:",
                            selectedNotification.actionUrl
                          );
                          setShowModal(false);
                        }}
                        className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
                      >
                        <Text className="text-white font-medium">
                          View Details
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => setShowModal(false)}
                      className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                    >
                      <Text className="text-gray-700 font-medium">Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Unread Badge */}
      {unreadCount > 0 && (
        <View className="absolute bottom-6 right-6 bg-red-500 rounded-full shadow-lg px-4 py-2 flex-row items-center gap-2">
          <Bell size={20} color="white" />
          <Text className="text-white font-bold">{unreadCount} New</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
