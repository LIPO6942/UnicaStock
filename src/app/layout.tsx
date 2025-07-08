import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Unica Link',
  description: 'Matières premières pour produits cosmétiques en Tunisie',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <MainNav />
                <div className="flex flex-1 items-center justify-end space-x-4">
                  <nav className="flex items-center space-x-1">
                    <UserNav />
                  </nav>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="py-6 md:px-8 md:py-0 bg-card text-card-foreground">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <div className="flex items-center gap-2">
                  <Icons.logo className="h-6 w-6 text-primary" />
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built by your AI assistant.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                  <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
