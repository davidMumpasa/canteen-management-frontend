import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { BASE_URL } from "../../config";
import axios from "axios";

const OrdersScreen = () => {
  const [orders1, setOrders1] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orders] = useState([
    {
      id: "UC2024-0157",
      status: "preparing",
      items: ["2x Margherita Pizza", "1x Classic Burger"],
      total: 24.97,
      estimatedTime: "12 minutes",
      pickupCode: "4729",
    },
    {
      id: "UC2024-0156",
      status: "completed",
      items: ["1x Caesar Salad", "1x Iced Coffee"],
      total: 8.99,
      completedAt: "2 hours ago",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "preparing":
        return "#FF9800";
      case "ready":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "preparing":
        return "🍳 Preparing";
      case "ready":
        return "📦 Ready for Pickup";
      case "completed":
        return "✅ Completed";
      default:
        return status;
    }
  };

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/orders/getAll?page=${page}&limit=${limit}`
      );

      if (response.data.success) {
        setOrders1(response.data.data.orders);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    console.log("======================");
    console.log(orders1);
    console.log("======================");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Orders</Text>
      </View>

      <ScrollView style={styles.content}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{order.id}</Text>
              <Text
                style={[
                  styles.orderStatus,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {getStatusText(order.status)}
              </Text>
            </View>

            <View style={styles.orderItems}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.orderItem}>
                  • {item}
                </Text>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>${order.total}</Text>
              {order.status === "preparing" && (
                <Text style={styles.orderTime}>⏱️ {order.estimatedTime}</Text>
              )}
              {order.status === "completed" && (
                <Text style={styles.orderTime}>✅ {order.completedAt}</Text>
              )}
            </View>

            {order.pickupCode && (
              <View style={styles.pickupCode}>
                <Text style={styles.pickupCodeLabel}>Pickup Code:</Text>
                <Text style={styles.pickupCodeValue}>{order.pickupCode}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  orderId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  statusBox: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  subStatus: {
    color: "white",
    marginTop: 5,
    fontSize: 14,
  },
  steps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  step: {
    alignItems: "center",
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 6,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  detailText: {
    marginBottom: 6,
    color: "#444",
  },
  pickupCode: {
    backgroundColor: "#667eea",
    color: "white",
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    marginLeft: 5,
  },
  tipBox: {
    marginTop: 10,
    backgroundColor: "#e5f3ff",
    padding: 10,
    borderRadius: 8,
  },
  tip: {
    color: "#333",
    fontSize: 13,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  bold: {
    fontWeight: "bold",
  },
  total: {
    color: "#667eea",
    fontWeight: "bold",
  },
  contactButton: {
    backgroundColor: "#7F5AF0",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  contactText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
