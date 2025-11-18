import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";

const ConnectionStatus = ({ connectionStatus, isConnected, animations }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connectionStatus === "connected") {
      // Pulse animation for connected state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionStatus]);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-emerald-400";
      case "connecting":
        return "bg-amber-400";
      case "disconnected":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live Updates Active";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Offline Mode";
      default:
        return "Unknown Status";
    }
  };

  const getLastUpdateText = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }; // Only show if not connected or connecting
  if (connectionStatus === "connected") {
    return null;
  }

  return (
    <View className="w-full items-center justify-center px-4 -mt-2 mb-3">
      <Animated.View
        className="flex-row items-center rounded-xl px-4 py-2.5 border border-gray-200/50"
        style={{
          backgroundColor:
            connectionStatus === "connecting"
              ? "rgba(251, 191, 36, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
          shadowColor:
            connectionStatus === "connecting" ? "#f59e0b" : "#ef4444",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Animated Status Dot */}
        <Animated.View
          className={`w-2 h-2 rounded-full mr-2.5 ${getConnectionStatusColor()}`}
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        />

        {/* Status Text */}
        <Text
          className={`text-xs font-semibold ${
            connectionStatus === "connecting"
              ? "text-amber-700"
              : "text-red-700"
          }`}
        >
          {getConnectionStatusText()}
        </Text>
      </Animated.View>
    </View>
  );
};

export default ConnectionStatus;
