import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

const CampusMapView = ({
  selectedCampus,
  pickupLocations,
  onLocationSelect,
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const markerScale = useRef(new Animated.Value(0)).current;

  // Campus coordinates
  const campusCoordinates = {
    "Pretoria (Main) Campus": {
      latitude: -25.7321795,
      longitude: 28.1618965,
      address: "Staatsartillerie Rd, Pretoria West, Pretoria, 0183",
    },
    "Arcadia Campus": {
      latitude: -25.7448033,
      longitude: 28.2000848,
      address: "175 Nelson Mandela Dr, Arcadia, Pretoria, 0083",
    },
    "Ga-Rankuwa Campus": {
      latitude: -25.6088046,
      longitude: 28.0085093,
      address: "2827 Botsi St, Ga-Rankuwa Unit 2, Ga-Rankuwa, 0208",
    },
    "Soshanguve North Campus": {
      latitude: -25.5207006,
      longitude: 28.1148059,
      address: "Unnamed Rd, Soshanguve, 0164",
    },
    "Soshanguve South Campus": {
      latitude: -25.5400069,
      longitude: 28.0969297,
      address: "2 Aubrey Matlakala St, Block K, Soshanguve-K, 0152",
    },
    "eMalahleni (Witbank) Campus": {
      latitude: -25.8775546,
      longitude: 29.236488,
      address: "Mandela St, eMalahleni, 1034",
    },
    "Mbombela Campus": {
      latitude: -25.4997627,
      longitude: 30.9561004,
      address: "Madiba Dr & Techno Dr, Sonheuwel, Mbombela, 1201",
    },
    "Polokwane Campus": {
      latitude: -23.8999335,
      longitude: 29.4488012,
      address: "109 Market St, Polokwane Ext 67, Polokwane, 0699",
    },
  };

  const customMapStyle = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (mapReady && selectedCampus && campusCoordinates[selectedCampus.name]) {
      setTimeout(() => {
        animateToRegion();
      }, 100);
    }
  }, [mapReady, selectedCampus]);

  useEffect(() => {
    if (mapReady) {
      setTimeout(() => {
        Animated.spring(markerScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }).start();
      }, 100);
    }
  }, [mapReady]);

  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Location error:", error);
      setIsLoadingLocation(false);
    }
  };

  const animateToRegion = () => {
    if (!mapRef.current || !selectedCampus) return;

    const campusCoord = campusCoordinates[selectedCampus.name];
    if (!campusCoord) return;

    const region = {
      latitude: campusCoord.latitude,
      longitude: campusCoord.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    mapRef.current.animateToRegion(region, 1000);
  };

  const zoomToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  const getInitialRegion = () => {
    if (selectedCampus && campusCoordinates[selectedCampus.name]) {
      const coord = campusCoordinates[selectedCampus.name];
      return {
        ...coord,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    if (userLocation) {
      return {
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: -25.7313,
      longitude: 28.1875,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <View style={styles.container}>
      {/* Map Container - Top Half */}
      <View style={styles.mapContainer}>
        {isLoadingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={getInitialRegion()}
            customMapStyle={customMapStyle}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            onMapReady={() => setMapReady(true)}
          >
            {/* Campus Circle */}
            {selectedCampus && campusCoordinates[selectedCampus.name] && (
              <Circle
                center={campusCoordinates[selectedCampus.name]}
                radius={500}
                fillColor="rgba(124, 58, 237, 0.15)"
                strokeColor="rgba(124, 58, 237, 0.5)"
                strokeWidth={2}
              />
            )}

            {/* Campus Marker */}
            {selectedCampus && campusCoordinates[selectedCampus.name] && (
              <Marker
                coordinate={campusCoordinates[selectedCampus.name]}
                title={selectedCampus.name}
                description="Campus Location"
              >
                <Animated.View
                  style={[
                    styles.markerContainer,
                    { transform: [{ scale: markerScale }] },
                  ]}
                >
                  <View style={styles.campusMarker}>
                    <Ionicons name="school" size={28} color="white" />
                  </View>
                  <View style={styles.markerLine} />
                  <View style={styles.markerDot} />
                </Animated.View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Map Controls Overlay */}
        {!isLoadingLocation && (
          <>
            {/* Campus Info Card */}
            {selectedCampus && (
              <View style={styles.campusInfoCard}>
                <View style={styles.campusInfoContent}>
                  <View style={styles.campusInfoRow}>
                    <View style={styles.campusIconContainer}>
                      <Ionicons
                        name={selectedCampus.icon}
                        size={20}
                        color="#7c3aed"
                      />
                    </View>
                    <View style={styles.campusTextContainer}>
                      <Text style={styles.campusName}>
                        {selectedCampus.name}
                      </Text>
                      <Text style={styles.campusSubtext}>
                        {campusCoordinates[selectedCampus.name]?.address}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Location Button */}
            <TouchableOpacity
              onPress={zoomToUserLocation}
              style={styles.locationButton}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={24} color="#7c3aed" />
            </TouchableOpacity>

            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                onPress={() => {
                  if (mapRef.current) {
                    const currentRegion = mapRef.current.__lastRegion;
                    if (currentRegion) {
                      mapRef.current.animateToRegion(
                        {
                          ...currentRegion,
                          latitudeDelta: currentRegion.latitudeDelta / 2,
                          longitudeDelta: currentRegion.longitudeDelta / 2,
                        },
                        300
                      );
                    }
                  }
                }}
                style={styles.zoomButtonTop}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (mapRef.current) {
                    const currentRegion = mapRef.current.__lastRegion;
                    if (currentRegion) {
                      mapRef.current.animateToRegion(
                        {
                          ...currentRegion,
                          latitudeDelta: currentRegion.latitudeDelta * 2,
                          longitudeDelta: currentRegion.longitudeDelta * 2,
                        },
                        300
                      );
                    }
                  }
                }}
                style={styles.zoomButtonBottom}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Pickup Locations List - Bottom Half */}
      <View style={styles.pickupListContainer}>
        <View style={styles.pickupListHeader}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="location" size={24} color="#7c3aed" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pickupListTitle}>Select Pickup Location</Text>
            <Text style={styles.pickupListSubtitle}>
              {pickupLocations.length} locations available at this campus
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.pickupScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pickupScrollContent}
        >
          {pickupLocations.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="location-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                No pickup locations available
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Please select a different campus
              </Text>
            </View>
          ) : (
            pickupLocations.map((location, index) => (
              <TouchableOpacity
                key={location.id}
                onPress={() => onLocationSelect(location)}
                style={styles.pickupLocationCard}
                activeOpacity={0.7}
              >
                <View style={styles.pickupLocationContent}>
                  <LinearGradient
                    colors={["#3b82f6", "#7c3aed"]}
                    style={styles.pickupLocationIcon}
                  >
                    <Ionicons name="location" size={24} color="white" />
                  </LinearGradient>

                  <View style={styles.pickupLocationDetails}>
                    <Text style={styles.pickupLocationName}>
                      {location.name}
                    </Text>
                    <View style={styles.pickupLocationMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>15-20 min</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="walk-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>2-5 min walk</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.pickupLocationArrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#9CA3AF"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    margin: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#6B7280",
    marginTop: 16,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  campusMarker: {
    backgroundColor: "#7c3aed",
    borderRadius: 50,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  markerLine: {
    backgroundColor: "#7c3aed",
    width: 4,
    height: 16,
    marginTop: -4,
  },
  markerDot: {
    backgroundColor: "#7c3aed",
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: -4,
  },
  campusInfoCard: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
  },
  campusInfoContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  campusInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  campusIconContainer: {
    backgroundColor: "#F3E8FF",
    borderRadius: 50,
    padding: 10,
    marginRight: 12,
  },
  campusTextContainer: {
    flex: 1,
  },
  campusName: {
    color: "#111827",
    fontWeight: "bold",
    fontSize: 16,
  },
  campusSubtext: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  locationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  zoomControls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  zoomButtonTop: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  zoomButtonBottom: {
    padding: 12,
  },
  // Pickup Locations List Styles
  pickupListContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pickupListHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerIconContainer: {
    backgroundColor: "#F3E8FF",
    borderRadius: 50,
    padding: 12,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  pickupListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  pickupListSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  pickupScrollView: {
    flex: 1,
  },
  pickupScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  pickupLocationCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pickupLocationContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  pickupLocationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pickupLocationDetails: {
    flex: 1,
  },
  pickupLocationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  pickupLocationMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  pickupLocationArrow: {
    marginLeft: 8,
  },
});

export default CampusMapView;
