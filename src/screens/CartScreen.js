import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useCart } from "../hooks/useCart";

const CartScreen = ({ route, navigation }) => {
  const {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCart();
  const [cartItem, setCartItem] = useState("");

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Handle adding item from ItemDetailScreen
  useEffect(() => {
    if (route.params?.cartItem) {
      const newItem = route.params.cartItem;
      setCartItem(newItem);
      addItem(newItem);
      console.log("Added cartItem: ", newItem);
      navigation.setParams({ cartItem: null });
    }
  }, [route.params?.cartItem, addItem, navigation]);

  useEffect(() => {
    if (cartItem) {
      console.log("cartItem state updated: ", cartItem);
    }
  }, [cartItem]);

  // Animate on mount and when items change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [items.length]);

  const handleUpdateQuantity = (itemId, selectedSize, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId, selectedSize);
      return;
    }
    updateQuantity(itemId, selectedSize, newQuantity);
  };

  const handleRemoveItem = (itemId, selectedSize) => {
    Alert.alert("Remove Item", "Remove this item from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeItem(itemId, selectedSize),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => clearCart(),
      },
    ]);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Add items to your cart first.");
      return;
    }

    Alert.alert(
      "Checkout Confirmation",
      `Items: ${getItemCount()}\nTotal: R${getSubtotal().toFixed(
        2
      )}\n\nProceed to payment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now",
          onPress: () => {
            clearCart();
            navigation.navigate("Payment", { items });
          },
        },
      ]
    );
  };

  const CartItemCard = ({ item }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 30],
            }),
          },
          {
            scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
      }}
      className="mb-6"
    >
      <LinearGradient
        colors={["#FFFFFF", "#FAFBFF"]}
        className="rounded-3xl overflow-hidden shadow-2xl"
        style={{
          shadowColor: "#8B5CF6",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 12,
        }}
      >
        {/* Decorative Top Border */}
        <LinearGradient
          colors={["#8B5CF6", "#EC4899", "#F59E0B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-1.5"
        />

        {/* Card Content */}
        <View className="p-6">
          <View className="flex-row">
            {/* Item Image with Stunning Border */}
            <View className="mr-5">
              <View className="relative">
                <LinearGradient
                  colors={["#8B5CF6", "#EC4899", "#F59E0B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-1 rounded-3xl"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <View className="w-32 h-32 rounded-3xl overflow-hidden bg-white">
                    {item.image ? (
                      <LinearGradient
                        colors={["#FAF5FF", "#FDF4FF", "#FFF7ED"]}
                        className="w-full h-full justify-center items-center"
                      >
                        <Text style={{ fontSize: 56, textAlign: "center" }}>
                          {item.image}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={["#667EEA", "#764BA2"]}
                        className="w-full h-full items-center justify-center"
                      >
                        <Icon name="restaurant" size={48} color="#fff" />
                      </LinearGradient>
                    )}
                  </View>
                </LinearGradient>

                {/* Quantity Badge */}
                <View className="absolute -top-2 -right-2">
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7"]}
                    className="w-8 h-8 rounded-full items-center justify-center border-3 border-white"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-white text-sm font-bold">
                      {item.quantity}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Item Details */}
            <View className="flex-1">
              <Text
                className="text-slate-900 text-xl font-bold mb-3 leading-6"
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <View className="flex-row items-center flex-wrap mb-4">
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  className="px-4 py-2 rounded-full mr-2 mb-2"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text className="text-white text-sm font-bold">
                    {item.selectedSize}
                  </Text>
                </LinearGradient>

                <View className="bg-slate-100 px-4 py-2 rounded-full mb-2">
                  <Text className="text-slate-700 text-sm font-semibold">
                    R{item.price.toFixed(2)} each
                  </Text>
                </View>
              </View>

              <View className="mt-1">
                <Text className="text-slate-500 text-xs mb-1.5 font-medium">
                  Item Total
                </Text>
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="self-start px-5 py-2.5 rounded-xl"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text className="text-white text-2xl font-bold">
                    R{item.totalPrice.toFixed(2)}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Elegant Divider */}
          <View className="my-6">
            <LinearGradient
              colors={["transparent", "#E2E8F0", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-px"
            />
          </View>

          {/* Quantity Controls & Remove Button */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-slate-600 text-base font-semibold mr-5">
                Quantity
              </Text>

              <View className="flex-row items-center bg-slate-50 rounded-2xl p-2">
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.selectedSize,
                      item.quantity - 1
                    )
                  }
                  className="w-11 h-11 rounded-xl items-center justify-center bg-white border-2 border-purple-200"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                >
                  <Icon name="remove" size={22} color="#8B5CF6" />
                </TouchableOpacity>

                <View className="mx-4 min-w-[52px] items-center">
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7"]}
                    className="px-5 py-2.5 rounded-xl"
                    style={{
                      shadowColor: "#8B5CF6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-white text-xl font-bold">
                      {item.quantity}
                    </Text>
                  </LinearGradient>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.selectedSize,
                      item.quantity + 1
                    )
                  }
                  className="w-11 h-11 rounded-xl overflow-hidden"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7"]}
                    className="w-full h-full items-center justify-center"
                  >
                    <Icon name="add" size={22} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.selectedSize)}
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <LinearGradient
                colors={["#FEE2E2", "#FECACA"]}
                className="w-full h-full items-center justify-center rounded-xl border-2 border-red-200"
              >
                <Icon name="trash" size={22} color="#EF4444" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-slate-50">
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#8B5CF6", "#A855F7", "#3B82F6"]}
          className="flex-1 items-center justify-center"
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <LinearGradient
              colors={["#fff", "#f0f0f0"]}
              className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
            >
              <Icon name="bag" size={48} color="#8B5CF6" />
            </LinearGradient>
          </Animated.View>

          <Text className="text-white text-xl font-semibold mt-8">
            Loading your cart...
          </Text>
          <View className="w-40 h-2 bg-white/20 rounded-full mt-5 overflow-hidden">
            <Animated.View
              style={{
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
              className="h-full bg-white rounded-full"
            />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      {/* Stunning Header */}
      <LinearGradient
        colors={["#667EEA", "#764BA2", "#8B5CF6"]}
        className="pt-16 pb-10 px-6 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <Animated.View
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.6],
            }),
            transform: [{ rotate: "45deg" }],
          }}
          className="absolute w-32 h-32 bg-white/10 rounded-3xl top-8 right-4"
        />
        <Animated.View
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.4],
            }),
            transform: [{ rotate: "-30deg" }],
          }}
          className="absolute w-24 h-24 bg-white/10 rounded-3xl top-28 left-8"
        />
        <View className="absolute w-40 h-40 bg-white/5 rounded-full -top-20 -left-20" />
        <View className="absolute w-48 h-48 bg-white/5 rounded-full -bottom-24 -right-24" />

        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Icon name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          {items.length > 0 && (
            <TouchableOpacity
              onPress={handleClearCart}
              className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 5,
              }}
            >
              <Icon name="trash" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <View className="flex-row items-center mb-3">
            <LinearGradient
              colors={["#fff", "#f0f0f0"]}
              className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Icon name="bag-handle" size={32} color="#8B5CF6" />
            </LinearGradient>
            <View>
              <Text className="text-white text-3xl font-bold">
                Shopping Cart
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="w-7 h-7 bg-white/20 rounded-full items-center justify-center mr-2">
                  <Text className="text-white text-sm font-bold">
                    {getItemCount()}
                  </Text>
                </View>
                <Text className="text-white/90 text-base font-medium">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {items.length === 0 ? (
        // Beautiful Empty Cart State
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="items-center"
          >
            <View className="mb-10">
              <LinearGradient
                colors={["#F8FAFC", "#E2E8F0"]}
                className="w-48 h-48 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 25,
                  elevation: 15,
                }}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  className="w-32 h-32 rounded-full items-center justify-center"
                >
                  <Icon name="bag-outline" size={64} color="#fff" />
                </LinearGradient>
              </LinearGradient>
            </View>

            <Text className="text-slate-900 text-4xl font-bold mb-5 text-center">
              Your Cart is Empty
            </Text>
            <Text className="text-slate-500 text-lg text-center mb-12 leading-8 max-w-md">
              Discover amazing dishes and add them to your cart to get started
              on your culinary journey!
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={{
                shadowColor: "#667EEA",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                className="px-12 py-6 rounded-2xl"
              >
                <View className="flex-row items-center">
                  <Icon name="restaurant" size={28} color="#fff" />
                  <Text className="text-white text-xl font-bold ml-4">
                    Browse Menu
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        // Cart with Items
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 220 }}
        >
          {/* Cart Items Section */}
          <View className="px-6 py-8">
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="flex-row items-center mb-8"
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Icon name="basket" size={28} color="#fff" />
              </LinearGradient>
              <View>
                <Text className="text-slate-900 text-2xl font-bold">
                  Your Items
                </Text>
                <Text className="text-slate-500 text-base mt-0.5">
                  {getItemCount()} items in cart
                </Text>
              </View>
            </Animated.View>

            {items.map((item, index) => (
              <CartItemCard
                key={`${item.id}-${item.selectedSize}`}
                item={item}
                index={index}
              />
            ))}
          </View>

          {/* Beautiful Order Summary */}
          <View className="px-6 pb-10">
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="flex-row items-center mb-6"
            >
              <LinearGradient
                colors={["#10B981", "#14B8A6"]}
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Icon name="calculator" size={28} color="#fff" />
              </LinearGradient>
              <Text className="text-slate-900 text-2xl font-bold">
                Order Total
              </Text>
            </Animated.View>

            <LinearGradient
              colors={["#FFFFFF", "#FAFBFF"]}
              className="rounded-3xl p-8 border border-slate-200"
              style={{
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View className="flex-row justify-between items-center py-4 border-b border-slate-200">
                <Text className="text-slate-600 text-lg font-medium">
                  Subtotal
                </Text>
                <Text className="text-slate-900 text-lg font-semibold">
                  R{getSubtotal().toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center pt-6">
                <Text className="text-slate-900 text-2xl font-bold">Total</Text>
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="px-6 py-3 rounded-2xl"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-white text-3xl font-bold">
                    R{getSubtotal().toFixed(2)}
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      )}

      {/* Stunning Checkout Button */}
      {items.length > 0 && (
        <Animated.View
          className="absolute bottom-11 left-0 right-0 bg-white border-t border-slate-200 pb-6"
          style={[
            { opacity: fadeAnim },
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 20,
            },
          ]}
        >
          <View className="px-6 py-6">
            <TouchableOpacity
              onPress={handleCheckout}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={["#10B981", "#059669", "#14B8A6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center py-6 rounded-2xl relative overflow-hidden"
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "transparent"]}
                  className="absolute inset-0"
                />
                <Icon name="card" size={32} color="#fff" />
                <View className="ml-4">
                  <Text className="text-white text-2xl font-bold">
                    Proceed to Checkout
                  </Text>
                  <Text className="text-white/95 text-base mt-0.5">
                    R{getSubtotal().toFixed(2)} • {getItemCount()} items
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default CartScreen;
