import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useCart } from "../hooks/useCart";
import { ViewOnlyReviews } from "../components/ViewOnlyReviews";
import { BASE_URL } from "../../config";
import AppService from "../services/AppService";

const { width, height } = Dimensions.get("window");

const ItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [itemData, setItemData] = useState(item);

  // Allergy check states
  const [allergyModalVisible, setAllergyModalVisible] = useState(false);
  const [allergyCheckLoading, setAllergyCheckLoading] = useState(false);
  const [allergyResult, setAllergyResult] = useState(null);

  // Parse ingredients and allergens from strings
  const ingredientsList = itemData.ingredients
    ? itemData.ingredients.split(",").map((ing) => ing.trim())
    : [];

  const allergensList = itemData.allergens
    ? itemData.allergens.split(",").map((all) => all.trim())
    : [];

  const sizes = [
    {
      name: "Small",
      price: itemData.price * 0.8,
      discount: "Save 20%",
      popular: false,
    },
    {
      name: "Regular",
      price: parseFloat(itemData.price),
      popular: true,
    },
    {
      name: "Large",
      price: itemData.price * 1.4,
      extra: "Family Size",
      popular: false,
    },
  ];

  const tabs = [
    {
      key: "details",
      title: "Details",
      icon: "sparkles",
      colors: ["#8B5CF6", "#A855F7"],
    },
    {
      key: "ingredients",
      title: "Ingredients",
      icon: "leaf",
      colors: ["#10B981", "#14B8A6"],
    },
    {
      key: "nutrition",
      title: "Nutrition",
      icon: "fitness",
      colors: ["#F43F5E", "#EC4899"],
    },
    {
      key: "reviews",
      title: "Reviews",
      icon: "chatbubble",
      colors: ["#F59E0B", "#F97316"],
    },
  ];

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
  }, []);

  const updateQuantity = (delta) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const getCurrentPrice = () => {
    const sizePrice =
      sizes.find((size) => size.name === selectedSize)?.price || itemData.price;
    return sizePrice * quantity;
  };

  const formatPrepTime = (minutes) => {
    const baseTime = parseInt(minutes) || 15;
    const maxTime = baseTime + 5;
    return `${baseTime}-${maxTime} min`;
  };

  // Check user allergies before adding to cart
  const checkAllergies = async () => {
    try {
      setAllergyCheckLoading(true);

      // Get userId from your AppService
      const userData = await AppService.getUserIdFromToken();

      console.log("======================");
      console.log("userData from token:", userData);
      console.log("======================");

      if (!userData || !userData.id) {
        // No user logged in, skip allergy check
        console.log("No user data found, skipping allergy check");
        return null;
      }

      console.log(
        "Checking allergies for user:",
        userData.id,
        "product:",
        itemData.id
      );

      const response = await fetch(`${BASE_URL}/allergy/check-allergy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          productId: itemData.id,
        }),
      });

      const data = await response.json();

      console.log("Allergy check response:", data);

      if (response.ok) {
        return data;
      } else {
        console.error("Allergy check failed:", data);
        return null;
      }
    } catch (error) {
      console.error("Error checking allergies:", error);
      return null;
    } finally {
      setAllergyCheckLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!itemData.isAvailable) {
      Alert.alert("Unavailable", "This item is currently unavailable.");
      return;
    }

    // Check allergies first
    const allergyCheck = await checkAllergies();

    if (allergyCheck) {
      setAllergyResult(allergyCheck);

      // Show warning modal if there's any risk
      if (allergyCheck.verdict !== "no_risk") {
        setAllergyModalVisible(true);
        return;
      }
    }

    // If no risk or no allergy data, proceed to add to cart
    proceedToCart();
  };

  const proceedToCart = () => {
    const cartItem = {
      id: itemData.id,
      name: itemData.name,
      price: getCurrentPrice() / quantity,
      quantity,
      selectedSize,
      totalPrice: getCurrentPrice(),
      image: itemData.image,
    };

    addItem(cartItem);

    Alert.alert(
      "Added to Cart! 🛒",
      `${quantity}x ${itemData.name} (${selectedSize}) added to your cart.`,
      [
        {
          text: "Continue Shopping",
          onPress: () => navigation.navigate("Main", { screen: "Home" }),
          style: "cancel",
        },
        {
          text: "View Cart",
          onPress: () => navigation.navigate("Main", { screen: "Cart" }),
        },
      ]
    );

    setAllergyModalVisible(false);
  };

  const handleLearnMore = () => {
    setAllergyModalVisible(false);

    // Create a focused, medium-length question with essential information
    const allergyQuestion = `I have an allergy concern about "${
      itemData.name
    }" (Product ID: ${itemData.id}).

ALLERGY ASSESSMENT:
• Risk Level: ${allergyResult.verdict.replace("_", " ").toUpperCase()}
• Recommendation: ${allergyResult.recommendation.toUpperCase()}
• Confidence: ${(allergyResult.confidence * 100).toFixed(0)}%
${
  allergyResult.matched_allergens && allergyResult.matched_allergens.length > 0
    ? `• Detected Allergens: ${allergyResult.matched_allergens.join(", ")}`
    : ""
}
• Analysis: ${allergyResult.reason}

PRODUCT DETAILS:
• Ingredients: ${
      ingredientsList.length > 0 ? ingredientsList.join(", ") : "Not listed"
    }
• Declared Allergens: ${
      allergensList.length > 0 ? allergensList.join(", ") : "None"
    }
• Dietary: ${
      [
        itemData.isVeg ? "Vegetarian" : null,
        itemData.isVegan ? "Vegan" : null,
        itemData.isGlutenFree ? "Gluten-Free" : null,
      ]
        .filter(Boolean)
        .join(", ") || "Standard"
    }
${itemData.calories ? `• Calories: ${itemData.calories} kcal` : ""}

MY ORDER:
• Size: ${selectedSize} | Quantity: ${quantity} | Total: R${getCurrentPrice().toFixed(
      2
    )}

QUESTIONS:
1. What specific ingredients are causing this ${allergyResult.verdict.replace(
      "_",
      " "
    )} alert?
2. What symptoms should I watch for if I consume this?
3. Can you suggest safer alternatives from the menu?
4. Should I avoid this product or are there precautions I can take?

Please provide clear, actionable advice for my situation.`;

    // Navigate to Chatbot with the pre-filled question
    navigation.navigate("Chatbot", {
      preFillMessage: allergyQuestion,
      context: {
        type: "allergy_concern",
        product: itemData.name,
        productId: itemData.id,
        allergyInfo: allergyResult,
        ingredients: ingredientsList,
        allergens: allergensList,
        dietaryInfo: {
          isVeg: itemData.isVeg,
          isVegan: itemData.isVegan,
          isGlutenFree: itemData.isGlutenFree,
        },
      },
    });
  };

  const getRiskColor = (verdict) => {
    switch (verdict) {
      case "high_risk":
        return ["#EF4444", "#DC2626"];
      case "low_risk":
        return ["#F59E0B", "#F97316"];
      default:
        return ["#10B981", "#14B8A6"];
    }
  };

  const getRiskIcon = (verdict) => {
    switch (verdict) {
      case "high_risk":
        return "warning";
      case "low_risk":
        return "alert-circle";
      default:
        return "checkmark-circle";
    }
  };

  const getRiskTitle = (verdict) => {
    switch (verdict) {
      case "high_risk":
        return "⚠️ High Risk Detected";
      case "low_risk":
        return "⚡ Caution Advised";
      default:
        return "✅ Safe to Consume";
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleReviewsUpdate = (updatedReviews) => {
    if (updatedReviews && updatedReviews.length > 0) {
      const avgRating =
        updatedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        updatedReviews.length;
      setItemData({
        ...itemData,
        rating: avgRating.toFixed(1),
        reviewCount: updatedReviews.length,
      });
    }
  };

  const DetailCard = ({ icon, label, value, colors }) => (
    <View className="flex-1 mx-1">
      <LinearGradient
        colors={colors}
        className="p-4 rounded-2xl items-center shadow-lg"
      >
        <Icon name={icon} size={28} color="#fff" />
        <Text className="text-white text-xs font-medium mt-2 opacity-90 text-center">
          {label}
        </Text>
        <Text className="text-white text-sm font-bold mt-1 text-center">
          {value}
        </Text>
      </LinearGradient>
    </View>
  );

  const NutritionCard = ({ label, value, unit, colors, progress }) => (
    <View className="flex-1 mx-2 mb-4">
      <LinearGradient
        colors={colors}
        className="p-4 rounded-2xl items-center h-24 justify-center shadow-lg"
      >
        <View className="flex-row items-baseline">
          <Text className="text-white text-2xl font-bold">{value}</Text>
          {unit && (
            <Text className="text-white text-sm ml-1 opacity-80">{unit}</Text>
          )}
        </View>
      </LinearGradient>
      <Text className="text-slate-700 text-sm font-medium text-center mt-2">
        {label}
      </Text>
      <View className="bg-slate-200 h-2 rounded-full mt-2">
        <LinearGradient
          colors={colors}
          className="h-2 rounded-full"
          style={{ width: progress }}
        />
      </View>
    </View>
  );

  const IngredientItem = ({ ingredient, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <LinearGradient
            colors={["#10B981", "#14B8A6"]}
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          >
            <Icon name="leaf" size={24} color="#fff" />
          </LinearGradient>
          <View className="flex-1">
            <Text className="text-slate-900 text-lg font-semibold">
              {ingredient}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              Fresh and premium quality
            </Text>
          </View>
        </View>
        <View className="bg-emerald-100 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 text-xs font-bold">FRESH</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="px-6 py-4"
          >
            <View className="mb-6">
              <Text className="text-slate-900 text-2xl font-bold mb-3">
                ✨ Product Details
              </Text>
              <Text className="text-slate-600 text-base leading-7">
                {itemData.description ||
                  "A carefully crafted dish made with the finest ingredients and attention to detail. Experience authentic flavors that will tantalize your taste buds."}
              </Text>
            </View>

            <View className="flex-row mb-6">
              <DetailCard
                icon="time"
                label="Prep Time"
                value={formatPrepTime(itemData.preparationTime)}
                colors={["#3B82F6", "#06B6D4"]}
              />
              <DetailCard
                icon="restaurant"
                label="Category"
                value="Premium"
                colors={["#F43F5E", "#EC4899"]}
              />
              <DetailCard
                icon="trophy"
                label="Rating"
                value={`${itemData.rating || "4.5"} ⭐`}
                colors={["#10B981", "#14B8A6"]}
              />
              <DetailCard
                icon="people"
                label="Reviews"
                value={`${itemData.reviewCount || "0"}+`}
                colors={["#F59E0B", "#F97316"]}
              />
            </View>

            {/* Diet Tags */}
            <View className="mb-6">
              <Text className="text-slate-900 text-lg font-bold mb-3">
                Dietary Information
              </Text>
              <View className="flex-row flex-wrap">
                {itemData.isVeg && (
                  <LinearGradient
                    colors={["#10B981", "#14B8A6"]}
                    className="px-4 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-sm font-medium">
                      🌱 Vegetarian
                    </Text>
                  </LinearGradient>
                )}
                {itemData.isVegan && (
                  <LinearGradient
                    colors={["#059669", "#047857"]}
                    className="px-4 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-sm font-medium">
                      🌿 Vegan
                    </Text>
                  </LinearGradient>
                )}
                {itemData.isGlutenFree && (
                  <LinearGradient
                    colors={["#F59E0B", "#F97316"]}
                    className="px-4 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-sm font-medium">
                      🌾 Gluten Free
                    </Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {allergensList.length > 0 && (
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <View className="flex-row items-center mb-3">
                  <Icon name="warning" size={24} color="#EF4444" />
                  <Text className="text-red-700 text-lg font-semibold ml-2">
                    Allergen Information
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  {allergensList.map((allergen, index) => (
                    <LinearGradient
                      key={index}
                      colors={["#EF4444", "#F97316"]}
                      className="px-3 py-2 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-white text-sm font-medium">
                        {allergen}
                      </Text>
                    </LinearGradient>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        );

      case "ingredients":
        return (
          <View className="px-6 py-4">
            <View className="mb-6">
              <Text className="text-slate-900 text-2xl font-bold mb-3">
                🌿 Ingredients
              </Text>
              <Text className="text-slate-600 text-base leading-6">
                Fresh, high-quality ingredients selected for optimal taste and
                nutrition
              </Text>
            </View>

            <View>
              {ingredientsList.length > 0 ? (
                ingredientsList.map((ingredient, index) => (
                  <IngredientItem
                    key={index}
                    ingredient={ingredient}
                    index={index}
                  />
                ))
              ) : (
                <View className="bg-slate-100 rounded-2xl p-6 items-center">
                  <Icon name="leaf" size={48} color="#64748B" />
                  <Text className="text-slate-700 text-lg font-semibold mt-3 mb-2">
                    No Ingredients Listed
                  </Text>
                  <Text className="text-slate-500 text-center text-base">
                    Ingredient information is not available for this item
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case "nutrition":
        return (
          <View className="px-6 py-4">
            <View className="mb-6">
              <Text className="text-slate-900 text-2xl font-bold mb-3">
                💪 Nutrition Facts
              </Text>
              <Text className="text-slate-600 text-base leading-6">
                Nutritional information per serving
              </Text>
            </View>

            <View className="flex-row flex-wrap -mx-2">
              <NutritionCard
                label="Calories"
                value={itemData.calories || "N/A"}
                unit={itemData.calories ? "kcal" : ""}
                colors={["#EF4444", "#EC4899"]}
                progress="75%"
              />
              <NutritionCard
                label="Protein"
                value={itemData.nutritionInfo?.protein || "N/A"}
                colors={["#3B82F6", "#8B5CF6"]}
                progress="88%"
              />
              <NutritionCard
                label="Carbs"
                value={itemData.nutritionInfo?.carbs || "N/A"}
                colors={["#10B981", "#14B8A6"]}
                progress="60%"
              />
              <NutritionCard
                label="Fat"
                value={itemData.nutritionInfo?.fat || "N/A"}
                colors={["#F59E0B", "#F97316"]}
                progress="45%"
              />
            </View>

            <LinearGradient
              colors={["#F0FDF4", "#ECFDF5"]}
              className="rounded-2xl p-4 mt-6 border border-green-200"
            >
              <View className="flex-row items-center mb-2">
                <Icon name="trophy" size={24} color="#10B981" />
                <Text className="text-green-800 text-lg font-semibold ml-2">
                  Health Benefits
                </Text>
              </View>
              <Text className="text-green-700 text-base leading-6">
                Made with fresh ingredients and balanced nutrition to support
                your healthy lifestyle.
              </Text>
            </LinearGradient>
          </View>
        );

      case "reviews":
        return (
          <ViewOnlyReviews
            item={itemData}
            onReviewsUpdate={handleReviewsUpdate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      {/* Hero Section */}
      <LinearGradient
        colors={["#8B5CF6", "#A855F7", "#3B82F6"]}
        style={{ height: height * 0.5 }}
        className="relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <View className="absolute w-20 h-20 bg-white/10 rounded-full top-10 left-10" />
        <View className="absolute w-16 h-16 bg-white/10 rounded-full top-32 right-16" />
        <View className="absolute w-12 h-12 bg-white/10 rounded-full bottom-20 left-20" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-16 pb-5 z-10">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text
            className="text-white text-lg font-bold flex-1 text-center mx-4"
            numberOfLines={1}
          >
            {itemData.name}
          </Text>

          <TouchableOpacity className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Icon name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Item Display */}
        <View className="flex-1 items-center justify-center z-10">
          <View className="relative items-center justify-center">
            <View className="absolute w-[180px] h-auto bg-white/20 rounded-full blur-3xl" />
            {itemData.image ? (
              <Text className="text-[140px]">{itemData.image}</Text>
            ) : (
              <View className="w-40 h-40 bg-white/30 rounded-full items-center justify-center z-10">
                <Icon name="restaurant" size={80} color="#fff" />
              </View>
            )}
            {itemData.isAvailable === false && (
              <LinearGradient
                colors={["#EF4444", "#DC2626"]}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-full z-20"
              >
                <Text className="text-white text-xs font-bold">
                  UNAVAILABLE
                </Text>
              </LinearGradient>
            )}
          </View>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          className={`absolute top-20 right-6 w-12 h-12 rounded-full items-center justify-center z-20 ${
            isFavorite ? "bg-red-500" : "bg-white/20"
          }`}
        >
          <Icon
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content Section */}
      <View className="flex-1 bg-white rounded-t-3xl -mt-8 shadow-xl">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Main Info */}
          <View className="px-6 pt-8 pb-8">
            <View className="mb-4">
              <Text className="text-slate-900 text-3xl font-bold mb-2">
                {itemData.name}
              </Text>
              {itemData.categoryId && (
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  className="self-start px-4 py-2 rounded-full"
                >
                  <Text className="text-white text-sm font-semibold">
                    Premium Selection
                  </Text>
                </LinearGradient>
              )}
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={["#F59E0B", "#F97316"]}
                  className="flex-row items-center px-3 py-2 rounded-xl mr-4"
                >
                  <Icon name="star" size={16} color="#fff" />
                  <Text className="text-white text-sm font-bold ml-1">
                    {itemData.rating || "4.5"}
                  </Text>
                </LinearGradient>
                <Text className="text-slate-500 text-sm">
                  ({itemData.reviewCount || 0} reviews)
                </Text>
              </View>

              <LinearGradient
                colors={["#10B981", "#14B8A6"]}
                className="flex-row items-center px-3 py-2 rounded-xl"
              >
                <Icon name="time" size={16} color="#fff" />
                <Text className="text-white text-sm font-semibold ml-1">
                  {formatPrepTime(itemData.preparationTime)}
                </Text>
              </LinearGradient>
            </View>

            <Text className="text-slate-600 text-base leading-6">
              {itemData.description ||
                "Experience the perfect blend of flavors and quality craftsmanship in every bite."}
            </Text>
          </View>

          {/* Size Selection */}
          <View className="px-6 pb-8">
            <View className="flex-row items-center mb-4">
              <Icon name="flash" size={24} color="#F59E0B" />
              <Text className="text-slate-900 text-xl font-bold ml-2">
                Choose Your Size
              </Text>
            </View>
            <View className="flex-row justify-between">
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size.name}
                  onPress={() => setSelectedSize(size.name)}
                  className="flex-1 mx-1"
                >
                  {selectedSize === size.name ? (
                    <LinearGradient
                      colors={["#8B5CF6", "#A855F7"]}
                      className="py-4 px-3 rounded-2xl items-center relative"
                    >
                      {size.popular && (
                        <LinearGradient
                          colors={["#EF4444", "#EC4899"]}
                          className="absolute -top-2 -right-2 px-2 py-1 rounded-xl z-10"
                        >
                          <Text className="text-white text-xs font-bold">
                            POPULAR
                          </Text>
                        </LinearGradient>
                      )}
                      <Text className="text-white text-lg font-bold mb-1">
                        {size.name}
                      </Text>
                      <Text className="text-white text-xl font-bold">
                        R{size.price.toFixed(2)}
                      </Text>
                      {size.discount && (
                        <Text className="text-white/80 text-xs mt-1">
                          {size.discount}
                        </Text>
                      )}
                      {size.extra && (
                        <Text className="text-white/80 text-xs mt-1">
                          {size.extra}
                        </Text>
                      )}
                    </LinearGradient>
                  ) : (
                    <View className="py-4 px-3 rounded-2xl items-center bg-slate-100 relative">
                      {size.popular && (
                        <LinearGradient
                          colors={["#EF4444", "#EC4899"]}
                          className="absolute -top-2 -right-2 px-2 py-1 rounded-xl z-10"
                        >
                          <Text className="text-white text-xs font-bold">
                            POPULAR
                          </Text>
                        </LinearGradient>
                      )}
                      <Text className="text-slate-900 text-lg font-bold mb-1">
                        {size.name}
                      </Text>
                      <Text className="text-slate-900 text-xl font-bold">
                        R{size.price.toFixed(2)}
                      </Text>
                      {size.discount && (
                        <Text className="text-slate-500 text-xs mt-1">
                          {size.discount}
                        </Text>
                      )}
                      {size.extra && (
                        <Text className="text-slate-500 text-xs mt-1">
                          {size.extra}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <View className="pb-8">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-6"
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className="mr-3"
                >
                  {activeTab === tab.key ? (
                    <LinearGradient
                      colors={tab.colors}
                      className="flex-row items-center px-6 py-3 rounded-2xl"
                    >
                      <Icon name={tab.icon} size={20} color="#fff" />
                      <Text className="text-white text-base font-semibold ml-2">
                        {tab.title}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View className="flex-row items-center px-6 py-3 rounded-2xl bg-slate-100">
                      <Icon name={tab.icon} size={20} color="#64748B" />
                      <Text className="text-slate-500 text-base font-medium ml-2">
                        {tab.title}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mt-6">{renderTabContent()}</View>
          </View>
        </ScrollView>
      </View>

      {/* Allergy Warning Modal */}
      <Modal
        visible={allergyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAllergyModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: height * 0.8 }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {allergyResult && (
                <View className="p-6">
                  {/* Header */}
                  <LinearGradient
                    colors={getRiskColor(allergyResult.verdict)}
                    className="rounded-2xl p-6 mb-6"
                  >
                    <View className="items-center">
                      <Icon
                        name={getRiskIcon(allergyResult.verdict)}
                        size={64}
                        color="#fff"
                      />
                      <Text className="text-white text-2xl font-bold mt-4 text-center">
                        {getRiskTitle(allergyResult.verdict)}
                      </Text>
                    </View>
                  </LinearGradient>

                  {/* Confidence Level */}
                  <View className="mb-6">
                    <Text className="text-slate-700 text-sm font-medium mb-2">
                      Confidence Level
                    </Text>
                    <View className="bg-slate-200 h-3 rounded-full overflow-hidden">
                      <LinearGradient
                        colors={getRiskColor(allergyResult.verdict)}
                        style={{
                          width: `${(allergyResult.confidence * 100).toFixed(
                            0
                          )}%`,
                          height: "100%",
                        }}
                      />
                    </View>
                    <Text className="text-slate-500 text-xs mt-1">
                      {(allergyResult.confidence * 100).toFixed(0)}% confident
                    </Text>
                  </View>

                  {/* Reason */}
                  <View className="bg-slate-50 rounded-2xl p-4 mb-6">
                    <View className="flex-row items-center mb-2">
                      <Icon
                        name="information-circle"
                        size={20}
                        color="#64748B"
                      />
                      <Text className="text-slate-900 text-lg font-bold ml-2">
                        Analysis
                      </Text>
                    </View>
                    <Text className="text-slate-700 text-base leading-6">
                      {allergyResult.reason}
                    </Text>
                  </View>

                  {/* Matched Allergens */}
                  {allergyResult.matched_allergens &&
                    allergyResult.matched_allergens.length > 0 && (
                      <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                          <Icon name="alert-circle" size={20} color="#EF4444" />
                          <Text className="text-slate-900 text-lg font-bold ml-2">
                            Detected Allergens
                          </Text>
                        </View>
                        <View className="flex-row flex-wrap">
                          {allergyResult.matched_allergens.map(
                            (allergen, index) => (
                              <LinearGradient
                                key={index}
                                colors={["#EF4444", "#F97316"]}
                                className="px-4 py-2 rounded-full mr-2 mb-2"
                              >
                                <Text className="text-white text-sm font-medium">
                                  {allergen}
                                </Text>
                              </LinearGradient>
                            )
                          )}
                        </View>
                      </View>
                    )}

                  {/* Recommendation Badge */}
                  <View className="items-center mb-6">
                    <LinearGradient
                      colors={
                        allergyResult.recommendation === "block"
                          ? ["#EF4444", "#DC2626"]
                          : allergyResult.recommendation === "caution"
                          ? ["#F59E0B", "#F97316"]
                          : ["#10B981", "#14B8A6"]
                      }
                      className="px-6 py-3 rounded-full"
                    >
                      <Text className="text-white text-base font-bold">
                        Recommendation:{" "}
                        {allergyResult.recommendation.toUpperCase()}
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Action Buttons */}
                  <View className="space-y-3">
                    {/* Learn More Button */}
                    <TouchableOpacity
                      onPress={handleLearnMore}
                      className="mb-3"
                    >
                      <LinearGradient
                        colors={["#3B82F6", "#8B5CF6"]}
                        className="py-4 rounded-2xl flex-row items-center justify-center"
                      >
                        <Icon name="chatbubbles" size={24} color="#fff" />
                        <Text className="text-white text-lg font-bold ml-2">
                          Talk to AI Assistant
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Proceed Anyway Button - Show for all risk levels */}
                    <TouchableOpacity onPress={proceedToCart} className="mb-3">
                      <View className="bg-slate-100 py-4 rounded-2xl flex-row items-center justify-center border-2 border-slate-200">
                        <Icon name="cart" size={24} color="#64748B" />
                        <Text className="text-slate-700 text-lg font-bold ml-2">
                          Add to Cart Anyway
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Warning for high risk items */}
                    {allergyResult.recommendation === "block" && (
                      <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-3">
                        <View className="flex-row items-start">
                          <Icon
                            name="shield-checkmark"
                            size={24}
                            color="#EF4444"
                          />
                          <View className="flex-1 ml-3">
                            <Text className="text-red-800 text-base font-semibold mb-1">
                              ⚠️ High Risk Warning
                            </Text>
                            <Text className="text-red-700 text-sm leading-5">
                              Based on your medical history, this product poses
                              a significant health risk. We strongly recommend
                              consulting with our AI assistant before
                              proceeding.
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Cancel Button */}
                    <TouchableOpacity
                      onPress={() => setAllergyModalVisible(false)}
                      className="py-4 items-center"
                    >
                      <Text className="text-slate-500 text-base font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Disclaimer */}
                  <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
                    <View className="flex-row items-start">
                      <Icon
                        name="information-circle"
                        size={20}
                        color="#3B82F6"
                      />
                      <Text className="text-blue-800 text-xs leading-5 ml-2 flex-1">
                        This is an AI-powered assessment based on your allergy
                        profile. Always consult with healthcare professionals
                        for medical advice. We are not liable for health
                        consequences.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-20">
        <View className="flex-row items-center justify-between px-6 py-4">
          {/* Quantity Controls */}
          <View className="flex-1">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Quantity
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => updateQuantity(-1)}
                className="w-10 h-10 border border-purple-500 rounded-xl items-center justify-center"
              >
                <Icon name="remove" size={20} color="#8B5CF6" />
              </TouchableOpacity>
              <View className="mx-4 w-12 h-10 bg-gray-100 rounded-xl items-center justify-center">
                <Text className="text-gray-900 text-lg font-bold">
                  {quantity}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => updateQuantity(1)}
                className="w-10 h-10 bg-purple-500 rounded-xl items-center justify-center"
              >
                <Icon name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price and Add to Cart Button */}
          <View className="flex-row items-center flex-1 justify-end">
            <View className="items-end mr-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Total
              </Text>
              <Text className="text-gray-900 text-2xl font-bold">
                R{getCurrentPrice().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              className={`rounded-2xl px-6 py-4 flex-row items-center ${
                itemData.isAvailable ? "bg-purple-500" : "bg-gray-400"
              }`}
              disabled={!itemData.isAvailable || allergyCheckLoading}
            >
              {allergyCheckLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="bag-add" size={24} color="#fff" />
                  <Text className="text-white text-base font-bold ml-2">
                    {itemData.isAvailable ? "Add" : "N/A"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ItemDetailScreen;
