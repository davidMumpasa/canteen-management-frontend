// CustomBottomNav.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function CustomBottomNav({ state, descriptors, navigation }) {
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
              onPress={() => navigation.navigate(route.name)}
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

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("Chatbot")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#ff6b6b", "#ff8e8e"]}
          style={styles.chatButtonGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
  chatButton: {
    position: "absolute",
    bottom: 110,
    right: 20,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  chatButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
