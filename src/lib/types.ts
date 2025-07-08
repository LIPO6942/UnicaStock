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
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  user: string; // user name
  date: string;
  total: number;
  status: string; // 'En attente', 'Expédiée', 'Livrée', 'Annulée'
  payment: string; // 'En attente', 'Réglé', 'Remboursé'
  items: CartItem[];
};
