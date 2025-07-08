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
