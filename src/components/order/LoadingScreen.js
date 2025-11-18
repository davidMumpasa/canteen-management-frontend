// components/LoadingScreen.js
import React from "react";
import { SafeAreaView, ActivityIndicator, Text } from "react-native";

const LoadingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
      <ActivityIndicator size="large" color="#667eea" />
      <Text className="mt-4 text-gray-600">Loading your orders...</Text>
    </SafeAreaView>
  );
};

export default LoadingScreen;
