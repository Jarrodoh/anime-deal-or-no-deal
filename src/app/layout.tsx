import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anime Deal or No Deal',
  description: 'Pick a box. Trust the banker. Walk away with the greatest anime — or the worst.',
  openGraph: {
    title: 'Anime Deal or No Deal',
    description: 'The anime-themed daily deal game. New boxes every day.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  );
}
