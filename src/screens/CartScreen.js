import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
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
    getTax,
    getDeliveryFee,
    getTotal,
    getItemCount,
  } = useCart();
  const [cartItem, setCartItem] = useState("");

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Handle adding item from ItemDetailScreen
  // Handle adding item from ItemDetailScreen
  useEffect(() => {
    if (route.params?.cartItem) {
      const newItem = route.params.cartItem;

      setCartItem(newItem);
      addItem(newItem);
      console.log("Added cartItem: ", newItem);

      // Clear the param so it doesn’t trigger again on re-renders
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
      `Items: ${getItemCount()}\nTotal: R${getTotal().toFixed(
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

  const CartItemCard = ({ item, index }) => (
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
      className="bg-white rounded-3xl p-5 mb-4 shadow-lg border border-slate-100"
    >
      <View className="flex-row items-center">
        {/* Item Image with Enhanced Design */}
        <View className="w-24 h-24 mr-4 rounded-2xl overflow-hidden shadow-md">
          {item.image ? (
            // Display the icon/emoji as text
            <View className="w-full h-full justify-center items-center bg-white">
              <Text
                style={{
                  fontSize: 36, // adjust size as needed
                  textAlign: "center",
                }}
              >
                {item.image}
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              className="w-full h-full items-center justify-center"
            >
              <Icon name="restaurant" size={36} color="#fff" />
            </LinearGradient>
          )}

          {/* Overlay gradient for better text visibility */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            className="absolute bottom-0 left-0 right-0 h-6"
          />
        </View>

        {/* Item Details with Enhanced Typography */}
        <View className="flex-1">
          <Text
            className="text-slate-900 text-xl font-bold mb-2"
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View className="flex-row items-center mb-3">
            <LinearGradient
              colors={["#8B5CF6", "#A855F7"]}
              className="px-3 py-1.5 rounded-full mr-3"
            >
              <Text className="text-white text-xs font-bold">
                {item.selectedSize}
              </Text>
            </LinearGradient>

            <View className="bg-slate-100 px-3 py-1.5 rounded-full">
              <Text className="text-slate-600 text-xs font-semibold">
                R{item.price.toFixed(2)} each
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-purple-600 text-2xl font-bold">
                R{item.totalPrice.toFixed(2)}
              </Text>
              <Text className="text-slate-500 text-sm">
                {item.quantity} × R{item.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Quantity Controls */}
        <View className="items-center ml-4">
          <View className="bg-slate-50 rounded-2xl p-3 shadow-sm">
            <View className="flex-row items-center mb-3">
              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(
                    item.id,
                    item.selectedSize,
                    item.quantity - 1
                  )
                }
                className="w-10 h-10 border-2 border-purple-300 rounded-xl items-center justify-center bg-white shadow-sm"
              >
                <Icon name="remove" size={18} color="#8B5CF6" />
              </TouchableOpacity>

              <View className="mx-4 w-12 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl items-center justify-center shadow-md">
                <Text className="text-white text-lg font-bold">
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(
                    item.id,
                    item.selectedSize,
                    item.quantity + 1
                  )
                }
                className="w-10 h-10 rounded-xl overflow-hidden shadow-sm"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  className="w-full h-full items-center justify-center"
                >
                  <Icon name="add" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id, item.selectedSize)}
              className="self-center p-2 rounded-xl bg-red-50"
            >
              <Icon name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const SummaryRow = ({ label, value, isTotal = false, isFree = false }) => (
    <View
      className={`flex-row justify-between items-center ${
        isTotal ? "py-4 border-t-2 border-slate-200 mt-3" : "py-2"
      }`}
    >
      <Text
        className={`${
          isTotal
            ? "text-slate-900 text-xl font-bold"
            : "text-slate-600 text-base font-medium"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`${
          isTotal
            ? "text-purple-600 text-2xl font-bold"
            : isFree
            ? "text-emerald-600 text-base font-bold"
            : "text-slate-700 text-base font-semibold"
        }`}
      >
        {isFree && value === 0 ? "FREE" : `R${value.toFixed(2)}`}
      </Text>
    </View>
  );

  // Loading state with enhanced design
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
              className="w-20 h-20 rounded-full items-center justify-center shadow-lg"
            >
              <Icon name="bag" size={40} color="#8B5CF6" />
            </LinearGradient>
          </Animated.View>

          <Text className="text-white text-lg font-semibold mt-6">
            Loading your cart...
          </Text>
          <View className="w-32 h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
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

      {/* Enhanced Header */}
      <LinearGradient
        colors={["#667EEA", "#764BA2", "#8B5CF6"]}
        className="pt-16 pb-8 px-6 relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ rotate: "45deg" }],
          }}
          className="absolute w-24 h-24 bg-white/10 rounded-3xl top-12 right-8"
        />
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ rotate: "-30deg" }],
          }}
          className="absolute w-16 h-16 bg-white/10 rounded-2xl top-32 left-12"
        />
        <View className="absolute w-32 h-32 bg-white/5 rounded-full -top-16 -left-16" />
        <View className="absolute w-40 h-40 bg-white/5 rounded-full -bottom-20 -right-20" />

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center shadow-lg"
          >
            <Icon name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            style={{ opacity: fadeAnim }}
            className="flex-1 items-center mx-4"
          >
            <Text className="text-white text-2xl font-bold">Shopping Cart</Text>
            <View className="flex-row items-center mt-2">
              <View className="w-6 h-6 bg-white/20 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs font-bold">
                  {getItemCount()}
                </Text>
              </View>
              <Text className="text-white/90 text-sm font-medium">
                {items.length} {items.length === 1 ? "item" : "items"}
              </Text>
            </View>
          </Animated.View>

          {items.length > 0 && (
            <TouchableOpacity
              onPress={handleClearCart}
              className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center shadow-lg"
            >
              <Icon name="trash" size={26} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {items.length === 0 ? (
        // Enhanced Empty Cart State
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="items-center"
          >
            <LinearGradient
              colors={["#F8FAFC", "#E2E8F0"]}
              className="w-40 h-40 rounded-full items-center justify-center mb-8 shadow-xl"
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="w-24 h-24 rounded-full items-center justify-center"
              >
                <Icon name="bag-outline" size={48} color="#fff" />
              </LinearGradient>
            </LinearGradient>

            <Text className="text-slate-900 text-3xl font-bold mb-4 text-center">
              Your Cart is Empty
            </Text>
            <Text className="text-slate-500 text-lg text-center mb-10 leading-7 max-w-sm">
              Discover amazing dishes and add them to your cart to get started
              on your culinary journey!
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                className="px-10 py-5 rounded-2xl shadow-xl"
              >
                <View className="flex-row items-center">
                  <Icon name="restaurant" size={24} color="#fff" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Browse Menu
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        // Enhanced Cart with Items
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {/* Cart Items Section */}
          <View className="px-6 py-8">
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="flex-row items-center mb-6"
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg"
              >
                <Icon name="bag" size={24} color="#fff" />
              </LinearGradient>
              <View>
                <Text className="text-slate-900 text-2xl font-bold">
                  Your Items
                </Text>
                <Text className="text-slate-500 text-sm">
                  {getItemCount()} items • R{getSubtotal().toFixed(2)} subtotal
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

          {/* Enhanced Order Summary */}
          <View className="px-6 pb-8">
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="flex-row items-center mb-6"
            >
              <LinearGradient
                colors={["#10B981", "#14B8A6"]}
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-lg"
              >
                <Icon name="receipt" size={24} color="#fff" />
              </LinearGradient>
              <Text className="text-slate-900 text-2xl font-bold">
                Order Summary
              </Text>
            </Animated.View>

            <LinearGradient
              colors={["#fff", "#f8fafc"]}
              className="rounded-3xl p-8 shadow-xl border border-slate-100"
            >
              <SummaryRow label="Subtotal" value={getSubtotal()} />
              <SummaryRow label="VAT (15%)" value={getTax()} />
              <SummaryRow
                label="Delivery Fee"
                value={getDeliveryFee()}
                isFree={getDeliveryFee() === 0}
              />
              <SummaryRow label="Total" value={getTotal()} isTotal />
            </LinearGradient>

            {/* Enhanced Delivery Info */}
            {getSubtotal() < 200 && getSubtotal() > 0 && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <LinearGradient
                  colors={["#FEF3C7", "#FDE68A"]}
                  className="mt-6 p-6 rounded-3xl border-2 border-yellow-200 shadow-lg"
                >
                  <View className="flex-row items-center">
                    <LinearGradient
                      colors={["#F59E0B", "#D97706"]}
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    >
                      <Icon name="flash" size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1">
                      <Text className="text-yellow-800 text-lg font-bold">
                        Almost there!
                      </Text>
                      <Text className="text-yellow-700 text-sm mt-1">
                        Add R{(200 - getSubtotal()).toFixed(2)} more for free
                        delivery
                      </Text>
                      <View className="bg-yellow-300 h-2 rounded-full mt-3 overflow-hidden">
                        <View
                          style={{ width: `${(getSubtotal() / 200) * 100}%` }}
                          className="h-full bg-yellow-600 rounded-full"
                        />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {getDeliveryFee() === 0 && getSubtotal() > 0 && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <LinearGradient
                  colors={["#ECFDF5", "#D1FAE5"]}
                  className="mt-6 p-6 rounded-3xl border-2 border-green-200 shadow-lg"
                >
                  <View className="flex-row items-center">
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    >
                      <Icon name="checkmark-circle" size={24} color="#fff" />
                    </LinearGradient>
                    <View className="flex-1">
                      <Text className="text-green-800 text-lg font-bold">
                        Free delivery unlocked!
                      </Text>
                      <Text className="text-green-700 text-sm mt-1">
                        Your order qualifies for complimentary delivery
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Enhanced Checkout Button */}
      {items.length > 0 && (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute bottom-20 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl"
        >
          <View className="px-6 py-6">
            <TouchableOpacity onPress={handleCheckout}>
              <LinearGradient
                colors={["#10B981", "#059669", "#14B8A6"]}
                className="flex-row items-center justify-center py-5 rounded-2xl shadow-xl"
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "transparent"]}
                  className="absolute inset-0 rounded-2xl"
                />
                <Icon name="card" size={28} color="#fff" />
                <View className="ml-4">
                  <Text className="text-white text-xl font-bold">Checkout</Text>
                  <Text className="text-white/90 text-sm">
                    R{getTotal().toFixed(2)} • {getItemCount()} items
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
