// screens/ChatBotScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "👋 Hi Sarah! I'm your campus food assistant. I can help you find meals, check nutrition info, and answer any questions!",
      fromBot: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  // Predefined responses for realistic chat experience
  const botResponses = {
    greeting: [
      "Hello! How can I help you with your food choices today? 😊",
      "Hi there! Looking for something delicious? I'm here to help! 🍽️",
    ],
    healthy: [
      "🥗 Perfect! Based on your preferences, I recommend:\n\n• Grilled Chicken Salad (35g protein)\n• Quinoa Power Bowl (28g protein)\n• Greek Yogurt Parfait (20g protein)\n\nWould you like to see full nutritional details? 📊",
    ],
    protein: [
      "🥗 Perfect! Based on your preferences, I recommend:\n\n• Grilled Chicken Salad (35g protein)\n• Quinoa Power Bowl (28g protein)\n• Greek Yogurt Parfait (20g protein)\n\nWould you like to see full nutritional details? 📊",
    ],
    nutrition: [
      "🍲 Quinoa Power Bowl Details:\n\n📊 Nutrition per serving:\n• Calories: 420 kcal\n• Protein: 28g\n• Carbs: 45g\n• Fat: 12g\n• Fiber: 8g\n\n🥕 Ingredients: Quinoa, black beans, roasted vegetables, avocado, tahini dressing\n\n💰 Price: $7.99\n\nShall I add this to your cart?",
    ],
    default: [
      "I'd be happy to help you with that! Can you tell me more about what you're looking for? 🤔",
      "That's interesting! Let me help you find the perfect meal for your needs! 🍽️",
      "Great question! I can help you explore our menu options. What are you in the mood for? 😋",
    ],
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (
      input.includes("hello") ||
      input.includes("hi") ||
      input.includes("hey")
    ) {
      return botResponses.greeting[
        Math.floor(Math.random() * botResponses.greeting.length)
      ];
    } else if (input.includes("healthy") || input.includes("protein")) {
      return botResponses.protein[0];
    } else if (
      input.includes("nutrition") ||
      input.includes("details") ||
      input.includes("quinoa")
    ) {
      return botResponses.nutrition[0];
    } else {
      return botResponses.default[
        Math.floor(Math.random() * botResponses.default.length)
      ];
    }
  };

  const sendMessage = () => {
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
    setInput("");
    setIsTyping(true);

    // Start typing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate bot response with realistic delay
    setTimeout(() => {
      setIsTyping(false);
      typingAnim.stopAnimation();

      const botResponse = {
        id: Date.now().toString() + "_bot",
        text: generateBotResponse(userMessage.text),
        fromBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 2000);
  };

  useEffect(() => {
    // Auto scroll to bottom when new message is added
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.message, styles.botMessage, styles.typingIndicator]}>
        <View style={styles.typingDots}>
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.typingDot,
              {
                opacity: typingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.typingText}>AI Assistant is typing...</Text>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          setInput("I want something healthy with high protein");
          setTimeout(() => sendMessage(), 100);
        }}
      >
        <Text style={styles.quickActionText}>🥗 Healthy Options</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          setInput("Show me today's specials");
          setTimeout(() => sendMessage(), 100);
        }}
      >
        <Text style={styles.quickActionText}>⭐ Today's Specials</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          setInput("What's the nutritional info?");
          setTimeout(() => sendMessage(), 100);
        }}
      >
        <Text style={styles.quickActionText}>📊 Nutrition Info</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.messageWrapper}>
              <View
                style={[
                  styles.message,
                  item.fromBot ? styles.botMessage : styles.userMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.fromBot
                      ? styles.botMessageText
                      : styles.userMessageText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                style={[
                  styles.timestamp,
                  item.fromBot ? styles.botTimestamp : styles.userTimestamp,
                ]}
              >
                {item.timestamp}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
        {renderTypingIndicator()}
      </View>

      {/* Quick Actions */}
      {messages.length <= 1 && renderQuickActions()}

      {/* Input Area */}
      <KeyboardAvoidingView
        style={styles.inputContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about food..."
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              input.trim() ? styles.sendButtonActive : {},
            ]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <LinearGradient
              colors={input.trim() ? ["#667eea", "#764ba2"] : ["#ccc", "#ccc"]}
              style={styles.sendButtonGradient}
            >
              <Ionicons name="send" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatBotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  botAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  botAvatarText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  headerAction: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageList: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  message: {
    padding: 16,
    borderRadius: 20,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botMessage: {
    backgroundColor: "#667eea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 8,
    marginRight: 50,
  },
  userMessage: {
    backgroundColor: "#e3f2fd",
    alignSelf: "flex-end",
    borderBottomRightRadius: 8,
    marginLeft: 50,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageText: {
    color: "white",
  },
  userMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    marginHorizontal: 8,
  },
  botTimestamp: {
    alignSelf: "flex-start",
  },
  userTimestamp: {
    alignSelf: "flex-end",
  },
  typingIndicator: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginRight: 4,
  },
  typingText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quickActionButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    paddingVertical: 12,
    paddingRight: 10,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    // Additional styles for active state if needed
  },
});
