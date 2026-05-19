import { Toaster } from '@/components/ui/toaster';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Will It Rain On My Parade? - Weather Risk Assessment',
  description:
    'Personalized weather risk assessments for outdoor activities and events',
  generator: 'v0.app',
  icons: {
    icon: '/next.svg',
    shortcut: '/next.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}