'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

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
        <nav>
          <div className="menu">
            <div className="item">
              <Link href="/" className="link">
                <span>Home</span>
              </Link>
            </div>
            <div className="item">
              <Link href="/advanced-formulas" className="link">
                <span>Advanced Formulas</span>
              </Link>
            </div>
            <div className="item">
              <Link href="/advanced-statistics" className="link">
                <span>Advanced Statistics</span>
              </Link>
            </div>
            <div className="item">
              <Link href="/ai-analytics" className="link">
                <span>AI Analytics</span>
              </Link>
            </div>
            <div className="item">
              <Link href="/business-features" className="link">
                <span>Business Features</span>
              </Link>
            </div>
            <div className="item">
              <Link href="/data-enrichment" className="link">
                <span>Data Enrichment</span>
              </Link>
            </div>
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