// hooks/useCart.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CART_STORAGE_KEY = "@cart_items";

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOAD_CART: "LOAD_CART",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CART_ACTIONS.LOAD_CART:
      return { ...state, items: action.payload, loading: false };

    case CART_ACTIONS.ADD_ITEM:
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === newItem.id && item.selectedSize === newItem.selectedSize
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        updatedItems[existingItemIndex].totalPrice =
          updatedItems[existingItemIndex].price *
          updatedItems[existingItemIndex].quantity;
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, newItem] };
      }

    case CART_ACTIONS.UPDATE_QUANTITY:
      const { itemId, selectedSize, quantity } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId && item.selectedSize === selectedSize
            ? { ...item, quantity, totalPrice: item.price * quantity }
            : item
        ),
      };

    case CART_ACTIONS.REMOVE_ITEM:
      const { itemId: removeId, selectedSize: removeSize } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.id === removeId && item.selectedSize === removeSize)
        ),
      };

    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [] };

    default:
      return state;
  }
};

// Initial State
const initialState = {
  items: [],
  loading: true,
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever items change
  useEffect(() => {
    if (!state.loading) {
      saveCartToStorage(state.items);
    }
  }, [state.items, state.loading]);

  // Load cart from AsyncStorage
  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const items = savedCart ? JSON.parse(savedCart) : [];
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: items });
    } catch (error) {
      console.error("Error loading cart:", error);
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: [] });
    }
  };

  // Save cart to AsyncStorage
  const saveCartToStorage = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Cart Actions
  const addItem = (item) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item });
  };

  const updateQuantity = (itemId, selectedSize, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId, selectedSize);
      return;
    }
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, selectedSize, quantity },
    });
  };

  const removeItem = (itemId, selectedSize) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemId, selectedSize },
    });
  };

  const clearCart = async () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart storage:", error);
    }
  };

  // Cart Calculations
  const getSubtotal = () => {
    return state.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.15;
  };

  const getDeliveryFee = () => {
    return getSubtotal() > 200 ? 0 : 35;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getDeliveryFee();
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    // State
    items: state.items,
    loading: state.loading,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,

    // Calculations
    getSubtotal,
    getTax,
    getDeliveryFee,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom Hook to use Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Utility functions for non-hook usage
export const getStoredCartItems = async () => {
  try {
    const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error getting stored cart items:", error);
    return [];
  }
};

export const getStoredCartCount = async () => {
  try {
    const items = await getStoredCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting stored cart count:", error);
    return 0;
  }
};
