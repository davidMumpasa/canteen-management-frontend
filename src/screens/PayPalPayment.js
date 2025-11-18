import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppService from "../services/AppService";

export default function PayPalPayment({
  amount,
  orderID,
  onSuccess,
  onCancel,
  visible = true,
}) {
  const [step, setStep] = useState("login"); // login, processing, success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await AppService.getUserIdFromToken();

        console.log("========================");
        console.log("User Pay:", user);
        console.log("========================");

        if (user && user.email) {
          setEmail(user.email);
        } else {
          console.warn("⚠️ No user or email found in token");
          setEmail("");
        }

        setPassword("12345");
      } catch (error) {
        console.error("❌ Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const safeAmount = parseFloat(amount) || 0;

  const handlePayment = () => {
    setStep("processing");

    // Simulate payment processing
    setTimeout(() => {
      setStep("success");

      // Call success callback after showing success animation
      setTimeout(() => {
        onSuccess?.({
          type: "success",
          reference: `${orderID}-${Date.now()}`,
          transactionId: `MOCK-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`,
          amount: safeAmount,
          currency: "ZAR",
          orderID: orderID,
          timestamp: new Date().toISOString(),
        });
      }, 2000);
    }, 2000);
  };

  const handleCancel = () => {
    onCancel?.({
      status: "cancelled",
      message: "Payment cancelled by user",
    });
  };

  if (step === "processing") {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.processingTitle}>Processing Payment</Text>
            <Text style={styles.processingSubtitle}>
              Please wait while we process your payment...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (step === "success") {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, styles.successBg]}>
          <View style={styles.centerCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your payment has been processed successfully
            </Text>
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Amount Paid</Text>
              <Text style={styles.amountValue}>R{safeAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>Order: {orderID}</Text>
              <Text style={styles.detailText}>
                Transaction ID: MOCK-
                {Math.random().toString(36).substr(2, 6).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.card}>
            {/* PayPal Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>
                <Text style={styles.logoBlue}>Pay</Text>
                <Text style={styles.logoLightBlue}>Pal</Text>
              </Text>
            </View>

            {/* Amount Display */}
            <View style={styles.amountDisplay}>
              <Text style={styles.amountDisplayLabel}>Amount to Pay</Text>
              <Text style={styles.amountDisplayValue}>
                R{safeAmount.toFixed(2)}
              </Text>
              <Text style={styles.orderLabel}>Order: {orderID}</Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
              activeOpacity={0.8}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel Payment</Text>
            </TouchableOpacity>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Ionicons name="lock-closed" size={16} color="#059669" />
              <Text style={styles.securityText}>256-bit SSL Secured</Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Powered by <Text style={styles.footerBrand}>PayPal</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    padding: 16,
    justifyContent: "center",
    minHeight: "100%",
  },
  successBg: {
    backgroundColor: "#ECFDF5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  centerCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  logoBlue: {
    color: "#1E3A8A",
  },
  logoLightBlue: {
    color: "#3B82F6",
  },
  amountDisplay: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  amountDisplayLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountDisplayValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "white",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  payButton: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 14,
    color: "#065F46",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
  },
  footerBrand: {
    fontWeight: "600",
    color: "#2563EB",
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  amountCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  detailsContainer: {
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});
