import React, { useState, useEffect } from 'react';
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiFilter,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCalendar,
  FiClock,
  FiUser,
  FiServer,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiMapPin,
  FiFlag,
  FiLock,
  FiUnlock,
  FiLogIn,
  FiLogOut,
  FiDollarSign,
  FiShoppingCart,
  FiSettings,
  FiFileText,
  FiMail,
  FiMessageCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
  FiCopy,
  FiPrinter,
  FiArchive,
  FiClock as FiClockSolid
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [logType, setLogType] = useState('all');
  const [logLevel, setLogLevel] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [ipFilter, setIpFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
    critical: 0,
    login: 0,
    payment: 0,
    affiliate: 0,
    admin: 0,
    uniqueUsers: 0,
    uniqueIPs: 0,
    peakHour: '',
    peakDay: ''
  });

  // Log Types
  const logTypes = [
    { value: 'all', label: 'All Types', icon: <FiActivity /> },
    { value: 'auth', label: 'Authentication', icon: <FiLock /> },
    { value: 'user', label: 'User Activity', icon: <FiUser /> },
    { value: 'affiliate', label: 'Affiliate', icon: <FiStar /> },
    { value: 'payment', label: 'Payment', icon: <FiDollarSign /> },
    { value: 'admin', label: 'Admin', icon: <FiSettings /> },
    { value: 'system', label: 'System', icon: <FiServer /> },
    { value: 'api', label: 'API Calls', icon: <FiGlobe /> },
    { value: 'email', label: 'Email', icon: <FiMail /> },
    { value: 'security', label: 'Security', icon: <FiLock /> }
  ];

  // Log Levels
  const logLevels = [
    { value: 'all', label: 'All Levels', icon: <FiInfo /> },
    { value: 'info', label: 'Info', icon: <FiInfo />, color: '#17a2b8' },
    { value: 'success', label: 'Success', icon: <FiCheckCircle />, color: '#28a745' },
    { value: 'warning', label: 'Warning', icon: <FiAlertCircle />, color: '#ffc107' },
    { value: 'error', label: 'Error', icon: <FiXCircle />, color: '#dc3545' },
    { value: 'critical', label: 'Critical', icon: <FiAlertCircle />, color: '#dc3545' }
  ];

  // Date range options
  const dateRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '12h', label: 'Last 12 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Action types for filter
  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'register', label: 'Register' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'commission', label: 'Commission' },
    { value: 'link_created', label: 'Link Created' },
    { value: 'profile_update', label: 'Profile Update' },
    { value: 'settings_change', label: 'Settings Change' },
    { value: 'admin_action', label: 'Admin Action' }
  ];

  useEffect(() => {
    fetchLogs();
    
    // Set up auto refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs(true);
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [logType, logLevel, dateRange, customStartDate, customEndDate, userFilter, actionFilter, autoRefresh, refreshInterval]);

  useEffect(() => {
    // Apply filters
    let filtered = [...logs];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(query) ||
        log.user?.toLowerCase().includes(query) ||
        log.ip?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query)
      );
    }
    
    // IP filter
    if (ipFilter) {
      filtered = filtered.filter(log => log.ip?.includes(ipFilter));
    }
    
    setFilteredLogs(filtered);
    setTotalLogs(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
    
    // Update stats
    updateStats(filtered);
  }, [logs, searchQuery, ipFilter]);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        type: logType !== 'all' ? logType : undefined,
        level: logLevel !== 'all' ? logLevel : undefined,
        range: dateRange,
        startDate: customStartDate,
        endDate: customEndDate,
        user: userFilter !== 'all' ? userFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 1000
      };
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/logs`,
        { params, headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setLogs(response.data.logs);
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStats = (filteredLogs) => {
    const newStats = {
      total: filteredLogs.length,
      info: filteredLogs.filter(l => l.level === 'info').length,
      success: filteredLogs.filter(l => l.level === 'success').length,
      warning: filteredLogs.filter(l => l.level === 'warning').length,
      error: filteredLogs.filter(l => l.level === 'error').length,
      critical: filteredLogs.filter(l => l.level === 'critical').length,
      login: filteredLogs.filter(l => l.action === 'login' || l.action === 'logout').length,
      payment: filteredLogs.filter(l => l.category === 'payment').length,
      affiliate: filteredLogs.filter(l => l.category === 'affiliate').length,
      admin: filteredLogs.filter(l => l.category === 'admin').length,
      uniqueUsers: new Set(filteredLogs.map(l => l.userId)).size,
      uniqueIPs: new Set(filteredLogs.map(l => l.ip)).size
    };
    setStats(newStats);
  };

  const handleRefresh = () => {
    fetchLogs(true);
    toast.success('Logs refreshed');
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Logs cleared successfully');
      fetchLogs();
    } catch (error) {
      toast.error('Failed to clear logs');
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/logs/export/${format}`,
        {
          params: {
            type: logType !== 'all' ? logType : undefined,
            level: logLevel !== 'all' ? logLevel : undefined,
            range: dateRange,
            startDate: customStartDate,
            endDate: customEndDate
          },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/logs/${logId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Log deleted');
      fetchLogs();
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  const getLevelIcon = (level) => {
    switch(level) {
      case 'info': return <FiInfo style={{ color: '#17a2b8' }} />;
      case 'success': return <FiCheckCircle style={{ color: '#28a745' }} />;
      case 'warning': return <FiAlertCircle style={{ color: '#ffc107' }} />;
      case 'error': return <FiXCircle style={{ color: '#dc3545' }} />;
      case 'critical': return <FiAlertCircle style={{ color: '#dc3545' }} />;
      default: return <FiInfo />;
    }
  };

  const getLevelBadge = (level) => {
    switch(level) {
      case 'info':
        return { bg: '#e3f2fd', color: '#17a2b8', text: 'Info' };
      case 'success':
        return { bg: '#e8f5e9', color: '#28a745', text: 'Success' };
      case 'warning':
        return { bg: '#fff3e0', color: '#ffc107', text: 'Warning' };
      case 'error':
        return { bg: '#ffebee', color: '#dc3545', text: 'Error' };
      case 'critical':
        return { bg: '#fde9e9', color: '#dc3545', text: 'Critical' };
      default:
        return { bg: '#f5f5f5', color: '#666', text: level };
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'login': return <FiLogIn />;
      case 'logout': return <FiLogOut />;
      case 'register': return <FiUser />;
      case 'withdrawal': return <FiDollarSign />;
      case 'commission': return <FiTrendingUp />;
      case 'link_created': return <FiCopy />;
      case 'profile_update': return <FiSettings />;
      case 'admin_action': return <FiActivity />;
      default: return <FiActivity />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleString();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Logs</h1>
          <p style={styles.subtitle}>Monitor and analyze system activity</p>
        </div>
        <div style={styles.headerActions}>
          {/* Auto Refresh Toggle */}
          <label style={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
          
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={styles.refreshIntervalSelect}
            >
              <option value="10">10 sec</option>
              <option value="30">30 sec</option>
              <option value="60">1 min</option>
              <option value="300">5 min</option>
            </select>
          )}
          
          <button
            style={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          
          <button
            style={styles.exportBtn}
            onClick={() => handleExport('csv')}
          >
            <FiDownload />
            Export
          </button>
          
          <button
            style={styles.clearBtn}
            onClick={handleClearLogs}
          >
            <FiTrash2 />
            Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconWrapper}>
            <FiActivity style={styles.statIcon} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.total.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Logs</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#e3f2fd'}}>
            <FiInfo style={{...styles.statIcon, color: '#17a2b8'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.info}</div>
            <div style={styles.statLabel}>Info</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#e8f5e9'}}>
            <FiCheckCircle style={{...styles.statIcon, color: '#28a745'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.success}</div>
            <div style={styles.statLabel}>Success</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#fff3e0'}}>
            <FiAlertCircle style={{...styles.statIcon, color: '#ffc107'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.warning}</div>
            <div style={styles.statLabel}>Warning</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#ffebee'}}>
            <FiXCircle style={{...styles.statIcon, color: '#dc3545'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.error}</div>
            <div style={styles.statLabel}>Error</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#fde9e9'}}>
            <FiAlertCircle style={{...styles.statIcon, color: '#dc3545'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.critical}</div>
            <div style={styles.statLabel}>Critical</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#f0f4ff'}}>
            <FiUser style={{...styles.statIcon, color: '#667eea'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.uniqueUsers}</div>
            <div style={styles.statLabel}>Unique Users</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIconWrapper, background: '#f0f4ff'}}>
            <FiGlobe style={{...styles.statIcon, color: '#667eea'}} />
          </div>
          <div>
            <div style={styles.statValue}>{stats.uniqueIPs}</div>
            <div style={styles.statLabel}>Unique IPs</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersRow}>
          {/* Search */}
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Log Type Filter */}
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            style={styles.filterSelect}
          >
            {logTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Log Level Filter */}
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            style={styles.filterSelect}
          >
            {logLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setShowCustomDate(e.target.value === 'custom');
            }}
            style={styles.filterSelect}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* IP Filter */}
          <input
            type="text"
            placeholder="Filter by IP..."
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            style={styles.ipInput}
          />
        </div>

        {showCustomDate && (
          <div style={styles.customDateRange}>
            <input
              type="datetime-local"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span>to</span>
            <input
              type="datetime-local"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        )}
      </div>
{/* Logs Table */}
<div style={styles.tableContainer}>
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Timestamp</th>
        <th style={styles.th}>Level</th>
        <th style={styles.th}>Type</th>
        <th style={styles.th}>User</th>
        <th style={styles.th}>Action</th>
        <th style={styles.th}>Message</th>
        <th style={styles.th}>IP Address</th>
        <th style={styles.th}>Location</th>
        <th style={styles.th}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentLogs.map((log) => {
        const level = getLevelBadge(log.level);
        return (
          <tr key={log.id} style={styles.tr}>
            <td style={styles.td}>
              <div style={styles.timestamp}>
                <FiClock style={styles.timestampIcon} />
                <span>{formatTimestamp(log.timestamp)}</span>
              </div>
            </td>
            
            <td style={styles.td}>
              <span style={{
                ...styles.levelBadge,
                background: level.bg,
                color: level.color
              }}>
                {getLevelIcon(log.level)}
                {level.text}
              </span>
            </td>
            
            <td style={styles.td}>
              <span style={styles.logType}>
                {logTypes.find(t => t.value === log.type)?.icon}
                {log.type}
              </span>
            </td>
            
            <td style={styles.td}>
              <div style={styles.userInfo}>
                <FiUser style={styles.userIcon} />
                <span>{log.user || 'System'}</span>
                {log.userId && <span style={styles.userId}>({log.userId})</span>}
              </div>
            </td>
            
            <td style={styles.td}>
              <div style={styles.actionInfo}>
                {getActionIcon(log.action)}
                <span>{log.action}</span>
              </div>
            </td>
            
            <td style={styles.td}>
              <div style={styles.messageCell}>
                <span style={styles.message}>{log.message}</span>
                {log.details && (
                  <button
                    style={styles.viewDetailsBtn}
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetails(true);
                    }}
                  >
                    <FiEye />
                  </button>
                )}
              </div>
            </td>
            
            <td style={styles.td}>
              <code style={styles.ipAddress}>{log.ip}</code>
            </td>
            
            <td style={styles.td}>
              {log.location ? (
                <div style={styles.location}>
                  <FiMapPin style={styles.locationIcon} />
                  <span>{log.location}</span>
                </div>
              ) : (
                <span style={styles.na}>N/A</span>
              )}
            </td>
            
            <td style={styles.td}>
              <div style={styles.actionButtons}>
                <button
                  style={styles.actionBtn}
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetails(true);
                  }}
                  title="View Details"
                >
                  <FiEye />
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleDeleteLog(log.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

{/* Pagination */}
<div style={styles.pagination}>
  <button
    style={styles.pageBtn}
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    Previous
  </button>
  <span style={styles.pageInfo}>
    Page {currentPage} of {totalPages} ({totalLogs} total logs)
  </span>
  <button
    style={styles.pageBtn}
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>

{/* Log Details Modal */}
{showDetails && selectedLog && (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>Log Details</h2>
        <button
          style={styles.modalClose}
          onClick={() => setShowDetails(false)}
        >
          ×
        </button>
      </div>
      
      <div style={styles.modalContent}>
        {/* Basic Info */}
        <div style={styles.detailsSection}>
          <h3 style={styles.detailsSectionTitle}>Basic Information</h3>
          <div style={styles.detailsGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Log ID:</span>
              <code style={styles.detailValue}>{selectedLog.id}</code>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Timestamp:</span>
              <span style={styles.detailValue}>
                {new Date(selectedLog.timestamp).toLocaleString()}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Level:</span>
              <span style={{
                ...styles.levelValue,
                ...getLevelBadge(selectedLog.level)
              }}>
                {getLevelIcon(selectedLog.level)}
                {selectedLog.level}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Type:</span>
              <span style={styles.detailValue}>{selectedLog.type}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Action:</span>
              <span style={styles.detailValue}>{selectedLog.action}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={styles.detailsSection}>
          <h3 style={styles.detailsSectionTitle}>User Information</h3>
          <div style={styles.detailsGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>User:</span>
              <span style={styles.detailValue}>{selectedLog.user || 'System'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>User ID:</span>
              <span style={styles.detailValue}>{selectedLog.userId || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Email:</span>
              <span style={styles.detailValue}>{selectedLog.userEmail || 'N/A'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Role:</span>
              <span style={styles.detailValue}>{selectedLog.userRole || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Request Info */}
        <div style={styles.detailsSection}>
          <h3 style={styles.detailsSectionTitle}>Request Information</h3>
          <div style={styles.detailsGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>IP Address:</span>
              <code style={styles.detailValue}>{selectedLog.ip}</code>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Location:</span>
              <span style={styles.detailValue}>{selectedLog.location || 'Unknown'}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>User Agent:</span>
              <span style={styles.detailValue}>{selectedLog.userAgent}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Device:</span>
              <span style={styles.detailValue}>{selectedLog.device}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Browser:</span>
              <span style={styles.detailValue}>{selectedLog.browser}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>OS:</span>
              <span style={styles.detailValue}>{selectedLog.os}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div style={styles.detailsSection}>
          <h3 style={styles.detailsSectionTitle}>Message</h3>
          <div style={styles.messageBox}>
            {selectedLog.message}
          </div>
        </div>

        {/* Details */}
        {selectedLog.details && (
          <div style={styles.detailsSection}>
            <h3 style={styles.detailsSectionTitle}>Additional Details</h3>
            <pre style={styles.detailsPre}>
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>
          </div>
        )}

        {/* Metadata */}
        {selectedLog.metadata && (
          <div style={styles.detailsSection}>
            <h3 style={styles.detailsSectionTitle}>Metadata</h3>
            <pre style={styles.detailsPre}>
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={styles.modalFooter}>
        <button
          style={styles.modalCloseBtn}
          onClick={() => setShowDetails(false)}
        >
          Close
        </button>
        <button
          style={styles.modalCopyBtn}
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
            toast.success('Copied to clipboard');
          }}
        >
          <FiCopy />
          Copy JSON
        </button>
      </div>
    </div>
  </div>
)}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: '0 0 5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  autoRefreshLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#666'
  },
  refreshIntervalSelect: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '13px'
  },
  refreshBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  exportBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  clearBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statIcon: {
    fontSize: '18px',
    color: '#667eea'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: '10px',
    color: '#666'
  },
  filtersSection: {
    marginBottom: '20px'
  },
  filtersRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  searchBox: {
    position: 'relative',
    flex: 2,
    minWidth: '250px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999'
  },
  searchInput: {
    width: '100%',
    padding: '10px 10px 10px 40px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '150px'
  },
  ipInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '150px'
  },
  customDateRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  dateInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    maxHeight: '600px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1200px'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  tr: {
    borderBottom: '1px solid #e9ecef',
    '&:hover': {
      background: '#f8f9fa'
    }
  },
  td: {
    padding: '12px',
    fontSize: '13px',
    color: '#333'
  },
  timestamp: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#666'
  },
  timestampIcon: {
    fontSize: '12px',
    color: '#999'
  },
  levelBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  logType: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  userIcon: {
    fontSize: '12px',
    color: '#999'
  },
  userId: {
    fontSize: '10px',
    color: '#999',
    marginLeft: '3px'
  },
  actionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  messageCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    maxWidth: '300px'
  },
  message: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  viewDetailsBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer'
  },
  ipAddress: {
    fontSize: '12px',
    background: '#f8f9fa',
    padding: '2px 4px',
    borderRadius: '3px'
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '12px'
  },
  locationIcon: {
    fontSize: '12px',
    color: '#999'
  },
  na: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  },
  actionButtons: {
    display: 'flex',
    gap: '5px'
  },
  actionBtn: {
    padding: '4px',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    color: '#666'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px'
  },
  pageBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#666'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 10
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  modalContent: {
    padding: '20px'
  },
  modalFooter: {
    padding: '20px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  modalCloseBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  modalCopyBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  detailsSection: {
    marginBottom: '25px'
  },
  detailsSectionTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '8px'
  },
  detailsGrid: {
    display: 'grid',
    gap: '10px'
  },
  detailRow: {
    display: 'flex',
    fontSize: '14px'
  },
  detailLabel: {
    width: '120px',
    color: '#666',
    fontWeight: 500
  },
  detailValue: {
    flex: 1,
    color: '#333'
  },
  levelValue: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  messageBox: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  detailsPre: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  }
};

export default AdminLogs;
