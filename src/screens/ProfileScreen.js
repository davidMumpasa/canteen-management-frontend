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
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import EditProfileModal from "./EditProfileModal";
import AllergyManagementModal from "./AllergyManagementModal";

const { width, height } = Dimensions.get("window");

const ProfileScreen = () => {
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [headerScroll] = useState(new Animated.Value(0));

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
      icon: "receipt-outline",
      color: "#8B5CF6",
      gradient: ["#8B5CF6", "#7C3AED"],
      badge: null,
      onPress: () => navigation.navigate("MyOrders"),
    },
    {
      title: "My Allergies",
      icon: "medical-outline",
      color: "#EF4444",
      gradient: ["#EF4444", "#DC2626"],
      badge: null,
      onPress: () => setAllergyModalVisible(true),
    },
    {
      title: "Favorite Foods",
      icon: "heart-outline",
      color: "#EC4899",
      gradient: ["#EC4899", "#DB2777"],
      badge: null,
    },
    {
      title: "Payment Methods",
      icon: "card-outline",
      color: "#06B6D4",
      gradient: ["#06B6D4", "#0891B2"],
      badge: null,
    },
    {
      title: "Delivery Addresses",
      icon: "location-outline",
      color: "#F59E0B",
      gradient: ["#F59E0B", "#D97706"],
      badge: "2",
    },
    {
      title: "Notifications",
      icon: "notifications-outline",
      color: "#10B981",
      gradient: ["#10B981", "#059669"],
      badge: null,
    },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      color: "#6366F1",
      gradient: ["#6366F1", "#4F46E5"],
      badge: null,
    },
    {
      title: "Settings",
      icon: "settings-outline",
      color: "#64748B",
      gradient: ["#64748B", "#475569"],
      badge: null,
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
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

              // Try to call logout API, but don't fail if it errors
              if (token) {
                try {
                  await axios.post(
                    `${BASE_URL}/users/logout`,
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      timeout: 5000, // 5 second timeout
                    }
                  );
                } catch (apiError) {
                  console.log(
                    "Logout API call failed, continuing with local logout"
                  );
                }
              }

              // Clear all stored data
              await AsyncStorage.multiRemove(["token", "user", "userRole"]);

              // Force navigation reset to Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);

              // Even if there's an error, try to clear storage and navigate
              try {
                await AsyncStorage.clear();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } catch (finalError) {
                Alert.alert(
                  "Error",
                  "Failed to sign out. Please restart the app."
                );
              }
            } finally {
              setLogoutLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return null;
      }

      const response = await axios.get(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Error fetching current user:", err);
      return null;
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get(`${BASE_URL}/users/stats/${userId}`, {
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

  const fetchAllergyCount = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !userId) return;

      const response = await axios.get(`${BASE_URL}/allergy/${userId}`, {
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

    const userData = await fetchCurrentUser();

    if (userData && userData.id) {
      await Promise.all([
        fetchUserStats(userData.id),
        fetchAllergyCount(userData.id),
      ]);
    }

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
    if (user?.id) {
      fetchAllergyCount(user.id);
    }
  };

  useEffect(() => {
    loadData();

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      icon: "restaurant-outline",
      gradient: ["#8B5CF6", "#7C3AED"],
    },
    {
      label: "Points",
      value: Math.floor(userStats?.orderStats?.totalSpent || 0),
      icon: "star-outline",
      gradient: ["#F59E0B", "#D97706"],
    },
    {
      label: "Since",
      value: formatMemberSince(user?.createdAt).split(" ")[1] || "2024",
      icon: "calendar-outline",
      gradient: ["#06B6D4", "#0891B2"],
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>
            {error || "Unable to load profile"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const headerOpacity = headerScroll.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}
      >
        <LinearGradient
          colors={["#8B5CF6", "#7C3AED"]}
          style={styles.animatedHeaderGradient}
        >
          <Text style={styles.animatedHeaderText}>
            {user.firstName} {user.lastName}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: headerScroll } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Hero Header */}
        <LinearGradient
          colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
          style={styles.heroSection}
        >
          <View style={styles.heroPattern} />

          <Animated.View
            style={[
              styles.avatarContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={["#FFFFFF", "#F3E8FF"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0).toUpperCase() || ""}
                </Text>
              </LinearGradient>
              <View style={styles.onlineBadge} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.userInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="school-outline" size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>{user.department || "N/A"}</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="person-outline" size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>
                  {user.role === "student" ? "Student" : user.role}
                </Text>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color="#8B5CF6" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 * (index + 1) * 0.3],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
              >
                <Ionicons name={stat.icon} size={28} color="#FFFFFF" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Allergy Alert */}
        {allergyCount > 0 && (
          <TouchableOpacity
            style={styles.allergyAlert}
            onPress={() => setAllergyModalVisible(true)}
          >
            <View style={styles.allergyIconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="#EF4444" />
            </View>
            <View style={styles.allergyContent}>
              <Text style={styles.allergyTitle}>
                {allergyCount} {allergyCount === 1 ? "Allergy" : "Allergies"}{" "}
                Registered
              </Text>
              <Text style={styles.allergySubtitle}>
                Tap to manage your allergy profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              {
                icon: "add-circle",
                label: "New Order",
                color: "#8B5CF6",
                gradient: ["#8B5CF6", "#7C3AED"],
              },
              {
                icon: "repeat",
                label: "Reorder",
                color: "#EC4899",
                gradient: ["#EC4899", "#DB2777"],
              },
              {
                icon: "medical",
                label: "Allergies",
                color: "#EF4444",
                gradient: ["#EF4444", "#DC2626"],
                onPress: () => setAllergyModalVisible(true),
              },
              {
                icon: "chatbubble-ellipses",
                label: "Support",
                color: "#06B6D4",
                gradient: ["#06B6D4", "#0891B2"],
              },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionIcon}
                >
                  <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {updatedMenuItems.map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.menuItemWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, index % 2 === 0 ? -30 : 30],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <LinearGradient
                      colors={item.gradient}
                      style={styles.menuIcon}
                    >
                      <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  animatedHeaderGradient: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  animatedHeaderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  editButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  allergyAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  allergyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  allergyContent: {
    flex: 1,
  },
  allergyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 4,
  },
  allergySubtitle: {
    fontSize: 13,
    color: "#DC2626",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionItem: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuBadge: {
    backgroundColor: "#EF4444",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  menuBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FEE2E2",
    gap: 10,
    elevation: 2,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default ProfileScreen;
