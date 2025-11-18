// components/OrderActionButtons.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderActionButtons = () => {
  return (
    <View className="flex-row px-5 pb-8 space-x-4">
      <TouchableOpacity className="flex-1 bg-white border-2 border-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md mr-2">
        <Ionicons name="call" size={20} color="#667eea" />
        <Text className="text-indigo-600 font-bold ml-2">Contact Canteen</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 bg-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md ml-2">
        <Ionicons name="navigate" size={20} color="white" />
        <Text className="text-white font-bold ml-2">Get Directions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderActionButtons;
