import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMousePointer,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiClock,
  FiAward,
  FiStar,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiMapPin,
  FiLink,
  FiRefreshCw
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    clicks: [],
    conversions: [],
    earnings: [],
    traffic: [],
    devices: [],
    locations: [],
    topProducts: [],
    hourly: []
  });
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalEarnings: 0,
    averageCommission: 0,
    bounceRate: 0,
    avgTimeOnSite: 0
  });
  const [comparison, setComparison] = useState({
    clicks: 0,
    conversions: 0,
    earnings: 0,
    rate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/analytics`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setAnalyticsData(response.data.analytics);
        setStats(response.data.stats);
        setComparison(response.data.comparison);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/analytics/export`,
        {
          params: { format, timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart Colors
  const CHART_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
  const PIE_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d', '#343a40'];

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, change, format = 'number' }) => {
    const formattedValue = format === 'currency' ? formatCurrency(value) :
                          format === 'percentage' ? formatPercentage(value) :
                          formatNumber(value);
    
    return (
      <div className="stat-card">
        <div className="stat-icon">
          <Icon />
        </div>
        <div className="stat-content">
          <h3>{title}</h3>
          <p className="stat-value">{formattedValue}</p>
          {change !== undefined && (
            <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
              {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {Math.abs(change)}% vs previous period
            </p>
          )}
        </div>
      </div>
    );
  };

  // Styles
  const styles = `
    .analytics-page {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left h1 {
      margin: 0 0 10px;
      font-size: 32px;
      color: #333;
    }

    .header-left p {
      margin: 0;
      color: #666;
    }

    .header-right {
      display: flex;
      gap: 10px;
    }

    .time-range-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    .export-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      transition: all 0.3s ease;
    }

    .export-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .refresh-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      transition: all 0.3s ease;
    }

    .refresh-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 5px;
      font-size: 14px;
      color: #666;
    }

    .stat-value {
      margin: 0 0 5px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-change {
      margin: 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .stat-change.positive {
      color: #28a745;
    }

    .stat-change.negative {
      color: #dc3545;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .chart-header span {
      font-size: 14px;
      color: #999;
    }

    .chart-container {
      height: 300px;
    }

    /* Performance Summary */
    .performance-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-card h3 {
      margin: 0 0 15px;
      font-size: 16px;
      color: #333;
    }

    .metric-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      color: #666;
      font-size: 14px;
    }

    .metric-value {
      font-weight: 600;
      color: #333;
    }

    .metric-trend {
      font-size: 12px;
      margin-left: 5px;
    }

    .metric-trend.positive {
      color: #28a745;
    }

    .metric-trend.negative {
      color: #dc3545;
    }

    /* Traffic Sources */
    .traffic-sources {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .source-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .source-name {
      width: 100px;
      color: #666;
      font-size: 14px;
    }

    .source-bar {
      flex: 1;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .source-progress {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
    }

    .source-value {
      width: 60px;
      color: #333;
      font-weight: 600;
      font-size: 14px;
      text-align: right;
    }

    /* Devices */
    .devices-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      text-align: center;
    }

    .device-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .device-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .device-name {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .device-value {
      font-weight: 600;
      color: #333;
    }

    /* Locations */
    .locations-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 300px;
      overflow-y: auto;
    }

    .location-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }

    .location-item:hover {
      background: #f8f9fa;
    }

    .location-flag {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
    }

    .location-name {
      flex: 1;
      color: #666;
    }

    .location-value {
      font-weight: 600;
      color: #333;
    }

    .location-bar {
      width: 60px;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
    }

    .location-progress {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
    }

    /* Top Products */
    .products-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }

    .product-item:hover {
      background: #f8f9fa;
    }

    .product-rank {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .product-stats {
      font-size: 12px;
      color: #999;
    }

    .product-earnings {
      font-weight: 600;
      color: #28a745;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stat-card,
      .chart-card,
      .summary-card,
      .device-item {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p,
      .chart-header span,
      .metric-label,
      .source-name,
      .device-name,
      .location-name {
        color: #e2e8f0;
      }

      .stat-value,
      .metric-value,
      .source-value,
      .device-value,
      .location-value,
      .product-name {
        color: #f7fafc;
      }

      .time-range-select,
      .export-btn,
      .refresh-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .device-item {
        background: #1a202c;
      }

      .location-item:hover,
      .product-item:hover {
        background: #1a202c;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .charts-row {
        grid-template-columns: 1fr;
      }

      .performance-summary {
        grid-template-columns: 1fr;
      }

      .devices-grid {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-right {
        width: 100%;
        flex-wrap: wrap;
      }

      .time-range-select,
      .export-btn,
      .refresh-btn {
        flex: 1;
      }

      .chart-container {
        height: 250px;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="analytics-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Analytics Dashboard</h1>
            <p>Track your performance and insights</p>
          </div>
          <div className="header-right">
            <select
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="export-btn" onClick={() => handleExportData('csv')}>
              <FiDownload /> Export
            </button>
            <button className="refresh-btn" onClick={fetchAnalytics}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard icon={FiMousePointer} title="Total Clicks" value={stats.totalClicks} change={comparison.clicks} />
          <StatsCard icon={FiUsers} title="Unique Visitors" value={stats.uniqueVisitors} change={comparison.visitors} />
          <StatsCard icon={FiTrendingUp} title="Conversions" value={stats.totalConversions} change={comparison.conversions} />
          <StatsCard icon={FiDollarSign} title="Earnings" value={stats.totalEarnings} format="currency" change={comparison.earnings} />
          <StatsCard icon={FiBarChart2} title="Conversion Rate" value={stats.conversionRate} format="percentage" change={comparison.rate} />
          <StatsCard icon={FiClock} title="Avg. Time on Site" value={stats.avgTimeOnSite} format="time" />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Clicks Over Time */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Clicks Over Time</h3>
              <span>Total: {formatNumber(stats.totalClicks)}</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.clicks}>
                  <defs>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Area type="monotone" dataKey="clicks" stroke="#667eea" strokeWidth={2} fill="url(#clicksGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversions vs Earnings */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Conversions & Earnings</h3>
              <span>Rate: {formatPercentage(stats.conversionRate)}</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData.conversions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="#999" />
                  <YAxis yAxisId="left" stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" stroke="#999" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="conversions" fill="#28a745" />
                  <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#667eea" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="performance-summary">
          {/* Hourly Performance */}
          <div className="summary-card">
            <h3>Hourly Performance</h3>
            <div className="chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="hour" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#667eea" />
                  <Bar dataKey="conversions" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="summary-card">
            <h3>Traffic Sources</h3>
            <div className="traffic-sources">
              {analyticsData.traffic.map((source, index) => (
                <div key={index} className="source-item">
                  <span className="source-name">{source.name}</span>
                  <div className="source-bar">
                    <div className="source-progress" style={{ width: `${source.percentage}%` }}></div>
                  </div>
                  <span className="source-value">{source.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="summary-card">
            <h3>Device Breakdown</h3>
            <div className="devices-grid">
              {analyticsData.devices.map((device, index) => (
                <div key={index} className="device-item">
                  <div className="device-icon">
                    {device.name === 'Desktop' && <FiMonitor />}
                    {device.name === 'Mobile' && <FiSmartphone />}
                    {device.name === 'Tablet' && <FiTablet />}
                  </div>
                  <div className="device-name">{device.name}</div>
                  <div className="device-value">{device.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Locations & Top Products */}
        <div className="performance-summary">
          {/* Top Locations */}
          <div className="summary-card">
            <h3>Top Locations</h3>
            <div className="locations-list">
              {analyticsData.locations.map((location, index) => (
                <div key={index} className="location-item">
                  <div className="location-flag">
                    {location.country.charAt(0)}
                  </div>
                  <span className="location-name">{location.country}</span>
                  <div className="location-bar">
                    <div className="location-progress" style={{ width: `${location.percentage}%` }}></div>
                  </div>
                  <span className="location-value">{location.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="summary-card">
            <h3>Top Performing Products</h3>
            <div className="products-list">
              {analyticsData.topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <p className="product-stats">
                      {product.clicks} clicks • {product.conversions} conversions
                    </p>
                  </div>
                  <div className="product-earnings">
                    {formatCurrency(product.earnings)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="summary-card">
            <h3>Quick Metrics</h3>
            <div className="metric-list">
              <div className="metric-item">
                <span className="metric-label">Bounce Rate</span>
                <span className="metric-value">
                  {formatPercentage(stats.bounceRate)}
                  <span className={`metric-trend ${comparison.bounceRate <= 0 ? 'positive' : 'negative'}`}>
                    {comparison.bounceRate <= 0 ? '↓' : '↑'} {Math.abs(comparison.bounceRate)}%
                  </span>
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg. Time on Site</span>
                <span className="metric-value">{stats.avgTimeOnSite}s</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Pages per Session</span>
                <span className="metric-value">{stats.pagesPerSession || 'N/A'}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Returning Visitors</span>
                <span className="metric-value">{formatPercentage(stats.returningVisitors)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg. Commission</span>
                <span className="metric-value">{formatCurrency(stats.averageCommission)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
