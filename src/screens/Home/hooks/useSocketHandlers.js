// hooks/useSocketHandlers.js
import { useCallback } from "react";

export const useSocketHandlers = ({
  selectedCategory,
  setProducts,
  setCategories,
  setNotifications,
  setUnreadCount,
  loadProducts,
  loadCategories,
  fetchUnreadCount, // ✅ Add this
  animations,
}) => {
  const handleNotificationUpdate = useCallback(
    (payload) => {
      console.log("🔔 Socket notification update:", payload);

      const { action, data, notification } = payload;
      const notif = notification || data;

      switch (action) {
        case "created":
          console.log("🔔 New notification created:", notif);
          if (notif) {
            setNotifications((prev) => [notif, ...prev]);
            // ✅ Increment unread count for new notifications
            if (!notif.isRead) {
              setUnreadCount((prev) => prev + 1);
            }
          }
          break;

        case "read":
          console.log("🔔 Notification marked as read:", notif);
          if (notif?.id || notif?.notificationId) {
            const notificationId = notif.id || notif.notificationId;
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
              )
            );
            // ✅ Decrement unread count
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          break;

        case "deleted":
          console.log("🔔 Notification deleted:", notif);
          if (notif?.id || notif?.notificationId) {
            const notificationId = notif.id || notif.notificationId;
            setNotifications((prev) => {
              const deletedNotif = prev.find((n) => n.id === notificationId);
              // ✅ Decrement unread count if deleted notification was unread
              if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
              }
              return prev.filter((n) => n.id !== notificationId);
            });
          }
          break;

        case "allRead":
          console.log("🔔 All notifications marked as read");
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount(0);
          break;

        case "updated":
          console.log("🔔 Notification updated:", notif);
          if (notif?.id) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notif.id ? { ...n, ...notif } : n))
            );
            // ✅ Refresh unread count from server to ensure accuracy
            if (fetchUnreadCount) {
              fetchUnreadCount();
            }
          }
          break;

        default:
          console.log("🔔 Unknown notification action:", action);
      }
    },
    [setNotifications, setUnreadCount, fetchUnreadCount]
  );

  const handleProductUpdate = useCallback(
    (payload) => {
      console.log("📦 Product update received:", payload);
      const { action, data, product } = payload;
      const updatedProduct = product || data;

      if (!updatedProduct) return;

      switch (action) {
        case "created":
          if (
            selectedCategory === 0 ||
            updatedProduct.categoryId === selectedCategory
          ) {
            setProducts((prev) => [updatedProduct, ...prev]);
          }
          break;

        case "updated":
          setProducts((prev) =>
            prev.map((p) =>
              p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
            )
          );
          break;

        case "deleted":
          setProducts((prev) => prev.filter((p) => p.id !== updatedProduct.id));
          break;

        case "availability_toggled":
          setProducts((prev) =>
            prev.map((p) =>
              p.id === updatedProduct.id
                ? { ...p, available: updatedProduct.available }
                : p
            )
          );
          break;

        default:
          loadProducts();
      }

      if (animations?.productsOpacity) {
        animations.productsOpacity.setValue(0);
        animations.startProductAnimation();
      }
    },
    [selectedCategory, setProducts, loadProducts, animations]
  );

  const handleCategoryUpdate = useCallback(
    (payload) => {
      console.log("📁 Category update received:", payload);
      const { action, data, category } = payload;
      const updatedCategory = category || data;

      if (!updatedCategory) return;

      switch (action) {
        case "created":
          setCategories((prev) => [...prev, updatedCategory]);
          break;

        case "updated":
          setCategories((prev) =>
            prev.map((c) =>
              c.id === updatedCategory.id ? { ...c, ...updatedCategory } : c
            )
          );
          break;

        case "deleted":
          setCategories((prev) =>
            prev.filter((c) => c.id !== updatedCategory.id)
          );
          break;

        default:
          loadCategories();
      }
    },
    [setCategories, loadCategories]
  );

  return {
    handleProductUpdate,
    handleCategoryUpdate,
    handleNotificationUpdate,
  };
};
