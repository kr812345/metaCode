'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieProviderWrapper from '@/components/CookieProviderWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { RoomProvider } from '@/contexts/RoomContext';
import { VideoCallProvider } from '@/contexts/VideoCallContext';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-right" />
        <CookieProviderWrapper>
          <AuthProvider>
            <SocketProvider>
              <RoomProvider>
                <VideoCallProvider>
                  {children}
                </VideoCallProvider>
              </RoomProvider>
            </SocketProvider>
          </AuthProvider>
        </CookieProviderWrapper>
      </body>
    </html>
  );
}
