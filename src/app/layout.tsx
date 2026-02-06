import type { Metadata } from 'next';
import { Poppins, Plus_Jakarta_Sans, Pacifico } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Providers } from '@/app/providers';

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const pacifico = Pacifico({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kaos EUY! - Bandung\'s Pride, Your Style',
  description: 'Kaos premium dengan sentuhan khas Bandung. Custom mudah, kualitas juara.',
  keywords: 'kaos bandung, custom kaos, kaos premium, sablon kaos, kaos euy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${poppins.variable} ${plusJakarta.variable} ${pacifico.variable} font-body antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider>
          <AuthProvider>
            <Providers>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </Providers>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
