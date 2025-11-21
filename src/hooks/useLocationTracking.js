// hooks/useLocationTracking.js
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import DeliveryService from "../services/DeliveryService";
import { Alert } from "react-native";

/**
 * Custom hook for tracking driver location and sending updates to backend
 * @param {string} driverId - Driver ID
 * @param {boolean} isActive - Whether location tracking should be active
 * @param {number} updateInterval - Update interval in milliseconds (default: 10000ms = 10s)
 * @returns {Object} { location, error, isTracking, startTracking, stopTracking }
 */
export const useLocationTracking = (
  driverId,
  isActive = false,
  updateInterval = 10000
) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const locationSubscription = useRef(null);
  const updateTimer = useRef(null);

  // Request location permissions
  const requestPermissions = async () => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setError("Location permission denied");
        Alert.alert(
          "Location Permission Required",
          "Please enable location permissions to track your deliveries.",
          [{ text: "OK" }]
        );
        return false;
      }

      // Request background location permissions (optional, for when app is in background)
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        console.log("⚠️ Background location permission not granted");
        // Continue without background permission
      }

      setHasPermission(true);
      return true;
    } catch (err) {
      console.error("❌ Error requesting location permissions:", err);
      setError("Failed to request location permissions");
      return false;
    }
  };

  // Update location to backend
  const updateLocationToBackend = async (coords) => {
    if (!driverId) {
      console.log("⚠️ No driver ID provided, skipping location update");
      return;
    }

    try {
      const { latitude, longitude } = coords;

      console.log(`📍 Updating location: ${latitude}, ${longitude}`);

      await DeliveryService.updateDriverLocation(driverId, latitude, longitude);

      console.log("✅ Location updated successfully");
    } catch (err) {
      console.error("❌ Error updating location to backend:", err);
      // Don't show alert for every failed update to avoid annoying the driver
    }
  };

  // Start location tracking
  const startTracking = async () => {
    try {
      console.log("🚀 Starting location tracking...");

      // Request permissions if not already granted
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) return;
      }

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(initialLocation.coords);
      await updateLocationToBackend(initialLocation.coords);

      // Watch location changes
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (newLocation) => {
          console.log("📍 Location changed:", newLocation.coords);
          setLocation(newLocation.coords);
        }
      );

      // Set up periodic backend updates
      updateTimer.current = setInterval(async () => {
        if (location) {
          await updateLocationToBackend(location);
        }
      }, updateInterval);

      setIsTracking(true);
      setError(null);
      console.log("✅ Location tracking started");
    } catch (err) {
      console.error("❌ Error starting location tracking:", err);
      setError("Failed to start location tracking");
      Alert.alert(
        "Error",
        "Failed to start location tracking. Please try again."
      );
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    console.log("🛑 Stopping location tracking...");

    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (updateTimer.current) {
      clearInterval(updateTimer.current);
      updateTimer.current = null;
    }

    setIsTracking(false);
    console.log("✅ Location tracking stopped");
  };

  // Auto start/stop based on isActive prop
  useEffect(() => {
    if (isActive && driverId) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive, driverId]);

  // Update backend when location changes
  useEffect(() => {
    if (location && isTracking && driverId) {
      updateLocationToBackend(location);
    }
  }, [location]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    hasPermission,
    startTracking,
    stopTracking,
  };
};

export default useLocationTracking;
