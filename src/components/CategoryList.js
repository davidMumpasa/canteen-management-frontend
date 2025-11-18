import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";

// Category configuration with icons and colors
const categoryIcons = {
  Popular: {
    icon: "🔥",
    color: "#ff6b6b",
    gradient: ["#ff6b6b", "#ff8e8e"],
  },
  Asian: {
    icon: "🍜",
    color: "#4ecdc4",
    gradient: ["#4ecdc4", "#7fddda"],
  },
  Healthy: {
    icon: "🥗",
    color: "#95e1d3",
    gradient: ["#95e1d3", "#b8e6dc"],
  },
  Fast: { icon: "⚡", color: "#ffa726", gradient: ["#ffa726", "#ffb74d"] },
  Favorites: { icon: "❤️", color: "#ff6b6b", gradient: ["#ff6b6b", "#ff8e8e"] }, // Added for favorites
};

const CategoryChip = ({ item, index, isActive, onPress, animations }) => {
  const categoryConfig = categoryIcons[item.name] || {
    icon: item.image || "📁",
    color: "#6b7280",
    gradient: ["#6b7280", "#9ca3af"],
  };

  return (
    <Animated.View
      style={{
        opacity: animations.fadeAnim,
        transform: [
          {
            translateX: animations.slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 30 * (index + 1)],
            }),
          },
          { scale: animations.pulseAnim },
        ],
      }}
    >
      <TouchableOpacity
        className={`flex-row items-center px-5 py-3 rounded-full bg-white mr-3 shadow-md ${
          isActive ? "shadow-lg" : ""
        }`}
        style={{
          backgroundColor: isActive ? categoryConfig.color : "white",
          shadowColor: isActive ? categoryConfig.color : "#000",
          shadowOpacity: isActive ? 0.3 : 0.1,
          shadowRadius: isActive ? 8 : 4,
          elevation: isActive ? 8 : 3,
        }}
        onPress={() => onPress(item.id)}
        activeOpacity={0.8}
      >
        <View
          className="w-8 h-8 rounded-2xl justify-center items-center mr-2"
          style={{
            backgroundColor: isActive
              ? "rgba(255,255,255,0.2)"
              : categoryConfig.color + "15",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: isActive ? "white" : categoryConfig.color,
            }}
          >
            {categoryConfig.icon}
          </Text>
        </View>
        <Text
          className="text-sm"
          style={{
            color: isActive ? "white" : "#333",
            fontWeight: isActive ? "700" : "600",
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryList = ({
  categories,
  selectedCategory,
  onCategoryPress,
  animations,
}) => {
  return (
    <View className="mb-8">
      <Animated.Text
        className="text-xl font-bold text-gray-800 mx-5 mb-4"
        style={{
          opacity: animations.fadeAnim,
          transform: [{ translateX: animations.slideAnim }],
        }}
      >
        Categories
        {categories.length > 0 && (
          <Text className="text-sm font-normal text-gray-500 ml-2">
            ({categories.length})
          </Text>
        )}
      </Animated.Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((item, index) => (
          <CategoryChip
            key={item.id}
            item={item}
            index={index}
            isActive={selectedCategory === item.id}
            onPress={onCategoryPress}
            animations={animations}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryList;
