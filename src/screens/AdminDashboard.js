import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AdminDashboard = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Admin Dashboard</Text>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color="#4f46e5" />
            <Text style={styles.statTitle}>Users</Text>
            <Text style={styles.statValue}>1,240</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="fast-food" size={28} color="#10b981" />
            <Text style={styles.statTitle}>Orders</Text>
            <Text style={styles.statValue}>872</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="currency-usd"
              size={28}
              color="#f59e0b"
            />
            <Text style={styles.statTitle}>Revenue</Text>
            <Text style={styles.statValue}>$5,420</Text>
          </View>
        </View>

        {/* Management Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("ManageUsers")}
          >
            <Ionicons name="person" size={22} color="#3b82f6" />
            <Text style={styles.actionText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("ManageOrders")}
          >
            <Ionicons name="cart" size={22} color="#22c55e" />
            <Text style={styles.actionText}>Manage Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("ManageMenu")}
          >
            <Ionicons name="restaurant" size={22} color="#f97316" />
            <Text style={styles.actionText}>Manage Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Reports")}
          >
            <Ionicons name="bar-chart" size={22} color="#8b5cf6" />
            <Text style={styles.actionText}>Reports & Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
