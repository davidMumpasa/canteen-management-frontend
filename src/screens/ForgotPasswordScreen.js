import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AuthStyles from "../styles/AuthStyles";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Password Reset",
        "If this email is registered, you'll receive password reset instructions."
      );
      navigation.navigate("Login");
    }, 1500);
  };

  return (
    <SafeAreaView style={AuthStyles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={AuthStyles.authContainer}
      >
        <View style={AuthStyles.authContent}>
          <Text style={AuthStyles.appTitle}>🍽️ Smart Canteen</Text>
          <Text style={AuthStyles.authSubtitle}>Reset your password</Text>

          <View style={AuthStyles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666"
              style={AuthStyles.inputIcon}
            />
            <TextInput
              style={AuthStyles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={AuthStyles.primaryButton}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={AuthStyles.primaryButtonText}>
              {loading ? "Sending..." : "Send Reset Instructions"}
            </Text>
          </TouchableOpacity>

          <View style={AuthStyles.authFooter}>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={AuthStyles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
