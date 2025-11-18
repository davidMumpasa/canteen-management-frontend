import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JWT from "expo-jwt";
import { BASE_URL, TOKEN_KEY } from "../../config";
import CampusMapView from "../components/CampusMapView";

const PaymentScreen = ({ navigation, route }) => {
  // Payment states
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Location & Pickup states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [useMapView, setUseMapView] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

  const items =
    route?.params?.items ||
    (route?.params?.cartItem ? [route.params.cartItem] : []);
  const orderData = {
    items,
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    tax: 0.0,
    total: items.reduce((sum, item) => sum + item.totalPrice, 0),
    orderId: "#UC2024-" + Math.floor(Math.random() * 10000),
  };

  const TUT_CAMPUSES = [
    { id: 1, name: "Pretoria (Main) Campus", icon: "business" },
    { id: 2, name: "Arcadia Campus", icon: "library" },
    { id: 3, name: "Ga-Rankuwa Campus", icon: "school" },
    { id: 4, name: "Soshanguve North Campus", icon: "home" },
    { id: 5, name: "Soshanguve South Campus", icon: "home" },
    { id: 6, name: "eMalahleni (Witbank) Campus", icon: "location" },
    { id: 7, name: "Mbombela Campus", icon: "compass" },
    { id: 8, name: "Polokwane Campus", icon: "map" },
  ];

  const paymentMethods = [
    {
      id: "cash",
      title: "Cash on Pickup",
      subtitle: "Pay when you collect your order",
      icon: "cash",
      color: "#FFC107",
      available: true,
    },
    {
      id: "card",
      title: "Credit/Debit Card",
      subtitle: "Add new card",
      icon: "card",
      color: "#2196F3",
      available: true,
    },
    {
      id: "paypal",
      title: "PayPal",
      subtitle: "Quick & Secure",
      icon: "logo-paypal",
      color: "#003087",
      available: true,
    },
    {
      id: "student",
      title: "Student Account",
      subtitle: "Balance: R145.50",
      icon: "school",
      color: "#4CAF50",
      available: false,
    },
    {
      id: "apple",
      title: "Apple Pay",
      subtitle: "Touch ID or Face ID",
      icon: "logo-apple",
      color: "#000",
      available: false,
    },
  ];

  useEffect(() => {
    requestLocationPermission();
    setUseMapView(CampusMapView !== null);
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to verify your campus."
        );
        return;
      }
      getUserLocation();
    } catch (error) {
      console.error("Location permission error:", error);
    }
  };

  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      setIsLoadingLocation(false);
      Alert.alert("Location Error", "Could not get your current location.");
    }
  };

  const checkUserCampus = async (campusId) => {
    if (!userLocation) {
      Alert.alert("Location Required", "Please enable location services.");
      return;
    }

    try {
      setIsLoadingLocation(true);
      const response = await axios.post(`${BASE_URL}/location/check`, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        selectedCampusId: campusId,
      });

      setLocationStatus(response.data);
      setIsLoadingLocation(false);

      if (response.data.withinCampus) {
        Alert.alert("✅ Location Verified", response.data.message);
        fetchPickupLocations(TUT_CAMPUSES.find((c) => c.id === campusId).name);
        setCurrentStep(2);
      } else {
        Alert.alert("⚠️ Location Notice", response.data.message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue Anyway",
            onPress: () => {
              fetchPickupLocations(
                TUT_CAMPUSES.find((c) => c.id === campusId).name
              );
              setCurrentStep(2);
            },
          },
        ]);
      }
    } catch (error) {
      setIsLoadingLocation(false);
      console.error("Campus check error:", error);
      Alert.alert("Error", "Failed to verify campus location.");
    }
  };

  const fetchPickupLocations = async (campusName) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pickup/${encodeURIComponent(campusName)}`
      );
      setPickupLocations(response.data);
    } catch (error) {
      console.error("Fetch pickup locations error:", error);
      Alert.alert("Error", "Failed to load pickup locations.");
    }
  };

  const handleCampusSelection = (campus) => {
    setSelectedCampus(campus);
    setShowCampusModal(false);
    checkUserCampus(campus.id);
  };

  const handlePickupSelection = (location) => {
    setSelectedPickupLocation(location);
    setShowMapView(false);
    setShowPickupModal(false);
    setCurrentStep(3);
    Animated.spring(stepAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;
      const decoded = JWT.decode(token, TOKEN_KEY);
      return decoded.id;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  };

  const createOrder = async (orderPayload) => {
    try {
      const response = await axios.post(`${BASE_URL}/orders/add`, orderPayload);
      return response.data.success ? response.data.order : null;
    } catch (err) {
      console.error("Order creation error:", err);
      return null;
    }
  };

  const addPayment = async (paymentData) => {
    try {
      const userId = await getUserIdFromToken();
      const payload = { ...paymentData, userId };
      const response = await axios.post(`${BASE_URL}/payment/add`, payload);
      return response.data;
    } catch (err) {
      console.error("Payment error:", err);
      throw err;
    }
  };

  const handlePayment = async () => {
    if (!selectedCampus || !selectedPickupLocation) {
      Alert.alert(
        "Missing Information",
        "Please select campus and pickup location."
      );
      return;
    }

    // Only validate card details if payment method is card
    if (
      selectedPayment === "card" &&
      (!cardNumber || !expiryDate || !cvv || !cardHolder)
    ) {
      Alert.alert("Error", "Please fill in all card details");
      return;
    }

    try {
      setIsProcessing(true);
      await new Promise((resolve) => {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      const userId = await getUserIdFromToken();
      if (!userId) {
        Alert.alert("Error", "User not authenticated");
        setIsProcessing(false);
        return;
      }

      const orderPayload = {
        userId,
        totalAmount: orderData.total,
        paymentMethod: selectedPayment,
        orderType: "pickup",
        campus: selectedCampus.name,
        deliveryAddress: selectedPickupLocation.name,
        specialInstructions: `Campus: ${selectedCampus.name}, Pickup: ${selectedPickupLocation.name}`,
        items: orderData.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          specialRequests: item.specialRequests || "",
        })),
      };

      const newOrder = await createOrder(orderPayload);

      if (newOrder) {
        const paymentData = {
          orderId: newOrder.id,
          amount: orderData.total,
          paymentMethod: selectedPayment,
          type: "payment",
          description:
            selectedPayment === "cash"
              ? "Cash payment - to be collected on pickup"
              : "Payment for order",
          metadata: {
            campus: selectedCampus.name,
            pickup: selectedPickupLocation.name,
          },
        };
        await addPayment(paymentData);

        setIsProcessing(false);
        setShowSuccess(true);
        Animated.spring(successAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate("Orders", {
            screen: "OrdersMain",
          });
        }, 2000);
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      setIsProcessing(false);
      console.error("Payment error:", err);
      Alert.alert("Error", "Something went wrong during payment.");
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(" ") : "";
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  };

  // Get button text and icon based on payment method
  const getButtonConfig = () => {
    if (selectedPayment === "cash") {
      return {
        text: "Place Order",
        icon: "receipt-outline",
        colors: ["#FFC107", "#FF9800"],
      };
    }
    return {
      text: `Complete Payment R${orderData.total.toFixed(2)}`,
      icon: "card",
      colors: ["#22c55e", "#16a34a"],
    };
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-between items-center px-6 py-4 bg-white">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-1 items-center relative">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              currentStep >= step ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-bold">{step}</Text>
          </View>
          <Text
            className={`text-xs mt-2 ${
              currentStep >= step
                ? "text-purple-600 font-semibold"
                : "text-gray-400"
            }`}
          >
            {step === 1 ? "Campus" : step === 2 ? "Pickup" : "Payment"}
          </Text>
          {step < 3 && (
            <View
              className={`absolute top-5 left-1/2 w-full h-0.5 ${
                currentStep > step ? "bg-purple-600" : "bg-gray-300"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderCampusSelection = () => (
    <View className="px-6 py-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        📍 Select Your Campus
      </Text>
      <Text className="text-base text-gray-600 mb-6">
        Choose where you'll pick up your order
      </Text>

      <TouchableOpacity
        onPress={() => setShowCampusModal(true)}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200"
      >
        {selectedCampus ? (
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Ionicons name={selectedCampus.icon} size={28} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {selectedCampus.name}
              </Text>
              {locationStatus && (
                <Text
                  className={`text-sm mt-1 ${
                    locationStatus.withinCampus
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {locationStatus.withinCampus
                    ? "✓ You are at this campus"
                    : `${Math.round(locationStatus.distance)}m away`}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </View>
        ) : (
          <View className="items-center py-4">
            <Ionicons name="location-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-2">Tap to select campus</Text>
          </View>
        )}
      </TouchableOpacity>

      {isLoadingLocation && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text className="text-gray-600 mt-2">Verifying location...</Text>
        </View>
      )}
    </View>
  );

  const renderPickupSelection = () => (
    <View className="px-6 py-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        📦 Select Pickup Point
      </Text>
      <Text className="text-base text-gray-600 mb-6">
        Where should we prepare your order?
      </Text>

      <TouchableOpacity
        onPress={() => {
          if (useMapView) {
            setShowMapView(true);
          } else {
            setShowPickupModal(true);
          }
        }}
        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200"
      >
        {selectedPickupLocation ? (
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-indigo-100 items-center justify-center mr-4">
              <Ionicons name="location" size={28} color="#4f46e5" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {selectedPickupLocation.name}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {selectedCampus.name}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </View>
        ) : (
          <View className="items-center py-4">
            <Ionicons name="pin-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-2">
              {useMapView ? "Tap to view map" : "Tap to select pickup location"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setCurrentStep(3)}
        disabled={!selectedPickupLocation}
        className={`mt-6 rounded-2xl overflow-hidden ${
          !selectedPickupLocation ? "opacity-50" : ""
        }`}
      >
        <LinearGradient
          colors={["#4f46e5", "#7c3aed"]}
          className="py-4 items-center"
        >
          <Text className="text-white text-lg font-bold">
            Continue to Payment →
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPaymentSection = () => {
    const buttonConfig = getButtonConfig();

    return (
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-6 mt-4 shadow-md">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            📋 Order Summary
          </Text>
          {orderData.items.map((item, index) => (
            <View key={index} className="flex-row justify-between mb-3">
              <Text className="text-base text-gray-700 flex-1">
                {item.quantity}x {item.name}
              </Text>
              <Text className="text-base font-semibold text-gray-900">
                R{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View className="h-px bg-gray-200 my-4" />
          <View className="flex-row justify-between mb-3">
            <Text className="text-base text-gray-600">Subtotal</Text>
            <Text className="text-base font-semibold text-gray-900">
              R{orderData.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-base text-gray-600">Tax</Text>
            <Text className="text-base font-semibold text-gray-900">
              R{orderData.tax.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between pt-4 border-t-2 border-purple-600 mt-2">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-2xl font-bold text-purple-600">
              R{orderData.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            💳 Payment Method
          </Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => method.available && setSelectedPayment(method.id)}
              disabled={!method.available}
              className={`bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between shadow-sm border-2 ${
                selectedPayment === method.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              } ${!method.available ? "opacity-60" : ""}`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  style={{ backgroundColor: method.color }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                >
                  <Ionicons name={method.icon} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    {method.title}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {method.subtitle}
                  </Text>
                </View>
                {!method.available && (
                  <View className="bg-orange-500 px-3 py-1 rounded-xl">
                    <Text className="text-white text-xs font-bold">Soon</Text>
                  </View>
                )}
              </View>
              {selectedPayment === method.id && (
                <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Cash Payment Info */}
        {selectedPayment === "cash" && (
          <View className="bg-amber-50 rounded-2xl p-6 mt-4 border-2 border-amber-200">
            <View className="flex-row items-start">
              <View className="bg-amber-100 rounded-full p-3 mr-4">
                <Ionicons name="cash" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Cash Payment Instructions
                </Text>
                <Text className="text-sm text-gray-700 mb-2">
                  • Prepare exact amount: R{orderData.total.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-700 mb-2">
                  • Pay when collecting your order
                </Text>
                <Text className="text-sm text-gray-700 mb-2">
                  • Have your order ID ready: {orderData.orderId}
                </Text>
                <Text className="text-sm text-gray-700">
                  • Payment must be made before receiving your order
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Card Form */}
        {selectedPayment === "card" && (
          <View className="bg-white rounded-2xl p-6 mt-4 shadow-md">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              💳 Card Details
            </Text>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Card Number
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-base"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View className="flex-row justify-between mb-5">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-base"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  CVV
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-base"
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Cardholder Name
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-base"
                placeholder="John Doe"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        {/* Pickup Info Summary */}
        <View className="bg-purple-50 rounded-2xl p-6 mt-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            📍 Pickup Details
          </Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="location" size={20} color="#7c3aed" />
            <Text className="ml-3 text-base text-gray-700">
              {selectedCampus?.name}
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="pin" size={20} color="#7c3aed" />
            <Text className="ml-3 text-base text-gray-700">
              {selectedPickupLocation?.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={20} color="#7c3aed" />
            <Text className="ml-3 text-base text-gray-700">
              Ready in 15-20 minutes
            </Text>
          </View>
        </View>

        {/* Payment/Order Button */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isProcessing}
          className={`rounded-2xl overflow-hidden mb-4 ${
            isProcessing ? "opacity-70" : ""
          }`}
        >
          <LinearGradient
            colors={isProcessing ? ["#9ca3af", "#6b7280"] : buttonConfig.colors}
            className="py-5 items-center flex-row justify-center"
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white text-lg font-bold ml-3">
                  Processing...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name={buttonConfig.icon} size={24} color="white" />
                <Text className="text-white text-lg font-bold ml-3">
                  {buttonConfig.text}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mb-8">
          <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
          <Text className="text-gray-600 text-sm ml-2">
            {selectedPayment === "cash"
              ? "Order Confirmed - Pay on Pickup"
              : "Secure & Encrypted Payment"}
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className="px-6 py-4 pt-8"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 text-center">
            Checkout
          </Text>
          <View className="bg-white/20 px-4 py-2 rounded-full">
            <Text className="text-white font-bold">
              R{orderData.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {renderStepIndicator()}

      {currentStep === 1 && renderCampusSelection()}
      {currentStep === 2 && renderPickupSelection()}
      {currentStep === 3 && renderPaymentSection()}

      {/* Campus Selection Modal */}
      <Modal visible={showCampusModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Select Campus
              </Text>
              <TouchableOpacity onPress={() => setShowCampusModal(false)}>
                <Ionicons name="close-circle" size={32} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {TUT_CAMPUSES.map((campus) => (
                <TouchableOpacity
                  key={campus.id}
                  onPress={() => handleCampusSelection(campus)}
                  className="bg-gray-50 rounded-2xl p-5 mb-3 flex-row items-center border-2 border-gray-200"
                >
                  <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
                    <Ionicons name={campus.icon} size={24} color="#7c3aed" />
                  </View>
                  <Text className="flex-1 text-base font-semibold text-gray-900">
                    {campus.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Map View Modal for Pickup Selection */}
      {useMapView && CampusMapView && (
        <Modal visible={showMapView} animationType="slide">
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-6 py-4 bg-purple-600">
              <TouchableOpacity onPress={() => setShowMapView(false)}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-bold">
                Select Pickup Location
              </Text>
              <View className="w-6" />
            </View>
            <CampusMapView
              selectedCampus={selectedCampus}
              pickupLocations={pickupLocations}
              onLocationSelect={handlePickupSelection}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* Pickup Location List Modal (Fallback) */}
      <Modal visible={showPickupModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Pickup Locations
              </Text>
              <TouchableOpacity onPress={() => setShowPickupModal(false)}>
                <Ionicons name="close-circle" size={32} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {pickupLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  onPress={() => handlePickupSelection(location)}
                  className="bg-gray-50 rounded-2xl p-5 mb-3 flex-row items-center border-2 border-gray-200"
                >
                  <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
                    <Ionicons name="location" size={24} color="#4f46e5" />
                  </View>
                  <Text className="flex-1 text-base font-semibold text-gray-900">
                    {location.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <Animated.View
            style={{
              transform: [{ scale: successAnim }],
              opacity: successAnim,
            }}
            className="w-full"
          >
            <View className="bg-white rounded-3xl p-8 items-center">
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
              >
                <Ionicons name="checkmark-circle" size={64} color="white" />
              </LinearGradient>

              <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                {selectedPayment === "cash"
                  ? "Order Placed! 🎉"
                  : "Payment Successful! 🎉"}
              </Text>
              <Text className="text-base text-gray-600 text-center mb-6">
                Your order {orderData.orderId} has been confirmed
              </Text>

              <View className="w-full bg-purple-50 rounded-2xl p-6 mb-6">
                <View className="items-center mb-4">
                  <Text className="text-4xl font-bold text-purple-600">
                    R{orderData.total.toFixed(2)}
                  </Text>
                  {selectedPayment === "cash" && (
                    <Text className="text-sm text-orange-600 font-semibold mt-2">
                      💰 Pay with cash on pickup
                    </Text>
                  )}
                </View>

                <View className="mt-2">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="location" size={18} color="#7c3aed" />
                    <Text className="ml-3 text-base text-gray-700">
                      {selectedCampus?.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="pin" size={18} color="#7c3aed" />
                    <Text className="ml-3 text-base text-gray-700">
                      {selectedPickupLocation?.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={18} color="#7c3aed" />
                    <Text className="ml-3 text-base text-gray-700 font-semibold">
                      Ready in 15-20 minutes
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-2">
                  Redirecting to orders...
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;
