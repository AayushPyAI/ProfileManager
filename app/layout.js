'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { UserProvider } from '@/contexts/UserContext';
import { Roboto } from 'next/font/google';   
import './globals.css';
import { FormspreeProvider } from '@formspree/react';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],         // choose weights you need
  variable: '--font-roboto',                    // optional CSS variable
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isProfilePage = /^\/(?:profile\/)?[a-f0-9]{24}$/i.test(pathname || '');
  const isNotFoundPage = pathname === '/';

  const hideNavigation = isProfilePage || isNotFoundPage;

  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-roboto">
        <FormspreeProvider>
        <UserProvider>
          {!hideNavigation && <Navbar />}
          {children}
          {!hideNavigation && <Footer />}
        </UserProvider>
        </FormspreeProvider>
      </body>
    </html>
  );
}
