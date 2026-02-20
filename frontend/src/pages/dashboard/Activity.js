import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiClock,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiSearch,
  FiActivity as FiActivityIcon,
  FiMousePointer,
  FiShoppingCart,
  FiDollarSign,
  FiUser,
  FiLink,
  FiCreditCard,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiList,
  FiGrid
} from 'react-icons/fi';

const Activity = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    byType: {
      click: 0,
      conversion: 0,
      earning: 0,
      withdrawal: 0,
      referral: 0
    },
    byStatus: {
      success: 0,
      pending: 0,
      failed: 0
    }
  });

  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // list, grid

  // Date range
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Show filters
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, [currentPage, itemsPerPage, dateRange]);

  useEffect(() => {
    filterActivities();
  }, [activities, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/activity`,
        {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      );
      
      if (response.data.success) {
        setActivities(response.data.activities);
        setTotalPages(response.data.pagination.totalPages);
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.description?.toLowerCase().includes(searchLower) ||
        a.reference?.toLowerCase().includes(searchLower) ||
        a.details?.some(d => d.value?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredActivities(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
    toast.success('Activity refreshed');
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/dashboard/activity/export`,
        {
          params: {
            format,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            ...filters
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Activity exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export activity');
    }
  };

  const handleSelectActivity = (activityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === filteredActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(filteredActivities.map(a => a.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedActivities.length === 0) {
      toast.error('No activities selected');
      return;
    }

    // Handle bulk actions
    toast.success(`${selectedActivities.length} activities ${action}ed`);
    setSelectedActivities([]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'click':
        return <FiMousePointer />;
      case 'conversion':
        return <FiShoppingCart />;
      case 'earning':
        return <FiDollarSign />;
      case 'withdrawal':
        return <FiCreditCard />;
      case 'referral':
        return <FiUser />;
      default:
        return <FiActivityIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'click':
        return '#667eea';
      case 'conversion':
        return '#28a745';
      case 'earning':
        return '#ffc107';
      case 'withdrawal':
        return '#dc3545';
      case 'referral':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <FiCheckCircle />;
      case 'pending':
        return <FiClock />;
      case 'failed':
      case 'cancelled':
        return <FiXCircle />;
      default:
        return <FiAlertCircle />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'var(--success)';
      case 'pending':
        return 'var(--warning)';
      case 'failed':
      case 'cancelled':
        return 'var(--danger)';
      default:
        return 'var(--info)';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="stats-card">
      <div className="stats-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );

  // Activity Card Component (List View)
  const ActivityCardList = ({ activity }) => {
    const color = getActivityColor(activity.type);
    const isSelected = selectedActivities.includes(activity.id);

    return (
      <div
        className={`activity-card-list ${isSelected ? 'selected' : ''} ${activity.status}`}
        onClick={() => handleSelectActivity(activity.id)}
      >
        <div className="activity-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectActivity(activity.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="activity-icon" style={{ backgroundColor: `${color}20`, color }}>
          {getActivityIcon(activity.type)}
        </div>

        <div className="activity-content">
          <div className="activity-header">
            <div className="activity-title">
              <h4>{activity.title || activity.description}</h4>
              {activity.reference && (
                <span className="activity-reference">#{activity.reference}</span>
              )}
            </div>
            <div className="activity-status" style={{ color: getStatusColor(activity.status) }}>
              {getStatusIcon(activity.status)}
              <span>{activity.status}</span>
            </div>
          </div>

          <div className="activity-details">
            <div className="activity-meta">
              <FiClock />
              <span>{formatTime(activity.timestamp)}</span>
            </div>

            {activity.amount && (
              <div className="activity-amount" style={{ color }}>
                {activity.type === 'earning' ? '+' : activity.type === 'withdrawal' ? '-' : ''}
                {formatCurrency(activity.amount)}
              </div>
            )}

            {activity.details && (
              <button
                className="activity-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(activity.id === showDetails ? null : activity.id);
                }}
              >
                <FiMoreVertical />
              </button>
            )}
          </div>

          {showDetails === activity.id && activity.details && (
            <div className="activity-expanded-details">
              {activity.details.map((detail, index) => (
                <div key={index} className="detail-row">
                  <span className="detail-label">{detail.label}:</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Activity Card Component (Grid View)
  const ActivityCardGrid = ({ activity }) => {
    const color = getActivityColor(activity.type);
    const isSelected = selectedActivities.includes(activity.id);

    return (
      <div
        className={`activity-card-grid ${isSelected ? 'selected' : ''} ${activity.status}`}
        onClick={() => handleSelectActivity(activity.id)}
      >
        <div className="activity-header">
          <div className="activity-icon" style={{ backgroundColor: `${color}20`, color }}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="activity-status" style={{ color: getStatusColor(activity.status) }}>
            {getStatusIcon(activity.status)}
          </div>
        </div>

        <div className="activity-content">
          <h4 className="activity-title">{activity.title || activity.description}</h4>

          <div className="activity-meta">
            <FiClock />
            <span>{formatTime(activity.timestamp)}</span>
          </div>

          {activity.amount && (
            <div className="activity-amount" style={{ color }}>
              {activity.type === 'earning' ? '+' : activity.type === 'withdrawal' ? '-' : ''}
              {formatCurrency(activity.amount)}
            </div>
          )}
        </div>

        <div className="activity-footer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectActivity(activity.id)}
            onClick={(e) => e.stopPropagation()}
          />
          {activity.reference && (
            <span className="activity-reference">#{activity.reference}</span>
          )}
        </div>
      </div>
    );
  };

  // Styles
  const styles = `
    .activity-page {
      padding: 20px;
    }

    /* Header */
    .activity-header {
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
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      width: 250px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-disabled);
    }

    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .filter-btn {
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

    .filter-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .filter-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    .view-toggle {
      display: flex;
      gap: 4px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .view-btn {
      padding: 8px 12px;
      border: none;
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .view-btn.active {
      background: var(--primary);
      color: white;
    }

    .view-btn:hover:not(.active) {
      background: var(--bg-tertiary);
      color: var(--primary);
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

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stats-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }

    .stats-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .stats-content h3 {
      margin: 0 0 4px;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: var(--font-normal);
    }

    .stats-value {
      margin: 0;
      font-size: 18px;
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    /* Filters Panel */
    .filters-panel {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 20px;
      margin-bottom: 20px;
      display: ${showFilters ? 'block' : 'none'};
      animation: slideDown 0.3s ease;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .filter-group select {
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .date-range {
      display: flex;
      gap: 8px;
    }

    .date-range input {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .filters-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Bulk Actions */
    .bulk-actions {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 12px 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 2px solid var(--primary);
    }

    .selected-count {
      font-weight: var(--font-semibold);
      color: var(--primary);
    }

    .bulk-btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .bulk-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Activity List */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .activity-card-list {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      border: 1px solid transparent;
      transition: all var(--transition-fast) var(--transition-ease);
      cursor: pointer;
    }

    .activity-card-list:hover {
      transform: translateX(4px);
      box-shadow: var(--shadow-md);
    }

    .activity-card-list.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .activity-card-list.success {
      border-left: 4px solid var(--success);
    }

    .activity-card-list.pending {
      border-left: 4px solid var(--warning);
    }

    .activity-card-list.failed {
      border-left: 4px solid var(--danger);
    }

    .activity-checkbox {
      width: 20px;
    }

    .activity-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .activity-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .activity-title h4 {
      margin: 0;
      font-size: 16px;
      color: var(--text-primary);
    }

    .activity-reference {
      font-size: 12px;
      color: var(--text-disabled);
    }

    .activity-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      text-transform: capitalize;
    }

    .activity-details {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-disabled);
      font-size: 12px;
    }

    .activity-amount {
      font-weight: var(--font-bold);
      font-size: 16px;
    }

    .activity-details-btn {
      background: none;
      border: none;
      color: var(--text-disabled);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
    }

    .activity-details-btn:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .activity-expanded-details {
      margin-top: 12px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .detail-label {
      color: var(--text-disabled);
    }

    .detail-value {
      color: var(--text-primary);
      font-weight: var(--font-medium);
    }

    /* Grid View */
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .activity-card-grid {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 16px;
      border: 1px solid transparent;
      transition: all var(--transition-fast) var(--transition-ease);
      cursor: pointer;
    }

    .activity-card-grid:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .activity-card-grid.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .activity-card-grid .activity-header {
      margin-bottom: 12px;
    }

    .activity-card-grid .activity-content {
      text-align: center;
    }

    .activity-card-grid .activity-title {
      margin: 8px 0;
      justify-content: center;
    }

    .activity-card-grid .activity-meta {
      justify-content: center;
      margin: 8px 0;
    }

    .activity-card-grid .activity-amount {
      text-align: center;
      margin: 8px 0;
    }

    .activity-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }

    .pagination-info {
      color: var(--text-disabled);
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      gap: 4px;
    }

    .pagination-btn {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    .pagination-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .items-per-page {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .items-per-page select {
      padding: 6px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
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

    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stats-card,
      .filters-panel,
      .bulk-actions,
      .activity-card-list,
      .activity-card-grid {
        background: var(--dark-bg-secondary);
      }

      .stats-content h3 {
        color: var(--dark-text-muted);
      }

      .stats-value {
        color: var(--dark-text-primary);
      }

      .filter-group select,
      .date-range input,
      .search-box input,
      .items-per-page select {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .activity-title h4 {
        color: var(--dark-text-primary);
      }

      .activity-expanded-details {
        background: var(--dark-bg-tertiary);
      }

      .detail-label {
        color: var(--dark-text-muted);
      }

      .detail-value {
        color: var(--dark-text-primary);
      }

      .pagination-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .activity-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .filters-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .activity-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .header-right {
        flex-direction: column;
      }

      .search-box {
        width: 100%;
      }

      .view-toggle,
      .filter-btn,
      .action-btn {
        width: 100%;
      }

      .pagination {
        flex-direction: column;
        gap: 16px;
      }

      .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .activity-grid {
        grid-template-columns: 1fr;
      }

      .activity-card-list {
        flex-wrap: wrap;
      }

      .activity-details {
        flex-wrap: wrap;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading activity...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="activity-page">
        {/* Header */}
        <div className="activity-header">
          <div className="header-left">
            <h1>Activity Log</h1>
            <p>Track all your activities and events.</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
            </button>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
            </div>
            <button className="action-btn" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="action-btn" onClick={() => handleExport('csv')}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard title="Total Activities" value={formatNumber(stats.total)} icon={FiActivityIcon} color="#667eea" />
          <StatsCard title="Today" value={formatNumber(stats.today)} icon={FiClock} color="#28a745" />
          <StatsCard title="This Week" value={formatNumber(stats.week)} icon={FiTrendingUp} color="#ffc107" />
          <StatsCard title="Clicks" value={formatNumber(stats.byType.click)} icon={FiMousePointer} color="#17a2b8" />
          <StatsCard title="Conversions" value={formatNumber(stats.byType.conversion)} icon={FiShoppingCart} color="#dc3545" />
          <StatsCard title="Earnings" value={formatNumber(stats.byType.earning)} icon={FiDollarSign} color="#6c757d" />
        </div>

        {/* Filters Panel */}
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Activity Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="click">Clicks</option>
                <option value="conversion">Conversions</option>
                <option value="earning">Earnings</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="referral">Referrals</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="filters-actions">
            <button className="action-btn" onClick={() => setFilters({ type: 'all', status: 'all', search: '' })}>
              Clear Filters
            </button>
            <button className="action-btn" onClick={fetchActivities}>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedActivities.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedActivities.length} activities selected</span>
            <button className="bulk-btn" onClick={() => handleBulkAction('mark')}>
              Mark as Read
            </button>
            <button className="bulk-btn" onClick={() => handleBulkAction('archive')}>
              Archive
            </button>
            <button className="bulk-btn" onClick={() => handleBulkAction('export')}>
              Export Selected
            </button>
            <button className="bulk-btn" onClick={() => setSelectedActivities([])}>
              Clear Selection
            </button>
          </div>
        )}

        {/* Activity List/Grid */}
        {viewMode === 'list' ? (
          <div className="activity-list">
            {filteredActivities.map(activity => (
              <ActivityCardList key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="activity-grid">
            {filteredActivities.map(activity => (
              <ActivityCardGrid key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <FiChevronsLeft />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            <button className="pagination-btn active">{currentPage}</button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FiChevronsRight />
            </button>
          </div>
          <div className="items-per-page">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default Activity;
