import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL, TOKEN_KEY } from "../../config";
import JWT from "expo-jwt";

const { width, height } = Dimensions.get("window");

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      let userId;
      try {
        const decoded = JWT.decode(token, TOKEN_KEY);
        userId = decoded.id;
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        setLoading(false);
        return;
      }

      console.log("---------------------------");
      console.log("userId: " + userId);
      console.log("---------------------------");

      const response = await fetch(`${BASE_URL}/users/getOne/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      console.log("---------------------------");
      console.log("data: ", data);
      console.log("---------------------------");

      if (response.ok) {
        setUser(data);
        // Animate in the content
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        console.error(data.error || "Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const ProfileCard = ({ icon, label, value, gradient }) => (
    <Animated.View
      style={[
        styles.profileCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.cardIcon}>{icon}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>{value}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.center}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorText}>No user data found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUser}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#ff9a9e", "#fecfef"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userName}>{user.full_name || "User"}</Text>
          </Animated.View>

          {/* Profile Cards */}
          <View style={styles.cardsContainer}>
            <ProfileCard
              icon="👤"
              label="Full Name"
              value={user.full_name}
              gradient={["#ff9a9e", "#fecfef"]}
            />
            <ProfileCard
              icon="📧"
              label="Email Address"
              value={user.email}
              gradient={["#a8edea", "#fed6e3"]}
            />
            <ProfileCard
              icon="🎓"
              label="Student ID"
              value={user.student_id}
              gradient={["#ffecd2", "#fcb69f"]}
            />
          </View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>✏️ Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>⚙️ Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 15,
    fontWeight: "500",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    padding: 30,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  profileCard: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 24,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  actionButton: {
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
