import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { ToastProvider } from '@/context/toast-context';
import { ToastViewport } from '@/components/ui/toast-viewport';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FE Starken — Facturación Especial',
  description: 'Plataforma interna de Facturación Especial Starken',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} text-gray-900 antialiased min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <ToastViewport />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
