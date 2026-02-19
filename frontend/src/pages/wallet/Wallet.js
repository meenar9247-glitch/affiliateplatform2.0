import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiFilter,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiShare2
} from 'react-icons/fi';

const Wallet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    balance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    currency: 'USD'
  });
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    averageDaily: 0,
    projectedEarnings: 0,
    nextPayout: null
  });

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    fetchPaymentMethods();
    fetchStats();
  }, [timeRange]);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/info`
      );
      
      if (response.data.success) {
        setWallet(response.data.wallet);
      }
    } catch (error) {
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/transactions`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions');
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

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/stats`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleWithdraw = () => {
    navigate('/withdrawals/new');
  };

  const handleAddPaymentMethod = () => {
    navigate('/wallet/payment-methods/add');
  };

  const handleRemovePaymentMethod = async (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/wallet/payment-methods/${id}`
        );
        
        if (response.data.success) {
          setPaymentMethods(paymentMethods.filter(method => method._id !== id));
          toast.success('Payment method removed');
        }
      } catch (error) {
        toast.error('Failed to remove payment method');
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/wallet/payment-methods/${id}/default`
      );
      
      if (response.data.success) {
        setPaymentMethods(paymentMethods.map(method => ({
          ...method,
          isDefault: method._id === id
        })));
        toast.success('Default payment method updated');
      }
    } catch (error) {
      toast.error('Failed to set default payment method');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/transactions/export`,
        {
          params: { timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wallet-transactions-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency,
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earnings':
      case 'commission':
      case 'bonus':
      case 'referral':
        return <FiArrowUp className="transaction-icon income" />;
      case 'withdrawal':
      case 'fee':
      case 'refund':
        return <FiArrowDown className="transaction-icon expense" />;
      default:
        return <FiClock className="transaction-icon pending" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earnings':
      case 'commission':
      case 'bonus':
      case 'referral':
        return 'income';
      case 'withdrawal':
        return 'expense';
      case 'pending':
        return 'pending';
      default:
        return '';
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'paypal':
        return '💰';
      case 'bank':
        return '🏦';
      case 'upi':
        return '📱';
      default:
        return '💳';
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle, trend }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trend && (
          <p className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .wallet-page {
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

    /* Balance Card */
    .balance-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .balance-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }

    .balance-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .balance-title h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }

    .balance-visibility {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .balance-visibility:hover {
      background: rgba(255,255,255,0.3);
    }

    .balance-actions {
      display: flex;
      gap: 10px;
    }

    .balance-action-btn {
      padding: 10px 24px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .balance-action-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .balance-action-btn.primary {
      background: white;
      color: #667eea;
    }

    .balance-action-btn.primary:hover {
      background: rgba(255,255,255,0.9);
    }

    .balance-amount {
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .balance-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }

    .balance-number {
      font-size: 64px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 5px;
      font-family: monospace;
    }

    .balance-number.hidden {
      filter: blur(5px);
      user-select: none;
    }

    .balance-sub {
      display: flex;
      gap: 30px;
    }

    .balance-sub-item {
      font-size: 14px;
      opacity: 0.9;
    }

    .balance-sub-item strong {
      font-size: 18px;
      opacity: 1;
      margin-left: 5px;
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

    .stat-trend {
      margin: 5px 0 0;
      font-size: 12px;
    }

    .stat-trend.positive {
      color: #28a745;
    }

    .stat-trend.negative {
      color: #dc3545;
    }

    /* Payment Methods */
    .payment-methods-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .payment-methods-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .payment-methods-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .add-payment-btn {
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

    .add-payment-btn:hover {
      background: #5a67d8;
    }

    .payment-methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .payment-method-card {
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      transition: all 0.3s ease;
    }

    .payment-method-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .payment-method-card.default {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .payment-method-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .payment-method-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .payment-method-info {
      flex: 1;
    }

    .payment-method-name {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .payment-method-detail {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    .payment-method-actions {
      display: flex;
      gap: 5px;
      margin-top: 15px;
    }

    .payment-method-btn {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .payment-method-btn:hover {
      background: #f8f9fa;
    }

    .payment-method-btn.default-btn {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .payment-method-btn.default-btn:hover {
      background: #5a67d8;
    }

    .payment-method-btn.remove-btn {
      color: #dc3545;
      border-color: #dc3545;
    }

    .payment-method-btn.remove-btn:hover {
      background: #dc3545;
      color: white;
    }

    .default-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #667eea;
      color: white;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    /* Transactions */
    .transactions-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

    .transaction-filters {
      display: flex;
      gap: 10px;
    }

    .transaction-filter {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .transaction-item:hover {
      background: #f8f9fa;
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .transaction-icon.income {
      background: #d4edda;
      color: #28a745;
    }

    .transaction-icon.expense {
      background: #f8d7da;
      color: #dc3545;
    }

    .transaction-icon.pending {
      background: #fff3cd;
      color: #ffc107;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-description {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .transaction-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #999;
    }

    .transaction-amount {
      font-size: 18px;
      font-weight: 600;
    }

    .transaction-amount.income {
      color: #28a745;
    }

    .transaction-amount.expense {
      color: #dc3545;
    }

    .transaction-amount.pending {
      color: #ffc107;
    }

    .transaction-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .transaction-status.completed {
      background: #d4edda;
      color: #28a745;
    }

    .transaction-status.pending {
      background: #fff3cd;
      color: #ffc107;
    }

    .transaction-status.failed {
      background: #f8d7da;
      color: #dc3545;
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
      .payment-methods-card,
      .transactions-card {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p {
        color: #e2e8f0;
      }

      .stat-content h3,
      .payment-methods-header h3,
      .transactions-header h3 {
        color: #e2e8f0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .time-range-select,
      .export-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .payment-method-card {
        border-color: #4a5568;
      }

      .payment-method-name {
        color: #f7fafc;
      }

      .transaction-item {
        border-color: #4a5568;
      }

      .transaction-item:hover {
        background: #1a202c;
      }

      .transaction-description {
        color: #f7fafc;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .balance-number {
        font-size: 40px;
      }

      .balance-sub {
        flex-direction: column;
        gap: 10px;
      }

      .balance-actions {
        flex-direction: column;
      }

      .payment-methods-grid {
        grid-template-columns: 1fr;
      }

      .transaction-item {
        flex-wrap: wrap;
      }

      .transaction-amount {
        width: 100%;
        text-align: right;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading wallet data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wallet-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>My Wallet</h1>
            <p>Manage your earnings and payment methods</p>
          </div>
          <div className="header-right">
            <select
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 DaysDays</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <button className="export-btn" onClick={handleExportTransactions}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-title">
              <FiDollarSign size={24} />
              <h2>Available Balance</h2>
            </div>
            <div className="balance-actions">
              <button className="balance-visibility" onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <FiEyeOff /> : <FiEye />}
              </button>
              <button className="balance-action-btn primary" onClick={handleWithdraw}>
                <FiArrowUp /> Withdraw
              </button>
              <button className="balance-action-btn">
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>
          <div className="balance-amount">
            <div className="balance-label">Current Balance</div>
            <div className={`balance-number ${!showBalance ? 'hidden' : ''}`}>
              {formatCurrency(wallet.balance)}
            </div>
            <div className="balance-sub">
              <div className="balance-sub-item">
                Pending: <strong>{formatCurrency(wallet.pendingBalance)}</strong>
              </div>
              <div className="balance-sub-item">
                Total Earned: <strong>{formatCurrency(wallet.totalEarned)}</strong>
              </div>
              <div className="balance-sub-item">
                Total Withdrawn: <strong>{formatCurrency(wallet.totalWithdrawn)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={FiTrendingUp}
            title="Today's Earnings"
            value={formatCurrency(stats.todayEarnings)}
            trend={5}
          />
          <StatsCard
            icon={FiTrendingUp}
            title="This Week"
            value={formatCurrency(stats.weekEarnings)}
            trend={8}
          />
          <StatsCard
            icon={FiTrendingUp}
            title="This Month"
            value={formatCurrency(stats.monthEarnings)}
            trend={12}
          />
          <StatsCard
            icon={FiClock}
            title="Next Payout"
            value={stats.nextPayout ? formatDate(stats.nextPayout) : 'N/A'}
            subtitle={`Projected: ${formatCurrency(stats.projectedEarnings)}`}
          />
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-card">
          <div className="payment-methods-header">
            <h3>Payment Methods</h3>
            <button className="add-payment-btn" onClick={handleAddPaymentMethod}>
              <FiCreditCard /> Add Method
            </button>
          </div>
          <div className="payment-methods-grid">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`payment-method-card ${method.isDefault ? 'default' : ''}`}
                >
                  <div className="payment-method-header">
                    <div className="payment-method-icon">
                      {getPaymentMethodIcon(method.type)}
                    </div>
                    <div className="payment-method-info">
                      <p className="payment-method-name">{method.name}</p>
                      <p className="payment-method-detail">{method.detail}</p>
                    </div>
                    {method.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  <div className="payment-method-actions">
                    {!method.isDefault && (
                      <button
                        className="payment-method-btn default-btn"
                        onClick={() => handleSetDefaultPaymentMethod(method._id)}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      className="payment-method-btn remove-btn"
                      onClick={() => handleRemovePaymentMethod(method._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No payment methods added yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-card">
          <div className="transactions-header">
            <h3>Recent Transactions</h3>
            <div className="transaction-filters">
              <select className="transaction-filter">
                <option>All Types</option>
                <option>Earnings</option>
                <option>Withdrawals</option>
                <option>Fees</option>
              </select>
              <select className="transaction-filter">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
          </div>
          <div className="transactions-list">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div className={`transaction-icon ${getTransactionColor(transaction.type)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="transaction-details">
                    <p className="transaction-description">{transaction.description}</p>
                    <div className="transaction-meta">
                      <span>{formatDate(transaction.date)}</span>
                      <span>#{transaction.reference}</span>
                    </div>
                  </div>
                  <div className={`transaction-amount ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </div>
                  <span className={`transaction-status ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
              ))
            ) : (
              <p>No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wallet;
