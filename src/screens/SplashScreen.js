import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Floating particles animation values
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particle4Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the splash animation sequence
    startSplashAnimation();

    // Navigate to Login after 4 seconds
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const startSplashAnimation = () => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Title animation
      Animated.parallel([
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle animation
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Particles animation
      Animated.timing(particleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous animations
    startContinuousAnimations();
  };

  const startContinuousAnimations = () => {
    // Pulse animation for logo
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();

    // Rotation animation for decorative elements
    const rotate = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        rotate();
      });
    };
    rotate();

    // Floating particles animation
    const animateParticles = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle1Y, {
              toValue: -20,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(particle1Y, {
              toValue: 20,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle2Y, {
              toValue: 15,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(particle2Y, {
              toValue: -15,
              duration: 2500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle3Y, {
              toValue: -25,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(particle3Y, {
              toValue: 25,
              duration: 3500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle4Y, {
              toValue: 18,
              duration: 2800,
              useNativeDriver: true,
            }),
            Animated.timing(particle4Y, {
              toValue: -18,
              duration: 2800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };
    animateParticles();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1f36"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#1a1f36", "#2d3561", "#4a5568", "#667eea"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Rotating Background Element */}
        <Animated.View
          style={[
            styles.rotatingBackground,
            {
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.1)"]}
            style={styles.rotatingGradient}
          />
        </Animated.View>

        {/* Floating Particles */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            {
              opacity: particleOpacity,
              transform: [{ translateY: particle1Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            {
              opacity: particleOpacity,
              transform: [{ translateY: particle2Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            {
              opacity: particleOpacity,
              transform: [{ translateY: particle3Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle4,
            {
              opacity: particleOpacity,
              transform: [{ translateY: particle4Y }],
            },
          ]}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2", "#f093fb"]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🍽️</Text>
            </LinearGradient>
          </Animated.View>

          {/* App Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.appTitle}>Smart Canteen</Text>
            <View style={styles.titleUnderline}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.underlineGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View
            style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}
          >
            <Text style={styles.subtitle}>
              Delicious meals at your fingertips
            </Text>
            <Text style={styles.tagline}>Where taste meets technology ✨</Text>
          </Animated.View>

          {/* Loading Indicator */}
          <Animated.View
            style={[styles.loadingContainer, { opacity: particleOpacity }]}
          >
            <View style={styles.loadingDots}>
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.loadingDot,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading your experience...</Text>
          </Animated.View>
        </View>

        {/* Bottom Decoration */}
        <View style={styles.bottomDecoration}>
          <Animated.View
            style={[
              styles.decorativeIcon,
              {
                opacity: particleOpacity,
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            <Ionicons
              name="restaurant"
              size={24}
              color="rgba(255,255,255,0.3)"
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: "relative",
  },
  rotatingBackground: {
    position: "absolute",
    top: -height * 0.5,
    left: -width * 0.5,
    width: width * 2,
    height: height * 2,
  },
  rotatingGradient: {
    flex: 1,
    borderRadius: width,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoEmoji: {
    fontSize: 50,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleUnderline: {
    marginTop: 8,
    width: 120,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  underlineGradient: {
    flex: 1,
  },
  subtitleContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "300",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "400",
    letterSpacing: 0.5,
  },
  // Floating particles
  particle: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  particle1: {
    width: 8,
    height: 8,
    top: "20%",
    left: "15%",
  },
  particle2: {
    width: 12,
    height: 12,
    top: "30%",
    right: "20%",
  },
  particle3: {
    width: 6,
    height: 6,
    top: "60%",
    left: "10%",
  },
  particle4: {
    width: 10,
    height: 10,
    top: "70%",
    right: "15%",
  },
  bottomDecoration: {
    position: "absolute",
    bottom: 60,
    right: 40,
  },
  decorativeIcon: {
    opacity: 0.3,
  },
});

export default SplashScreen;
