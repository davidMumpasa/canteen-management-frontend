// components/OrderSummaryCard.js
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderSummaryCard = ({ order }) => {
  return (
    <View className="mx-5 mb-5 bg-white rounded-3xl shadow-lg overflow-hidden">
      <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-gray-100">
        <View className="w-10 h-10 bg-indigo-100 rounded-xl justify-center items-center mr-3">
          <Ionicons name="receipt" size={24} color="#667eea" />
        </View>
        <Text className="text-lg font-bold text-gray-900">Order Summary</Text>
      </View>

      <View className="p-5">
        {order.orderItems?.map((item) => (
          <View
            key={item.id}
            className="flex-row justify-between items-center mb-4"
          >
            <View className="flex-row items-center flex-1">
              <Text className="text-2xl mr-3">{item.product.image}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {item.product.name}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Qty: {item.quantity}
                </Text>
                {item.specialRequests && (
                  <Text className="text-gray-500 text-xs italic">
                    {item.specialRequests}
                  </Text>
                )}
              </View>
            </View>
            <Text className="font-bold text-gray-900">
              ${parseFloat(item.totalPrice).toFixed(2)}
            </Text>
          </View>
        ))}

        {parseFloat(order.discount || 0) > 0 && (
          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <Text className="text-green-600">Discount</Text>
            <Text className="font-semibold text-green-600">
              -${parseFloat(order.discount).toFixed(2)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
          <Text className="text-xl font-bold text-indigo-600">
            ${parseFloat(order.totalAmount).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OrderSummaryCard;
