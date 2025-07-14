import type { Metadata } from 'next'
import './globals.css'
import Pattern from '@/components/Pattern'
import LayoutWrapper from '@/components/LayoutWrapper'
import './uiverse-sidebar.css'
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGuard from "./AuthGuard";
import LayoutWithSidebar from "./LayoutWithSidebar";
import { AuthOnceProvider } from './AuthGuard';

export const metadata = {
  title: 'Easy AI Analytics',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent min-h-screen relative">
        {/* Background Pattern */}
        <div className="fixed inset-0 z-0">
          <Pattern />
        </div>
        {/* Layout Wrapper with Sidebar only for app pages */}
        <AuthOnceProvider>
          <AuthGuard>
            <LayoutWithSidebar>{children}</LayoutWithSidebar>
            <footer style={{ background: '#000', width: '100%', textAlign: 'center', padding: '0.5rem 0', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#fff', marginTop: '2rem', borderTop: 'none', boxShadow: 'none', position: 'relative', left: 0, zIndex: 100, backgroundColor: '#000', backgroundImage: 'none', opacity: 1, overflowX: 'hidden' }}>
              © 2025 Easy AI Analytics
            </footer>
          </AuthGuard>
        </AuthOnceProvider>
      </body>
    </html>
  )
} 