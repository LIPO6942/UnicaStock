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
  phone?: string;
  // Seller specific fields
  companyName?: string;
  companyDescription?: string;
  companyAddress?: string;
  companyBackgroundUrl?: string; // For products page banner
  homepageImageUrl?: string;      // For homepage hero background
  homepageImageOpacity?: number;  // Opacity for homepage hero background (0-1)
};

export type ProductVariant = {
  id: string; // e.g., '100ml'
  contenance: string; // e.g., '100ml'
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  inci: string;
  seller: string;
  category: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  moq: number; // MOQ can remain as a general value for the product, e.g. min 1 unit of any variant
  certifications?: string[];
  dataSheetUrl?: string;
  coaUrl?: string;
};

export type CartItem = {
  id: string; // Firestore document ID
  productId: string;
  productName: string;
  productImage: string;
  variant: ProductVariant;
  quantity: number;
};

export type OrderStatus = 'En attente' | 'Confirmée' | 'Préparation en cours' | 'Expédiée' | 'Livrée' | 'Annulée';

export type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  variant: ProductVariant;
  quantity: number;
}

export type Order = {
  id: string; // Firestore document ID
  orderNumber: string; // Human-readable order number like #3301
  userId: string;
  userName: string;
  date: string; // ISO string
  total: number;
  status: OrderStatus;
  payment: 'En attente' | 'Réglé' | 'Remboursé';
  items: OrderItem[];
  createdAt: any;
  stockDeducted?: boolean; // Track if stock has been deducted for this order
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
  productPreview?: string;
};

export type Conversation = {
  orderId: string;
  orderNumber: string;
  otherPartyName: string;
  lastMessage: Message;
  unreadCount: number;
  productPreview?: string;
};


export type Banner = {
  id:string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
};

export type Benefit = {
  name: string;
};

export type Ingredient = {
  id: string;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  benefits: Benefit[];
  certifications: string[];
};
