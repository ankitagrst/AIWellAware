
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Literata, Space_Grotesk } from 'next/font/google';

export const metadata: Metadata = {
  title: 'WellAware AI',
  description: 'Personalized wellness rituals combining Sanatan, Ayurveda, and Vedic traditions.',
};

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${literata.variable} ${spaceGrotesk.variable}`}>
      <head />
      <body className="font-body antialiased">
        <SidebarProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
