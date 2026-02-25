// app/layout.js
'use client';

// import { GeistSans, GeistMono } from 'geist/font';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import Image from 'next/image';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistSans.css}`}>
      <body >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}