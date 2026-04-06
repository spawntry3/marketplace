'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === '/login';

  return (
    <>
      {!isAuth && <Navbar />}
      <main
        className={
          isAuth
            ? 'min-h-screen'
            : 'min-h-screen pb-8 pt-32 md:pt-[8rem]'
        }
      >
        {children}
      </main>
      {!isAuth && <Footer />}
    </>
  );
}
