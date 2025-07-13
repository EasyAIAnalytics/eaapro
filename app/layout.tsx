import type { Metadata } from 'next'
import './globals.css'
import Pattern from '@/components/Pattern'
import LayoutWrapper from '@/components/LayoutWrapper'
import './uiverse-sidebar.css'

export const metadata = {
  title: 'Easy AI Analytics',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-transparent min-h-screen relative">
        {/* Background Pattern */}
        <div className="fixed inset-0 z-0">
          <Pattern />
        </div>
        {/* Layout Wrapper with Sidebar */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <footer style={{ background: '#000', width: '100%', textAlign: 'center', padding: '0.5rem 0', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#fff', marginTop: '2rem', borderTop: 'none', boxShadow: 'none', position: 'relative', left: 0, zIndex: 100, backgroundColor: '#000', backgroundImage: 'none', opacity: 1, overflowX: 'hidden' }}>
          © 2025 Easy AI Analytics
        </footer>
      </body>
    </html>
  )
} 