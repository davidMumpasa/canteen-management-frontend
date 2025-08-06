import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OrderScreen = () => {
  const order = {
    id: "UC2024-0157",
    status: "preparing",
    items: [
      { name: "Margherita Pizza", quantity: 2, price: 17.98 },
      { name: "Classic Burger", quantity: 1, price: 6.99 },
    ],
    estimatedTime: "12 minutes",
    pickupCode: "4729",
    location: "Main Campus Canteen",
    counter: "Express Pickup - Counter 3",
  };

  const statusSteps = [
    { label: "Ordered", icon: "check" },
    { label: "Confirmed", icon: "check" },
    { label: "Preparing", icon: "search" },
    { label: "Ready", icon: "cube" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📋 Order Status</Text>
        <Text style={styles.orderId}>#{order.id}</Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            🧑‍🍳 Your order is being prepared!
          </Text>
          <Text style={styles.subStatus}>
            Estimated pickup time: {order.estimatedTime}
          </Text>
        </View>

        <View style={styles.steps}>
          {statusSteps.map((step, idx) => (
            <View style={styles.step} key={idx}>
              <Ionicons
                name={step.icon}
                size={28}
                color={idx <= 2 ? "#4CAF50" : "#ccc"}
              />
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Pickup Details</Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Location:</Text> {order.location}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Counter:</Text> {order.counter}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Pickup Code:</Text>
            <Text style={styles.pickupCode}> {order.pickupCode}</Text>
          </Text>
          <View style={styles.tipBox}>
            <Text style={styles.tip}>
              💡 Tip: Show this code at the pickup counter to collect your order
              quickly!
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧾 Order Summary</Text>
          {order.items.map((item, index) => (
            <View style={styles.itemRow} key={index}>
              <Text>
                {item.quantity}x {item.name}
              </Text>
              <Text>${item.price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.itemRow}>
            <Text style={[styles.bold]}>Total:</Text>
            <Text style={[styles.total]}>
              $
              {order.items
                .reduce((acc, item) => acc + item.price, 0)
                .toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactText}>📞 Contact Canteen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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

export default OrderScreen;
