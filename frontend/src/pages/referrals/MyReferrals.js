import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiUsers, 
  FiUserPlus, 
  FiDollarSign, 
  FiTrendingUp,
  FiCopy,
  FiShare2,
  FiDownload,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiStar,
  FiMail,
  FiMessageCircle,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiWhatsApp,
  FiRefreshCw,
  FiBarChart2
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const MyReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    averageCommission: 0,
    conversionRate: 0
  });
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchReferrals();
    fetchStats();
    fetchReferralCode();
    fetchLeaderboard();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/my-referrals`
      );
      
      if (response.data.success) {
        setReferrals(response.data.referrals);
      }
    } catch (error) {
      toast.error('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/stats`
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchReferralCode = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/my-code`
      );
      
      if (response.data.success) {
        setReferralCode(response.data.code);
        setReferralLink(`${window.location.origin}/register?ref=${response.data.code}`);
      }
    } catch (error) {
      console.error('Failed to fetch referral code');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/leaderboard`
      );
      
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Affiliate Platform',
        text: 'Use my referral code to sign up and start earning!',
        url: referralLink
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  const handleSendInvite = (email) => {
    // Implement email invite functionality
    toast.success(`Invitation sent to ${email}`);
  };

  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowDetailsModal(true);
  };

  const handleExportData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/export`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-referrals.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Referrals exported successfully');
    } catch (error) {
      toast.error('Failed to export referrals');
    }
  };

  // Filter and sort referrals
  const filteredReferrals = referrals
    .filter(ref => {
      // Search filter
      const matchesSearch = ref.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ref.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || ref.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.joinedAt) - new Date(a.joinedAt);
        case 'oldest':
          return new Date(a.joinedAt) - new Date(b.joinedAt);
        case 'earnings':
          return (b.totalEarned || 0) - (a.totalEarned || 0);
        case 'activity':
          return (b.activity || 0) - (a.activity || 0);
        default:
          return 0;
      }
    });

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, change }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last month
          </p>
        )}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .referrals-page {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      margin: 0 0 10px;
      font-size: 32px;
      color: #333;
    }

    .page-header p {
      margin: 0;
      color: #666;
    }

    /* Referral Code Section */
    .referral-code-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 30px;
      margin-bottom: 30px;
      color: white;
    }

    .referral-code-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }

    .referral-info h3 {
      margin: 0 0 10px;
      font-size: 20px;
    }

    .referral-info p {
      margin: 0;
      opacity: 0.9;
    }

    .referral-code-box {
      display: flex;
      gap: 10px;
      background: rgba(255,255,255,0.2);
      padding: 5px;
      border-radius: 8px;
    }

    .referral-code {
      padding: 10px 20px;
      background: white;
      border-radius: 5px;
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 2px;
    }

    .referral-actions {
      display: flex;
      gap: 10px;
    }

    .ref-action-btn {
      padding: 10px 20px;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 5px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
    }

    .ref-action-btn:hover {
      background: rgba(255,255,255,0.3);
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
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stat-change {
      margin: 0;
      font-size: 12px;
    }

    .stat-change.positive {
      color: #28a745;
    }

    .stat-change.negative {
      color: #dc3545;
    }

    /* Invite Section */
    .invite-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .invite-section h3 {
      margin: 0 0 15px;
      font-size: 18px;
      color: #333;
    }

    .invite-form {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .invite-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .invite-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .invite-btn {
      padding: 12px 24px;
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

    .invite-btn:hover {
      background: #5a67d8;
    }

    .share-buttons {
      display: flex;
      gap: 10px;
    }

    .share-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      color: white;
      transition: all 0.3s ease;
    }

    .share-btn.twitter { background: #1DA1F2; }
    .share-btn.facebook { background: #4267B2; }
    .share-btn.linkedin { background: #0077b5; }
    .share-btn.whatsapp { background: #25D366; }
    .share-btn.email { background: #EA4335; }

    .share-btn:hover {
      transform: translateY(-2px);
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

    /* Table */
    .table-container {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
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

    .referrals-table {
      width: 100%;
      border-collapse: collapse;
    }

    .referrals-table th {
      padding: 12px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .referrals-table td {
      padding: 12px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    .referrals-table tr:hover td {
      background: #f8f9fa;
    }

    .referral-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .view-btn {
      padding: 4px 8px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      color: #666;
      transition: all 0.3s ease;
    }

    .view-btn:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    /* Leaderboard Section */
    .leaderboard-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-top: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .leaderboard-section h3 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .leaderboard-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .leaderboard-item:last-child {
      border-bottom: none;
    }

    .rank {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .rank-1 {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }

    .rank-2 {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    }

    .rank-3 {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    .referrer-info {
      flex: 1;
    }

    .referrer-name {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .referrer-stats {
      font-size: 12px;
      color: #999;
    }

    .referrer-earnings {
      font-weight: 600;
      color: #28a745;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stat-card,
      .invite-section,
      .filters-section,
      .table-container,
      .leaderboard-section,
      .modal-content {
        background: #2d3748;
      }

      .page-header h1 {
        color: #f7fafc;
      }

      .page-header p,
      .stat-content h3,
      .table-header h3,
      .leaderboard-section h3 {
        color: #e2e8f0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .search-bar input,
      .invite-input,
      .filter-select {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .referrals-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .referrals-table td {
        border-top-color: #4a5568;
        color: #e2e8f0;
      }

      .referrals-table tr:hover td {
        background: #1a202c;
      }

      .export-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .export-btn:hover {
        background: #4a5568;
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
      .referral-code-content {
        flex-direction: column;
        text-align: center;
      }

      .referral-code-box {
        flex-direction: column;
        width: 100%;
      }

      .invite-form {
        flex-direction: column;
      }

      .share-buttons {
        flex-wrap: wrap;
      }

      .share-btn {
        flex: auto;
        min-width: 150px;
      }

      .filter-controls {
        flex-direction: column;
      }

      .referrals-table {
        font-size: 14px;
      }

      .referrals-table th,
      .referrals-table td {
        padding: 8px;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading referrals...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="referrals-page">
        {/* Header */}
        <div className="page-header">
          <h1>My Referrals</h1>
          <p>Track and manage your referred users</p>
        </div>

        {/* Referral Code Section */}
        <div className="referral-code-section">
          <div className="referral-code-content">
            <div className="referral-info">
              <h3>Your Referral Code</h3>
              <p>Share this code with friends to earn commissions</p>
            </div>
            <div className="referral-code-box">
              <span className="referral-code">{referralCode}</span>
              <div className="referral-actions">
                <button className="ref-action-btn" onClick={handleCopyCode}>
                  <FiCopy /> Copy
                </button>
                <button className="ref-action-btn" onClick={() => setShowQR(true)}>
                  <FiShare2 /> QR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard icon={FiUsers} title="Total Referrals" value={stats.totalReferrals} change={12} />
          <StatsCard icon={FiUserPlus} title="Active Referrals" value={stats.activeReferrals} change={8} />
          <StatsCard icon={FiDollarSign} title="Total Earned" value={`$${stats.totalEarned?.toFixed(2)}`} change={15}/>
          <StatsCard icon={FiTrendingUp} title="Conversion Rate" value={`${stats.conversionRate}%`} change={5} />
        </div>

        {/* Invite Section */}
        <div className="invite-section">
          <h3>Invite New Users</h3>
          <div className="invite-form">
            <input
              type="email"
              placeholder="Enter email address"
              className="invite-input"
            />
            <button className="invite-btn" onClick={() => handleSendInvite()}>
              <FiMail /> Send Invite
            </button>
          </div>
          <div className="share-buttons">
            <button className="share-btn twitter" onClick={handleShare}>
              <FiTwitter /> Twitter
            </button>
            <button className="share-btn facebook" onClick={handleShare}>
              <FiFacebook /> Facebook
            </button>
            <button className="share-btn linkedin" onClick={handleShare}>
              <FiLinkedin /> LinkedIn
            </button>
            <button className="share-btn whatsapp" onClick={handleShare}>
              <FiWhatsApp /> WhatsApp
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="earnings">Highest Earnings</option>
              <option value="activity">Most Active</option>
            </select>
            <select
              className="filter-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>Referral List</h3>
            <button className="export-btn" onClick={handleExportData}>
              <FiDownload /> Export CSV
            </button>
          </div>
          
          {filteredReferrals.length > 0 ? (
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Earnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.map((referral) => (
                  <tr key={referral._id}>
                    <td>{referral.name}</td>
                    <td>{referral.email}</td>
                    <td>
                      <span className={`referral-status status-${referral.status}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td>{new Date(referral.joinedAt).toLocaleDateString()}</td>
                    <td>${referral.totalEarned?.toFixed(2) || '0.00'}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewDetails(referral)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No referrals found</p>
          )}
        </div>

        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <div className="leaderboard-section">
            <h3><FiAward /> Top Referrers This Month</h3>
            <ul className="leaderboard-list">
              {leaderboard.map((referrer, index) => (
                <li key={index} className="leaderboard-item">
                  <div className={`rank ${index < 3 ? `rank-${index + 1}` : ''}`}>
                    {index + 1}
                  </div>
                  <div className="referrer-info">
                    <p className="referrer-name">{referrer.name}</p>
                    <p className="referrer-stats">
                      {referrer.referralCount} referrals • {referrer.conversionCount} conversions
                    </p>
                  </div>
                  <div className="referrer-earnings">
                    ${referrer.totalEarned.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* QR Code Modal */}
        {showQR && (
          <div className="modal-overlay" onClick={() => setShowQR(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Referral QR Code</h3>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <QRCodeSVG value={referralLink} size={200} />
              </div>
              <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                Scan this QR code to share your referral link
              </p>
              <button className="modal-close-btn" onClick={() => setShowQR(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Referral Details Modal */}
        {showDetailsModal && selectedReferral && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Referral Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedReferral.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedReferral.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{selectedReferral.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span className="detail-value">
                    {new Date(selectedReferral.joinedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Earned:</span>
                  <span className="detail-value">
                    ${selectedReferral.totalEarned?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Conversions:</span>
                  <span className="detail-value">{selectedReferral.conversions || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Activity:</span>
                  <span className="detail-value">
                    {selectedReferral.lastActivity ? 
                      new Date(selectedReferral.lastActivity).toLocaleDateString() : 
                      'N/A'}
                  </span>
                </div>
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

export default MyReferrals;
