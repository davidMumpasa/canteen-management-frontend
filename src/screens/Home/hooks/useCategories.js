// hooks/useCategories.js
import { useState, useCallback } from "react";
import AppService from "../../../services/AppService";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await AppService.get("/categories/getAll");
      let categoriesData =
        data.success && Array.isArray(data.data)
          ? data.data
          : data.success
          ? [data]
          : Array.isArray(data)
          ? data
          : [];

      // Add Favorites category at the beginning
      const favoritesCategory = {
        id: 0, // Use 0 or 'favorites' as a special ID
        name: "For You",
        sortOrder: 0,
        image: "❤️",
      };

      // Insert Favorites at the start
      categoriesData = [favoritesCategory, ...categoriesData];

      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback categories with Favorites first
      const fallbackCategories = [
        { id: 0, name: "Favorites", sortOrder: 0, image: "❤️" },
        { id: 1, name: "Popular", sortOrder: 1 },
        { id: 2, name: "Asian", sortOrder: 2 },
        { id: 3, name: "Healthy", sortOrder: 3 },
        { id: 4, name: "Fast", sortOrder: 4 },
      ];
      setCategories(fallbackCategories);
      return fallbackCategories;
    }
  }, []);

  return {
    categories,
    setCategories,
    loadCategories,
  };
};
