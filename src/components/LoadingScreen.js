import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

const LoadingScreen = () => {
  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: "#667eea" }}
    >
      <View className="items-center">
        <View className="mb-5">
          <ActivityIndicator size="large" color="white" />
        </View>
        <Text className="text-white text-lg font-semibold mb-2 text-center">
          Finding delicious meals for you...
        </Text>
        <Text className="text-white text-base opacity-80">
          🍽️ Almost ready!
        </Text>
      </View>
    </View>
  );
};

export default LoadingScreen;
