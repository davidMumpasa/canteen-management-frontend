// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Animated,
//   Dimensions,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   Easing,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";

// const { width, height } = Dimensions.get("window");
// const HEADER_HEIGHT = 380;

// const ItemDetailScreen = ({ navigation, route }) => {
//   // Add the safeParseFloat function at the top
//   const safeParseFloat = (value) => {
//     if (value === null || value === undefined) return 0;
//     const parsed = parseFloat(value);
//     return isNaN(parsed) ? 0 : parsed;
//   };

//   const item = route?.params?.item || {
//     id: 1,
//     name: "Premium Sushi Platter", // Changed from item_name to name for consistency
//     quantity: 2,
//     price: 32.5, // Changed from total_price to price
//     category: { name: "Japanese Cuisine" }, // Made consistent with HomeScreen structure
//     emoji: "🍣",
//     rating: 4.9,
//     reviewCount: 245, // Changed from reviews to reviewCount
//     description:
//       "Artisanal sushi crafted with the finest ingredients, featuring fresh salmon, tuna, and premium avocado rolls",
//     preparationTime: 20, // Changed from prepTime to preparationTime
//     discount: "20% OFF",
//     ingredients: [
//       "Wild Salmon",
//       "Bluefin Tuna",
//       "Premium Avocado",
//       "Organic Nori",
//       "Sushi Grade Rice",
//       "Fresh Wasabi",
//       "Pickled Ginger",
//     ],
//     nutritionFacts: {
//       calories: 320,
//       protein: "22g",
//       carbs: "38g",
//       fat: "12g",
//     },
//     chef: "Master Akira Tanaka",
//     allergens: ["Fish", "Gluten", "Soy"],
//   };

//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState("Medium");
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [activeTab, setActiveTab] = useState("details");

//   // Enhanced animation values
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideUpAnim = useRef(new Animated.Value(100)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const heartScale = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const shimmerAnim = useRef(new Animated.Value(0)).current;

//   const sizes = [
//     {
//       name: "Small",
//       price: safeParseFloat(item.price) - 8,
//       discount: "Save $8",
//       popular: false,
//     },
//     {
//       name: "Medium",
//       price: safeParseFloat(item.price),
//       popular: true
//     },
//     {
//       name: "Large",
//       price: safeParseFloat(item.price) + 12,
//       extra: "Family Size",
//       popular: false,
//     },
//   ];

//   const tabs = [
//     {
//       key: "details",
//       title: "Details",
//       icon: "information-circle-outline",
//       gradient: ["#667eea", "#764ba2"],
//     },
//     {
//       key: "ingredients",
//       title: "Ingredients",
//       icon: "leaf-outline",
//       gradient: ["#4ecdc4", "#44a08d"],
//     },
//     {
//       key: "nutrition",
//       title: "Nutrition",
//       icon: "fitness-outline",
//       gradient: ["#ff6b6b", "#ff8e53"],
//     },
//     {
//       key: "reviews",
//       title: "Reviews",
//       icon: "star-outline",
//       gradient: ["#ffa726", "#ff7043"],
//     },
//   ];

//   useEffect(() => {
//     // Staggered entrance animations
//     Animated.stagger(200, [
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//         easing: Easing.out(Easing.cubic),
//       }),
//       Animated.spring(slideUpAnim, {
//         toValue: 0,
//         tension: 60,
//         friction: 8,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 50,
//         friction: 6,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Continuous animations
//     const rotationLoop = Animated.loop(
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 20000,
//         useNativeDriver: true,
//         easing: Easing.linear,
//       })
//     );

//     const pulseLoop = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.05,
//           duration: 2000,
//           useNativeDriver: true,
//           easing: Easing.inOut(Easing.sin),
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//           easing: Easing.inOut(Easing.sin),
//         }),
//       ])
//     );

//     const shimmerLoop = Animated.loop(
//       Animated.timing(shimmerAnim, {
//         toValue: 1,
//         duration: 3000,
//         useNativeDriver: true,
//         easing: Easing.inOut(Easing.quad),
//       })
//     );

//     rotationLoop.start();
//     pulseLoop.start();
//     shimmerLoop.start();

//     return () => {
//       rotationLoop.stop();
//       pulseLoop.stop();
//       shimmerLoop.stop();
//     };
//   }, []);

//   const toggleFavorite = () => {
//     setIsFavorite(!isFavorite);
//     Animated.sequence([
//       Animated.spring(heartScale, {
//         toValue: 1.4,
//         tension: 100,
//         friction: 3,
//         useNativeDriver: true,
//       }),
//       Animated.spring(heartScale, {
//         toValue: 1,
//         tension: 50,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const updateQuantity = (delta) => {
//     setQuantity(Math.max(1, quantity + delta));
//   };

//   const getCurrentPrice = () => {
//     const sizePrice =
//       sizes.find((size) => size.name === selectedSize)?.price ||
//       safeParseFloat(item.price);
//     return safeParseFloat(sizePrice * quantity);
//   };

//   const formatPrepTime = (minutes) => {
//     if (!minutes) return "15-20 min";
//     const baseTime = parseInt(minutes);
//     const maxTime = baseTime + 5;
//     return `${baseTime}-${maxTime} min`;
//   };

//   const headerOpacity = scrollY.interpolate({
//     inputRange: [0, HEADER_HEIGHT - 120],
//     outputRange: [0, 1],
//     extrapolate: "clamp",
//   });

//   const imageScale = scrollY.interpolate({
//     inputRange: [-150, 0, HEADER_HEIGHT],
//     outputRange: [1.3, 1, 0.7],
//     extrapolate: "clamp",
//   });

//   const shimmerTranslate = shimmerAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [-100, 100],
//   });

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "details":
//         return (
//           <View style={styles.tabContent}>
//             <Text style={styles.tabTitle}>✨ About This Masterpiece</Text>
//             <Text style={styles.fullDescription}>
//               {item.description}. Handcrafted by our master chef {item.chef || "our expert chef"},
//               each piece represents years of culinary tradition and innovation,
//               bringing authentic Japanese flavors to your table.
//             </Text>

//             <View style={styles.detailsGrid}>
//               <LinearGradient
//                 colors={["#667eea", "#764ba2"]}
//                 style={styles.detailCard}
//               >
//                 <Ionicons name="time-outline" size={24} color="white" />
//                 <Text style={styles.detailCardLabel}>Prep Time</Text>
//                 <Text style={styles.detailCardValue}>{formatPrepTime(item.preparationTime)}</Text>
//               </LinearGradient>

//               <LinearGradient
//                 colors={["#ff6b6b", "#ff8e53"]}
//                 style={styles.detailCard}
//               >
//                 <Ionicons name="restaurant-outline" size={24} color="white" />
//                 <Text style={styles.detailCardLabel}>Master Chef</Text>
//                 <Text style={styles.detailCardValue}>Akira T.</Text>
//               </LinearGradient>

//               <LinearGradient
//                 colors={["#4ecdc4", "#44a08d"]}
//                 style={styles.detailCard}
//               >
//                 <Ionicons name="star-outline" size={24} color="white" />
//                 <Text style={styles.detailCardLabel}>Rating</Text>
//                 <Text style={styles.detailCardValue}>{safeParseFloat(item.rating || 4.5).toFixed(1)} ⭐</Text>
//               </LinearGradient>

//               <LinearGradient
//                 colors={["#ffa726", "#ff7043"]}
//                 style={styles.detailCard}
//               >
//                 <Ionicons name="people-outline" size={24} color="white" />
//                 <Text style={styles.detailCardLabel}>Reviews</Text>
//                 <Text style={styles.detailCardValue}>{parseInt(item.reviewCount || item.reviews || 0)}+</Text>
//               </LinearGradient>
//             </View>

//             {item.allergens && (
//               <View style={styles.allergensContainer}>
//                 <Text style={styles.allergensTitle}>
//                   ⚠️ Allergen Information
//                 </Text>
//                 <View style={styles.allergensTags}>
//                   {item.allergens.map((allergen, index) => (
//                     <LinearGradient
//                       key={index}
//                       colors={["#ff6b6b", "#ff8e53"]}
//                       style={styles.allergenTag}
//                     >
//                       <Text style={styles.allergenText}>{allergen}</Text>
//                     </LinearGradient>
//                   ))}
//                 </View>
//               </View>
//             )}
//           </View>
//         );

//       case "ingredients":
//         return (
//           <View style={styles.tabContent}>
//             <Text style={styles.tabTitle}>🌿 Premium Ingredients</Text>
//             <Text style={styles.ingredientsSubtitle}>
//               Fresh, sustainably sourced ingredients selected daily
//             </Text>
//             <View style={styles.ingredientsList}>
//               {(item.ingredients || []).map((ingredient, index) => (
//                 <Animated.View
//                   key={index}
//                   style={[
//                     styles.ingredientItem,
//                     {
//                       opacity: fadeAnim,
//                       transform: [
//                         {
//                           translateY: slideUpAnim.interpolate({
//                             inputRange: [0, 100],
//                             outputRange: [0, 30 * (index + 1)],
//                           }),
//                         },
//                       ],
//                     },
//                   ]}
//                 >
//                   <LinearGradient
//                     colors={["#4ecdc4", "#44a08d"]}
//                     style={styles.ingredientIcon}
//                   >
//                     <Text style={styles.ingredientEmoji}>✓</Text>
//                   </LinearGradient>
//                   <View style={styles.ingredientContent}>
//                     <Text style={styles.ingredientName}>{ingredient}</Text>
//                     <Text style={styles.ingredientDesc}>Premium grade</Text>
//                   </View>
//                   <View style={styles.ingredientBadge}>
//                     <Text style={styles.ingredientBadgeText}>FRESH</Text>
//                   </View>
//                 </Animated.View>
//               ))}
//             </View>
//           </View>
//         );

//       case "nutrition":
//         return (
//           <View style={styles.tabContent}>
//             <Text style={styles.tabTitle}>💪 Nutrition Profile</Text>
//             <Text style={styles.nutritionSubtitle}>
//               Balanced nutrition crafted for wellness
//             </Text>
//             <View style={styles.nutritionGrid}>
//               <Animated.View
//                 style={[
//                   styles.nutritionCard,
//                   { transform: [{ scale: pulseAnim }] },
//                 ]}
//               >
//                 <LinearGradient
//                   colors={["#ff6b6b", "#ff8e53"]}
//                   style={styles.nutritionCircle}
//                 >
//                   <Text style={styles.nutritionValue}>
//                     {item.nutritionFacts?.calories || 320}
//                   </Text>
//                   <Text style={styles.nutritionUnit}>kcal</Text>
//                 </LinearGradient>
//                 <Text style={styles.nutritionLabel}>Energy</Text>
//                 <View style={styles.nutritionProgress}>
//                   <LinearGradient
//                     colors={["#ff6b6b", "#ff8e53"]}
//                     style={[styles.progressBar, { width: "75%" }]}
//                   />
//                 </View>
//               </Animated.View>

//               <View style={styles.nutritionCard}>
//                 <LinearGradient
//                   colors={["#667eea", "#764ba2"]}
//                   style={styles.nutritionCircle}
//                 >
//                   <Text style={styles.nutritionValue}>
//                     {item.nutritionFacts?.protein || "22g"}
//                   </Text>
//                 </LinearGradient>
//                 <Text style={styles.nutritionLabel}>Protein</Text>
//                 <View style={styles.nutritionProgress}>
//                   <LinearGradient
//                     colors={["#667eea", "#764ba2"]}
//                     style={[styles.progressBar, { width: "88%" }]}
//                   />
//                 </View>
//               </View>

//               <View style={styles.nutritionCard}>
//                 <LinearGradient
//                   colors={["#4ecdc4", "#44a08d"]}
//                   style={styles.nutritionCircle}
//                 >
//                   <Text style={styles.nutritionValue}>
//                     {item.nutritionFacts?.carbs || "38g"}
//                   </Text>
//                 </LinearGradient>
//                 <Text style={styles.nutritionLabel}>Carbs</Text>
//                 <View style={styles.nutritionProgress}>
//                   <LinearGradient
//                     colors={["#4ecdc4", "#44a08d"]}
//                     style={[styles.progressBar, { width: "60%" }]}
//                   />
//                 </View>
//               </View>

//               <View style={styles.nutritionCard}>
//                 <LinearGradient
//                   colors={["#ffa726", "#ff7043"]}
//                   style={styles.nutritionCircle}
//                 >
//                   <Text style={styles.nutritionValue}>
//                     {item.nutritionFacts?.fat || "12g"}
//                   </Text>
//                 </LinearGradient>
//                 <Text style={styles.nutritionLabel}>Healthy Fats</Text>
//                 <View style={styles.nutritionProgress}>
//                   <LinearGradient
//                     colors={["#ffa726", "#ff7043"]}
//                     style={[styles.progressBar, { width: "45%" }]}
//                   />
//                 </View>
//               </View>
//             </View>
//           </View>
//         );

//       case "reviews":
//         return (
//           <View style={styles.tabContent}>
//             <Text style={styles.tabTitle}>⭐ Customer Love</Text>
//             <View style={styles.reviewsHeader}>
//               <LinearGradient
//                 colors={["#667eea", "#764ba2"]}
//                 style={styles.ratingCard}
//               >
//                 <Text style={styles.overallRating}>{safeParseFloat(item.rating || 4.5).toFixed(1)}</Text>
//                 <View style={styles.starsContainer}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <Ionicons
//                       key={star}
//                       name={
//                         star <= Math.floor(safeParseFloat(item.rating || 4.5))
//                           ? "star"
//                           : "star-outline"
//                       }
//                       size={16}
//                       color="#FFD700"
//                     />
//                   ))}
//                 </View>
//                 <Text style={styles.reviewCount}>{parseInt(item.reviewCount || item.reviews || 0)} reviews</Text>
//               </LinearGradient>
//             </View>

//             <View style={styles.comingSoonCard}>
//               <LinearGradient
//                 colors={["#4ecdc4", "#44a08d"]}
//                 style={styles.comingSoonGradient}
//               >
//                 <Text style={styles.comingSoonEmoji}>💬</Text>
//                 <Text style={styles.comingSoonTitle}>Reviews Coming Soon!</Text>
//                 <Text style={styles.comingSoonText}>
//                   We're preparing detailed customer reviews for you
//                 </Text>
//               </LinearGradient>
//             </View>
//           </View>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="transparent"
//         translucent
//       />

//       {/* Animated Header */}
//       <Animated.View
//         style={[styles.animatedHeader, { opacity: headerOpacity }]}
//       >
//         <LinearGradient
//           colors={["#667eea", "#764ba2"]}
//           style={styles.headerGradient}
//         >
//           <View style={styles.headerContent}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Ionicons name="arrow-back" size={24} color="white" />
//             </TouchableOpacity>
//             <Text style={styles.headerTitle}>{item.name || item.item_name}</Text>
//             <TouchableOpacity style={styles.shareButton}>
//               <Ionicons name="share-outline" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </Animated.View>

//       <ScrollView
//         style={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//           { useNativeDriver: false }
//         )}
//         scrollEventThrottle={16}
//         bounces={true}
//       >
//         {/* Enhanced Hero Section */}
//         <View style={styles.heroSection}>
//           <Animated.View
//             style={[
//               styles.imageContainer,
//               { transform: [{ scale: imageScale }] },
//             ]}
//           >
//             <LinearGradient
//               colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
//               style={styles.imagePlaceholder}
//             >
//               {/* Shimmer effect */}
//               <Animated.View
//                 style={[
//                   styles.shimmerOverlay,
//                   { transform: [{ translateX: shimmerTranslate }] },
//                 ]}
//               >
//                 <LinearGradient
//                   colors={[
//                     "transparent",
//                     "rgba(255,255,255,0.5)",
//                     "transparent",
//                   ]}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 0 }}
//                   style={styles.shimmerGradient}
//                 />
//               </Animated.View>

//               <Animated.Text
//                 style={[
//                   styles.itemEmoji,
//                   { transform: [{ scale: scaleAnim }] },
//                 ]}
//               >
//                 {item.emoji || "🍽️"}
//               </Animated.Text>

//               {/* Enhanced floating elements */}
//               <Animated.View
//                 style={[
//                   styles.floatingElement,
//                   styles.element1,
//                   {
//                     transform: [
//                       {
//                         rotate: rotateAnim.interpolate({
//                           inputRange: [0, 1],
//                           outputRange: ["0deg", "360deg"],
//                         }),
//                       },
//                     ],
//                   },
//                 ]}
//               />

//               <Animated.View
//                 style={[
//                   styles.floatingElement,
//                   styles.element2,
//                   {
//                     transform: [
//                       {
//                         rotate: rotateAnim.interpolate({
//                           inputRange: [0, 1],
//                           outputRange: ["360deg", "0deg"],
//                         }),
//                       },
//                     ],
//                   },
//                 ]}
//               />

//               <Animated.View
//                 style={[
//                   styles.floatingElement,
//                   styles.element3,
//                   {
//                     transform: [{ scale: pulseAnim }],
//                   },
//                 ]}
//               />

//               {item.discount && (
//                 <Animated.View
//                   style={[
//                     styles.discountBadge,
//                     { transform: [{ scale: pulseAnim }] },
//                   ]}
//                 >
//                   <LinearGradient
//                     colors={["#ff6b6b", "#ff8e53"]}
//                     style={styles.discountGradient}
//                   >
//                     <Text style={styles.discountText}>{item.discount}</Text>
//                   </LinearGradient>
//                 </Animated.View>
//               )}
//             </LinearGradient>
//           </Animated.View>

//           {/* Enhanced Floating Actions */}
//           <View style={styles.floatingActions}>
//             <TouchableOpacity
//               style={styles.backButtonFloat}
//               onPress={() => navigation.goBack()}
//             >
//               <LinearGradient
//                 colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.8)"]}
//                 style={styles.floatingButtonGradient}
//               >
//                 <Ionicons name="arrow-back" size={24} color="#333" />
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.favoriteButtonFloat,
//                 isFavorite && styles.favoriteActive,
//               ]}
//               onPress={toggleFavorite}
//             >
//               <LinearGradient
//                 colors={
//                   isFavorite
//                     ? ["#ff6b6b", "#ff8e53"]
//                     : ["rgba(255,255,255,0.95)", "rgba(255,255,255,0.8)"]
//                 }
//                 style={styles.floatingButtonGradient}
//               >
//                 <Animated.View style={[{ transform: [{ scale: heartScale }] }]}>
//                   <Ionicons
//                     name={isFavorite ? "heart" : "heart-outline"}
//                     size={24}
//                     color={isFavorite ? "white" : "#ff6b6b"}
//                   />
//                 </Animated.View>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Enhanced Content Section */}
//         <Animated.View
//           style={[
//             styles.contentSection,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideUpAnim }],
//             },
//           ]}
//         >
//           {/* Main Info with enhanced styling */}
//           <View style={styles.mainInfo}>
//             <View style={styles.titleRow}>
//               <Text style={styles.itemTitle}>{item.name || item.item_name}</Text>
//               <LinearGradient
//                 colors={["#667eea", "#764ba2"]}
//                 style={styles.categoryBadge}
//               >
//                 <Text style={styles.categoryText}>
//                   {typeof item.category === 'object' ? item.category.name : item.category}
//                 </Text>
//               </LinearGradient>
//             </View>

//             <View style={styles.ratingRow}>
//               <View style={styles.ratingContainer}>
//                 <LinearGradient
//                   colors={["#FFD700", "#FFA726"]}
//                   style={styles.ratingBadge}
//                 >
//                   <Ionicons name="star" size={16} color="white" />
//                   <Text style={styles.ratingText}>{safeParseFloat(item.rating || 4.5).toFixed(1)}</Text>
//                 </LinearGradient>
//                 <Text style={styles.reviewsText}>({parseInt(item.reviewCount || item.reviews || 0)} reviews)</Text>
//               </View>

//               <View style={styles.prepTimeContainer}>
//                 <LinearGradient
//                   colors={["#4ecdc4", "#44a08d"]}
//                   style={styles.prepTimeBadge}
//                 >
//                   <Ionicons name="time" size={16} color="white" />
//                   <Text style={styles.prepTimeText}>{formatPrepTime(item.preparationTime)}</Text>
//                 </LinearGradient>
//               </View>
//             </View>

//             <Text style={styles.shortDescription}>{item.description}</Text>
//           </View>

//           {/* Enhanced Size Selection */}
//           <View style={styles.sizeSection}>
//             <Text style={styles.sectionTitle}>🎯 Choose Your Perfect Size</Text>
//             <View style={styles.sizeOptions}>
//               {sizes.map((size, index) => (
//                 <TouchableOpacity
//                   key={size.name}
//                   style={[
//                     styles.sizeOption,
//                     selectedSize === size.name && styles.selectedSize,
//                   ]}
//                   onPress={() => setSelectedSize(size.name)}
//                 >
//                   <LinearGradient
//                     colors={
//                       selectedSize === size.name
//                         ? ["#667eea", "#764ba2"]
//                         : ["transparent", "transparent"]
//                     }
//                     style={styles.sizeOptionGradient}
//                   >
//                     <Text
//                       style={[
//                         styles.sizeName,
//                         selectedSize === size.name && styles.selectedSizeName,
//                       ]}
//                     >
//                       {size.name}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.sizePrice,
//                         selectedSize === size.name && styles.selectedSizePrice,
//                       ]}
//                     >
//                       ${safeParseFloat(size.price).toFixed(2)}
//                     </Text>

//                     {size.popular && (
//                       <LinearGradient
//                         colors={["#ff6b6b", "#ff8e53"]}
//                         style={styles.popularBadge}
//                       >
//                         <Text style={styles.popularText}>POPULAR</Text>
//                       </LinearGradient>
//                     )}

//                     {size.discount && (
//                       <LinearGradient
//                         colors={["#4ecdc4", "#44a08d"]}
//                         style={styles.sizeBadge}
//                       >
//                         <Text style={styles.sizeBadgeText}>
//                           {size.discount}
//                         </Text>
//                       </LinearGradient>
//                     )}

//                     {size.extra && (
//                       <LinearGradient
//                         colors={["#ffa726", "#ff7043"]}
//                         style={styles.sizeBadge}
//                       >
//                         <Text style={styles.sizeBadgeText}>{size.extra}</Text>
//                       </LinearGradient>
//                     )}
//                   </LinearGradient>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Enhanced Tabs Section */}
//           <View style={styles.tabsSection}>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={styles.tabsContainer}
//             >
//               {tabs.map((tab, index) => (
//                 <TouchableOpacity
//                   key={tab.key}
//                   style={[
//                     styles.tab,
//                     activeTab === tab.key && styles.activeTab,
//                   ]}
//                   onPress={() => setActiveTab(tab.key)}
//                 >
//                   <LinearGradient
//                     colors={
//                       activeTab === tab.key
//                         ? tab.gradient
//                         : ["transparent", "transparent"]
//                     }
//                     style={styles.tabGradient}
//                   >
//                     <Ionicons
//                       name={tab.icon}
//                       size={18}
//                       color={activeTab === tab.key ? "white" : tab.gradient[0]}
//                     />
//                     <Text
//                       style={[
//                         styles.tabText,
//                         activeTab === tab.key && styles.activeTabText,
//                       ]}
//                     >
//                       {tab.title}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>

//             {renderTabContent()}
//           </View>

//           <View style={{ height: 140 }} />
//         </Animated.View>
//       </ScrollView>

//       {/* Enhanced Bottom Action Bar */}
//       <Animated.View
//         style={[
//           styles.bottomBar,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideUpAnim }],
//           },
//         ]}
//       >
//         <LinearGradient
//           colors={["rgba(255,255,255,0.98)", "rgba(255,255,255,0.95)"]}
//           style={styles.bottomBarGradient}
//         >
//           <View style={styles.bottomContent}>
//             <View style={styles.quantitySection}>
//               <Text style={styles.quantityLabel}>Quantity</Text>
//               <View style={styles.quantityControls}>
//                 <TouchableOpacity
//                   style={styles.quantityButton}
//                   onPress={() => updateQuantity(-1)}
//                 >
//                   <LinearGradient
//                     colors={["#f8f9fa", "#e9ecef"]}
//                     style={styles.quantityButtonGradient}
//                   >
//                     <Ionicons name="remove" size={20} color="#667eea" />
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <View style
