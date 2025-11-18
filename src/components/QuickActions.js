import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const QuickActions = ({ favorites, onActionPress, animations, user }) => {
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const navigation = useNavigation();

  // ✅ Fetch user stats from API when user is available
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (!user || !user.id) return;
        setLoadingStats(true);

        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/users/stats/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          console.log("📊 User Stats:", response.data);
          setUserStats(response.data);
        }
      } catch (err) {
        console.error("❌ Error fetching user stats:", err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const quickActions = [
    {
      title: "My Orders",
      icon: "receipt",
      color: "#667eea",
      count: userStats?.orderStats?.totalOrders || 0,
    },
    {
      title: "Favorites",
      icon: "heart",
      color: "#ff6b6b",
      count: favorites?.size?.toString() || "0",
    },
    {
      title: "Rewards",
      icon: "gift",
      color: "#4ecdc4",
      count: userStats?.engagementStats?.totalReviews || "0",
    },
    {
      title: "Wallet",
      icon: "card",
      color: "#ffa726",
      count:
        userStats?.user?.currentBalance !== undefined
          ? `R${userStats.user.currentBalance}`
          : "R0",
    },
  ];

  const QuickActionItem = ({ item }) => (
    <Animated.View
      style={{
        opacity: animations.fadeAnim,
        transform: [{ scale: animations.scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={() => {
          if (item.title === "My Orders") {
            // ✅ FIXED: Navigate to the Orders tab first, then to MyOrders
            navigation.navigate("Profile", {
              screen: "MyOrders",
            });
          } else {
            onActionPress(item.title);
          }
        }}
        className="bg-white rounded-2xl p-4 items-center relative shadow-sm"
        style={{
          width: (width - 60) / 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.8}
      >
        <View
          className="w-10 h-10 rounded-xl justify-center items-center mb-2"
          style={{ backgroundColor: item.color + "15" }}
        >
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>

        <Text className="text-xs font-semibold text-gray-800 text-center">
          {item.title}
        </Text>

        <View
          className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full justify-center items-center px-1.5"
          style={{ backgroundColor: item.color }}
        >
          <Text className="text-xs font-bold text-white">{item.count}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="mb-8">
      <Animated.Text
        className="text-xl font-bold text-gray-800 mx-5 mb-4"
        style={{
          opacity: animations.fadeAnim,
          transform: [{ translateX: animations.slideAnim }],
        }}
      >
        Quick Actions
      </Animated.Text>

      <View className="flex-row justify-between px-5">
        {quickActions.map((item, index) => (
          <QuickActionItem key={index} item={item} />
        ))}
      </View>

      {loadingStats && (
        <Text className="text-xs text-gray-500 text-center mt-2">
          Loading stats...
        </Text>
      )}
    </View>
  );
};

export default QuickActions;
