import "react-native-gesture-handler";
import "./global.css";
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
import OrdersScreen from "./src/screens/OrdersScreen";
import OrderScreen from "./src/screens/OrderScreen";
import ChatBotScreen from "./src/screens/ChatBotScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import AdminDashboard from "./src/screens/AdminDashboard";
import ProfileScreen from "./src/screens/ProfileScreen";
import CustomBottomNav from "./src/screens/CustomBottomNav";
import ItemDetailScreen from "./src/screens/ItemDetailScreen";
import { CartProvider } from "./src/hooks/useCart";
import PayPalPayment from "./src/screens/PayPalPayment";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main bottom tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <CartProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash" // Changed from "Login" to "Splash"
            screenOptions={{ headerShown: false }}
          >
            {/* Splash Screen - First screen */}
            <Stack.Screen name="Splash" component={SplashScreen} />

            {/* Auth screens */}
            <Stack.Screen name="Paypal" component={PayPalPayment} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />

            {/* Main app with bottom nav */}
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ItemDetails" component={ItemDetailScreen} />

            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="adminDashboard" component={AdminDashboard} />
            <Stack.Screen name="Chatbot" component={ChatBotScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </CartProvider>
  );
}
