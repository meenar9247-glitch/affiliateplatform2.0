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
  FiAward,
  FiStar,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiChevronRight,
  FiChevronLeft
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
  ResponsiveContainer
} from 'recharts';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    yesterdayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    projectedEarnings: 0,
    clicks: {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    },
    conversions: {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    },
    conversionRate: 0,
    averageCommission: 0,
    topProducts: [],
    recentActivity: []
  });
  const [chartData, setChartData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  useEffect(() => {
    fetchOverviewData();
  }, [timeRange]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/overview`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
        setChartData(response.data.chartData);
        setDistributionData(response.data.distributionData);
      }
    } catch (error) {
      toast.error('Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverviewData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/export`,
        {
          params: { timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-overview-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
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

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <FiTrendingUp className="trend-up" />;
    if (current < previous) return <FiTrendingDown className="trend-down" />;
    return null;
  };

  const getTrendClass = (current, previous) => {
    if (current > previous) return 'trend-positive';
    if (current < previous) return 'trend-negative';
    return '';
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, change, subtitle, color = 'primary' }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{showBalance ? value : '••••••'}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Metric Card Component
  const MetricCard = ({ title, value, icon: Icon, trend, onClick }) => (
    <div className="metric-card" onClick={onClick}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {trend !== undefined && (
          <span className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        {Icon && <Icon className="metric-icon" />}
      </div>
    </div>
  );

  // Activity Item Component
  const ActivityItem = ({ activity }) => (
    <div className="activity-item">
      <div className={`activity-icon ${activity.type}`}>
        {activity.type === 'click' && <FiMousePointer />}
        {activity.type === 'conversion' && <FiShoppingCart />}
        {activity.type === 'earning' && <FiDollarSign />}
        {activity.type === 'withdrawal' && <FiClock />}
      </div>
      <div className="activity-content">
        <p className="activity-title">{activity.title}</p>
        <p className="activity-meta">
          <span className="activity-time">{activity.time}</span>
          {activity.value && (
            <span className="activity-value">{formatCurrency(activity.value)}</span>
          )}
        </p>
      </div>
    </div>
  );

  // Chart Colors
  const CHART_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

  // Styles
  const styles = `
    .overview-page {
      padding: 20px;
    }

    /* Header */
    .overview-header {
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

    .balance-toggle {
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .balance-toggle:hover {
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
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      border: 1px solid var(--border);
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .metric-title {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .metric-trend {
      font-size: 11px;
      font-weight: var(--font-semibold);
    }

    .metric-trend.positive {
      color: var(--success);
    }

    .metric-trend.negative {
      color: var(--danger);
    }

    .metric-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-value {
      font-size: 20px;
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    .metric-icon {
      color: var(--text-disabled);
      font-size: 24px;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
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

    .chart-total {
      font-size: 14px;
      color: var(--success);
      font-weight: var(--font-semibold);
    }

    .chart-container {
      height: 300px;
    }

    /* Recent Activity */
    .activity-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .activity-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .view-all-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .activity-item:hover {
      background: var(--bg-tertiary);
    }

    .activity-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .activity-icon.click {
      background: var(--primary-50);
      color: var(--primary);
    }

    .activity-icon.conversion {
      background: var(--success-50);
      color: var(--success);
    }

    .activity-icon.earning {
      background: var(--warning-50);
      color: var(--warning);
    }

    .activity-icon.withdrawal {
      background: var(--info-50);
      color: var(--info);
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .activity-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .activity-time {
      color: var(--text-disabled);
    }

    .activity-value {
      color: var(--success);
      font-weight: var(--font-semibold);
    }

    /* Top Products */
    .products-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .products-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .product-item:hover {
      background: var(--bg-tertiary);
    }

    .product-rank {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .product-rank.gold {
      background: #ffd700;
      color: #000;
    }

    .product-rank.silver {
      background: #c0c0c0;
      color: #000;
    }

    .product-rank.bronze {
      background: #cd7f32;
      color: #fff;
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .product-stats {
      font-size: 12px;
      color: var(--text-disabled);
    }

    .product-earnings {
      font-weight: var(--font-semibold);
      color: var(--success);
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
      .activity-card,
      .products-card {
        background: var(--dark-bg-secondary);
      }

      .stat-content h3 {
        color: var(--dark-text-muted);
      }

      .stat-value {
        color: var(--dark-text-primary);
      }

      .metric-title {
        color: var(--dark-text-muted);
      }

      .metric-value {
        color: var(--dark-text-primary);
      }

      .activity-title {
        color: var(--dark-text-primary);
      }

      .product-name {
        color: var(--dark-text-primary);
      }

      .time-range-select,
      .action-btn,
      .balance-toggle {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .action-btn:hover {
        background: var(--dark-bg-secondary);
      }

      .product-rank {
        background: var(--dark-bg-tertiary);
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
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .charts-row {
        grid-template-columns: 1fr;
      }

      .overview-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-wrap: wrap;
      }

      .time-range-select,
      .action-btn,
      .balance-toggle {
        flex: 1;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading overview...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="overview-page">
        {/* Header */}
        <div className="overview-header">
          <div className="header-left">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your account.</p>
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
            <button className="balance-toggle" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <FiEyeOff /> : <FiEye />}
            </button>
            <button className="action-btn" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="action-btn" onClick={handleExportData}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={FiDollarSign}
            title="Today's Earnings"
            value={formatCurrency(stats.todayEarnings)}
            change={stats.todayEarnings - stats.yesterdayEarnings}
            subtitle={`vs yesterday: ${formatCurrency(stats.yesterdayEarnings)}`}
            color="success"
          />
          <StatCard
            icon={FiTrendingUp}
            title="This Week"
            value={formatCurrency(stats.weekEarnings)}
            color="primary"
          />
          <StatCard
            icon={FiClock}
     title="Pending"
            value={formatCurrency(stats.pendingEarnings)}
            color="warning"
          />
          <StatCard
            icon={FiAward}
            title="Projected"
            value={formatCurrency(stats.projectedEarnings)}
            subtitle="Next 30 days"
            color="info"
          />
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Clicks"
            value={formatNumber(stats.clicks.today)}
            icon={FiMousePointer}
            trend={12}
          />
          <MetricCard
            title="Conversions"
            value={formatNumber(stats.conversions.today)}
            icon={FiShoppingCart}
            trend={8}
          />
          <MetricCard
            title="Conv. Rate"
            value={formatPercentage(stats.conversionRate)}
            icon={FiPieChart}
            trend={2}
          />
          <MetricCard
            title="Avg. Commission"
            value={formatCurrency(stats.averageCommission)}
            icon={FiBarChart2}
            trend={5}
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Earnings Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Earnings Overview</h3>
              <span className="chart-total">
                Total: {formatCurrency(stats.weekEarnings)}
              </span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#667eea"
                    strokeWidth={2}
                    fill="url(#earningsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Traffic Sources</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Products */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent Activity */}
          <div className="activity-card">
            <div className="activity-header">
              <h3>Recent Activity</h3>
              <Link to="/activity" className="view-all-link">
                View All <FiChevronRight />
              </Link>
            </div>
            <div className="activity-list">
              {stats.recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="products-card">
            <div className="products-header">
              <h3>Top Performing Products</h3>
              <Link to="/affiliates" className="view-all-link">
                View All <FiChevronRight />
              </Link>
            </div>
            <div className="products-list">
              {stats.topProducts.map((product, index) => (
                <div key={index} className="product-item">
                  <div className={`product-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                    {index + 1}
                  </div>
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
        </div>
      </div>
    </>
  );
};

export default Overview;
