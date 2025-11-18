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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";

const EditProfileModal = ({ visible, onClose, user, onUpdateSuccess }) => {
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    department: user?.department || "",
  });

  const updateProfile = async () => {
    setEditLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const response = await axios.put(`${BASE_URL}/users/me`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        Alert.alert("Success", "Profile updated successfully");
        onUpdateSuccess(response.data.user);
        onClose();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible && user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [visible, user]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <StatusBar barStyle="light-content" />

        {/* Beautiful Gradient Header */}
        <LinearGradient
          colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight + 16 : 56,
            paddingBottom: 32,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
              },
              android: {
                elevation: 12,
              },
            }),
          }}
        >
          {/* Header Controls */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <View
              style={{ flex: 1, alignItems: "center", marginHorizontal: 16 }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Edit Profile
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: "500",
                }}
              >
                Update your information
              </Text>
            </View>

            <TouchableOpacity
              onPress={updateProfile}
              disabled={editLoading}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: editLoading
                  ? "rgba(255, 255, 255, 0.2)"
                  : "white",
              }}
            >
              {editLoading ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Text
                  style={{ color: "#8B5CF6", fontWeight: "700", fontSize: 15 }}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={{ alignItems: "center" }}>
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 4,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <Text
                  style={{ fontSize: 40, fontWeight: "800", color: "white" }}
                >
                  {user?.firstName
                    ? user.firstName.charAt(0).toUpperCase()
                    : "U"}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: "#8B5CF6",
                }}
              >
                <Ionicons name="camera" size={18} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Form Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information Section */}
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#EDE9FE",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="person" size={24} color="#8B5CF6" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}
                >
                  Personal Info
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}
                >
                  Tell us about yourself
                </Text>
              </View>
            </View>

            {/* First Name */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                First Name
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: editForm.firstName ? "#8B5CF6" : "#E5E7EB",
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
                  }}
                  value={editForm.firstName}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, firstName: text })
                  }
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: editForm.firstName ? "#8B5CF6" : "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={editForm.firstName ? "white" : "#9CA3AF"}
                  />
                </View>
              </View>
            </View>

            {/* Last Name */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Last Name
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: editForm.lastName ? "#8B5CF6" : "#E5E7EB",
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
                  }}
                  value={editForm.lastName}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, lastName: text })
                  }
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: editForm.lastName ? "#8B5CF6" : "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={editForm.lastName ? "white" : "#9CA3AF"}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#D1FAE5",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="mail" size={24} color="#10B981" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}
                >
                  Contact
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}
                >
                  Stay connected
                </Text>
              </View>
            </View>

            {/* Email (Read-only) */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Email Address
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#6B7280",
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                  }}
                  value={user?.email}
                  editable={false}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#D1D5DB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="lock-closed" size={16} color="white" />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginLeft: 6,
                    fontWeight: "500",
                  }}
                >
                  Email cannot be changed
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Phone Number
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: editForm.phone ? "#10B981" : "#E5E7EB",
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
                  }}
                  value={editForm.phone}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, phone: text })
                  }
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: editForm.phone ? "#10B981" : "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={editForm.phone ? "white" : "#9CA3AF"}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Academic Information Section */}
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="school" size={24} color="#EF4444" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}
                >
                  Academic
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6B7280", fontWeight: "500" }}
                >
                  Your studies
                </Text>
              </View>
            </View>

            {/* Department */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Department
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#111827",
                    borderWidth: 2,
                    borderColor: editForm.department ? "#EF4444" : "#E5E7EB",
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
                  }}
                  value={editForm.department}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, department: text })
                  }
                  placeholder="Enter your department"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: editForm.department
                      ? "#EF4444"
                      : "#E5E7EB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={editForm.department ? "white" : "#9CA3AF"}
                  />
                </View>
              </View>
            </View>

            {/* Role (Read-only) */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Role
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  style={{
                    backgroundColor: "#F3F4F6",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 48,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#6B7280",
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                    textTransform: "capitalize",
                  }}
                  value={user?.role}
                  editable={false}
                  placeholder="User role"
                  placeholderTextColor="#9CA3AF"
                />
                <View
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    marginTop: -16,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#D1D5DB",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="lock-closed" size={16} color="white" />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginLeft: 6,
                    fontWeight: "500",
                  }}
                >
                  Role assigned by administration
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#6B7280" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={updateProfile}
              disabled={editLoading}
              style={{
                flex: 2,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                opacity: editLoading ? 0.7 : 1,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={
                  editLoading ? ["#9CA3AF", "#D1D5DB"] : ["#8B5CF6", "#7C3AED"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {editLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "white",
                        marginLeft: 8,
                      }}
                    >
                      Save Changes
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
