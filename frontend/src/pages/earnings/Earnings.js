import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiAward,
  FiStar,
  FiUsers
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

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    projected: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [stats, setStats] = useState({
    averageCommission: 0,
    bestDay: { date: null, amount: 0 },
    conversionRate: 0,
    topProduct: { name: null, earnings: 0 }
  });

  useEffect(() => {
    fetchEarnings();
    fetchTransactions();
    fetchChartData();
    fetchDistributionData();
    fetchStats();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/summary`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setEarnings(response.data.earnings);
      }
    } catch (error) {
      toast.error('Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/transactions`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/chart`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setChartData(response.data.chartData);
      }
    } catch (error) {
      console.error('Failed to fetch chart data');
    }
  };

  const fetchDistributionData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/distribution`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setDistributionData(response.data.distribution);
      }
    } catch (error) {
      console.error('Failed to fetch distribution data');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/stats`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/earnings/export`,
        {
          params: { format, timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `earnings-${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Earnings exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export earnings');
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'failed':
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle, change }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {change && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Chart Colors
  const CHART_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
  const AREA_COLORS = ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.2)'];

  // Styles
  const styles = `
    .earnings-page {
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

    .export-dropdown {
      position: relative;
    }

    .export-options {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      z-index: 10;
      min-width: 120px;
    }

    .export-option {
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .export-option:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    /* Additional Stats */
    .additional-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .additional-stat {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .additional-stat h4 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #666;
    }

    .additional-stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .additional-stat-detail {
      margin: 5px 0 0;
      font-size: 13px;
      color: #999;
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

    .chart-total {
      font-size: 16px;
      font-weight: 600;
      color: #28a745;
    }

    .chart-container {
      height: 300px;
    }

    /* Transactions Table */
    .transactions-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .transactions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .transactions-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .transactions-table {
      width: 100%;
      border-collapse: collapse;
    }

    .transactions-table th {
      padding: 12px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .transactions-table td {
      padding: 12px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    .transactions-table tr:hover td {
      background: #f8f9fa;
    }

    .transaction-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: inline-block;
    }

    .transaction-amount {
      font-weight: 600;
      color: #28a745;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: flex-end;
      gap: 5px;
      margin-top: 20px;
    }

    .pagination-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .pagination-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      .additional-stat,
      .chart-card,
      .transactions-card,
      .export-options {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p {
        color: #e2e8f0;
      }

      .stat-content h3,
      .chart-header h3,
      .transactions-header h3,
      .additional-stat h4 {
        color: #e2e8f0;
      }

      .stat-value,
      .additional-stat-value {
        color: #f7fafc;
      }

      .time-range-select {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .export-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .export-btn:hover {
        background: #4a5568;
      }

      .export-option {
        color: #e2e8f0;
      }

      .export-option:hover {
        background: #4a5568;
      }

      .transactions-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .transactions-table td {
        border-top-color: #4a5568;
        color: #e2e8f0;
      }

      .transactions-table tr:hover td {
        background: #1a202c;
      }

      .pagination-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .pagination-btn:hover:not(:disabled) {
        background: #667eea;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .charts-row {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .additional-stats {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .transactions-table {
        font-size: 14px;
      }

      .transactions-table th,
      .transactions-table td {
        padding: 8px;
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
          <p>Loading earnings data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="earnings-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Earnings Overview</h1>
            <p>Track and analyze your commission earnings</p>
          </div>
          <div className="header-right">
            <select
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <div className="export-dropdown">
              <button className="export-btn" onClick={() => handleExportData('csv')}>
                <FiDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="stats-grid">
          <StatsCard
            icon={FiDollarSign}
            title="Total Earnings"
            value={formatCurrency(earnings.total)}
            subtitle={`Pending: ${formatCurrency(earnings.pending)}`}
            change={12}
          />
          <StatsCard
            icon={FiTrendingUp}
            title="Projected Earnings"
            value={formatCurrency(earnings.projected)}
            subtitle="Next 30 days"
            change={8}
          />
          <StatsCard
            icon={FiBarChart2}
            title="Avg. Commission"
            value={formatCurrency(stats.averageCommission)}
            subtitle="Per conversion"
            change={5}
          />
          <StatsCard
            icon={FiActivity}
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            subtitle="Click to sale"
            change={2}
          />
        </div>

        {/* Additional Stats */}
        <div className="additional-stats">
          <div className="additional-stat">
            <h4>Best Day</h4>
            <p className="additional-stat-value">
              {stats.bestDay.date ? formatDate(stats.bestDay.date) : 'N/A'}
            </p>
            <p className="additional-stat-detail">
              {formatCurrency(stats.bestDay.amount)}
            </p>
          </div>
          <div className="additional-stat">
            <h4>Top Product</h4>
            <p className="additional-stat-value">
              {stats.topProduct.name || 'N/A'}
            </p>
            <p className="additional-stat-detail">
              {formatCurrency(stats.topProduct.earnings)}
            </p>
          </div>
          <div className="additional-stat">
            <h4>Paid Earnings</h4>
            <p className="additional-stat-value">
              {formatCurrency(earnings.paid)}
            </p>
            <p className="additional-stat-detail">
              {(earnings.paid / earnings.total * 100 || 0).toFixed(1)}% of total
            </p>
          </div>
          <div className="additional-stat">
            <h4>Pending</h4>
            <p className="additional-stat-value">
              {formatCurrency(earnings.pending)}
            </p>
            <p className="additional-stat-detail">
              {(earnings.pending / earnings.total * 100 || 0).toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-row">
          {/* Earnings Over Time */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Earnings Over Time</h3>
              <span className="chart-total">
                Total: {formatCurrency(chartData.reduce((sum, item) => sum + item.earnings, 0))}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => formatDate(date)}
                    stroke="#999"
                  />
                  <YAxis stroke="#999" tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => formatDate(label)}
                  />
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

          {/* Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Earnings Distribution</h3>
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
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-card">
          <div className="transactions-header">
            <h3>Recent Transactions</h3>
          </div>
          {transactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.product}</td>
                    <td>{transaction.commissionRate}%</td>
                    <td>
                      <span
                        className="transaction-status"
                        style={{
                          background: `${getStatusColor(transaction.status)}20`,
                          color: getStatusColor(transaction.status)
                        }}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="transaction-amount">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found</p>
          )}

          {transactions.length > 10 && (
            <div className="pagination">
              <button className="pagination-btn" disabled>Previous</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Earnings;
