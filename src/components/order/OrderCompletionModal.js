// components/OrderCompletionModal.js
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderCompletionModal = ({
  order,
  onContinueShopping,
  onViewOrders,
  onItemPress,
}) => {
  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-5 z-50">
      <View className="bg-white rounded-3xl p-6 w-full max-w-md">
        <View className="items-center mb-4">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Order Completed! 🎉
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            Your order has been completed successfully. How was your experience?
          </Text>
        </View>

        {/* Order Items for Review */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Rate Your Items:
          </Text>
          <ScrollView className="max-h-60">
            {order.orderItems?.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onItemPress(item)}
                className="flex-row items-center bg-gray-50 rounded-2xl p-3 mb-2"
              >
                <Text className="text-3xl mr-3">
                  {item?.product?.image || "🍽️"}
                </Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {item?.product?.name || "Unknown Item"}
                  </Text>
                  <Text className="text-gray-500 text-sm">Tap to review</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#667eea" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={onContinueShopping}
            className="bg-indigo-600 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-lg">
              Continue Shopping
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onViewOrders}
            className="bg-white border-2 border-indigo-600 py-4 rounded-2xl items-center"
          >
            <Text className="text-indigo-600 font-bold text-lg">
              View Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OrderCompletionModal;
