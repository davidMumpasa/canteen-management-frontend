import React, { useRef, useMemo, useState, useCallback } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetMethods } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";

import AuthStyles from "../styles/AuthStyles";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "40%"], []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Optionally store token in AsyncStorage for later use
      await AsyncStorage.setItem("token", data.token);
      // const token = await AsyncStorage.getItem("token");

      // console.log("---------------------------");
      // console.log("Token: " + token);
      // console.log("---------------------------");

      Alert.alert("Success", "Login successful");
      // navigation.navigate("Home");
      navigation.replace("Main");
    } catch (err) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    bottomSheetRef.current?.close();
    navigation.navigate("Home");
  };

  return (
    <>
      <SafeAreaView style={AuthStyles.container}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={AuthStyles.authContainer}
        >
          <View style={AuthStyles.authContent}>
            <Text style={AuthStyles.appTitle}>🍽️ Smart Canteen</Text>
            <Text style={AuthStyles.authSubtitle}>Welcome back!</Text>

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
              />
            </View>

            <View style={AuthStyles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={AuthStyles.inputIcon}
              />
              <TextInput
                style={AuthStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={AuthStyles.primaryButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={AuthStyles.primaryButtonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={AuthStyles.linkButtonText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={AuthStyles.authFooter}>
              <Text style={AuthStyles.authFooterText}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={AuthStyles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* ✅ Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Login Successful!
          </Text>
          <Text style={{ marginBottom: 20 }}>
            Would you like to proceed to the Home Dashboard?
          </Text>
          <TouchableOpacity
            onPress={goToHome}
            style={{
              backgroundColor: "#667eea",
              padding: 12,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  );
};

export default LoginScreen;
