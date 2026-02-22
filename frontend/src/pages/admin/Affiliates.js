import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiStar,
  FiAward,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiMoreVertical,
  FiRefreshCw,
  FiPlus,
  FiUpload,
  FiBarChart2,
  FiActivity,
  FiSettings,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiMessageCircle
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminAffiliates = () => {
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('earnings');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    avgCommission: 0,
    topAffiliate: null
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    commissionRate: '',
    paymentMethod: '',
    paymentDetails: ''
  });

  // Commission Form State
  const [commissionForm, setCommissionForm] = useState({
    affiliateId: '',
    amount: '',
    type: 'bonus',
    reason: ''
  });

  useEffect(() => {
    fetchAffiliates();
    fetchStats();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setAffiliates(response.data.affiliates);
      }
    } catch (error) {
      toast.error('Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleStatusChange = async (affiliateId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this affiliate?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/${affiliateId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success(`Affiliate ${newStatus} successfully`);
        fetchAffiliates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (!window.confirm('Are you sure you want to delete this affiliate? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/${affiliateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Affiliate deleted successfully');
        fetchAffiliates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to delete affiliate');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/${selectedAffiliate.id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Affiliate updated successfully');
        setShowEditModal(false);
        fetchAffiliates();
      }
    } catch (error) {
      toast.error('Failed to update affiliate');
    }
  };

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/commission`,
        commissionForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Commission added successfully');
        setShowCommissionModal(false);
        setCommissionForm({
          affiliateId: '',
          amount: '',
          type: 'bonus',
          reason: ''
        });
        fetchAffiliates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to add commission');
    }
  };

  const handleBulkAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} selected affiliates?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/bulk`,
        {
          action,
          affiliateIds: selectedAffiliates
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success(`Bulk ${action} completed`);
        fetchAffiliates();
      }
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/affiliates/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `affiliates-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return { bg: '#e8f5e9', color: '#388e3c', text: 'Active' };
      case 'pending':
        return { bg: '#fff3e0', color: '#f57c00', text: 'Pending' };
      case 'suspended':
        return { bg: '#ffebee', color: '#d32f2f', text: 'Suspended' };
      case 'inactive':
        return { bg: '#f5f5f5', color: '#757575', text: 'Inactive' };
      default:
        return { bg: '#f5f5f5', color: '#757575', text: status };
    }
  };

  const getLevelBadge = (level) => {
    switch(level) {
      case 'bronze':
        return { bg: '#cd7f32', color: 'white', text: 'Bronze' };
      case 'silver':
        return { bg: '#c0c0c0', color: 'white', text: 'Silver' };
      case 'gold':
        return { bg: '#ffd700', color: '#333', text: 'Gold' };
      case 'platinum':
        return { bg: '#e5e4e2', color: '#333', text: 'Platinum' };
      case 'diamond':
        return { bg: '#b9f2ff', color: '#333', text: 'Diamond' };
      default:
        return { bg: '#f5f5f5', color: '#666', text: 'New' };
    }
  };

  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = searchQuery === '' || 
      affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedAffiliates = [...filteredAffiliates].sort((a, b) => {
    let aValue, bValue;
    
    switch(sortBy) {
      case 'earnings':
        aValue = a.totalEarnings;
        bValue = b.totalEarnings;
        break;
      case 'referrals':
        aValue = a.totalReferrals;
        bValue = b.totalReferrals;
        break;
      case 'clicks':
        aValue = a.totalClicks;
        bValue = b.totalClicks;
        break;
      case 'conversions':
        aValue = a.conversions;
        bValue = b.conversions;
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'date':
        aValue = new Date(a.joinedDate);
        bValue = new Date(b.joinedDate);
        break;
      default:
        aValue = a.totalEarnings;
        bValue = b.totalEarnings;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAffiliates = sortedAffiliates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAffiliates.length / itemsPerPage);
  if (loading) {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Loading affiliates...</p>
    </div>
  );
}

return (
  <div style={styles.container}>
    {/* Header */}
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>Affiliate Management</h1>
        <p style={styles.subtitle}>Manage and monitor all affiliates</p>
      </div>
      <div style={styles.headerActions}>
        <button
          style={styles.exportBtn}
          onClick={handleExport}
        >
          <FiDownload />
          Export
        </button>
        <button
          style={styles.addBtn}
          onClick={() => setShowEditModal(true)}
        >
          <FiPlus />
          Add Affiliate
        </button>
      </div>
    </div>

    {/* Stats Cards */}
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <div style={styles.statIconWrapper}>
          <FiUsers style={styles.statIcon} />
        </div>
        <div>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Affiliates</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={{...styles.statIconWrapper, background: '#e8f5e9'}}>
          <FiUserCheck style={{...styles.statIcon, color: '#388e3c'}} />
        </div>
        <div>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={{...styles.statIconWrapper, background: '#fff3e0'}}>
          <FiClock style={{...styles.statIcon, color: '#f57c00'}} />
        </div>
        <div>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={{...styles.statIconWrapper, background: '#ffebee'}}>
          <FiUserX style={{...styles.statIcon, color: '#d32f2f'}} />
        </div>
        <div>
          <div style={styles.statValue}>{stats.suspended}</div>
          <div style={styles.statLabel}>Suspended</div>
        </div>
      </div>

      <div style={styles.statCard}>
        <div style={{...styles.statIconWrapper, background: '#e8f5e9'}}>
          <FiDollarSign style={{...styles.statIcon, color: '#388e3c'}} />
        </div>
        <div>
          <div style={styles.statValue}>${stats.totalEarnings?.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Earnings</div>
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={{...styles.statIconWrapper, background: '#fff3e0'}}>
          <FiTrendingUp style={{...styles.statIcon, color: '#f57c00'}} />
        </div>
        <div>
          <div style={styles.statValue}>{stats.avgCommission}%</div>
          <div style={styles.statLabel}>Avg Commission</div>
        </div>
      </div>
    </div>

    {/* Filters */}
    <div style={styles.filters}>
      <div style={styles.searchBox}>
        <FiSearch style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={styles.filterSelect}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={styles.filterSelect}
      >
        <option value="earnings">Sort by Earnings</option>
        <option value="referrals">Sort by Referrals</option>
        <option value="clicks">Sort by Clicks</option>
        <option value="conversions">Sort by Conversions</option>
        <option value="name">Sort by Name</option>
        <option value="date">Sort by Join Date</option>
      </select>

      <button
        style={styles.sortOrderBtn}
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>

    {/* Affiliates Table */}
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Affiliate</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Level</th>
            <th style={styles.th}>Earnings</th>
            <th style={styles.th}>Referrals</th>
            <th style={styles.th}>Clicks</th>
            <th style={styles.th}>Conv. Rate</th>
            <th style={styles.th}>Joined</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentAffiliates.map(affiliate => {
            const status = getStatusBadge(affiliate.status);
            const level = getLevelBadge(affiliate.level);
            const conversionRate = affiliate.clicks > 0 
              ? ((affiliate.conversions / affiliate.clicks) * 100).toFixed(1)
              : 0;

            return (
              <tr key={affiliate.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.affiliateInfo}>
                    <div style={styles.affiliateAvatar}>
                      {affiliate.name.charAt(0)}
                    </div>
                    <div>
                      <div style={styles.affiliateName}>{affiliate.name}</div>
                      <div style={styles.affiliateEmail}>{affiliate.email}</div>
                      <div style={styles.affiliateId}>ID: {affiliate.id}</div>
                    </div>
                  </div>
                </td>
                
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: status.bg,
                    color: status.color
                  }}>
                    {status.text}
                  </span>
                </td>
                
                <td style={styles.td}>
                  <span style={{
                    ...styles.levelBadge,
                    background: level.bg,
                    color: level.color
                  }}>
                    {level.text}
                  </span>
                </td>
                
                <td style={styles.td}>
                  <div style={styles.earningsInfo}>
                    <span style={styles.earningsAmount}>
                      ${affiliate.totalEarnings?.toLocaleString()}
                    </span>
                    <span style={styles.pendingAmount}>
                      (${affiliate.pendingEarnings} pending)
                    </span>
                  </div>
                </td>
                
                <td style={styles.td}>{affiliate.totalReferrals}</td>
                
                <td style={styles.td}>{affiliate.totalClicks?.toLocaleString()}</td>
                
                <td style={styles.td}>
                  <span style={{
                    ...styles.conversionRate,
                    color: conversionRate > 5 ? '#388e3c' : '#f57c00'
                  }}>
                    {conversionRate}%
                  </span>
                </td>
                
                <td style={styles.td}>
                  <div style={styles.dateInfo}>
                    <FiCalendar style={styles.dateIcon} />
                    {new Date(affiliate.joinedDate).toLocaleDateString()}
                  </div>
                </td>
                
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => {
                        setSelectedAffiliate(affiliate);
                        setShowDetails(true);
                      }}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={() => {
                        setSelectedAffiliate(affiliate);
                        setEditForm({
                          name: affiliate.name,
                          email: affiliate.email,
                          phone: affiliate.phone || '',
                          status: affiliate.status,
                          commissionRate: affiliate.commissionRate,
                          paymentMethod: affiliate.paymentMethod || '',
                          paymentDetails: affiliate.paymentDetails || ''
                        });
                        setShowEditModal(true);
                      }}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={() => {
                        setSelectedAffiliate(affiliate);
                        setCommissionForm({
                          ...commissionForm,
                          affiliateId: affiliate.id
                        });
                        setShowCommissionModal(true);
                      }}
                      title="Add Commission"
                    >
                      <FiDollarSign />
                    </button>
                    <select
                      value={affiliate.status}
                      onChange={(e) => handleStatusChange(affiliate.id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="active">Set Active</option>
                      <option value="pending">Set Pending</option>
                      <option value="suspended">Suspend</option>
                      <option value="inactive">Deactivate</option>
                    </select>
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
        Page {currentPage} of {totalPages}
      </span>
      <button
        style={styles.pageBtn}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
      {/* Affiliate Details Modal */}
      {showDetails && selectedAffiliate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Affiliate Details</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.detailsGrid}>
                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Personal Information</h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Name:</span>
                    <span style={styles.detailValue}>{selectedAffiliate.name}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Email:</span>
                    <span style={styles.detailValue}>{selectedAffiliate.email}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Phone:</span>
                    <span style={styles.detailValue}>{selectedAffiliate.phone || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Location:</span>
                    <span style={styles.detailValue}>{selectedAffiliate.location || 'N/A'}</span>
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Account Status</h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span style={{
                      ...styles.statusBadge,
                      ...getStatusBadge(selectedAffiliate.status)
                    }}>
                      {selectedAffiliate.status}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Level:</span>
                    <span style={{
                      ...styles.levelBadge,
                      ...getLevelBadge(selectedAffiliate.level)
                    }}>
                      {selectedAffiliate.level}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Joined:</span>
                    <span>{new Date(selectedAffiliate.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Last Active:</span>
                    <span>{selectedAffiliate.lastActive ? new Date(selectedAffiliate.lastActive).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Performance</h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Total Earnings:</span>
                    <span style={styles.earningValue}>${selectedAffiliate.totalEarnings?.toLocaleString()}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Pending:</span>
                    <span style={styles.pendingValue}>${selectedAffiliate.pendingEarnings}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Withdrawn:</span>
                    <span>${selectedAffiliate.withdrawnTotal}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Commission Rate:</span>
                    <span>{selectedAffiliate.commissionRate}%</span>
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Statistics</h3>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Total Referrals:</span>
                    <span>{selectedAffiliate.totalReferrals}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Active Referrals:</span>
                    <span>{selectedAffiliate.activeReferrals}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Total Clicks:</span>
                    <span>{selectedAffiliate.totalClicks?.toLocaleString()}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Conversions:</span>
                    <span>{selectedAffiliate.conversions}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div style={styles.paymentSection}>
                <h3 style={styles.paymentSectionTitle}>Payment Information</h3>
                <div style={styles.paymentGrid}>
                  <div style={styles.paymentItem}>
                    <span style={styles.paymentLabel}>PayPal Email:</span>
                    <span>{selectedAffiliate.paypalEmail || 'Not set'}</span>
                  </div>
                  <div style={styles.paymentItem}>
                    <span style={styles.paymentLabel}>Bank Account:</span>
                    <span>{selectedAffiliate.bankAccount ? '****' + selectedAffiliate.bankAccount.slice(-4) : 'Not set'}</span>
                  </div>
                  <div style={styles.paymentItem}>
                    <span style={styles.paymentLabel}>UPI ID:</span>
                    <span>{selectedAffiliate.upiId || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={styles.activitySection}>
                <h3 style={styles.activitySectionTitle}>Recent Activity</h3>
                <div style={styles.activityList}>
                  {selectedAffiliate.recentActivity?.map((activity, index) => (
                    <div key={index} style={styles.activityItem}>
                      <div style={styles.activityIcon}>
                        {activity.type === 'earning' && <FiDollarSign />}
                        {activity.type === 'referral' && <FiUsers />}
                        {activity.type === 'withdrawal' && <FiTrendingUp />}
                      </div>
                      <div style={styles.activityContent}>
                        <div style={styles.activityText}>{activity.description}</div>
                        <div style={styles.activityTime}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Affiliate Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
              </h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div style={styles.modalContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      style={styles.select}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Commission Rate (%)</label>
                    <input
                      type="number"
                      value={editForm.commissionRate}
                      onChange={(e) => setEditForm({...editForm, commissionRate: e.target.value})}
                      style={styles.input}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Method</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                    style={styles.select}
                  >
                    <option value="">Select Method</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {editForm.paymentMethod && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Payment Details</label>
                    <input
                      type="text"
                      value={editForm.paymentDetails}
                      onChange={(e) => setEditForm({...editForm, paymentDetails: e.target.value})}
                      style={styles.input}
                      placeholder={
                        editForm.paymentMethod === 'paypal' ? 'PayPal Email' :
                        editForm.paymentMethod === 'upi' ? 'UPI ID' :
                        'Account Number / IBAN'
                      }
                    />
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.modalCancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.modalSubmitBtn}
                >
                  {selectedAffiliate ? 'Update Affiliate' : 'Add Affiliate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Commission Modal */}
      {showCommissionModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add Commission</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowCommissionModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCommissionSubmit}>
              <div style={styles.modalContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Affiliate</label>
                  <select
                    value={commissionForm.affiliateId}
                    onChange={(e) => setCommissionForm({...commissionForm, affiliateId: e.target.value})}
                    style={styles.select}
                    required
                  >
                    <option value="">Select Affiliate</option>
                    {affiliates.map(aff => (
                      <option key={aff.id} value={aff.id}>
                        {aff.name} ({aff.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount ($) *</label>
                  <input
                    type="number"
                    value={commissionForm.amount}
                    onChange={(e) => setCommissionForm({...commissionForm, amount: e.target.value})}
                    style={styles.input}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Type</label>
                  <select
                    value={commissionForm.type}
                    onChange={(e) => setCommissionForm({...commissionForm, type: e.target.value})}
                    style={styles.select}
                  >
                    <option value="bonus">Bonus</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="correction">Correction</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Reason</label>
                  <textarea
                    value={commissionForm.reason}
                    onChange={(e) => setCommissionForm({...commissionForm, reason: e.target.value})}
                    style={styles.textarea}
                    rows="3"
                    placeholder="Reason for adding commission..."
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.modalCancelBtn}
                  onClick={() => setShowCommissionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.modalSubmitBtn}
                >
                  Add Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    fontSize: '28px',
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
    gap: '10px'
  },
  exportBtn: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  addBtn: {
    padding: '10px 20px',
    background: '#28a745',
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
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statIcon: {
    fontSize: '20px',
    color: '#667eea'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: '11px',
    color: '#666'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchBox: {
    position: 'relative',
    flex: 1,
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
    minWidth: '150px'
  },
  sortOrderBtn: {
    width: '40px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1200px'
  },
  th: {
    padding: '15px',
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
    padding: '15px',
    fontSize: '14px'
  },
  affiliateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  affiliateAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  affiliateName: {
    fontWeight: 500,
    color: '#333',
    marginBottom: '2px'
  },
  affiliateEmail: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '2px'
  },
  affiliateId: {
    fontSize: '11px',
    color: '#999'
  },
  statusBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
    display: 'inline-block'
  },
  levelBadge: {
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
    display: 'inline-block'
  },
  earningsInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  earningsAmount: {
    fontWeight: 500,
    color: '#333'
  },
  pendingAmount: {
    fontSize: '11px',
    color: '#f57c00'
  },
  conversionRate: {
    fontWeight: 500
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '12px',
    color: '#666'
  },
  dateIcon: {
    fontSize: '12px'
  },
  actionButtons: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center'
  },
  actionBtn: {
    padding: '5px',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    color: '#666'
  },
  statusSelect: {
    padding: '5px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '11px'
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
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  modalCancelBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  modalSubmitBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 500,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  detailsSection: {
    background: '#f8f9fa',
    borderRadius: '5px',
    padding: '15px'
  },
  detailsSectionTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    color: '#333'
  },
  detailRow: {
    display: 'flex',
    marginBottom: '8px',
    fontSize: '14px'
  },
  detailLabel: {
    width: '100px',
    color: '#666'
  },
  detailValue: {
    flex: 1,
    color: '#333',
    fontWeight: 500
  },
  earningValue: {
    color: '#28a745',
    fontWeight: 600
  },
  pendingValue: {
    color: '#f57c00',
    fontWeight: 600
  },
  paymentSection: {
    marginBottom: '20px'
  },
  paymentSectionTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    color: '#333'
  },
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    background: '#f8f9fa',
    borderRadius: '5px',
    padding: '15px'
  },
  paymentItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  paymentLabel: {
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px'
  },
  activitySection: {
    background: '#f8f9fa',
    borderRadius: '5px',
    padding: '15px'
  },
  activitySectionTitle: {
    margin: '0 0 10px',
    fontSize: '16px',
    color: '#333'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: 'white',
    borderRadius: '5px'
  },
  activityIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#667eea'
  },
  activityContent: {
    flex: 1
  },
  activityText: {
    fontSize: '13px',
    color: '#333',
    marginBottom: '2px'
  },
  activityTime: {
    fontSize: '11px',
    color: '#999'
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

export default AdminAffiliates;
