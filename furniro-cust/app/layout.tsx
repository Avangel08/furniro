import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Furniro - Furniture Store',
  viewport: 'width=device-width, initial-scale=1.0',
  description: 'Furniro furniture storefront',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

