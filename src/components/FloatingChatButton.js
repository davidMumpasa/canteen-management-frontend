import React from "react";
import { TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FloatingChatButton = ({ isConnected, animations }) => {
  return (
    <Animated.View
      className="absolute bottom-8 right-5"
      style={{
        opacity: animations.fadeAnim,
        transform: [{ scale: animations.scaleAnim }],
        shadowColor: "#ff6b6b",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <TouchableOpacity
        className="w-15 h-15 rounded-full justify-center items-center relative"
        style={{ backgroundColor: "#ff6b6b" }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble" size={24} color="white" />
        {isConnected && (
          <Animated.View
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
            style={{
              transform: [{ scale: animations.pulseAnim }],
            }}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingChatButton;
