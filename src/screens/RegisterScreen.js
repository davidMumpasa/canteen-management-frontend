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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AuthStyles from "../styles/AuthStyles";
import { BASE_URL } from "../../config";

const { height, width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [studentIdFocused, setStudentIdFocused] = useState(false);
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
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
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      Alert.alert("Success", "Account created successfully! 🎉", [
        { text: "Continue", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      Alert.alert("Registration Error", err.message);
    } finally {
      setLoading(false);
    }
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
                <Text style={AuthStyles.logoEmoji}>🍽️</Text>
              </LinearGradient>
            </View>
            <Text style={AuthStyles.brandTitle}>Smart Canteen</Text>
            <Text style={AuthStyles.brandSubtitle}>
              Join our culinary community
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Bottom sheet style register card */}
        <Animated.View
          style={[
            AuthStyles.registerCard,
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
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={AuthStyles.loginContent}>
                <View style={AuthStyles.formHeader}>
                  <Text style={AuthStyles.welcomeText}>Join Us!</Text>
                  <Text style={AuthStyles.loginSubtext}>
                    Create your account to get started
                  </Text>
                </View>

                {/* Input fields */}
                <View style={AuthStyles.formFields}>
                  <Animated.View
                    style={[
                      AuthStyles.inputWrapper,
                      studentIdFocused && AuthStyles.inputWrapperFocused,
                    ]}
                  >
                    <View style={AuthStyles.inputIconBox}>
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={studentIdFocused ? "#667eea" : "#a0aec0"}
                      />
                    </View>
                    <TextInput
                      style={AuthStyles.textInput}
                      placeholder="First Name"
                      placeholderTextColor="#a0aec0"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setStudentIdFocused(true)}
                      onBlur={() => setStudentIdFocused(false)}
                      keyboardType="words"
                    />
                  </Animated.View>

                  <Animated.View
                    style={[
                      AuthStyles.inputWrapper,
                      fullNameFocused && AuthStyles.inputWrapperFocused,
                    ]}
                  >
                    <View style={AuthStyles.inputIconBox}>
                      <Ionicons
                        name="person"
                        size={22}
                        color={fullNameFocused ? "#667eea" : "#a0aec0"}
                      />
                    </View>
                    <TextInput
                      style={AuthStyles.textInput}
                      placeholder="Lst Name"
                      placeholderTextColor="#a0aec0"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFullNameFocused(true)}
                      onBlur={() => setFullNameFocused(false)}
                      autoCapitalize="words"
                    />
                  </Animated.View>

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
                      placeholder="Email Address"
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
                      placeholder="Password"
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

                  <Animated.View
                    style={[
                      AuthStyles.inputWrapper,
                      confirmPasswordFocused && AuthStyles.inputWrapperFocused,
                    ]}
                  >
                    <View style={AuthStyles.inputIconBox}>
                      <Ionicons
                        name="lock-closed"
                        size={22}
                        color={confirmPasswordFocused ? "#667eea" : "#a0aec0"}
                      />
                    </View>
                    <TextInput
                      style={AuthStyles.textInput}
                      placeholder="Confirm Password"
                      placeholderTextColor="#a0aec0"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={AuthStyles.passwordToggle}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={22}
                        color="#a0aec0"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* Register button */}
                <TouchableOpacity
                  style={AuthStyles.loginButton}
                  onPress={handleRegister}
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
                          style={[
                            AuthStyles.loadingDot,
                            { opacity: pulseAnim },
                          ]}
                        />
                        <Animated.View
                          style={[
                            AuthStyles.loadingDot,
                            { opacity: pulseAnim },
                          ]}
                        />
                        <Animated.View
                          style={[
                            AuthStyles.loadingDot,
                            { opacity: pulseAnim },
                          ]}
                        />
                      </View>
                    ) : (
                      <Text style={AuthStyles.loginButtonText}>
                        Create Account
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Footer links */}
                <View style={AuthStyles.footerLinks}>
                  <View style={AuthStyles.signupPrompt}>
                    <Text style={AuthStyles.noAccountText}>
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Login")}
                    >
                      <Text style={AuthStyles.signupLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

export default RegisterScreen;
