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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import EditProfileModal from "./EditProfileModal";
import AllergyManagementModal from "./AllergyManagementModal";

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
  const [allergyCount, setAllergyCount] = useState(0);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);

  const menuItems = [
    {
      title: "Order History",
      icon: "time",
      color: "#667eea",
      badge: null,
      onPress: () => navigation.navigate("MyOrders"),
    },
    {
      title: "My Allergies",
      icon: "medical",
      color: "#EF4444",
      badge: null,
      onPress: () => setAllergyModalVisible(true),
    },
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
                console.log(
                  "Logout API call failed, but continuing with local logout:",
                  apiError
                );
              }
            }

            await AsyncStorage.multiRemove(["token", "user", "userRole"]);
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
      }
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Error fetching current user:", err);
    }
  };

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
        setUserStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const fetchAllergyCount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !user?.id) return;

      const response = await axios.get(`${BASE_URL}/allergy/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.allergies) {
        setAllergyCount(response.data.allergies.length);
      }
    } catch (err) {
      console.error("Error fetching allergy count:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await fetchCurrentUser();
    await fetchUserStats();
    await fetchAllergyCount();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleUpdateSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleAllergyModalClose = () => {
    setAllergyModalVisible(false);
    fetchAllergyCount(); // Refresh allergy count when modal closes
  };

  useEffect(() => {
    loadData();

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

  useEffect(() => {
    if (user?.id) {
      fetchAllergyCount();
    }
  }, [user]);

  const updatedMenuItems = menuItems.map((item) => {
    if (item.title === "Order History" && userStats?.orderStats?.totalOrders) {
      return { ...item, badge: userStats.orderStats.totalOrders.toString() };
    }
    if (item.title === "My Allergies" && allergyCount > 0) {
      return { ...item, badge: allergyCount.toString() };
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
      <TouchableOpacity
        className="flex-row items-center justify-between py-4 px-5"
        onPress={item.onPress}
      >
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
                  <View className="w-24 h-24 rounded-full bg-white bg-opacity-20 justify-center items-center border-2 border-white border-opacity-30 shadow-lg">
                    <Text className="text-4xl font-bold text-blue-500">
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
                    <Text className="text-xs text-blue-500 text-opacity-80 ml-1 font-medium">
                      {user.department || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-white bg-opacity-15 px-3 py-1.5 rounded-2xl">
                    <Ionicons
                      name="person"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text className="text-xs text-blue-500 text-opacity-80 ml-1 font-medium">
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

        {/* Allergy Alert Banner (if user has allergies) */}
        {allergyCount > 0 && (
          <View className="px-5 mb-7">
            <TouchableOpacity
              onPress={() => setAllergyModalVisible(true)}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-red-100 justify-center items-center mr-3">
                <Ionicons name="shield-checkmark" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-red-700 mb-1">
                  {allergyCount} {allergyCount === 1 ? "Allergy" : "Allergies"}{" "}
                  Registered
                </Text>
                <Text className="text-sm text-red-600">
                  Tap to manage your allergy profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-5 mb-7">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="items-center flex-1"
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
            >
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

            <TouchableOpacity
              className="items-center flex-1"
              onPress={() => setAllergyModalVisible(true)}
            >
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-orange-100 mb-2">
                <Ionicons name="medical" size={24} color="#EF4444" />
              </View>
              <Text className="text-xs font-semibold text-gray-600 text-center">
                Allergies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center flex-1">
              <View className="w-15 h-15 rounded-3xl justify-center items-center bg-teal-100 mb-2">
                <Ionicons name="chatbubble" size={24} color="#4ecdc4" />
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

      {/* Modals */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <AllergyManagementModal
        visible={allergyModalVisible}
        onClose={handleAllergyModalClose}
        userId={user?.id}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
