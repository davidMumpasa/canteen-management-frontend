// services/socketService.js - Enhanced Version with Real-time Updates
import io from "socket.io-client";
import React from "react";
import { BASE_URL } from "../../config";
import AppService from "./AppService";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.currentUserId = null;
    this.currentUserRole = null;
    this.joinedRooms = new Set();
  }

  // Initialize socket connection
  init = async () => {
    try {
      // Disconnect existing socket first
      if (this.socket) {
        this.socket.disconnect();
      }

      // Get user data for authentication
      const user = await AppService.getUserIdFromToken();
      if (!user) {
        console.warn("No user data found for socket connection");
        return false;
      }

      this.currentUserId = user.id;
      this.currentUserRole = user.role || "student";

      // Create socket connection
      this.socket = io(BASE_URL, {
        transports: ["websocket"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 20000,
        query: {
          userId: user.id,
          userType: user.role || "student",
        },
      });

      // Set up event listeners
      this.setupEventListeners(user);

      return true;
    } catch (error) {
      console.error("Socket initialization failed:", error);
      return false;
    }
  };

  setupEventListeners = (user) => {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      //console.log("✅ Socket connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Join user-specific room for personalized updates
      this.joinUserRoom(user.id);

      // Join admin room if user is admin/staff/kitchen
      if (
        user.role === "admin" ||
        user.role === "staff" ||
        user.role === "kitchen"
      ) {
        this.joinAdminRoom();
      }

      // Join driver room if user is a delivery driver
      if (user.role === "delivery" || user.role === "driver") {
        this.joinDriverRoom();
      }

      // Notify listeners about connection
      this.emit("socketConnected", { userId: user.id, userRole: user.role });
    });

    this.socket.on("disconnect", (reason) => {
      //console.log("❌ Socket disconnected:", reason);
      this.isConnected = false;
      this.joinedRooms.clear();
      this.emit("socketDisconnected", { reason });
    });

    this.socket.on("connect_error", (error) => {
      //console.error("Socket connection error:", error);
      this.isConnected = false;
      this.emit("socketError", { error });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      //console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.emit("socketReconnected", { attemptNumber });
    });

    // ===========================================
    // ORDER EVENTS
    // ===========================================
    this.socket.on("orderUpdated", (data) => {
      console.log("📦 Order updated received:", data);
      this.emit("orderStatusChanged", data);
      this.emit("orderUpdated", data);
    });

    this.socket.on("newOrder", (data) => {
      console.log("🆕 New order received:", data);
      this.emit("orderCreated", data);
      this.emit("newOrder", data);
    });

    this.socket.on("orderStatusChanged", (data) => {
      //console.log("🔄 Order status changed received:", data);
      this.emit("orderStatusChanged", data);
    });

    this.socket.on("orderDeleted", (data) => {
      console.log("🗑️ Order deleted received:", data);
      this.emit("orderDeleted", data);
    });

    // ===========================================
    // DELIVERY/DRIVER EVENTS
    // ===========================================
    this.socket.on("orderReadyForPickup", (data) => {
      console.log("🚗 Order ready for pickup:", data);
      this.emit("orderReadyForPickup", data);
      this.emit("orderStatusChanged", data);
    });

    this.socket.on("deliveryAssigned", (data) => {
      console.log("📍 Delivery assigned:", data);
      this.emit("deliveryAssigned", data);
    });

    this.socket.on("deliveryStarted", (data) => {
      console.log("🚚 Delivery started:", data);
      this.emit("deliveryStarted", data);
      this.emit("orderStatusChanged", data);
    });

    this.socket.on("deliveryCompleted", (data) => {
      console.log("✅ Delivery completed:", data);
      this.emit("deliveryCompleted", data);
      this.emit("orderStatusChanged", data);
    });

    this.socket.on("driverLocationUpdate", (data) => {
      console.log("📍 Driver location updated:", data);
      this.emit("driverLocationUpdate", data);
    });

    // ===========================================
    // PRODUCT EVENTS
    // ===========================================
    this.socket.on("productCreated", (data) => {
      this.emit("productCreated", data);
      this.emit("productUpdated", { action: "created", data });
    });

    this.socket.on("productUpdated", (data) => {
      this.emit("productUpdated", { action: "updated", data });
    });

    this.socket.on("productDeleted", (data) => {
      this.emit("productDeleted", data);
      this.emit("productUpdated", { action: "deleted", data });
    });

    this.socket.on("productAvailabilityToggled", (data) => {
      this.emit("productAvailabilityToggled", data);
      this.emit("productUpdated", { action: "availability_toggled", data });
    });

    // Generic product update handler for backward compatibility
    this.socket.on("productUpdate", (data) => {
      this.emit("productUpdated", data);
    });

    // ===========================================
    // CATEGORY EVENTS
    // ===========================================
    this.socket.on("categoryCreated", (data) => {
      console.log("📁 Category created received:", data);
      this.emit("categoryCreated", data);
      this.emit("categoryUpdated", { action: "created", data });
    });

    this.socket.on("categoryUpdated", (data) => {
      console.log("🔄 Category updated received:", data);
      this.emit("categoryUpdated", { action: "updated", data });
    });

    this.socket.on("categoryDeleted", (data) => {
      console.log("🗑️ Category deleted received:", data);
      this.emit("categoryDeleted", data);
      this.emit("categoryUpdated", { action: "deleted", data });
    });

    // Generic category update handler
    this.socket.on("categoryUpdate", (data) => {
      console.log("🔄 Generic category update received:", data);
      this.emit("categoryUpdated", data);
    });

    // ===========================================
    // USER EVENTS
    // ===========================================
    this.socket.on("userCreated", (data) => {
      console.log("👤 User created received:", data);
      this.emit("userCreated", data);
      this.emit("userUpdated", { action: "created", data });
    });

    this.socket.on("userUpdated", (data) => {
      console.log("🔄 User updated received:", data);
      this.emit("userUpdated", { action: "updated", data });
    });

    this.socket.on("userDeleted", (data) => {
      console.log("🗑️ User deleted received:", data);
      this.emit("userDeleted", data);
      this.emit("userUpdated", { action: "deleted", data });
    });

    this.socket.on("userStatusChanged", (data) => {
      console.log("🔄 User status changed:", data);
      this.emit("userStatusChanged", data);
      this.emit("userUpdated", { action: "status_changed", data });
    });

    // ===========================================
    // PAYMENT EVENTS
    // ===========================================
    this.socket.on("paymentProcessed", (data) => {
      console.log("💳 Payment processed:", data);
      this.emit("paymentProcessed", data);
    });

    this.socket.on("paymentFailed", (data) => {
      console.log("❌ Payment failed:", data);
      this.emit("paymentFailed", data);
    });

    this.socket.on("refundProcessed", (data) => {
      console.log("💰 Refund processed:", data);
      this.emit("refundProcessed", data);
    });

    // ===========================================
    // CHAT EVENTS
    // ===========================================
    this.socket.on("newMessage", (data) => {
      console.log("💬 New message received:", data);
      this.emit("newMessage", data);
    });

    this.socket.on("messageDelivered", (data) => {
      console.log("✅ Message delivered:", data);
      this.emit("messageDelivered", data);
    });

    this.socket.on("messageRead", (data) => {
      console.log("👁️ Message read:", data);
      this.emit("messageRead", data);
    });

    this.socket.on("typingStart", (data) => {
      console.log("⌨️ User started typing:", data);
      this.emit("typingStart", data);
    });

    this.socket.on("typingStop", (data) => {
      console.log("⌨️ User stopped typing:", data);
      this.emit("typingStop", data);
    });

    // ===========================================
    // NOTIFICATION EVENTS
    // ===========================================
    this.socket.on("notificationCreated", (data) => {
      console.log("🔔 notificationCreated received:", data);
      this.emit("notificationCreated", data);
    });

    this.socket.on("systemAnnouncement", (data) => {
      console.log("📢 System announcement:", data);
      this.emit("systemAnnouncement", data);
    });

    // ===========================================
    // ANALYTICS EVENTS (for admin users)
    // ===========================================
    this.socket.on("analyticsUpdate", (data) => {
      console.log("📊 Analytics update:", data);
      this.emit("analyticsUpdate", data);
    });

    this.socket.on("salesUpdate", (data) => {
      console.log("💰 Sales update:", data);
      this.emit("salesUpdate", data);
    });

    // ===========================================
    // GENERIC DATA UPDATE EVENTS
    // ===========================================
    this.socket.on("dataUpdate", (data) => {
      console.log("🔄 Generic data update:", data);
      this.emit("dataUpdate", data);

      // Route to specific handlers based on type
      if (data.type) {
        this.emit(`${data.type}Updated`, data);
      }
    });
  };

  // ===========================================
  // ROOM MANAGEMENT METHODS
  // ===========================================

  // Join user room for personalized updates
  joinUserRoom = (userId) => {
    if (this.socket && this.socket.connected && userId) {
      const roomName = `user-${userId}`;
      this.socket.emit("join-user-room", userId);
      this.joinedRooms.add(roomName);
      console.log(`👤 Joined user room: ${roomName}`);
    }
  };

  // Join admin room for administrative updates
  joinAdminRoom = () => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join-admin-room");
      this.joinedRooms.add("admin-room");
      console.log("👨‍💼 Joined admin room");
    }
  };

  // Join driver room for delivery driver updates
  joinDriverRoom = () => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join-driver-room");
      this.joinedRooms.add("driver-room");
      console.log("🚗 Joined driver room");
    }
  };

  // Leave driver room
  leaveDriverRoom = () => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave-driver-room");
      this.joinedRooms.delete("driver-room");
      console.log("🚗 Left driver room");
    }
  };

  // Join specific order room for tracking
  joinOrderRoom = (orderId) => {
    if (this.socket && this.socket.connected && orderId) {
      const roomName = `order-${orderId}`;
      this.socket.emit("join-order-room", orderId);
      this.joinedRooms.add(roomName);
      console.log(`📦 Joined order room: ${roomName}`);
    }
  };

  // Leave order room
  leaveOrderRoom = (orderId) => {
    if (this.socket && this.socket.connected && orderId) {
      const roomName = `order-${orderId}`;
      this.socket.emit("leave-order-room", orderId);
      this.joinedRooms.delete(roomName);
      console.log(`📦 Left order room: ${roomName}`);
    }
  };

  // Join chat room
  joinChatRoom = (chatId) => {
    if (this.socket && this.socket.connected && chatId) {
      const roomName = `chat-${chatId}`;
      this.socket.emit("join-chat-room", chatId);
      this.joinedRooms.add(roomName);
      console.log(`💬 Joined chat room: ${roomName}`);
    }
  };

  // Leave chat room
  leaveChatRoom = (chatId) => {
    if (this.socket && this.socket.connected && chatId) {
      const roomName = `chat-${chatId}`;
      this.socket.emit("leave-chat-room", chatId);
      this.joinedRooms.delete(roomName);
      console.log(`💬 Left chat room: ${roomName}`);
    }
  };

  // ===========================================
  // MESSAGING METHODS
  // ===========================================

  // Send chat message
  sendMessage = (chatId, message) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("sendMessage", {
        chatId,
        message,
        timestamp: new Date().toISOString(),
      });
      console.log(`💬 Message sent to chat ${chatId}:`, message);
    }
  };

  // Send typing indicators
  startTyping = (chatId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("startTyping", { chatId });
    }
  };

  stopTyping = (chatId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("stopTyping", { chatId });
    }
  };

  // Mark message as read
  markMessageAsRead = (messageId, chatId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("markAsRead", { messageId, chatId });
    }
  };

  // ===========================================
  // DRIVER-SPECIFIC METHODS
  // ===========================================

  // Update driver location
  updateDriverLocation = (driverId, location) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateDriverLocation", {
        driverId,
        location,
        timestamp: new Date().toISOString(),
      });
      console.log(`📍 Driver location updated for ${driverId}`);
    }
  };

  // Update driver status
  updateDriverStatus = (driverId, status) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateDriverStatus", {
        driverId,
        status,
        timestamp: new Date().toISOString(),
      });
      console.log(`🚗 Driver status updated to ${status}`);
    }
  };

  // Notify driver of new delivery assignment
  notifyDeliveryAssignment = (orderId, driverId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit("deliveryAssigned", { orderId, driverId });
      console.log(`📦 Notified driver ${driverId} of order ${orderId}`);
    }
  };

  // ===========================================
  // EVENT LISTENER MANAGEMENT
  // ===========================================

  // Add event listener
  on = (eventName, callback) => {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    //console.log(`📡 Added listener for: ${eventName}`);
  };

  // Remove specific event listener
  off = (eventName, callback) => {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        //console.log(`📡 Removed listener for: ${eventName}`);
      }
    }
  };

  // Remove all listeners for an event
  removeAllListeners = (eventName) => {
    if (this.listeners.has(eventName)) {
      this.listeners.delete(eventName);
      console.log(`📡 Removed all listeners for: ${eventName}`);
    }
  };

  // Emit event to all listeners
  emit = (eventName, data) => {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName);
      console.log(
        `📢 Emitting ${eventName} to ${callbacks.length} listeners:`,
        data
      );

      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventName} listener:`, error);
        }
      });
    } else {
      console.log(`📢 No listeners for event: ${eventName}`);
    }
  };

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  // Get connection status
  getConnectionStatus = () => this.isConnected;

  // Get current user info
  getCurrentUser = () => ({
    id: this.currentUserId,
    role: this.currentUserRole,
  });

  // Get joined rooms
  getJoinedRooms = () => Array.from(this.joinedRooms);

  // Check if connected to specific room
  isInRoom = (roomName) => this.joinedRooms.has(roomName);

  // Force reconnection
  reconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  };

  // ===========================================
  // CLEANUP
  // ===========================================

  // Cleanup and disconnect
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.joinedRooms.clear();
    this.currentUserId = null;
    this.currentUserRole = null;
    console.log("🧹 Socket service cleaned up");
  };
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;

// ===========================================
// REACT HOOKS FOR EASIER USAGE
// ===========================================

// Main socket hook
export const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState("connecting");

  React.useEffect(() => {
    // Initialize socket when hook is first used
    const initSocket = async () => {
      const success = await socketService.init();
      if (success) {
        setIsConnected(socketService.getConnectionStatus());
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("failed");
      }
    };

    initSocket();

    // Set up connection status listeners
    const handleConnection = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    };

    const handleDisconnection = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
    };

    const handleError = () => {
      setIsConnected(false);
      setConnectionStatus("error");
    };

    const handleReconnected = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
    };

    socketService.on("socketConnected", handleConnection);
    socketService.on("socketDisconnected", handleDisconnection);
    socketService.on("socketError", handleError);
    socketService.on("socketReconnected", handleReconnected);

    // Check connection status periodically
    const interval = setInterval(() => {
      const currentStatus = socketService.getConnectionStatus();
      setIsConnected(currentStatus);
      if (!currentStatus && connectionStatus === "connected") {
        setConnectionStatus("disconnected");
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      socketService.off("socketConnected", handleConnection);
      socketService.off("socketDisconnected", handleDisconnection);
      socketService.off("socketError", handleError);
      socketService.off("socketReconnected", handleReconnected);
    };
  }, []);

  return {
    socket: socketService,
    isConnected,
    connectionStatus,
    // Room management
    joinOrderRoom: socketService.joinOrderRoom,
    leaveOrderRoom: socketService.leaveOrderRoom,
    joinChatRoom: socketService.joinChatRoom,
    leaveChatRoom: socketService.leaveChatRoom,
    joinDriverRoom: socketService.joinDriverRoom,
    leaveDriverRoom: socketService.leaveDriverRoom,
    // Event management
    on: socketService.on,
    off: socketService.off,
    // Messaging
    sendMessage: socketService.sendMessage,
    startTyping: socketService.startTyping,
    stopTyping: socketService.stopTyping,
    markMessageAsRead: socketService.markMessageAsRead,
    // Driver-specific
    updateDriverLocation: socketService.updateDriverLocation,
    updateDriverStatus: socketService.updateDriverStatus,
    notifyDeliveryAssignment: socketService.notifyDeliveryAssignment,
    // Utilities
    getCurrentUser: socketService.getCurrentUser,
    getJoinedRooms: socketService.getJoinedRooms,
    isInRoom: socketService.isInRoom,
    reconnect: socketService.reconnect,
  };
};

// Specialized hook for real-time data updates
export const useRealTimeUpdates = (entityTypes = []) => {
  const { socket, isConnected, on, off } = useSocket();
  const [updates, setUpdates] = React.useState({});

  React.useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (type) => (data) => {
      setUpdates((prev) => ({
        ...prev,
        [type]: {
          ...data,
          timestamp: Date.now(),
        },
      }));
    };

    // Set up listeners for specified entity types
    const listeners = {};
    entityTypes.forEach((type) => {
      const eventName = `${type}Updated`;
      const handler = handleUpdate(type);
      listeners[eventName] = handler;
      on(eventName, handler);
    });

    // Set up generic data update listener
    const genericHandler = (data) => {
      if (data.type && entityTypes.includes(data.type)) {
        handleUpdate(data.type)(data);
      }
    };
    on("dataUpdate", genericHandler);

    return () => {
      // Clean up listeners
      Object.entries(listeners).forEach(([eventName, handler]) => {
        off(eventName, handler);
      });
      off("dataUpdate", genericHandler);
    };
  }, [isConnected, entityTypes.join(",")]);

  return {
    updates,
    isConnected,
    clearUpdates: () => setUpdates({}),
  };
};

// Hook for order tracking
export const useOrderTracking = (orderId) => {
  const { socket, isConnected, joinOrderRoom, leaveOrderRoom, on, off } =
    useSocket();
  const [orderStatus, setOrderStatus] = React.useState(null);

  React.useEffect(() => {
    if (!isConnected || !orderId) return;

    // Join the order room
    joinOrderRoom(orderId);

    // Set up order status listener
    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId || data.id === orderId) {
        setOrderStatus(data);
      }
    };

    on("orderStatusChanged", handleOrderUpdate);
    on("orderUpdated", handleOrderUpdate);

    return () => {
      // Clean up
      leaveOrderRoom(orderId);
      off("orderStatusChanged", handleOrderUpdate);
      off("orderUpdated", handleOrderUpdate);
    };
  }, [isConnected, orderId]);

  return {
    orderStatus,
    isConnected,
    isTracking: socketService.isInRoom(`order-${orderId}`),
  };
};

// Hook for driver delivery tracking
export const useDriverDeliveries = (driverId) => {
  const { socket, isConnected, joinDriverRoom, leaveDriverRoom, on, off } =
    useSocket();
  const [activeDeliveries, setActiveDeliveries] = React.useState([]);
  const [readyOrders, setReadyOrders] = React.useState([]);

  React.useEffect(() => {
    if (!isConnected || !driverId) return;

    // Join the driver room
    joinDriverRoom();

    // Set up delivery listeners
    const handleOrderReady = (data) => {
      console.log("🚗 Order ready for pickup:", data);
      if (data.order && data.order.status === "ready") {
        setReadyOrders((prev) => {
          const exists = prev.find((o) => o.id === data.order.id);
          return exists ? prev : [...prev, data.order];
        });
      }
    };

    const handleDeliveryAssigned = (data) => {
      console.log("📦 Delivery assigned:", data);
      if (data.driverId === driverId) {
        setActiveDeliveries((prev) => [...prev, data.order]);
      }
    };

    const handleOrderUpdate = (data) => {
      if (data.order) {
        const order = data.order;

        // Update ready orders
        if (order.status === "ready") {
          setReadyOrders((prev) => {
            const exists = prev.find((o) => o.id === order.id);
            return exists ? prev : [...prev, order];
          });
        } else {
          setReadyOrders((prev) => prev.filter((o) => o.id !== order.id));
        }

        // Update active deliveries
        if (order.status === "out_for_delivery") {
          setActiveDeliveries((prev) => {
            const exists = prev.find((o) => o.id === order.id);
            return exists
              ? prev.map((o) => (o.id === order.id ? order : o))
              : [...prev, order];
          });
        } else if (
          order.status === "completed" ||
          order.status === "delivered"
        ) {
          setActiveDeliveries((prev) => prev.filter((o) => o.id !== order.id));
        }
      }
    };

    on("orderReadyForPickup", handleOrderReady);
    on("deliveryAssigned", handleDeliveryAssigned);
    on("orderStatusChanged", handleOrderUpdate);
    on("orderUpdated", handleOrderUpdate);

    return () => {
      // Clean up
      leaveDriverRoom();
      off("orderReadyForPickup", handleOrderReady);
      off("deliveryAssigned", handleDeliveryAssigned);
      off("orderStatusChanged", handleOrderUpdate);
      off("orderUpdated", handleOrderUpdate);
    };
  }, [isConnected, driverId]);

  return {
    activeDeliveries,
    readyOrders,
    isConnected,
    isInDriverRoom: socketService.isInRoom("driver-room"),
  };
};

// Hook for chat functionality
export const useChat = (chatId) => {
  const {
    socket,
    isConnected,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    on,
    off,
  } = useSocket();

  const [messages, setMessages] = React.useState([]);
  const [typingUsers, setTypingUsers] = React.useState([]);

  React.useEffect(() => {
    if (!isConnected || !chatId) return;

    // Join the chat room
    joinChatRoom(chatId);

    // Set up message listeners
    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleTypingStart = (data) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => [
          ...prev.filter((u) => u.id !== data.user.id),
          data.user,
        ]);
      }
    };

    const handleTypingStop = (data) => {
      if (data.chatId === chatId) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.user.id));
      }
    };

    on("newMessage", handleNewMessage);
    on("typingStart", handleTypingStart);
    on("typingStop", handleTypingStop);

    return () => {
      // Clean up
      leaveChatRoom(chatId);
      off("newMessage", handleNewMessage);
      off("typingStart", handleTypingStart);
      off("typingStop", handleTypingStop);
    };
  }, [isConnected, chatId]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage: (message) => sendMessage(chatId, message),
    startTyping: () => startTyping(chatId),
    stopTyping: () => stopTyping(chatId),
    markAsRead: (messageId) => markMessageAsRead(messageId, chatId),
    isInChatRoom: socketService.isInRoom(`chat-${chatId}`),
  };
};
