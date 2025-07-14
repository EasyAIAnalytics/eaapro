'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, FileText, Database, Upload, CheckCircle, XCircle, Loader2, Eye, Trash2, Save, ArrowLeft } from 'lucide-react'
import { buildApiUrl } from '@/lib/config'

export default function AdvancedFormulasPage() {
  const [activeTab, setActiveTab] = useState('vlookup')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [lookupTables, setLookupTables] = useState<any[]>([])
  const [selectedLookupTable, setSelectedLookupTable] = useState<any>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: 'vlookup', label: 'VLOOKUP', icon: Search },
    { id: 'xlookup', label: 'XLOOKUP', icon: Search },
    { id: 'dax', label: 'DAX LOOKUPVALUE', icon: Database },
    { id: 'upload', label: 'Upload Lookup Table', icon: Upload },
  ]

  // Fetch main dataset info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(buildApiUrl('/data-info'))
        if (response.ok) {
          const dataInfo = await response.json()
          setData(dataInfo)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Fetch lookup tables
  useEffect(() => {
    const fetchLookupTables = async () => {
      try {
        const response = await fetch(buildApiUrl('/lookup-tables'))
        if (response.ok) {
          const tables = await response.json()
          setLookupTables(tables)
        }
      } catch (error) {
        console.error('Error fetching lookup tables:', error)
      }
    }
    fetchLookupTables()
  }, [])

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
            Advanced Formulas & Lookups
          </h2>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Apply Excel and Power BI style formulas to enhance your data
          </p>
        </div>
        
        {!data ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow border border-blue-100">
              <Database className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                No Data Loaded
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Please upload or load sample data first to use advanced formulas.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-primary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Go to Upload</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'vlookup' && (
              <VLOOKUPForm 
                data={data} 
                lookupTables={lookupTables}
                selectedLookupTable={selectedLookupTable}
                setSelectedLookupTable={setSelectedLookupTable}
                onApply={setResults}
                setLoading={setLoading}
                setError={setError}
              />
            )}
            {activeTab === 'xlookup' && (
              <XLOOKUPForm 
                data={data} 
                lookupTables={lookupTables}
                selectedLookupTable={selectedLookupTable}
                setSelectedLookupTable={setSelectedLookupTable}
                onApply={setResults}
                setLoading={setLoading}
                setError={setError}
              />
            )}
            {activeTab === 'dax' && (
              <DAXForm 
                data={data} 
                lookupTables={lookupTables}
                selectedLookupTable={selectedLookupTable}
                setSelectedLookupTable={setSelectedLookupTable}
                onApply={setResults}
                setLoading={setLoading}
                setError={setError}
              />
            )}
            {activeTab === 'upload' && (
              <LookupTableManager 
                lookupTables={lookupTables}
                setLookupTables={setLookupTables}
                setSelectedLookupTable={setSelectedLookupTable}
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

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
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
                onClick={() => {
                  // Apply changes to dataset
                  setResults(null)
                  setError(null)
                }}
                className="btn-primary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span style={{ fontFamily: 'Inter, sans-serif' }}>Apply Changes to Dataset</span>
                </span>
              </button>
              <button
                onClick={() => {
                  setResults(null)
                  setError(null)
                }}
                className="btn-secondary transition-all duration-200 hover:scale-105"
              >
                <span className="button_top flex items-center space-x-2">
                  <XCircle className="h-4 w-4" />
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

// Animated Logo Component (same as homepage)
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function interpolateShape(from: { x: number; y: number }[], to: { x: number; y: number }[], t: number) {
  return from.map((point, i) => ({
    x: lerp(point.x, to[i].x, t),
    y: lerp(point.y, to[i].y, t)
  }))
}

const AnimatedLogoDots: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 64
    canvas.height = 64
    
    const shapes = [
      // Square (4 points)
      [{ x: 8, y: 8 }, { x: 40, y: 8 }, { x: 40, y: 40 }, { x: 8, y: 40 }],
      // Triangle (4 points - last point repeats to match square)
      [{ x: 24, y: 8 }, { x: 40, y: 40 }, { x: 8, y: 40 }, { x: 24, y: 8 }],
      // Circle (4 points - simplified)
      [{ x: 24, y: 8 }, { x: 40, y: 24 }, { x: 24, y: 40 }, { x: 8, y: 24 }]
    ]
    
    let currentShape = 0
    let animationFrame: number
    
    function animate(ts: number) {
      if (!ctx || !canvas) return
      
      const t = (ts % 3000) / 3000 // 3 second cycle
      const shapeIndex = Math.floor(t * shapes.length)
      const nextIndex = (shapeIndex + 1) % shapes.length
      const localT = (t * shapes.length) % 1
      
      const currentPoints = shapes[shapeIndex]
      const nextPoints = shapes[nextIndex]
      
      // Interpolate between shapes
      const interpolatedPoints = interpolateShape(currentPoints, nextPoints, localT)
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw shape
      ctx.beginPath()
      ctx.moveTo(interpolatedPoints[0].x, interpolatedPoints[0].y)
      for (let i = 1; i < interpolatedPoints.length; i++) {
        ctx.lineTo(interpolatedPoints[i].x, interpolatedPoints[i].y)
      }
      ctx.closePath()
      ctx.fillStyle = 'white'
      ctx.fill()
      
      animationFrame = requestAnimationFrame(animate)
    }
    
    animate(0)
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])
  
  return <canvas ref={canvasRef} className="w-12 h-12" />
}

// VLOOKUP Form Component
function VLOOKUPForm({ data, lookupTables, selectedLookupTable, setSelectedLookupTable, onApply, setLoading, setError }: any) {
  const [formData, setFormData] = useState({
    lookupColumn: '',
    returnColumn: '',
    resultColumnName: 'VLOOKUP_Result',
    exactMatch: true,
    ifNotFound: ''
  })

  const handleApply = async () => {
    if (!selectedLookupTable || !formData.lookupColumn || !formData.returnColumn) {
      setError('Please select a lookup table and configure all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(buildApiUrl('/apply-vlookup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookupTableId: selectedLookupTable.id,
          lookupColumn: formData.lookupColumn,
          returnColumn: formData.returnColumn,
          resultColumnName: formData.resultColumnName,
          exactMatch: formData.exactMatch,
          ifNotFound: formData.ifNotFound
        })
      })

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to apply VLOOKUP')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        VLOOKUP Formula
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lookup Table Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select Lookup Table
          </label>
          <select
            value={selectedLookupTable?.id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const table = lookupTables.find((t: any) => t.id === e.target.value)
              setSelectedLookupTable(table)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a lookup table...</option>
            {lookupTables.map((table: any) => (
              <option key={table.id} value={table.id}>
                {table.name} ({table.rows} rows, {table.columns} cols)
              </option>
            ))}
          </select>
        </div>

        {/* Result Column Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Result Column Name
          </label>
          <input
            type="text"
            value={formData.resultColumnName}
            onChange={(e) => setFormData({...formData, resultColumnName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter column name for results"
          />
        </div>

        {/* Lookup Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lookup Column (from main dataset)
          </label>
          <select
            value={formData.lookupColumn}
            onChange={(e) => setFormData({...formData, lookupColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select column to lookup...</option>
            {data?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Return Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Return Column (from lookup table)
          </label>
          <select
            value={formData.returnColumn}
            onChange={(e) => setFormData({...formData, returnColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedLookupTable}
          >
            <option value="">Select column to return...</option>
            {selectedLookupTable?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Exact Match Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Match Type
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.exactMatch}
                onChange={() => setFormData({...formData, exactMatch: true})}
                className="mr-2"
              />
              <span style={{ fontFamily: 'Inter, sans-serif' }}>Exact Match</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!formData.exactMatch}
                onChange={() => setFormData({...formData, exactMatch: false})}
                className="mr-2"
              />
              <span style={{ fontFamily: 'Inter, sans-serif' }}>Approximate Match</span>
            </label>
          </div>
        </div>

        {/* If Not Found Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            If Not Found Value
          </label>
          <input
            type="text"
            value={formData.ifNotFound}
            onChange={(e) => setFormData({...formData, ifNotFound: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Value to return if no match found"
          />
        </div>
      </div>

      {/* Formula Preview */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Formula Preview
        </label>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
          VLOOKUP({formData.lookupColumn || 'column'}, {selectedLookupTable?.name || 'lookup_table'}, {formData.returnColumn || 'return_column'}, {formData.exactMatch ? 'TRUE' : 'FALSE'})
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={!selectedLookupTable || !formData.lookupColumn || !formData.returnColumn}
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Apply VLOOKUP</span>
          </span>
        </button>
      </div>

      {/* Lookup Table Preview */}
      {selectedLookupTable && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lookup Table Preview: {selectedLookupTable.name}
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {selectedLookupTable.column_info?.map((col: any) => (
                    <th key={col.name} className="text-left p-2 font-medium">{col.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedLookupTable.preview?.slice(0, 5).map((row: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    {selectedLookupTable.column_info?.map((col: any) => (
                      <td key={col.name} className="p-2">{row[col.name] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// XLOOKUP Form Component
function XLOOKUPForm({ data, lookupTables, selectedLookupTable, setSelectedLookupTable, onApply, setLoading, setError }: any) {
  const [formData, setFormData] = useState({
    lookupColumn: '',
    returnColumn: '',
    resultColumnName: 'XLOOKUP_Result',
    searchMode: 'exact',
    ifNotFound: '',
    ifError: ''
  })

  const handleApply = async () => {
    if (!selectedLookupTable || !formData.lookupColumn || !formData.returnColumn) {
      setError('Please select a lookup table and configure all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(buildApiUrl('/apply-xlookup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookupTableId: selectedLookupTable.id,
          lookupColumn: formData.lookupColumn,
          returnColumn: formData.returnColumn,
          resultColumnName: formData.resultColumnName,
          searchMode: formData.searchMode,
          ifNotFound: formData.ifNotFound,
          ifError: formData.ifError
        })
      })

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to apply XLOOKUP')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        XLOOKUP Formula
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lookup Table Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select Lookup Table
          </label>
          <select
            value={selectedLookupTable?.id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const table = lookupTables.find((t: any) => t.id === e.target.value)
              setSelectedLookupTable(table)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a lookup table...</option>
            {lookupTables.map((table: any) => (
              <option key={table.id} value={table.id}>
                {table.name} ({table.rows} rows, {table.columns} cols)
              </option>
            ))}
          </select>
        </div>

        {/* Result Column Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Result Column Name
          </label>
          <input
            type="text"
            value={formData.resultColumnName}
            onChange={(e) => setFormData({...formData, resultColumnName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter column name for results"
          />
        </div>

        {/* Lookup Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Lookup Column (from main dataset)
          </label>
          <select
            value={formData.lookupColumn}
            onChange={(e) => setFormData({...formData, lookupColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select column to lookup...</option>
            {data?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Return Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Return Column (from lookup table)
          </label>
          <select
            value={formData.returnColumn}
            onChange={(e) => setFormData({...formData, returnColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedLookupTable}
          >
            <option value="">Select column to return...</option>
            {selectedLookupTable?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>

        {/* Search Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Search Mode
          </label>
          <select
            value={formData.searchMode}
            onChange={(e) => setFormData({...formData, searchMode: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="exact">Exact Match</option>
            <option value="exact_or_next">Exact or Next</option>
            <option value="exact_or_previous">Exact or Previous</option>
            <option value="wildcard">Wildcard Match</option>
          </select>
        </div>

        {/* If Not Found Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            If Not Found Value
          </label>
          <input
            type="text"
            value={formData.ifNotFound}
            onChange={(e) => setFormData({...formData, ifNotFound: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Value to return if no match found"
          />
        </div>

        {/* If Error Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            If Error Value
          </label>
          <input
            type="text"
            value={formData.ifError}
            onChange={(e) => setFormData({...formData, ifError: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Value to return if error occurs"
          />
        </div>
      </div>

      {/* Formula Preview */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Formula Preview
        </label>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
          XLOOKUP({formData.lookupColumn || 'column'}, {selectedLookupTable?.name || 'lookup_table'}, {formData.returnColumn || 'return_column'}, "{formData.ifNotFound || 'Not Found'}", {formData.searchMode})
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={!selectedLookupTable || !formData.lookupColumn || !formData.returnColumn}
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Apply XLOOKUP</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// DAX Form Component
function DAXForm({ data, lookupTables, selectedLookupTable, setSelectedLookupTable, onApply, setLoading, setError }: any) {
  const [formData, setFormData] = useState({
    resultColumnName: 'DAX_Result',
    filters: [{ column: '', value: '' }],
    returnColumn: ''
  })

  const addFilter = () => {
    setFormData({
      ...formData,
      filters: [...formData.filters, { column: '', value: '' }]
    })
  }

  const removeFilter = (index: number) => {
    setFormData({
      ...formData,
      filters: formData.filters.filter((_, i) => i !== index)
    })
  }

  const updateFilter = (index: number, field: 'column' | 'value', value: string) => {
    const newFilters = [...formData.filters]
    newFilters[index][field] = value
    setFormData({ ...formData, filters: newFilters })
  }

  const handleApply = async () => {
    if (!selectedLookupTable || !formData.returnColumn || formData.filters.some(f => !f.column || !f.value)) {
      setError('Please select a lookup table and configure all filter conditions')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(buildApiUrl('/apply-dax-lookup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookupTableId: selectedLookupTable.id,
          returnColumn: formData.returnColumn,
          resultColumnName: formData.resultColumnName,
          filters: formData.filters
        })
      })

      if (response.ok) {
        const result = await response.json()
        onApply(result)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to apply DAX LOOKUPVALUE')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        DAX LOOKUPVALUE Formula
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lookup Table Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select Lookup Table
          </label>
          <select
            value={selectedLookupTable?.id || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const table = lookupTables.find((t: any) => t.id === e.target.value)
              setSelectedLookupTable(table)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a lookup table...</option>
            {lookupTables.map((table: any) => (
              <option key={table.id} value={table.id}>
                {table.name} ({table.rows} rows, {table.columns} cols)
              </option>
            ))}
          </select>
        </div>

        {/* Result Column Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Result Column Name
          </label>
          <input
            type="text"
            value={formData.resultColumnName}
            onChange={(e) => setFormData({...formData, resultColumnName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter column name for results"
          />
        </div>

        {/* Return Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Return Column (from lookup table)
          </label>
          <select
            value={formData.returnColumn}
            onChange={(e) => setFormData({...formData, returnColumn: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedLookupTable}
          >
            <option value="">Select column to return...</option>
            {selectedLookupTable?.column_info?.map((col: any) => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Conditions */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            Filter Conditions
          </label>
          <button
            onClick={addFilter}
            className="btn-secondary btn-sm transition-all duration-200 hover:scale-105"
          >
            <span className="button_top flex items-center space-x-2">
              <span style={{ fontFamily: 'Inter, sans-serif' }}>+ Add Filter</span>
            </span>
          </button>
        </div>
        
        {formData.filters.map((filter, index) => (
          <div key={index} className="flex items-center space-x-4 mb-3">
            <select
              value={filter.column}
              onChange={(e) => updateFilter(index, 'column', e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select column...</option>
              {selectedLookupTable?.column_info?.map((col: any) => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={filter.value}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter value"
            />
            {formData.filters.length > 1 && (
              <button
                onClick={() => removeFilter(index)}
                className="p-3 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Formula Preview */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          Formula Preview
        </label>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
          LOOKUPVALUE({formData.returnColumn || 'return_column'}, {formData.filters.map(f => `${f.column || 'column'} = "${f.value || 'value'}"`).join(', ')})
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={!selectedLookupTable || !formData.returnColumn || formData.filters.some(f => !f.column || !f.value)}
          className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="button_top flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>Apply DAX LOOKUPVALUE</span>
          </span>
        </button>
      </div>
    </div>
  )
}

// Lookup Table Manager Component
function LookupTableManager({ lookupTables, setLookupTables, setSelectedLookupTable }: any) {
  const [uploading, setUploading] = useState(false)
  const [tableName, setTableName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = async () => {
    if (!selectedFile || !tableName.trim()) {
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('table_name', tableName)

    try {
      const response = await fetch(buildApiUrl('/upload-lookup-table'), {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newTable = await response.json()
        setLookupTables([...lookupTables, newTable])
        setTableName('')
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/delete-lookup-table/${tableId}`), {
        method: 'DELETE'
      })

      if (response.ok) {
        setLookupTables(lookupTables.filter((t: any) => t.id !== tableId))
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Upload Lookup Table
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a name for this lookup table"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              File Upload
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile || !tableName.trim() || uploading}
            className="btn-primary transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="button_top flex items-center space-x-2">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span style={{ fontFamily: 'Inter, sans-serif' }}>
                {uploading ? 'Uploading...' : 'Upload Table'}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Available Tables */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Available Lookup Tables
        </h3>
        
        {lookupTables.length === 0 ? (
          <p className="text-gray-600 text-center py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            No lookup tables uploaded yet. Upload your first table above.
          </p>
        ) : (
          <div className="space-y-4">
            {lookupTables.map((table: any) => (
              <div key={table.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {table.name}
                  </h4>
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {table.rows} rows, {table.columns} columns
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedLookupTable(table)}
                    className="btn-secondary btn-sm transition-all duration-200 hover:scale-105"
                  >
                    <span className="button_top flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>View</span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Results Preview Component
function ResultsPreview({ results }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow border border-blue-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Results Preview
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {results.column_info?.map((col: any) => (
                <th key={col.name} className="text-left p-2 font-medium">{col.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.preview?.slice(0, 10).map((row: any, idx: number) => (
              <tr key={idx} className="border-b">
                {results.column_info?.map((col: any) => (
                  <td key={col.name} className="p-2">{row[col.name] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
        Showing first 10 rows of {results.basic_info?.rows} total rows
      </div>
    </div>
  )
} 