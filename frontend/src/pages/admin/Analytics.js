import axios from 'axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiMousePointer,
  FiShoppingCart,
  FiPercent,
  FiCalendar,
  FiDownload,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiEyeOff,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiClock,
  FiMapPin,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiGlobe,
  FiAward,
  FiStar,
  FiTarget,
  FiZap,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiHelpCircle,
  FiMaximize2,
  FiMinimize2,
  FiSettings,
  FiShare2,
  FiMail,
  FiPrinter,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector,
  Treemap,
} from 'recharts';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [comparison, setComparison] = useState('previous');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('full');
  const [showPredictions, setShowPredictions] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Data States
  const [revenueData, setRevenueData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [conversionData, setConversionData] = useState([]);
  const [affiliateData, setAffiliateData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [anomalyData, setAnomalyData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [cohortData, setCohortData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [lifetimeData, setLifetimeData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [insights, setInsights] = useState([]);

  // Summary Stats
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalAffiliates: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0,
    churnRate: 0,
    retentionRate: 0,
    growthRate: 0,
    projectedRevenue: 0,
    projectedGrowth: 0,
    anomalies: 0,
    insights: 0,
  });

  // KPI Cards
  const [kpis, setKpis] = useState([
    { id: 'revenue', label: 'Revenue', value: 0, trend: 0, icon: <FiDollarSign />, color: '#28a745' },
    { id: 'affiliates', label: 'Affiliates', value: 0, trend: 0, icon: <FiUsers />, color: '#667eea' },
    { id: 'clicks', label: 'Clicks', value: 0, trend: 0, icon: <FiMousePointer />, color: '#ff6b6b' },
    { id: 'conversions', label: 'Conversions', value: 0, trend: 0, icon: <FiShoppingCart />, color: '#4ecdc4' },
    { id: 'conversionRate', label: 'Conv. Rate', value: 0, trend: 0, icon: <FiPercent />, color: '#ffd93d' },
    { id: 'ltv', label: 'LTV', value: 0, trend: 0, icon: <FiTarget />, color: '#6c5ce7' },
  ]);

  // Date range options
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Chart colors
  const COLORS = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffcc5c', '#ff6f69', '#a8e6cf', '#d4a5a5'];
  const TREND_COLORS = {
    positive: '#28a745',
    negative: '#dc3545',
    neutral: '#6c757d',
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, comparison]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        range: dateRange,
        comparison: comparison,
      };

      const [
        revenueRes,
        trafficRes,
        conversionRes,
        affiliateRes,
        productRes,
        geoRes,
        deviceRes,
        timeRes,
        trendRes,
        predictionRes,
        anomalyRes,
        correlationRes,
        cohortRes,
        funnelRes,
        retentionRes,
        lifetimeRes,
        segmentRes,
        forecastRes,
        insightsRes,
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/revenue`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/traffic`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/conversion`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/affiliate`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/product`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/geo`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/device`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/time`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/trend`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/prediction`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/anomaly`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/correlation`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/cohort`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/funnel`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/retention`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/lifetime`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/segment`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/forecast`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/analytics/insights`, { params, headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.data);
        setSummary(prev => ({ ...prev, ...revenueRes.data.summary }));
      }
      if (trafficRes.data.success) setTrafficData(trafficRes.data.data);
      if (conversionRes.data.success) setConversionData(conversionRes.data.data);
      if (affiliateRes.data.success) setAffiliateData(affiliateRes.data.data);
      if (productRes.data.success) setProductData(productRes.data.data);
      if (geoRes.data.success) setGeoData(geoRes.data.data);
      if (deviceRes.data.success) setDeviceData(deviceRes.data.data);
      if (timeRes.data.success) setTimeData(timeRes.data.data);
      if (trendRes.data.success) setTrendData(trendRes.data.data);
      if (predictionRes.data.success) setPredictionData(predictionRes.data.data);
      if (anomalyRes.data.success) setAnomalyData(anomalyRes.data.data);
      if (correlationRes.data.success) setCorrelationData(correlationRes.data.data);
      if (cohortRes.data.success) setCohortData(cohortRes.data.data);
      if (funnelRes.data.success) setFunnelData(funnelRes.data.data);
      if (retentionRes.data.success) setRetentionData(retentionRes.data.data);
      if (lifetimeRes.data.success) setLifetimeData(lifetimeRes.data.data);
      if (segmentRes.data.success) setSegmentData(segmentRes.data.data);
      if (forecastRes.data.success) setForecastData(forecastRes.data.data);
      if (insightsRes.data.success) setInsights(insightsRes.data.insights);

      // Update KPIs
      updateKPIs(revenueRes.data.summary);

    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const updateKPIs = (summaryData) => {
    setKpis([
      { 
        id: 'revenue', 
        label: 'Revenue', 
        value: formatCurrency(summaryData.totalRevenue),
        trend: summaryData.revenueTrend,
        icon: <FiDollarSign />, 
        color: '#28a745', 
      },
      { 
        id: 'affiliates', 
        label: 'Affiliates', 
        value: formatNumber(summaryData.totalAffiliates),
        trend: summaryData.affiliateTrend,
        icon: <FiUsers />, 
        color: '#667eea', 
      },
      { 
        id: 'clicks', 
        label: 'Clicks', 
        value: formatNumber(summaryData.totalClicks),
        trend: summaryData.clicksTrend,
        icon: <FiMousePointer />, 
        color: '#ff6b6b', 
      },
      { 
        id: 'conversions', 
        label: 'Conversions', 
        value: formatNumber(summaryData.totalConversions),
        trend: summaryData.conversionsTrend,
        icon: <FiShoppingCart />, 
        color: '#4ecdc4', 
      },
      { 
        id: 'conversionRate', 
        label: 'Conv. Rate', 
        value: `${summaryData.conversionRate}%`,
        trend: summaryData.conversionRateTrend,
        icon: <FiPercent />, 
        color: '#ffd93d', 
      },
      { 
        id: 'ltv', 
        label: 'LTV', 
        value: formatCurrency(summaryData.customerLifetimeValue),
        trend: summaryData.ltvTrend,
        icon: <FiTarget />, 
        color: '#6c5ce7', 
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/analytics/export/${format}`,
        {
          params: { range: dateRange },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleEmailReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/analytics/email`,
        { range: dateRange },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Report sent to your email');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FiTrendingUp style={{ color: '#28a745' }} />;
    if (trend < 0) return <FiTrendingDown style={{ color: '#dc3545' }} />;
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#28a745';
    if (trend < 0) return '#dc3545';
    return '#6c757d';
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333">
          {formatNumber(value)}
        </text>
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#666">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 15}
          outerRadius={outerRadius + 20}
          fill={fill}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ ...styles.tooltipValue, color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('LTV') 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Advanced Analytics</h1>
          <p style={styles.subtitle}>Deep insights and predictive analytics</p>
        </div>
        <div style={styles.headerActions}>
          {/* Date Range Selector */}
          <div style={styles.dateRangeSelector}>
            <FiCalendar style={styles.calendarIcon} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.dateSelect}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Selector */}
          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value)}
            style={styles.comparisonSelect}
          >
            <option value="previous">vs Previous Period</option>
            <option value="lastYear">vs Last Year</option>
            <option value="target">vs Target</option>
          </select>

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
            style={styles.emailBtn}
            onClick={handleEmailReport}
          >
            <FiMail />
            Email
          </button>

          <button
            style={styles.fullscreenBtn}
            onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
          >
            {viewMode === 'full' ? <FiMinimize2 /> : <FiMaximize2 />}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpis.map(kpi => (
          <div key={kpi.id} style={styles.kpiCard}>
            <div style={{ ...styles.kpiIcon, backgroundColor: `${kpi.color}20`, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div style={styles.kpiContent}>
              <span style={styles.kpiLabel}>{kpi.label}</span>
              <span style={styles.kpiValue}>{kpi.value}</span>
              {kpi.trend !== 0 && (
                <span style={{ ...styles.kpiTrend, color: getTrendColor(kpi.trend) }}>
                  {getTrendIcon(kpi.trend)}
                  {Math.abs(kpi.trend)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Type Selector */}
      <div style={styles.chartTypeSelector}>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'line' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('line')}
        >
          Line
        </button>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'bar' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('bar')}
        >
          Bar
        </button>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'area' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('area')}
        >
          Area
        </button>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'pie' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('pie')}
        >
          Pie
        </button>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'radar' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('radar')}
        >
          Radar
        </button>
        <button
          style={{
            ...styles.chartTypeBtn,
            ...(chartType === 'composed' ? styles.activeChartType : {}),
          }}
          onClick={() => setChartType('composed')}
        >
          Composed
        </button>
      </div>

      {/* Toggle Options */}
      <div style={styles.toggleOptions}>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showPredictions}
            onChange={(e) => setShowPredictions(e.target.checked)}
          />
          Show Predictions
        </label>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showPredictions}
            onChange={(e) => setShowPredictions(e.target.checked)}
          />
          Show Predictions
        </label>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showAnomalies}
            onChange={(e) => setShowAnomalies(e.target.checked)}
          />
          Show Anomalies
        </label>
      </div>
      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Revenue Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Revenue Analytics</h3>
            <div style={styles.chartLegend}>
              <span style={styles.legendItem}>
                <span style={{...styles.legendColor, background: '#667eea'}}></span>
          Actual
              </span>
              {showPredictions && (
                <span style={styles.legendItem}>
                  <span style={{...styles.legendColor, background: '#ff6b6b', borderStyle: 'dashed'}}></span>
            Predicted
                </span>
              )}
            </div>
          </div>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' && (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#667eea" strokeWidth={2} />
                  {showPredictions && (
                    <Line type="monotone" dataKey="predicted" stroke="#ff6b6b" strokeWidth={2} strokeDasharray="5 5" />
                  )}
                  {showAnomalies && (
                    <Scatter dataKey="anomaly" fill="#dc3545" shape="triangle" />
                  )}
                </LineChart>
              )}
              {chartType === 'bar' && (
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="actual" fill="#667eea" />
                  {showPredictions && (
                    <Bar dataKey="predicted" fill="#ff6b6b" />
                  )}
                </BarChart>
              )}
              {chartType === 'area' && (
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                  {showPredictions && (
                    <Area type="monotone" dataKey="predicted" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.3} />
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Traffic Sources</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Conversion Funnel</h3>
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4ecdc4">
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.funnelStats}>
            {funnelData.map((stage, index) => (
              <div key={index} style={styles.funnelStage}>
                <span>{stage.name}</span>
                <span>{formatNumber(stage.value)}</span>
                {index < funnelData.length - 1 && (
                  <span style={styles.funnelDropoff}>
                    {((stage.value - funnelData[index + 1].value) / stage.value * 100).toFixed(1)}% drop
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Analysis */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Cohort Retention</h3>
          <div style={styles.cohortTable}>
            <table style={styles.cohortMatrix}>
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Month 1</th>
                  <th>Month 2</th>
                  <th>Month 3</th>
                  <th>Month 4</th>
                  <th>Month 5</th>
                  <th>Month 6</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((cohort, index) => (
                  <tr key={index}>
                    <td>{cohort.cohort}</td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m1 / 100})` }}>
                      {cohort.m1}%
                    </td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m2 / 100})` }}>
                      {cohort.m2}%
                    </td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m3 / 100})` }}>
                      {cohort.m3}%
                    </td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m4 / 100})` }}>
                      {cohort.m4}%
                    </td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m5 / 100})` }}>
                      {cohort.m5}%
                    </td>
                    <td style={{ backgroundColor: `rgba(102, 126, 234, ${cohort.m6 / 100})` }}>
                      {cohort.m6}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Geographic Distribution</h3>
          <div style={styles.geoList}>
            {geoData.map((country, index) => (
              <div key={index} style={styles.geoItem}>
                <div style={styles.geoInfo}>
                  <FiGlobe />
                  <span>{country.country}</span>
                </div>
                <div style={styles.geoBar}>
                  <div style={{
                    width: `${country.percentage}%`,
                    height: '8px',
                    background: COLORS[index % COLORS.length],
                    borderRadius: '4px',
                  }} />
                </div>
                <span style={styles.geoValue}>{country.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Device Breakdown</h3>
          <div style={styles.deviceGrid}>
            {deviceData.map((device, index) => (
              <div key={index} style={styles.deviceItem}>
                {device.device === 'mobile' && <FiSmartphone style={{ fontSize: 24, color: COLORS[index] }} />}
                {device.device === 'tablet' && <FiTablet style={{ fontSize: 24, color: COLORS[index] }} />}
                {device.device === 'desktop' && <FiMonitor style={{ fontSize: 24, color: COLORS[index] }} />}
                <span style={styles.deviceName}>{device.device}</span>
                <span style={styles.deviceValue}>{device.percentage}%</span>
                <div style={styles.deviceBar}>
                  <div style={{
                    width: `${device.percentage}%`,
                    height: '6px',
                    background: COLORS[index],
                    borderRadius: '3px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Customer Lifetime Value</h3>
          <div style={styles.ltvContainer}>
            <div style={styles.ltvMain}>
              <span style={styles.ltvValue}>{formatCurrency(summary.customerLifetimeValue)}</span>
              <span style={styles.ltvLabel}>Average LTV</span>
            </div>
            <div style={styles.ltvSegments}>
              {lifetimeData.map((segment, index) => (
                <div key={index} style={styles.ltvSegment}>
                  <span>{segment.cohort}</span>
                  <span>{formatCurrency(segment.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Churn Rate */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Churn Rate</h3>
          <div style={styles.churnContainer}>
            <div style={styles.churnMain}>
              <span style={{
                ...styles.churnValue,
                color: summary.churnRate > 5 ? '#dc3545' : '#28a745',
              }}>
                {summary.churnRate}%
              </span>
              <span style={styles.churnLabel}>Current Churn</span>
            </div>
            <div style={styles.churnTrend}>
              <span>vs Previous: </span>
              <span style={{ color: summary.churnTrend > 0 ? '#dc3545' : '#28a745' }}>
                {summary.churnTrend > 0 ? '+' : ''}{summary.churnTrend}%
              </span>
            </div>
          </div>
        </div>

        {/* Retention Rate */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Retention Rate</h3>
          <div style={styles.retentionContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retentionData}>
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#28a745" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Insights Section */}
      <div style={styles.insightsSection}>
        <h3 style={styles.insightsTitle}>AI-Powered Insights</h3>
        <div style={styles.insightsGrid}>
          {insights.map((insight, index) => (
            <div key={index} style={{
              ...styles.insightCard,
              borderLeft: `4px solid ${insight.type === 'positive' ? '#28a745' : insight.type === 'negative' ? '#dc3545' : '#ffc107'}`,
            }}>
              <div style={styles.insightHeader}>
                {insight.type === 'positive' && <FiCheckCircle style={{ color: '#28a745' }} />}
                {insight.type === 'negative' && <FiAlertCircle style={{ color: '#dc3545' }} />}
                {insight.type === 'warning' && <FiInfo style={{ color: '#ffc107' }} />}
                <span style={styles.insightTitle}>{insight.title}</span>
              </div>
              <p style={styles.insightDescription}>{insight.description}</p>
              <div style={styles.insightMeta}>
                <span style={styles.insightImpact}>Impact: {insight.impact}</span>
                <span style={styles.insightConfidence}>Confidence: {insight.confidence}%</span>
              </div>
              {insight.action && (
                <button style={styles.insightAction}>
                  {insight.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Correlation Matrix */}
      <div style={styles.correlationSection}>
        <h3 style={styles.correlationTitle}>Correlation Matrix</h3>
        <div style={styles.correlationGrid}>
          <table style={styles.correlationTable}>
            <thead>
              <tr>
                <th></th>
                {correlationData.map((item, index) => (
                  <th key={index}>{item.metric}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationData.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 'bold' }}>{row.metric}</td>
                  {correlationData.map((col, j) => {
                    const value = row.correlations[col.metric] || 0;
                    return (
                      <td key={j} style={{
                        backgroundColor: `rgba(102, 126, 234, ${Math.abs(value)})`,
                        color: Math.abs(value) > 0.5 ? 'white' : '#333',
                      }}>
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Section */}
      {showPredictions && (
        <div style={styles.forecastSection}>
          <h3 style={styles.forecastTitle}>Revenue Forecast</h3>
          <div style={styles.forecastChart}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="actual" fill="#667eea" />
                <Line type="monotone" dataKey="forecast" stroke="#ff6b6b" strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="confidence" fill="#ff6b6b" fillOpacity={0.1} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.forecastStats}>
            <div style={styles.forecastStat}>
              <span>Next Month</span>
              <span>{formatCurrency(forecastData[forecastData.length - 1]?.forecast)}</span>
            </div>
            <div style={styles.forecastStat}>
              <span>Next Quarter</span>
              <span>{formatCurrency(forecastData[forecastData.length - 3]?.forecast * 3)}</span>
            </div>
            <div style={styles.forecastStat}>
              <span>Next Year</span>
              <span>{formatCurrency(forecastData[forecastData.length - 12]?.forecast * 12)}</span>
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
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: '0 0 5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 20px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  dateRangeSelector: {
    position: 'relative',
    display: 'inline-block',
  },
  calendarIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    zIndex: 1,
  },
  dateSelect: {
    padding: '10px 10px 10px 35px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '180px',
    cursor: 'pointer',
  },
  comparisonSelect: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '150px',
    cursor: 'pointer',
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
  exportBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  emailBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  fullscreenBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  },
  kpiCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  kpiIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  kpiContent: {
    flex: 1,
  },
  kpiLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#666',
    marginBottom: '3px',
  },
  kpiValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '3px',
  },
  kpiTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px',
  },
  chartTypeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  chartTypeBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  activeChartType: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  toggleOptions: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#666',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  chartTitle: {
    margin: '0 0 15px',
    fontSize: '18px',
    color: '#333',
  },
  chartLegend: {
    display: 'flex',
    gap: '15px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#666',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
  chartContainer: {
    height: '300px',
  },
  funnelStats: {
    marginTop: '15px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '5px',
  },
  funnelStage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 0',
  },
  funnelDropoff: {
    fontSize: '11px',
    color: '#dc3545',
  },
  cohortTable: {
    overflow: 'auto',
    maxHeight: '300px',
  },
  cohortMatrix: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  geoList: {
    marginTop: '10px',
  },
  geoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  geoInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    width: '120px',
  },
  geoBar: {
    flex: 1,
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
  },
  geoValue: {
    width: '50px',
    textAlign: 'right',
  },
  deviceGrid: {
    display: 'grid',
    gap: '15px',
  },
  deviceItem: {
    display: 'grid',
    gridTemplateColumns: '30px 80px 50px 1fr',
    alignItems: 'center',
    gap: '10px',
  },
  deviceName: {
    textTransform: 'capitalize',
  },
  deviceValue: {
    textAlign: 'right',
  },
  deviceBar: {
    height: '6px',
    background: '#f0f0f0',
    borderRadius: '3px',
  },
  ltvContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  ltvMain: {
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  ltvValue: {
    display: 'block',
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '5px',
  },
  ltvLabel: {
    fontSize: '14px',
    color: '#666',
  },
  ltvSegments: {
    display: 'grid',
    gap: '8px',
  },
  ltvSegment: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '5px',
  },
  churnContainer: {
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  churnValue: {
    display: 'block',
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  churnLabel: {
    fontSize: '14px',
    color: '#666',
  },
  churnTrend: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#666',
  },
  retentionContainer: {
    height: '200px',
  },
  insightsSection: {
    marginBottom: '30px',
  },
  insightsTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  insightCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  insightTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#333',
  },
  insightDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  insightMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#999',
    marginBottom: '15px',
  },
  insightAction: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
  },
  correlationSection: {
    marginBottom: '30px',
  },
  correlationTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  correlationGrid: {
    overflow: 'auto',
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  correlationTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  forecastSection: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  forecastTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  forecastChart: {
    height: '300px',
    marginBottom: '20px',
  },
  forecastStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  forecastStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '5px',
  },
  tooltip: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tooltipLabel: {
    margin: '0 0 5px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
  },
  tooltipValue: {
    margin: '2px 0',
    fontSize: '12px',
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

export default AdminAnalytics;
