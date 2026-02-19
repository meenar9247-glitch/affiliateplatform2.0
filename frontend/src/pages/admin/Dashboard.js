import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiUserCheck,
  FiUserX,
  FiLink,
  FiMousePointer,
  FiShoppingCart,
  FiAward,
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiLogOut
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    totalWithdrawn: 0,
    platformFees: 0
  });
  const [chartData, setChartData] = useState({
    users: [],
    earnings: [],
    clicks: [],
    conversions: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topAffiliates, setTopAffiliates] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: 245,
    activeUsers: 0,
    serverLoad: 42,
    databaseStatus: 'connected',
    apiStatus: 'operational',
    lastBackup: '2026-02-20T03:00:00Z'
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
    fetchTopAffiliates();
    fetchPendingWithdrawals();
    fetchSystemHealth();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/dashboard`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
        setChartData(response.data.charts);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/recent-activity`
      );
      
      if (response.data.success) {
        setRecentActivity(response.data.activity);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity');
    }
  };

  const fetchTopAffiliates = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/top-affiliates`
      );
      
      if (response.data.success) {
        setTopAffiliates(response.data.affiliates);
      }
    } catch (error) {
      console.error('Failed to fetch top affiliates');
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/pending-withdrawals`
      );
      
      if (response.data.success) {
        setPendingWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      console.error('Failed to fetch pending withdrawals');
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/system-health`
      );
      
      if (response.data.success) {
        setSystemHealth(response.data.health);
      }
    } catch (error) {
      console.error('Failed to fetch system health');
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchRecentActivity();
    fetchTopAffiliates();
    fetchPendingWithdrawals();
    fetchSystemHealth();
    toast.success('Dashboard refreshed');
  };

  const handleExportReport = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/export-report`,
        {
          params: { format, timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-report-${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, change, subtitle, color = 'primary' }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Chart Colors
  const CHART_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

  // Styles
  const styles = `
    .admin-dashboard {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .dashboard-header {
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .stat-primary .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-success .stat-icon {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .stat-warning .stat-icon {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .stat-danger .stat-icon {
      background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
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
      margin: 0 0 5px;
      font-size: 14px;
      color: #666;
    }

    .stat-value {
      margin: 0 0 5px;
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }

    .stat-subtitle {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    .stat-change {
      margin: 5px 0 0;
      font-size: 12px;
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
      grid-template-columns: 2fr 1fr;
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
      font-size: 18px;
      color: #333;
    }

    .chart-header span {
      font-size: 14px;
      color: #999;
    }

    .chart-container {
      height: 300px;
    }

    /* System Health */
    .health-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .health-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .health-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .health-indicator.healthy {
      background: #28a745;
    }

    .health-indicator.warning {
      background: #ffc107;
    }

    .health-indicator.error {
      background: #dc3545;
    }

    .health-label {
      flex: 1;
      font-size: 14px;
      color: #666;
    }

    .health-value {
      font-weight: 600;
      color: #333;
    }

    /* Tables Grid */
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .table-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .view-all-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .table-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .table-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .table-item:hover {
      background: #f8f9fa;
    }

    .item-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    .item-info {
      flex: 1;
    }

    .item-title {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .item-subtitle {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .item-value {
      font-weight: 600;
      color: #28a745;
    }

    .item-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .badge-pending {
      background: #fff3cd;
      color: #856404;
    }

    .badge-processing {
      background: #cce5ff;
      color: #004085;
    }

    .badge-completed {
      background: #d4edda;
      color: #155724;
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }

    .action-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .action-icon {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 15px;
    }

    .action-card h4 {
      margin: 0 0 10px;
      color: #333;
    }

    .action-card p {
      margin: 0;
      color: #999;
      font-size: 14px;
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
      .health-card,
      .table-card,
      .action-card {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p,
      .stat-content h3,
      .chart-header h3,
      .table-header h3,
      .health-label {
        color: #e2e8f0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .time-range-select,
      .refresh-btn,
      .export-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .health-item {
        background: #1a202c;
      }

      .item-avatar {
        background: linear-gradient(135deg, #90cdf4 0%, #b794f4 100%);
      }

      .item-title {
        color: #f7fafc;
      }

      .item-subtitle {
        color: #a0aec0;
      }

      .table-item:hover {
        background: #1a202c;
      }

      .action-card h4 {
        color: #f7fafc;
      }

      .action-card p {
        color: #a0aec0;
      }

      .view-all-link {
        color: #90cdf4;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-right {
        width: 100%;
        flex-wrap: wrap;
      }

      .time-range-select,
      .refresh-btn,
      .export-btn {
        flex: 1;
      }

      .charts-row {
        grid-template-columns: 1fr;
      }

      .tables-grid {
        grid-template-columns: 1fr;
      }

      .health-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
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
          <p>Loading admin dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Administrator</p>
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
            <button className="refresh-btn" onClick={handleRefresh}>
              <FiRefreshCw /> Refresh
            </button>
            <button className="export-btn" onClick={() => handleExportReport('csv')}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={FiUsers}
            title="Total Users"
            value={formatNumber(stats.totalUsers)}
            change={12}
            color="primary"
          />
          <StatCard
            icon={FiUserCheck}
            title="Active Users"
            value={formatNumber(stats.activeUsers)}
            subtitle={`${stats.newUsersToday} new today`}
            color="success"
          />
          <StatCard
            icon={FiLink}
            title="Affiliates"
            value={formatNumber(stats.totalAffiliates)}
            subtitle={`${stats.activeAffiliates} active`}
            color="primary"
          />
          <StatCard
            icon={FiDollarSign}
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            change={8}
            color="success"
          />
          <StatCard
            icon={FiShoppingCart}
            title="Conversions"
            value={formatNumber(stats.totalConversions)}
            subtitle={`${stats.conversionRate}% rate`}
            color="warning"
          />
          <StatCard
            icon={FiClock}
            title="Pending Payouts"
            value={formatCurrency(stats.pendingPayouts)}
            color="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Earnings & Conversions Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Overview</h3>
              <span>Last {timeRange}</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.earnings}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Area type="monotone" dataKey="earnings" stroke="#667eea" strokeWidth={2} fill="url(#earningsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users & Clicks Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Activity</h3>
          <span>Last {timeRange}</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.users}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#667eea" />
                  <Bar dataKey="clicks" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="health-card">
          <h3>System Health</h3>
          <div className="health-grid">
            <div className="health-item">
              <span className={`health-indicator ${systemHealth.status === 'healthy' ? 'healthy' : 'warning'}`}></span>
              <span className="health-label">System Status</span>
              <span className="health-value">{systemHealth.status}</span>
            </div>
            <div className="health-item">
              <span className="health-indicator healthy"></span>
              <span className="health-label">Uptime</span>
              <span className="health-value">{systemHealth.uptime}</span>
            </div>
            <div className="health-item">
              <span className={`health-indicator ${systemHealth.responseTime < 300 ? 'healthy' : 'warning'}`}></span>
              <span className="health-label">Response Time</span>
              <span className="health-value">{systemHealth.responseTime}ms</span>
            </div>
            <div className="health-item">
              <span className={`health-indicator ${systemHealth.serverLoad < 70 ? 'healthy' : 'warning'}`}></span>
              <span className="health-label">Server Load</span>
              <span className="health-value">{systemHealth.serverLoad}%</span>
            </div>
            <div className="health-item">
              <span className={`health-indicator ${systemHealth.databaseStatus === 'connected' ? 'healthy' : 'error'}`}></span>
              <span className="health-label">Database</span>
              <span className="health-value">{systemHealth.databaseStatus}</span>
            </div>
            <div className="health-item">
              <span className={`health-indicator ${systemHealth.apiStatus === 'operational' ? 'healthy' : 'warning'}`}></span>
              <span className="health-label">API Status</span>
              <span className="health-value">{systemHealth.apiStatus}</span>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="tables-grid">
          {/* Recent Activity */}
          <div className="table-card">
            <div className="table-header">
              <h3>Recent Activity</h3>
              <Link to="/admin/activity" className="view-all-link">View All →</Link>
            </div>
            <div className="table-list">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="table-item">
                  <div className="item-avatar">
                    {activity.user?.charAt(0) || 'U'}
                  </div>
                  <div className="item-info">
                    <p className="item-title">{activity.description}</p>
                    <p className="item-subtitle">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Affiliates */}
          <div className="table-card">
            <div className="table-header">
              <h3>Top Affiliates</h3>
              <Link to="/admin/affiliates" className="view-all-link">View All →</Link>
            </div>
            <div className="table-list">
              {topAffiliates.slice(0, 5).map((affiliate, index) => (
                <div key={index} className="table-item">
                  <div className="item-avatar">
                    {affiliate.name?.charAt(0)}
                  </div>
                  <div className="item-info">
                    <p className="item-title">{affiliate.name}</p>
                    <p className="item-subtitle">{affiliate.conversions} conversions</p>
                  </div>
                  <div className="item-value">
                    {formatCurrency(affiliate.earnings)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="table-card">
            <div className="table-header">
              <h3>Pending Withdrawals</h3>
              <Link to="/admin/withdrawals" className="view-all-link">View All →</Link>
            </div>
            <div className="table-list">
              {pendingWithdrawals.slice(0, 5).map((withdrawal, index) => (
                <div key={index} className="table-item">
                  <div className="item-avatar">
                    {withdrawal.user?.charAt(0)}
                  </div>
                  <div className="item-info">
                    <p className="item-title">{withdrawal.user}</p>
                    <p className="item-subtitle">{withdrawal.method}</p>
                  </div>
                  <div className="item-value">
                    {formatCurrency(withdrawal.amount)}
                  </div>
                  <span className={`item-badge badge-${withdrawal.status}`}>
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="table-card">
            <div className="table-header">
              <h3>Quick Stats</h3>
            </div>
            <div className="table-list">
              <div className="table-item">
                <span className="health-label">Conversion Rate</span>
                <span className="item-value">{stats.conversionRate}%</span>
              </div>
              <div className="table-item">
                <span className="health-label">Avg. Commission</span>
                <span className="item-value">{formatCurrency(stats.averageCommission)}</span>
              </div>
              <div className="table-item">
                <span className="health-label">Platform Fees</span>
                <span className="item-value">{formatCurrency(stats.platformFees)}</span>
              </div>
              <div className="table-item">
                <span className="health-label">Total Withdrawn</span>
                <span className="item-value">{formatCurrency(stats.totalWithdrawn)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card" onClick={() => navigate('/admin/users')}>
            <FiUsers className="action-icon" />
            <h4>Manage Users</h4>
            <p>View and manage user accounts</p>
          </div>
          <div className="action-card" onClick={() => navigate('/admin/affiliates')}>
            <FiLink className="action-icon" />
            <h4>Affiliate Links</h4>
            <p>Manage affiliate programs</p>
          </div>
          <div className="action-card" onClick={() => navigate('/admin/withdrawals')}>
            <FiDollarSign className="action-icon" />
            <h4>Withdrawals</h4>
            <p>Process payout requests</p>
          </div>
          <div className="action-card" onClick={() => navigate('/admin/settings')}>
            <FiSettings className="action-icon" />
            <h4>System Settings</h4>
            <p>Configure platform settings</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
