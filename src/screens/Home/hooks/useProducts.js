// hooks/useProducts.js
import { useState, useCallback } from "react";
import { Animated, Alert } from "react-native";
import AppService from "../../../services/AppService";

export const useProducts = (selectedCategory, searchText, productsOpacity) => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const loadFavoriteProducts = useCallback(async (userId) => {
    try {
      // If userId is not provided, get it from token
      if (!userId) {
        const payload = await AppService.getUserIdFromToken();
        userId = payload?.id || payload?.userId;
      }

      if (!userId) {
        console.warn("⚠️ No userId found in decoded token");
        return [];
      }

      const data = await AppService.get(`/products/favorites/${userId}`);

      if (data.success && data.data) {
        const favoriteProducts = Array.isArray(data.data)
          ? data.data
          : data.data.products || [];

        return favoriteProducts;
      }

      return [];
    } catch (error) {
      console.error("❌ Error loading favorite products:", error);
      return [];
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);

    // Fade out animation for smooth transition
    Animated.timing(productsOpacity, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      // Check if "For You" category is selected (id: 0)
      const isForYouCategory = selectedCategory === 0;

      if (isForYouCategory) {
        // Load favorite products
        const favoriteProducts = await loadFavoriteProducts();
        console.log(
          "📦 Loading Favorites for 'For You':",
          favoriteProducts.length,
          "items"
        );
        setProducts(favoriteProducts);
      } else {
        // Load regular products
        const params = {
          page: 1,
          limit: 20,
          search: searchText || undefined,
          categoryId: selectedCategory || undefined,
          isAvailable: true,
        };

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });

        const data = await AppService.get(`/products/getAll?${queryParams}`);

        if (data.success && data.data) {
          const productsData = data.data.products || [];
          console.log(
            "📦 Loading products for category:",
            selectedCategory,
            "-",
            productsData.length,
            "items"
          );
          setProducts(productsData);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Error", "Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
      // Fade in animation
      Animated.timing(productsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCategory, searchText, productsOpacity, loadFavoriteProducts]);

  return {
    products,
    setProducts,
    productsLoading,
    loadProducts,
    loadFavoriteProducts,
  };
};
