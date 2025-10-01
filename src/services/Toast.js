// 1. Toast Notification Component (components/Toast.js)
import React, { useState, useEffect } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Toast = ({
  message,
  type = "success",
  visible,
  onHide,
  duration = 3000,
}) => {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "#10B981", iconName: "checkmark-circle" };
      case "warning":
        return { backgroundColor: "#F59E0B", iconName: "warning" };
      case "error":
        return { backgroundColor: "#EF4444", iconName: "close-circle" };
      case "info":
        return { backgroundColor: "#3B82F6", iconName: "information-circle" };
      default:
        return { backgroundColor: "#10B981", iconName: "checkmark-circle" };
    }
  };

  if (!visible) return null;

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={{
          backgroundColor: toastStyle.backgroundColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name={toastStyle.iconName} size={24} color="white" />
        <Text
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: "600",
            marginLeft: 12,
            flex: 1,
          }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default Toast;
