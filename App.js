import "react-native-gesture-handler";
import "./global.css";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import Screens
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CartScreen from "./src/screens/CartScreen";
import OrderScreen from "./src/screens/OrderScreen";
import ChatBotScreen from "./src/screens/ChatBotScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import AdminDashboard from "./src/screens/AdminDashboard";
import ProfileScreen from "./src/screens/ProfileScreen";
import CustomBottomNav from "./src/screens/CustomBottomNav";
import ItemDetailScreen from "./src/screens/ItemDetailScreen";
import { CartProvider } from "./src/hooks/useCart";
import PayPalPayment from "./src/screens/PayPalPayment";
import NotificationScreen from "./src/screens/NotificationScreen";
import UserOrdersScreen from "./src/screens/UserOrdersScreen";

// Import Delivery Driver Screens
import DeliveryDriverHomeScreen from "./src/screens/Delivery/DeliveryDriverHomeScreen";
import ActiveDeliveriesScreen from "./src/screens/Delivery/ActiveDeliveriesScreen";
import DriverProfileScreen from "./src/screens/Delivery/DriverProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==================== HOME STACK ====================
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ItemDetails" component={ItemDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Chatbot" component={ChatBotScreen} />
    </Stack.Navigator>
  );
}

// ==================== CART STACK ====================
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Paypal" component={PayPalPayment} />
    </Stack.Navigator>
  );
}

// ==================== ORDERS STACK ====================
function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrdersMain" component={OrderScreen} />
      <Stack.Screen name="MyOrders" component={UserOrdersScreen} />
    </Stack.Navigator>
  );
}

// ==================== PROFILE STACK ====================
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MyOrders" component={UserOrdersScreen} />
      <Stack.Screen name="adminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}

// ==================== DELIVERY DRIVER BOTTOM TABS ====================
function DeliveryDriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "ReadyOrders")
            iconName = focused ? "cube" : "cube-outline";
          else if (route.name === "ActiveOrders")
            iconName = focused ? "car" : "car-outline";
          else if (route.name === "DriverProfile")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF6B00",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="ReadyOrders"
        component={DeliveryDriverHomeScreen}
        options={{ title: "Ready" }}
      />
      <Tab.Screen
        name="ActiveOrders"
        component={ActiveDeliveriesScreen}
        options={{ title: "Active" }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

// ==================== MAIN BOTTOM TAB (Regular Users) ====================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
      tabBar={(props) => <CustomBottomNav {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          title: "Home",
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: "Cart",
          title: "Cart",
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: "Orders",
          title: "Orders",
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profile",
          title: "Profile",
          unmountOnBlur: false,
        }}
      />
    </Tab.Navigator>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: "default",
              presentation: "card",
            }}
          >
            {/* ==================== AUTH SCREENS ==================== */}
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{
                animationTypeForReplace: "push",
              }}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />

            {/* ==================== MAIN APP (Regular Users) ==================== */}
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{
                gestureEnabled: false,
              }}
            />

            {/* ==================== DELIVERY DRIVER APP ==================== */}
            <Stack.Screen
              name="DeliveryDriver"
              component={DeliveryDriverTabs}
              options={{
                gestureEnabled: false,
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}

// ==================== LOGIN NAVIGATION FIX ====================
// In your LoginScreen.js (or wherever you have goToHome function):

const goToHome = () => {
  bottomSheetRef.current?.close();

  // Route based on role
  AsyncStorage.getItem("userRole").then((role) => {
    if (role === "driver") {
      // Navigate to Delivery Driver app
      navigation.reset({
        index: 0,
        routes: [{ name: "DeliveryDriver" }],
      });
    } else {
      // Navigate to regular user app
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    }
  });
};

// ==================== NAVIGATION STRUCTURE SUMMARY ====================
/*
Root Stack Navigator:
├── Splash
├── Login
├── Register
├── ForgotPassword
├── Main (Bottom Tabs for Regular Users)
│   ├── Home
│   ├── Cart
│   ├── Orders
│   └── Profile
└── DeliveryDriver (Bottom Tabs for Drivers)
    ├── ReadyOrders (Orange theme)
    ├── ActiveOrders (Blue theme)
    └── DriverProfile (Purple theme)

Navigation Flow:
1. Login → Check role from AsyncStorage
2. If role === "driver" → Navigate to DeliveryDriver
3. If role !== "driver" → Navigate to Main
4. Both are top-level routes in the Stack Navigator
*/
