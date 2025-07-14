"use client"

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Download,
  BarChart3,
  Calendar,
  Palette,
} from "lucide-react";

// AnimatedLogoDots with morphing animation from home page
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

export default function AIAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("anomaly");
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "anomaly", label: "Anomaly Detection", icon: Activity },
    { id: "forecast", label: "Forecasting", icon: TrendingUp },
    { id: "insights", label: "AI Insights", icon: Brain },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #faf9f6 0%, #f5f5dc 50%, #f0f8ff 100%)" }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
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

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? "btn-primary scale-105" : "btn-secondary"} btn-sm transition-all duration-200 hover:scale-105`}
                >
                  <span className="button_top flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span style={{ fontFamily: "Inter, sans-serif" }}>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                How to Use AI Analytics
              </h3>
              <ol className="text-sm text-blue-700 space-y-1" style={{ fontFamily: "Inter, sans-serif" }}>
                <li>1. Select an AI feature from the tabs above</li>
                <li>2. Configure the analysis parameters</li>
                <li>3. Run the analysis and review results</li>
                <li>4. Download results or interpret findings</li>
              </ol>
            </div>
          </div>
        </div>

        {/* API Key Status Banner (placeholder) */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-700 font-medium">OpenAI/Anthropic API key not set. Some features may be unavailable.</span>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Progress Bar (stub) */}
        <div className="w-full bg-blue-100 rounded-full h-3 mb-8">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-800 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Tab Content */}
        {activeTab === "anomaly" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow border border-blue-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Anomaly Detection
            </h2>
            <p className="text-gray-600 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>
              Detect outliers and rare patterns in your data using AI-powered techniques.
            </p>
            {/* Config UI (stub) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column to Analyze</label>
                <select className="w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option>-- Select --</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Anomaly %</label>
                <input type="range" min={1} max={20} defaultValue={5} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Column (optional)</label>
                <select className="w-full border border-blue-200 rounded px-3 py-2">
                  <option>-- None --</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color By (optional)</label>
                <select className="w-full border border-blue-200 rounded px-3 py-2">
                  <option>-- None --</option>
                </select>
              </div>
            </div>
            <button className="btn-primary transition-all duration-200 hover:scale-105">
              <span className="button_top flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Detect Anomalies</span>
              </span>
            </button>
          </div>
        )}
        {activeTab === "forecast" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow border border-blue-100 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Predictive Forecasting (Coming Soon)
            </h2>
            <p className="text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
              Time series forecasting and trend prediction will be available in a future update.
            </p>
          </div>
        )}
        {activeTab === "insights" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow border border-blue-100 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "Montserrat, sans-serif" }}>
              AI-Generated Insights (Coming Soon)
            </h2>
            <p className="text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
              Automated insights and explanations will be available in a future update.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 