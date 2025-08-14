import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import {
  GradientCard,
  GlassMorphCard,
  MinimalCard,
  NeumorphCard,
  SummaryCard,
} from "./Cards";

export const CardScreen = () => {
  // Items state
  const [items, setItems] = useState([
    { id: 1, name: "Margherita Pizza", price: 8.99, quantity: 2 },
    { id: 2, name: "Classic Burger", price: 6.99, quantity: 1 },
  ]);

  // Handle quantity changes
  const handleQuantityChange = (id, newQuantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity < 0 ? 0 : newQuantity }
          : item
      )
    );
  };

  // Calculate total and total items
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
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

      {items.map((item) => (
        <MinimalCard
          key={item.id}
          item={item}
          onQuantityChange={handleQuantityChange}
        />
      ))}

      <NeumorphCard
        title="Total Calories"
        value="1,250 kcal"
        icon="flame"
        color="#ff6b6b"
      />

      <SummaryCard total={total} items={totalItems} />
    </ScrollView>
  );
};

export default CardScreen;
