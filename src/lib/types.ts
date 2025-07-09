import type { Timestamp } from "firebase/firestore";

export type SerializableTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  type: 'buyer' | 'seller';
};

export type Product = {
  id: string;
  name: string;
  inci: string;
  seller: string;
  price: number;
  moq: number;
  stock: number;
  category: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  certifications?: string[];
  dataSheetUrl?: string;
  coaUrl?: string;
};

export type CartItem = {
  id: string; // Firestore document ID
  product: Product;
  quantity: number;
};

export type OrderStatus = 'En attente' | 'Confirmée' | 'Préparation en cours' | 'Expédiée' | 'Livrée' | 'Annulée';

export type Order = {
  id: string; // Firestore document ID
  orderNumber: string; // Human-readable order number like #3301
  userId: string;
  userName: string;
  date: string; // ISO string
  total: number;
  status: OrderStatus;
  payment: 'En attente' | 'Réglé' | 'Remboursé';
  items: {
    product: Product;
    quantity: number;
  }[];
  createdAt: any;
  buyerInfo?: {
    email: string;
    phone?: string;
    address?: string;
  };
};

export type Review = {
  id: string;
  userId: string;
  userName:string;
  rating: number;
  comment: string;
  createdAt: SerializableTimestamp | Timestamp | null;
};

export type Message = {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  subject: string;
  body: string;
  sender: 'buyer' | 'seller';
  isRead: boolean;
  createdAt: any; // Keep as any for simplicity with serverTimestamp
};

export type Banner = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
};
