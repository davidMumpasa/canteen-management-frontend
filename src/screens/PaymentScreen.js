// screens/PaymentScreen.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import PayPalPayment from "./PayPalPayment";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JWT from "expo-jwt";
import { TOKEN_KEY } from "../../config";
import axios from "axios";

const PaymentScreen = ({ navigation, route }) => {
  const [selectedPayment, setSelectedPayment] = useState("student");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [cartItem, setCartItem] = useState("");

  const animatedValue = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const items =
    route?.params?.items ||
    (route?.params?.cartItem ? [route.params.cartItem] : []);

  const orderData = {
    items,
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    tax: 2.25,
    total: items.reduce((sum, item) => sum + item.totalPrice, 0) + 2.25,
    orderId: "#UC2024-0158",
  };

  const paymentMethods = [
    {
      id: "paypal",
      title: "PayPal",
      subtitle: "Quick & Secure",
      icon: "logo-paypal",
      color: "#003087",
      available: true,
    },
    {
      id: "card",
      title: "Credit/Debit Card",
      subtitle: "Add new card",
      icon: "card",
      color: "#2196F3",
      available: true,
    },
    {
      id: "student",
      title: "Student Account",
      subtitle: "Balance: R145.50",
      icon: "school",
      color: "#4CAF50",
      available: false,
    },
    {
      id: "apple",
      title: "Apple Pay",
      subtitle: "Touch ID or Face ID",
      icon: "logo-apple",
      color: "#000",
      available: false,
    },
  ];

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(" ") : "";
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  };

  const createOrder = async (orderData) => {
    try {
      const response = await axios.post(`${BASE_URL}/orders/add`, orderData);

      if (response.data.success) {
        console.log("✅ Order created:", response.data.order);
        return response.data.order;
      } else {
        Alert.alert("Order Error", "Failed to create order");
        return null;
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      Alert.alert("Order Error", "Something went wrong while creating order");
      return null;
    }
  };

  // Method: Add payment
  const addPayment = async (paymentData) => {
    try {
      const userId = await getUserIdFromToken();

      // Append userId to the payment data
      const payload = { ...paymentData, userId };

      const response = await axios.post(`${BASE_URL}/payment/add`, payload);

      console.log("✅ Payment added:", response.data);
      return response.data;
    } catch (err) {
      console.error(
        "❌ Error adding payment:",
        err.response?.data || err.message
      );
      throw err;
    }
  };

  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("=====================");
      console.log("Token: ", token);
      console.log("=====================");
      if (!token) {
        console.error("❌ No token found");
        return null;
      }

      const decoded = JWT.decode(token, TOKEN_KEY);
      console.log("🔑 Decoded token:", decoded);

      return decoded.id;
    } catch (err) {
      console.error("❌ Error decoding token:", err);
      return null;
    }
  };

  const handlePayment = async () => {
    if (selectedPayment === "card") {
      if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
        Alert.alert("Error", "Please fill in all card details");
        return;
      }

      try {
        setIsProcessing(true);

        // Simulate payment animation
        await new Promise((resolve) => {
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }).start(() => resolve());
        });
        const userId = await getUserIdFromToken();
        if (!userId) {
          Alert.alert("Error", "User not authenticated");
          return;
        }
        // 🔹 Prepare order payload
        const orderPayload = {
          userId,
          totalAmount: orderData.total,
          paymentMethod: "card",
          orderType: "delivery",
          deliveryAddress: "123 Main Street",
          specialInstructions: "Leave at the door",
          items: orderData.items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            specialRequests: item.specialRequests || "",
          })),
        };

        // 🔹 Call API

        const newOrder = await createOrder(orderPayload);

        const orderItems = orderData.items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          totalPrice: item.totalPrice,
        }));

        const totalAmount = orderItems.reduce(
          (acc, item) => acc + item.totalPrice,
          0
        );

        const paymentData = {
          orderId: newOrder.id,
          amount: totalAmount,
          paymentMethod: "card",
          type: "payment",
          description: "Payment for cart order",
          metadata: { cart: orderItems },
        };
        const result = await addPayment(paymentData);

        if (newOrder) {
          setIsProcessing(false);
          setShowSuccess(true);

          // Success animation
          Animated.spring(successAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            setShowSuccess(false);
            // Pass the orderId to the OrderScreen
            navigation.navigate("Main", {
              screen: "Orders",
              params: { orderId: newOrder.id },
            });
          }, 2000);
        } else {
          setIsProcessing(false);
        }
      } catch (err) {
        setIsProcessing(false);
        console.error("❌ Payment error:", err);
        Alert.alert("Error", "Something went wrong during payment.");
      }
    } else if (selectedPayment === "paypal") {
      setShowPayPalModal(true);
    } else {
      Alert.alert(
        "Payment method not available",
        "Please select a valid payment method."
      );
    }
  };

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPayment === method.id && styles.paymentMethodSelected,
        !method.available && styles.paymentMethodDisabled,
      ]}
      onPress={() => method.available && setSelectedPayment(method.id)}
      disabled={!method.available}
    >
      <View style={styles.paymentMethodContent}>
        <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
          <Ionicons name={method.icon} size={24} color="white" />
        </View>
        <View style={styles.paymentInfo}>
          <Text
            style={[
              styles.paymentTitle,
              !method.available && styles.disabledText,
            ]}
          >
            {method.title}
          </Text>
          <Text
            style={[
              styles.paymentSubtitle,
              !method.available && styles.disabledText,
            ]}
          >
            {method.subtitle}
          </Text>
        </View>
        {!method.available && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
      </View>
      {selectedPayment === method.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCardForm = () => {
    if (selectedPayment !== "card") return null;

    return (
      <View style={styles.cardForm}>
        <Text style={styles.sectionTitle}>💳 Card Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.textInput}
              placeholder="123"
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            value={cardHolder}
            onChangeText={setCardHolder}
            autoCapitalize="words"
          />
        </View>
      </View>
    );
  };

  const renderSuccessModal = () => (
    <Modal visible={showSuccess} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.successModal,
            {
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
              opacity: successAnim,
            },
          ]}
        >
          <LinearGradient
            colors={["#4CAF50", "#45a049"]}
            style={styles.successContent}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="white" />
            </View>
            <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
            <Text style={styles.successMessage}>
              Your order {orderData.orderId} has been confirmed
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successAmount}>R{orderData.total}</Text>
              <Text style={styles.successTime}>
                Estimated pickup: 15-20 minutes
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderPayPalModal = () => {
    if (!showPayPalModal) return null;

    return (
      <PayPalPayment
        amount={orderData.total.toFixed(2)}
        orderID={orderData.orderId}
        clientId={"YOUR_PAYPAL_CLIENT_ID"}
        currency="USD"
        onSuccess={(data) => {
          setShowPayPalModal(false);
          Alert.alert(
            "Payment Successful",
            `Transaction ID: R{data.transactionId}`
          );

          navigation.navigate("Main", { screen: "Orders" });
        }}
        onCancel={() => {
          setShowPayPalModal(false);
          Alert.alert("Payment Cancelled", "You cancelled the PayPal payment.");
        }}
        onError={(error) => {
          setShowPayPalModal(false);
          Alert.alert(
            "Payment Error",
            error.message || "An error occurred during PayPal payment."
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Payment</Text>
        <View style={styles.headerAmount}>
          <Text style={styles.headerAmountText}>R{orderData.total}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>
          {orderData.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.orderItemPrice}>
                R{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.orderDivider} />
          <View style={styles.orderItem}>
            <Text style={styles.orderItemName}>Subtotal</Text>
            <Text style={styles.orderItemPrice}>R{orderData.subtotal}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.orderItemName}>Tax</Text>
            <Text style={styles.orderItemPrice}>R{orderData.tax}</Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalAmount}>R{orderData.total}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>💰 Choose Payment Method</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Card Form */}
        {renderCardForm()}
        {renderPayPalModal()}

        {/* Pickup Information */}
        <View style={styles.pickupInfo}>
          <Text style={styles.sectionTitle}>📍 Pickup Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#667eea" />
              <Text style={styles.infoText}>Main Campus Canteen</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#667eea" />
              <Text style={styles.infoText}>Estimated: 15-20 minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="receipt" size={20} color="#667eea" />
              <Text style={styles.infoText}>Order: {orderData.orderId}</Text>
            </View>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={isProcessing ? ["#ccc", "#999"] : ["#4CAF50", "#45a049"]}
            style={styles.payButtonGradient}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <Animated.View
                  style={[
                    styles.processingSpinner,
                    {
                      transform: [
                        {
                          rotate: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="sync" size={24} color="white" />
                </Animated.View>
                <Text style={styles.payButtonText}>Processing Payment...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="card" size={24} color="white" />
                <Text style={styles.payButtonText}>
                  Complete Payment R{orderData.total}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {renderSuccessModal()}
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 25,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerAmount: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  headerAmountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 20,
  },
  orderSummary: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderItemName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  orderTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#667eea",
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  paymentSection: {
    marginTop: 10,
  },
  paymentMethod: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  disabledText: {
    color: "#999",
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  comingSoonBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardForm: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  rowInputs: {
    flexDirection: "row",
  },
  pickupInfo: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  payButton: {
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  payButtonDisabled: {
    opacity: 0.8,
  },
  payButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  payButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  processingSpinner: {
    marginRight: 10,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    width: "85%",
    borderRadius: 20,
    overflow: "hidden",
  },
  successContent: {
    padding: 30,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  successDetails: {
    alignItems: "center",
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  successTime: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
});
