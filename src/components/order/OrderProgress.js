// components/OrderProgress.js
import React, { useState, useEffect } from "react";
import { View, Animated } from "react-native";

const OrderProgress = ({ currentStep }) => {
  const [progressAnim] = useState(new Animated.Value(0));
  const totalSteps = 4; // Total number of status steps

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  return (
    <View className="px-5 -mt-4 mb-5">
      <View className="h-1 bg-white rounded-full shadow-sm overflow-hidden">
        <View className="absolute inset-0 bg-gray-200 rounded-full" />
        <Animated.View
          className="h-full bg-indigo-600 rounded-full"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>
    </View>
  );
};

export default OrderProgress;
