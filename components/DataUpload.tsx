'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Database, Eye, TrendingUp, Shield } from 'lucide-react'
import axios from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

interface DataUploadProps {
  onDataLoaded: (data: any) => void
  setLoading: (loading: boolean) => void
}

export default function DataUpload({ onDataLoaded, setLoading }: DataUploadProps) {
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(buildApiUrl('/upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const data = {
        rows: response.data.basic_info.rows,
        columns: response.data.basic_info.columns,
        file_size: response.data.basic_info.file_size,
        missing_values: response.data.basic_info.missing_values,
        columns_info: response.data.column_info,
        preview: response.data.preview
      }
      
      setUploadedData(data)
      onDataLoaded(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(buildApiUrl('/sample-data'))
      const data = {
        rows: response.data.basic_info.rows,
        columns: response.data.basic_info.columns,
        file_size: response.data.basic_info.file_size,
        missing_values: response.data.basic_info.missing_values,
        columns_info: response.data.column_info,
        preview: response.data.preview
      }
      setUploadedData(data)
      onDataLoaded(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to load sample data:', error)
      alert('Failed to load sample data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(buildApiUrl('/saved-data'))
      setUploadedData(response.data)
      onDataLoaded(response.data)
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to load saved data:', error)
      alert('Failed to load saved data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Data Upload</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-blue-50">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Upload Your File</h3>
            <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>CSV or Excel files supported</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary btn-sm"
            >
              <span className="button_top" style={{ fontFamily: 'Inter, sans-serif' }}>Choose File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Sample Data */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-green-50">
            <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Load Sample Data</h3>
            <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Test with pre-loaded datasets</p>
            <button onClick={loadSampleData} className="btn-secondary btn-sm">
              <span className="button_top" style={{ fontFamily: 'Inter, sans-serif' }}>Load Sample</span>
            </button>
          </div>

          {/* Saved Data */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-purple-50">
            <Database className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Load Saved Data</h3>
            <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Access your previous datasets</p>
            <button onClick={loadSavedData} className="btn-secondary btn-sm">
              <span className="button_top" style={{ fontFamily: 'Inter, sans-serif' }}>Load Saved</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      {uploadedData && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Data Preview</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary btn-sm"
            >
              <span className="button_top flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span style={{ fontFamily: 'Inter, sans-serif' }}>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </span>
            </button>
          </div>

          {/* Data Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Rows</p>
              <p className="text-3xl font-bold text-blue-800" style={{ fontFamily: 'Rubik, sans-serif' }}>{uploadedData.rows}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Columns</p>
              <p className="text-3xl font-bold text-green-800" style={{ fontFamily: 'Rubik, sans-serif' }}>{uploadedData.columns}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <p className="text-sm text-purple-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>File Size</p>
              <p className="text-3xl font-bold text-purple-800" style={{ fontFamily: 'Rubik, sans-serif' }}>{uploadedData.file_size}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <p className="text-sm text-orange-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Missing Values</p>
              <p className="text-3xl font-bold text-orange-800" style={{ fontFamily: 'Rubik, sans-serif' }}>{uploadedData.missing_values}</p>
            </div>
          </div>

          {/* Data Table Preview */}
          {showPreview && (
            <div className="overflow-x-auto rounded-xl border border-gray-200 mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {uploadedData.columns_info?.map((col: any, index: number) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedData.preview?.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((cell: any, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          style={{ fontFamily: 'Roboto Mono, monospace' }}
                        >
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Feature Cards always visible below stats and preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/70 rounded-xl p-4 shadow border border-blue-100 flex flex-col items-center">
              <Upload className="w-7 h-7 text-blue-500 mb-2" />
              <h3 className="text-base font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Smart Upload</h3>
              <p className="text-gray-600 text-xs text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Drag & drop your data files and let our platform handle the rest</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow border border-green-100 flex flex-col items-center">
              <Database className="w-7 h-7 text-green-500 mb-2" />
              <h3 className="text-base font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Sample Data</h3>
              <p className="text-gray-600 text-xs text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Test the platform with our pre-loaded sample datasets</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow border border-purple-100 flex flex-col items-center">
              <TrendingUp className="w-7 h-7 text-purple-500 mb-2" />
              <h3 className="text-base font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Visual Insights</h3>
              <p className="text-gray-600 text-xs text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Beautiful charts and graphs that tell your data's story</p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow border border-orange-100 flex flex-col items-center">
              <Shield className="w-7 h-7 text-orange-500 mb-2" />
              <h3 className="text-base font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Secure & Fast</h3>
              <p className="text-gray-600 text-xs text-center" style={{ fontFamily: 'Inter, sans-serif' }}>Enterprise-grade security with lightning-fast processing</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 