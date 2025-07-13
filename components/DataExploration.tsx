'use client'

import { useState } from 'react'
import { BarChart3, Filter, Settings, RefreshCw } from 'lucide-react'
import axios from 'axios'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

interface DataExplorationProps {
  data: any
  onDataUpdate?: () => void
}

export default function DataExploration({ data, onDataUpdate }: DataExplorationProps) {
  const [activeSection, setActiveSection] = useState('columns')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleDataCleaning = async (method: string, fillValue?: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('method', method)
      if (fillValue) formData.append('fill_value', fillValue)
      
      const response = await axios.post(buildApiUrl('/clean-data'), formData)
      setMessage(`✅ ${response.data.message}`)
      
      // Update data via callback
      if (onDataUpdate) {
        onDataUpdate()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`)
      } else {
        setMessage(`❌ Error: ${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOutlierDetection = async (column: string, method: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('column', column)
      formData.append('method', method)
      
      const response = await axios.post(buildApiUrl('/detect-outliers'), formData)
      setMessage(`🔍 Found ${response.data.outlier_count} outliers in ${column} using ${method}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`)
      } else {
        setMessage(`❌ Error: ${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveOutliers = async (column: string, method: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('column', column)
      formData.append('method', method)
      
      const response = await axios.post(buildApiUrl('/remove-outliers'), formData)
      setMessage(`✅ ${response.data.message}`)
      
      // Update data via callback
      if (onDataUpdate) {
        onDataUpdate()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`)
      } else {
        setMessage(`❌ Error: ${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTypeConversion = async (column: string, targetType: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const formData = new FormData()
      formData.append('column', column)
      formData.append('target_type', targetType)
      
      const response = await axios.post(buildApiUrl('/convert-type'), formData)
      setMessage(`✅ ${response.data.message}`)
      
      // Update data via callback
      if (onDataUpdate) {
        onDataUpdate()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`❌ Error: ${error.message}`)
      } else {
        setMessage(`❌ Error: ${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Loaded</h3>
        <p className="text-gray-600">Please upload data or load sample data first.</p>
      </div>
    )
  }

  const numericColumns = data.columns_info?.filter((col: any) => 
    col.dtype === 'int64' || col.dtype === 'float64'
  ).map((col: any) => col.name) || []

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('columns')}
          className={`${activeSection === 'columns' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span className="button_top">Column Analysis</span>
        </button>
        <button
          onClick={() => setActiveSection('cleaning')}
          className={`${activeSection === 'cleaning' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span className="button_top">Data Cleaning</span>
        </button>
        <button
          onClick={() => setActiveSection('outliers')}
          className={`${activeSection === 'outliers' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <span className="button_top">Outlier Detection</span>
        </button>
      </div>

      {/* Column Analysis */}
      {activeSection === 'columns' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Column Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.columns_info?.map((column: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{column.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{column.dtype}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Missing:</span>
                    <span className="font-medium">{column.missing_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique:</span>
                    <span className="font-medium">{column.unique_count}</span>
                  </div>
                  {column.dtype === 'object' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Top Value:</span>
                      <span className="font-medium">{column.top_value}</span>
                    </div>
                  )}
                  {(column.dtype === 'int64' || column.dtype === 'float64') && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mean:</span>
                        <span className="font-medium">{column.mean?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Std:</span>
                        <span className="font-medium">{column.std?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Cleaning */}
      {activeSection === 'cleaning' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Data Cleaning</h2>
          <div className="space-y-6">
            {/* Missing Values */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Handle Missing Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleDataCleaning('drop')}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Drop Rows'}
                  </span>
                </button>
                <button 
                  onClick={() => handleDataCleaning('mean')}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Fill Mean'}
                  </span>
                </button>
                <button 
                  onClick={() => handleDataCleaning('median')}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Fill Median'}
                  </span>
                </button>
                <button 
                  onClick={() => handleDataCleaning('mode')}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Fill Mode'}
                  </span>
                </button>
                <button 
                  onClick={() => handleDataCleaning('zero')}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Fill Zero'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Data Type Conversion */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Data Type Conversion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Column
                  </label>
                  <select 
                    id="convertColumn"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {data.columns_info?.map((col: any) => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Convert To
                  </label>
                  <select 
                    id="targetType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="string">String</option>
                    <option value="numeric">Numeric</option>
                    <option value="datetime">DateTime</option>
                    <option value="categorical">Categorical</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => {
                  const column = (document.getElementById('convertColumn') as HTMLSelectElement).value
                  const targetType = (document.getElementById('targetType') as HTMLSelectElement).value
                  handleTypeConversion(column, targetType)
                }}
                disabled={loading}
                className="btn-primary mt-4"
              >
                <span className="button_top flex items-center justify-center">
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Convert Data Type
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outlier Detection */}
      {activeSection === 'outliers' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Outlier Detection</h2>
          <div className="space-y-6">
            {/* Column Selection */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Select Column for Analysis</h3>
              <select 
                id="outlierColumn"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
              >
                {numericColumns.map((col: string) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              
              <h4 className="font-medium text-gray-900 mb-2">Detection Methods</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <button 
                  onClick={() => {
                    const column = (document.getElementById('outlierColumn') as HTMLSelectElement).value
                    handleOutlierDetection(column, 'zscore')
                  }}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Z-Score Method'}
                  </span>
                </button>
                <button 
                  onClick={() => {
                    const column = (document.getElementById('outlierColumn') as HTMLSelectElement).value
                    handleOutlierDetection(column, 'iqr')
                  }}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'IQR Method'}
                  </span>
                </button>
                <button 
                  onClick={() => {
                    const column = (document.getElementById('outlierColumn') as HTMLSelectElement).value
                    handleOutlierDetection(column, 'isolation_forest')
                  }}
                  disabled={loading}
                  className="btn-secondary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Isolation Forest'}
                  </span>
                </button>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">Outlier Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    const column = (document.getElementById('outlierColumn') as HTMLSelectElement).value
                    handleRemoveOutliers(column, 'zscore')
                  }}
                  disabled={loading}
                  className="btn-primary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Remove Outliers'}
                  </span>
                </button>
                <button 
                  onClick={() => {
                    const column = (document.getElementById('outlierColumn') as HTMLSelectElement).value
                    handleRemoveOutliers(column, 'iqr')
                  }}
                  disabled={loading}
                  className="btn-primary btn-sm"
                >
                  <span className="button_top flex items-center justify-center">
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Remove Outliers (IQR)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 