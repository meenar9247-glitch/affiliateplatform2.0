import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiTrophy,
  FiMedal,
  FiUser,
  FiClock,
  FiGlobe,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiEyeOff,
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi';

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [category, setCategory] = useState('earnings');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalEarnings: 0,
    averageEarnings: 0,
    topEarner: null,
    fastestRiser: null,
    mostConsistent: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
    fetchStats();
  }, [timeRange, category]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leaderboard`,
        { params: { timeRange, category } }
      );
      
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leaderboard/user-rank`,
        { params: { timeRange, category } }
      );
      
      if (response.data.success) {
        setUserRank(response.data.rank);
      }
    } catch (error) {
      console.error('Failed to fetch user rank');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leaderboard/stats`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleShare = (user) => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name} is ranking #${user.rank} on the leaderboard!`,
        text: `Check out ${user.name}'s performance on the affiliate platform.`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${user.name} is ranking #${user.rank} on the leaderboard!`);
      toast.success('Copied to clipboard!');
    }
  };

  const handleExportLeaderboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/leaderboard/export`,
        {
          params: { timeRange, category },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leaderboard-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Leaderboard exported successfully');
    } catch (error) {
      toast.error('Failed to export leaderboard');
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

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiTrophy className="rank-icon gold" />;
    if (rank === 2) return <FiMedal className="rank-icon silver" />;
    if (rank === 3) return <FiMedal className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'earnings':
        return 'Total Earnings';
      case 'clicks':
        return 'Total Clicks';
      case 'conversions':
        return 'Conversions';
      case 'referrals':
        return 'Referrals';
      case 'commission':
        return 'Avg. Commission';
      default:
        return cat;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'earnings':
        return <FiDollarSign />;
      case 'clicks':
        return <FiTrendingUp />;
      case 'conversions':
        return <FiUsers />;
      case 'referrals':
        return <FiUsers />;
      default:
        return <FiStar />;
    }
  };

  const getCategoryValue = (user, cat) => {
    switch (cat) {
      case 'earnings':
        return formatCurrency(user.earnings);
      case 'clicks':
        return formatNumber(user.clicks);
      case 'conversions':
        return formatNumber(user.conversions);
      case 'referrals':
        return formatNumber(user.referrals);
      case 'commission':
        return `${user.commissionRate}%`;
      default:
        return '';
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .leaderboard-page {
      padding: 40px 20px;
      max-width: 1200px;
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

    .time-range-select,
    .category-select {
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
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .stat-subtitle {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    /* User Rank Card */
    .user-rank-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }

    .user-rank-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-rank-icon {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .user-rank-details h3 {
      margin: 0 0 5px;
      font-size: 18px;
    }

    .user-rank-details p {
      margin: 0;
      opacity: 0.9;
    }

    .user-rank-value {
      text-align: right;
    }

    .user-rank-value .rank-number {
      font-size: 36px;
      font-weight: 700;
      line-height: 1;
    }

    .user-rank-value .rank-label {
      font-size: 14px;
      opacity: 0.9;
    }

    /* Filters */
    .filters-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-bar {
      position: relative;
      margin-bottom: 15px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .search-bar input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .filter-options {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .anonymous-toggle {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      cursor: pointer;
    }

    .anonymous-toggle input {
      width: auto;
    }

    /* Leaderboard List */
    .leaderboard-list {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .leaderboard-header {
      display: grid;
      grid-template-columns: 80px 2fr repeat(3, 1fr) 100px;
      padding: 15px 20px;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e9ecef;
    }

    .leaderboard-row {
      display: grid;
      grid-template-columns: 80px 2fr repeat(3, 1fr) 100px;
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .leaderboard-row:hover {
      background: #f8f9fa;
    }

    .leaderboard-row.top-1 {
      background: linear-gradient(90deg, rgba(255,215,0,0.1) 0%, transparent 100%);
    }

    .leaderboard-row.top-2 {
      background: linear-gradient(90deg, rgba(192,192,192,0.1) 0%, transparent 100%);
    }

    .leaderboard-row.top-3 {
      background: linear-gradient(90deg, rgba(205,127,50,0.1) 0%, transparent 100%);
    }

    .rank-cell {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .rank-icon {
      font-size: 20px;
    }

    .rank-icon.gold {
      color: #FFD700;
    }

    .rank-icon.silver {
      color: #C0C0C0;
    }

    .rank-icon.bronze {
      color: #CD7F32;
    }

    .rank-number {
      font-weight: 600;
      color: #666;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    .user-avatar.anonymous {
      background: #999;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-name.anonymous {
      color: #999;
      font-style: italic;
    }

    .value-cell {
      font-weight: 600;
    }

    .value-cell.earnings {
      color: #28a745;
    }

    .actions-cell {
      display: flex;
      gap: 5px;
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

    /* Podium */
    .podium-section {
      margin-bottom: 30px;
    }

    .podium {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }

    .podium-item {
      flex: 1;
      max-width: 250px;
      text-align: center;
    }

    .podium-item.first {
      order: 2;
    }

    .podium-item.second {
      order: 1;
    }

    .podium-item.third {
      order: 3;
    }

    .podium-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      color: white;
      font-size: 32px;
    }

    .podium-avatar.first {
      width: 100px;
      height: 100px;
      font-size: 40px;
    }

    .podium-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .podium-value {
      color: #28a745;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .podium-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .podium-badge.first {
      background: #FFD700;
      color: #333;
    }

    .podium-badge.second {
      background: #C0C0C0;
      color: #333;
    }

    .podium-badge.third {
      background: #CD7F32;
      color: white;
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

    .modal-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .modal-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
    }

    .modal-header h3 {
      margin: 0 0 5px;
      font-size: 24px;
      color: #333;
    }

    .modal-rank {
      color: #666;
    }

    .modal-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .modal-stat {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .modal-stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .modal-stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .modal-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .badge {
      padding: 4px 12px;
      background: #f0f4ff;
      border-radius: 20px;
      font-size: 12px;
      color: #667eea;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stat-card,
      .filters-section,
      .leaderboard-list,
      .modal-content {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p,
      .filter-options {
        color: #e2e8f0;
      }

      .stat-content h3,
      .leaderboard-header,
      .user-name {
        color: #e2e8f0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .time-range-select,
      .category-select,
      .export-btn,
      .refresh-btn,
      .search-bar input {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .leaderboard-header {
        background: #1a202c;
        border-bottom-color: #4a5568;
      }

      .leaderboard-row {
        border-bottom-color: #4a5568;
      }

      .leaderboard-row:hover {
        background: #1a202c;
      }

      .podium-name {
        color: #f7fafc;
      }

      .modal-stat {
        background: #1a202c;
      }

      .modal-stat-label {
        color: #e2e8f0;
      }

      .modal-stat-value {
        color: #f7fafc;
      }

      .badge {
        background: #1a2a4a;
        color: #90cdf4;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .leaderboard-header,
      .leaderboard-row {
        grid-template-columns: 60px 1fr 80px;
        gap: 10px;
      }

      .hide-mobile {
        display: none;
      }

      .podium {
        flex-direction: column;
        align-items: center;
      }

      .podium-item {
        max-width: 100%;
        width: 100%;
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
      .category-select,
      .export-btn,
      .refresh-btn {
        flex: 1;
      }
    }
  `;

  const filteredLeaderboard = leaderboard.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="leaderboard-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Leaderboard</h1>
            <p>Top performing affiliates this {timeRange}</p>
          </div>
          <div className="header-right">
            <select
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="earnings">Total Earnings</option>
              <option value="clicks">Total Clicks</option>
              <option value="conversions">Conversions</option>
              <option value="referrals">Referrals</option>
              <option value="commission">Avg. Commission</option>
            </select>
            <button className="export-btn" onClick={handleExportLeaderboard}>
              <FiDownload /> Export
            </button>
            <button className="refresh-btn" onClick={() => {
              fetchLeaderboard();
              fetchUserRank();
              fetchStats();
            }}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={FiUsers}
            title="Total Participants"
            value={formatNumber(stats.totalParticipants)}
          />
          <StatsCard
            icon={FiDollarSign}
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            subtitle="All participants"
          />
          <StatsCard
            icon={FiTrendingUp}
            title="Average Earnings"
            value={formatCurrency(stats.averageEarnings)}
          />
          <StatsCard
            icon={FiStar}
            title="Fastest Riser"
            value={stats.fastestRiser?.name || 'N/A'}
            subtitle={`+${stats.fastestRiser?.rise || 0} positions`}
          />
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="user-rank-card">
            <div className="user-rank-info">
              <div className="user-rank-icon">
                {userRank.rank <= 3 ? <FiTrophy /> : <FiUser />}
              </div>
              <div className="user-rank-details">
                <h3>Your Ranking</h3>
                <p>You're in the top {((userRank.rank / stats.totalParticipants) * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="user-rank-value">
              <div className="rank-number">#{userRank.rank}</div>
              <div className="rank-label">of {formatNumber(stats.totalParticipants)}</div>
            </div>
          </div>
        )}

        {/* Podium */}
        {leaderboard.length >= 3 && (
          <div className="podium-section">
            <div className="podium">
              {/* 2nd Place */}
              <div className="podium-item second">
                <div className="podium-avatar">
                  {leaderboard[1]?.avatar || leaderboard[1]?.name?.charAt(0)}
                </div>
                <div className="podium-name">{leaderboard[1]?.name}</div>
                <div className="podium-value">{getCategoryValue(leaderboard[1], category)}</div>
                <div className="podium-badge second">2nd</div>
              </div>

              {/* 1st Place */}
              <div className="podium-item first">
                <div className="podium-avatar first">
                  {leaderboard[0]?.avatar || <FiTrophy />}
                </div>
                <div className="podium-name">{leaderboard[0]?.name}</div>
                <div className="podium-value">{getCategoryValue(leaderboard[0], category)}</div>
                <div className="podium-badge first">1st</div>
              </div>

              {/* 3rd Place */}
              <div className="podium-item third">
                <div className="podium-avatar">
                  {leaderboard[2]?.avatar || leaderboard[2]?.name?.charAt(0)}
                </div>
                <div className="podium-name">{leaderboard[2]?.name}</div>
                <div className="podium-value">{getCategoryValue(leaderboard[2], category)}</div>
                <div className="podium-badge third">3rd</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <label className="anonymous-toggle">
              <input
                type="checkbox"
                checked={showAnonymous}
                onChange={(e) => setShowAnonymous(e.target.checked)}
              />
              Show Anonymous Users
            </label>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-list">
          <div className="leaderboard-header">
            <div>Rank</div>
            <div>User</div>
            <div className="hide-mobile">{getCategoryLabel(category)}</div>
            <div className="hide-mobile">Clicks</div>
            <div className="hide-mobile">Conv.</div>
            <div>Actions</div>
          </div>

          {filteredLeaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`leaderboard-row ${index < 3 ? `top-${index + 1}` : ''}`}
            >
              <div className="rank-cell">
                {getRankIcon(user.rank)}
              </div>
              <div className="user-cell">
                <div className={`user-avatar ${user.anonymous ? 'anonymous' : ''}`}>
                  {user.avatar || user.name?.charAt(0)}
                </div>
                <span className={`user-name ${user.anonymous ? 'anonymous' : ''}`}>
                  {showAnonymous || !user.anonymous ? user.name : 'Anonymous'}
                </span>
              </div>
              <div className={`value-cell ${category === 'earnings' ? 'earnings' : ''} hide-mobile`}>
                {getCategoryValue(user, category)}
              </div>
              <div className="hide-mobile">{formatNumber(user.clicks)}</div>
              <div className="hide-mobile">{formatNumber(user.conversions)}</div>
              <div className="actions-cell">
                <button
                  className="action-btn"
                  onClick={() => handleViewProfile(user)}
                >
                  <FiEye />
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleShare(user)}
                >
                  <FiShare2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Modal */}
        {showProfileModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-avatar">
                  {selectedUser.avatar || selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p className="modal-rank">Rank #{selectedUser.rank}</p>
                </div>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <div className="modal-stat-label">Total Earnings</div>
                  <div className="modal-stat-value">{formatCurrency(selectedUser.earnings)}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">Total Clicks</div>
                  <div className="modal-stat-value">{formatNumber(selectedUser.clicks)}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">Conversions</div>
                  <div className="modal-stat-value">{formatNumber(selectedUser.conversions)}</div>
                </div>
                <div className="modal-stat">
                  <div className="modal-stat-label">Referrals</div>
                  <div className="modal-stat-value">{formatNumber(selectedUser.referrals)}</div>
                </div>
              </div>

              <div className="modal-badges">
                {selectedUser.badges?.map((badge, index) => (
                  <span key={index} className="badge">{badge}</span>
                ))}
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
