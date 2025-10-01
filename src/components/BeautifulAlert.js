// components/BeautifulAlert.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const BeautifulAlert = ({
  visible,
  type = "info", // 'success', 'error', 'warning', 'info'
  title,
  message,
  buttons = [{ text: "OK", onPress: () => {} }],
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close for success messages
      if (autoClose && type === "success") {
        setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
      }
    }
  }, [visible]);

  const handleClose = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          colors: ["#10B981", "#059669"],
          icon: "checkmark-circle",
          iconColor: "#FFFFFF",
          borderColor: "#10B981",
          bgColor: "#F0FDF4",
        };
      case "error":
        return {
          colors: ["#EF4444", "#DC2626"],
          icon: "close-circle",
          iconColor: "#FFFFFF",
          borderColor: "#EF4444",
          bgColor: "#FEF2F2",
        };
      case "warning":
        return {
          colors: ["#F59E0B", "#D97706"],
          icon: "warning",
          iconColor: "#FFFFFF",
          borderColor: "#F59E0B",
          bgColor: "#FFFBEB",
        };
      default:
        return {
          colors: ["#3B82F6", "#2563EB"],
          icon: "information-circle",
          iconColor: "#FFFFFF",
          borderColor: "#3B82F6",
          bgColor: "#EFF6FF",
        };
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <Animated.View
        className="flex-1 justify-center items-center px-6"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          className="w-full max-w-sm bg-white rounded-3xl overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={config.colors}
            className="px-6 pt-8 pb-6 items-center"
          >
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
              <Ionicons name={config.icon} size={32} color={config.iconColor} />
            </View>
            <Text className="text-white text-xl font-bold text-center">
              {title}
            </Text>
          </LinearGradient>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="text-gray-700 text-base text-center leading-6 mb-6">
              {message}
            </Text>

            {/* Buttons */}
            <View className="space-y-3">
              {buttons.map((button, index) => {
                const isPrimary = index === buttons.length - 1;
                return (
                  <TouchableOpacity
                    key={index}
                    className={`py-4 px-6 rounded-2xl ${
                      isPrimary ? "overflow-hidden" : "border-2 border-gray-200"
                    }`}
                    onPress={() => {
                      button.onPress();
                      if (button.autoClose !== false) {
                        handleClose();
                      }
                    }}
                    style={
                      isPrimary
                        ? {
                            shadowColor: config.colors[0],
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6,
                          }
                        : {}
                    }
                  >
                    {isPrimary && (
                      <LinearGradient
                        colors={config.colors}
                        className="absolute inset-0"
                      />
                    )}
                    <Text
                      className={`text-center font-semibold text-base ${
                        isPrimary ? "text-white" : "text-gray-700"
                      }`}
                      style={{ zIndex: 1 }}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Hook for using the alert
export const useBeautifulAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = (config) => {
    setAlertConfig({
      visible: true,
      ...config,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const alert = {
    success: (title, message, buttons) =>
      showAlert({
        type: "success",
        title,
        message,
        buttons: buttons || [{ text: "Great!", onPress: () => {} }],
        autoClose: true,
      }),
    error: (title, message, buttons) =>
      showAlert({
        type: "error",
        title,
        message,
        buttons: buttons || [{ text: "Try Again", onPress: () => {} }],
      }),
    warning: (title, message, buttons) =>
      showAlert({
        type: "warning",
        title,
        message,
        buttons: buttons || [{ text: "OK", onPress: () => {} }],
      }),
    info: (title, message, buttons) =>
      showAlert({
        type: "info",
        title,
        message,
        buttons: buttons || [{ text: "OK", onPress: () => {} }],
      }),
    custom: (config) => showAlert(config),
  };

  const AlertComponent = () => (
    <BeautifulAlert {...alertConfig} onClose={hideAlert} />
  );

  return { alert, AlertComponent, hideAlert };
};

export default BeautifulAlert;
