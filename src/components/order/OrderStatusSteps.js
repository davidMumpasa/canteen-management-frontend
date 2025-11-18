// components/OrderStatusSteps.js
import React, { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderStatusSteps = ({ order, currentStep }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const statusSteps = [
    {
      label: "Order Placed",
      icon: "checkmark-circle",
      description: "Order confirmed",
      time: order ? formatTime(order.createdAt) : "",
    },
    {
      label: "Payment Verified",
      icon: "card",
      description: "Payment successful",
      time: order ? formatTime(order.createdAt) : "",
    },
    {
      label: "Preparing",
      icon: "restaurant",
      description: "Chef is cooking",
      time: "Now",
    },
    {
      label: "Ready for Pickup",
      icon: "bag-handle",
      description: "Come collect",
      time: order ? `~${formatTime(order.estimatedReadyTime)}` : "",
    },
  ];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [currentStep]);

  return (
    <View className="px-5 mb-5">
      {statusSteps.map((step, index) => (
        <View key={index} className="mb-1">
          <View className="flex-row items-start">
            <View className="items-center mr-4">
              <Animated.View
                style={[
                  {
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    backgroundColor:
                      index <= currentStep ? "#667eea" : "#f5f6fa",
                    borderColor: index <= currentStep ? "#667eea" : "#e0e0e0",
                    shadowColor: "#667eea",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                  index === currentStep && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={24}
                  color={index <= currentStep ? "white" : "#999"}
                />
              </Animated.View>
              {index < statusSteps.length - 1 && (
                <View
                  className="w-0.5 h-10 mt-1"
                  style={{
                    backgroundColor:
                      index < currentStep ? "#667eea" : "#e0e0e0",
                  }}
                />
              )}
            </View>

            <View className="flex-1 pt-2">
              <Text
                className="text-base font-semibold mb-1"
                style={{ color: index <= currentStep ? "#333" : "#999" }}
              >
                {step.label}
              </Text>
              <Text className="text-gray-600 text-sm mb-1">
                {step.description}
              </Text>
              <Text className="text-gray-400 text-xs">{step.time}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default OrderStatusSteps;
