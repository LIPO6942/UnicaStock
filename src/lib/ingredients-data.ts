
import type { Ingredient } from '@/lib/types';

export const ingredientsData: Ingredient[] = [
  {
    id: '1',
    name: 'Figue de Barbarie',
    location: 'Kasserine, Tunisie',
    description: "L'huile de pépins de figue de Barbarie, trésor rare et précieux, est réputée pour son pouvoir anti-âge exceptionnel. Riche en vitamine E et en stérols, elle protège la peau des radicaux libres et stimule le renouvellement cellulaire.",
    imageUrl: 'https://images.unsplash.com/photo-1614945339363-22b94916a2e2?q=80&w=2787',
    imageHint: 'prickly pear',
    benefits: [
      { name: 'Anti-âge puissant' },
      { name: 'Hydratation intense' },
      { name: 'Régénération cellulaire' },
      { name: 'Éclat du teint' },
    ],
    certifications: ['Bio', 'Commerce Équitable'],
  },
  {
    id: '2',
    name: 'Huile d\'Olive',
    location: 'Sfax, Tunisie',
    description: "Symbole de la Méditerranée, l'huile d'olive extra vierge tunisienne est un concentré de bienfaits pour la peau et les cheveux. Ses propriétés nourrissantes et adoucissantes en font un allié quotidien indispensable.",
    imageUrl: 'https://images.unsplash.com/photo-1622616298586-eb63e015482b?q=80&w=2940',
    imageHint: 'olive oil',
    benefits: [
      { name: 'Nourrit en profondeur' },
      { name: 'Adoucit la peau' },
      { name: 'Antioxydant' },
      { name: 'Fortifie les cheveux' },
    ],
    certifications: ['AOP', 'Bio'],
  },
  {
    id: '3',
    name: 'Fleur d\'Oranger',
    location: 'Nabeul, Tunisie',
    description: "L'eau de fleur d'oranger, ou Néroli, est distillée artisanalement à Nabeul, capitale tunisienne des agrumes. Apaisante et rafraîchissante, elle calme les peaux sensibles et parfume délicatement les soins.",
    imageUrl: 'https://images.unsplash.com/photo-1558257095-2f84a4a4b5b7?q=80&w=2787',
    imageHint: 'orange blossom',
    benefits: [
      { name: 'Apaise les irritations' },
      { name: 'Rafraîchit le teint' },
      { name: 'Propriétés relaxantes' },
      { name: 'Tonifiant doux' },
    ],
    certifications: ['Distillation Artisanale', '100% Pure'],
  },
];
