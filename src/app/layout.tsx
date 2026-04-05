import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import AppChrome from '@/components/layout/AppChrome';
import QueryProvider from '@/providers/QueryProvider';
import MarketplaceProvider from '@/providers/MarketplaceProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={plusJakarta.variable}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <MarketplaceProvider>
            <AppChrome>{children}</AppChrome>
          </MarketplaceProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
