'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, CartItem, Order } from '@/lib/types';

export type UserType = 'buyer' | 'seller';

interface User {
  name: string;
  email: string;
  type: UserType;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: () => Order | null;
  orders: Order[];
  getOrdersForUser: (user: User) => Order[];
  cartCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getFromStorage<User | null>('user', null));
    setCart(getFromStorage<CartItem[]>('cart', []));
    setOrders(getFromStorage<Order[]>('orders', []));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setToStorage('user', user);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setToStorage('cart', cart);
    }
  }, [cart, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      setToStorage('orders', orders);
    }
  }, [orders, isLoading]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };
  
  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = (): Order | null => {
    if (!user || cart.length === 0) {
      return null;
    }

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const newOrder: Order = {
      id: `#${Math.floor(Math.random() * 1000) + 3300}`,
      user: user.name,
      date: new Date().toISOString().split('T')[0],
      total,
      status: 'En attente',
      payment: 'En attente',
      items: cart,
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    return newOrder;
  };
  
  const getOrdersForUser = (currentUser: User): Order[] => {
      if(currentUser.type === 'seller') {
          return orders;
      }
      return orders.filter(order => order.user === currentUser.name);
  }

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, placeOrder, orders, getOrdersForUser, cartCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
