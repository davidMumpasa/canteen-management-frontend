import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppService from "../../services/AppService";
import DeliveryService from "../../services/DeliveryService";

const { width } = Dimensions.get("window");

const DriverProfileScreen = ({ navigation }) => {
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for status indicator
    Animated.loop(
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
    ).start();
  }, []);

  const getDriverId = async () => {
    try {
      const userData = await AppService.getUserIdFromToken();
      if (!userData) return null;
      return userData.driverId || userData.id;
    } catch (error) {
      console.error("Error getting driver ID:", error);
      return null;
    }
  };

  const fetchDriverInfo = async () => {
    try {
      setLoading(true);
      const currentDriverId = await getDriverId();
      if (!currentDriverId) {
        Alert.alert("Error", "Driver not found. Please log in again.");
        return;
      }
      setDriverId(currentDriverId);
      const response = await DeliveryService.getDriverInfo(currentDriverId);
      if (response.success && response.data) {
        setDriverInfo(response.data);
      } else {
        Alert.alert("Error", "Failed to load driver information.");
      }
    } catch (error) {
      console.error("Error fetching driver info:", error);
      Alert.alert("Error", "Failed to load driver information.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await DeliveryService.updateDriverStatus(
        driverId,
        newStatus
      );
      if (response.success) {
        setDriverInfo((prev) => ({ ...prev, status: newStatus }));
        Alert.alert("Success", `Status updated to ${newStatus}`);
      } else {
        Alert.alert("Error", response.error || "Failed to update status.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    const statusMessages = {
      available: "You'll start receiving new delivery requests.",
      busy: "You won't receive new requests until you're available again.",
      offline: "You'll be completely offline and invisible to the system.",
    };
    Alert.alert(
      `Change Status to ${
        newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      }?`,
      statusMessages[newStatus],
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => updateStatus(newStatus) },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLogoutLoading(true);
          try {
            // Clear all stored data
            await AsyncStorage.multiRemove(["token", "user", "userRole"]);

            // Reset navigation to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          } finally {
            setLogoutLoading(false);
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverInfo();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDriverInfo();
    const unsubscribe = navigation.addListener("focus", fetchDriverInfo);
    return unsubscribe;
  }, [navigation]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "available":
        return {
          color: "#10B981",
          gradient: ["#10B981", "#059669"],
          icon: "checkmark-circle",
          bg: "#ECFDF5",
          text: "Available",
        };
      case "busy":
        return {
          color: "#F59E0B",
          gradient: ["#F59E0B", "#D97706"],
          icon: "time",
          bg: "#FFFBEB",
          text: "Busy",
        };
      case "offline":
        return {
          color: "#6B7280",
          gradient: ["#6B7280", "#4B5563"],
          icon: "moon",
          bg: "#F3F4F6",
          text: "Offline",
        };
      default:
        return {
          color: "#9CA3AF",
          gradient: ["#9CA3AF", "#6B7280"],
          icon: "help-circle",
          bg: "#F9FAFB",
          text: "Unknown",
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={["#7C3AED", "#9333EA", "#A855F7"]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingIconContainer}>
              <Ionicons name="car-sport" size={48} color="#fff" />
            </View>
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: 24 }}
            />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!driverInfo) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>No driver information found.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDriverInfo}
          >
            <LinearGradient
              colors={["#7C3AED", "#9333EA"]}
              style={styles.retryGradient}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(driverInfo.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#9333EA"
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#7C3AED", "#9333EA", "#A855F7"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <Animated.View
            style={[
              styles.avatarContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#fff", "#F3E8FF"]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {driverInfo.firstName?.charAt(0)}
                {driverInfo.lastName?.charAt(0)}
              </Text>
            </LinearGradient>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusConfig.color,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </Animated.View>

          <Text style={styles.driverName}>
            {driverInfo.firstName} {driverInfo.lastName}
          </Text>
          <View style={styles.idBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#C4B5FD" />
            <Text style={styles.driverId}>
              ID: {driverInfo.id?.slice(0, 8)}...
            </Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Quick Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#DBEAFE", "#EFF6FF"]}
                style={styles.statGradient}
              >
                <Ionicons name="cube" size={28} color="#3B82F6" />
                <Text style={styles.statNumber}>
                  {driverInfo.currentOrders || 0}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#D1FAE5", "#ECFDF5"]}
                style={styles.statGradient}
              >
                <Ionicons name="checkmark-done" size={28} color="#10B981" />
                <Text style={styles.statNumber}>-</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={["#FEF3C7", "#FFFBEB"]}
                style={styles.statGradient}
              >
                <Ionicons name="star" size={28} color="#F59E0B" />
                <Text style={styles.statNumber}>-</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Status Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="radio-button-on" size={20} color="#7C3AED" />
              <Text style={styles.cardTitle}>Current Status</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={24}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
            <Text style={styles.statusDescription}>
              {driverInfo.status === "available"
                ? "You're available to receive delivery requests."
                : driverInfo.status === "busy"
                ? "You're currently handling deliveries."
                : "You're offline and won't receive any requests."}
            </Text>

            {/* Status Buttons */}
            <View style={styles.statusButtons}>
              {driverInfo.status !== "available" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("available")}
                  disabled={updatingStatus}
                  style={styles.statusBtn}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.statusBtnGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.statusBtnText}>Go Available</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {driverInfo.status !== "busy" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("busy")}
                  disabled={updatingStatus}
                  style={styles.statusBtn}
                >
                  <LinearGradient
                    colors={["#F59E0B", "#D97706"]}
                    style={styles.statusBtnGradient}
                  >
                    <Ionicons name="time" size={20} color="#fff" />
                    <Text style={styles.statusBtnText}>Set Busy</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {driverInfo.status !== "offline" && (
                <TouchableOpacity
                  onPress={() => handleStatusChange("offline")}
                  disabled={updatingStatus}
                  style={styles.statusBtn}
                >
                  <LinearGradient
                    colors={["#6B7280", "#4B5563"]}
                    style={styles.statusBtnGradient}
                  >
                    <Ionicons name="moon" size={20} color="#fff" />
                    <Text style={styles.statusBtnText}>Go Offline</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
            {updatingStatus && (
              <ActivityIndicator
                size="small"
                color="#7C3AED"
                style={{ marginTop: 12 }}
              />
            )}
          </Animated.View>

          {/* Contact Info Card */}
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color="#7C3AED" />
              <Text style={styles.cardTitle}>Contact Information</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="call" size={20} color="#7C3AED" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>
                  {driverInfo.phoneNumber || "Not provided"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail" size={20} color="#7C3AED" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>
                  {driverInfo.user?.email || "Not available"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Menu Items */}
          <Animated.View style={[styles.menuCard, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert("Coming Soon", "Order history feature coming soon!")
              }
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#EDE9FE" }]}>
                  <Ionicons name="time" size={22} color="#7C3AED" />
                </View>
                <Text style={styles.menuText}>Order History</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert("Coming Soon", "Earnings feature coming soon!")
              }
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#D1FAE5" }]}>
                  <Ionicons name="wallet" size={22} color="#10B981" />
                </View>
                <Text style={styles.menuText}>My Earnings</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Help & Support feature coming soon!"
                )
              }
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#DBEAFE" }]}>
                  <Ionicons name="help-circle" size={22} color="#3B82F6" />
                </View>
                <Text style={styles.menuText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>

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
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3FF" },
  loadingContainer: { flex: 1 },
  loadingGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingContent: { alignItems: "center" },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  errorContainer: { flex: 1, backgroundColor: "#F5F3FF" },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  errorText: { fontSize: 16, color: "#6B7280", marginBottom: 32 },
  retryButton: { borderRadius: 16, overflow: "hidden" },
  retryGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarText: { fontSize: 36, fontWeight: "700", color: "#7C3AED" },
  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  driverName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  driverId: { color: "#E9D5FF", fontSize: 12, fontWeight: "500" },
  content: { padding: 20, marginTop: -20 },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statGradient: { padding: 16, alignItems: "center" },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
    marginBottom: 12,
  },
  statusText: { fontSize: 16, fontWeight: "700" },
  statusDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  statusButtons: { gap: 12 },
  statusBtn: { borderRadius: 16, overflow: "hidden" },
  statusBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  statusBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: { fontSize: 16, color: "#1F2937", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 16 },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  menuDivider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 74 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "600" },
  version: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 32,
  },
});

export default DriverProfileScreen;
