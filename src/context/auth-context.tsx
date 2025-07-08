'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, Product, CartItem, Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (name: string, email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  placeOrder: () => Promise<Order | null>;
  cartCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setIsLoading(true);
      if (userAuth) {
        setFirebaseUser(userAuth);
        const userDocRef = doc(db, 'users', userAuth.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: userAuth.uid, ...userDoc.data() } as UserProfile);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setCart([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.uid) {
      const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribe = onSnapshot(cartCollectionRef, (snapshot) => {
        const newCart = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCart(newCart);
      });
      return () => unsubscribe();
    } else {
      setCart([]);
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { user: userAuth } = userCredential;
    if (userAuth) {
      const userDocRef = doc(db, 'users', userAuth.uid);
      await setDoc(userDocRef, {
        name,
        email,
        type: 'buyer', // All registrations are for buyers
      });
    }
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };
  
  const addToCart = async (product: Product, quantity: number) => {
    if (!user) throw new Error("Vous devez être connecté pour ajouter au panier.");

    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    const q = query(cartCollectionRef, where("product.id", "==", product.id));
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Product exists, update quantity
      const existingDoc = querySnapshot.docs[0];
      await updateCartItemQuantity(existingDoc.id, existingDoc.data().quantity + quantity);
    } else {
      // Product doesn't exist, add new item
      await addDoc(cartCollectionRef, {
        product,
        quantity,
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) throw new Error("Utilisateur non trouvé.");
    const cartItemDocRef = doc(db, 'users', user.uid, 'cart', cartItemId);
    await deleteDoc(cartItemDocRef);
  };
  
  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) throw new Error("Utilisateur non trouvé.");
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    const cartItemDocRef = doc(db, 'users', user.uid, 'cart', cartItemId);
    await setDoc(cartItemDocRef, { quantity }, { merge: true });
  };

  const placeOrder = async (): Promise<Order | null> => {
    if (!user || cart.length === 0) {
      return null;
    }

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const ordersCollectionRef = collection(db, 'orders');
    const newOrderRef = doc(ordersCollectionRef);

    const newOrder: Omit<Order, 'id' | 'orderNumber'> & { createdAt: any } = {
      userId: user.uid,
      userName: user.name,
      date: new Date().toISOString(),
      total,
      status: 'En attente',
      payment: 'En attente',
      items: cart.map(({ product, quantity }) => ({ product, quantity })),
      createdAt: serverTimestamp() // For ordering
    };
    
    await setDoc(newOrderRef, newOrder);

    // Get a new write batch
    const batch = writeBatch(db);
    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    cart.forEach(item => {
      const docRef = doc(cartCollectionRef, item.id);
      batch.delete(docRef);
    });

    await batch.commit();

    return {
      id: newOrderRef.id,
      orderNumber: `#${Math.floor(Math.random() * 1000) + 3300}`, // Keep mock for now
      ...newOrder
    } as Order;
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    login,
    register,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    placeOrder,
    cartCount,
  };

  return (
    <AuthContext.Provider value={value}>
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
