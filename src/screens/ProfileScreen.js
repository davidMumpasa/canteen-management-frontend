import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const ProfileScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // User data
  const user = {
    fullName: "David Ebula",
    email: "david@gmail.com",
    studentId: "S123456",
    avatar: "D",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    year: "3rd Year",
    campus: "Main Campus",
    memberSince: "September 2022",
    totalOrders: 127,
    favoriteFood: "Pizza",
    loyaltyPoints: 2340,
  };

  const stats = [
    {
      label: "Total Orders",
      value: user.totalOrders,
      icon: "restaurant",
      color: "#667eea",
    },
    {
      label: "Loyalty Points",
      value: user.loyaltyPoints,
      icon: "star",
      color: "#ff6b6b",
    },
    {
      label: "Member Since",
      value: "2022",
      icon: "calendar",
      color: "#4ecdc4",
    },
  ];

  const menuItems = [
    { title: "Order History", icon: "time", color: "#667eea", badge: "12" },
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

  useEffect(() => {
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

  const StatCard = ({ stat, index }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50 * (index + 1)],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: stat.color + "15" }]}>
        <Ionicons name={stat.icon} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </Animated.View>
  );

  const MenuItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.menuItem,
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
      <TouchableOpacity style={styles.menuItemButton}>
        <View style={styles.menuItemLeft}>
          <View
            style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}
          >
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text style={styles.menuItemText}>{item.title}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header with Gradient */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              {/* Profile Avatar */}
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
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.avatar}</Text>
                  </View>
                  <View style={styles.onlineIndicator} />
                </View>
              </Animated.View>

              {/* User Info */}
              <Animated.View
                style={[
                  styles.userInfo,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.userDetails}>
                  <View style={styles.detailChip}>
                    <Ionicons
                      name="school"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text style={styles.detailText}>{user.department}</Text>
                  </View>
                  <View style={styles.detailChip}>
                    <Ionicons
                      name="person"
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text style={styles.detailText}>{user.year}</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Edit Profile Button */}
              <Animated.View
                style={[
                  styles.editButtonContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create" size={18} color="#667eea" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#667eea15" },
                ]}
              >
                <Ionicons name="add" size={24} color="#667eea" />
              </View>
              <Text style={styles.quickActionText}>New Order</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#ff6b6b15" },
                ]}
              >
                <Ionicons name="repeat" size={24} color="#ff6b6b" />
              </View>
              <Text style={styles.quickActionText}>Reorder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#4ecdc415" },
                ]}
              >
                <Ionicons name="gift" size={24} color="#4ecdc4" />
              </View>
              <Text style={styles.quickActionText}>Rewards</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#ffa72615" },
                ]}
              >
                <Ionicons name="chatbubble" size={24} color="#ffa726" />
              </View>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <MenuItem key={index} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.logoutButton}>
            <Ionicons name="log-out" size={20} color="#ff6b6b" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    backgroundColor: "#667eea",
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "white",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  userDetails: {
    flexDirection: "row",
    gap: 12,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 4,
    fontWeight: "500",
  },
  editButtonContainer: {
    width: "100%",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f6fa",
  },
  menuItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#ff6b6b",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ff6b6b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b6b",
    marginLeft: 8,
  },
});

export default ProfileScreen;
