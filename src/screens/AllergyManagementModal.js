import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";

const AllergyManagementModal = ({ visible, onClose, userId }) => {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);

  const [formData, setFormData] = useState({
    allergen: "",
    severity: "moderate",
    notes: "",
  });

  const severityOptions = [
    { value: "low", label: "Mild", color: "#10B981", icon: "leaf" },
    { value: "moderate", label: "Moderate", color: "#F59E0B", icon: "alert" },
    { value: "high", label: "Severe", color: "#EF4444", icon: "warning" },
  ];

  const commonAllergens = [
    { name: "Peanuts", icon: "nutrition" },
    { name: "Tree Nuts", icon: "nutrition" },
    { name: "Milk", icon: "water" },
    { name: "Eggs", icon: "egg" },
    { name: "Wheat", icon: "leaf" },
    { name: "Soy", icon: "nutrition" },
    { name: "Fish", icon: "fish" },
    { name: "Shellfish", icon: "fish" },
  ];

  // Fetch allergies
  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/allergy/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.allergies) {
        setAllergies(response.data.allergies);
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
      Alert.alert("Error", "Failed to load allergies");
    } finally {
      setLoading(false);
    }
  };

  // Add allergy
  const handleAddAllergy = async () => {
    if (!formData.allergen.trim()) {
      Alert.alert("Error", "Please enter an allergen name");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/allergy/add`,
        {
          userId,
          allergen: formData.allergen,
          severity: formData.severity,
          notes: formData.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.allergy) {
        Alert.alert("Success", "Allergy added successfully");
        setFormData({ allergen: "", severity: "moderate", notes: "" });
        setShowAddForm(false);
        await fetchAllergies();
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
      Alert.alert("Error", "Failed to add allergy");
    } finally {
      setLoading(false);
    }
  };

  // Update allergy
  const handleUpdateAllergy = async () => {
    if (!formData.allergen.trim()) {
      Alert.alert("Error", "Please enter an allergen name");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/allergy/update/${editingAllergy.id}`,
        {
          allergen: formData.allergen,
          severity: formData.severity,
          notes: formData.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.allergy) {
        Alert.alert("Success", "Allergy updated successfully");
        setFormData({ allergen: "", severity: "moderate", notes: "" });
        setEditingAllergy(null);
        setShowAddForm(false);
        await fetchAllergies();
      }
    } catch (error) {
      console.error("Error updating allergy:", error);
      Alert.alert("Error", "Failed to update allergy");
    } finally {
      setLoading(false);
    }
  };

  // Delete allergy
  const handleDeleteAllergy = (allergyId) => {
    Alert.alert(
      "Delete Allergy",
      "Are you sure you want to delete this allergy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              // You'll need to add a delete endpoint to your backend
              await axios.delete(`${BASE_URL}/allergy/delete/${allergyId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert("Success", "Allergy deleted successfully");
              await fetchAllergies();
            } catch (error) {
              console.error("Error deleting allergy:", error);
              Alert.alert("Error", "Failed to delete allergy");
            }
          },
        },
      ]
    );
  };

  // Edit allergy
  const startEditAllergy = (allergy) => {
    setEditingAllergy(allergy);
    setFormData({
      allergen: allergy.allergen,
      severity: allergy.severity,
      notes: allergy.notes || "",
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ allergen: "", severity: "moderate", notes: "" });
    setEditingAllergy(null);
    setShowAddForm(false);
  };

  React.useEffect(() => {
    if (visible && userId) {
      fetchAllergies();
    }
  }, [visible, userId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        {/* Header */}
        <LinearGradient
          colors={["#EF4444", "#DC2626", "#B91C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === "ios" ? 56 : 40,
            paddingBottom: 24,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "white",
                flex: 1,
                textAlign: "center",
              }}
            >
              My Allergies
            </Text>

            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowAddForm(true);
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="add" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
            }}
          >
            <Ionicons name="shield-checkmark" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 13,
                fontWeight: "600",
                marginLeft: 8,
                flex: 1,
              }}
            >
              Keep your allergy profile updated for safer food choices
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add/Edit Form */}
          {showAddForm && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: 16,
                }}
              >
                {editingAllergy ? "Edit Allergy" : "Add New Allergy"}
              </Text>

              {/* Quick Select Common Allergens */}
              {!editingAllergy && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    Common Allergens
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {commonAllergens.map((item) => (
                      <TouchableOpacity
                        key={item.name}
                        onPress={() =>
                          setFormData({ ...formData, allergen: item.name })
                        }
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor:
                            formData.allergen === item.name
                              ? "#FEE2E2"
                              : "#F3F4F6",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor:
                            formData.allergen === item.name
                              ? "#EF4444"
                              : "transparent",
                        }}
                      >
                        <Ionicons
                          name={item.icon}
                          size={14}
                          color={
                            formData.allergen === item.name
                              ? "#EF4444"
                              : "#6B7280"
                          }
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color:
                              formData.allergen === item.name
                                ? "#EF4444"
                                : "#6B7280",
                            marginLeft: 6,
                          }}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Allergen Name */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Allergen Name *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: formData.allergen ? "#EF4444" : "#E5E7EB",
                  }}
                  value={formData.allergen}
                  onChangeText={(text) =>
                    setFormData({ ...formData, allergen: text })
                  }
                  placeholder="e.g., Peanuts, Shellfish, Dairy"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Severity Level */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Severity Level *
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {severityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() =>
                        setFormData({ ...formData, severity: option.value })
                      }
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        alignItems: "center",
                        backgroundColor:
                          formData.severity === option.value
                            ? option.color
                            : "#F3F4F6",
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor:
                          formData.severity === option.value
                            ? option.color
                            : "#E5E7EB",
                      }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          formData.severity === option.value
                            ? "white"
                            : "#6B7280"
                        }
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color:
                            formData.severity === option.value
                              ? "white"
                              : "#6B7280",
                          marginTop: 4,
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Additional Notes (Optional)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                  placeholder="e.g., Causes anaphylaxis, carry EpiPen"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={resetForm}
                  style={{
                    flex: 1,
                    backgroundColor: "#F3F4F6",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#6B7280",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={
                    editingAllergy ? handleUpdateAllergy : handleAddAllergy
                  }
                  disabled={loading}
                  style={{
                    flex: 2,
                    backgroundColor: loading ? "#9CA3AF" : "#EF4444",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name={editingAllergy ? "checkmark" : "add"}
                        size={18}
                        color="white"
                      />
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "700",
                          color: "white",
                          marginLeft: 6,
                        }}
                      >
                        {editingAllergy ? "Update" : "Add"} Allergy
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Allergies List */}
          {loading && !showAddForm ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#EF4444" />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: "#6B7280",
                  fontWeight: "500",
                }}
              >
                Loading allergies...
              </Text>
            </View>
          ) : allergies.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 40,
                backgroundColor: "white",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="medical" size={40} color="#EF4444" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                No Allergies Added
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Add your allergies to get personalized warnings when ordering
                food
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(true)}
                style={{
                  backgroundColor: "#EF4444",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={18} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 6,
                  }}
                >
                  Add Your First Allergy
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {allergies.map((allergy) => {
                const severityConfig = severityOptions.find(
                  (s) => s.value === allergy.severity
                );
                return (
                  <View
                    key={allergy.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 17,
                            fontWeight: "800",
                            color: "#111827",
                            marginBottom: 6,
                          }}
                        >
                          {allergy.allergen}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: severityConfig?.color + "20",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Ionicons
                            name={severityConfig?.icon}
                            size={14}
                            color={severityConfig?.color}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: severityConfig?.color,
                              marginLeft: 4,
                              textTransform: "capitalize",
                            }}
                          >
                            {severityConfig?.label}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => startEditAllergy(allergy)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#DBEAFE",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons name="create" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteAllergy(allergy.id)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#FEE2E2",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {allergy.notes && (
                      <View
                        style={{
                          backgroundColor: "#F9FAFB",
                          padding: 12,
                          borderRadius: 10,
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#6B7280",
                            lineHeight: 18,
                          }}
                        >
                          {allergy.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AllergyManagementModal;
