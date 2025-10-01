import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useCart } from "../hooks/useCart";

const { width, height } = Dimensions.get("window");

const ItemDetailScreen = ({ route, navigation, onAddToCart }) => {
  const { item } = route.params;

  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Parse ingredients and allergens from strings
  const ingredientsList = item.ingredients
    ? item.ingredients.split(",").map((ing) => ing.trim())
    : [];

  const allergensList = item.allergens
    ? item.allergens.split(",").map((all) => all.trim())
    : [];

  const sizes = [
    {
      name: "Small",
      price: item.price * 0.8,
      discount: "Save 20%",
      popular: false,
    },
    {
      name: "Regular",
      price: parseFloat(item.price),
      popular: true,
    },
    {
      name: "Large",
      price: item.price * 1.4,
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

  const mockReviews = [
    {
      id: 1,
      user: "Sarah M.",
      rating: 5,
      comment: "Absolutely delicious! Fresh ingredients and amazing flavors.",
      date: "2 days ago",
      avatar: "👩‍💼",
    },
    {
      id: 2,
      user: "James K.",
      rating: 4,
      comment: "Great quality and presentation. Worth the price!",
      date: "1 week ago",
      avatar: "👨‍💻",
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
      sizes.find((size) => size.name === selectedSize)?.price || item.price;
    return sizePrice * quantity;
  };

  const formatPrepTime = (minutes) => {
    const baseTime = parseInt(minutes);
    const maxTime = baseTime + 5;
    return `${baseTime}-${maxTime} min`;
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: getCurrentPrice() / quantity,
      quantity,
      selectedSize,
      totalPrice: getCurrentPrice(),
      image: item.image,
    };

    // Add item to cart using context
    addItem(cartItem);

    // Navigate to the Cart screen within the MainTabs
    navigation.navigate("Main", {
      screen: "Cart",
    });
  };

  const handleBack = () => {
    navigation.goBack();
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

  const ReviewItem = ({ review }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full items-center justify-center mr-3">
            <Text className="text-2xl">{review.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-lg font-semibold">
              {review.user}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= review.rating ? "star" : "star-outline"}
                    size={16}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text className="text-slate-500 text-sm">{review.date}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text className="text-slate-700 text-base leading-6">
        {review.comment}
      </Text>
    </View>
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
                {item.description ||
                  "A carefully crafted dish made with the finest ingredients and attention to detail."}
              </Text>
            </View>

            <View className="flex-row mb-6">
              <DetailCard
                icon="time"
                label="Prep Time"
                value={formatPrepTime(item.preparationTime)}
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
                value={`${item.rating || "4.5"} ⭐`}
                colors={["#10B981", "#14B8A6"]}
              />
              <DetailCard
                icon="people"
                label="Reviews"
                value={`${item.reviewCount || "0"}+`}
                colors={["#F59E0B", "#F97316"]}
              />
            </View>

            {/* Diet Tags */}
            <View className="mb-6">
              <Text className="text-slate-900 text-lg font-bold mb-3">
                Dietary Information
              </Text>
              <View className="flex-row flex-wrap">
                {item.isVeg && (
                  <LinearGradient
                    colors={["#10B981", "#14B8A6"]}
                    className="px-4 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-sm font-medium">
                      🌱 Vegetarian
                    </Text>
                  </LinearGradient>
                )}
                {item.isVegan && (
                  <LinearGradient
                    colors={["#059669", "#047857"]}
                    className="px-4 py-2 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-white text-sm font-medium">
                      🌿 Vegan
                    </Text>
                  </LinearGradient>
                )}
                {item.isGlutenFree && (
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
                value={item.calories || "N/A"}
                unit={item.calories ? "kcal" : ""}
                colors={["#EF4444", "#EC4899"]}
                progress="75%"
              />
              <NutritionCard
                label="Protein"
                value={item.nutritionInfo?.protein || "N/A"}
                colors={["#3B82F6", "#8B5CF6"]}
                progress="88%"
              />
              <NutritionCard
                label="Carbs"
                value={item.nutritionInfo?.carbs || "N/A"}
                colors={["#10B981", "#14B8A6"]}
                progress="60%"
              />
              <NutritionCard
                label="Fat"
                value={item.nutritionInfo?.fat || "N/A"}
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
          <View className="px-6 py-4">
            <View className="mb-6">
              <Text className="text-slate-900 text-2xl font-bold mb-3">
                ⭐ Customer Reviews
              </Text>

              <LinearGradient
                colors={["#F59E0B", "#F97316"]}
                className="rounded-2xl p-6 mb-6"
              >
                <View className="items-center">
                  <Text className="text-white text-5xl font-bold mb-2">
                    {item.rating || "4.5"}
                  </Text>
                  <View className="flex-row mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={
                          star <= Math.floor(item.rating || 4.5)
                            ? "star"
                            : "star-outline"
                        }
                        size={24}
                        color="#FCD34D"
                      />
                    ))}
                  </View>
                  <Text className="text-white text-lg font-medium opacity-90">
                    Based on {item.reviewCount || 0} reviews
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {mockReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}

              <View className="bg-slate-100 rounded-2xl p-6 items-center mt-4">
                <Icon name="chatbubble" size={48} color="#64748B" />
                <Text className="text-slate-700 text-lg font-semibold mt-3 mb-2">
                  Share Your Experience
                </Text>
                <Text className="text-slate-500 text-center text-base">
                  Help others discover this amazing dish by leaving your review
                </Text>
                <TouchableOpacity className="mt-4">
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7"]}
                    className="px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-semibold">
                      Write a Review
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
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
            {item.name}
          </Text>

          <TouchableOpacity className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Icon name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Item Display */}
        <View className="flex-1 items-center justify-center z-10">
          <View className="relative items-center justify-center">
            <View className="absolute w-[180px] h-auto bg-white/20 rounded-full blur-3xl" />
            {item.image ? (
              <Text className="text-[140px]">{item.image}</Text>
            ) : (
              // <Image
              //   source={{ uri: item.image }}
              //   style={{ width: 160, height: 160, borderRadius: 80 }}
              //   className="z-10"
              // />
              <View className="w-40 h-40 bg-white/30 rounded-full items-center justify-center z-10">
                <Icon name="restaurant" size={80} color="#fff" />
              </View>
            )}
            {item.isAvailable === false && (
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
                {item.name}
              </Text>
              {item.categoryId && (
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
                    {item.rating || "4.5"}
                  </Text>
                </LinearGradient>
                <Text className="text-slate-500 text-sm">
                  ({item.reviewCount || 0} reviews)
                </Text>
              </View>

              <LinearGradient
                colors={["#10B981", "#14B8A6"]}
                className="flex-row items-center px-3 py-2 rounded-xl"
              >
                <Icon name="time" size={16} color="#fff" />
                <Text className="text-white text-sm font-semibold ml-1">
                  {formatPrepTime(item.preparationTime)}
                </Text>
              </LinearGradient>
            </View>

            <Text className="text-slate-600 text-base leading-6">
              {item.description ||
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

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200">
        <View className="flex-row items-center justify-between px-6 py-4">
          {/* Quantity Controls */}
          <View className="flex-1">
            <Text className="text-slate-700 text-sm font-medium mb-2">
              Quantity
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => updateQuantity(-1)}
                className="w-10 h-10 border border-purple-500 rounded-xl items-center justify-center"
              >
                <Icon name="remove" size={20} color="#8B5CF6" />
              </TouchableOpacity>
              <View className="mx-4 w-12 h-10 bg-slate-100 rounded-xl items-center justify-center">
                <Text className="text-slate-900 text-lg font-bold">
                  {quantity}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => updateQuantity(1)}
                className="w-10 h-10 rounded-xl overflow-hidden"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7"]}
                  className="w-full h-full items-center justify-center"
                >
                  <Icon name="add" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View className="flex-1 items-center">
            <Text className="text-slate-700 text-sm font-medium mb-2">
              Total
            </Text>
            <Text className="text-slate-900 text-2xl font-bold">
              R{getCurrentPrice().toFixed(2)}
            </Text>
          </View>

          {/* Add to Cart Button */}
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={handleAddToCart}
              className="rounded-2xl overflow-hidden"
              disabled={!item.isAvailable}
            >
              <LinearGradient
                colors={
                  item.isAvailable
                    ? ["#8B5CF6", "#A855F7"]
                    : ["#9CA3AF", "#6B7280"]
                }
                className="flex-row items-center px-6 py-4"
              >
                <Icon name="bag-add" size={24} color="#fff" />
                <Text className="text-white text-base font-bold ml-2">
                  {item.isAvailable ? "Add to Cart" : "Unavailable"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ItemDetailScreen;
