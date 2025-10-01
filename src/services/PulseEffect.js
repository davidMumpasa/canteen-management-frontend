import React, { useEffect, useState } from "react";
import { Animated } from "react-native";

const PulseEffect = ({ children, trigger, color = "#667eea" }) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (trigger) {
      // Pulse effect
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow effect
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnim,
        shadowRadius: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
        elevation: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
      }}
    >
      {children}
    </Animated.View>
  );
};

export default PulseEffect;
