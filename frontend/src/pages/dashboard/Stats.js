import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiMousePointer,
  FiShoppingCart,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiAward,
  FiStar,
  FiTarget,
  FiZap,
  FiGift,
  FiCreditCard
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

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    overview: {
      totalEarnings: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalCommission: 0,
      averageCommission: 0,
      conversionRate: 0,
      clickThroughRate: 0,
      earningsPerClick: 0,
      roi: 0
    },
    timeBased: {
      hourly: [],
      daily: [],
      weekly: [],
      monthly: []
    },
    performance: {
      bestDay: { date: null, earnings: 0, clicks: 0, conversions: 0 },
      worstDay: { date: null, earnings: 0, clicks: 0, conversions: 0 },
      peakHours: [],
      trends: {
        earnings: 0,
        clicks: 0,
        conversions: 0
      }
    },
    breakdown: {
      bySource: [],
      byDevice: [],
      byCountry: [],
      byCategory: [],
      byProduct: []
    },
    comparisons: {
      previousPeriod: {
        earnings: 0,
        clicks: 0,
        conversions: 0,
        rate: 0
      },
      targets: {
        earnings: 0,
        clicks: 0,
        conversions: 0,
        achieved: 0
      }
    }
  });
  const [chartType, setChartType] = useState('line'); // line, bar, area, composed
  const [selectedMetric, setSelectedMetric] = useState('earnings');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('value');

  useEffect(() => {
    fetchStats();
  }, [timeRange, dateRange, filterSource]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/stats`,
        {
          params: {
            timeRange,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            source: filterSource
          }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    toast.success('Statistics refreshed');
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/stats/export`,
        {
          params: {
            format,
            timeRange,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistics-${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Statistics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export statistics');
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
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatCompact = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'earnings':
        return <FiDollarSign />;
      case 'clicks':
        return <FiMousePointer />;
      case 'conversions':
        return <FiShoppingCart />;
      case 'rate':
        return <FiTarget />;
      default:
        return <FiActivity />;
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'earnings':
        return '#28a745';
      case 'clicks':
        return '#667eea';
      case 'conversions':
        return '#ffc107';
      case 'rate':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, change, subtitle, color = 'primary' }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{showValues ? value : '••••••'}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Metric Card Component
  const MetricCard = ({ label, value, target, achieved, icon: Icon }) => {
    const percentage = target > 0 ? (achieved / target) * 100 : 0;
    
    return (
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-label">{label}</span>
          {Icon && <Icon className="metric-icon" />}
        </div>
        <div className="metric-value">{value}</div>
        <div className="metric-target">Target: {target}</div>
        <div className="metric-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="progress-percentage">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  // Breakdown Item Component
  const BreakdownItem = ({ item, index, total }) => {
    const percentage = (item.value / total) * 100;
    
    return (
      <div className="breakdown-item">
        <div className="breakdown-rank" style={{ backgroundColor: item.color }}>
          {index + 1}
        </div>
        <div className="breakdown-info">
          <span className="breakdown-label">{item.label}</span>
          <span className="breakdown-value">{formatCompact(item.value)}</span>
        </div>
        <div className="breakdown-bar">
          <div className="bar-fill" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
        </div>
        <span className="breakdown-percent">{percentage.toFixed(1)}%</span>
      </div>
    );
  };

  // Chart Colors
  const CHART_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

  // Styles
  const styles = `
    .stats-page {
      padding: 20px;
    }

    /* Header */
    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: var(--text-primary);
    }

    .header-left p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .header-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .time-range-select {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      cursor: pointer;
    }

    .date-range-input {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
    }

    .action-btn {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .action-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .value-toggle {
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .value-toggle:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all var(--transition-base) var(--transition-ease);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-primary .stat-icon {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    }

    .stat-success .stat-icon {
      background: linear-gradient(135deg, var(--success) 0%, #20c997 100%);
    }

    .stat-warning .stat-icon {
      background: linear-gradient(135deg, var(--warning) 0%, #fd7e14 100%);
    }

    .stat-info .stat-icon {
      background: linear-gradient(135deg, var(--info) 0%, #0dcaf0 100%);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 4px;
      font-size: 14px;
      color: var(--text-secondary);
      font-weight: var(--font-normal);
    }

    .stat-value {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    .stat-subtitle {
      margin: 0;
      font-size: 12px;
      color: var(--text-disabled);
    }

    .stat-change {
      margin: 4px 0 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .stat-change.positive {
      color: var(--success);
    }

    .stat-change.negative {
      color: var(--danger);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: var(--bg-primary);
      border-radius: var(--radius-md);
      padding: 16px;
      border: 1px solid var(--border);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .metric-icon {
      color: var(--text-disabled);
    }

    .metric-value {
      font-size: 20px;
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .metric-target {
      font-size: 11px;
      color: var(--text-disabled);
      margin-bottom: 8px;
    }

    .metric-progress {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    .progress-percentage {
      font-size: 11px;
      font-weight: var(--font-semibold);
      color: var(--primary);
    }

    /* Chart Controls */
    .chart-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .chart-type-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .chart-type-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .metric-select {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      cursor: pointer;
    }

    .comparison-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      cursor: pointer;
    }

    .comparison-toggle input {
      margin: 0;
    }

    /* Chart Card */
    .chart-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 20px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .chart-legend {
      display: flex;
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .chart-container {
      height: 400px;
    }

    /* Best/Worst Cards */
    .best-worst-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .day-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 16px;
    }

    .day-card.best {
      border-left: 4px solid var(--success);
    }

    .day-card.worst {
      border-left: 4px solid var(--danger);
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .day-icon {
      font-size: 20px;
    }

    .day-icon.best {
      color: var(--success);
    }

    .day-icon.worst {
      color: var(--danger);
    }

    .day-title {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .day-date {
      font-size: 12px;
      color: var(--text-disabled);
      margin-left: auto;
    }

    .day-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .day-stat {
      text-align: center;
    }

    .day-stat-label {
      font-size: 11px;
      color: var(--text-disabled);
      margin-bottom: 2px;
    }

    .day-stat-value {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .day-stat-value.earnings {
      color: var(--success);
    }

    /* Breakdown Grid */
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .breakdown-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .breakdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .breakdown-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .breakdown-sort {
      padding: 4px 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 12px;
    }

    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .breakdown-rank {
      width: 22px;
      height: 22px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: var(--font-semibold);
      color: white;
    }

    .breakdown-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .breakdown-label {
      font-size: 13px;
      color: var(--text-primary);
    }

    .breakdown-value {
      font-size: 12px;
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .breakdown-bar {
      flex: 2;
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .breakdown-percent {
      min-width: 45px;
      font-size: 11px;
      color: var(--text-disabled);
      text-align: right;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--primary);
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
      .metric-card,
      .chart-card,
      .day-card,
      .breakdown-card {
        background: var(--dark-bg-secondary);
      }

      .stat-content h3 {
        color: var(--dark-text-muted);
      }

      .stat-value {
        color: var(--dark-text-primary);
      }

      .metric-label {
        color: var(--dark-text-muted);
      }

      .metric-value {
        color: var(--dark-text-primary);
      }

      .day-stat-label {
        color: var(--dark-text-muted);
      }

      .day-stat-value {
        color: var(--dark-text-primary);
      }

      .breakdown-label {
        color: var(--dark-text-primary);
      }

      .breakdown-value {
        color: var(--dark-text-primary);
      }

      .time-range-select,
      .date-range-input,
      .action-btn,
      .value-toggle,
      .chart-type-btn,
      .metric-select {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .action-btn:hover {
        background: var(--dark-bg-secondary);
      }

      .chart-type-btn.active {
        background: var(--dark-primary);
        color: white;
      }

      .breakdown-sort {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .breakdown-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .best-worst-grid {
        grid-template-columns: 1fr;
      }

      .stats-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-direction: column;
      }

      .time-range-select,
      .date-range-input,
      .action-btn,
      .value-toggle {
        width: 100%;
      }

      .chart-controls {
        flex-direction: column;
      }

      .chart-type-btn,
      .metric-select {
        width: 100%;
      }

      .chart-container {
        height: 300px;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="stats-page">
        {/* Header */}
        <div className="stats-header">
          <div className="header-left">
            <h1>Advanced Statistics</h1>
            <p>Deep dive into your performance metrics.</p>
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
              <option value="custom">Custom Range</option>
            </select>
            
            {timeRange === 'custom' && (
              <>
                <input
                  type="date"
                  className="date-range-input"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <input
                  type="date"
                  className="date-range-input"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </>
            )}

            <button className="value-toggle" onClick={() => setShowValues(!showValues)}>
              {showValues ? <FiEyeOff /> : <FiEye />}
            </button>
            <button className="action-btn" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="action-btn" onClick={() => handleExportData('csv')}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats.overview.totalEarnings)}
            icon={FiDollarSign}
            change={stats.performance.trends.earnings}
            color="success"
          />
          <StatCard
            title="Total Clicks"
            value={formatNumber(stats.overview.totalClicks)}
            icon={FiMousePointer}
            change={stats.performance.trends.clicks}
            color="primary"
          />
          <StatCard
            title="Total Conversions"
            value={formatNumber(stats.overview.totalConversions)}
            icon={FiShoppingCart}
            change={stats.performance.trends.conversions}
            color="warning"
          />
          <StatCard
            title="Conversion Rate"
            value={formatPercentage(stats.overview.conversionRate)}
            icon={FiTarget}
            subtitle={`CTR: ${formatPercentage(stats.overview.clickThroughRate)}`}
            color="info"
          />
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            label="Avg. Commission"
            value={formatCurrency(stats.overview.averageCommission)}
            target={50}
            achieved={stats.overview.averageCommission}
            icon={FiTrendingUp}
          />
          <MetricCard
            label="EPC"
            value={formatCurrency(stats.overview.earningsPerClick)}
            target={2}
            achieved={stats.overview.earningsPerClick}
            icon={FiZap}
          />
          <MetricCard
            label="ROI"
            value={formatPercentage(stats.overview.roi)}
            target={100}
            achieved={stats.overview.roi * 100}
            icon={FiGift}
          />
          <MetricCard
            label="Target Achievement"
            value={formatPercentage(stats.comparisons.targets.achieved / 100)}
            target={stats.comparisons.targets.earnings}
            achieved={stats.overview.totalEarnings}
            icon={FiAward}
          />
        </div>

        {/* Chart Controls */}
        <div className="chart-controls">
          <button
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
          <button
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
          <button
            className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
          <button
            className={`chart-type-btn ${chartType === 'composed' ? 'active' : ''}`}
            onClick={() => setChartType('composed')}
          >
            Composed
          </button>

          <select
            className="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="earnings">Earnings</option>
            <option value="clicks">Clicks</option>
            <option value="conversions">Conversions</option>
            <option value="rate">Conversion Rate</option>
          </select>

          <label className="comparison-toggle">
            <input
              type="checkbox"
              checked={comparisonEnabled}
              onChange={(e) => setComparisonEnabled(e.target.checked)}
            />
            Compare with previous period
          </label>
        </div>

        {/* Performance Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Performance Over Time</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-color" style={{ backgroundColor: getMetricColor(selectedMetric) }} />
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              </span>
              {comparisonEnabled && (
                <span className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#6c757d' }} />
                  Previous Period
                </span>
              )}
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' && (
                <LineChart data={stats.timeBased.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={getMetricColor(selectedMetric)}
                    strokeWidth={2}
                    dot={false}
                  />
                  {comparisonEnabled && (
                    <Line
                      type="monotone"
                      dataKey={`prev${selectedMetric}`}
                      stroke="#6c757d"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              )}
              {chartType === 'bar' && (
                <BarChart data={stats.timeBased.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey={selectedMetric} fill={getMetricColor(selectedMetric)} />
                  {comparisonEnabled && (
                    <Bar dataKey={`prev${selectedMetric}`} fill="#6c757d" />
                  )}
                </BarChart>
              )}
              {chartType === 'area' && (
                <AreaChart data={stats.timeBased.daily}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={getMetricColor(selectedMetric)}
                    fill="url(#colorMetric)"
                  />
                </AreaChart>
              )}
              {chartType === 'composed' && (
                <ComposedChart data={stats.timeBased.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#667eea" />
                  <Line type="monotone" dataKey="earnings" stroke="#28a745" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#ffc107" strokeWidth={2} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best & Worst Days */}
        <div className="best-worst-grid">
          <div className="day-card best">
            <div className="day-header">
              <FiTrendingUp className="day-icon best" />
              <span className="day-title">Best Performing Day</span>
              <span className="day-date">{stats.performance.bestDay.date}</span>
            </div>
            <div className="day-stats">
              <div className="day-stat">
                <div className="day-stat-label">Earnings</div>
                <div className="day-stat-value earnings">{formatCurrency(stats.performance.bestDay.earnings)}</div>
              </div>
              <div className="day-stat">
                <div className="day-stat-label">Clicks</div>
                <div className="day-stat-value">{formatNumber(stats.performance.bestDay.clicks)}</div>
              </div>
              <div className="day-stat">
                <div className="day-stat-label">Conversions</div>
                <div className="day-stat-value">{formatNumber(stats.performance.bestDay.conversions)}</div>
              </div>
            </div>
          </div>

          <div className="day-card worst">
            <div className="day-header">
              <FiTrendingDown className="day-icon worst" />
              <span className="day-title">Worst Performing Day</span>
              <span className="day-date">{stats.performance.worstDay.date}</span>
            </div>
            <div className="day-stats">
              <div className="day-stat">
                <div className="day-stat-label">Earnings</div>
                <div className="day-stat-value">{formatCurrency(stats.performance.worstDay.earnings)}</div>
              </div>
              <div className="day-stat">
                <div className="day-stat-label">Clicks</div>
                <div className="day-stat-value">{formatNumber(stats.performance.worstDay.clicks)}</div>
              </div>
              <div className="day-stat">
                <div className="day-stat-label">Conversions</div>
                <div className="day-stat-value">{formatNumber(stats.performance.worstDay.conversions)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdowns */}
        <div className="breakdown-grid">
          {/* By Source */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Traffic Sources</h3>
              <select
                className="breakdown-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="value">By Value</option>
                <option value="label">By Name</option>
              </select>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.bySource
                .sort((a, b) => sortBy === 'value' ? b.value - a.value : a.label.localeCompare(b.label))
                .map((item, index) => (
                  <BreakdownItem
                    key={item.label}
                    item={item}
                    index={index}
                    total={stats.breakdown.bySource.reduce((sum, i) => sum + i.value, 0)}
                  />
                ))}
            </div>
          </div>

          {/* By Device */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Device Breakdown</h3>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.byDevice
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <BreakdownItem
                    key={item.label}
                    item={item}
                    index={index}
                    total={stats.breakdown.byDevice.reduce((sum, i) => sum + i.value, 0)}
                  />
                ))}
            </div>
          </div>

          {/* By Country */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Geographic Distribution</h3>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.byCountry
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
                .map((item, index) => (
                  <BreakdownItem
                    key={item.label}
                    item={item}
                    index={index}
                    total={stats.breakdown.byCountry.reduce((sum, i) => sum + i.value, 0)}
                  />
                ))}
            </div>
          </div>

          {/* By Category */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Category Performance</h3>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.byCategory
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <BreakdownItem
                    key={item.label}
                    item={item}
                    index={index}
                    total={stats.breakdown.byCategory.reduce((sum, i) => sum + i.value, 0)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stats;
