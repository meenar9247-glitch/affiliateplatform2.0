import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFilter,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiShare2,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiLock,
  FiUnlock
} from 'react-icons/fi';

const Withdrawals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    failedWithdrawals: 0,
    averageProcessingTime: 0,
    nextEligibleDate: null
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    accountDetails: ''
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(10);
  const [processingFee, setProcessingFee] = useState(0);

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
    fetchPaymentMethods();
    fetchBalance();
    fetchSettings();
  }, [timeRange]);

  const fetchWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals`,
        { params: { timeRange, status: filterStatus } }
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
        `${process.env.REACT_APP_API_URL}/withdrawals/stats`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/payment-methods`
      );
      
      if (response.data.success) {
        setPaymentMethods(response.data.methods);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods');
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/balance`
      );
      
      if (response.data.success) {
        setBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals/settings`
      );
      
      if (response.data.success) {
        setMinimumWithdrawal(response.data.minimumWithdrawal);
        setProcessingFee(response.data.processingFee);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate amount
    if (formData.amount < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }

    if (formData.amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/withdrawals/request`,
        formData
      );
      
      if (response.data.success) {
        toast.success('Withdrawal request submitted successfully');
        setShowForm(false);
        setFormData({ amount: '', method: '', accountDetails: '' });
        fetchWithdrawals();
        fetchStats();
        fetchBalance();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    }
  };

  const handleCancelWithdrawal = async (id) => {
    if (window.confirm('Are you sure you want to cancel this withdrawal request?')) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/withdrawals/${id}/cancel`
        );
        
        if (response.data.success) {
          toast.success('Withdrawal request cancelled');
          fetchWithdrawals();
          fetchStats();
          fetchBalance();
        }
      } catch (error) {
        toast.error('Failed to cancel withdrawal');
      }
    }
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const handleExportWithdrawals = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/withdrawals/export`,
        {
          params: { timeRange, status: filterStatus },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `withdrawals-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Withdrawals exported successfully');
    } catch (error) {
      toast.error('Failed to export withdrawals');
    }
  };

  const calculateFee = (amount) => {
    if (typeof processingFee === 'number') {
      return (amount * processingFee) / 100;
    }
    return 0;
  };

  const calculateNetAmount = (amount) => {
    return amount - calculateFee(amount);
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
        return <FiCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'processing':
        return <FiRefreshCw className="status-icon processing" />;
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return <FiXCircle className="status-icon failed" />;
      default:
        return <FiInfo className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  // Styles
  const styles = `
    .withdrawals-page {
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

    .new-withdrawal-btn {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
    }

    .new-withdrawal-btn:hover {
      background: #5a67d8;
    }

    /* Info Cards */
    .info-cards {
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

    /* Balance Card */
    .balance-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 30px;
      margin-bottom: 30px;
      color: white;
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .balance-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .balance-amount {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 10px;
      font-family: monospace;
    }

    .balance-note {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      opacity: 0.9;
    }

    /* Withdrawal Form */
    .withdrawal-form-card {
      background: white;
      border-radius: 10px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .withdrawal-form-card h3 {
      margin: 0 0 20px;
      font-size: 20px;
      color: #333;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-row {
      display: flex;
      gap: 20px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .amount-input-wrapper {
      position: relative;
    }

    .amount-currency {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      font-weight: 500;
    }

    .amount-input-wrapper input {
      padding-left: 30px;
    }

    .fee-info {
      background: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }

    .fee-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .fee-row:last-child {
      margin-bottom: 0;
      padding-top: 10px;
      border-top: 1px solid #e9ecef;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: white;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #f8f9fa;
    }

    .error-message {
      color: #dc3545;
      font-size: 13px;
      margin-top: 5px;
    }

    /* Filters */
    .filters-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    /* Withdrawals Table */
    .withdrawals-table-container {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .withdrawals-table {
      width: 100%;
      border-collapse: collapse;
    }

    .withdrawals-table th {
      padding: 12px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .withdrawals-table td {
      padding: 12px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    .withdrawals-table tr:hover td {
      background: #f8f9fa;
    }

    .withdrawal-status {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-icon {
      font-size: 16px;
    }

    .status-icon.completed {
      color: #28a745;
    }

    .status-icon.pending {
      color: #ffc107;
    }

    .status-icon.processing {
      color: #17a2b8;
      animation: spin 2s linear infinite;
    }

    .status-icon.failed {
      color: #dc3545;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .status-text {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .action-btn {
      padding: 4px 8px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      color: #666;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .action-btn.cancel:hover {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    .amount-positive {
      color: #28a745;
      font-weight: 600;
    }

    .amount-negative {
      color: #dc3545;
      font-weight: 600;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin: 0 0 20px;
      color: #333;
    }

    .details-grid {
      display: grid;
      gap: 15px;
      margin-bottom: 20px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .detail-label {
      color: #666;
      font-weight: 500;
    }

    .detail-value {
      color: #333;
      font-weight: 600;
    }

    .modal-close-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 48px;
      color: #999;
      margin-bottom: 15px;
    }

    .empty-state p {
      color: #999;
      margin-bottom: 20px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stat-card,
      .withdrawal-form-card,
      .filters-section,
      .withdrawals-table-container,
      .modal-content {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p {
        color: #e2e8f0;
      }

      .stat-content h3 {
        color: #e2e8f0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .time-range-select,
      .export-btn,
      .filter-select {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .withdrawal-form-card h3,
      .form-group label {
        color: #e2e8f0;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .fee-info {
        background: #1a202c;
      }

      .withdrawals-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .withdrawals-table td {
        border-top-color: #4a5568;
        color: #e2e8f0;
      }

      .withdrawals-table tr:hover td {
        background: #1a202c;
      }

      .modal-content h3 {
        color: #f7fafc;
      }

      .detail-item {
        border-bottom-color: #4a5568;
      }

      .detail-label {
        color: #e2e8f0;
      }

      .detail-value {
        color: #f7fafc;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
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
      .new-withdrawal-btn {
        flex: 1;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .form-actions {
        flex-direction: column;
      }

      .withdrawals-table {
        font-size: 14px;
      }

      .withdrawals-table th,
      .withdrawals-table td {
        padding: 8px;
      }

      .modal-content {
        padding: 20px;
      }
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
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Withdrawals</h1>
            <p>Request and track your withdrawals</p>
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
            <button className="export-btn" onClick={handleExportWithdrawals}>
              <FiDownload /> Export
            </button>
            <button className="new-withdrawal-btn" onClick={() => setShowForm(!showForm)}>
              <FiPlus /> New Withdrawal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="info-cards">
          <StatsCard
            icon={FiDollarSign}
            title="Total Withdrawn"
            value={formatCurrency(stats.totalWithdrawn)}
            subtitle="All time"
          />
          <StatsCard
            icon={FiClock}
            title="Pending"
            value={stats.pendingWithdrawals}
            subtitle="Awaiting processing"
          />
          <StatsCard
            icon={FiCheckCircle}
            title="Completed"
            value={stats.completedWithdrawals}
            subtitle="Successfully processed"
          />
          <StatsCard
            icon={FiXCircle}
            title="Failed"
            value={stats.failedWithdrawals}
            subtitle="Cancelled or rejected"
          />
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <h3>Available Balance</h3>
            <FiInfo size={20} />
          </div>
          <div className="balance-amount">{formatCurrency(balance)}</div>
          <div className="balance-note">
            <FiAlertCircle size={16} />
            <span>Minimum withdrawal: {formatCurrency(minimumWithdrawal)}</span>
          </div>
        </div>

        {/* Withdrawal Form */}
        {showForm && (
          <div className="withdrawal-form-card">
            <h3>Request Withdrawal</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Amount</label>
                  <div className="amount-input-wrapper">
                    <span className="amount-currency">$</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      min={minimumWithdrawal}
                      max={balance}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select method</option>
                    {paymentMethods.map(method => (
                      <option key={method._id} value={method._id}>
                        {method.name} ({method.detail})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    name="accountDetails"
                    value={formData.accountDetails}
                    onChange={handleInputChange}
                    placeholder="Enter any additional information"
                  />
                </div>
              </div>

              {formData.amount && (
                <div className="fee-info">
                  <div className="fee-row">
                    <span>Withdrawal Amount:</span>
                    <span>{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="fee-row">
                    <span>Processing Fee ({processingFee}%):</span>
                    <span>-{formatCurrency(calculateFee(parseFloat(formData.amount)))}</span>
                  </div>
                  <div className="fee-row">
                    <span>Net Amount:</span>
                    <span className="amount-positive">
                      {formatCurrency(calculateNetAmount(parseFloat(formData.amount)))}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="withdrawals-table-container">
          {withdrawals.length > 0 ? (
            <table className="withdrawals-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id}>
                    <td>{formatDate(withdrawal.createdAt)}</td>
                    <td className={withdrawal.status === 'completed' ? 'amount-positive' : 'amount-negative'}>
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td>{withdrawal.method}</td>
                    <td>
                      <div className="withdrawal-status">
                        {getStatusIcon(withdrawal.status)}
                        <span
                          className="status-text"
                          style={{ background: `${getStatusColor(withdrawal.status)}20`, color: getStatusColor(withdrawal.status) }}
                        >
                          {getStatusText(withdrawal.status)}
                        </span>
                      </div>
                    </td>
                    <td>{withdrawal.reference || 'N/A'}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleViewDetails(withdrawal)}
                      >
                        View
                      </button>
                      {withdrawal.status === 'pending' && (
                        <button
                          className="action-btn cancel"
                          onClick={() => handleCancelWithdrawal(withdrawal._id)}
                          style={{ marginLeft: '5px' }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FiDollarSign className="empty-icon" />
              <p>No withdrawals found</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                Request Your First Withdrawal
              </button>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedWithdrawal && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Withdrawal Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedWithdrawal._id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedWithdrawal.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">{formatCurrency(selectedWithdrawal.amount)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">{selectedWithdrawal.method}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value" style={{ color: getStatusColor(selectedWithdrawal.status) }}>
                    {getStatusText(selectedWithdrawal.status)}
                  </span>
                </div>
                {selectedWithdrawal.reference && (
                  <div className="detail-item">
                    <span className="detail-label">Reference:</span>
                    <span className="detail-value">{selectedWithdrawal.reference}</span>
                  </div>
                )}
                {selectedWithdrawal.processedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Processed:</span>
                    <span className="detail-value">{formatDate(selectedWithdrawal.processedAt)}</span>
                  </div>
                )}
                {selectedWithdrawal.notes && (
                  <div className="detail-item">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{selectedWithdrawal.notes}</span>
                  </div>
                )}
              </div>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Withdrawals;
