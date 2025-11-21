import React, { useRef, useMemo, useState, useEffect } from "react";
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
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BottomSheet, { BottomSheetMethods } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";
import AuthStyles from "../styles/AuthStyles";

const { height, width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Custom alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success", // 'success', 'error', 'warning'
    title: "",
    message: "",
    icon: "checkmark-circle",
  });

  const bottomSheetRef = useRef(null);
  const slideUpAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const alertSlideAnim = useRef(new Animated.Value(-100)).current;
  const alertOpacityAnim = useRef(new Animated.Value(0)).current;

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

  const snapPoints = useMemo(() => ["35%", "55%"], []);

  // Custom Alert Function
  const showCustomAlert = (type, title, message) => {
    const configs = {
      success: {
        icon: "checkmark-circle",
        color: "#10B981",
        bgColor: "#D1FAE5",
      },
      error: {
        icon: "close-circle",
        color: "#EF4444",
        bgColor: "#FEE2E2",
      },
      warning: {
        icon: "warning",
        color: "#F59E0B",
        bgColor: "#FEF3C7",
      },
    };

    setAlertConfig({
      type,
      title,
      message,
      ...configs[type],
    });
    setAlertVisible(true);

    // Animate in
    Animated.parallel([
      Animated.spring(alertSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(alertOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      dismissAlert();
    }, 3000);
  };

  const dismissAlert = () => {
    Animated.parallel([
      Animated.timing(alertSlideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(alertOpacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlertVisible(false);
      alertSlideAnim.setValue(-100);
      alertOpacityAnim.setValue(0);
    });
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      showCustomAlert(
        "error",
        "Missing Fields",
        "Please fill in all fields to continue"
      );
      return;
    }

    if (!email.includes("@")) {
      showCustomAlert(
        "error",
        "Invalid Email",
        "Please enter a valid email address"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("userRole", data.user.role);

      // Show success and open bottom sheet
      showCustomAlert(
        "success",
        "Login Successful",
        `Welcome back, ${data.user.firstName || "User"}!`
      );

      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(0);
      }, 500);

      setTimeout(() => goToHome(), 2000);
    } catch (err) {
      showCustomAlert(
        "error",
        "Login Failed",
        err.message || "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    bottomSheetRef.current?.close();

    AsyncStorage.getItem("userRole").then((role) => {
      if (role === "driver") {
        navigation.reset({
          index: 0,
          routes: [{ name: "DeliveryDriver" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f36" />
      <SafeAreaView style={AuthStyles.container}>
        {/* Background with gradient */}
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

          {/* Header section */}
          <Animated.View
            style={[
              AuthStyles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={AuthStyles.logoWrapper}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={AuthStyles.logoGradient}
              >
                <Text style={AuthStyles.logoEmoji}>🍽️</Text>
              </LinearGradient>
            </View>
            <Text style={AuthStyles.brandTitle}>Smart Canteen</Text>
            <Text style={AuthStyles.brandSubtitle}>
              Delicious meals at your fingertips
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Login card */}
        <Animated.View
          style={[
            AuthStyles.loginCard,
            {
              transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={AuthStyles.dragHandle} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={AuthStyles.loginContent}>
              <View style={AuthStyles.formHeader}>
                <Text style={AuthStyles.welcomeText}>Welcome Back!</Text>
                <Text style={AuthStyles.loginSubtext}>
                  Sign in to continue your culinary journey
                </Text>
              </View>

              {/* Input fields */}
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
                    placeholder="Enter your email"
                    placeholderTextColor="#a0aec0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    AuthStyles.inputWrapper,
                    passwordFocused && AuthStyles.inputWrapperFocused,
                  ]}
                >
                  <View style={AuthStyles.inputIconBox}>
                    <Ionicons
                      name="lock-closed"
                      size={22}
                      color={passwordFocused ? "#667eea" : "#a0aec0"}
                    />
                  </View>
                  <TextInput
                    style={AuthStyles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#a0aec0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={AuthStyles.passwordToggle}
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={22}
                      color="#a0aec0"
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Login button */}
              <TouchableOpacity
                style={AuthStyles.loginButton}
                onPress={handleLogin}
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
                    <Text style={AuthStyles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer links */}
              <View style={AuthStyles.footerLinks}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={AuthStyles.forgotLink}
                >
                  <Text style={AuthStyles.forgotText}>
                    Forgot your password?
                  </Text>
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
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

        {/* Custom Alert Toast */}
        {alertVisible && (
          <Animated.View
            style={[
              styles.alertContainer,
              {
                transform: [{ translateY: alertSlideAnim }],
                opacity: alertOpacityAnim,
                backgroundColor: alertConfig.bgColor,
              },
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons
                name={alertConfig.icon}
                size={28}
                color={alertConfig.color}
              />
              <View style={styles.alertTextContainer}>
                <Text style={[styles.alertTitle, { color: alertConfig.color }]}>
                  {alertConfig.title}
                </Text>
                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              </View>
              <TouchableOpacity
                onPress={dismissAlert}
                style={styles.alertCloseButton}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Success Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backgroundStyle={AuthStyles.successSheetBackground}
          handleStyle={AuthStyles.successSheetHandle}
        >
          <LinearGradient
            colors={["#f0fff4", "#e6fffa"]}
            style={AuthStyles.successContent}
          >
            <Animated.View
              style={[
                AuthStyles.successIcon,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name="checkmark-circle" size={80} color="#38a169" />
            </Animated.View>

            <Text style={AuthStyles.successTitle}>Welcome Back! 🎉</Text>
            <Text style={AuthStyles.successMessage}>
              You're all set! Let's explore delicious meals together.
            </Text>

            <TouchableOpacity
              onPress={goToHome}
              style={AuthStyles.continueButton}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#38a169", "#48bb78"]}
                style={AuthStyles.continueButtonGradient}
              >
                <Text style={AuthStyles.continueButtonText}>
                  Continue to Dashboard
                </Text>
                <Ionicons name="arrow-forward-circle" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </BottomSheet>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: "#374151",
  },
  alertCloseButton: {
    padding: 4,
  },
});

export default LoginScreen;
