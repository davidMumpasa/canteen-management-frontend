import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AuthStyles from "../styles/AuthStyles";

const { height, width } = Dimensions.get("window");

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const slideUpAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for logo
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleReset = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Password Reset Sent! 📧",
        "If this email is registered, you'll receive password reset instructions shortly.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    }, 1500);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />
      <SafeAreaView style={AuthStyles.container}>
        {/* Background with gradient and floating elements */}
        <LinearGradient
          colors={["#1a1f36", "#2d3561", "#4a5568"]}
          style={AuthStyles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating decorative elements */}
          <View style={AuthStyles.floatingElement1} />
          <View style={AuthStyles.floatingElement2} />
          <View style={AuthStyles.floatingElement3} />

          {/* Header section with logo and title */}
          <Animated.View
            style={[
              AuthStyles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={AuthStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={AuthStyles.logoWrapper}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={AuthStyles.logoGradient}
              >
                <Text style={AuthStyles.logoEmoji}>🔑</Text>
              </LinearGradient>
            </View>
            <Text style={AuthStyles.brandTitle}>Reset Password</Text>
            <Text style={AuthStyles.brandSubtitle}>
              Don't worry, we'll help you get back in
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Bottom sheet style forgot password card */}
        <Animated.View
          style={[
            AuthStyles.forgotCard,
            {
              transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Drag handle */}
          <View style={AuthStyles.dragHandle} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={AuthStyles.loginContent}>
              <View style={AuthStyles.formHeader}>
                <Text style={AuthStyles.welcomeText}>Forgot Password?</Text>
                <Text style={AuthStyles.loginSubtext}>
                  Enter your email address and we'll send you instructions to
                  reset your password
                </Text>
              </View>

              {/* Input field */}
              <View style={AuthStyles.formFields}>
                <Animated.View
                  style={[
                    AuthStyles.inputWrapper,
                    emailFocused && AuthStyles.inputWrapperFocused,
                  ]}
                >
                  <View style={AuthStyles.inputIconBox}>
                    <Ionicons
                      name="mail"
                      size={22}
                      color={emailFocused ? "#667eea" : "#a0aec0"}
                    />
                  </View>
                  <TextInput
                    style={AuthStyles.textInput}
                    placeholder="Enter your email address"
                    placeholderTextColor="#a0aec0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCorrect={false}
                  />
                </Animated.View>
              </View>

              {/* Reset button */}
              <TouchableOpacity
                style={AuthStyles.loginButton}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    loading
                      ? ["#cbd5e0", "#a0aec0"]
                      : ["#667eea", "#764ba2", "#f093fb"]
                  }
                  style={AuthStyles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {loading ? (
                    <View style={AuthStyles.loadingContainer}>
                      <Animated.View
                        style={[AuthStyles.loadingDot, { opacity: pulseAnim }]}
                      />
                      <Animated.View
                        style={[AuthStyles.loadingDot, { opacity: pulseAnim }]}
                      />
                      <Animated.View
                        style={[AuthStyles.loadingDot, { opacity: pulseAnim }]}
                      />
                    </View>
                  ) : (
                    <>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#ffffff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={AuthStyles.loginButtonText}>
                        Send Reset Instructions
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer links */}
              <View style={AuthStyles.footerLinks}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={AuthStyles.forgotLink}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color="#667eea"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={AuthStyles.forgotText}>Back to Sign In</Text>
                </TouchableOpacity>

                <View style={AuthStyles.signupPrompt}>
                  <Text style={AuthStyles.noAccountText}>
                    Don't have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Register")}
                  >
                    <Text style={AuthStyles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Help section */}
              <View style={AuthStyles.helpSection}>
                <View style={AuthStyles.helpIcon}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color="#a0aec0"
                  />
                </View>
                <Text style={AuthStyles.helpText}>
                  Still having trouble? Contact our support team for assistance.
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

export default ForgotPasswordScreen;
