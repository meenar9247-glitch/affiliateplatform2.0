import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiMousePointer,
  FiShoppingCart,
  FiClock,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
  FiBarChart2,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import AreaChart from './AreaChart';

const DashboardChart = ({
  type = 'line', // line, bar, pie, area, metric, kpi
  data = [],
  title,
  subtitle,
  period = 'month',
  comparison = true,
  showControls = true,
  showExport = true,
  showRefresh = true,
  showFullscreen = true,
  size = 'medium', // small, medium, large
  theme = 'light',
  onPeriodChange,
  onRefresh,
  onExport,
  className = '',
  ...props
}) => {
  const [chartType, setChartType] = useState(type);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  // Size classes
  const sizeClasses = {
    small: 'dashboard-chart-small',
    medium: 'dashboard-chart-medium',
    large: 'dashboard-chart-large'
  };

  // Period options
  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' }
  ];

  // Chart type options
  const chartTypes = [
    { value: 'line', label: 'Line', icon: FiActivity },
    { value: 'bar', label: 'Bar', icon: FiBarChart2 },
    { value: 'pie', label: 'Pie', icon: FiPieChart },
    { value: 'area', label: 'Area', icon: FiTrendingUp }
  ];

  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
    onPeriodChange?.(newPeriod);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
    onRefresh?.();
  };

  const handleExport = (format) => {
    onExport?.(format);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      width: '100%',
      height: isFullscreen ? 600 : size === 'small' ? 200 : size === 'large' ? 400 : 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      showZoom: false,
      showDownload: false,
      showRefresh: false,
      showFullscreen: false,
      animate: true,
      animationDuration: 1000,
      ...props
    };

    switch (chartType) {
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'pie':
        return <PieChart {...chartProps} />;
      case 'area':
        return <AreaChart {...chartProps} />;
      default:
        return <LineChart {...chartProps} />;
    }
  };

  // KPI Card Component
  const KPICard = ({ title, value, change, icon: Icon, color }) => (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">
        <Icon />
      </div>
      <div className="kpi-content">
        <h4 className="kpi-title">{title}</h4>
        <div className="kpi-value">{value}</div>
        {change !== undefined && (
          <div className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>{Math.abs(change)}% vs previous period</span>
          </div>
        )}
      </div>
    </div>
  );

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, trend }) => (
    <div className="metric-card">
      <div className="metric-header">
        <h4 className="metric-title">{title}</h4>
        {trend !== undefined && (
          <span className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );

  // Styles
  const styles = `
    .dashboard-chart {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 16px;
      transition: all var(--transition-base) var(--transition-ease);
    }

    .dashboard-chart.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: var(--z-modal);
      background: var(--bg-primary);
      padding: 24px;
      overflow-y: auto;
    }

    /* Size Variants */
    .dashboard-chart-small {
      max-width: 300px;
    }

    .dashboard-chart-medium {
      max-width: 500px;
    }

    .dashboard-chart-large {
      max-width: 800px;
    }

    /* Header */
    .dashboard-chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .dashboard-chart-title-section {
      flex: 1;
      min-width: 200px;
    }

    .dashboard-chart-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .dashboard-chart-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .dashboard-chart-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .chart-type-selector {
      display: flex;
      gap: 4px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: 4px;
    }

    .chart-type-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .chart-type-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .chart-type-btn.active {
      background: var(--primary);
      color: white;
    }

    .period-selector {
      position: relative;
    }

    .period-select {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--text-sm);
      cursor: pointer;
      outline: none;
    }

    .period-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .chart-control-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .chart-control-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .chart-control-btn:active {
      transform: scale(0.95);
    }

    /* Chart Container */
    .dashboard-chart-container {
      position: relative;
      min-height: ${size === 'small' ? '200px' : size === 'large' ? '400px' : '300px'};
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-primary {
      border-left: 4px solid var(--primary);
    }

    .kpi-success {
      border-left: 4px solid var(--success);
    }

    .kpi-warning {
      border-left: 4px solid var(--warning);
    }

    .kpi-danger {
      border-left: 4px solid var(--danger);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .kpi-primary .kpi-icon {
      color: var(--primary);
    }

    .kpi-success .kpi-icon {
      color: var(--success);
    }

    .kpi-warning .kpi-icon {
      color: var(--warning);
    }

    .kpi-danger .kpi-icon {
      color: var(--danger);
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-title {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .kpi-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-xs);
    }

    .kpi-change.positive {
      color: var(--success);
    }

    .kpi-change.negative {
      color: var(--danger);
    }

    /* Metric Cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .metric-card {
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      padding: 12px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .metric-card:hover {
      background: var(--bg-tertiary);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-title {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin: 0;
    }

    .metric-trend {
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
    }

    .metric-trend.positive {
      color: var(--success);
    }

    .metric-trend.negative {
      color: var(--danger);
    }

    .metric-value {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .metric-subtitle {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    /* Loading Overlay */
    .dashboard-chart-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      border-radius: var(--radius-lg);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Export Dropdown */
    .export-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      min-width: 120px;
      margin-top: 4px;
    }

    .export-option {
      padding: 8px 16px;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--text-primary);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .export-option:hover {
      background: var(--bg-tertiary);
    }

    /* Comparison Toggle */
    .comparison-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      cursor: pointer;
    }

    .comparison-toggle input {
      width: auto;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .dashboard-chart {
        background: var(--dark-bg-secondary);
      }

      .dashboard-chart-title {
        color: var(--dark-text-primary);
      }

      .dashboard-chart-subtitle {
        color: var(--dark-text-muted);
      }

      .period-select {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .chart-control-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .chart-control-btn:hover {
        background: var(--dark-primary);
        color: white;
      }

      .kpi-card {
        background: linear-gradient(135deg, var(--dark-bg-secondary) 0%, var(--dark-bg-tertiary) 100%);
      }

      .kpi-title {
        color: var(--dark-text-muted);
      }

      .kpi-value {
        color: var(--dark-text-primary);
      }

      .metric-card {
        background: var(--dark-bg-tertiary);
      }

      .metric-card:hover {
        background: var(--dark-bg-secondary);
      }

      .metric-title {
        color: var(--dark-text-muted);
      }

      .metric-value {
        color: var(--dark-text-primary);
      }

      .dashboard-chart-loading {
        background: rgba(0, 0, 0, 0.8);
      }

      .export-dropdown {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .export-option {
        color: var(--dark-text-primary);
      }

      .export-option:hover {
        background: var(--dark-bg-tertiary);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-chart-header {
        flex-direction: column;
      }

      .dashboard-chart-controls {
        width: 100%;
        justify-content: space-between;
      }

      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  // Sample data for different chart types
  const sampleLineData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 59 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 56 },
    { label: 'Jun', value: 55 }
  ];

  const sampleBarData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 5 },
    { label: 'Fri', value: 2 },
    { label: 'Sat', value: 3 }
  ];

  const samplePieData = [
    { label: 'Desktop', value: 45 },
    { label: 'Mobile', value: 35 },
    { label: 'Tablet', value: 20 }
  ];

  const sampleAreaData = [
    { label: 'Week 1', value: 30 },
    { label: 'Week 2', value: 45 },
    { label: 'Week 3', value: 38 },
    { label: 'Week 4', value: 52 }
  ];

  const sampleKPIData = [
    { title: 'Revenue', value: '$45,231', change: 12.5, icon: FiDollarSign, color: 'primary' },
    { title: 'Users', value: '23,456', change: 8.2, icon: FiUsers, color: 'success' },
    { title: 'Clicks', value: '12,345', change: -2.4, icon: FiMousePointer, color: 'warning' },
    { title: 'Conversions', value: '4,567', change: 15.3, icon: FiShoppingCart, color: 'danger' }
  ];

  const sampleMetricData = [
    { title: 'Avg. Time', value: '2m 34s', trend: 5.2 },
    { title: 'Bounce Rate', value: '42%', trend: -3.1 },
    { title: 'Pages/Session', value: '3.2', trend: 0.8 },
    { title: 'New Users', value: '1,234', trend: 18.5 }
  ];

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          dashboard-chart
          ${sizeClasses[size]}
          ${isFullscreen ? 'fullscreen' : ''}
          ${className}
        `}
      >
        {/* Header */}
        <div className="dashboard-chart-header">
          <div className="dashboard-chart-title-section">
            {title && <h3 className="dashboard-chart-title">{title}</h3>}
            {subtitle && <p className="dashboard-chart-subtitle">{subtitle}</p>}
          </div>

          {showControls && (
            <div className="dashboard-chart-controls">
              {/* Chart Type Selector */}
              {type === 'auto' && (
                <div className="chart-type-selector">
                  {chartTypes.map(t => (
                    <button
                      key={t.value}
                      className={`chart-type-btn ${chartType === t.value ? 'active' : ''}`}
                      onClick={() => setChartType(t.value)}
                      title={t.label}
                    >
                      <t.icon size={14} />
                    </button>
                  ))}
                </div>
              )}

              {/* Period Selector */}
              <div className="period-selector">
                <select
                  className="period-select"
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comparison Toggle */}
              {comparison && (
                <label className="comparison-toggle">
                  <input type="checkbox" /> Compare
                </label>
              )}

              {/* Control Buttons */}
              {showRefresh && (
                <button className="chart-control-btn" onClick={handleRefresh} title="Refresh">
                  <FiRefreshCw size={14} />
                </button>
              )}

              {showExport && (
                <div style={{ position: 'relative' }}>
                  <button className="chart-control-btn" title="Export">
                    <FiDownload size={14} />
                  </button>
                </div>
              )}

              {showFullscreen && (
                <button className="chart-control-btn" onClick={handleFullscreen} title="Fullscreen">
                  {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
                </button>
              )}
            </div>
          )}
        </div>

        {/* KPI Cards */}
        {type === 'kpi' && (
          <div className="kpi-grid">
            {sampleKPIData.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>
        )}

        {/* Metric Cards */}
        {type === 'metric' && (
          <div className="metrics-grid">
            {sampleMetricData.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        )}

        {/* Chart Container */}
        <div className="dashboard-chart-container">
          {loading && (
            <div className="dashboard-chart-loading">
              <div className="loading-spinner" />
            </div>
          )}

          {type === 'line' && <LineChart data={sampleLineData} series={[{ key: 'value', name: 'Value' }]} />}
          {type === 'bar' && <BarChart data={sampleBarData} series={[{ key: 'value', name: 'Value' }]} />}
          {type === 'pie' && <PieChart data={samplePieData} />}
          {type === 'area' && <AreaChart data={sampleAreaData} series={[{ key: 'value', name: 'Value' }]} />}
          {type === 'auto' && renderChart()}
          {type === 'kpi' && renderChart()}
          {type === 'metric' && renderChart()}
          {!['line', 'bar', 'pie', 'area', 'auto', 'kpi', 'metric'].includes(type) && renderChart()}
        </div>
      </div>
    </>
  );
};

// Revenue Chart Component
export const RevenueChart = ({ data, ...props }) => {
  const defaultData = data || [
    { label: 'Jan', revenue: 45000 },
    { label: 'Feb', revenue: 52000 },
    { label: 'Mar', revenue: 48000 },
    { label: 'Apr', revenue: 61000 },
    { label: 'May', revenue: 58000 },
    { label: 'Jun', revenue: 67000 }
  ];

  return (
    <DashboardChart
      title="Revenue Overview"
      subtitle="Monthly revenue trends"
      type="line"
      data={defaultData}
      series={[{ key: 'revenue', name: 'Revenue' }]}
      colors={['#28a745']}
      {...props}
    />
  );
};

// Traffic Chart Component
export const TrafficChart = ({ data, ...props }) => {
  const defaultData = data || [
    { label: 'Mon', visits: 1200 },
    { label: 'Tue', visits: 1900 },
    { label: 'Wed', visits: 2300 },
    { label: 'Thu', visits: 1800 },
    { label: 'Fri', visits: 2100 },
    { label: 'Sat', visits: 1600 },
    { label: 'Sun', visits: 1100 }
  ];

  return (
    <DashboardChart
      title="Website Traffic"
      subtitle="Daily visitor statistics"
      type="area"
      data={defaultData}
      series={[{ key: 'visits', name: 'Visits' }]}
      colors={['#667eea']}
      {...props}
    />
  );
};

// Conversion Chart Component
export const ConversionChart = ({ data, ...props }) => {
  const defaultData = data || [
    { label: 'Jan', rate: 2.3 },
    { label: 'Feb', rate: 2.8 },
    { label: 'Mar', rate: 3.2 },
    { label: 'Apr', rate: 2.9 },
    { label: 'May', rate: 3.5 },
    { label: 'Jun', rate: 3.8 }
  ];

  return (
    <DashboardChart
      title="Conversion Rate"
      subtitle="Percentage of visitors converting"
      type="line"
      data={defaultData}
      series={[{ key: 'rate', name: 'Rate %' }]}
      colors={['#ffc107']}
      {...props}
    />
  );
};

// Sales Chart Component
export const SalesChart = ({ data, ...props }) => {
  const defaultData = data || [
    { label: 'Product A', sales: 45 },
    { label: 'Product B', sales: 78 },
    { label: 'Product C', sales: 33 },
    { label: 'Product D', sales: 56 }
  ];

  return (
    <DashboardChart
      title="Sales by Product"
      subtitle="Top selling products"
      type="pie"
      data={defaultData}
      {...props}
    />
  );
};

// Performance Chart Component
export const PerformanceChart = ({ data, ...props }) => {
  const defaultData = data || [
    { label: 'Week 1', clicks: 1200, conversions: 45, revenue: 3400 },
    { label: 'Week 2', clicks: 1500, conversions: 52, revenue: 4100 },
    { label: 'Week 3', clicks: 1800, conversions: 61, revenue: 5200 },
    { label: 'Week 4', clicks: 2100, conversions: 73, revenue: 6300 }
  ];

  return (
    <DashboardChart
      title="Performance Metrics"
      subtitle="Weekly performance overview"
      type="bar"
      data={defaultData}
      series={[
        { key: 'clicks', name: 'Clicks' },
        { key: 'conversions', name: 'Conversions' },
        { key: 'revenue', name: 'Revenue ($)' }
      ]}
      {...props}
    />
  );
};

export default DashboardChart;
