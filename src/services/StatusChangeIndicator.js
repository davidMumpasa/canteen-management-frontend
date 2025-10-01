// components/StatusChangeIndicator.js
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatusChangeIndicator = ({ show, oldStatus, newStatus, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      // reset values before starting
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.delay(1500),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        onComplete && onComplete();
      });
    }
  }, [show]);

  if (!show) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9998,
      }}
    >
      <Animated.View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 32,
          paddingVertical: 24,
          borderRadius: 16,
          alignItems: "center",
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="refresh" size={48} color="#667eea" />
        </Animated.View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}>
          Status Updated!
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {oldStatus} → {newStatus}
        </Text>
      </Animated.View>
    </View>
  );
};

export default StatusChangeIndicator;
