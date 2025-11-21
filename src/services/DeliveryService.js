// services/DeliveryService.js
import AppService from "./AppService";

class DeliveryService {
  constructor() {
    this.baseUrl = "/delivery";
  }

  /**
   * Get all orders ready for pickup
   * @returns {Promise<Object>} { success: boolean, data: Array, count: number }
   */
  async getReadyOrders(driverId) {
    try {
      const response = await AppService.get(`${this.baseUrl}/ready-orders`);
      const filteredOrders = response.data.filter(
        (order) =>
          order.deliveryDriverId === driverId &&
          !order.deliveryAddress
            ?.toLowerCase()
            .includes("main canteen pickup counter")
      );

      return filteredOrders;
    } catch (error) {
      console.error("❌ Error fetching ready orders:", error);
      throw error;
    }
  }

  async verifyPickupCode(orderId, pickupCode, driverId) {
    try {
      const response = await AppService.post(
        `${this.baseUrl}/verify-pickup-code`,
        {
          orderId,
          pickupCode,
          driverId,
        }
      );

      if (!response) {
        throw new Error("No response received from server");
      }

      return {
        success: response.success,
        message: response.message,
        order: response.order,
        driver: response.driver,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to verify pickup code";

      console.error("❌ Error verifying pickup code:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Driver confirms manual pickup of an order
   * @param {string} orderId - Order ID
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} { success: boolean, message: string, order: Object, driver: Object }
   */
  async confirmPickup(orderId, driverId) {
    try {
      const response = await AppService.post(`${this.baseUrl}/confirm-pickup`, {
        orderId,
        driverId,
      });

      if (!response) {
        throw new Error("No data returned from server");
      }

      return {
        success: response.success,
        message: response.message,
        order: response.order,
        driver: response.driver,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to confirm pickup";
      console.error("❌ Error confirming pickup:", errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Auto-assign available driver to order (admin/system)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} { success: boolean, message: string, driver: Object, order: Object }
   */
  async assignDriverAutomatically(orderId) {
    try {
      const response = await AppService.post(`${this.baseUrl}/assign`, {
        orderId,
      });
      return response;
    } catch (error) {
      console.error("❌ Error assigning driver:", error);
      throw error;
    }
  }

  /**
   * Get all orders for a specific driver
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} { success: boolean, data: Array, count: number }
   */
  async getDriverOrders(driverId) {
    try {
      const response = await AppService.get(
        `${this.baseUrl}/driver/${driverId}/orders`
      );
      return response;
    } catch (error) {
      console.error("❌ Error fetching driver orders:", error);
      throw error;
    }
  }

  /**
   * Get active orders for a driver (out_for_delivery status)
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} { success: boolean, data: Array, count: number }
   */
  async getDriverActiveOrders(driverId) {
    try {
      const response = await AppService.get(
        `${this.baseUrl}/driver/${driverId}/active-orders`
      );
      return response;
    } catch (error) {
      console.error("❌ Error fetching active orders:", error);
      throw error;
    }
  }

  /**
   * Mark order as delivered/completed
   * @param {string} orderId - Order ID
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} { success: boolean, message: string, order: Object }
   */
  async markOrderDelivered(orderId, driverId) {
    try {
      const response = await AppService.post(
        `${this.baseUrl}/order/${orderId}/delivered`,
        { driverId }
      );
      return response;
    } catch (error) {
      console.error("❌ Error marking order delivered:", error);
      throw error;
    }
  }

  /**
   * Update driver's live GPS location
   * @param {string} driverId - Driver ID
   * @param {number} lat - Latitude
   * @param {number} long - Longitude
   * @returns {Promise<Object>} { success: boolean, message: string, driver: Object }
   */
  async updateDriverLocation(driverId, lat, long) {
    try {
      const response = await AppService.patch(
        `${this.baseUrl}/driver/${driverId}/location`,
        { lat, long }
      );
      return response;
    } catch (error) {
      console.error("❌ Error updating driver location:", error);
      throw error;
    }
  }

  /**
   * Get driver information/profile
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} { success: boolean, data: Object }
   */
  async getDriverInfo(driverId) {
    try {
      const response = await AppService.get(
        `${this.baseUrl}/driver/${driverId}/info`
      );
      return response;
    } catch (error) {
      console.error("❌ Error fetching driver info:", error);
      throw error;
    }
  }

  /**
   * Update driver status (available, busy, offline)
   * @param {string} driverId - Driver ID
   * @param {string} status - Status: "available" | "busy" | "offline"
   * @returns {Promise<Object>} { success: boolean, message: string, driver: Object }
   */
  async updateDriverStatus(driverId, status) {
    try {
      const validStatuses = ["available", "busy", "offline"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status. Must be: available, busy, or offline");
      }

      const response = await AppService.patch(
        `${this.baseUrl}/driver/${driverId}/status`,
        { status }
      );
      return response;
    } catch (error) {
      console.error("❌ Error updating driver status:", error);
      throw error;
    }
  }

  /**
   * Register new user/driver
   * @param {Object} userData - { firstName, lastName, email, password, phoneNumber, isDriver }
   * @returns {Promise<Object>} { success: boolean, message: string, user: Object }
   */
  async register(userData) {
    try {
      const response = await AppService.post(
        `${this.baseUrl}/register`,
        userData
      );
      return response;
    } catch (error) {
      console.error("❌ Error registering user:", error);
      throw error;
    }
  }

  /**
   * Login user/driver
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} { success: boolean, message: string, token: string, user: Object, driverProfile: Object }
   */
  async login(email, password) {
    try {
      const response = await AppService.post(`${this.baseUrl}/login`, {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("❌ Error logging in:", error);
      throw error;
    }
  }
}

export default new DeliveryService();
