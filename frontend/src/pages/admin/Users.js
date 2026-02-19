import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiAward,
  FiShield,
  FiStar,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiClock,
  FiLock,
  FiUnlock
} from 'react-icons/fi';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    verified: 'all',
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    unverified: 0,
    admins: 0,
    affiliates: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    verified: false
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/users`
      );
      
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/users/stats`
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id?.includes(searchTerm)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    // Verified filter
    if (filters.verified !== 'all') {
      filtered = filtered.filter(user => 
        filters.verified === 'verified' ? user.isVerified : !user.isVerified
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        switch (filters.dateRange) {
          case 'today':
            return userDate >= today;
          case 'week':
            return userDate >= weekAgo;
          case 'month':
            return userDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'earnings') {
        aVal = a.wallet?.totalEarned || 0;
        bVal = b.wallet?.totalEarned || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
    setSelectAll(false);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/users/bulk`,
        { action, userIds: selectedUsers }
      );
      
      if (response.data.success) {
        toast.success(`${selectedUsers.length} users ${action}ed`);
        fetchUsers();
        setSelectedUsers([]);
        setSelectAll(false);
      }
    } catch (error) {
      toast.error(`Failed to ${action} users`);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/toggle-status`
      );
      
      if (response.data.success) {
        toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/users/${userId}/toggle-verification`
      );
      
      if (response.data.success) {
        toast.success(`User verification ${currentStatus ? 'removed' : 'added'}`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to toggle verification');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/users/${userId}`
        );
        
        if (response.data.success) {
          toast.success('User deleted successfully');
          fetchUsers();
          setShowDeleteModal(false);
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'active' : 'inactive',
      verified: user.isVerified
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/users/${selectedUser._id}`,
        editForm
      );
      
      if (response.data.success) {
        toast.success('User updated successfully');
        fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleExportUsers = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/users/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Users exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export users');
    }
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, change, color = 'primary' }) => (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-icon">
        <Icon />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
        {change !== undefined && (
          <p className={`stats-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .admin-users {
      padding: 40px 20px;
      max-width: 1400px;
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

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .search-box input {
      width: 100%;
      padding: 10px 10px 10px 40px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .filter-btn,
    .export-btn,
    .refresh-btn {
      padding: 10px 16px;
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

    .filter-btn:hover,
    .export-btn:hover,
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

    .stats-primary .stats-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stats-success .stats-icon {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .stats-warning .stats-icon {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    }

    .stats-danger .stats-icon {
      background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
    }

    .stats-icon {
      width: 50px;
      height: 50px;
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

    .stats-change {
      margin: 0;
      font-size: 12px;
    }

    .stats-change.positive {
      color: #28a745;
    }

    .stats-change.negative {
      color: #dc3545;
    }

    /* Bulk Actions */
    .bulk-actions {
      background: white;
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .selected-count {
      font-weight: 600;
      color: #667eea;
    }

    .bulk-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background: white;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
    }

    .bulk-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .bulk-btn.danger:hover {
      border-color: #dc3545;
      color: #dc3545;
    }

    /* Users Table */
    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th {
      padding: 15px 20px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
    }

    .users-table th:hover {
      background: #e9ecef;
    }

    .users-table td {
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    .users-table tr:hover td {
      background: #f8f9fa;
    }

    .checkbox-col {
      width: 40px;
      text-align: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: #333;
    }

    .user-email {
      font-size: 12px;
      color: #999;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .role-admin {
      background: #cce5ff;
      color: #004085;
    }

    .role-user {
      background: #e2e3e5;
      color: #383d41;
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
    }

    .verified-yes {
      color: #28a745;
    }

    .verified-no {
      color: #999;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .action-btn {
      padding: 5px;
      border: none;
      background: none;
      cursor: pointer;
      color: #666;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #f8f9fa;
    }

    .action-btn.view:hover {
      color: #667eea;
    }

    .action-btn.edit:hover {
      color: #28a745;
    }

    .action-btn.delete:hover {
      color: #dc3545;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      gap: 5px;
    }

    .pagination-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    .pagination-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox-group input {
      width: auto;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .modal-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .modal-btn.primary {
      background: #667eea;
      color: white;
    }

    .modal-btn.primary:hover {
      background: #5a67d8;
    }

    .modal-btn.secondary {
      background: #f8f9fa;
      color: #666;
    }

    .modal-btn.secondary:hover {
      background: #e9ecef;
    }

    .modal-btn.danger {
      background: #dc3545;
      color: white;
    }

    .modal-btn.danger:hover {
      background: #c82333;
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
      .stats-card,
      .bulk-actions,
      .table-container,
      .modal-content {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p,
      .stats-content h3 {
        color: #e2e8f0;
      }

      .stats-value {
        color: #f7fafc;
      }

      .search-box input,
      .filter-btn,
      .export-btn,
      .refresh-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .filter-btn:hover,
      .export-btn:hover,
      .refresh-btn:hover {
        background: #2d3748;
      }

      .users-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .users-table td {
        border-top-color: #4a5568;
        color: #e2e8f0;
      }

      .users-table tr:hover td {
        background: #1a202c;
      }

      .user-name {
        color: #f7fafc;
      }

      .user-email {
        color: #a0aec0;
      }

      .action-btn {
        color: #a0aec0;
      }

      .action-btn:hover {
        background: #4a5568;
      }

      .bulk-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .bulk-btn:hover {
        background: #2d3748;
      }

      .pagination-btn {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .pagination-btn:hover:not(:disabled) {
        background: #4a5568;
      }

      .modal-content h3 {
        color: #f7fafc;
      }

      .form-group label {
        color: #e2e8f0;
      }

      .form-group input,
      .form-group select {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .users-table {
        font-size: 14px;
      }

      .users-table th,
      .users-table td {
        padding: 12px;
      }

      .action-buttons {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-direction: column;
      }

      .search-box {
        width: 100%;
      }

      .users-table {
        display: block;
        overflow-x: auto;
      }

      .bulk-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .bulk-btn {
        justify-content: center;
      }

      .modal-content {
        padding: 20px;
      }

      .modal-actions {
        flex-direction: column;
      }

      .modal-btn {
        width: 100%;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="admin-users">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>User Management</h1>
            <p>Manage and monitor user accounts</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn" onClick={() => setShowFilterModal(true)}>
              <FiFilter /> Filter
            </button>
            <button className="export-btn" onClick={() => handleExportUsers('csv')}>
              <FiDownload /> Export
            </button>
            <button className="refresh-btn" onClick={fetchUsers}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard icon={FiUsers} title="Total Users" value={stats.total} color="primary" />
          <StatsCard icon={FiUserCheck} title="Active" value={stats.active} color="success" />
          <StatsCard icon={FiUserX} title="Inactive" value={stats.inactive} color="danger" />
          <StatsCard icon={FiCheckCircle} title="Verified" value={stats.verified} color="success" />
          <StatsCard icon={FiShield} title="Admins" value={stats.admins} color="warning" />
          <StatsCard icon={FiTrendingUp} title="New Today" value={stats.newToday} color="primary" />
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedUsers.length} users selected</span>
            <button className="bulk-btn" onClick={() => handleBulkAction('activate')}>
              <FiToggleRight /> Activate
            </button>
            <button className="bulk-btn" onClick={() => handleBulkAction('deactivate')}>
              <FiToggleLeft /> Deactivate
            </button>
            <button className="bulk-btn" onClick={() => handleBulkAction('verify')}>
              <FiCheckCircle /> Verify
            </button>
            <button className="bulk-btn" onClick={() => handleBulkAction('make-admin')}>
              <FiShield /> Make Admin
            </button>
            <button className="bulk-btn danger" onClick={() => handleBulkAction('delete')}>
              <FiTrash2 /> Delete
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th onClick={() => handleSort('name')}>
                  User {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('role')}>
                  Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('verified')}>
                  Verified {sortConfig.key === 'verified' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('earnings')}>
                  Earnings {sortConfig.key === 'earnings' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Joined {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`verified-badge verified-${user.isVerified ? 'yes' : 'no'}`}>
                      {user.isVerified ? (
                        <><FiCheckCircle /> Verified</>
                      ) : (
                        <><FiXCircle /> Unverified</>
                      )}
                    </span>
                  </td>
                  <td>{formatCurrency(user.wallet?.totalEarned || 0)}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Details">
                        <FiEye />
                      </button>
                      <button className="action-btn edit" onClick={() => handleEditUser(user)}>
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-btn" disabled>Previous</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn">Next</button>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Filter Users</h3>
              
              <div className="form-group">
                <label>Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Verification</label>
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowFilterModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn primary" onClick={() => setShowFilterModal(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit User</h3>
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="verified"
                  checked={editForm.verified}
                  onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                />
                <label htmlFor="verified">Verified</label>
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn primary" onClick={handleUpdateUser}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;
