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
} from "lucide-react-native";
import { BASE_URL } from "../../config";
import AppService from "../services/AppService";

// ✅ Get userId from token
const getUserIdFromToken = async () => {
  try {
    const sessionUser = await AppService.getUserIdFromToken();
    if (!sessionUser?.id) {
      Alert.alert("Error", "User not found");
      return null;
    }
    return sessionUser.id;
  } catch (err) {
    console.error("❌ Error decoding token:", err);
    return null;
  }
};

// ✅ FIXED API Service - All methods now use correct HTTP verbs and endpoints
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

      console.log("📥 Fetching notifications:", url);
      const response = await fetch(url);
      const data = await response.json();

      console.log("📥 Notifications response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      throw error;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const url = `${BASE_URL}/notifications/user/${userId}/unread-count`;
      console.log("📊 Fetching unread count:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("📊 Unread count response:", data);

      // ✅ Handle the correct response format: { success: true, count: 5 }
      if (data.success && typeof data.count === "number") {
        return data.count;
      }

      return 0;
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
      return 0;
    }
  },

  // ✅ FIXED: Changed from PATCH to PUT
  markAsRead: async (notificationId, userId) => {
    try {
      const url = `${BASE_URL}/notifications/${notificationId}/read`;
      console.log("✅ Marking as read:", url);

      const response = await fetch(url, {
        method: "PUT", // ✅ Changed from PATCH to PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ✅ Send userId for verification
      });

      const data = await response.json();
      console.log("✅ Mark as read response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error marking as read:", error);
      throw error;
    }
  },

  // ✅ FIXED: Changed from PATCH to PUT and fixed endpoint
  markAllAsRead: async (userId) => {
    try {
      const url = `${BASE_URL}/notifications/user/${userId}/mark-all-read`;
      console.log("✅ Marking all as read:", url);

      const response = await fetch(url, {
        method: "PUT", // ✅ Changed from PATCH to PUT
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("✅ Mark all as read response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
      throw error;
    }
  },

  deleteNotification: async (notificationId, userId) => {
    try {
      const url = `${BASE_URL}/notifications/${notificationId}`;
      console.log("🗑️ Deleting notification:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // ✅ Send userId for verification
      });

      const data = await response.json();
      console.log("🗑️ Delete response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
      throw error;
    }
  },

  deleteAllRead: async (userId) => {
    try {
      const url = `${BASE_URL}/notifications/user/${userId}/read`;
      console.log("🗑️ Deleting all read:", url);

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log("🗑️ Delete all read response:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting all read:", error);
      throw error;
    }
  },
};

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
const NotificationCard = ({
  notification,
  onPress,
  onDelete,
  onMarkRead,
  userId,
}) => {
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

  // ✅ Fetch userId on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      console.log("👤 User ID loaded:", id);
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // ✅ Fetch notifications with proper error handling
  const fetchNotifications = async (isRefresh = false) => {
    if (!userId) {
      console.log("⏳ Waiting for userId...");
      return;
    }

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
        // ✅ Handle the nested data structure
        const notifArray = response.data?.notifications || [];
        setNotifications(notifArray);

        // ✅ Fetch unread count separately
        const count = await notificationAPI.getUnreadCount(userId);
        setUnreadCount(count);

        console.log("✅ Loaded notifications:", notifArray.length);
        console.log("✅ Unread count:", count);
      }
    } catch (error) {
      console.error("❌ Error in fetchNotifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Fetch notifications when userId or filter changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [filter, userId]);

  // ✅ Mark notification as read with userId
  const handleMarkAsRead = async (notificationId) => {
    if (!userId) return;

    try {
      const response = await notificationAPI.markAsRead(notificationId, userId);

      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        console.log("✅ Notification marked as read:", notificationId);
      }
    } catch (error) {
      console.error("❌ Error marking as read:", error);
      Alert.alert("Error", "Failed to mark as read");
    }
  };

  // ✅ Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    console.log("===========================");
    console.log("📝 Marking all as read for user:", userId);
    console.log("===========================");

    try {
      const response = await notificationAPI.markAllAsRead(userId);

      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        Alert.alert("Success", "All notifications marked as read");
        console.log("✅ All notifications marked as read");
      }
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  // ✅ Delete notification with userId
  const handleDelete = async (notificationId) => {
    if (!userId) return;

    try {
      const response = await notificationAPI.deleteNotification(
        notificationId,
        userId
      );

      if (response.success) {
        // Check if the deleted notification was unread
        const deletedNotif = notifications.find((n) => n.id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        console.log("✅ Notification deleted:", notificationId);
      }
    } catch (error) {
      console.error("❌ Error deleting notification:", error);
      Alert.alert("Error", "Failed to delete notification");
    }
  };

  // ✅ Delete all read notifications
  const handleDeleteAllRead = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

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
              const response = await notificationAPI.deleteAllRead(userId);

              if (response.success) {
                setNotifications((prev) => prev.filter((n) => !n.isRead));
                Alert.alert("Success", "Read notifications deleted");
                console.log("✅ All read notifications deleted");
              }
            } catch (error) {
              console.error("❌ Error deleting all read:", error);
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
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    className="bg-blue-500 p-2 rounded-lg"
                  >
                    <CheckCheck size={18} color="white" />
                  </TouchableOpacity>
                )}
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
              userId={userId}
            />
          ))}
          <View className="h-24" />
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
