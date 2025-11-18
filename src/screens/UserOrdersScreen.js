import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL } from "../../config";
import AppService from "../services/AppService";
import { useNavigation } from "@react-navigation/native";

const UserOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/orders/getUserOderById/${user.id}`
      );

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      } else {
        setError("No orders found");
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.message);
      setError(err.response?.data?.error || "Failed to load orders");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getuUserId = async () => {
    try {
      setLoading(true);
      const sessionUser = await AppService.getUserIdFromToken();

      if (sessionUser && (sessionUser.id || sessionUser.userId)) {
        const userId = sessionUser.id || sessionUser.userId;
        setUser({
          id: userId,
          email: sessionUser.email || "",
          name: sessionUser.name || "",
          ...sessionUser,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search query
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredOrders(orders);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = orders.filter((order) => {
      return (
        order.orderNumber?.toLowerCase().includes(lowercaseQuery) ||
        order.status?.toLowerCase().includes(lowercaseQuery) ||
        order.orderType?.toLowerCase().includes(lowercaseQuery) ||
        order.orderItems?.some((item) =>
          item.product?.name?.toLowerCase().includes(lowercaseQuery)
        )
      );
    });

    setFilteredOrders(filtered);
  };

  // Open order detail modal
  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close modal
  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedOrder(null);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
  };

  useEffect(() => {
    getuUserId();
  }, []);

  useEffect(() => {
    if (user.id) {
      fetchUserOrders();
    }
  }, [user.id]);

  const getStatusStyle = (status) => {
    const styles = {
      pending: {
        bg: "#FEF3C7",
        text: "#92400E",
        icon: "⏳",
        color: "#F59E0B",
      },
      confirmed: {
        bg: "#DBEAFE",
        text: "#1E3A8A",
        icon: "✓",
        color: "#3B82F6",
      },
      preparing: {
        bg: "#FFEDD5",
        text: "#9A3412",
        icon: "🍳",
        color: "#F97316",
      },
      ready: {
        bg: "#D1FAE5",
        text: "#065F46",
        icon: "📦",
        color: "#10B981",
      },
      completed: {
        bg: "#EDE9FE",
        text: "#5B21B6",
        icon: "✅",
        color: "#8B5CF6",
      },
      cancelled: {
        bg: "#FEE2E2",
        text: "#991B1B",
        icon: "❌",
        color: "#EF4444",
      },
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatCurrency = (amount) => {
    return `R${parseFloat(amount).toFixed(2)}`;
  };

  // ✅ Show loading screen while fetching data (first load only)
  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  // ✅ Show error/empty state only after loading is complete
  if (!loading && error && orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={50} color="#7C3AED" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here once you place your first order
          </Text>
          <TouchableOpacity
            onPress={fetchUserOrders}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>Refresh Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header with Gradient */}
      <LinearGradient
        colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIconGlow}>
              <Ionicons name="receipt-outline" size={28} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </Text>
          </View>
        </View>

        {/* Modern Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#A78BFA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order number or item..."
              placeholderTextColor="#C4B5FD"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery !== "" && (
              <TouchableOpacity
                onPress={() => handleSearch("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#A78BFA" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8B5CF6"]}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateGlow} />
            <View style={styles.emptyStateContent}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="file-tray-outline" size={64} color="#8B5CF6" />
              </View>
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Start ordering to see your history"}
              </Text>
            </View>
          </View>
        ) : (
          filteredOrders.map((order, index) => {
            const statusStyle = getStatusStyle(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => openOrderDetail(order)}
                activeOpacity={0.8}
                style={[
                  styles.orderCard,
                  {
                    transform: [{ scale: 1 }],
                    opacity: 1,
                  },
                ]}
              >
                {/* Status Indicator Strip */}
                <View
                  style={[
                    styles.statusStrip,
                    { backgroundColor: statusStyle.bg },
                  ]}
                />

                <View style={styles.orderCardContent}>
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <Text style={styles.orderNumber}>
                        {order.orderNumber}
                      </Text>
                      <View style={styles.orderMeta}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text style={styles.orderDate}>
                          {formatDate(order.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: statusStyle.text },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  {/* Order Items Preview */}
                  <View style={styles.itemsPreview}>
                    <View style={styles.itemImageContainer}>
                      <Text style={styles.itemImage}>
                        {order.orderItems?.[0]?.product?.image || "🍽️"}
                      </Text>
                      {order.orderItems?.length > 1 && (
                        <View style={styles.itemCountBadge}>
                          <Text style={styles.itemCountBadgeText}>
                            +{order.orderItems.length - 1}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {order.orderItems?.[0]?.product?.name || "Order Items"}
                      </Text>
                      <Text style={styles.itemSubtext}>
                        {order.orderItems?.length}{" "}
                        {order.orderItems?.length === 1 ? "item" : "items"}
                      </Text>
                    </View>
                  </View>

                  {/* Order Footer */}
                  <View style={styles.orderFooter}>
                    <View style={styles.orderType}>
                      <View style={styles.orderTypeIcon}>
                        <Ionicons
                          name={
                            order.orderType === "pickup"
                              ? "walk"
                              : "car-outline"
                          }
                          size={16}
                          color="#8B5CF6"
                        />
                      </View>
                      <Text style={styles.orderTypeText}>
                        {order.orderType === "pickup" ? "Pickup" : "Delivery"}
                      </Text>
                    </View>
                    <View style={styles.orderPriceContainer}>
                      <Text style={styles.orderPrice}>
                        {formatCurrency(order.totalAmount)}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#D1D5DB"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modern Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalDragHandle} />
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedOrder && (
                <>
                  {/* Order Info Header */}
                  <View style={styles.modalOrderHeader}>
                    <View style={styles.modalOrderNumberContainer}>
                      <Text style={styles.modalOrderNumber}>
                        {selectedOrder.orderNumber}
                      </Text>
                      <Text style={styles.modalOrderDate}>
                        {formatDate(selectedOrder.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.modalStatusBadge,
                        {
                          backgroundColor: getStatusStyle(selectedOrder.status)
                            .bg,
                        },
                      ]}
                    >
                      <View style={styles.statusDot} />
                      <Text
                        style={[
                          styles.modalStatusText,
                          { color: getStatusStyle(selectedOrder.status).text },
                        ]}
                      >
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  {/* Order Items */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    <View style={styles.itemsList}>
                      {selectedOrder.orderItems &&
                      selectedOrder.orderItems.length > 0 ? (
                        selectedOrder.orderItems.map((item, index) => (
                          <View key={index} style={styles.modalItem}>
                            <View style={styles.modalItemLeft}>
                              <View style={styles.modalItemIcon}>
                                <Text style={styles.modalItemEmoji}>
                                  {item.product?.image || "🍽️"}
                                </Text>
                              </View>
                              <View style={styles.modalItemInfo}>
                                <Text style={styles.modalItemName}>
                                  {item.product?.name || "Item"}
                                </Text>
                                <Text style={styles.modalItemQuantity}>
                                  Qty: {item.quantity} ×{" "}
                                  {formatCurrency(item.unitPrice)}
                                </Text>
                                {item.specialRequests && (
                                  <View style={styles.specialRequestTag}>
                                    <Ionicons
                                      name="chatbox-ellipses-outline"
                                      size={12}
                                      color="#F59E0B"
                                    />
                                    <Text
                                      style={styles.specialRequestText}
                                      numberOfLines={1}
                                    >
                                      {item.specialRequests}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <Text style={styles.modalItemPrice}>
                              {formatCurrency(item.totalPrice)}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noItemsText}>
                          No items available
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Special Instructions */}
                  {selectedOrder.specialInstructions && (
                    <View style={styles.instructionsCard}>
                      <View style={styles.instructionsHeader}>
                        <Ionicons
                          name="information-circle"
                          size={20}
                          color="#F59E0B"
                        />
                        <Text style={styles.instructionsTitle}>
                          Special Instructions
                        </Text>
                      </View>
                      <Text style={styles.instructionsText}>
                        {selectedOrder.specialInstructions}
                      </Text>
                    </View>
                  )}

                  {/* Order Details */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailCard}>
                        <Ionicons
                          name={
                            selectedOrder.orderType === "pickup"
                              ? "bag-handle-outline"
                              : "bicycle-outline"
                          }
                          size={24}
                          color="#8B5CF6"
                        />
                        <Text style={styles.detailLabel}>Type</Text>
                        <Text style={styles.detailValue}>
                          {selectedOrder.orderType === "pickup"
                            ? "Pickup"
                            : "Delivery"}
                        </Text>
                      </View>
                      <View style={styles.detailCard}>
                        <Ionicons
                          name="card-outline"
                          size={24}
                          color="#8B5CF6"
                        />
                        <Text style={styles.detailLabel}>Payment</Text>
                        <Text style={styles.detailValue}>
                          {selectedOrder.paymentMethod?.toUpperCase() || "N/A"}
                        </Text>
                      </View>
                      <View style={styles.detailCard}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={24}
                          color="#8B5CF6"
                        />
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            {
                              color:
                                selectedOrder.paymentStatus === "paid"
                                  ? "#10B981"
                                  : "#EF4444",
                            },
                          ]}
                        >
                          {selectedOrder.paymentStatus?.toUpperCase() ||
                            "PENDING"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Pickup Code */}
                  {selectedOrder.pickupCode &&
                    selectedOrder.status === "ready" && (
                      <View style={styles.pickupCodeCard}>
                        <LinearGradient
                          colors={["#8B5CF6", "#7C3AED"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.pickupCodeGradient}
                        >
                          <Ionicons
                            name="qr-code-outline"
                            size={32}
                            color="white"
                          />
                          <Text style={styles.pickupCodeLabel}>
                            Pickup Code
                          </Text>
                          <View style={styles.pickupCodeDisplay}>
                            <Text style={styles.pickupCodeText}>
                              {selectedOrder.pickupCode}
                            </Text>
                          </View>
                          <Text style={styles.pickupCodeHint}>
                            Show this code at the counter
                          </Text>
                        </LinearGradient>
                      </View>
                    )}

                  {/* Total */}
                  <View style={styles.totalCard}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalAmount}>
                        {formatCurrency(selectedOrder.totalAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {(selectedOrder.status === "preparing" ||
                    selectedOrder.status === "ready") && (
                    <TouchableOpacity style={styles.trackButton}>
                      <LinearGradient
                        colors={["#8B5CF6", "#7C3AED"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.trackButtonGradient}
                      >
                        <Ionicons
                          name="location-outline"
                          size={24}
                          color="white"
                        />
                        <Text style={styles.trackButtonText}>Track Order</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 56,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconContainer: {
    position: "relative",
  },
  headerIconGlow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  orderCountBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  orderCountText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Empty State
  emptyStateContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#DDD6FE",
    opacity: 0.3,
    top: 20,
  },
  emptyStateContent: {
    alignItems: "center",
    zIndex: 1,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  // Order Card
  orderCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusStrip: {
    height: 4,
  },
  orderCardContent: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 6,
    fontWeight: "500",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  itemsPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  itemImage: {
    fontSize: 32,
  },
  itemCountBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#8B5CF6",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  itemCountBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderType: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  orderPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#8B5CF6",
    marginRight: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "92%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  modalHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
    position: "relative",
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },
  modalCloseButton: {
    position: "absolute",
    right: 20,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  modalOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOrderNumberContainer: {
    flex: 1,
  },
  modalOrderNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  modalOrderDate: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  modalStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "currentColor",
    marginRight: 6,
  },
  modalStatusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  itemsList: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 4,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  modalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalItemIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalItemEmoji: {
    fontSize: 28,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  modalItemQuantity: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  specialRequestTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  specialRequestText: {
    fontSize: 11,
    color: "#D97706",
    marginLeft: 4,
    fontWeight: "600",
  },
  modalItemPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#8B5CF6",
    marginLeft: 12,
  },
  noItemsText: {
    textAlign: "center",
    color: "#9CA3AF",
    padding: 24,
    fontSize: 14,
  },

  // Instructions Card
  instructionsCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
  },

  // Details Grid
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  // Pickup Code Card
  pickupCodeCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pickupCodeGradient: {
    padding: 24,
    alignItems: "center",
  },
  pickupCodeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 12,
    marginBottom: 16,
  },
  pickupCodeDisplay: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  pickupCodeText: {
    fontSize: 40,
    fontWeight: "800",
    color: "white",
    letterSpacing: 8,
  },
  pickupCodeHint: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  // Total Card
  totalCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#8B5CF6",
  },

  // Track Button
  trackButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  trackButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  trackButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "white",
    marginLeft: 10,
  },
});

export default UserOrdersScreen;
