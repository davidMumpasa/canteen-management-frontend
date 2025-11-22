import React, { useRef } from "react";
import { Animated, PanResponder, Dimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 60;

const FloatingChatButton = ({ onPress, isConnected }) => {
  const position = useRef(
    new Animated.ValueXY({
      x: SCREEN_WIDTH - BUTTON_SIZE - 40,
      y: SCREEN_HEIGHT - BUTTON_SIZE - 150,
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },

      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (evt, gestureState) => {
        position.flattenOffset();

        // Check if it was a tap (minimal movement)
        const distanceMoved = Math.sqrt(
          gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy
        );

        if (distanceMoved < 10) {
          console.log("Tap detected! Navigating to Chatbot...");

          // ✅ Just call the onPress prop that was passed in
          if (onPress) {
            onPress();
          }
        } else {
          // It's a drag - apply constraints
          const finalX = Math.max(
            0,
            Math.min(position.x._value, SCREEN_WIDTH - BUTTON_SIZE)
          );
          const finalY = Math.max(
            0,
            Math.min(position.y._value, SCREEN_HEIGHT - BUTTON_SIZE - 100)
          );

          Animated.spring(position, {
            toValue: { x: finalX, y: finalY },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          transform: position.getTranslateTransform(),
          shadowColor: "#ff6b6b",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        },
      ]}
    >
      <LinearGradient
        colors={["#ff6b6b", "#ff8e8e"]}
        style={{
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="white" />

        {isConnected && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              backgroundColor: "#4ade80",
              borderRadius: 8,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        )}
      </LinearGradient>
    </Animated.View>
  );
};

export default FloatingChatButton;
