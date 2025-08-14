import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Modern Gradient Card with Shadow
export const GradientCard = ({ title, subtitle, price, onPress }) => (
  <TouchableOpacity
    style={styles.gradientCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.gradientOverlay} />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.gradientTitle}>{title}</Text>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${price}</Text>
        </View>
      </View>
      <Text style={styles.gradientSubtitle}>{subtitle}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

// Elegant Glass Morphism Card
export const GlassMorphCard = ({ title, description, image, price }) => (
  <View style={styles.glassCard}>
    <View style={styles.glassOverlay} />
    <View style={styles.glassContent}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="restaurant" size={32} color="#667eea" />
        </View>
      </View>
      <View style={styles.glassTextContent}>
        <Text style={styles.glassTitle}>{title}</Text>
        <Text style={styles.glassDescription}>{description}</Text>
        <View style={styles.glassPriceRow}>
          <Text style={styles.glassPrice}>${price}</Text>
          <TouchableOpacity style={styles.glassButton}>
            <Text style={styles.glassButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// Minimal Floating Card
export const MinimalCard = ({ item, onQuantityChange }) => (
  <View style={styles.minimalCard}>
    <View style={styles.minimalContent}>
      <View style={styles.minimalLeft}>
        <View style={styles.minimalIcon}>
          <Ionicons name="fast-food" size={24} color="#667eea" />
        </View>
        <View style={styles.minimalInfo}>
          <Text style={styles.minimalTitle}>{item.name}</Text>
          <Text style={styles.minimalSubtitle}>${item.price} each</Text>
        </View>
      </View>
      <View style={styles.minimalRight}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#667eea" />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// Neumorphism Card
export const NeumorphCard = ({ title, value, icon, color = "#667eea" }) => (
  <View style={[styles.neumorphCard, { borderColor: color + "20" }]}>
    <View style={[styles.neumorphIcon, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.neumorphContent}>
      <Text style={styles.neumorphTitle}>{title}</Text>
      <Text style={[styles.neumorphValue, { color }]}>{value}</Text>
    </View>
  </View>
);

// Premium Summary Card
export const SummaryCard = ({ total, items }) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <Text style={styles.summaryTitle}>Order Summary</Text>
      <View style={styles.summaryBadge}>
        <Text style={styles.summaryBadgeText}>{items} items</Text>
      </View>
    </View>

    <View style={styles.summaryDivider} />

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Subtotal</Text>
      <Text style={styles.summaryAmount}>${total.toFixed(2)}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Delivery Fee</Text>
      <Text style={styles.summaryAmount}>$2.99</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tax</Text>
      <Text style={styles.summaryAmount}>${(total * 0.08).toFixed(2)}</Text>
    </View>

    <View style={styles.summaryDivider} />

    <View style={styles.summaryTotal}>
      <Text style={styles.summaryTotalLabel}>Total</Text>
      <Text style={styles.summaryTotalAmount}>
        ${(total + 2.99 + total * 0.08).toFixed(2)}
      </Text>
    </View>

    <TouchableOpacity style={styles.checkoutButton}>
      <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      <Ionicons name="arrow-forward" size={20} color="white" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  // Gradient Card Styles
  gradientCard: {
    height: 180,
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#667eea",
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gradientTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  priceTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
  },
  priceText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  gradientSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "600",
  },
  addToCartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Glass Morphism Card Styles
  glassCard: {
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245,246,250,0.95)",
  },
  glassContent: {
    flexDirection: "row",
    padding: 20,
  },
  imageContainer: {
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "rgba(102,126,234,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  glassTextContent: {
    flex: 1,
  },
  glassTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  glassDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  glassPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  glassPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  glassButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  glassButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Minimal Card Styles
  minimalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  minimalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  minimalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  minimalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(102,126,234,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  minimalInfo: {
    flex: 1,
  },
  minimalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  minimalSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  minimalRight: {
    marginLeft: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  quantityBtn: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    margin: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    color: "#333",
  },

  // Neumorphism Card Styles
  neumorphCard: {
    backgroundColor: "#f5f6fa",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.1)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  neumorphIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  neumorphContent: {
    flex: 1,
  },
  neumorphTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  neumorphValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginVertical: 16,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  summaryBadge: {
    backgroundColor: "#667eea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  summaryBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#f5f6fa",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  summaryTotalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#667eea",
  },
  checkoutButton: {
    backgroundColor: "#667eea",
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
});

// Usage Examples:
export const CardScreen = () => (
  <View style={{ flex: 1, backgroundColor: "#f5f6fa", paddingTop: 20 }}>
    <GradientCard
      title="Delicious Pizza"
      subtitle="Fresh mozzarella, tomato sauce, basil"
      price="12.99"
      onPress={() => console.log("Card pressed")}
    />

    <GlassMorphCard
      title="Classic Burger"
      description="Juicy beef patty with fresh vegetables"
      price="8.99"
    />

    <MinimalCard
      item={{ id: 1, name: "Margherita Pizza", price: 8.99, quantity: 2 }}
      onQuantityChange={(id, quantity) => console.log(id, quantity)}
    />

    <NeumorphCard
      title="Total Calories"
      value="1,250 kcal"
      icon="flame"
      color="#ff6b6b"
    />

    <SummaryCard total={24.97} items={3} />
  </View>
);
export default CardScreen;
