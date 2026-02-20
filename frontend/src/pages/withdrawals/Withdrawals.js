import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const Withdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    failedWithdrawals: 0,
    averageProcessingTime: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals`
      );
      
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals/stats`
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchWithdrawals();
    await fetchStats();
    toast.success('Withdrawals refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals/export`,
        {
          params: filters,
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'withdrawals.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Withdrawals exported successfully');
    } catch (error) {
      toast.error('Failed to export withdrawals');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle style={{ color: '#28a745' }} />;
      case 'pending':
        return <FiClock style={{ color: '#ffc107' }} />;
      case 'processing':
        return <FiRefreshCw style={{ color: '#17a2b8' }} className="spin" />;
      case 'failed':
        return <FiXCircle style={{ color: '#dc3545' }} />;
      default:
        return <FiClock style={{ color: '#6c757d' }} />;
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  // Styles
  const styles = `
    .withdrawals-page {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-left h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: #333;
    }

    .header-left p {
      margin: 0;
      color: #666;
    }

    .header-right {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-icon {
      font-size: 24px;
    }

    .stat-content h3 {
      margin: 0 0 4px;
      font-size: 13px;
      color: #666;
    }

    .stat-value {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }

    .filters-panel {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      display: ${showFilters ? 'block' : 'none'};
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .filter-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      padding: 12px 16px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    td {
      padding: 12px 16px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    tr:hover td {
      background: #f8f9fa;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
    }

    .amount-positive {
      color: #28a745;
      font-weight: 600;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top-color: #667eea;
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
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading withdrawals...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="withdrawals-page">
        <div className="page-header">
          <div className="header-left">
            <h1>Withdrawals</h1>
            <p>Track and manage your withdrawals</p>
          </div>
          <div className="header-right">
            <button className="action-btn" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters
            </button>
            <button className="action-btn" onClick={handleRefresh}>
              <FiRefreshCw /> Refresh
            </button>
            <button className="action-btn" onClick={handleExport}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <StatsCard
            icon={FiDollarSign}
            title="Total Withdrawn"
            value={formatCurrency(stats.totalWithdrawn)}
            color="#667eea"
          />
          <StatsCard
            icon={FiClock}
            title="Pending"
            value={stats.pendingWithdrawals}
            color="#ffc107"
          />
          <StatsCard
            icon={FiCheckCircle}
            title="Completed"
            value={stats.completedWithdrawals}
            color="#28a745"
          />
          <StatsCard
            icon={FiTrendingUp}
            title="Avg. Processing"
            value={`${stats.averageProcessingTime}h`}
            color="#17a2b8"
          />
        </div>

        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td>{formatDate(withdrawal.createdAt)}</td>
                  <td className="amount-positive">{formatCurrency(withdrawal.amount)}</td>
                  <td>{withdrawal.method}</td>
                  <td>
                    <span className="status-badge">
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>{withdrawal.reference || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Withdrawals;
