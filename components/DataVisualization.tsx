'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, PieChart, TrendingUp, BarChart, Download, RefreshCw } from 'lucide-react'
import axios from 'axios'
import dynamic from 'next/dynamic'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
const HeatMap = dynamic(() => import('react-heatmap-grid'), { ssr: false })

// Chart Renderer Component
function ChartRenderer({ chartData }: { chartData: any }) {
  
  // Convert data to Chart.js format
  const convertToChartJS = () => {
    if (!chartData.data || chartData.data.length === 0) return null
    
    const data = chartData.data[0]
    
    // Handle different chart types
    if (data.type === 'bar') {
      // For bar charts (missing values, distribution, correlation)
      let labels: any[] = []
      let values: any[] = []
      
      if (data.x && data.y) {
        labels = Array.isArray(data.x) ? data.x : [data.x]
        values = Array.isArray(data.y) ? data.y : [data.y]
      }
      
      // Create different colors for each bar
      const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ]
      
      return {
        labels: labels.map((l: any) => String(l).substring(0, 15)),
        datasets: [{
          label: chartData.title || 'Data',
          data: values,
          backgroundColor: backgroundColors.slice(0, values.length),
          borderColor: backgroundColors.slice(0, values.length).map((color: string) => color.replace('0.8', '1')),
          borderWidth: 2
        }]
      }
    }
    
    if (data.type === 'pie') {
      // For pie charts (categorical distribution)
      let labels: any[] = []
      let values: any[] = []
      
      if (data.labels && data.values) {
        labels = Array.isArray(data.labels) ? data.labels : [data.labels]
        values = Array.isArray(data.values) ? data.values : [data.values]
      }
      
      // Create different colors for each slice
      const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)'
      ]
      
      return {
        labels: labels.map((l: any) => String(l).substring(0, 20)),
        datasets: [{
          label: chartData.title || 'Data',
          data: values,
          backgroundColor: backgroundColors.slice(0, values.length),
          borderColor: backgroundColors.slice(0, values.length).map((color: string) => color.replace('0.8', '1')),
          borderWidth: 2
        }]
      }
    }
    
    if (data.type === 'heatmap') {
      // For correlation matrix heatmaps
      if (data.x && data.y && data.z) {
        const labels = Array.isArray(data.x) ? data.x : [data.x]
        const correlationData = Array.isArray(data.z) ? data.z : [data.z]
        
        // Create a simplified bar chart representation of correlation strengths
        const avgCorrelations = correlationData.map((row: any, i: number) => {
          if (Array.isArray(row)) {
            return row.reduce((sum: number, val: number) => sum + Math.abs(val), 0) / row.length
          }
          return Math.abs(row)
        })
        
        const backgroundColors = avgCorrelations.map((corr: number) => {
          const intensity = Math.min(0.8, Math.max(0.2, corr))
          return `rgba(255, 99, 132, ${intensity})`
        })
        
        return {
          labels: labels.map((l: any) => String(l).substring(0, 15)),
          datasets: [{
            label: 'Average Correlation Strength',
            data: avgCorrelations,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((color: string) => color.replace(/[\d.]+\)$/, '1)')),
            borderWidth: 1
          }]
        }
      }
    }
    
    if (data.type === 'scatter') {
      // For scatter plots
      let xValues: any[] = []
      let yValues: any[] = []
      
      if (data.x && data.y) {
        xValues = Array.isArray(data.x) ? data.x : [data.x]
        yValues = Array.isArray(data.y) ? data.y : [data.y]
      }
      
              // Chart.js scatter expects [{x, y}, ...]
        const points = xValues.map((x: any, i: number) => ({ x, y: yValues[i] }))
      
      return {
        datasets: [{
          label: chartData.title || 'Data',
          data: points,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          showLine: false
        }]
      }
    }
    
    if (data.type === 'line') {
      // For line plots
      let xValues: any[] = []
      let yValues: any[] = []
      
      if (data.x && data.y) {
        xValues = Array.isArray(data.x) ? data.x : [data.x]
        yValues = Array.isArray(data.y) ? data.y : [data.y]
      }
      
              // Create labels for x-axis
        const labels = xValues.map((_: any, i: number) => `Point ${i+1}`)
      
      return {
        labels: labels,
        datasets: [{
          label: chartData.title || 'Data',
          data: yValues,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 3,
          fill: true,
          tension: 0.1
        }]
      }
    }
    
    // Fallback for unknown types
    return {
      labels: ['Data'],
      datasets: [{
        label: chartData.title || 'Data',
        data: [0],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    }
  }

  if (chartData.type === 'missing_heatmap') {
    const d = chartData.data[0]
    if (d.no_missing) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No missing values in the dataset.</p>
        </div>
      )
    }
    // Render a simple grid heatmap
    return (
      <div className="overflow-auto" style={{ maxHeight: 320 }}>
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-xs text-gray-700 px-1 py-0.5">Row \ Col</th>
              {d.x.map((col: string, i: number) => (
                <th key={i} className="text-xs text-gray-700 px-1 py-0.5">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.y.map((row: string, rowIdx: number) => (
              <tr key={rowIdx}>
                <td className="text-xs text-gray-700 px-1 py-0.5">{row}</td>
                {d.z[rowIdx].map((cell: number, colIdx: number) => (
                  <td
                    key={colIdx}
                    className="w-6 h-6"
                    style={{
                      background: cell === 1 ? '#f87171' : '#facc15',
                      border: '1px solid #eee',
                      textAlign: 'center',
                      fontSize: '10px',
                      color: cell === 1 ? '#fff' : '#222',
                    }}
                  >
                    {cell === 1 ? 'M' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  const chartJSData = convertToChartJS()
  
  if (!chartJSData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No chart data available</p>
      </div>
    )
  }
  
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartData.title || 'Chart'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
  
  return (
    <div className="w-full h-full">
      <div className="h-64 bg-white rounded-lg p-4 border">
        {chartData.data[0].type === 'pie' && (
          <div className="flex justify-center items-center w-full max-w-3xl mx-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <Pie data={chartJSData} options={{
              ...options,
              plugins: {
                ...options.plugins,
                legend: { display: true, position: 'right' }
              }
            } as any} height={420} />
          </div>
        )}
        {chartData.data[0].type === 'doughnut' && (
          <div className="flex justify-center items-center w-full max-w-3xl mx-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <Doughnut data={chartJSData} options={{
              ...options,
              cutout: '40%',
              plugins: {
                ...options.plugins,
                legend: { display: true, position: 'right' }
              }
            } as any} height={420} />
          </div>
        )}
        {/* Heatmap (Correlation Matrix) */}
        {chartData.data[0].type === 'heatmap' && Array.isArray(chartData.data[0].x) && Array.isArray(chartData.data[0].y) && Array.isArray(chartData.data[0].z) && chartData.data[0].z.length > 0 ? (
          <div className="flex justify-center items-center w-full overflow-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <HeatMap
              xLabels={chartData.data[0].x}
              yLabels={chartData.data[0].y}
              data={chartData.data[0].z}
              squares
              height={40}
              background="rgba(59,130,246,0.8)"
              cellStyle={(background, value, min, max, data, x, y) => ({
                fontSize: '12px',
                color: '#fff',
                fontWeight: 'bold'
              })}
              xLabelsStyle={{ color: '#222', fontWeight: 'bold' }}
              yLabelsStyle={{ color: '#222', fontWeight: 'bold' }}
            />
          </div>
        ) : chartData.data[0].type === 'heatmap' ? (
          <div className="flex items-center justify-center h-full text-gray-500">Heatmap data not available.</div>
        ) : null}
        {/* Scatter Chart */}
        {chartData.data[0].type === 'scatter' && (
          <div className="flex justify-center items-center w-full max-w-3xl mx-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <Scatter
              data={chartJSData}
              options={{
                ...options,
                scales: {
                  x: { type: 'linear' as const, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                  y: { type: 'linear' as const, beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } }
                }
              }}
              height={420}
            />
          </div>
        )}
        {/* Line Chart */}
        {chartData.data[0].type === 'line' && (
          <div className="flex justify-center items-center w-full max-w-3xl mx-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <Line
              data={chartJSData}
              options={options as any}
              height={420}
            />
          </div>
        )}
        {/* Bar/Other Charts */}
        {(chartData.data[0].type === 'bar' || chartData.data[0].type === 'histogram' || chartData.data[0].type === 'box' || chartData.data[0].type === 'missing' || chartData.data[0].type === 'correlation' || chartData.data[0].type === 'distribution') && (
          <div className="flex justify-center items-center w-full max-w-3xl mx-auto mb-12" style={{ minHeight: 400, maxHeight: 520 }}>
            <Bar data={chartJSData} options={options as any} height={420} />
          </div>
        )}
      </div>
    </div>
  )
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

interface DataVisualizationProps {
  data: any
  onDataUpdate?: () => void
  onChartGenerated?: (chart: { type: string, title: string, params?: any }) => void
}

export default function DataVisualization({ data, onDataUpdate, onChartGenerated }: DataVisualizationProps) {
  // Set activeChart to empty string initially
  const [activeChart, setActiveChart] = useState('');
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedColumn, setSelectedColumn] = useState('')
  const [xColumn, setXColumn] = useState('')
  const [yColumn, setYColumn] = useState('')
  // Removed saveFormat state since we're simplifying to just PNG and HTML buttons

  // Add state for info message visibility
  const [showInfo, setShowInfo] = useState(true);
  
  // Remove dropdown state and logic
  // const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showMoreGrid, setShowMoreGrid] = useState(false);

  // Add this state at the top of the component
  const [showGenInfo, setShowGenInfo] = useState(true);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // if (showMoreDropdown && !target.closest('.more-dropdown')) {
      //   setShowMoreDropdown(false);
      // }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreGrid]);

  // Only call generateChartData when a chart is selected
  useEffect(() => {
    if (data && activeChart) {
      generateChartData();
    }
  }, [data, activeChart]);

  // Set default X/Y columns for scatter/line when chart type changes
  useEffect(() => {
    if (!data || !data.columns_info) return;
    if (activeChart === 'scatter' || activeChart === 'line') {
      const colNames = data.columns_info.map((col: any) => col.name)
      if (colNames.includes('Units_Sold') && colNames.includes('Total_Sales')) {
        setXColumn('Units_Sold')
        setYColumn('Total_Sales')
      } else if (colNames.length >= 2) {
        setXColumn(colNames[0])
        setYColumn(colNames[1])
      }
    } else {
      setXColumn('')
      setYColumn('')
    }
    if (activeChart !== 'scatter' && activeChart !== 'line') {
      setSelectedColumn('')
    }
  }, [activeChart, data])

  // Optionally, auto-select the first valid column when a chart is selected
  useEffect(() => {
    if (!data || !data.columns_info) return;
    if (activeChart && !selectedColumn) {
      const firstValid = data.columns_info.find((col: any) => isColumnCompatible(col, activeChart));
      if (firstValid) setSelectedColumn(firstValid.name);
    }
  }, [activeChart, data]);

  useEffect(() => {
    if (data && data.columns_info) {
      // TEMP: Log columns_info for debugging column types
      console.log('columns_info:', data.columns_info);
    }
  }, [data]);

  const [errorMsg, setErrorMsg] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const generateChartData = async () => {
    if (!data) return

    setLoading(true)
    setChartData(null)
    setMessage('')
    setErrorMsg('')
    setShowNotification(false)
    // Randomize min spinner time: 400, 500, 600, or 1000 ms
    const spinnerTimes = [400, 500, 600, 1000];
    const minSpinnerTime = spinnerTimes[Math.floor(Math.random() * spinnerTimes.length)];
    const start = Date.now();
    
    try {
      let response
      let chartType = activeChart
      let chartTitle = ''
      let chartParams: any = {}
      
      switch (activeChart) {
        case 'missing':
          response = await axios.get(buildApiUrl('/visualize/missing'))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || 'Missing Values Heatmap',
              data: response.data.data
            })
            setMessage('✅ Missing values heatmap generated successfully')
            chartTitle = response.data.title || 'Missing Values Heatmap'
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'missing_heatmap':
          response = await axios.get(buildApiUrl('/visualize/missing_heatmap'))
          if (response.data.data) {
            setChartData({
              type: 'missing_heatmap',
              title: response.data.title || 'Missing Values Heatmap',
              data: response.data.data
            })
            setMessage('✅ Missing values heatmap generated successfully')
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'distribution':
          if (!selectedColumn) {
            throw new Error('Please select a column for distribution analysis')
          }
          response = await axios.get(buildApiUrl(`/visualize/distribution?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Distribution of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Distribution plot for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'correlation':
          response = await axios.get(buildApiUrl('/visualize/correlation'))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || 'Correlation Matrix',
              data: response.data.data
            })
            setMessage('✅ Correlation matrix generated successfully')
            chartTitle = response.data.title || 'Correlation Matrix'
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'scatter':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for scatter plot')
          }
          response = await axios.get(buildApiUrl(`/visualize/scatter?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `${yColumn} vs ${xColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Scatter plot for ${yColumn} vs ${xColumn} generated successfully`)
            chartTitle = response.data.title || `${yColumn} vs ${xColumn}`
            chartParams = { x: xColumn, y: yColumn }
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'line':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for line chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/line?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `${yColumn} vs ${xColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Line chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'bar':
          if (!selectedColumn) {
            throw new Error('Please select a column for bar chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/distribution?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Bar Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Bar chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'pie':
          if (!selectedColumn) {
            throw new Error('Please select a column for pie chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/categorical_distribution?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Pie Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Pie chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'box':
          if (!selectedColumn) {
            throw new Error('Please select a column for box plot')
          }
          response = await axios.get(buildApiUrl(`/visualize/numeric_distribution?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Box Plot of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Box plot for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        case 'histogram':
          if (!selectedColumn) {
            throw new Error('Please select a column for histogram')
          }
          response = await axios.get(buildApiUrl(`/visualize/numeric_distribution?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Histogram of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Histogram for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'violin':
          if (!selectedColumn) {
            throw new Error('Please select a column for violin plot')
          }
          response = await axios.get(buildApiUrl(`/visualize/violin?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Violin Plot of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Violin plot for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'heatmap':
          response = await axios.get(buildApiUrl('/visualize/heatmap'))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || 'Data Heatmap',
              data: response.data.data
            })
            setMessage('✅ Heatmap generated successfully')
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'bubble':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for bubble chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/bubble?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `${yColumn} vs ${xColumn} (Bubble)`,
              data: response.data.data
            })
            setMessage(`✅ Bubble chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'radar':
          if (!selectedColumn) {
            throw new Error('Please select a column for radar chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/radar?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Radar Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Radar chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'area':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for area chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/area?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `${yColumn} vs ${xColumn} (Area)`,
              data: response.data.data
            })
            setMessage(`✅ Area chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'doughnut':
          if (!selectedColumn) {
            throw new Error('Please select a column for doughnut chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/doughnut?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Doughnut Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Doughnut chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'polar':
          if (!selectedColumn) {
            throw new Error('Please select a column for polar area chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/polar?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Polar Area Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Polar area chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'stacked':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for stacked bar chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/stacked?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Stacked Bar Chart: ${yColumn} vs ${xColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Stacked bar chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'grouped':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for grouped bar chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/grouped?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Grouped Bar Chart: ${yColumn} vs ${xColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Grouped bar chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'candlestick':
          if (!xColumn || !yColumn) {
            throw new Error('Please select both X and Y columns for candlestick chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/candlestick?x_col=${xColumn}&y_col=${yColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Candlestick Chart: ${yColumn} vs ${xColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Candlestick chart for ${yColumn} vs ${xColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'funnel':
          if (!selectedColumn) {
            throw new Error('Please select a column for funnel chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/funnel?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Funnel Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Funnel chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'sankey':
          response = await axios.get(buildApiUrl('/visualize/sankey'))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || 'Sankey Diagram',
              data: response.data.data
            })
            setMessage('✅ Sankey diagram generated successfully')
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'treemap':
          if (!selectedColumn) {
            throw new Error('Please select a column for treemap')
          }
          response = await axios.get(buildApiUrl(`/visualize/treemap?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Treemap of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Treemap for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
          
        case 'sunburst':
          if (!selectedColumn) {
            throw new Error('Please select a column for sunburst chart')
          }
          response = await axios.get(buildApiUrl(`/visualize/sunburst?column=${selectedColumn}`))
          if (response.data.data) {
            setChartData({
              type: 'chartjs',
              title: response.data.title || `Sunburst Chart of ${selectedColumn}`,
              data: response.data.data
            })
            setMessage(`✅ Sunburst chart for ${selectedColumn} generated successfully`)
          } else {
            throw new Error('No chart data received')
          }
          break
        
        default:
          throw new Error(`Unknown chart type: ${activeChart}`)
      }
      // After successful chart generation, notify parent
      if (onChartGenerated && chartTitle) {
        onChartGenerated({ type: chartType, title: chartTitle, params: chartParams })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate chart';
      setChartData({
        type: 'error',
        message: errorMessage
      });
      setMessage(`❌ ${errorMessage}`);
      setErrorMsg(errorMessage);
      setShowNotification(true);
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(() => setShowNotification(false), 5000);
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < minSpinnerTime) {
        setTimeout(() => setLoading(false), minSpinnerTime - elapsed);
      } else {
        setLoading(false);
      }
    }
  }

  // Simplified save functions for PNG and HTML
  const saveAsPNG = () => {
    if (!chartData || chartData.type !== 'chartjs') return;
    try {
      // Try multiple selectors to find the chart canvas
      const chartCanvas = document.querySelector('canvas') || 
                         document.querySelector('.chart-container canvas') ||
                         document.querySelector('[data-testid="chart-canvas"]');
      
      if (chartCanvas) {
        // Create a temporary canvas with better quality
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        tempCanvas.width = chartCanvas.width * 2; // Higher resolution
        tempCanvas.height = chartCanvas.height * 2;
        
        if (ctx) {
          ctx.scale(2, 2); // Scale up for better quality
          ctx.drawImage(chartCanvas, 0, 0);
          
          const url = tempCanvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${chartData.title.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error('Chart canvas not found');
        alert('Chart canvas not found. Please try generating the chart again.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      alert('Error saving PNG. Please try again.');
    }
  };

  const saveAsHTML = () => {
    if (!chartData || chartData.type !== 'chartjs') return;
    try {
      // Detect chart type and build correct Chart.js config
      const data = chartData.data[0];
      let chartType = data.type || 'bar';
      let chartDataConfig = {};
      let chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
      };
      if (chartType === 'pie') {
        chartDataConfig = {
          labels: data.labels || [],
          datasets: [{
            label: chartData.title || 'Data',
            data: data.values || [],
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 2
          }]
        };
      } else if (chartType === 'bar') {
        chartDataConfig = {
          labels: data.x || [],
          datasets: [{
            label: chartData.title || 'Data',
            data: data.y || [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        };
      } else if (chartType === 'line') {
        chartDataConfig = {
          labels: data.x || [],
          datasets: [{
            label: chartData.title || 'Data',
            data: data.y || [],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.1
          }]
        };
      } else if (chartType === 'scatter') {
        chartDataConfig = {
          datasets: [{
            label: chartData.title || 'Data',
            data: (data.x || []).map((x: any, i: number) => ({ x, y: (data.y || [])[i] })),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            showLine: false
          }]
        };
        chartOptions.scales = {
          x: { type: 'linear', beginAtZero: true },
          y: { type: 'linear', beginAtZero: true }
        };
      } else {
        // fallback
        chartDataConfig = {
          labels: data.x || [],
          datasets: [{
            label: chartData.title || 'Data',
            data: data.y || [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        };
      }
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${chartData.title}</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
          <div style="width: 800px; height: 600px; margin: 50px auto;">
            <canvas id="chart"></canvas>
          </div>
          <script>
            try {
              const ctx = document.getElementById('chart').getContext('2d');
              new Chart(ctx, {
                type: '${chartType}',
                data: ${JSON.stringify(chartDataConfig)},
                options: ${JSON.stringify(chartOptions)}
              });
            } catch (e) {
              document.body.innerHTML += '<div style="color:red;text-align:center;margin-top:2em;">Failed to render chart: ' + e + '</div>';
            }
          </script>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartData.title.replace(/\s+/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  };

  const exportData = async () => {
    if (!data) return
    
    try {
      const response = await axios.get(buildApiUrl('/export-data'))
      const csvContent = response.data.csv_data
      const filename = response.data.filename
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
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

  // Chart types with dropdown for additional charts
  const basicChartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart },
    { id: 'pie', label: 'Pie Chart', icon: PieChart },
    { id: 'scatter', label: 'Scatter Plot', icon: BarChart },
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
    { id: 'histogram', label: 'Histogram', icon: BarChart },
  ];
  
  const advancedChartTypes = [
    { id: 'missing', label: 'Missing Values (Bar)', icon: BarChart3 },
    { id: 'missing_heatmap', label: 'Missing Values Heatmap', icon: BarChart3 },
    { id: 'distribution', label: 'Distribution Plot', icon: TrendingUp },
    { id: 'correlation', label: 'Correlation Matrix (Heatmap)', icon: BarChart },
  ];
  
  const additionalChartTypes = [
    { id: 'box', label: 'Box Plot', icon: BarChart },
    { id: 'violin', label: 'Violin Plot', icon: TrendingUp },
    { id: 'heatmap', label: 'Heatmap', icon: BarChart3 },
    { id: 'bubble', label: 'Bubble Chart', icon: BarChart },
    { id: 'radar', label: 'Radar Chart', icon: TrendingUp },
    { id: 'area', label: 'Area Chart', icon: BarChart },
    { id: 'doughnut', label: 'Doughnut Chart', icon: PieChart },
    { id: 'polar', label: 'Polar Area Chart', icon: TrendingUp },
    { id: 'stacked', label: 'Stacked Bar Chart', icon: BarChart },
    { id: 'grouped', label: 'Grouped Bar Chart', icon: BarChart3 },
    { id: 'candlestick', label: 'Candlestick Chart', icon: TrendingUp },
    { id: 'funnel', label: 'Funnel Chart', icon: BarChart },
    { id: 'sankey', label: 'Sankey Diagram', icon: TrendingUp },
    { id: 'treemap', label: 'Treemap', icon: BarChart3 },
    { id: 'sunburst', label: 'Sunburst Chart', icon: TrendingUp },
  ];

  // Helper function to determine if a column is valid for the current chart type
  function isColumnCompatible(col: any, chartType: string): boolean {
    if (!col) return false;
    if (["box", "violin", "histogram", "line", "scatter", "area", "stacked", "grouped", "candlestick", "bubble"].includes(chartType)) {
      return col.dtype === "float64";
    }
    if (["pie", "doughnut", "polar", "funnel", "treemap", "sunburst"].includes(chartType)) {
      return col.dtype === "object";
    }
    // Default: allow all
    return true;
  }

  return (
    <div className="space-y-6">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="loader"></div>
        </div>
      )}
      {/* Error Notification (side) */}
      {showNotification && errorMsg && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 10000 }}>
          <div className="info">
            <div className="info__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#fff" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
            </div>
            <div className="info__title">{errorMsg}</div>
            <div className="info__close" onClick={() => setShowNotification(false)}><svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#fff"></path></svg></div>
          </div>
        </div>
      )}
      {/* Heading and subtitle */}
      <div className="card text-center py-8 mb-4">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Data Visualization</h2>
        <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Explore your data visually. Select a chart type, configure options, and generate beautiful, exportable charts.</p>
      </div>
      {/* Chart Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Select Chart Type</h3>
        {/* Chart type selection grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
          {[...basicChartTypes, ...advancedChartTypes].map((chart) => {
            const Icon = chart.icon;
            return (
              <button
                key={chart.id}
                onClick={() => {
                  setActiveChart(chart.id);
                  setShowMoreGrid(false);
                }}
                className={`flex flex-col items-center justify-center border rounded-xl p-4 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-blue-400 ${activeChart === chart.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon className={`h-8 w-8 mb-2 ${activeChart === chart.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-center leading-tight">{chart.label}</span>
              </button>
            );
          })}
          {/* More Charts Button */}
          <button
            type="button"
            onClick={() => setShowMoreGrid((v) => !v)}
            className={`flex flex-col items-center justify-center border rounded-xl p-4 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-blue-400 ${showMoreGrid ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="flex justify-center w-full mb-2">
              <TrendingUp className={`h-8 w-8 ${showMoreGrid ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <span className="text-sm font-medium text-center leading-tight w-full">More</span>
          </button>
        </div>
        {/* Expandable More Charts Grid */}
        {showMoreGrid && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 animate-fade-in">
            {additionalChartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`flex flex-col items-center justify-center border rounded-xl p-4 transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-blue-400 ${activeChart === chart.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon className={`h-8 w-8 mb-2 ${activeChart === chart.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-center leading-tight">{chart.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* Chart Options and Actions */}
      {activeChart && (
        <div className="card mt-2">
          {/* Chart Description */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {basicChartTypes.find((c: any) => c.id === activeChart)?.label || advancedChartTypes.find((c: any) => c.id === activeChart)?.label}
            </h3>
            <p className="text-sm text-blue-700">
              {activeChart === 'missing' && 'Visualize missing data patterns as a bar chart'}
              {activeChart === 'missing_heatmap' && 'Visualize missing data as a heatmap (rows: records, columns: features)'}
              {activeChart === 'distribution' && 'Show distribution of values in a selected column (histogram for numeric, bar for categorical)'}
              {activeChart === 'bar' && 'Create bar chart for categorical or aggregated numeric data'}
              {activeChart === 'pie' && 'Show proportions of categorical data'}
              {activeChart === 'correlation' && 'Display correlation matrix heatmap for numeric columns'}
              {activeChart === 'scatter' && 'Plot relationship between two numeric columns'}
              {activeChart === 'line' && 'Visualize trends over a sequence (usually time)'}
              {activeChart === 'box' && 'Display quartiles, median, and outliers for numeric data'}
              {activeChart === 'histogram' && 'Show frequency distribution of numeric data'}
              {activeChart === 'violin' && 'Show distribution shape and density with violin plots'}
              {activeChart === 'heatmap' && 'Display data as a color-coded matrix for pattern recognition'}
              {activeChart === 'bubble' && 'Show three dimensions of data with bubble size and position'}
              {activeChart === 'radar' && 'Display multivariate data on a circular plot'}
              {activeChart === 'area' && 'Show cumulative data with filled areas under lines'}
              {activeChart === 'doughnut' && 'Show proportions with a ring-shaped chart'}
              {activeChart === 'polar' && 'Display data on a circular coordinate system'}
              {activeChart === 'stacked' && 'Show multiple data series stacked on top of each other'}
              {activeChart === 'grouped' && 'Display multiple data series side by side'}
              {activeChart === 'candlestick' && 'Show financial data with open, high, low, close values'}
              {activeChart === 'funnel' && 'Display stages in a process with decreasing values'}
              {activeChart === 'sankey' && 'Show flow between different categories or stages'}
              {activeChart === 'treemap' && 'Display hierarchical data in nested rectangles'}
              {activeChart === 'sunburst' && 'Show hierarchical data in concentric circles'}
            </p>
          </div>
          {/* Column Selection */}
          {activeChart !== 'missing' && activeChart !== 'correlation' && activeChart !== 'heatmap' && activeChart !== 'sankey' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {(activeChart === 'scatter' || activeChart === 'line' || activeChart === 'bubble' || activeChart === 'area' || activeChart === 'stacked' || activeChart === 'grouped' || activeChart === 'candlestick') ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select X-axis column</label>
                    <select 
                      value={xColumn} 
                      onChange={(e) => setXColumn(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose X-axis column...</option>
                      {data.columns_info?.map((col: any) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Y-axis column</label>
                    <select 
                      value={yColumn} 
                      onChange={(e) => setYColumn(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose Y-axis column...</option>
                      {data.columns_info?.map((col: any) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <span className="text-xs text-blue-600">Recommended: X = Units_Sold, Y = Total_Sales</span>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select column</label>
                  <select 
                    value={selectedColumn} 
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose column...</option>
                    {data.columns_info?.map((col: any) => (
                      <option 
                        key={col.name} 
                        value={col.name} 
                        disabled={!isColumnCompatible(col, activeChart)}
                        style={!isColumnCompatible(col, activeChart) ? { color: '#bbb' } : {}}
                        title={!isColumnCompatible(col, activeChart) ? (col.type === 'numeric' ? 'Requires numeric column' : 'Requires categorical column') : ''}
                      >
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {/* Generate Button */}
          <div className="flex justify-end">
                          <button
                onClick={generateChartData}
                disabled={loading || (activeChart !== 'missing' && activeChart !== 'correlation' && activeChart !== 'heatmap' && activeChart !== 'sankey' && 
                  ((activeChart === 'scatter' || activeChart === 'line' || activeChart === 'bubble' || activeChart === 'area' || activeChart === 'stacked' || activeChart === 'grouped' || activeChart === 'candlestick') ? (!xColumn || !yColumn) : !selectedColumn))}
                className="btn-primary"
              >
              <span className="button_top flex items-center justify-center">
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating Chart...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Generate Chart
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      )}
      {/* Chart Display */}
      {activeChart && chartData ? (
        <div className="card mt-2">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{chartData.title}</h3>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl" style={{ minHeight: 420, maxHeight: 520 }}>
              {/* Show info message if no chart data available */}
              {chartData && chartData.type !== 'error' && !chartData.data?.length && showInfo && (
                <div className="info">
                  <div className="info__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#fff" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
                  </div>
                  <div className="info__title">No chart data available for the selected column. Try a different column or chart type.</div>
                  <div className="info__close" onClick={() => setShowInfo(false)}>
                    <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#fff"></path></svg>
                  </div>
                </div>
              )}
              <ChartRenderer chartData={chartData} />
            </div>
            {/* Chart Actions */}
            <div className="flex flex-row gap-4 justify-center mt-6">
              <button className="btn-secondary" onClick={saveAsPNG}>
                <span className="button_top flex items-center"><Download className="h-4 w-4 mr-2" />Download PNG</span>
              </button>
              <button className="btn-secondary" onClick={saveAsHTML}>
                <span className="button_top flex items-center"><Download className="h-4 w-4 mr-2" />Download HTML</span>
              </button>
              <button className="btn-secondary" onClick={exportData}>
                <span className="button_top flex items-center"><Download className="h-4 w-4 mr-2" />Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* Empty State */}
      {!activeChart && (
        <div className="card flex flex-col items-center justify-center py-16">
          <BarChart3 className="h-20 w-20 mb-4 text-blue-200" />
          <div className="text-lg text-gray-400">Select a chart type to begin visualizing your data.</div>
        </div>
      )}
      {/* Show info cue above Generate Chart button if chart type is selected but not yet generated */}
      {activeChart && !chartData && showGenInfo && (
        <div className="info" style={{ marginBottom: 16 }}>
          <div className="info__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#fff" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
          </div>
          <div className="info__title">Select options and click Generate Chart to view your visualization.</div>
          <div className="info__close" onClick={() => setShowGenInfo(false)}>
            <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" fill="#fff"></path></svg>
          </div>
        </div>
      )}
    </div>
  );
} 