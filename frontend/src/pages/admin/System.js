import axios from 'axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiServer,
  FiCpu,
  FiHardDrive,
  FiActivity,
  FiClock,
  FiUsers,
  FiDatabase,
  FiCloud,
  FiShield,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiSettings,
  FiTool,
  FiWifi,
  FiPower,
  FiTerminal,
  FiCode,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiSave,
  FiArchive,
  FiTrash2,
  FiEdit,
  FiEye,
  FiEyeOff,
  FiBell,
  FiBellOff,
  FiMail,
  FiMessageCircle,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiClock as FiClockSolid,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminSystem = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // System Health
  const [health, setHealth] = useState({
    status: 'healthy',
    uptime: 0,
    lastChecked: null,
    services: [],
  });

  // Performance Metrics
  const [performance, setPerformance] = useState({
    cpu: [],
    memory: [],
    disk: [],
    network: [],
    responseTime: [],
    concurrentUsers: [],
    requestsPerSecond: [],
    errorRate: [],
  });

  // Server Info
  const [serverInfo, setServerInfo] = useState({
    hostname: '',
    platform: '',
    arch: '',
    nodeVersion: '',
    environment: '',
    timezone: '',
    loadAverage: [],
    totalMemory: 0,
    freeMemory: 0,
    uptime: 0,
  });

  // Database Stats
  const [database, setDatabase] = useState({
    connections: 0,
    queriesPerSecond: 0,
    slowQueries: 0,
    size: 0,
    collections: [],
    indexes: [],
    replication: {},
    backups: [],
  });

  // Cache Stats
  const [cache, setCache] = useState({
    hits: 0,
    misses: 0,
    hitRate: 0,
    memory: 0,
    keys: 0,
    evictions: 0,
  });

  // Queue Stats
  const [queue, setQueue] = useState({
    active: 0,
    waiting: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    workers: [],
  });

  // API Stats
  const [api, setApi] = useState({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    endpoints: [],
    statusCodes: {},
    popularEndpoints: [],
  });

  // Security Stats
  const [security, setSecurity] = useState({
    failedLogins: 0,
    blockedIPs: 0,
    rateLimitHits: 0,
    suspiciousActivities: 0,
    sslExpiry: null,
    lastBackup: null,
    vulnerabilities: [],
  });

  // Background Jobs
  const [jobs, setJobs] = useState({
    scheduled: [],
    running: [],
    completed: [],
    failed: [],
  });

  // Logs
  const [recentLogs, setRecentLogs] = useState([]);

  // Alerts
  const [alerts, setAlerts] = useState([]);

  // System Settings
  const [settings, setSettings] = useState({
    maintenance: false,
    debug: false,
    cacheEnabled: true,
    queueEnabled: true,
    rateLimit: 100,
    sessionTimeout: 3600,
    backupFrequency: 'daily',
    logLevel: 'info',
    emailEnabled: true,
    smsEnabled: false,
  });

  // Chart colors
  const COLORS = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffcc5c', '#ff6f69'];
  const STATUS_COLORS = {
    healthy: '#28a745',
    warning: '#ffc107',
    critical: '#dc3545',
    offline: '#6c757d',
  };

  useEffect(() => {
    fetchSystemData();
    
    // Set up auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const [
        healthRes,
        perfRes,
        serverRes,
        dbRes,
        cacheRes,
        queueRes,
        apiRes,
        securityRes,
        jobsRes,
        logsRes,
        alertsRes,
        settingsRes,
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/health`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/performance`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/info`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/database`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/cache`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/queue`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/api`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/security`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/logs/recent`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/system/settings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (healthRes.data.success) setHealth(healthRes.data.data);
      if (perfRes.data.success) setPerformance(perfRes.data.data);
      if (serverRes.data.success) setServerInfo(serverRes.data.data);
      if (dbRes.data.success) setDatabase(dbRes.data.data);
      if (cacheRes.data.success) setCache(cacheRes.data.data);
      if (queueRes.data.success) setQueue(queueRes.data.data);
      if (apiRes.data.success) setApi(apiRes.data.data);
      if (securityRes.data.success) setSecurity(securityRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
      if (logsRes.data.success) setRecentLogs(logsRes.data.data);
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.data);

    } catch (error) {
      toast.error('Failed to fetch system data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSystemData(true);
    toast.success('System data refreshed');
  };

  const handleMaintenanceToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/system/maintenance`,
        { enabled: !settings.maintenance },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        setSettings({ ...settings, maintenance: !settings.maintenance });
        toast.success(`Maintenance mode ${!settings.maintenance ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear the cache?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/system/cache/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success('Cache cleared successfully');
        fetchSystemData(true);
      }
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const handleRestartService = async (service) => {
    if (!window.confirm(`Are you sure you want to restart the ${service} service?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/system/restart/${service}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success(`${service} service restarted`);
        fetchSystemData(true);
      }
    } catch (error) {
      toast.error(`Failed to restart ${service} service`);
    }
  };

  const handleRunBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/system/backup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success('Backup started successfully');
        fetchSystemData(true);
      }
    } catch (error) {
      toast.error('Failed to start backup');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const getHealthColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.warning;
  };

  const getHealthIcon = (status) => {
    switch(status) {
      case 'healthy': return <FiCheckCircle style={{ color: STATUS_COLORS.healthy }} />;
      case 'warning': return <FiAlertCircle style={{ color: STATUS_COLORS.warning }} />;
      case 'critical': return <FiXCircle style={{ color: STATUS_COLORS.critical }} />;
      default: return <FiInfo style={{ color: STATUS_COLORS.offline }} />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiServer /> },
    { id: 'performance', label: 'Performance', icon: <FiActivity /> },
    { id: 'database', label: 'Database', icon: <FiDatabase /> },
    { id: 'cache', label: 'Cache', icon: <FiSave /> },
    { id: 'queue', label: 'Queue', icon: <FiClock /> },
    { id: 'api', label: 'API', icon: <FiCode /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'jobs', label: 'Jobs', icon: <FiTool /> },
    { id: 'logs', label: 'Logs', icon: <FiTerminal /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading system information...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Administration</h1>
          <p style={styles.subtitle}>Monitor and manage system health and performance</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.systemStatus}>
            {getHealthIcon(health.status)}
            <span style={{ color: getHealthColor(health.status) }}>
              System {health.status}
            </span>
          </div>
          
          <button
            style={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
          
          <button
            style={styles.maintenanceBtn}
            onClick={handleMaintenanceToggle}
          >
            {settings.maintenance ? <FiLock /> : <FiUnlock />}
            {settings.maintenance ? 'Maintenance On' : 'Maintenance Off'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.quickStats}>
        <div style={styles.statItem}>
          <FiCpu style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>CPU Load</span>
            <span style={styles.statValue}>{(serverInfo.loadAverage?.[0] || 0).toFixed(2)}</span>
          </div>
        </div>
        
        <div style={styles.statItem}>
          <FiHardDrive style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>Memory</span>
            <span style={styles.statValue}>
              {formatBytes(serverInfo.totalMemory - serverInfo.freeMemory)} / {formatBytes(serverInfo.totalMemory)}
            </span>
          </div>
        </div>
        
        <div style={styles.statItem}>
          <FiDatabase style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>Database</span>
            <span style={styles.statValue}>{formatBytes(database.size)}</span>
          </div>
        </div>
        
        <div style={styles.statItem}>
          <FiClock style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>Uptime</span>
            <span style={styles.statValue}>{formatUptime(serverInfo.uptime)}</span>
          </div>
        </div>
        
        <div style={styles.statItem}>
          <FiUsers style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>Active Users</span>
            <span style={styles.statValue}>{performance.concurrentUsers?.[0]?.value || 0}</span>
          </div>
        </div>
        
        <div style={styles.statItem}>
          <FiActivity style={styles.statIcon} />
          <div>
            <span style={styles.statLabel}>Req/Sec</span>
            <span style={styles.statValue}>{performance.requestsPerSecond?.[0]?.value || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.overviewTab}>
            {/* System Health Cards */}
            <div style={styles.healthGrid}>
              {health.services?.map((service, index) => (
                <div key={index} style={styles.healthCard}>
                  <div style={styles.healthHeader}>
                    <span style={styles.healthName}>{service.name}</span>
                    {getHealthIcon(service.status)}
                  </div>
                  <div style={styles.healthDetails}>
                    <div style={styles.healthDetail}>
                      <span>Uptime:</span>
                      <span>{formatUptime(service.uptime)}</span>
                    </div>
                    <div style={styles.healthDetail}>
                      <span>Response:</span>
                      <span>{service.responseTime}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Charts */}
            <div style={styles.chartsGrid}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>CPU Usage</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performance.cpu}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Memory Usage</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performance.memory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#4ecdc4" fill="#4ecdc4" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Server Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoRow}>
                  <span>Hostname:</span>
                  <code>{serverInfo.hostname}</code>
                </div>
                <div style={styles.infoRow}>
                  <span>Platform:</span>
                  <span>{serverInfo.platform}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Architecture:</span>
                  <span>{serverInfo.arch}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Node Version:</span>
                  <span>{serverInfo.nodeVersion}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Environment:</span>
                  <span style={{
                    ...styles.environment,
                    background: serverInfo.environment === 'production' ? '#dc3545' : '#ffc107',
                  }}>
                    {serverInfo.environment}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span>Timezone:</span>
                  <span>{serverInfo.timezone}</span>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div style={styles.alertsCard}>
              <h3 style={styles.alertsTitle}>Recent Alerts</h3>
              <div style={styles.alertsList}>
                {alerts.map((alert, index) => (
                  <div key={index} style={{
                    ...styles.alertItem,
                    borderLeftColor: getHealthColor(alert.severity),
                  }}>
                    {getHealthIcon(alert.severity)}
                    <div style={styles.alertContent}>
                      <span style={styles.alertMessage}>{alert.message}</span>
                      <span style={styles.alertTime}>{formatUptime(alert.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div style={styles.performanceTab}>
            {/* Performance Metrics */}
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <h4 style={styles.metricTitle}>Response Time</h4>
                <div style={styles.metricValue}>
                  {performance.responseTime?.[performance.responseTime.length - 1]?.value || 0}ms
                </div>
                <div style={styles.metricTrend}>
                  {performance.responseTimeTrend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(performance.responseTimeTrend)}%
                </div>
              </div>
      
              <div style={styles.metricCard}>
                <h4 style={styles.metricTitle}>Requests/sec</h4>
                <div style={styles.metricValue}>
                  {performance.requestsPerSecond?.[performance.requestsPerSecond.length - 1]?.value || 0}
                </div>
                <div style={styles.metricTrend}>
                  {performance.requestsTrend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(performance.requestsTrend)}%
                </div>
              </div>
      
              <div style={styles.metricCard}>
                <h4 style={styles.metricTitle}>Error Rate</h4>
                <div style={styles.metricValue}>
                  {performance.errorRate?.[performance.errorRate.length - 1]?.value || 0}%
                </div>
                <div style={styles.metricTrend}>
                  {performance.errorRateTrend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(performance.errorRateTrend)}%
                </div>
              </div>
      
              <div style={styles.metricCard}>
                <h4 style={styles.metricTitle}>Concurrent Users</h4>
                <div style={styles.metricValue}>
                  {performance.concurrentUsers?.[performance.concurrentUsers.length - 1]?.value || 0}
                </div>
                <div style={styles.metricTrend}>
                  {performance.concurrentUsersTrend > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  {Math.abs(performance.concurrentUsersTrend)}%
                </div>
              </div>
            </div>

            {/* Detailed Charts */}
            <div style={styles.detailedCharts}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Response Time History</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performance.responseTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Requests per Second</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performance.requestsPerSecond}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4ecdc4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Error Rate</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performance.errorRate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="value" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Concurrent Users</h3>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performance.concurrentUsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#ffd93d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div style={styles.databaseTab}>
            {/* Database Stats */}
            <div style={styles.dbStatsGrid}>
              <div style={styles.dbStatCard}>
                <FiDatabase style={styles.dbStatIcon} />
                <div>
                  <span style={styles.dbStatLabel}>Connections</span>
                  <span style={styles.dbStatValue}>{database.connections}</span>
                </div>
              </div>
      
              <div style={styles.dbStatCard}>
                <FiActivity style={styles.dbStatIcon} />
                <div>
                  <span style={styles.dbStatLabel}>Queries/sec</span>
                  <span style={styles.dbStatValue}>{database.queriesPerSecond}</span>
                </div>
              </div>
      
              <div style={styles.dbStatCard}>
                <FiClock style={styles.dbStatIcon} />
                <div>
                  <span style={styles.dbStatLabel}>Slow Queries</span>
                  <span style={styles.dbStatValue}>{database.slowQueries}</span>
                </div>
              </div>
      
              <div style={styles.dbStatCard}>
                <FiHardDrive style={styles.dbStatIcon} />
                <div>
                  <span style={styles.dbStatLabel}>Size</span>
                  <span style={styles.dbStatValue}>{formatBytes(database.size)}</span>
                </div>
              </div>
            </div>

            {/* Collections */}
            <div style={styles.collectionsCard}>
              <h3 style={styles.collectionsTitle}>Collections</h3>
              <div style={styles.collectionsList}>
                {database.collections?.map((collection, index) => (
                  <div key={index} style={styles.collectionItem}>
                    <span style={styles.collectionName}>{collection.name}</span>
                    <span style={styles.collectionCount}>{collection.count.toLocaleString()} docs</span>
                    <span style={styles.collectionSize}>{formatBytes(collection.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Indexes */}
            <div style={styles.indexesCard}>
              <h3 style={styles.indexesTitle}>Indexes</h3>
              <div style={styles.indexesList}>
                {database.indexes?.map((index, idx) => (
                  <div key={idx} style={styles.indexItem}>
                    <span style={styles.indexName}>{index.name}</span>
                    <span style={styles.indexFields}>{index.fields.join(', ')}</span>
                    <span style={styles.indexSize}>{formatBytes(index.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backups */}
            <div style={styles.backupsCard}>
              <div style={styles.backupsHeader}>
                <h3 style={styles.backupsTitle}>Backups</h3>
                <button style={styles.backupBtn} onClick={handleRunBackup}>
                  <FiDownload />
          Run Backup
                </button>
              </div>
              <div style={styles.backupsList}>
                {database.backups?.map((backup, index) => (
                  <div key={index} style={styles.backupItem}>
                    <div style={styles.backupInfo}>
                      <FiArchive style={styles.backupIcon} />
                      <div>
                        <span style={styles.backupName}>{backup.name}</span>
                        <span style={styles.backupTime}>{new Date(backup.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span style={styles.backupSize}>{formatBytes(backup.size)}</span>
                    <button style={styles.backupDownload} title="Download">
                      <FiDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cache Tab */}
        {activeTab === 'cache' && (
          <div style={styles.cacheTab}>
            {/* Cache Stats */}
            <div style={styles.cacheStatsGrid}>
              <div style={styles.cacheStatCard}>
                <h4 style={styles.cacheStatTitle}>Hit Rate</h4>
                <div style={styles.cacheStatValue}>{(cache.hitRate * 100).toFixed(1)}%</div>
                <div style={styles.cacheStatDetail}>
          Hits: {cache.hits.toLocaleString()} | Misses: {cache.misses.toLocaleString()}
                </div>
              </div>
      
              <div style={styles.cacheStatCard}>
                <h4 style={styles.cacheStatTitle}>Memory Usage</h4>
                <div style={styles.cacheStatValue}>{formatBytes(cache.memory)}</div>
                <div style={styles.cacheStatDetail}>
          Keys: {cache.keys.toLocaleString()}
                </div>
              </div>
      
              <div style={styles.cacheStatCard}>
                <h4 style={styles.cacheStatTitle}>Evictions</h4>
                <div style={styles.cacheStatValue}>{cache.evictions.toLocaleString()}</div>
                <div style={styles.cacheStatDetail}>
          Total evicted keys
                </div>
              </div>
            </div>

            {/* Cache Actions */}
            <div style={styles.cacheActions}>
              <button style={styles.clearCacheBtn} onClick={handleClearCache}>
                <FiTrash2 />
        Clear Cache
              </button>
            </div>

            {/* Cache Settings */}
            <div style={styles.cacheSettings}>
              <h3 style={styles.cacheSettingsTitle}>Cache Settings</h3>
              <div style={styles.cacheSettingItem}>
                <span>Enable Cache</span>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled}
                    onChange={() => setSettings({...settings, cacheEnabled: !settings.cacheEnabled})}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div style={styles.queueTab}>
            {/* Queue Stats */}
            <div style={styles.queueStatsGrid}>
              <div style={styles.queueStatCard}>
                <FiActivity style={styles.queueStatIcon} />
                <div>
                  <span style={styles.queueStatLabel}>Active</span>
                  <span style={styles.queueStatValue}>{queue.active}</span>
                </div>
              </div>
      
              <div style={styles.queueStatCard}>
                <FiClock style={styles.queueStatIcon} />
                <div>
                  <span style={styles.queueStatLabel}>Waiting</span>
                  <span style={styles.queueStatValue}>{queue.waiting}</span>
                </div>
              </div>
      
              <div style={styles.queueStatCard}>
                <FiCheckCircle style={styles.queueStatIcon} />
                <div>
                  <span style={styles.queueStatLabel}>Completed</span>
                  <span style={styles.queueStatValue}>{queue.completed}</span>
                </div>
              </div>
      
              <div style={styles.queueStatCard}>
                <FiXCircle style={styles.queueStatIcon} />
                <div>
                  <span style={styles.queueStatLabel}>Failed</span>
                  <span style={styles.queueStatValue}>{queue.failed}</span>
                </div>
              </div>
            </div>

            {/* Workers */}
            <div style={styles.workersCard}>
              <h3 style={styles.workersTitle}>Active Workers</h3>
              <div style={styles.workersList}>
                {queue.workers?.map((worker, index) => (
                  <div key={index} style={styles.workerItem}>
                    <span style={styles.workerId}>Worker {worker.id}</span>
                    <span style={styles.workerStatus}>{worker.status}</span>
                    <span style={styles.workerJob}>Job: {worker.currentJob}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* API Tab */}
        {activeTab === 'api' && (
          <div style={styles.apiTab}>
            {/* API Stats */}
            <div style={styles.apiStatsGrid}>
              <div style={styles.apiStatCard}>
                <h4 style={styles.apiStatTitle}>Total Requests</h4>
                <div style={styles.apiStatValue}>{api.totalRequests.toLocaleString()}</div>
              </div>
              
              <div style={styles.apiStatCard}>
                <h4 style={styles.apiStatTitle}>Success Rate</h4>
                <div style={styles.apiStatValue}>{(api.successRate * 100).toFixed(1)}%</div>
              </div>
              
              <div style={styles.apiStatCard}>
                <h4 style={styles.apiStatTitle}>Avg Response</h4>
                <div style={styles.apiStatValue}>{api.avgResponseTime}ms</div>
              </div>
            </div>

            {/* Popular Endpoints */}
            <div style={styles.endpointsCard}>
              <h3 style={styles.endpointsTitle}>Popular Endpoints</h3>
              <div style={styles.endpointsList}>
                {api.popularEndpoints?.map((endpoint, index) => (
                  <div key={index} style={styles.endpointItem}>
                    <span style={styles.endpointMethod}>{endpoint.method}</span>
                    <span style={styles.endpointPath}>{endpoint.path}</span>
                    <span style={styles.endpointCount}>{endpoint.count.toLocaleString()} req</span>
                    <span style={styles.endpointTime}>{endpoint.avgTime}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={styles.securityTab}>
            {/* Security Stats */}
            <div style={styles.securityStatsGrid}>
              <div style={styles.securityStatCard}>
                <FiLock style={styles.securityStatIcon} />
                <div>
                  <span style={styles.securityStatLabel}>Failed Logins</span>
                  <span style={styles.securityStatValue}>{security.failedLogins}</span>
                </div>
              </div>
              
              <div style={styles.securityStatCard}>
                <FiShield style={styles.securityStatIcon} />
                <div>
                  <span style={styles.securityStatLabel}>Blocked IPs</span>
                  <span style={styles.securityStatValue}>{security.blockedIPs}</span>
                </div>
              </div>
              
              <div style={styles.securityStatCard}>
                <FiAlertCircle style={styles.securityStatIcon} />
                <div>
                  <span style={styles.securityStatLabel}>Suspicious</span>
                  <span style={styles.securityStatValue}>{security.suspiciousActivities}</span>
                </div>
              </div>
              
              <div style={styles.securityStatCard}>
                <FiClock style={styles.securityStatIcon} />
                <div>
                  <span style={styles.securityStatLabel}>Rate Limit Hits</span>
                  <span style={styles.securityStatValue}>{security.rateLimitHits}</span>
                </div>
              </div>
            </div>

            {/* SSL Info */}
            <div style={styles.sslCard}>
              <h3 style={styles.sslTitle}>SSL Certificate</h3>
              <div style={styles.sslInfo}>
                <div style={styles.sslRow}>
                  <span>Expiry Date:</span>
                  <span style={{
                    color: new Date(security.sslExpiry) < new Date() ? '#dc3545' : '#28a745',
                  }}>
                    {new Date(security.sslExpiry).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.sslRow}>
                  <span>Days Remaining:</span>
                  <span>{
                    Math.ceil((new Date(security.sslExpiry) - new Date()) / (1000 * 60 * 60 * 24))
                  } days</span>
                </div>
              </div>
            </div>

            {/* Last Backup */}
            <div style={styles.backupInfoCard}>
              <h3 style={styles.backupInfoTitle}>Last Backup</h3>
              <div style={styles.backupInfo}>
                {security.lastBackup ? (
                  <>
                    <FiCheckCircle style={{ color: '#28a745' }} />
                    <span>{new Date(security.lastBackup).toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle style={{ color: '#ffc107' }} />
                    <span>No backup found</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div style={styles.jobsTab}>
            {/* Scheduled Jobs */}
            <div style={styles.scheduledJobsCard}>
              <h3 style={styles.scheduledJobsTitle}>Scheduled Jobs</h3>
              <div style={styles.jobsList}>
                {jobs.scheduled?.map((job, index) => (
                  <div key={index} style={styles.jobItem}>
                    <span style={styles.jobName}>{job.name}</span>
                    <span style={styles.jobSchedule}>{job.schedule}</span>
                    <span style={styles.jobNextRun}>Next: {new Date(job.nextRun).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed Jobs */}
            <div style={styles.failedJobsCard}>
              <h3 style={styles.failedJobsTitle}>Failed Jobs</h3>
              <div style={styles.jobsList}>
                {jobs.failed?.map((job, index) => (
                  <div key={index} style={{...styles.jobItem, ...styles.failedJob}}>
                    <span style={styles.jobName}>{job.name}</span>
                    <span style={styles.jobError}>{job.error}</span>
                    <span style={styles.jobTime}>{new Date(job.failedAt).toLocaleString()}</span>
                    <button style={styles.retryJobBtn}>
                      <FiRefreshCw />
                      Retry
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={styles.logsTab}>
            <div style={styles.logsHeader}>
              <h3 style={styles.logsTitle}>Recent System Logs</h3>
              <button style={styles.viewAllLogsBtn}>
                View All
              </button>
            </div>
            <div style={styles.logsList}>
              {recentLogs.map((log, index) => (
                <div key={index} style={{
                  ...styles.logItem,
                  borderLeftColor: log.level === 'error' ? '#dc3545' : 
                    log.level === 'warn' ? '#ffc107' : '#17a2b8',
                }}>
                  <span style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span style={styles.logLevel}>{log.level}</span>
                  <span style={styles.logMessage}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={styles.settingsTab}>
            <h3 style={styles.settingsTitle}>System Settings</h3>
            
            <div style={styles.settingsGrid}>
              <div style={styles.settingItem}>
                <span>Debug Mode</span>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.debug}
                    onChange={() => setSettings({...settings, debug: !settings.debug})}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>

              <div style={styles.settingItem}>
                <span>Rate Limit (per minute)</span>
                <input
                  type="number"
                  value={settings.rateLimit}
                  onChange={(e) => setSettings({...settings, rateLimit: parseInt(e.target.value)})}
                  style={styles.settingInput}
                />
              </div>

              <div style={styles.settingItem}>
                <span>Session Timeout (seconds)</span>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  style={styles.settingInput}
                />
              </div>

              <div style={styles.settingItem}>
                <span>Backup Frequency</span>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                  style={styles.settingSelect}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div style={styles.settingItem}>
                <span>Log Level</span>
                <select
                  value={settings.logLevel}
                  onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
                  style={styles.settingSelect}
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div style={styles.settingItem}>
                <span>Email Enabled</span>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={() => setSettings({...settings, emailEnabled: !settings.emailEnabled})}
                  />
                  <span style={styles.slider}></span>
                </label>
              </div>
            </div>

            <button style={styles.saveSettingsBtn}>
              <FiSave />
              Save Settings
            </button>
          </div>
        )}
      </div>

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
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: '0 0 5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    background: '#f8f9fa',
    borderRadius: '20px',
    fontSize: '14px',
  },
  refreshBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  maintenanceBtn: {
    padding: '8px 16px',
    background: settings?.maintenance ? '#dc3545' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  },
  statItem: {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '24px',
    color: '#667eea',
  },
  statLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#666',
    marginBottom: '3px',
  },
  statValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '20px',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '10px',
  },
  tab: {
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    color: '#666',
  },
  activeTab: {
    background: '#667eea',
    color: 'white',
  },
  tabContent: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  healthCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
  },
  healthHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  healthName: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#333',
  },
  healthDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  healthDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#666',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  chartCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
  },
  chartTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    color: '#333',
  },
  chartContainer: {
    height: '200px',
  },
  infoCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  infoTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  environment: {
    padding: '2px 8px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    display: 'inline-block',
  },
  alertsCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
  },
  alertsTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'white',
    borderRadius: '5px',
    borderLeft: '4px solid',
  },
  alertContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertMessage: {
    fontSize: '14px',
    color: '#333',
  },
  alertTime: {
    fontSize: '12px',
    color: '#999',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px',
  },
};

export default AdminSystem;
