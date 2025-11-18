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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a Stack Navigator for each tab that needs additional screens
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

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Paypal" component={PayPalPayment} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="OrdersMain"
    >
      <Stack.Screen
        name="OrdersMain"
        component={OrderScreen}
        options={{
          // Reset to this screen when tab is pressed
          tabBarOnPress: ({ navigation, defaultHandler }) => {
            defaultHandler();
          },
        }}
      />
      <Stack.Screen name="MyOrders" component={UserOrdersScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MyOrders" component={UserOrdersScreen} />
      <Stack.Screen name="adminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}

// Main bottom tab navigator with nested stacks
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomNav {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          title: "Home",
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: "Cart",
          title: "Cart",
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: "Orders",
          title: "Orders",
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to the first screen in OrdersStack when tab is pressed
            navigation.navigate("Orders", { screen: "OrdersMain" });
          },
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profile",
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

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
            {/* Auth screens - NO BOTTOM NAV */}
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

            {/* Main app with bottom nav - BOTTOM NAV EVERYWHERE */}
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{
                gestureEnabled: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
