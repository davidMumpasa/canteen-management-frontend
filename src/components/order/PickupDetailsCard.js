// components/PickupDetailsCard.js
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PickupDetailsCard = ({ order }) => {
  return (
    <View className="mx-5 mb-5 bg-white rounded-3xl shadow-lg overflow-hidden">
      <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-gray-100">
        <View className="w-10 h-10 bg-indigo-100 rounded-xl justify-center items-center mr-3">
          <Ionicons name="location" size={24} color="#667eea" />
        </View>
        <Text className="text-lg font-bold text-gray-900">
          Pickup Information
        </Text>
      </View>

      <View className="p-5">
        <View className="space-y-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 flex-1">Location</Text>
            <Text className="font-semibold text-gray-900 flex-2 text-right">
              {order.specialInstructions
                ?.split(",")[0]
                .replace("Campus: ", "") || "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 flex-1">Counter</Text>
            <Text className="font-semibold text-gray-900 flex-2 text-right">
              {order.specialInstructions
                ?.split(",")[1]
                ?.replace("Pickup: ", "") || "N/A"}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-600 flex-1">Prepared by</Text>
            <Text className="font-semibold text-gray-900 flex-2 text-right">
              {order.preparedBy || "👨‍🍳 Chef"}
            </Text>
          </View>
        </View>

        <View className="items-center mt-6">
          <Text className="text-gray-600 mb-3">Your Pickup Code</Text>
          <View className="bg-indigo-600 px-6 py-4 rounded-2xl shadow-lg">
            <Text className="text-white font-bold text-4xl tracking-widest">
              {order.pickupCode || "------"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start mt-4 p-4 bg-red-50 rounded-2xl">
          <Ionicons name="bulb" size={20} color="#ff6b6b" />
          <Text className="text-gray-700 text-sm ml-3 flex-1 leading-5">
            Show this code at the pickup counter to collect your order
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PickupDetailsCard;
