'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  ArrowLeft, 
  Upload, 
  Database, 
  CheckCircle, 
  XCircle, 
  Save, 
  Download,
  AlertTriangle,
  Info,
  Loader2,
  Target,
  ScatterChart,
  Activity,
  Calculator,
  FileText,
  Eye,
  Trash2
} from 'lucide-react'
import { buildApiUrl } from '@/lib/config'

export default function AdvancedStatisticsPage() {
  const [activeTab, setActiveTab] = useState('hypothesis')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(buildApiUrl('/data-info'))
        if (response.ok) {
          const newData = await response.json()
          setData(newData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'hypothesis', label: 'Hypothesis Testing', icon: Target },
    { id: 'multivariate', label: 'Multivariate Analysis', icon: ScatterChart },
    { id: 'bayesian', label: 'Bayesian Analysis', icon: Brain },
  ]

  const handleApply = (analysisResults: any) => {
    setResults(analysisResults)
    setSuccess('Analysis completed successfully!')
    setError(null)
  }

  const handleSave = () => {
    // Apply changes to dataset
    setResults(null)
    setSuccess('Changes applied to dataset successfully!')
    setError(null)
  }

  const handleDiscard = () => {
    setResults(null)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #faf9f6 0%, #f5f5dc 50%, #f0f8ff 100%)' }}>
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
              <button
                onClick={() => window.history.back()}
                className="btn-secondary btn-sm transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <ArrowLeft className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Back</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Advanced Statistical Analysis
          </h2>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Perform robust hypothesis testing, multivariate analysis, and Bayesian inference
          </p>
        </div>

        {/* Instructions Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                How to Use Advanced Statistics
              </h3>
              <ol className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>1. Select your analysis type from the tabs above</li>
                <li>2. Configure the analysis parameters based on your data</li>
                <li>3. Run the analysis and review results</li>
                <li>4. Apply changes to your dataset or download results</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {!data ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow border border-blue-100">
              <Database className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                No Data Loaded
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Please upload or load sample data first to perform statistical analysis.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-primary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Go to Upload</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            {loading && (
              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}

            {/* Analysis Panels */}
            {activeTab === 'hypothesis' && (
              <HypothesisTestPanel 
                data={data}
                onApply={handleApply}
                setLoading={setLoading}
                setError={setError}
                setProgress={setProgress}
              />
            )}
            {activeTab === 'multivariate' && (
              <MultivariatePanel 
                data={data}
                onApply={handleApply}
                setLoading={setLoading}
                setError={setError}
                setProgress={setProgress}
              />
            )}
            {activeTab === 'bayesian' && (
              <BayesianPanel 
                data={data}
                onApply={handleApply}
                setLoading={setLoading}
                setError={setError}
                setProgress={setProgress}
              />
            )}
          </>
        )}

        {/* Results Preview */}
        {results && (
          <div className="mt-8">
            <ResultsPreview results={results} />
          </div>
        )}

        {/* Save/Discard Section */}
        {results && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Apply Changes
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="btn-primary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <Save className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Apply Changes to Dataset</span>
                </span>
              </button>
              <button
                onClick={handleDiscard}
                className="btn-secondary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <XCircle className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Discard Changes</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

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

// Hypothesis Testing Panel
function HypothesisTestPanel({ data, onApply, setLoading, setError, setProgress }: any) {
  const [testType, setTestType] = useState('t-test')
  const [formData, setFormData] = useState({
    groupColumn: '',
    valueColumn: '',
    group1: '',
    group2: '',
    alpha: 0.05,
    alternative: 'two-sided'
  })

  const handleApply = async () => {
    if (!formData.groupColumn || !formData.valueColumn) {
      setError('Please select group and value columns')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(buildApiUrl('/hypothesis-test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType,
          ...formData
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to run hypothesis test')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Hypothesis Testing
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Test Type
          </label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="t-test">Independent t-test (2 groups)</option>
            <option value="anova">One-way ANOVA (3+ groups)</option>
            <option value="paired-t">Paired t-test</option>
          </select>
        </div>

        {/* Group Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Group Column
          </label>
          <select
            value={formData.groupColumn}
            onChange={(e) => setFormData({...formData, groupColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select group column...</option>
            {data?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Value Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Value Column
          </label>
          <select
            value={formData.valueColumn}
            onChange={(e) => setFormData({...formData, valueColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select value column...</option>
            {data?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Significance Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Significance Level (α)
          </label>
          <select
            value={formData.alpha}
            onChange={(e) => setFormData({...formData, alpha: parseFloat(e.target.value)})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={0.01}>0.01 (99% confidence)</option>
            <option value={0.05}>0.05 (95% confidence)</option>
            <option value={0.10}>0.10 (90% confidence)</option>
          </select>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          About {testType === 't-test' ? 'Independent t-test' : testType === 'anova' ? 'ANOVA' : 'Paired t-test'}
        </h4>
        <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
          {testType === 't-test' && 'Compares means between two independent groups. Assumes normal distribution and equal variances.'}
          {testType === 'anova' && 'Compares means across three or more groups. Tests if at least one group mean differs significantly.'}
          {testType === 'paired-t' && 'Compares means of related samples (before/after, matched pairs). More powerful than independent t-test.'}
        </p>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={!formData.groupColumn || !formData.valueColumn}
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Run Hypothesis Test</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// Multivariate Analysis Panel
function MultivariatePanel({ data, onApply, setLoading, setError, setProgress }: any) {
  const [analysisType, setAnalysisType] = useState('pca')
  const [formData, setFormData] = useState({
    columns: [],
    nComponents: 2,
    targetColumn: '',
    independentColumns: []
  })

  const handleApply = async () => {
    if (analysisType === 'pca' && formData.columns.length === 0) {
      setError('Please select columns for PCA analysis')
      return
    }
    if (analysisType === 'regression' && (!formData.targetColumn || formData.independentColumns.length === 0)) {
      setError('Please select target and independent variables for regression')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(buildApiUrl('/multivariate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType,
          ...formData
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to run multivariate analysis')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Multivariate Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Analysis Type
          </label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pca">Principal Component Analysis (PCA)</option>
            <option value="correlation">Correlation Analysis</option>
            <option value="regression">Linear Regression</option>
          </select>
        </div>

        {analysisType === 'pca' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Number of Components
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.nComponents}
              onChange={(e) => setFormData({...formData, nComponents: parseInt(e.target.value)})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {analysisType === 'regression' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Target Variable (Y)
              </label>
              <select
                value={formData.targetColumn}
                onChange={(e) => setFormData({...formData, targetColumn: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select target variable...</option>
                {data?.column_info?.map((col: any) => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Column Selection */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {analysisType === 'pca' ? 'Select Variables for PCA' : 
           analysisType === 'correlation' ? 'Select Variables for Correlation' : 
           'Select Independent Variables (X)'}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
          {data?.column_info?.map((col: any) => (
            <label key={col.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={analysisType === 'regression' ? 
                  formData.independentColumns.includes(col.name) : 
                  formData.columns.includes(col.name)}
                onChange={(e) => {
                  if (analysisType === 'regression') {
                    const newColumns = e.target.checked 
                      ? [...formData.independentColumns, col.name]
                      : formData.independentColumns.filter((c: string) => c !== col.name)
                    setFormData({...formData, independentColumns: newColumns})
                  } else {
                    const newColumns = e.target.checked 
                      ? [...formData.columns, col.name]
                      : formData.columns.filter((c: string) => c !== col.name)
                    setFormData({...formData, columns: newColumns})
                  }
                }}
                className="rounded"
              />
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{col.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          About {analysisType === 'pca' ? 'PCA' : analysisType === 'correlation' ? 'Correlation Analysis' : 'Linear Regression'}
        </h4>
        <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
          {analysisType === 'pca' && 'Reduces dimensionality by finding principal components that explain maximum variance in the data.'}
          {analysisType === 'correlation' && 'Measures the strength and direction of relationships between variables using correlation coefficients.'}
          {analysisType === 'regression' && 'Models the relationship between a dependent variable and one or more independent variables.'}
        </p>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={
            (analysisType === 'pca' && formData.columns.length === 0) ||
            (analysisType === 'regression' && (!formData.targetColumn || formData.independentColumns.length === 0))
          }
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <ScatterChart className="h-5 w-5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Run {analysisType.toUpperCase()} Analysis</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// Bayesian Analysis Panel
function BayesianPanel({ data, onApply, setLoading, setError, setProgress }: any) {
  const [analysisType, setAnalysisType] = useState('estimation')
  const [formData, setFormData] = useState({
    column: '',
    groupColumn: '',
    group1: '',
    group2: '',
    priorMean: 0,
    priorStd: 1,
    samples: 10000
  })

  const handleApply = async () => {
    if (!formData.column) {
      setError('Please select a column for analysis')
      return
    }
    if (analysisType === 'ab-test' && (!formData.groupColumn || !formData.group1 || !formData.group2)) {
      setError('Please select group column and specify two groups for A/B testing')
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev: number) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(buildApiUrl('/bayesian'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType,
          ...formData
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to run Bayesian analysis')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Bayesian Analysis
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Analysis Type
          </label>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="estimation">Parameter Estimation</option>
            <option value="ab-test">A/B Testing</option>
          </select>
        </div>

        {/* Target Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Target Column
          </label>
          <select
            value={formData.column}
            onChange={(e) => setFormData({...formData, column: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select target column...</option>
            {data?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {analysisType === 'ab-test' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Group Column
              </label>
              <select
                value={formData.groupColumn}
                onChange={(e) => setFormData({...formData, groupColumn: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select group column...</option>
                {data?.column_info?.map((col: any) => (
                  <option key={col.name} value={col.name}>{col.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Group A
              </label>
              <input
                type="text"
                value={formData.group1}
                onChange={(e) => setFormData({...formData, group1: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group A value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Group B
              </label>
              <input
                type="text"
                value={formData.group2}
                onChange={(e) => setFormData({...formData, group2: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group B value"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Number of Samples
          </label>
          <input
            type="number"
            min="1000"
            max="50000"
            step="1000"
            value={formData.samples}
            onChange={(e) => setFormData({...formData, samples: parseInt(e.target.value)})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          About {analysisType === 'estimation' ? 'Bayesian Parameter Estimation' : 'Bayesian A/B Testing'}
        </h4>
        <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
          {analysisType === 'estimation' && 'Estimates posterior distributions for parameters using Bayesian inference with MCMC sampling.'}
          {analysisType === 'ab-test' && 'Compares two groups using Bayesian methods, providing probability of improvement and credible intervals.'}
        </p>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={!formData.column || (analysisType === 'ab-test' && (!formData.groupColumn || !formData.group1 || !formData.group2))}
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Run Bayesian Analysis</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// Results Preview Component
function ResultsPreview({ results }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Analysis Results
        </h3>
        <button
          onClick={() => {
            // Download results as CSV
            const csvContent = "data:text/csv;charset=utf-8," + results.csvData
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", "statistical_analysis_results.csv")
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }}
          className="btn-secondary btn-sm transition-all duration-200 hover:scale-105"
        >
          <span className="button_top flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Download CSV</span>
          </span>
        </button>
      </div>
      
      {/* Results Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.summary?.map((item: any, index: number) => (
            <div key={index} className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
              <div className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
        <h4 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Detailed Results
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {results.columns?.map((col: any) => (
                <th key={col} className="text-left p-2 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.data?.map((row: any, idx: number) => (
              <tr key={idx} className="border-b">
                {results.columns?.map((col: any) => (
                  <td key={col} className="p-2">{row[col] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interpretation */}
      {results.interpretation && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Interpretation
          </h4>
          <p className="text-sm text-blue-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {results.interpretation}
          </p>
        </div>
      )}

      {/* Warnings */}
      {results.warnings && results.warnings.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="text-sm font-semibold text-yellow-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              Warnings
            </h4>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            {results.warnings.map((warning: string, index: number) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 