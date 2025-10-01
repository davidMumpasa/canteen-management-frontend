import React from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Animated,
} from "react-native";

const Spinner = ({
  size = "large",
  color = "#0070BA",
  message = "Loading...",
  backgroundColor = "rgba(255, 255, 255, 0.95)",
  textColor = "#374151",
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor, opacity: fadeAnim }]}
    >
      <View style={styles.content}>
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size={size} color={color} />
        </View>
        {message ? (
          <Text style={[styles.text, { color: textColor }]}>{message}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
  },
  spinnerWrapper: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

export default Spinner;
