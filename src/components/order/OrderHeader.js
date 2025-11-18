// components/OrderHeader.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const OrderHeader = ({ connectionStatus, order, navigation, onRefresh }) => {
  const getEstimatedTime = (readyTime) => {
    const now = new Date();
    const ready = new Date(readyTime);
    const diff = Math.max(0, Math.ceil((ready - now) / (1000 * 60)));
    return diff > 0 ? `${diff} minutes` : "Ready now";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "preparing":
        return "Preparing Your Order";
      case "ready":
        return "Ready for Pickup";
      case "pending":
        return "Order Received";
      case "confirmed":
        return "Order Confirmed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <View className="px-5 pt-2">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <Text className="text-xs text-gray-600">
              {connectionStatus === "connected"
                ? "Live Updates Active"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Offline Mode"}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header Section */}
      <View
        className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-5 pb-8 rounded-b-3xl"
        style={{ backgroundColor: "#667eea" }}
      >
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-5">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white">
              Order Tracking
            </Text>
            <View className="bg-white/20 px-3 py-2 rounded-2xl">
              <Text className="text-white font-semibold text-sm">
                #{order.orderNumber?.split("-")[1]?.slice(-4) || order.id}
              </Text>
            </View>
          </View>

          <View className="items-center">
            <View className="flex-row items-center bg-white/15 px-4 py-3 rounded-2xl mb-2">
              <View className="w-2 h-2 bg-green-400 rounded-full mr-3" />
              <Text className="text-white font-semibold text-base">
                {getStatusText(order.status)}
              </Text>
            </View>
            <Text className="text-white/90 text-base font-medium">
              🕐 Ready in {getEstimatedTime(order.estimatedReadyTime)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default OrderHeader;
