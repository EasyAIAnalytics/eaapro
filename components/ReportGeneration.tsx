'use client'

import { useState } from 'react'
import { FileText, Download, Settings, Eye, RefreshCw } from 'lucide-react'
import axios from 'axios'
import DownloadButton from './DownloadButton';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

interface ReportGenerationProps {
  data: any
  availableCharts: Array<{ type: string, title: string, params?: any }>
}

export default function ReportGeneration({ data, availableCharts }: ReportGenerationProps) {
  const [reportTitle, setReportTitle] = useState('Sales Analysis Report')
  const [companyName, setCompanyName] = useState('Your Company')
  const [selectedCharts, setSelectedCharts] = useState<any[]>([])
  const [includeDataSummary, setIncludeDataSummary] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggleChart = (chartObj: any) => {
    setSelectedCharts(prev =>
      prev.some(c => c.title === chartObj.title && c.type === chartObj.type)
        ? prev.filter(c => !(c.title === chartObj.title && c.type === chartObj.type))
        : [...prev, chartObj]
    )
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', reportTitle)
      formData.append('company', companyName)
      formData.append('charts', JSON.stringify(selectedCharts))
      
      const response = await axios.post(buildApiUrl('/generate-report'), formData)
      
      if (response.data.pdf_base64) {
        // Convert base64 to blob and download
        const pdfBlob = new Blob(
          [Uint8Array.from(atob(response.data.pdf_base64), c => c.charCodeAt(0))],
          { type: 'application/pdf' }
        )
        
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        setMessage('✅ Report generated and downloaded successfully!')
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      setMessage('❌ Error generating report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Loaded</h3>
        <p className="text-gray-600">Please upload data or load sample data first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Report Configuration */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter report title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter company name"
            />
          </div>
        </div>
      </div>

      {/* Report Content Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Report Content</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <label className="switch">
              <input
                type="checkbox"
                id="includeSummary"
                checked={includeDataSummary}
                onChange={(e) => setIncludeDataSummary(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <label htmlFor="includeSummary" className="ml-2 text-sm text-gray-700">
              Include Data Summary
            </label>
          </div>
          <div className="flex items-center">
            <label className="switch">
              <input
                type="checkbox"
                id="includeCharts"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-700">
              Include Charts and Visualizations
            </label>
          </div>
        </div>
      </div>

      {/* Chart Selection */}
      {includeCharts && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Select Charts to Include</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableCharts.map((chart) => (
              <div key={chart.title + chart.type} className="flex items-center">
                <label className="switch">
                  <input
                    type="checkbox"
                    id={chart.title + chart.type}
                    checked={selectedCharts.some(c => c.title === chart.title && c.type === chart.type)}
                    onChange={() => toggleChart(chart)}
                  />
                  <span className="slider"></span>
                </label>
                <label htmlFor={chart.title + chart.type} className="ml-2 text-sm text-gray-700">
                  {chart.title}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <button className="btn-secondary btn-sm">
            <span className="button_top flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </span>
          </button>
        </div>
        
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{reportTitle}</h1>
            <p className="text-gray-600">{companyName}</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          
          {includeDataSummary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Data Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Total Rows</p>
                  <p className="text-xl font-bold">{data.rows}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Total Columns</p>
                  <p className="text-xl font-bold">{data.columns}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-xl font-bold">{data.file_size}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Missing Values</p>
                  <p className="text-xl font-bold">{data.missing_values}</p>
                </div>
              </div>
            </div>
          )}
          
          {includeCharts && selectedCharts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Charts and Visualizations</h2>
              <div className="space-y-3">
                {selectedCharts.map((chart) => (
                  <div key={chart.title + chart.type} className="bg-white rounded p-3 border">
                    <p className="font-medium">{chart.title}</p>
                    <p className="text-sm text-gray-600">Chart placeholder</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Report */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Generate Report</h3>
            <p className="text-sm text-gray-600">
              Create a professional PDF report with your selected content
            </p>
          </div>
          {/* Replace old button with DownloadButton */}
          <DownloadButton
            onClick={generateReport}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )
} 