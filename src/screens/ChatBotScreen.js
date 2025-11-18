// screens/ChatBotScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useNavigation } from "@react-navigation/native";
import AppService from "../services/AppService";
const { width } = Dimensions.get("window");

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "👋 Hi! I'm your campus food assistant. I can help you find meals, check nutrition info, and answer any questions about our delicious offerings!",
      fromBot: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef(null);
  const typingAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadChatHistory();
    // Header animation on mount
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Get auth token from AsyncStorage with better error handling
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Authentication Required",
          "Please log in to use the AI assistant.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  // Load chat history from API
  const loadChatHistory = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      setIsLoadingHistory(true);
      const response = await axios.get(`${BASE_URL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          limit: 50,
          offset: 0,
        },
      });

      if (response.data.success && response.data.interactions.length > 0) {
        const historyMessages = [];

        // Convert API response to message format (reverse to show oldest first)
        response.data.interactions.reverse().forEach((interaction) => {
          // Add user message
          historyMessages.push({
            id: `${interaction.id}_user`,
            text: interaction.query,
            fromBot: false,
            timestamp: new Date(interaction.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });

          // Add bot response
          historyMessages.push({
            id: `${interaction.id}_bot`,
            text: interaction.response,
            fromBot: true,
            timestamp: new Date(interaction.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        });

        // Keep the welcome message and add history
        setMessages((prev) => [prev[0], ...historyMessages]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(["token", "user"]);
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all your chat history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getAuthToken();
              if (!token) return;

              const response = await axios.delete(`${BASE_URL}/chat/history`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (response.data.success) {
                // Reset messages to just the welcome message
                setMessages([
                  {
                    id: "1",
                    text: "👋 Hi! I'm your campus food assistant. I can help you find meals, check nutrition info, and answer any questions about our delicious offerings!",
                    fromBot: true,
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);

                Alert.alert("Success", "Chat history cleared successfully!");
              }
            } catch (error) {
              console.error("Error clearing chat history:", error);
              Alert.alert(
                "Error",
                "Failed to clear chat history. Please try again."
              );
            }
            setShowMenu(false);
          },
        },
      ]
    );
  };

  // Toggle menu animation
  const toggleMenu = () => {
    const toValue = showMenu ? 0 : 1;
    setShowMenu(!showMenu);

    Animated.spring(menuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Enhanced API call with better error handling
  const sendMessageToAPI = async (message, conversationHistory) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return "Please log in to continue using the AI assistant. 🔐";
      }

      setIsConnected(true);
      const response = await axios.post(
        `${BASE_URL}/chat/message`,
        {
          message,
          conversationHistory: conversationHistory.slice(-8),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return response.data.response;
    } catch (error) {
      console.error("API Error:", error);
      setIsConnected(false);

      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(["authToken", "user"]);
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
        return "Your session has expired. Please log in again to continue. 🔐";
      } else if (error.response?.status === 429) {
        return "I'm getting too many messages right now! 😅 Please wait a moment before sending another message.";
      } else if (error.response?.status === 503) {
        return "I'm temporarily taking a coffee break ☕ Please try again in a few minutes!";
      } else if (error.code === "ECONNABORTED") {
        return "Hmm, that's taking longer than expected ⏰ Try asking a shorter question!";
      } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        return "I can't connect to my brain right now 🧠💭 Please check your internet connection and try again!";
      } else {
        return "Oops! Something went wrong on my end 🛠️ Please try again, and if the problem continues, let the support team know!";
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      fromBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsTyping(true);

    // Start typing animation
    const typingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    typingAnimation.start();

    // Get AI response from backend
    const aiResponse = await sendMessageToAPI(messageText, messages);

    setIsTyping(false);
    typingAnimation.stop();
    typingAnim.setValue(0);

    if (aiResponse) {
      const botMessage = {
        id: Date.now().toString() + "_bot",
        text: aiResponse,
        fromBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <Animated.View
        className="flex-row items-end mb-4 px-4"
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View className="bg-white rounded-3xl rounded-bl-lg px-5 py-4 shadow-lg border border-gray-100 max-w-[75%]">
          <View className="flex-row items-center space-x-2">
            <Animated.View
              className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
              style={{
                opacity: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: typingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              }}
            />
            <Animated.View
              className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
              style={{
                opacity: typingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
                transform: [
                  {
                    scale: typingAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    }),
                  },
                ],
              }}
            />
            <Animated.View
              className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
              style={{
                opacity: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
                transform: [
                  {
                    scale: typingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.2, 0.8],
                    }),
                  },
                ],
              }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-2 font-medium">
            AI Assistant is thinking...
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderQuickActions = () => (
    <View className="px-4 pb-6">
      <Text className="text-gray-600 text-sm font-semibold mb-3 ml-1">
        Try asking me about:
      </Text>
      <View className="flex-row flex-wrap gap-3">
        <TouchableOpacity
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl px-5 py-3 shadow-sm active:scale-95"
          style={{
            shadowColor: "#10b981",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => {
            setInput("I want something healthy with high protein");
          }}
        >
          <Text className="text-emerald-700 text-sm font-semibold">
            🥗 Healthy Options
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl px-5 py-3 shadow-sm active:scale-95"
          style={{
            shadowColor: "#f59e0b",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => {
            setInput("Show me today's specials");
          }}
        >
          <Text className="text-amber-700 text-sm font-semibold">
            ⭐ Today's Specials
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gradient-to-r from-green-50 to-lime-50 border-2 border-green-200 rounded-2xl px-5 py-3 shadow-sm active:scale-95"
          style={{
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => {
            setInput("What are some vegetarian options?");
          }}
        >
          <Text className="text-green-700 text-sm font-semibold">
            🌱 Vegetarian
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-5 py-3 shadow-sm active:scale-95"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => {
            setInput("Show me nutritional information");
          }}
        >
          <Text className="text-blue-700 text-sm font-semibold">
            📊 Nutrition Info
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMessage = ({ item, index }) => (
    <Animated.View
      className="px-4 mb-4"
      style={{
        opacity: headerAnim,
        transform: [
          {
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <View
        className={`flex-row ${item.fromBot ? "justify-start" : "justify-end"}`}
      >
        <View
          className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-lg ${
            item.fromBot
              ? "bg-white rounded-bl-lg border border-gray-100"
              : "rounded-br-lg overflow-hidden"
          }`}
          style={
            item.fromBot
              ? {
                  shadowColor: "#6b7280",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }
              : {
                  shadowColor: "#4f46e5",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 4,
                }
          }
        >
          {!item.fromBot && (
            <LinearGradient
              colors={["#667eea", "#764ba2", "#667eea"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="absolute inset-0 rounded-3xl rounded-br-lg"
            />
          )}
          <Text
            className={`text-base leading-6 ${
              item.fromBot ? "text-gray-800" : "text-white"
            }`}
            style={{
              zIndex: 1,
              fontWeight: item.fromBot ? "400" : "500",
            }}
          >
            {item.text}
          </Text>
        </View>
      </View>
      <Text
        className={`text-xs text-gray-400 mt-2 font-medium ${
          item.fromBot ? "text-left ml-1" : "text-right mr-1"
        }`}
      >
        {item.timestamp}
      </Text>
    </Animated.View>
  );

  const renderDropdownMenu = () => {
    if (!showMenu) return null;

    return (
      <Animated.View
        className="absolute bg-white rounded-xl shadow-lg border border-gray-200 z-50"
        style={{
          top: 80, // Moved down to account for proper header spacing
          right: 16,
          opacity: menuAnim,
          transform: [
            {
              scale: menuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: menuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
          ],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
          onPress={() => {
            loadChatHistory();
            setShowMenu(false);
          }}
        >
          <Ionicons name="refresh" size={20} color="#6b7280" />
          <Text className="ml-3 text-gray-800 font-medium">
            Refresh History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-4 py-3 active:bg-red-50"
          onPress={clearChatHistory}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
          <Text className="ml-3 text-red-600 font-medium">Clear History</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />

      {/* Enhanced Header with proper spacing */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#667eea"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : 30, // Better top padding for status bar
          paddingBottom: 20,
          shadowColor: "#4f46e5",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <Animated.View
          className="flex-row items-center justify-between px-4"
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <View className="flex-row items-center flex-1">
            {/* Back Button */}
            <TouchableOpacity
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4 active:bg-white/30"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            {/* Avatar/Icon */}
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4 border-2 border-white/30">
              <Text className="text-2xl">🤖</Text>
            </View>

            {/* Title and Status */}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                AI Food Assistant
              </Text>

              {/* Status Indicator */}
              <View className="flex-row items-center mt-1">
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                  style={{
                    shadowColor: isConnected ? "#22c55e" : "#ef4444",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.5,
                    shadowRadius: 2,
                  }}
                />
                <Text className="text-white/90 text-sm font-medium">
                  {isLoadingHistory
                    ? "Loading history..."
                    : isConnected
                    ? "Ready to help"
                    : "Connection issues"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center active:bg-white/30"
            onPress={toggleMenu}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Dropdown Menu */}
      {renderDropdownMenu()}

      {/* Messages Container */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="flex-1">
          {isLoadingHistory && (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#667eea" />
              <Text className="text-gray-600 mt-2">
                Loading chat history...
              </Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
          />
          {renderTypingIndicator()}
        </View>

        {/* Quick Actions */}
        {messages.length <= 1 && !isLoadingHistory && renderQuickActions()}

        {/* Enhanced Input Area */}
        <View
          className="bg-white border-t border-gray-200"
          style={{
            marginBottom: 80,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <View className="flex-row items-end px-4 py-4">
            <View className="flex-1 bg-gray-100 rounded-3xl px-5 py-3 mr-3 border border-gray-200">
              <TextInput
                className="text-base text-gray-800 min-h-[24px] max-h-[100px]"
                placeholder="Ask me anything about food..."
                placeholderTextColor="#9ca3af"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
                textAlignVertical="center"
              />
            </View>

            <TouchableOpacity
              className="w-12 h-12 rounded-full overflow-hidden active:scale-95"
              onPress={sendMessage}
              disabled={!input.trim() || isTyping}
              style={{
                shadowColor: input.trim() ? "#4f46e5" : "#9ca3af",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: input.trim() ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: input.trim() ? 4 : 2,
              }}
            >
              <LinearGradient
                colors={
                  input.trim() ? ["#667eea", "#764ba2"] : ["#d1d5db", "#9ca3af"]
                }
                className="w-full h-full items-center justify-center"
              >
                <Ionicons
                  name={isTyping ? "hourglass" : "send"}
                  size={22}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Overlay to close menu when tapping outside */}
      {showMenu && (
        <TouchableOpacity
          className="absolute inset-0"
          style={{ backgroundColor: "transparent" }}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

export default ChatBotScreen;
