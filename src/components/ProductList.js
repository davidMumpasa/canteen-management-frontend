import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Food emojis mapping
const foodEmojis = {
  Asian: ["🍣", "🍜", "🥢", "🍱", "🥟"],
  Healthy: ["🥗", "🥣", "🥑", "🥕", "🍎"],
  Fast: ["🍔", "🍕", "🌭", "🍟", "🌯"],
  Popular: ["🍕", "🍔", "🍣", "🍜", "🥗"],
  Favorites: ["❤️", "⭐", "🍽️", "🥰", "🔥"], // Added for favorites
};

const getProductEmoji = (product) => {
  if (product.image) return product.image;
  const categoryName = product.category?.name || "Popular";
  const emojis = foodEmojis[categoryName] || foodEmojis.Popular;
  const index = Math.abs(product.id.toString().charCodeAt(0)) % emojis.length;
  return emojis[index];
};

const getDiscountPercentage = (productId) => {
  const random = Math.abs(productId.toString().charCodeAt(0)) % 100;
  if (random > 70) return Math.floor(random % 20) + 10;
  return null;
};

const formatPrepTime = (minutes) => {
  if (!minutes) return "15-20 min";
  const baseTime = parseInt(minutes);
  const maxTime = baseTime + 5;
  return `${baseTime}-${maxTime} min`;
};

const safeParseFloat = (value) => {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const FoodCard = ({
  item,
  index,
  favorites,
  onProductPress,
  onToggleFavorite,
  animations,
}) => {
  const discount = getDiscountPercentage(item.id);
  const emoji = getProductEmoji(item);
  const prepTime = formatPrepTime(item.preparationTime);

  return (
    <Animated.View
      className="bg-white rounded-2xl mb-5 overflow-hidden shadow-lg"
      style={{
        opacity: animations.productsOpacity,
        transform: [
          {
            translateY: animations.slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 20 * (index + 1)],
            }),
          },
          { scale: animations.pulseAnim },
        ],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => onProductPress(item)}
        activeOpacity={0.9}
      >
        <View className="relative">
          <View className="h-36 bg-gray-50 justify-center items-center">
            <Text className="text-6xl">{emoji}</Text>
            {discount && (
              <View className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-xl">
                <Text className="text-xs font-bold text-white">
                  {discount}% OFF
                </Text>
              </View>
            )}
            {!item.isAvailable && (
              <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
                <Text className="text-white font-bold text-lg">
                  Unavailable
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className={`absolute top-4 right-4 w-9 h-9 rounded-full justify-center items-center shadow-sm ${
              favorites.has(item.id) ? "bg-red-500" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
          >
            <Ionicons
              name={favorites.has(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={favorites.has(item.id) ? "white" : "#ff6b6b"}
            />
          </TouchableOpacity>
        </View>

        <View className="p-5">
          <View className="mb-2">
            <Text className="text-lg font-bold text-gray-800 mb-1">
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-sm font-semibold text-gray-800 ml-1">
                {safeParseFloat(item.rating || 4.5).toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-400 ml-1">
                ({parseInt(item.reviewCount || 0)})
              </Text>
            </View>
          </View>

          <Text className="text-sm text-gray-500 mb-3 leading-5">
            {item.description}
          </Text>

          <View className="flex-row mb-4">
            <View className="flex-row items-center mr-5">
              <Ionicons name="time" size={14} color="#666" />
              <Text className="text-xs text-gray-500 ml-1">{prepTime}</Text>
            </View>
            {item.isVeg && (
              <View className="flex-row items-center mr-3">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                <Text className="text-xs text-green-700 font-medium">Veg</Text>
              </View>
            )}
            {item.isVegan && (
              <View className="flex-row items-center mr-3">
                <View className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                <Text className="text-xs text-emerald-700 font-medium">
                  Vegan
                </Text>
              </View>
            )}
            {item.isGlutenFree && (
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                <Text className="text-xs text-blue-700 font-medium">GF</Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-xs text-gray-400 mb-0.5">Total Price</Text>
              <Text className="text-xl font-bold text-gray-800">
                R{safeParseFloat(item.price).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 rounded-full justify-center items-center"
              style={{
                backgroundColor: item.isAvailable ? "#667eea" : "#9ca3af",
                shadowColor: item.isAvailable ? "#667eea" : "#9ca3af",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={0.8}
              disabled={!item.isAvailable}
              onPress={(e) => {
                e.stopPropagation();
                if (item.isAvailable) {
                  console.log("Adding to cart:", item.name);
                }
              }}
            >
              <Ionicons
                name={item.isAvailable ? "add" : "close"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductsLoadingView = ({ animations }) => (
  <Animated.View
    className="items-center py-20 px-5"
    style={{
      opacity: animations.fadeAnim,
      transform: [{ scale: animations.scaleAnim }],
    }}
  >
    <View className="mb-6">
      <ActivityIndicator size="large" color="#667eea" />
    </View>
    <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
      Finding delicious meals...
    </Text>
    <Text className="text-sm text-gray-500 text-center mb-4">
      Searching through our amazing collection
    </Text>
    <View className="flex-row">
      {["🍕", "🍔", "🍣", "🥗"].map((emoji, index) => (
        <Animated.Text
          key={index}
          className="text-2xl mx-1"
          style={{
            opacity: animations.fadeAnim,
            transform: [
              {
                translateY: animations.fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5 * (index % 2 === 0 ? 1 : -1)],
                }),
              },
            ],
          }}
        >
          {emoji}
        </Animated.Text>
      ))}
    </View>
  </Animated.View>
);

const ProductList = ({
  products,
  selectedCategoryName,
  productsLoading,
  favorites,
  onProductPress,
  onToggleFavorite,
  onRetry,
  isConnected,
  animations,
}) => {
  return (
    <View className="flex-1">
      <Animated.Text
        className="text-xl font-bold text-gray-800 mx-5 mb-4"
        style={{
          opacity: animations.fadeAnim,
          transform: [{ translateX: animations.slideAnim }],
        }}
      >
        {selectedCategoryName === "Popular"
          ? "Popular Dishes"
          : `${selectedCategoryName} Food`}
        {products.length > 0 && (
          <Text className="text-sm font-normal text-gray-500 ml-2">
            ({products.length} items)
          </Text>
        )}
      </Animated.Text>

      {productsLoading ? (
        <ProductsLoadingView animations={animations} />
      ) : products.length > 0 ? (
        <View className="px-5">
          {products.map((item, index) => (
            <FoodCard
              key={item.id}
              item={item}
              index={index}
              favorites={favorites}
              onProductPress={onProductPress}
              onToggleFavorite={onToggleFavorite}
              animations={animations}
            />
          ))}
        </View>
      ) : (
        <Animated.View
          className="items-center py-15 px-5"
          style={{
            opacity: animations.fadeAnim,
            transform: [{ scale: animations.scaleAnim }],
          }}
        >
          <Text className="text-8xl mb-5">🍽️</Text>
          <Text className="text-lg font-bold text-gray-800 mb-2 text-center">
            No delicious meals found
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            Try searching for something else or check a different category
          </Text>
          {!isConnected && (
            <TouchableOpacity
              onPress={onRetry}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );
};

export default ProductList;
