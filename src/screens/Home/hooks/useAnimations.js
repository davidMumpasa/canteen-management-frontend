import { useState } from "react";
import { Animated } from "react-native";

const useAnimations = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [productsOpacity] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const startInitialAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    productsOpacity,
    pulseAnim,
    startInitialAnimations,
  };
};

export { useAnimations };
