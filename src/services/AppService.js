// services/AppService.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JWT from "expo-jwt";
import { TOKEN_KEY } from "../../config";

// Backend API base URL
import { BASE_URL } from "../../config";

class AppService {
  // ✅ Decode user ID from stored token
  static async getUserIdFromToken() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.error("❌ No token found");
        return null;
      }

      const decoded = JWT.decode(token, TOKEN_KEY);

      return decoded;
    } catch (err) {
      console.error("❌ Error decoding token:", err);
      return null;
    }
  }

  // ✅ Get stored token
  static async getToken() {
    try {
      return await AsyncStorage.getItem("token");
    } catch (err) {
      console.error("❌ Error retrieving token:", err);
      return null;
    }
  }

  // ✅ Generic GET request
  static async get(endpoint) {
    try {
      const token = await this.getToken();
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (err) {
      console.error(
        `❌ GET ${endpoint} failed:`,
        err.response?.data || err.message
      );
      throw err;
    }
  }

  // ✅ Generic POST request
  static async post(endpoint, data) {
    try {
      const token = await this.getToken();
      const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error(
        `❌ POST ${endpoint} failed:`,
        err.response?.data || err.message
      );
      throw err;
    }
  }

  // ✅ Generic PATCH request
  static async patch(endpoint, data) {
    try {
      const token = await this.getToken();
      const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err) {
      console.error(
        `❌ PATCH ${endpoint} failed:`,
        err.response?.data || err.message
      );
      throw err;
    }
  }
}

export default AppService;
