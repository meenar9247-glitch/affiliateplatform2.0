import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiShare2, 
  FiCopy, 
  FiExternalLink,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiStar
} from 'react-icons/fi';

const AffiliateLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('popular');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0
  });

  // Fetch affiliate links
  useEffect(() => {
    fetchLinks();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/links`
      );
      
      if (response.data.success) {
        setLinks(response.data.links);
      }
    } catch (error) {
      toast.error('Failed to fetch affiliate links');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/categories`
      );
      
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/stats`
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  // Filter and sort links
  const filteredLinks = links
    .filter(link => {
      // Search filter
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           link.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.clickCount - a.clickCount;
        case 'commission':
          return b.commissionRate - a.commissionRate;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  // Handle copy referral link
  const handleCopyLink = async (linkId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/affiliates/generate-link/${linkId}`
      );
      
      if (response.data.success) {
        await navigator.clipboard.writeText(response.data.referralLink);
        toast.success('Referral link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to generate referral link');
    }
  };

  // Handle share
  const handleShare = (link) => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: link.title,
        text: link.description,
        url: link.originalUrl
      }).catch(console.error);
    } else {
      handleCopyLink(link._id);
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, trend }) => (
    <div className="stats-card">
      <div className="stats-icon">
        <Icon />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
        {trend && (
          <p className={`stats-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
    </div>
  );

  // Link Card Component (Grid View)
  const LinkCard = ({ link }) => (
    <div className="link-card">
      <div className="link-card-header">
        {link.imageUrl && (
          <img src={link.imageUrl} alt={link.title} className="link-image" />
        )}
        <div className="link-category">{link.category}</div>
      </div>
      
      <div className="link-card-body">
        <h3 className="link-title">{link.title}</h3>
        <p className="link-description">{link.description}</p>
        
        <div className="link-meta">
          <span className="link-commission">
            <FiDollarSign /> {link.commissionRate}% Commission
          </span>
          <span className="link-clicks">
            <FiTrendingUp /> {link.clickCount} clicks
          </span>
        </div>
      </div>
      
      <div className="link-card-footer">
        <button
          className="btn-copy"
          onClick={() => handleCopyLink(link._id)}
          title="Copy referral link"
        >
          <FiCopy />
        </button>
        <button
          className="btn-share"
          onClick={() => handleShare(link)}
          title="Share"
        >
          <FiShare2 />
        </button>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-visit"
          title="Visit original"
        >
          <FiExternalLink />
        </a>
      </div>
    </div>
  );

  // Link Row Component (List View)
  const LinkRow = ({ link }) => (
    <div className="link-row">
      <div className="link-row-info">
        {link.imageUrl && (
          <img src={link.imageUrl} alt={link.title} className="link-row-image" />
        )}
        <div className="link-row-details">
          <h3 className="link-row-title">{link.title}</h3>
          <p className="link-row-description">{link.description}</p>
          <div className="link-row-meta">
            <span className="link-category-tag">{link.category}</span>
            <span className="link-commission-tag">
              {link.commissionRate}% Commission
            </span>
            <span className="link-clicks-tag">
              {link.clickCount} clicks
            </span>
          </div>
        </div>
      </div>
      
      <div className="link-row-actions">
        <button
          className="btn-copy"
          onClick={() => handleCopyLink(link._id)}
          title="Copy referral link"
        >
          <FiCopy />
        </button>
        <button
          className="btn-share"
          onClick={() => handleShare(link)}
          title="Share"
        >
          <FiShare2 />
        </button>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-visit"
          title="Visit original"
        >
          <FiExternalLink />
        </a>
      </div>
    </div>
  );

  // Styles
  const styles = `
    .affiliates-page {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Stats Section */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stats-card {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }

    .stats-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .stats-icon {
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

    .stats-content {
      flex: 1;
    }

    .stats-content h3 {
      margin: 0 0 5px;
      font-size: 14px;
      color: #666;
    }

    .stats-value {
      margin: 0 0 5px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .stats-trend {
      margin: 0;
      font-size: 12px;
    }

    .stats-trend.positive {
      color: #28a745;
    }

    .stats-trend.negative {
      color: #dc3545;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-bar {
      position: relative;
      margin-bottom: 20px;
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
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .filter-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
      justify-content: space-between;
    }

    .filter-left {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .filter-right {
      display: flex;
      gap: 10px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
    }

    .view-toggle {
      display: flex;
      gap: 5px;
    }

    .view-btn {
      padding: 8px 12px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      color: #666;
      transition: all 0.3s ease;
    }

    .view-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .view-btn:hover:not(.active) {
      background: #f8f9fa;
    }

    /* Grid View */
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .link-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .link-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .link-card-header {
      position: relative;
      height: 160px;
      background: #f8f9fa;
    }

    .link-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .link-category {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .link-card-body {
      padding: 20px;
    }

    .link-title {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .link-description {
      margin: 0 0 15px;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }

    .link-meta {
      display: flex;
      gap: 15px;
    }

    .link-commission,
    .link-clicks {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #666;
    }

    .link-commission {
      color: #28a745;
    }

    .link-clicks {
      color: #667eea;
    }

    .link-card-footer {
      display: flex;
      border-top: 1px solid #e9ecef;
    }

    .link-card-footer button,
    .link-card-footer a {
      flex: 1;
      padding: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      transition: all 0.3s ease;
      text-align: center;
      text-decoration: none;
    }

    .link-card-footer button:hover,
    .link-card-footer a:hover {
      background: #f8f9fa;
      color: #667eea;
    }

    .link-card-footer button:not(:last-child),
    .link-card-footer a:not(:last-child) {
      border-right: 1px solid #e9ecef;
    }

    /* List View */
    .links-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .link-row {
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.3s ease;
    }

    .link-row:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .link-row-info {
      display: flex;
      gap: 15px;
      flex: 1;
    }

    .link-row-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .link-row-details {
      flex: 1;
    }

    .link-row-title {
      margin: 0 0 5px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .link-row-description {
      margin: 0 0 10px;
      font-size: 14px;
      color: #666;
    }

    .link-row-meta {
      display: flex;
      gap: 10px;
    }

    .link-category-tag,
    .link-commission-tag,
    .link-clicks-tag {
      padding: 4px 8px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }

    .link-commission-tag {
      background: #d4edda;
      color: #155724;
    }

    .link-clicks-tag {
      background: #e8f0fe;
      color: #667eea;
    }

    .link-row-actions {
      display: flex;
      gap: 5px;
    }

    .link-row-actions button,
    .link-row-actions a {
      padding: 8px 12px;
      background: none;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      color: #666;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .link-row-actions button:hover,
    .link-row-actions a:hover {
      background: #f8f9fa;
      color: #667eea;
      border-color: #667eea;
    }

    /* Loading and Empty States */
    .loading-state,
    .empty-state {
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

    .empty-state p {
      margin: 10px 0;
      color: #999;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stats-card,
      .filters-section,
      .link-card,
      .link-row {
        background: #2d3748;
      }

      .stats-content h3 {
        color: #a0aec0;
      }

      .stats-value {
        color: #f7fafc;
      }

      .link-title,
      .link-row-title {
        color: #f7fafc;
      }

      .link-description,
      .link-row-description {
        color: #e2e8f0;
      }

      .search-bar input,
      .filter-select {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .view-btn {
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .view-btn:hover:not(.active) {
        background: #1a202c;
      }

      .link-card-footer {
        border-top-color: #4a5568;
      }

      .link-card-footer button,
      .link-card-footer a {
        color: #e2e8f0;
      }

      .link-card-footer button:hover,
      .link-card-footer a:hover {
        background: #1a202c;
      }

      .link-category-tag,
      .link-commission-tag,
      .link-clicks-tag {
        background: #1a202c;
        color: #e2e8f0;
      }

      .link-commission-tag {
        background: #1e3a2e;
        color: #9ae6b4;
      }

      .link-clicks-tag {
        background: #1a2a4a;
        color: #90cdf4;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-left {
        flex-direction: column;
      }

      .filter-right {
        justify-content: space-between;
      }

      .link-row {
        flex-direction: column;
        gap: 15px;
      }

      .link-row-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .link-row-meta {
        flex-wrap: wrap;
        justify-content: center;
      }

      .link-row-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="affiliates-page">
        {/* Stats Section */}
        <div className="stats-grid">
          <StatsCard icon={FiDollarSign} title="Total Earnings" value={`$${stats.totalEarnings?.toFixed(2) || '0.00'}`} trend={12} />
          <StatsCard icon={FiTrendingUp} title="Total Clicks" value={stats.totalClicks || 0} trend={8} />
          <StatsCard icon={FiStar} title="Conversions" value={stats.totalConversions || 0} trend={5} />
          <StatsCard icon={FiClock} title="Active Links" value={stats.totalLinks || 0} />
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search affiliate links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-left">
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="commission">Highest Commission</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="filter-right">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links Display */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading affiliate links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="empty-state">
            <p>No affiliate links found</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="links-grid">
              {filteredLinks.map(link => (
                <LinkCard key={link._id} link={link} />
              ))}
            </div>
          ) : (
            <div className="links-list">
              {filteredLinks.map(link => (
                <LinkRow key={link._id} link={link} />
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default AffiliateLinks;
