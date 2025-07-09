'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, query, where, getDocs, writeBatch, deleteDoc, runTransaction, DocumentReference } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, Product, CartItem, Order, ProductVariant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (name: string, email: string, pass: string, type: 'buyer' | 'seller') => Promise<any>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  cart: CartItem[];
  addToCart: (productId: string, productName: string, productImage: string, variant: ProductVariant, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  placeOrder: () => Promise<Order | null>;
  cartCount: number;
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
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
      // Cart listener
      const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
      const cartUnsubscribe = onSnapshot(cartCollectionRef, (snapshot) => {
        const newCart = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
        setCart(newCart);
      });

      // Unread messages listener
      const messagesCollectionRef = collection(db, 'messages');
      let q;
      if (user.type === 'seller') {
        q = query(messagesCollectionRef, where('sender', '==', 'buyer'), where('isRead', '==', false));
      } else {
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid), where('sender', '==', 'seller'), where('isRead', '==', false));
      }
      const messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadMessagesCount(snapshot.size);
      });

      return () => {
        cartUnsubscribe();
        messagesUnsubscribe();
      };
    } else {
      setCart([]);
      setUnreadMessagesCount(0);
    }
  }, [user]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = async (name: string, email: string, pass: string, type: 'buyer' | 'seller') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { user: userAuth } = userCredential;
    if (userAuth) {
      const userDocRef = doc(db, 'users', userAuth.uid);
      await setDoc(userDocRef, {
        name,
        email,
        type,
      });
    }
    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    if (!firebaseUser) {
      throw new Error("Utilisateur non authentifié.");
    }
    try {
      // 1. Delete user's cart subcollection
      const cartCollectionRef = collection(db, 'users', firebaseUser.uid, 'cart');
      const cartSnapshot = await getDocs(cartCollectionRef);
      if (!cartSnapshot.empty) {
        const batch = writeBatch(db);
        cartSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // 2. Delete the user's document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await deleteDoc(userDocRef);

      // 3. Delete the user from Firebase Authentication
      await deleteUser(firebaseUser);

    } catch (error: any) {
      console.error("Erreur lors de la suppression du compte :", error);
      let description = "Une erreur est survenue lors de la suppression de votre compte.";
      if (error.code === 'auth/requires-recent-login') {
        description = "Opération sensible. Veuillez vous déconnecter et vous reconnecter avant de réessayer.";
      }
      toast({
        title: 'Erreur de suppression',
        description: description,
        variant: 'destructive',
      });
      throw error; // Re-throw to be caught by the UI
    }
  };
  
  const addToCart = async (productId: string, productName: string, productImage: string, variant: ProductVariant, quantity: number) => {
    if (!user) throw new Error("Vous devez être connecté pour ajouter au panier.");
    if (variant.stock < quantity) {
      throw new Error("Quantité en stock insuffisante.");
    }

    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    const q = query(cartCollectionRef, where("productId", "==", productId), where("variant.id", "==", variant.id));
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Product variant exists, update quantity
      const existingDoc = querySnapshot.docs[0];
      await updateCartItemQuantity(existingDoc.id, existingDoc.data().quantity + quantity);
    } else {
      // Product doesn't exist, add new item
      await addDoc(cartCollectionRef, {
        productId,
        productName,
        productImage,
        variant,
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
    const cartItemDocRef = doc(db, 'users', user.uid, 'cart', cartItemId);

    const cartItem = cart.find(item => item.id === cartItemId);
    if (!cartItem) return;

    if (quantity > cartItem.variant.stock) {
      toast({
        title: 'Stock insuffisant',
        description: `Il ne reste que ${cartItem.variant.stock} unités pour ${cartItem.productName} (${cartItem.variant.contenance}).`,
        variant: 'destructive',
      });
      await setDoc(cartItemDocRef, { quantity: cartItem.variant.stock }, { merge: true });
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    await setDoc(cartItemDocRef, { quantity }, { merge: true });
  };

  const placeOrder = async (): Promise<Order | null> => {
    if (!user || cart.length === 0) {
      return null;
    }

    const newOrderRef = doc(collection(db, 'orders'));
    
    try {
      const createdOrder = await runTransaction(db, async (transaction) => {
        const total = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

        for (const item of cart) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) throw new Error(`Produit ${item.productName} non trouvé.`);
          
          const productData = productDoc.data() as Product;
          const variantToUpdate = productData.variants.find(v => v.id === item.variant.id);
          
          if (!variantToUpdate) throw new Error(`Variante ${item.variant.contenance} non trouvée pour ${item.productName}`);
          if (variantToUpdate.stock < item.quantity) {
            throw new Error(`Stock insuffisant pour ${item.productName} (${item.variant.contenance}). Disponible: ${variantToUpdate.stock}, Demandé: ${item.quantity}.`);
          }

          const newVariants = productData.variants.map(v => 
            v.id === item.variant.id ? { ...v, stock: v.stock - item.quantity } : v
          );

          transaction.update(productRef, { variants: newVariants });
        }

        const newOrderData: Omit<Order, 'id' | 'orderNumber'> = {
          userId: user.uid,
          userName: user.name,
          buyerInfo: { email: user.email },
          date: new Date().toISOString(),
          total,
          status: 'En attente',
          payment: 'En attente',
          items: cart.map(({ productId, productName, variant, quantity }) => ({ productId, productName, variant, quantity })),
          createdAt: serverTimestamp(),
        };
        transaction.set(newOrderRef, newOrderData);

        const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
        for (const item of cart) {
          const cartItemRef = doc(cartCollectionRef, item.id);
          transaction.delete(cartItemRef);
        }
        
        return {
          id: newOrderRef.id,
          orderNumber: `#${newOrderRef.id.substring(0, 6).toUpperCase()}`,
          ...newOrderData
        } as Order;
      });
      return createdOrder;

    } catch (e: any) {
      console.error("La transaction de commande a échoué:", e);
      throw e;
    }
  };


  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    login,
    register,
    logout,
    deleteAccount,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    placeOrder,
    cartCount,
    unreadMessagesCount,
    setUnreadMessagesCount,
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