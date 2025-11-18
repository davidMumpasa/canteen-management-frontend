// ./components/SearchBar.js
import React from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ searchText, setSearchText, animations }) => {
  const { fadeAnim, slideAnim } = animations;

  return (
    <Animated.View
      className="mx-5 mb-6"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center bg-white rounded-2xl px-5 h-14">
        <Ionicons
          name="search"
          size={20}
          color="#667eea"
          style={{ marginRight: 15 }}
        />
        <TextInput
          className="flex-1 text-base text-gray-800"
          placeholder="Search delicious food..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity className="p-1">
          <Ionicons name="options" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SearchBar;
