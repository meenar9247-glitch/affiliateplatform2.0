import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
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
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiUserPlus,
  FiUserCheck,
  FiUserX
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

const ReferralStats = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState({
    overview: {
      totalReferrals: 0,
      activeReferrals: 0,
      pendingReferrals: 0,
      inactiveReferrals: 0,
      conversionRate: 0,
      totalEarned: 0,
      averagePerReferral: 0,
      projectedEarnings: 0
    },
    timeline: {
      daily: [],
      weekly: [],
      monthly: []
    },
    breakdown: {
      byStatus: [],
      byTier: [],
      bySource: [],
      byCountry: []
    },
    topReferrals: [],
    recentReferrals: [],
    tiers: [
      { level: 'Bronze', min: 0, max: 10, rate: 5, color: '#cd7f32' },
      { level: 'Silver', min: 11, max: 50, rate: 10, color: '#c0c0c0' },
      { level: 'Gold', min: 51, max: 100, rate: 15, color: '#ffd700' },
      { level: 'Platinum', min: 101, max: 500, rate: 20, color: '#e5e4e2' },
      { level: 'Diamond', min: 501, max: Infinity, rate: 25, color: '#b9f2ff' }
    ]
  });
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    fetchStats();
    fetchReferralCode();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/stats`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/code`
      );
      
      if (response.data.success) {
        setReferralCode(response.data.code);
        setReferralLink(`${window.location.origin}/register?ref=${response.data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch referral code');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    toast.success('Statistics refreshed');
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/export`,
        {
          params: { format, timeRange },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-stats-${timeRange}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Statistics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export statistics');
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getTierInfo = (count) => {
    return stats.tiers.find(tier => count >= tier.min && count <= tier.max) || stats.tiers[0];
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, change, subtitle, color = 'primary' }) => (
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
            {change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Tier Card Component
  const TierCard = ({ tier, count, earnings }) => {
    const progress = count > tier.max ? 100 : (count / tier.max) * 100;
    
    return (
      <div className="tier-card">
        <div className="tier-header">
          <span className="tier-name">{tier.level}</span>
          <span className="tier-rate">{tier.rate}% commission</span>
        </div>
        <div className="tier-progress">
          <div className="tier-progress-bar">
            <div
              className="tier-progress-fill"
              style={{ width: `${progress}%`, backgroundColor: tier.color }}
            />
          </div>
          <div className="tier-stats">
            <span>{count} / {tier.max === Infinity ? '∞' : tier.max} referrals</span>
            <span>Earned: {formatCurrency(earnings)}</span>
          </div>
        </div>
        <div className="tier-footer">
          <span>Next tier: +{tier.rate}% commission</span>
        </div>
      </div>
    );
  };

  // Chart Colors
  const STATUS_COLORS = {
    active: '#28a745',
    pending: '#ffc107',
    inactive: '#dc3545'
  };

  const SOURCE_COLORS = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#17a2b8'];

  // Styles
  const styles = `
    .referral-stats-page {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
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

    /* Referral Code */
    .referral-code-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 24px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .referral-code-card::before {
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

    .referral-code-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
      position: relative;
      z-index: 1;
    }

    .referral-code-info h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .referral-code-info p {
      margin: 0;
      opacity: 0.9;
    }

    .referral-code-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: var(--radius-lg);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .referral-code-text {
      font-size: 24px;
      font-weight: var(--font-bold);
      letter-spacing: 2px;
    }

    .referral-code-actions {
      display: flex;
      gap: 8px;
    }

    .code-action-btn {
      padding: 8px 16px;
      border: none;
      border-radius: var(--radius-md);
      background: rgba(255,255,255,0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .code-action-btn:hover {
      background: rgba(255,255,255,0.3);
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

    .chart-container {
      height: 300px;
    }

    /* Tiers Grid */
    .tiers-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .tier-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 16px;
      border: 1px solid var(--border);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .tier-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .tier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .tier-name {
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    .tier-rate {
      font-size: 12px;
      color: var(--success);
    }

    .tier-progress {
      margin-bottom: 12px;
    }

    .tier-progress-bar {
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .tier-progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .tier-stats {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-disabled);
    }

    .tier-footer {
      font-size: 11px;
      color: var(--text-secondary);
      text-align: center;
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

    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breakdown-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .breakdown-label {
      flex: 1;
      font-size: 13px;
      color: var(--text-primary);
    }

    .breakdown-value {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .breakdown-bar {
      width: 100px;
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
    }

    .breakdown-bar-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .breakdown-percent {
      min-width: 45px;
      font-size: 12px;
      color: var(--text-disabled);
      text-align: right;
    }

    /* Top Referrals */
    .referrals-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      margin-bottom: 24px;
    }

    .referrals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .referrals-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .referrals-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .referral-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: var(--radius-md);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .referral-item:hover {
      background: var(--bg-tertiary);
    }

    .referral-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
    }

    .referral-info {
      flex: 1;
    }

    .referral-name {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .referral-meta {
      font-size: 12px;
      color: var(--text-disabled);
    }

    .referral-value {
      font-weight: var(--font-bold);
      color: var(--success);
    }

    .referral-status {
      padding: 4px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
    }

    .status-active {
      background: var(--success-50);
      color: var(--success);
    }

    .status-pending {
      background: var(--warning-50);
      color: var(--warning);
    }

    .status-inactive {
      background: var(--danger-50);
      color: var(--danger);
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
      .chart-card,
      .tier-card,
      .breakdown-card,
      .referrals-card {
        background: var(--dark-bg-secondary);
      }

      .stat-content h3 {
        color: var(--dark-text-muted);
      }

      .stat-value {
        color: var(--dark-text-primary);
      }

      .tier-name {
        color: var(--dark-text-primary);
      }

      .tier-stats {
        color: var(--dark-text-muted);
      }

      .breakdown-label {
        color: var(--dark-text-primary);
      }

      .breakdown-value {
        color: var(--dark-text-primary);
      }

      .referral-name {
        color: var(--dark-text-primary);
      }

      .time-range-select,
      .action-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .action-btn:hover {
        background: var(--dark-bg-secondary);
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .tiers-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .breakdown-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .tiers-grid {
        grid-template-columns: 1fr;
      }

      .charts-row {
        grid-template-columns: 1fr;
      }

      .referral-code-content {
        flex-direction: column;
        text-align: center;
      }

      .referral-code-box {
        flex-direction: column;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-wrap: wrap;
      }

      .time-range-select,
      .action-btn {
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
          <p>Loading referral statistics...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="referral-stats-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Referral Statistics</h1>
            <p>Track your referral performance and earnings</p>
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
            <button className="action-btn" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="action-btn" onClick={() => handleExport('csv')}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Referral Code */}
        <div className="referral-code-card">
          <div className="referral-code-content">
            <div className="referral-code-info">
              <h3>Your Referral Code</h3>
              <p>Share this code with friends to earn commissions</p>
            </div>
            <div className="referral-code-box">
              <span className="referral-code-text">{referralCode}</span>
              <div className="referral-code-actions">
                <button className="code-action-btn">
                  <FiEye /> Preview
                </button>
                <button className="code-action-btn">
                  <FiDownload /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={FiUsers}
            title="Total Referrals"
            value={formatNumber(stats.overview.totalReferrals)}
            change={12}
            color="primary"
          />
          <StatsCard
            icon={FiUserCheck}
            title="Active"
            value={formatNumber(stats.overview.activeReferrals)}
            subtitle={`${stats.overview.conversionRate}% conversion`}
            color="success"
          />
          <StatsCard
            icon={FiUserX}
            title="Inactive"
            value={formatNumber(stats.overview.inactiveReferrals)}
            color="danger"
          />
          <StatsCard
            icon={FiDollarSign}
            title="Total Earned"
            value={formatCurrency(stats.overview.totalEarned)}
            subtitle={`Avg: ${formatCurrency(stats.overview.averagePerReferral)}`}
            color="warning"
          />
        </div>

        {/* Tiers Grid */}
        <div className="tiers-grid">
          {stats.tiers.map((tier, index) => {
            const count = stats.overview.totalReferrals;
            const earnings = stats.overview.totalEarned * (tier.rate / 100);
            return <TierCard key={index} tier={tier} count={count} earnings={earnings} />;
          })}
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Referrals Over Time */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Referrals Over Time</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.timeline.daily}>
                  <defs>
                    <linearGradient id="referralsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="count"
                    stroke="#667eea"
                    strokeWidth={2}
                    fill="url(#referralsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Referral Source Breakdown */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Referral Sources</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.breakdown.bySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.breakdown.bySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="breakdown-grid">
          {/* Status Breakdown */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Referral Status</h3>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.byStatus.map((item, index) => {
                const total = stats.breakdown.byStatus.reduce((sum, i) => sum + i.value, 0);
                const percentage = (item.value / total) * 100;
                return (
                  <div key={index} className="breakdown-item">
                    <div className="breakdown-color" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
                    <span className="breakdown-label">{item.status}</span>
                    <span className="breakdown-value">{formatNumber(item.value)}</span>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${percentage}%`, backgroundColor: STATUS_COLORS[item.status] }}
                      />
                    </div>
                    <span className="breakdown-percent">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Country Breakdown */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3>Top Countries</h3>
            </div>
            <div className="breakdown-list">
              {stats.breakdown.byCountry.slice(0, 5).map((item, index) => {
                const total = stats.breakdown.byCountry.reduce((sum, i) => sum + i.value, 0);
                const percentage = (item.value / total) * 100;
                return (
                  <div key={index} className="breakdown-item">
                    <span className="breakdown-label">{item.country}</span>
                    <span className="breakdown-value">{formatNumber(item.value)}</span>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${percentage}%`, backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }}
                      />
                    </div>
                    <span className="breakdown-percent">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Referrals */}
        <div className="referrals-card">
          <div className="referrals-header">
            <h3>Top Performing Referrals</h3>
            <Link to="/referrals" className="view-all-link">
              View All <FiChevronRight />
            </Link>
          </div>
          <div className="referrals-list">
            {stats.topReferrals.map((referral, index) => (
              <div key={index} className="referral-item">
                <div className="referral-avatar">
                  {referral.name.charAt(0)}
                </div>
                <div className="referral-info">
                  <div className="referral-name">{referral.name}</div>
                  <div className="referral-meta">
                    Joined {new Date(referral.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className={`referral-status status-${referral.status}`}>
                  {referral.status}
                </div>
                <div className="referral-value">
                  {formatCurrency(referral.earnings)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralStats;
