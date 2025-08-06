import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthStyles from "../styles/AuthStyles";
import { BASE_URL } from "../../config";

const RegisterScreen = ({ navigation }) => {
  const [student_id, setstudent_id] = useState("");
  const [full_name, setfull_name] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!student_id || !full_name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id,
          full_name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      Alert.alert("Success", "Account created!");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Registration Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={AuthStyles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={AuthStyles.authContainer}
      >
        <View style={AuthStyles.authContent}>
          <Text style={AuthStyles.appTitle}>🍽️ Smart Canteen</Text>
          <Text style={AuthStyles.authSubtitle}>Create a new account</Text>
          <View style={AuthStyles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={AuthStyles.inputIcon}
            />
            <TextInput
              style={AuthStyles.input}
              placeholder="Student Number"
              value={student_id}
              onChangeText={setstudent_id}
              secureTextEntry
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
              placeholder="full name"
              value={full_name}
              onChangeText={setfull_name}
              secureTextEntry
            />
          </View>
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
          <View style={AuthStyles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              style={AuthStyles.inputIcon}
            />
            <TextInput
              style={AuthStyles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={AuthStyles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={AuthStyles.primaryButtonText}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>
          <View style={AuthStyles.authFooter}>
            <Text style={AuthStyles.authFooterText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={AuthStyles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RegisterScreen;
