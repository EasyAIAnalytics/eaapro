import Link from 'next/link';

export function AppSidebar() {
  return (
    <aside className="sidebar-menu fixed top-0 left-0 h-full z-20">
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
            <Link href="/data-enrichment" className="link">
              <span>Data Enrichment</span>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
} 