import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const navigation = useNavigation();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Data states
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Edit profile states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
  });

  const menuItems = [
    { title: "Order History", icon: "time", color: "#667eea", badge: null },
    { title: "Favorite Foods", icon: "heart", color: "#ff6b6b", badge: null },
    { title: "Payment Methods", icon: "card", color: "#4ecdc4", badge: null },
    {
      title: "Delivery Addresses",
      icon: "location",
      color: "#ffa726",
      badge: "2",
    },
    {
      title: "Notifications",
      icon: "notifications",
      color: "#ab47bc",
      badge: null,
    },
    {
      title: "Help & Support",
      icon: "help-circle",
      color: "#66bb6a",
      badge: null,
    },
    { title: "Settings", icon: "settings", color: "#78909c", badge: null },
  ];

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLogoutLoading(true);
          try {
            const token = await AsyncStorage.getItem("token");

            // Optional: Call logout API if you want to invalidate the token on server
            if (token) {
              try {
                await axios.post(
                  `${BASE_URL}/users/logout`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
              } catch (apiError) {
                // Continue with logout even if API call fails
                console.log(
                  "Logout API call failed, but continuing with local logout:",
                  apiError
                );
              }
            }

            // Clear all stored data
            await AsyncStorage.multiRemove(["token", "user", "userRole"]);

            // Navigate to login screen or auth stack
            // Replace 'Auth' with your actual auth navigator name
            navigation.navigate("Login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          } finally {
            setLogoutLoading(false);
          }
        },
      },
    ]);
  };

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUser(response.data.user);
        setEditForm({
          firstName: response.data.user.firstName || "",
          lastName: response.data.user.lastName || "",
          phone: response.data.user.phone || "",
          department: response.data.user.department || "",
        });
      }
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Error fetching current user:", err);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      if (!user || !user.id) {
        console.log("User not loaded yet, skipping stats fetch");
        return;
      }

      const response = await axios.get(`${BASE_URL}/users/stats/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("=================");
        console.log("Stats: ", response.data);
        console.log("=================");
        setUserStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  // Update user profile
  const updateProfile = async () => {
    setEditLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const response = await axios.put(`${BASE_URL}/users/me`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUser(response.data.user);
        setEditModalVisible(false);
        Alert.alert("Success", "Profile updated successfully");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  // Replace your loadData function with this:
  const loadData = async () => {
    setLoading(true);
    setError(null);

    // First fetch user data
    await fetchCurrentUser();

    await fetchUserStats();

    setLoading(false);
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Format date for member since
  const formatMemberSince = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    loadData();

    // Start animations
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
  }, []);

  // Update menu items with actual data
  const updatedMenuItems = menuItems.map((item) => {
    if (item.title === "Order History" && userStats?.orderStats?.totalOrders) {
      return { ...item, badge: userStats.orderStats.totalOrders.toString() };
    }
    return item;
  });

  const stats = [
    {
      label: "Total Orders",
      value: userStats?.orderStats?.totalOrders || 0,
      icon: "restaurant",
      color: "#667eea",
    },
    {
      label: "Loyalty Points",
      value: Math.floor(userStats?.orderStats?.totalSpent || 0),
      icon: "star",
      color: "#ff6b6b",
    },
    {
      label: "Member Since",
      value: formatMemberSince(user?.createdAt).split(" ")[1] || "2024",
      icon: "calendar",
      color: "#4ecdc4",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#667eea" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
        <Text className="mt-4 text-gray-800 text-lg font-semibold text-center">
          {error || "Unable to load profile"}
        </Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-full"
          onPress={loadData}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const StatCard = ({ stat, index }) => (
    <Animated.View
      className="flex-1 bg-white p-5 rounded-2xl items-center mx-1 shadow-sm"
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50 * (index + 1)],
            }),
          },
        ],
      }}
    >
      <View
        className="w-12 h-12 rounded-full justify-center items-center mb-3"
        style={{ backgroundColor: stat.color + "15" }}
      >
        <Ionicons name={stat.icon} size={24} color={stat.color} />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-1">{stat.value}</Text>
      <Text className="text-xs text-gray-600 text-center">{stat.label}</Text>
    </Animated.View>
  );

  const MenuItem = ({ item, index }) => (
    <Animated.View
      className="border-b border-gray-100"
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, index % 2 === 0 ? -30 : 30],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity className="flex-row items-center justify-between py-4 px-5">
        <View className="flex-row items-center flex-1">
          <View
            className="w-11 h-11 rounded-xl justify-center items-center mr-4"
            style={{ backgroundColor: item.color + "15" }}
          >
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text className="text-base font-medium text-gray-800 flex-1">
            {item.title}
          </Text>
        </View>
        <View className="flex-row items-center">
          {item.badge && (
            <View className="bg-red-500 min-w-6 h-6 rounded-full justify-center items-center mr-3">
              <Text className="text-xs font-bold text-white">{item.badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Gradient */}
        <View className="mb-9">
          <View className="bg-blue-500 pb-10 rounded-b-3xl">
            <View className="items-center px-5 pt-5">
              {/* Profile Avatar */}
              <Animated.View
                className="mb-5"
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <View className="relative">
                  <View className="w-24 h-24 rounded-full text-black bg-opacity-20 justify-center items-center border-2 border-white border-opacity-30 shadow-lg">
                    <Text className="text-4xl font-bold text-white">
                      {user?.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : ""}
                    </Text>
                  </View>
                  <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white" />
                </View>
              </Animated.View>

              {/* User Info */}
              <Animated.View
                className="items-center mb-5"
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }}
              >
                <Text className="text-2xl font-bold text-white mb-1">
                  {user.firstName} {user.lastName}
                </Text>
                <Text className="text-base text-white text-opacity-80 mb-3">
                  {user.email}
                </Text>
                <View className="flex-row gap-3">
                  <View className="flex-row items-center bg-white bg-opacity-15 px-3 py-1.5 rounded-2xl">
                    <Ionicons
                      name="school"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text className="text-xs  text-black text-opacity-80 ml-1 font-medium">
                      {user.department || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-white bg-opacity-15 px-3 py-1.5 rounded-2xl">
                    <Ionicons
                      name="person"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text className="text-xs text-black text-opacity-80 ml-1 font-medium">
                      {user.role === "student" ? "Student" : user.role}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Edit Profile Button */}
              <Animated.View
                className="w-full"
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-white py-3 px-6 rounded-3xl shadow-md"
                  onPress={() => setEditModalVisible(true)}
                >
                  <Ionicons name="create" size={18} color="#667eea" />
                  <Text className="text-base font-semibold text-blue-500 ml-2">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-5 mb-7 -mt-5">
          <View className="flex-row justify-between">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-7">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="items-center flex-1">
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-blue-100 mb-2">
                <Ionicons name="add" size={24} color="#667eea" />
              </View>
              <Text className="text-xs font-semibold text-gray-600 text-center">
                New Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1">
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-red-100 mb-2">
                <Ionicons name="repeat" size={24} color="#ff6b6b" />
              </View>
              <Text className="text-xs font-semibold text-gray-600 text-center">
                Reorder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1">
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-teal-100 mb-2">
                <Ionicons name="gift" size={24} color="#4ecdc4" />
              </View>
              <Text className="text-xs font-semibold text-gray-600 text-center">
                Rewards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1">
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-orange-100 mb-2">
                <Ionicons name="chatbubble" size={24} color="#ffa726" />
              </View>
              <Text className="text-xs font-semibold text-gray-600 text-center">
                Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 mb-7">
          <Text className="text-xl font-bold text-gray-800 mb-4">Account</Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {updatedMenuItems.map((item, index) => (
              <MenuItem key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <Animated.View
          className="px-5 mb-5"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white py-4 rounded-2xl border-2 border-red-500 shadow-sm"
            onPress={handleLogout}
            disabled={logoutLoading}
            style={{ opacity: logoutLoading ? 0.5 : 1 }}
          >
            {logoutLoading ? (
              <ActivityIndicator size="small" color="#ff6b6b" />
            ) : (
              <Ionicons name="log-out" size={20} color="#ff6b6b" />
            )}
            <Text className="text-base font-semibold text-red-500 ml-2">
              {logoutLoading ? "Signing Out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="h-24" />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View
          className="flex-1"
          style={{
            backgroundColor:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Animated Header with Beautiful Gradient */}
          <View
            className="relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)",
              paddingTop: 60,
              paddingBottom: 40,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            {/* Floating Elements Background */}
            <View className="absolute inset-0">
              <View
                className="absolute top-10 left-6 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
              <View
                className="absolute top-20 right-8 w-16 h-16 rounded-full opacity-15"
                style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
              />
              <View
                className="absolute bottom-8 left-12 w-20 h-20 rounded-full opacity-10"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              />
              <View
                className="absolute top-32 right-20 w-8 h-8 rounded-full opacity-25"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
            </View>

            {/* Header Content */}
            <View className="flex-row items-center justify-between px-6 mb-6 relative z-10">
              <TouchableOpacity
                className="w-12 h-12 rounded-full justify-center items-center shadow-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={22} color="text-gray-800" />
              </TouchableOpacity>

              <View className="items-center flex-1">
                <Text
                  className="text-2xl font-black text-gray-800 mb-1"
                  style={{
                    textShadowColor: "rgba(0,0,0,0.3)",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  Edit Profile
                </Text>
                <Text
                  className="text-base text-gray-800 font-medium"
                  style={{ opacity: 0.9 }}
                >
                  Make yourself shine ✨
                </Text>
              </View>

              <TouchableOpacity
                className="px-6 py-3 rounded-full shadow-lg"
                style={{
                  backgroundColor: editLoading
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.25)",
                }}
                onPress={updateProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-gray-800 font-bold text-base">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Beautiful Profile Avatar */}
            <View className="items-center">
              <View className="relative">
                <View
                  className="w-28 h-28 rounded-full justify-center items-center shadow-2xl border-4 border-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                  }}
                >
                  <Text
                    className="text-4xl font-black"
                    style={{ color: "#ff6b6b" }}
                  >
                    {user?.firstName
                      ? user.firstName.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <TouchableOpacity
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full justify-center items-center shadow-lg"
                  style={{ backgroundColor: "#4facfe" }}
                >
                  <Ionicons name="camera" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Form Content with Beautiful Background */}
          <ScrollView
            className="flex-1 px-6"
            style={{ backgroundColor: "#f8fafc" }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 32, paddingBottom: 40 }}
          >
            {/* Personal Information Section */}
            <View className="mb-8">
              <View className="flex-row items-center mb-6">
                <View
                  className="w-14 h-14 rounded-2xl justify-center items-center mr-4 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <Ionicons name="person" size={24} color="text-gray-800" />
                </View>
                <View>
                  <Text className="text-xl font-black text-gray-800">
                    Personal Info
                  </Text>
                  <Text className="text-sm font-medium text-gray-500">
                    Tell us about yourself
                  </Text>
                </View>
              </View>

              {/* First Name */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  First Name
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: editForm.firstName ? "#4facfe" : "#e2e8f0",
                      color: "#1a202c",
                    }}
                    value={editForm.firstName}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, firstName: text })
                    }
                    placeholder="Your first name"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: editForm.firstName
                        ? "#4facfe"
                        : "#e2e8f0",
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={editForm.firstName ? "white" : "#a0aec0"}
                    />
                  </View>
                </View>
              </View>

              {/* Last Name */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  Last Name
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: editForm.lastName ? "#4facfe" : "#e2e8f0",
                      color: "#1a202c",
                    }}
                    value={editForm.lastName}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, lastName: text })
                    }
                    placeholder="Your last name"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: editForm.lastName
                        ? "#4facfe"
                        : "#e2e8f0",
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={editForm.lastName ? "white" : "#a0aec0"}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Contact Information Section */}
            <View className="mb-8">
              <View className="flex-row items-center mb-6">
                <View
                  className="w-14 h-14 rounded-2xl justify-center items-center mr-4 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  }}
                >
                  <Ionicons name="mail" size={24} color="text-gray-800" />
                </View>
                <View>
                  <Text className="text-xl font-black text-gray-800">
                    Contact
                  </Text>
                  <Text className="text-sm font-medium text-gray-500">
                    Stay connected
                  </Text>
                </View>
              </View>

              {/* Email (Read-only) */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  Email Address
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2"
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderColor: "#cbd5e0",
                      color: "#4a5568",
                    }}
                    value={user?.email}
                    editable={false}
                    placeholder="Email address"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: "#cbd5e0",
                    }}
                  >
                    <Ionicons name="lock-closed" size={16} color="white" />
                  </View>
                </View>
                <View className="flex-row items-center mt-3 px-2">
                  <View
                    className="w-5 h-5 rounded-full justify-center items-center mr-2"
                    style={{ backgroundColor: "#fbbf24" }}
                  >
                    <Ionicons name="information" size={12} color="white" />
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    Email is protected and cannot be changed
                  </Text>
                </View>
              </View>

              {/* Phone */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  Phone Number
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: editForm.phone ? "#38ef7d" : "#e2e8f0",
                      color: "#1a202c",
                    }}
                    value={editForm.phone}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, phone: text })
                    }
                    placeholder="Your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: editForm.phone ? "#38ef7d" : "#e2e8f0",
                    }}
                  >
                    <Ionicons
                      name="call-outline"
                      size={16}
                      color={editForm.phone ? "white" : "#a0aec0"}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Academic Information Section */}
            <View className="mb-8">
              <View className="flex-row items-center mb-6">
                <View
                  className="w-14 h-14 rounded-2xl justify-center items-center mr-4 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  }}
                >
                  <Ionicons name="school" size={24} color="text-gray-700" />
                </View>
                <View>
                  <Text className="text-xl font-black text-gray-800">
                    Academic
                  </Text>
                  <Text className="text-sm font-medium text-gray-500">
                    Your studies
                  </Text>
                </View>
              </View>

              {/* Department */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  Department
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2"
                    style={{
                      backgroundColor: "white",
                      borderColor: editForm.department ? "#f5576c" : "#e2e8f0",
                      color: "#1a202c",
                    }}
                    value={editForm.department}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, department: text })
                    }
                    placeholder="Your department"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: editForm.department
                        ? "#f5576c"
                        : "#e2e8f0",
                    }}
                  >
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color={editForm.department ? "white" : "#a0aec0"}
                    />
                  </View>
                </View>
              </View>

              {/* Role (Read-only) */}
              <View className="mb-6">
                <Text className="text-base font-bold text-gray-700 mb-3">
                  Role
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-2xl px-6 py-5 pr-14 text-lg font-medium shadow-sm border-2 capitalize"
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderColor: "#cbd5e0",
                      color: "#4a5568",
                    }}
                    value={user?.role}
                    editable={false}
                    placeholder="User role"
                    placeholderTextColor="#a0aec0"
                  />
                  <View
                    className="absolute right-5 top-1/2 w-8 h-8 rounded-full justify-center items-center"
                    style={{
                      transform: [{ translateY: -16 }],
                      backgroundColor: "#cbd5e0",
                    }}
                  >
                    <Ionicons name="lock-closed" size={16} color="white" />
                  </View>
                </View>
                <View className="flex-row items-center mt-3 px-2">
                  <View
                    className="w-5 h-5 rounded-full justify-center items-center mr-2"
                    style={{ backgroundColor: "#8b5cf6" }}
                  >
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                  </View>
                  <Text className="text-sm font-medium text-gray-600">
                    Role assigned by administration
                  </Text>
                </View>
              </View>
            </View>

            {/* Beautiful Action Buttons */}
            <View className="flex-row gap-4 mt-8">
              <TouchableOpacity
                className="flex-1 rounded-2xl py-5 items-center shadow-lg border-2"
                style={{
                  backgroundColor: "white",
                  borderColor: "#e2e8f0",
                }}
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="font-bold text-lg text-gray-600">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-2 rounded-2xl py-5 items-center shadow-xl"
                style={{
                  background: editLoading
                    ? "linear-gradient(135deg, #a0aec0 0%, #cbd5e0 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  opacity: editLoading ? 0.7 : 1,
                }}
                onPress={updateProfile}
                disabled={editLoading}
              >
                <View className="flex-row items-center">
                  {editLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="save" size={20} color="black" />
                      <Text className=" text-gray-600 font-black text-lg ml-3">
                        Save Changes
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
