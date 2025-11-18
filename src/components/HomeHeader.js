import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { BellRing } from "lucide-react-native";

const HomeHeader = ({ user, unreadCount, onNotificationPress, animations }) => {
  const { fadeAnim, slideAnim, scaleAnim, pulseAnim } = animations;

  return (
    <View className="z-10">
      <View
        className="pb-8 rounded-b-3xl"
        style={{ backgroundColor: "#667eea" }}
      >
        <View className="flex-row justify-between items-center px-5 pt-2.5 mt-10">
          <View className="flex-1">
            <Animated.Text
              className="text-3xl font-bold text-white mb-1"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              Hello, {user.firstName}! 👋
            </Animated.Text>
            <Animated.Text
              className="text-base text-white opacity-80"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              What would you like to eat today?
            </Animated.Text>
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              onPress={onNotificationPress}
              className="relative"
              activeOpacity={0.8}
            >
              <View
                className="w-12 h-12 rounded-full justify-center items-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 8,
                }}
              >
                <BellRing size={24} color="white" strokeWidth={2.5} />

                {unreadCount > 0 && (
                  <View
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full justify-center items-center px-1.5"
                    style={{
                      backgroundColor: "#ef4444",
                      shadowColor: "#ef4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text className="text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}

                {unreadCount > 0 && (
                  <Animated.View
                    className="absolute inset-0 rounded-full border-2 border-white"
                    style={{
                      opacity: pulseAnim.interpolate({
                        inputRange: [0.9, 1, 1.1],
                        outputRange: [0.3, 0, 0.3],
                      }),
                      transform: [{ scale: pulseAnim }],
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;
