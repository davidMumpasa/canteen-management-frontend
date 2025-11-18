import React from "react";
import { View, Text, Animated } from "react-native";

const DebugPanel = ({
  connectionStatus,
  productsCount,
  categoriesCount,
  notificationsCount = 0,
  unreadCount = 0,
  animations,
}) => {
  const { fadeAnim } = animations;

  return (
    <Animated.View
      className="absolute bottom-20 left-2 bg-black/80 rounded-lg p-3"
      style={{
        opacity: fadeAnim,
      }}
    >
      <Text className="text-white text-xs font-bold mb-1">🔧 Debug Info</Text>
      <Text className="text-white text-xs">
        Status: {connectionStatus || "Unknown"}
      </Text>
      <Text className="text-white text-xs">Products: {productsCount}</Text>
      <Text className="text-white text-xs">Categories: {categoriesCount}</Text>
      <Text className="text-white text-xs">
        Notifications: {notificationsCount}
      </Text>
      <Text className="text-white text-xs font-bold">
        Unread: {unreadCount}
      </Text>
    </Animated.View>
  );
};

export default DebugPanel;
