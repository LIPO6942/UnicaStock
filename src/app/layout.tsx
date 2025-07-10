'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { Inter, PT_Sans } from 'next/font/google';
import { AppLayout } from '@/components/app-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Unica Link</title>
        <meta name="description" content="Matières premières pour produits cosmétiques en Tunisie" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', inter.variable, ptSans.variable)}>
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
