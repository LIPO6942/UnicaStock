import type { Banner } from './types';

// Products are now managed in Firestore. This file is for other mock data.

export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    title: 'Découvrez la nouvelle Lux Cream Unica',
    description: 'Une expérience anti-âge et illuminatrice inspirée par la Méditerranée. Disponible dès maintenant.',
    imageUrl: 'https://i.postimg.cc/jSkJ3DGv/T001-UNICA-20-LUX-20-CREAM-20-NEW-02.webp',
    linkUrl: '/products',
    buttonText: 'Acheter maintenant',
  },
  {
    id: 'banner-2',
    title: 'Promotion sur le Beurre de Karité Brut',
    description: 'Profitez de -15% sur notre beurre de karité brut pour toute commande supérieure à 50kg.',
    imageUrl: 'https://placehold.co/1200x400.png',
    linkUrl: '/products/2',
    buttonText: 'Profiter de l\'offre',
  },
  {
    id: 'banner-3',
    title: 'Unica Link : Votre Partenaire Qualité',
    description: 'Nous nous engageons à vous fournir des matières premières tracées et certifiées.',
    imageUrl: 'https://placehold.co/1200x400.png',
    linkUrl: '#why-us',
    buttonText: 'En savoir plus',
  },
];
