import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const OrderScreen = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));

  const order = {
    id: "UC2024-0157",
    status: "preparing",
    items: [
      { name: "Margherita Pizza", quantity: 2, price: 17.98, emoji: "🍕" },
      { name: "Classic Burger", quantity: 1, price: 6.99, emoji: "🍔" },
    ],
    estimatedTime: "12 minutes",
    pickupCode: "4729",
    location: "Main Campus Canteen",
    counter: "Express Pickup - Counter 3",
    preparedBy: "Chef Mario",
  };

  const statusSteps = [
    {
      label: "Order Placed",
      icon: "checkmark-circle",
      description: "Order confirmed",
      time: "2:15 PM",
    },
    {
      label: "Payment Verified",
      icon: "card",
      description: "Payment successful",
      time: "2:16 PM",
    },
    {
      label: "Preparing",
      icon: "restaurant",
      description: "Chef is cooking",
      time: "Now",
    },
    {
      label: "Ready for Pickup",
      icon: "bag-handle",
      description: "Come collect",
      time: "~2:28 PM",
    },
  ];

  useEffect(() => {
    // Pulse animation for active step
    const pulse = Animated.loop(
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
    );
    pulse.start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / statusSteps.length,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    return () => pulse.stop();
  }, [currentStep]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.title}>Order Tracking</Text>
              <View style={styles.orderIdBadge}>
                <Text style={styles.orderId}>#{order.id}</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Preparing Your Order</Text>
              </View>
              <Text style={styles.estimatedTime}>
                🕐 Ready in {order.estimatedTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg} />
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Status Steps */}
        <View style={styles.stepsContainer}>
          {statusSteps.map((step, index) => (
            <View key={index} style={styles.stepWrapper}>
              <View style={styles.stepContent}>
                <View style={styles.stepLeft}>
                  <Animated.View
                    style={[
                      styles.stepIcon,
                      index === currentStep && {
                        transform: [{ scale: pulseAnim }],
                      },
                      {
                        backgroundColor:
                          index <= currentStep ? "#667eea" : "#f5f6fa",
                        borderColor:
                          index <= currentStep ? "#667eea" : "#e0e0e0",
                      },
                    ]}
                  >
                    <Ionicons
                      name={step.icon}
                      size={24}
                      color={index <= currentStep ? "white" : "#999"}
                    />
                  </Animated.View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor:
                            index < currentStep ? "#667eea" : "#e0e0e0",
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepInfo}>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: index <= currentStep ? "#333" : "#999" },
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pickup Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="location" size={24} color="#667eea" />
            </View>
            <Text style={styles.cardTitle}>Pickup Information</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{order.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Counter</Text>
              <Text style={styles.detailValue}>{order.counter}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prepared by</Text>
              <Text style={styles.detailValue}>👨‍🍳 {order.preparedBy}</Text>
            </View>

            <View style={styles.pickupCodeContainer}>
              <Text style={styles.pickupCodeLabel}>Your Pickup Code</Text>
              <View style={styles.pickupCodeBox}>
                <Text style={styles.pickupCode}>{order.pickupCode}</Text>
              </View>
            </View>

            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color="#ff6b6b" />
              <Text style={styles.tipText}>
                Show this code at the pickup counter to collect your order
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="receipt" size={24} color="#667eea" />
            </View>
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          <View style={styles.cardContent}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                $
                {order.items
                  .reduce((acc, item) => acc + item.price, 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="call" size={20} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Contact Canteen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

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
  header: {
    backgroundColor: "#667eea",
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  orderIdContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  orderIdBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  orderId: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  statusContainer: {
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  estimatedTime: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "500",
  },
  progressSection: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#667eea",
    borderRadius: 2,
  },
  stepsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepWrapper: {
    marginBottom: 5,
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepLeft: {
    alignItems: "center",
    marginRight: 15,
  },
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stepLine: {
    width: 2,
    height: 40,
    marginTop: 5,
  },
  stepInfo: {
    flex: 1,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  stepTime: {
    fontSize: 12,
    color: "#999",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f6fa",
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(102,126,234,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardContent: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  pickupCodeContainer: {
    marginTop: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  pickupCodeLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  pickupCodeBox: {
    backgroundColor: "#667eea",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pickupCode: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 4,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f5f6fa",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#667eea",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#667eea",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#667eea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
export default OrderScreen;
