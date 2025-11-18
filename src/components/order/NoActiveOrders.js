// components/NoActiveOrders.js
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NoActiveOrders = ({ navigation, onRefresh }) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View className="absolute top-12 left-5">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        <View className="items-center max-w-sm">
          {/* Icon */}
          <View className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full justify-center items-center mb-8 shadow-lg">
            <Ionicons name="restaurant-outline" size={64} color="#667eea" />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            No Active Orders
          </Text>

          {/* Description */}
          <Text className="text-base text-gray-600 text-center leading-relaxed mb-8">
            You don't have any active orders at the moment. Ready to satisfy
            your cravings? Browse our delicious menu and place your next order!
          </Text>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("Main", { screen: "Home" })}
              className="w-full bg-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md"
            >
              <Ionicons name="restaurant" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Browse Menu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("MyOrders")}
              className="w-full bg-white border-2 border-indigo-600 py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-md"
            >
              <Ionicons name="receipt" size={20} color="#667eea" />
              <Text className="text-indigo-600 font-bold text-lg ml-2">
                View Order History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRefresh}
              className="w-full bg-gray-100 py-3 px-6 rounded-2xl flex-row justify-center items-center"
            >
              <Ionicons name="refresh" size={18} color="#6B7280" />
              <Text className="text-gray-600 font-semibold ml-2">Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Help Text */}
          <View className="mt-8 p-4 bg-blue-50 rounded-2xl w-full">
            <View className="flex-row items-start">
              <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-blue-900 mb-1">
                  Quick Tip
                </Text>
                <Text className="text-sm text-blue-700 leading-relaxed">
                  Once you place an order, you can track its progress in
                  real-time right here. Get notified when it's ready for pickup!
                </Text>
              </View>
            </View>
          </View>

          {/* Fun motivational message */}
          <View className="mt-4 p-4 bg-orange-50 rounded-2xl w-full">
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">🍽️</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-orange-900 mb-1">
                  Hungry? We've Got You Covered!
                </Text>
                <Text className="text-sm text-orange-700 leading-relaxed">
                  From quick snacks to hearty meals, our kitchen is ready to
                  serve you something delicious.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NoActiveOrders;
