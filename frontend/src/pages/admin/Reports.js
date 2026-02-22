import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiUserCheck,
  FiShoppingCart,
  FiMousePointer,
  FiPercent,
  FiAward,
  FiStar,
  FiClock,
  FiEye,
  FiMail,
  FiPrinter,
  FiShare2,
  FiFileText,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2,
  FiSettings,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from 'recharts';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('grid');
  const [activeIndex, setActiveIndex] = useState(0);

  // Data States
  const [overviewData, setOverviewData] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [referralsData, setReferralsData] = useState([]);
  const [conversionsData, setConversionsData] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topAffiliates, setTopAffiliates] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // Summary Stats
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalReferrals: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    avgCommission: 0,
    activeAffiliates: 0,
    pendingCommissions: 0,
    previousPeriod: {
      earnings: 0,
      referrals: 0,
      clicks: 0,
      conversions: 0
    }
  });

  // Date range options
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Chart colors
  const COLORS = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffcc5c', '#ff6f69'];
  const EARNING_COLORS = ['#28a745', '#ffc107', '#dc3545', '#17a2b8'];
  const TRAFFIC_COLORS = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea'];

  useEffect(() => {
    fetchAllReports();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        range: dateRange,
        startDate: customStartDate,
        endDate: customEndDate
      };

      const [overviewRes, earningsRes, referralsRes, conversionsRes, trafficRes, productsRes, affiliatesRes, geoRes, deviceRes, hourlyRes, dailyRes, monthlyRes, comparisonRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/overview`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/earnings`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/referrals`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/conversions`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/traffic`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/top-products`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/top-affiliates`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/geo`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/device`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/hourly`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/daily`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/monthly`, { params, headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/admin/reports/comparison`, { params, headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (overviewRes.data.success) {
        setOverviewData(overviewRes.data.data);
        setSummary(overviewRes.data.summary);
      }
      if (earningsRes.data.success) setEarningsData(earningsRes.data.data);
      if (referralsRes.data.success) setReferralsData(referralsRes.data.data);
      if (conversionsRes.data.success) setConversionsData(conversionsRes.data.data);
      if (trafficRes.data.success) setTrafficData(trafficRes.data.data);
      if (productsRes.data.success) setTopProducts(productsRes.data.data);
      if (affiliatesRes.data.success) setTopAffiliates(affiliatesRes.data.data);
      if (geoRes.data.success) setGeoData(geoRes.data.data);
      if (deviceRes.data.success) setDeviceData(deviceRes.data.data);
      if (hourlyRes.data.success) setHourlyData(hourlyRes.data.data);
      if (dailyRes.data.success) setDailyData(dailyRes.data.data);
      if (monthlyRes.data.success) setMonthlyData(monthlyRes.data.data);
      if (comparisonRes.data.success) setComparisonData(comparisonRes.data.data);

    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/reports/export/${format}`,
        {
          params: {
            range: dateRange,
            startDate: customStartDate,
            endDate: customEndDate,
            tab: activeTab
          },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${activeTab}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleEmailReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/reports/email`,
        {
          range: dateRange,
          startDate: customStartDate,
          endDate: customEndDate,
          tab: activeTab
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Report sent to your email');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const getTrendIcon = (current, previous) => {
    const percentChange = ((current - previous) / previous) * 100;
    if (percentChange > 0) {
      return { icon: <FiTrendingUp />, color: '#28a745', text: `+${percentChange.toFixed(1)}%` };
    } else if (percentChange < 0) {
      return { icon: <FiTrendingDown />, color: '#dc3545', text: `${percentChange.toFixed(1)}%` };
    } else {
      return { icon: null, color: '#6c757d', text: '0%' };
    }
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
          {formatCurrency(value)}
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 /> },
    { id: 'earnings', label: 'Earnings', icon: <FiDollarSign /> },
    { id: 'referrals', label: 'Referrals', icon: <FiUsers /> },
    { id: 'conversions', label: 'Conversions', icon: <FiShoppingCart /> },
    { id: 'traffic', label: 'Traffic', icon: <FiMousePointer /> },
    { id: 'products', label: 'Top Products', icon: <FiAward /> },
    { id: 'affiliates', label: 'Top Affiliates', icon: <FiStar /> },
    { id: 'geo', label: 'Geography', icon: <FiEye /> },
    { id: 'devices', label: 'Devices', icon: <FiEye /> },
    { id: 'hourly', label: 'Hourly', icon: <FiClock /> }
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Analytics & Reports</h1>
          <p style={styles.subtitle}>Track performance and gain insights</p>
        </div>
        <div style={styles.headerActions}>
          {/* Date Range Selector */}
          <div style={styles.dateRangeSelector}>
            <FiCalendar style={styles.calendarIcon} />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setShowCustomDate(e.target.value === 'custom');
              }}
              style={styles.dateSelect}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {showCustomDate && (
            <div style={styles.customDateRange}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={styles.dateInput}
              />
              <span>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          )}

          <button
            style={styles.refreshBtn}
            onClick={fetchAllReports}
            title="Refresh"
          >
            <FiRefreshCw />
          </button>

          <div style={styles.exportDropdown}>
            <button
              style={styles.exportBtn}
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              <FiDownload />
              Export
            </button>
            <div style={styles.exportOptions}>
              <button onClick={() => handleExport('csv')}>CSV</button>
              <button onClick={() => handleExport('excel')}>Excel</button>
              <button onClick={() => handleExport('pdf')}>PDF</button>
            </div>
          </div>

          <button
            style={styles.emailBtn}
            onClick={handleEmailReport}
          >
            <FiMail />
            Email
          </button>

          <button
            style={styles.printBtn}
            onClick={handlePrint}
          >
            <FiPrinter />
            Print
          </button>

          <button
            style={styles.viewModeBtn}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <FiList /> : <FiGrid />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiDollarSign />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Total Earnings</span>
            <span style={styles.summaryValue}>{formatCurrency(summary.totalEarnings)}</span>
            <span style={{
              ...styles.summaryTrend,
              color: getTrendIcon(summary.totalEarnings, summary.previousPeriod.earnings).color
            }}>
              {getTrendIcon(summary.totalEarnings, summary.previousPeriod.earths).icon}
              {getTrendIcon(summary.totalEarnings, summary.previousPeriod.earnings).text}
            </span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiUsers />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Total Referrals</span>
            <span style={styles.summaryValue}>{formatNumber(summary.totalReferrals)}</span>
            <span style={{
              ...styles.summaryTrend,
              color: getTrendIcon(summary.totalReferrals, summary.previousPeriod.referrals).color
            }}>
              {getTrendIcon(summary.totalReferrals, summary.previousPeriod.referrals).icon}
              {getTrendIcon(summary.totalReferrals, summary.previousPeriod.referrals).text}
            </span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiMousePointer />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Total Clicks</span>
            <span style={styles.summaryValue}>{formatNumber(summary.totalClicks)}</span>
            <span style={{
              ...styles.summaryTrend,
              color: getTrendIcon(summary.totalClicks, summary.previousPeriod.clicks).color
            }}>
              {getTrendIcon(summary.totalClicks, summary.previousPeriod.clicks).icon}
              {getTrendIcon(summary.totalClicks, summary.previousPeriod.clicks).text}
            </span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiShoppingCart />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Conversions</span>
            <span style={styles.summaryValue}>{formatNumber(summary.totalConversions)}</span>
            <span style={{
              ...styles.summaryTrend,
              color: getTrendIcon(summary.totalConversions, summary.previousPeriod.conversions).color
            }}>
              {getTrendIcon(summary.totalConversions, summary.previousPeriod.conversions).icon}
              {getTrendIcon(summary.totalConversions, summary.previousPeriod.conversions).text}
            </span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiPercent />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Conversion Rate</span>
            <span style={styles.summaryValue}>{summary.conversionRate}%</span>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiUserCheck />
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>Active Affiliates</span>
            <span style={styles.summaryValue}>{summary.activeAffiliates}</span>
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
        ...(activeTab === tab.id ? styles.activeTab : {})
      }}
      onClick={() => setActiveTab(tab.id)}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>

{/* Chart Type Selector */}
<div style={styles.chartTypeSelector}>
  <button
    style={{
      ...styles.chartTypeBtn,
      ...(chartType === 'line' ? styles.activeChartType : {})
    }}
    onClick={() => setChartType('line')}
  >
    Line
  </button>
  <button
    style={{
      ...styles.chartTypeBtn,
      ...(chartType === 'bar' ? styles.activeChartType : {})
    }}
    onClick={() => setChartType('bar')}
  >
    Bar
  </button>
  <button
    style={{
      ...styles.chartTypeBtn,
      ...(chartType === 'area' ? styles.activeChartType : {})
    }}
    onClick={() => setChartType('area')}
  >
    Area
  </button>
  <button
    style={{
      ...styles.chartTypeBtn,
      ...(chartType === 'pie' ? styles.activeChartType : {})
    }}
    onClick={() => setChartType('pie')}
  >
    Pie
  </button>
</div>

{/* Main Content */}
<div style={styles.content}>
  {/* Overview Tab */}
  {activeTab === 'overview' && (
    <div style={styles.overviewTab}>
      {/* Earnings Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>Earnings Overview</h3>
          <div style={styles.chartLegend}>
            <span style={styles.legendItem}>
              <span style={{...styles.legendColor, background: '#667eea'}}></span>
              Current Period
            </span>
            <span style={styles.legendItem}>
              <span style={{...styles.legendColor, background: '#a0aec0'}}></span>
              Previous Period
            </span>
          </div>
        </div>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' && (
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="previous" stroke="#a0aec0" strokeWidth={2} />
              </LineChart>
            )}
            {chartType === 'bar' && (
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="current" fill="#667eea" />
                <Bar dataKey="previous" fill="#a0aec0" />
              </BarChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="current" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                <Area type="monotone" dataKey="previous" stroke="#a0aec0" fill="#a0aec0" fillOpacity={0.3} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Average Commission</h4>
          <div style={styles.metricValue}>{formatCurrency(summary.avgCommission)}</div>
          <div style={styles.metricSub}>per conversion</div>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Pending Payouts</h4>
          <div style={styles.metricValue}>{formatCurrency(summary.pendingCommissions)}</div>
          <div style={styles.metricSub}>awaiting approval</div>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Affiliate Performance</h4>
          <div style={styles.metricValue}>{summary.avgEarningsPerAffiliate}</div>
          <div style={styles.metricSub}>avg. earnings per affiliate</div>
        </div>
        <div style={styles.metricCard}>
          <h4 style={styles.metricTitle}>Click to Sale Ratio</h4>
          <div style={styles.metricValue}>{summary.clickToSaleRatio}%</div>
          <div style={styles.metricSub}>conversion efficiency</div>
        </div>
      </div>

      {/* Comparison Cards */}
      {comparisonData && (
        <div style={styles.comparisonGrid}>
          <div style={styles.comparisonCard}>
            <h4 style={styles.comparisonTitle}>vs Previous Period</h4>
            <div style={styles.comparisonItem}>
              <span>Earnings</span>
              <span style={{
                color: comparisonData.earnings.percentChange > 0 ? '#28a745' : '#dc3545'
              }}>
                {comparisonData.earnings.percentChange > 0 ? '+' : ''}
                {comparisonData.earnings.percentChange}%
              </span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Referrals</span>
              <span style={{
                color: comparisonData.referrals.percentChange > 0 ? '#28a745' : '#dc3545'
              }}>
                {comparisonData.referrals.percentChange > 0 ? '+' : ''}
                {comparisonData.referrals.percentChange}%
              </span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Clicks</span>
              <span style={{
                color: comparisonData.clicks.percentChange > 0 ? '#28a745' : '#dc3545'
              }}>
                {comparisonData.clicks.percentChange > 0 ? '+' : ''}
                {comparisonData.clicks.percentChange}%
              </span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Conversions</span>
              <span style={{
                color: comparisonData.conversions.percentChange > 0 ? '#28a745' : '#dc3545'
              }}>
                {comparisonData.conversions.percentChange > 0 ? '+' : ''}
                {comparisonData.conversions.percentChange}%
              </span>
            </div>
          </div>

          <div style={styles.comparisonCard}>
            <h4 style={styles.comparisonTitle}>Year to Date</h4>
            <div style={styles.comparisonItem}>
              <span>Total Earnings</span>
              <span>{formatCurrency(comparisonData.ytd.earnings)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Total Referrals</span>
              <span>{formatNumber(comparisonData.ytd.referrals)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Total Clicks</span>
              <span>{formatNumber(comparisonData.ytd.clicks)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Growth Rate</span>
              <span style={{color: '#28a745'}}>+{comparisonData.ytd.growthRate}%</span>
            </div>
          </div>

          <div style={styles.comparisonCard}>
            <h4 style={styles.comparisonTitle}>Projections</h4>
            <div style={styles.comparisonItem}>
              <span>Next Month</span>
              <span>{formatCurrency(comparisonData.projection.nextMonth)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Next Quarter</span>
              <span>{formatCurrency(comparisonData.projection.nextQuarter)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Year End</span>
              <span>{formatCurrency(comparisonData.projection.yearEnd)}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span>Confidence</span>
              <span>{comparisonData.projection.confidence}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

  {/* Earnings Tab */}
  {activeTab === 'earnings' && (
    <div style={styles.earningsTab}>
      {/* Earnings Chart */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Earnings Breakdown</h3>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={earningsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {earningsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            ) : (
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="value" fill="#667eea">
                  {earningsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Earnings Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Earnings Details</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Commission</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Affiliate</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.slice(0, 10).map((item, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{item.date}</td>
                  <td style={styles.td}>{item.source}</td>
                  <td style={styles.td}>{formatCurrency(item.amount)}</td>
                  <td style={styles.td}>{item.commission}%</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: item.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                      color: item.status === 'paid' ? '#388e3c' : '#f57c00'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>{item.affiliate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* Referrals Tab */}
  {activeTab === 'referrals' && (
    <div style={styles.referralsTab}>
      {/* Referrals Chart */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Referral Growth</h3>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={referralsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="newReferrals" stroke="#667eea" strokeWidth={2} />
              <Line type="monotone" dataKey="activeReferrals" stroke="#48bb78" strokeWidth={2} />
              <Line type="monotone" dataKey="totalReferrals" stroke="#ed8936" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referral Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h4 style={styles.statTitle}>New Referrals</h4>
          <div style={styles.statValue}>{referralsData.reduce((acc, curr) => acc + curr.newReferrals, 0)}</div>
        </div>
        <div style={styles.statCard}>
          <h4 style={styles.statTitle}>Active Referrals</h4>
          <div style={styles.statValue}>{referralsData.reduce((acc, curr) => acc + curr.activeReferrals, 0)}</div>
        </div>
        <div style={styles.statCard}>
          <h4 style={styles.statTitle}>Inactive Referrals</h4>
          <div style={styles.statValue}>{referralsData.reduce((acc, curr) => acc + curr.inactiveReferrals, 0)}</div>
        </div>
        <div style={styles.statCard}>
          <h4 style={styles.statTitle}>Conversion Rate</h4>
          <div style={styles.statValue}>{summary.referralConversionRate}%</div>
        </div>
      </div>
    </div>
  )}

  {/* Traffic Tab */}
  {activeTab === 'traffic' && (
    <div style={styles.trafficTab}>
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Traffic Sources</h3>
        <div style={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={trafficData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label
              >
                {trafficData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {trafficData.map((source, index) => (
          <div key={index} style={styles.trafficCard}>
            <h4 style={styles.trafficTitle}>{source.name}</h4>
            <div style={styles.trafficValue}>{source.value.toLocaleString()} clicks</div>
            <div style={styles.trafficPercentage}>{source.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    color: '#333',
    margin: '0 0 5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 20px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  dateRangeSelector: {
    position: 'relative',
    display: 'inline-block'
  },
  calendarIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    zIndex: 1
  },
  dateSelect: {
    padding: '10px 10px 10px 35px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '180px',
    cursor: 'pointer'
  },
  customDateRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dateInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
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
  exportDropdown: {
    position: 'relative',
    display: 'inline-block'
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
  exportOptions: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'none',
    zIndex: 1000
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
    gap: '5px'
  },
  printBtn: {
    padding: '8px 16px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  viewModeBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    marginBottom: '30px'
  },
  summaryCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#667eea',
    fontSize: '24px'
  },
  summaryContent: {
    flex: 1
  },
  summaryLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#666',
    marginBottom: '3px'
  },
  summaryValue: {
    display: 'block',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '3px'
  },
  summaryTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px'
  },
  tabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '20px',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '10px'
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
    color: '#666'
  },
  activeTab: {
    background: '#667eea',
    color: 'white'
  },
  chartTypeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  chartTypeBtn: {
    padding: '5px 10px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  activeChartType: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  content: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  chartCard: {
    marginBottom: '30px'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  chartTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#333'
  },
  chartLegend: {
    display: 'flex',
    gap: '15px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#666'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px'
  },
  chartContainer: {
    height: '400px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px'
  },
  metricCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center'
  },
  metricTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    color: '#666'
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  metricSub: {
    fontSize: '12px',
    color: '#999'
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  comparisonCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px'
  },
  comparisonTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333'
  },
  comparisonItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '13px'
  },
  tableCard: {
    marginTop: '30px'
  },
  tableTitle: {
    margin: '0 0 15px',
    fontSize: '18px',
    color: '#333'
  },
  tableContainer: {
    overflow: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    background: '#f8f9fa',
    borderBottom: '2px solid #e9ecef',
    fontSize: '13px',
    fontWeight: 600,
    color: '#666'
  },
  tr: {
    borderBottom: '1px solid #e9ecef'
  },
  td: {
    padding: '12px',
    fontSize: '13px',
    color: '#333'
  },
  statusBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    display: 'inline-block'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginTop: '20px'
  },
  statCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center'
  },
  statTitle: {
    margin: '0 0 8px',
    fontSize: '13px',
    color: '#666'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333'
  },
  trafficCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  },
  trafficTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    color: '#333'
  },
  trafficValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '5px'
  },
  trafficPercentage: {
    fontSize: '14px',
    color: '#666'
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

export default AdminReports;
