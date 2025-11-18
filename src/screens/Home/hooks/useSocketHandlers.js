import { useCallback } from "react";
import { Animated, Alert } from "react-native";

const useSocketHandlers = ({
  selectedCategory,
  setProducts,
  setCategories,
  setNotifications,
  setUnreadCount,
  loadProducts,
  loadCategories,
  animations,
}) => {
  const { pulseAnim, productsOpacity } = animations;

  const handleProductUpdate = useCallback(
    (data) => {
      if (!data) return;

      let action, productData;
      if (data.data && data.data.data) {
        action = data.data.action || data.action;
        productData = data.data.data;
      } else if (data.data) {
        action = data.action;
        productData = data.data;
      } else return;

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      switch (action) {
        case "created":
          if (
            !selectedCategory ||
            productData.categoryId === selectedCategory
          ) {
            setProducts((prev) => [productData, ...prev]);
          }
          break;
        case "updated":
        case "availability_toggled":
          setProducts((prev) =>
            prev.map((p) =>
              p.id === productData.id ? { ...p, ...productData } : p
            )
          );
          break;
        case "deleted":
          setProducts((prev) => prev.filter((p) => p.id !== productData.id));
          break;
        default:
          loadProducts();
      }
    },
    [selectedCategory, setProducts, pulseAnim, loadProducts]
  );

  const handleCategoryUpdate = useCallback(
    (data) => {
      if (!data) return;

      let action, categoryData;
      if (data.data && data.data.data) {
        action = data.data.action || data.action;
        categoryData = data.data.data;
      } else if (data.data) {
        action = data.action;
        categoryData = data.data;
      } else return;

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      switch (action) {
        case "created":
          setCategories((prev) =>
            [...prev, categoryData].sort(
              (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
            )
          );
          break;
        case "updated":
          setCategories((prev) =>
            prev.map((c) =>
              c.id === categoryData.id ? { ...c, ...categoryData } : c
            )
          );
          break;
        case "deleted":
          setCategories((prev) => prev.filter((c) => c.id !== categoryData.id));
          break;
        default:
          loadCategories();
      }
    },
    [setCategories, pulseAnim, loadCategories]
  );

  const handleNotificationUpdate = useCallback(
    (data) => {
      if (!data) return;

      let action, notificationData;
      if (data.data && data.data.data) {
        action = data.data.action || data.action;
        notificationData = data.data.data;
      } else if (data.data) {
        action = data.action;
        notificationData = data.data;
      } else return;

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      switch (action) {
        case "created":
          setNotifications((prev) => [notificationData, ...prev]);
          setUnreadCount((prev) => prev + 1);
          break;
        case "read":
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationData.id
                ? { ...n, isRead: true, read: true }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          break;
        case "deleted":
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationData.id)
          );
          break;
        case "allRead":
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true, read: true }))
          );
          setUnreadCount(0);
          break;
        default:
          // Refetch if needed
          break;
      }
    },
    [setNotifications, setUnreadCount, pulseAnim]
  );

  return {
    handleProductUpdate,
    handleCategoryUpdate,
    handleNotificationUpdate,
  };
};

export { useSocketHandlers };
