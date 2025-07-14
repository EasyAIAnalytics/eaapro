'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FiLogOut, FiUser, FiHelpCircle, FiSend } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname();

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    // Prevent hydration mismatch by not rendering until client-side
    return null
  }

  return (
    <>
      {/* Hamburger Menu */}
      <button
        className={`burger${sidebarOpen ? ' burger-closed' : ''}`}
        aria-label="Toggle sidebar"
        onClick={() => setSidebarOpen((v) => !v)}
        style={{ position: 'fixed', top: 18, left: 18, zIndex: 1001 }}
      >
        <span style={{ background: '#0a3cff' }}></span>
        <span style={{ background: '#0a3cff' }}></span>
        <span style={{ background: '#0a3cff' }}></span>
      </button>
      {/* Sidebar */}
      <aside className={`sidebar-menu fixed top-0 left-0 h-full z-20${sidebarOpen ? '' : ' sidebar-closed'}`}>
        <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="menu" style={{ flex: 1 }}>
            <button className={`${pathname === '/' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                Home
              </span>
            </button>
            <button className={`${pathname === '/advanced-formulas' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/advanced-formulas'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                Advanced Formulas
              </span>
            </button>
            <button className={`${pathname === '/advanced-statistics' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/advanced-statistics'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                Advanced Statistics
              </span>
            </button>
            <button className={`${pathname === '/ai-analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/ai-analytics'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                AI Analytics
              </span>
            </button>
            <button className={`${pathname === '/data-enrichment' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/data-enrichment'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                Data Enrichment
              </span>
            </button>
          </div>
          {/* Bottom actions */}
          <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className={`${pathname === '/profile' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/profile'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                <FiUser className="h-5 w-5" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Profile</span>
              </span>
            </button>
            <button className={`${pathname === '/support' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/support'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                <FiHelpCircle className="h-5 w-5" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Support</span>
              </span>
            </button>
            <button className={`${pathname === '/feedback' ? 'btn-primary' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full`} style={{ marginBottom: '0.25rem' }} onClick={() => window.location.href = '/feedback'}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                <FiSend className="h-5 w-5" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Feedback</span>
              </span>
            </button>
            <button className="btn-primary btn-sm transition-all duration-200 hover:scale-105 rounded-full w-full" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
              <span className="button_top flex items-center space-x-2 rounded-full w-full justify-center">
                <FiLogOut className="h-5 w-5" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Logout</span>
              </span>
            </button>
          </div>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="relative z-10" style={{ marginLeft: sidebarOpen ? '280px' : '0', minHeight: '100vh', transition: 'margin-left 0.3s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {children}
      </div>
    </>
  )
} 