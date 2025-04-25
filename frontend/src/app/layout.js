'use client';
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import { RoomProvider } from '../contexts/RoomContext';
import { VideoCallProvider } from '../contexts/VideoCallContext';
import { Toaster } from 'react-hot-toast';
import { CookiesProvider } from 'react-cookie';
import Navigation from '@/components/Navigation';  // Make sure this path is correct
import './globals.css'

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
        <CookiesProvider>
          <AuthProvider>
            <SocketProvider>
              <RoomProvider>
                <VideoCallProvider>
                  {children}
                  <Navigation />
                </VideoCallProvider>
              </RoomProvider>
            </SocketProvider>
          </AuthProvider>
        </CookiesProvider>
      </body>
    </html>
  );
}
