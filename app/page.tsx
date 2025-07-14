'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, BarChart3, FileText, Download, Brain, Zap, TrendingUp, Shield, Play, Database, FileText as FileTextIcon } from 'lucide-react'
import DataUpload from '@/components/DataUpload'
import DataExploration from '@/components/DataExploration'
import DataVisualization from '@/components/DataVisualization'
import ReportGeneration from '@/components/ReportGeneration'
import { buildApiUrl } from '@/lib/config';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [availableCharts, setAvailableCharts] = useState<Array<{ type: string, title: string, params?: any }>>([])

  const refreshData = async () => {
    try {
      const response = await fetch(buildApiUrl('/data-info'))
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  // Add chart to availableCharts if not already present
  const handleChartGenerated = (chart: { type: string, title: string, params?: any }) => {
    setAvailableCharts((prev) => {
      if (prev.some((c) => c.title === chart.title)) return prev
      return [...prev, chart]
    })
  }

  const tabs = [
    { id: 'upload', label: 'Upload & Explore', icon: Upload },
    { id: 'explore', label: 'Data Analysis', icon: BarChart3 },
    { id: 'visualize', label: 'Visualize', icon: BarChart3 },
    { id: 'report', label: 'Generate Report', icon: FileText },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf9f6 0%, #f5f5dc 50%, #f0f8ff 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* 3D Logo - Animated Dots Morphing Between Shapes */}
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:animate-shake group-active:scale-110" style={{ willChange: 'transform' }}>
                  <AnimatedLogoDots />
                </div>
                <style jsx>{`
                  .group:hover .group-hover\\:animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                  }
                  @keyframes shake {
                    10%, 90% { transform: translateX(-1px); }
                    20%, 80% { transform: translateX(2px); }
                    30%, 50%, 70% { transform: translateX(-4px); }
                    40%, 60% { transform: translateX(4px); }
                  }
                `}</style>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Easy AI Analytics
                </h1>
                <p className="text-base text-blue-600 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Turn data into decisions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-base text-blue-700 font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? 'btn-primary scale-105' : 'btn-secondary'} btn-sm transition-all duration-200 hover:scale-105`}
                >
                  <span className="button_top flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{tab.label}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Upload Section - always at the top */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <>
            {!data ? (
              <>
                <div className="mb-12">
                  <DataUpload onDataLoaded={setData} setLoading={setLoading} />
                </div>
                <div className="mb-12">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100 mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      How to Get Started
                    </h3>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                      <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2 shadow">
                          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>1</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Upload Your Data</h4>
                        <p className="text-gray-600 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Drag & drop CSV or Excel files, or load our sample dataset
                        </p>
                      </div>
                      <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2 shadow">
                          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>2</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Explore & Analyze</h4>
                        <p className="text-gray-600 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Review your data structure and check for missing values
                        </p>
                      </div>
                      <div className="flex flex-col items-center text-center flex-1 min-w-[180px]">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow">
                          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Rubik, sans-serif' }}>3</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Visualize & Report</h4>
                        <p className="text-gray-600 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Create charts and generate reports from your insights
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Feature Cards - less visually dominant */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/70 rounded-xl p-5 shadow border border-blue-100 flex flex-col items-center">
                      <Upload className="w-8 h-8 text-blue-500 mb-2" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Smart Upload</h3>
                      <p className="text-gray-600 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Drag & drop your data files and let our platform handle the rest</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-5 shadow border border-green-100 flex flex-col items-center">
                      <Database className="w-8 h-8 text-green-500 mb-2" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Sample Data</h3>
                      <p className="text-gray-600 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Test the platform with our pre-loaded sample datasets</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-5 shadow border border-purple-100 flex flex-col items-center">
                      <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Visual Insights</h3>
                      <p className="text-gray-600 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Beautiful charts and graphs that tell your data's story</p>
                    </div>
                    <div className="bg-white/70 rounded-xl p-5 shadow border border-orange-100 flex flex-col items-center">
                      <Shield className="w-8 h-8 text-orange-500 mb-2" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Secure & Fast</h3>
                      <p className="text-gray-600 text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Enterprise-grade security with lightning-fast processing</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-12">
                <DataUpload onDataLoaded={setData} setLoading={setLoading} />
              </div>
            )}
          </>
        )}

        {/* Main Content for other tabs */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        )}
        {!loading && activeTab === 'explore' && (
          <DataExploration data={data} onDataUpdate={refreshData} />
        )}
        {!loading && activeTab === 'visualize' && (
          <DataVisualization data={data} onDataUpdate={refreshData} onChartGenerated={handleChartGenerated} />
        )}
        {!loading && activeTab === 'report' && (
          <ReportGeneration data={data} availableCharts={availableCharts} />
        )}
      </main>
    </div>
  )
}

const SHAPES = [
  // Line chart (ascending)
  [
    { x: 8,  y: 32 },
    { x: 16, y: 26 },
    { x: 20, y: 20 },
    { x: 28, y: 14 },
    { x: 34, y: 8 },
  ],
  // Bar chart (evenly spaced, different heights)
  [
    { x: 8,  y: 32 },
    { x: 16, y: 24 },
    { x: 20, y: 12 },
    { x: 28, y: 20 },
    { x: 34, y: 28 },
  ],
  // Circle
  Array.from({ length: 5 }).map((_, i) => {
    const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
    return {
      x: 20 + 10 * Math.cos(angle),
      y: 20 + 10 * Math.sin(angle),
    };
  }),
  // Spiral
  Array.from({ length: 5 }).map((_, i) => {
    const t = i / 4 * 2 * Math.PI;
    const r = 4 + 2.5 * i;
    return {
      x: 20 + r * Math.cos(t - Math.PI / 2),
      y: 20 + r * Math.sin(t - Math.PI / 2),
    };
  }),
  // Wave (sinusoidal)
  [
    { x: 8,  y: 20 },
    { x: 16, y: 14 },
    { x: 20, y: 20 },
    { x: 28, y: 26 },
    { x: 34, y: 20 },
  ],
];

const ANIMATION_DURATION = 1200; // ms per morph

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateShape(from: { x: number; y: number }[], to: { x: number; y: number }[], t: number) {
  return from.map((pt, i) => ({
    x: lerp(pt.x, to[i].x, t),
    y: lerp(pt.y, to[i].y, t),
  }));
}

const AnimatedLogoDots: React.FC = () => {
  const [shapeIdx, setShapeIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const lastTimestamp = useRef<number | null>(null);

  useEffect(() => {
    function animate(ts: number) {
      if (lastTimestamp.current === null) lastTimestamp.current = ts;
      const elapsed = ts - lastTimestamp.current;
      let t = Math.min(elapsed / ANIMATION_DURATION, 1);
      setProgress(t);
      if (t < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setShapeIdx((idx) => (idx + 1) % SHAPES.length);
          setProgress(0);
          lastTimestamp.current = null;
          requestRef.current = requestAnimationFrame(animate);
        }, 400); // pause briefly on each shape
      }
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [shapeIdx]);

  const from = SHAPES[shapeIdx];
  const to = SHAPES[(shapeIdx + 1) % SHAPES.length];
  const dots = interpolateShape(from, to, progress);

  return (
    <svg className="w-12 h-12 text-white" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {dots.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={2.2}
          fill="#fff"
          style={{ filter: 'drop-shadow(0 1px 4px #60a5fa88)' }}
        />
      ))}
    </svg>
  );
}; 