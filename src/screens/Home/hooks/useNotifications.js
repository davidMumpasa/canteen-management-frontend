import { useState, useEffect } from "react";
import { BASE_URL } from "../../../../config";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/notifications/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        const notifArray = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data)
          ? data
          : [];

        setNotifications(notifArray);
        const unread = notifArray.filter((n) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      } else {
        console.error("⚠️ Unexpected response:", data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only (lighter request)
  const fetchUnreadCount = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${BASE_URL}/notifications/user/${userId}/unread-count`
      );
      const data = await response.json();

      console.log("🔔 Updated unread count --->:", response);

      if (data.success && typeof data.count === "number") {
        setUnreadCount(data.count);
        console.log("🔔 Updated unread count --->:", data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }), // ✅ Send userId for verification
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${BASE_URL}/notifications/user/${userId}/mark-all-read`,
        {
          method: "PUT",
        }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Recalculate unread count
        setUnreadCount((prev) => {
          const notification = notifications.find(
            (n) => n.id === notificationId
          );
          return notification && !notification.isRead && !notification.read
            ? Math.max(0, prev - 1)
            : prev;
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Initial fetch when userId changes
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
    }
  }, [userId]);

  return {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
