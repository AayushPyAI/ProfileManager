'use client';

import { usePathname } from 'next/navigation';
import { UserProvider } from '@/contexts/UserContext';
import { Roboto } from 'next/font/google';   
import './globals.css';
import { FormspreeProvider } from '@formspree/react';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],         // choose weights you need
  variable: '--font-roboto',                   
});

export default function RootLayout({ children }) {
return (
    <html lang="en" className={roboto.variable}>
      <body className="font-roboto">
        <FormspreeProvider>
        <UserProvider>
          {children}
        </UserProvider>
        </FormspreeProvider>
      </body>
    </html>
  );
}
