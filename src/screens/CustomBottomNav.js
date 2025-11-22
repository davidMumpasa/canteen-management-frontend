// CustomBottomNav.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import FloatingChatButton from "../components/FloatingChatButton";

export default function CustomBottomNav({ state, descriptors, navigation }) {
  // ✅ Add safety checks
  if (!state || !descriptors || !navigation) {
    console.error("CustomBottomNav: Missing required props", {
      hasState: !!state,
      hasDescriptors: !!descriptors,
      hasNavigation: !!navigation,
    });
    return null;
  }

  const handleTabPress = (routeName) => {
    switch (routeName) {
      case "Home":
        navigation.navigate("Home", { screen: "HomeMain" });
        break;
      case "Cart":
        navigation.navigate("Cart", { screen: "CartMain" });
        break;
      case "Orders":
        navigation.navigate("Orders", { screen: "OrdersMain" });
        break;
      case "Profile":
        navigation.navigate("Profile", { screen: "ProfileMain" });
        break;
      default:
        navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#ffffff", "#f8f9fa"]} style={styles.navBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const icons = {
            Home: "home",
            Cart: "cart",
            Orders: "receipt",
            Profile: "person",
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.navItem}
              onPress={() => handleTabPress(route.name)}
            >
              {isFocused ? (
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.activeNavButton}
                >
                  <Ionicons name={icons[route.name]} size={24} color="white" />
                </LinearGradient>
              ) : (
                <View style={styles.navButton}>
                  <Ionicons name={icons[route.name]} size={24} color="#999" />
                </View>
              )}
              <Text
                style={[styles.navLabel, isFocused && styles.navLabelActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>

      <FloatingChatButton
        onPress={() => {
          try {
            console.log("Navigating to Chatbot from FloatingChatButton");
            navigation.navigate("Home", { screen: "Chatbot" });
          } catch (error) {
            console.error("Navigation error:", error);
          }
        }}
        isConnected={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 0, width: "100%" },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: { alignItems: "center" },
  navButton: { padding: 10, borderRadius: 30, backgroundColor: "transparent" },
  activeNavButton: { padding: 10, borderRadius: 30 },
  navLabel: { fontSize: 12, color: "#999", marginTop: 4 },
  navLabelActive: { color: "#764ba2", fontWeight: "bold" },
});
