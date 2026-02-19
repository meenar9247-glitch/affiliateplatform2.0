import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiCopy, 
  FiShare2, 
  FiExternalLink,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiQrCode,
  FiMail,
  FiMessageCircle,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiWhatsApp
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const LinkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    clicks: [],
    conversions: [],
    earnings: []
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchLinkDetails();
    fetchStats();
    fetchRecentActivity();
  }, [id]);

  const fetchLinkDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/links/${id}`
      );
      
      if (response.data.success) {
        setLink(response.data.link);
      }
    } catch (error) {
      toast.error('Failed to fetch link details');
      navigate('/affiliates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/stats/${id}`,
        { params: { timeRange } }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/recent-activity/${id}`
      );
      
      if (response.data.success) {
        setRecentActivity(response.data.activity);
      }
    } catch (error) {
      console.error('Failed to fetch recent activity');
    }
  };

  const handleCopyLink = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/generate-link/${id}`
      );
      
      if (response.data.success) {
        await navigator.clipboard.writeText(response.data.referralLink);
        toast.success('Referral link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to generate referral link');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: link.title,
        text: link.description,
        url: link.originalUrl
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/affiliates/links/${id}/toggle-status`
      );
      
      if (response.data.success) {
        setLink({ ...link, isActive: !link.isActive });
        toast.success(`Link ${link.isActive ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (error) {
      toast.error('Failed to toggle link status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/affiliates/links/${id}`
        );
        
        if (response.data.success) {
          toast.success('Link deleted successfully');
          navigate('/affiliates');
        }
      } catch (error) {
        toast.error('Failed to delete link');
      }
    }
  };

  const handleExportData = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/export/${id}`,
        { params: { format, timeRange } }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `link-stats-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, change }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {change !== undefined && (
          <p className={`stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .link-details-page {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .back-btn {
      padding: 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: #f8f9fa;
      color: #667eea;
      border-color: #667eea;
    }

    .header-content {
      flex: 1;
    }

    .header-content h1 {
      margin: 0 0 5px;
      font-size: 28px;
      color: #333;
    }

    .header-meta {
      display: flex;
      gap: 15px;
      color: #666;
      font-size: 14px;
    }

    .link-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .link-status.active {
      background: #d4edda;
      color: #155724;
    }

    .link-status.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .link-id {
      font-family: monospace;
      color: #999;
    }

    /* Action Bar */
    .action-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 10px 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .action-btn.primary {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .action-btn.primary:hover {
      background: #5a67d8;
    }

    .action-btn.danger {
      color: #dc3545;
      border-color: #dc3545;
    }

    .action-btn.danger:hover {
      background: #dc3545;
      color: white;
    }

    /* Link Info Card */
    .link-info-card {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .link-info-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .link-image {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      object-fit: cover;
    }

    .link-details h2 {
      margin: 0 0 10px;
      font-size: 24px;
      color: #333;
    }

    .link-details p {
      margin: 0 0 15px;
      color: #666;
      line-height: 1.6;
    }

    .link-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      font-size: 14px;
    }

    .commission {
      color: #28a745;
      font-weight: 600;
    }

    .link-url-box {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .link-url {
      flex: 1;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-family: monospace;
      color: #666;
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

    /* Charts Section */
    .charts-section {
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

    .time-range-select {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    .chart-placeholder {
      height: 300px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    /* QR Code Modal */
    .qr-modal {
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

    .qr-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      max-width: 90%;
    }

    .qr-content h3 {
      margin: 0 0 20px;
      color: #333;
    }

    .qr-code {
      margin-bottom: 20px;
    }

    .qr-close-btn {
      padding: 10px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    /* Recent Activity */
    .activity-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .activity-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .activity-details {
      flex: 1;
    }

    .activity-title {
      margin: 0 0 5px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .activity-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: #999;
    }

    .activity-amount {
      font-weight: 600;
    }

    .activity-amount.conversion {
      color: #28a745;
    }

    .activity-amount.earnings {
      color: #667eea;
    }

    /* Share Buttons */
    .share-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
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
      gap: 8px;
      color: white;
      transition: all 0.3s ease;
    }

    .share-btn.twitter {
      background: #1DA1F2;
    }

    .share-btn.facebook {
      background: #4267B2;
    }

    .share-btn.linkedin {
      background: #0077b5;
    }

    .share-btn.whatsapp {
      background: #25D366;
    }

    .share-btn.email {
      background: #EA4335;
    }

    .share-btn:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    /* Loading and Error States */
    .loading-state,
    .error-state {
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
      .link-info-card,
      .stat-card,
      .chart-card,
      .activity-card {
        background: #2d3748;
      }

      .header-content h1,
      .link-details h2,
      .chart-header h3 {
        color: #f7fafc;
      }

      .link-details p,
      .meta-item,
      .link-url {
        color: #e2e8f0;
      }

      .link-url {
        background: #1a202c;
        border-color: #4a5568;
      }

      .stat-content h3 {
        color: #a0aec0;
      }

      .stat-value {
        color: #f7fafc;
      }

      .chart-placeholder {
        background: #1a202c;
      }

      .activity-title {
        color: #f7fafc;
      }

      .activity-meta {
        color: #a0aec0;
      }

      .activity-icon {
        background: #1a202c;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .link-info-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .link-image {
        margin: 0 auto;
      }

      .link-meta {
        justify-content: center;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .action-bar {
        flex-direction: column;
      }

      .share-buttons {
        flex-wrap: wrap;
      }

      .share-btn {
        flex: auto;
        min-width: 150px;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading link details...</p>
        </div>
      </>
    );
  }

  if (!link) {
    return (
      <>
        <style>{styles}</style>
        <div className="error-state">
          <p>Link not found</p>
          <button onClick={() => navigate('/affiliates')} className="action-btn">
            Back to Affiliates
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="link-details-page">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/affiliates')}>
            <FiArrowLeft />
          </button>
          <div className="header-content">
            <h1>{link.title}</h1>
            <div className="header-meta">
              <span className={`link-status ${link.isActive ? 'active' : 'inactive'}`}>
                {link.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="link-id">ID: {link._id}</span>
              <span>Category: {link.category}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <button className="action-btn primary" onClick={handleCopyLink}>
            <FiCopy /> Copy Link
          </button>
          <button className="action-btn" onClick={handleShare}>
            <FiShare2 /> Share
          </button>
          <button className="action-btn" onClick={() => setShowQR(true)}>
            <FiQrCode /> QR Code
          </button>
          <button className="action-btn" onClick={handleToggleStatus}>
            {link.isActive ? <FiEyeOff /> : <FiEye />}
            {link.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button className="action-btn" onClick={() => navigate(`/affiliates/edit/${id}`)}>
            <FiEdit /> Edit
          </button>
          <button className="action-btn danger" onClick={handleDelete}>
            <FiTrash2 /> Delete
          </button>
        </div>

        {/* Link Info Card */}
        <div className="link-info-card">
          <div className="link-info-grid">
            {link.imageUrl && (
              <img src={link.imageUrl} alt={link.title} className="link-image" />
            )}
            <div className="link-details">
              <h2>{link.title}</h2>
              <p>{link.description}</p>
              <div className="link-meta">
                <span className="meta-item">
                  <FiDollarSign className="commission" /> {link.commissionRate}% Commission
                </span>
                <span className="meta-item">
                  <FiTrendingUp /> {link.clickCount || 0} Clicks
                </span>
                <span className="meta-item">
                  <FiUsers /> {link.conversionCount || 0} Conversions
                </span>
                <span className="meta-item">
                  <FiClock /> Added {new Date(link.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="link-url-box">
            <input
              type="text"
              value={link.originalUrl}
              readOnly
              className="link-url"
            />
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn"
            >
              <FiExternalLink /> Visit
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard icon={FiDollarSign} title="Total Earnings" value={`$${stats.totalEarnings?.toFixed(2) || '0.00'}`} change={12} />
          <StatCard icon={FiTrendingUp} title="Total Clicks" value={stats.totalClicks || 0} change={8} />
          <StatCard icon={FiUsers} title="Conversions" value={stats.totalConversions || 0} change={5} />
          <StatCard icon={FiBarChart2} title="Conversion Rate" value={`${stats.conversionRate?.toFixed(1) || 0}%`} change={2} />
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Performance Overview</h3>
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
            </div>
            <div className="chart-placeholder">
              {/* Chart component would go here */}
              Chart visualization coming soon...
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Traffic Sources</h3>
            </div>
            <div className="chart-placeholder">
              {/* Traffic sources chart would go here */}
              Traffic sources visualization coming soon...
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h3>Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <ul className="activity-list">
              {recentActivity.map((activity, index) => (
                <li key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'click' ? <FiTrendingUp /> :
                     activity.type === 'conversion' ? <FiCheckCircle /> :
                     <FiClock />}
                  </div>
                  <div className="activity-details">
                    <p className="activity-title">{activity.description}</p>
                    <div className="activity-meta">
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.amount && (
                        <span className={`activity-amount ${activity.type === 'conversion' ? 'conversion' : 'earnings'}`}>
                          ${activity.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity</p>
          )}
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <button className="share-btn twitter">
            <FiTwitter /> Twitter
          </button>
          <button className="share-btn facebook">
            <FiFacebook /> Facebook
          </button>
          <button className="share-btn linkedin">
            <FiLinkedin /> LinkedIn
          </button>
          <button className="share-btn whatsapp">
            <FiWhatsApp /> WhatsApp
          </button>
          <button className="share-btn email">
            <FiMail /> Email
          </button>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="qr-modal" onClick={() => setShowQR(false)}>
            <div className="qr-content" onClick={(e) => e.stopPropagation()}>
              <h3>QR Code for {link.title}</h3>
              <div className="qr-code">
                <QRCodeSVG value={link.originalUrl} size={200} />
              </div>
              <button className="qr-close-btn" onClick={() => setShowQR(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LinkDetails;
