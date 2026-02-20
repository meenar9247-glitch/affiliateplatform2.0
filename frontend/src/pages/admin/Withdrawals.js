import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash2,
  FiUser,
  FiMail,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiX,
  FiMoreVertical,
  FiCreditCard,
  FiSmartphone,
  FiGlobe,
  FiBank,
  FiSend,
  FiPrinter
} from 'react-icons/fi';

const AdminWithdrawals = () => {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    averageProcessingTime: 0
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [processForm, setProcessForm] = useState({
    transactionId: '',
    notes: '',
    fee: 0
  });
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    filterAndSortWithdrawals();
  }, [withdrawals, searchTerm, filters, sortConfig]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals`
      );
      
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
        setFilteredWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/stats`
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/payment-methods`
      );
      
      if (response.data.success) {
        setPaymentMethods(response.data.methods);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods');
    }
  };

  const filterAndSortWithdrawals = () => {
    let filtered = [...withdrawals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w._id?.includes(searchTerm) ||
        w.transactionId?.includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    // Method filter
    if (filters.method !== 'all') {
      filtered = filtered.filter(w => w.method === filters.method);
    }

    // Amount range filter
    if (filters.amountRange !== 'all') {
      filtered = filtered.filter(w => {
        const amount = w.amount;
        switch (filters.amountRange) {
          case 'low':
            return amount < 50;
          case 'medium':
            return amount >= 50 && amount < 200;
          case 'high':
            return amount >= 200;
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

      filtered = filtered.filter(w => {
        const wDate = new Date(w.createdAt);
        switch (filters.dateRange) {
          case 'today':
            return wDate >= today;
          case 'week':
            return wDate >= weekAgo;
          case 'month':
            return wDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'amount') {
        aVal = a.amount || 0;
        bVal = b.amount || 0;
      }
      if (sortConfig.key === 'userName') {
        aVal = a.user?.name || '';
        bVal = b.user?.name || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredWithdrawals(filtered);
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
      setSelectedWithdrawals(filteredWithdrawals.map(w => w._id));
    } else {
      setSelectedWithdrawals([]);
    }
  };

  const handleSelectWithdrawal = (withdrawalId) => {
    setSelectedWithdrawals(prev => {
      if (prev.includes(withdrawalId)) {
        return prev.filter(id => id !== withdrawalId);
      } else {
        return [...prev, withdrawalId];
      }
    });
    setSelectAll(false);
  };

  const handleBulkAction = async (action) => {
    if (selectedWithdrawals.length === 0) {
      toast.error('No withdrawals selected');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/bulk`,
        { action, withdrawalIds: selectedWithdrawals }
      );
      
      if (response.data.success) {
        toast.success(`${selectedWithdrawals.length} withdrawals ${action}ed`);
        fetchWithdrawals();
        setSelectedWithdrawals([]);
        setSelectAll(false);
      }
    } catch (error) {
      toast.error(`Failed to ${action} withdrawals`);
    }
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const handleProcessWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setProcessForm({
      transactionId: '',
      notes: '',
      fee: 0
    });
    setShowProcessModal(true);
  };

  const handleRejectWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectForm({
      reason: '',
      notes: ''
    });
    setShowRejectModal(true);
  };

  const handleSubmitProcess = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/${selectedWithdrawal._id}/process`,
        processForm
      );
      
      if (response.data.success) {
        toast.success('Withdrawal processed successfully');
        fetchWithdrawals();
        setShowProcessModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      toast.error('Failed to process withdrawal');
    }
  };

  const handleSubmitReject = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/${selectedWithdrawal._id}/reject`,
        rejectForm
      );
      
      if (response.data.success) {
        toast.success('Withdrawal rejected');
        fetchWithdrawals();
        setShowRejectModal(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    }
  };

  const handleCompleteWithdrawal = async (withdrawalId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/${withdrawalId}/complete`
      );
      
      if (response.data.success) {
        toast.success('Withdrawal marked as completed');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error('Failed to complete withdrawal');
    }
  };

  const handleExportWithdrawals = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/withdrawals/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `withdrawals-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Withdrawals exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export withdrawals');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="status-icon pending" />;
      case 'processing':
        return <FiRefreshCw className="status-icon processing" />;
      case 'completed':
        return <FiCheckCircle className="status-icon completed" />;
      case 'rejected':
        return <FiXCircle className="status-icon rejected" />;
      default:
        return <FiInfo className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'completed':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'paypal':
        return <FiGlobe />;
      case 'bank':
        return <FiBank />;
      case 'upi':
        return <FiSmartphone />;
      default:
        return <FiCreditCard />;
    }
  };

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-icon">
        <Icon />
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
        {subtitle && <p className="stats-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .admin-withdrawals {
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

    .stats-info .stats-icon {
      background: linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%);
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

    .stats-subtitle {
      margin: 0;
      font-size: 13px;
      color: #999;
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

    .bulk-btn.success:hover {
      border-color: #28a745;
      color: #28a745;
    }

    .bulk-btn.danger:hover {
      border-color: #dc3545;
      color: #dc3545;
    }

    /* Withdrawals Table */
    .table-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .withdrawals-table {
      width: 100%;
      border-collapse: collapse;
    }

    .withdrawals-table th {
      padding: 15px 20px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
    }

    .withdrawals-table th:hover {
      background: #e9ecef;
    }

    .withdrawals-table td {
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      color: #666;
    }

    .withdrawals-table tr:hover td {
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
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .status-icon {
      font-size: 12px;
    }

    .status-icon.pending {
      color: #ffc107;
    }

    .status-icon.processing {
      color: #17a2b8;
      animation: spin 2s linear infinite;
    }

    .status-icon.completed {
      color: #28a745;
    }

    .status-icon.rejected {
      color: #dc3545;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .method-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      background: #f8f9fa;
      border-radius: 12px;
      font-size: 11px;
    }

    .amount-positive {
      font-weight: 600;
      color: #28a745;
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

    .action-btn.process:hover {
      color: #28a745;
    }

    .action-btn.reject:hover {
      color: #dc3545;
    }

    .action-btn.complete:hover {
      color: #17a2b8;
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
    .form-group select,
    .form-group textarea {
  width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
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

    .modal-btn.success {
      background: #28a745;
      color: white;
    }

    .modal-btn.success:hover {
      background: #218838;
    }

    .modal-btn.danger {
      background: #dc3545;
      color: white;
    }

    .modal-btn.danger:hover {
      background: #c82333;
    }

    .modal-btn.secondary {
      background: #f8f9fa;
      color: #666;
    }

    .modal-btn.secondary:hover {
      background: #e9ecef;
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

      .withdrawals-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .withdrawals-table td {
        border-top-color: #4a5568;
        color: #e2e8f0;
      }

      .withdrawals-table tr:hover td {
        background: #1a202c;
      }

      .user-name {
        color: #f7fafc;
      }

      .user-email {
        color: #a0aec0;
      }

      .method-badge {
        background: #1a202c;
        color: #e2e8f0;
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
      .form-group select,
      .form-group textarea {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .withdrawals-table {
        font-size: 14px;
      }

      .withdrawals-table th,
      .withdrawals-table td {
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

      .filter-btn,
      .export-btn,
      .refresh-btn {
        width: 100%;
        justify-content: center;
      }

      .withdrawals-table {
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
          <p>Loading withdrawals...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="admin-withdrawals">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Withdrawal Management</h1>
            <p>Manage and process withdrawal requests</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search withdrawals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn" onClick={() => setShowFilterModal(true)}>
              <FiFilter /> Filter
            </button>
            <button className="export-btn" onClick={() => handleExportWithdrawals('csv')}>
              <FiDownload /> Export
            </button>
            <button className="refresh-btn" onClick={fetchWithdrawals}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard icon={FiDollarSign} title="Total Withdrawals" value={stats.total} color="primary" />
          <StatsCard icon={FiClock} title="Pending" value={stats.pending} subtitle={formatCurrency(stats.pendingAmount)} color="warning" />
          <StatsCard icon={FiRefreshCw} title="Processing" value={stats.processing} color="info" />
          <StatsCard icon={FiCheckCircle} title="Completed" value={stats.completed} subtitle={formatCurrency(stats.completedAmount)} color="success" />
          <StatsCard icon={FiXCircle} title="Rejected" value={stats.rejected} color="danger" />
          <StatsCard icon={FiTrendingUp} title="Avg. Processing" value={`${stats.averageProcessingTime}h`} color="info" />
        </div>

        {/* Bulk Actions */}
        {selectedWithdrawals.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedWithdrawals.length} withdrawals selected</span>
            <button className="bulk-btn success" onClick={() => handleBulkAction('process')}>
              <FiSend /> Process
            </button>
            <button className="bulk-btn danger" onClick={() => handleBulkAction('reject')}>
              <FiX /> Reject
            </button>
          </div>
        )}

        {/* Withdrawals Table */}
        <div className="table-container">
          <table className="withdrawals-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th onClick={() => handleSort('userName')}>
                  User {sortConfig.key === 'userName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('amount')}>
                  Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('method')}>
                  Method {sortConfig.key === 'method' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Requested {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedWithdrawals.includes(withdrawal._id)}
                      onChange={() => handleSelectWithdrawal(withdrawal._id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {withdrawal.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{withdrawal.user?.name}</span>
                        <span className="user-email">{withdrawal.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="amount-positive">{formatCurrency(withdrawal.amount)}</span>
                  </td>
                  <td>
                    <span className="method-badge">
                      {getMethodIcon(withdrawal.method)}
                      {withdrawal.method}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: `${getStatusColor(withdrawal.status)}20`, color: getStatusColor(withdrawal.status) }}>
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>{formatDate(withdrawal.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" onClick={() => handleViewDetails(withdrawal)}>
                        <FiEye />
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button className="action-btn process" onClick={() => handleProcessWithdrawal(withdrawal)}>
                            <FiSend />
                          </button>
                          <button className="action-btn reject" onClick={() => handleRejectWithdrawal(withdrawal)}>
                            <FiX />
                          </button>
                        </>
                      )}
                      {withdrawal.status === 'processing' && (
                        <button className="action-btn complete" onClick={() => handleCompleteWithdrawal(withdrawal._id)}>
                          <FiCheck />
                        </button>
                      )}
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
              <h3>Filter Withdrawals</h3>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={filters.method}
                  onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                >
                  <option value="all">All</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount Range</label>
                <select
                  value={filters.amountRange}
                  onChange={(e) => setFilters({ ...filters, amountRange: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="low">Below $50</option>
                  <option value="medium">$50 - $200</option>
                  <option value="high">Above $200</option>
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

        {/* Details Modal */}
        {showDetailsModal && selectedWithdrawal && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Withdrawal Details</h3>
              
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">User:</span>
                  <span className="detail-value">{selectedWithdrawal.user?.name} ({selectedWithdrawal.user?.email})</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value amount-positive">{formatCurrency(selectedWithdrawal.amount)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">{selectedWithdrawal.method}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value" style={{ color: getStatusColor(selectedWithdrawal.status) }}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Requested:</span>
                  <span className="detail-value">{formatDate(selectedWithdrawal.createdAt)}</span>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Processed:</span>
                    <span className="detail-value">{formatDate(selectedWithdrawal.processedAt)}</span>
                  </div>
                )}
                {selectedWithdrawal.transactionId && (
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{selectedWithdrawal.transactionId}</span>
                  </div>
                )}
                {selectedWithdrawal.notes && (
                  <div className="detail-item">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{selectedWithdrawal.notes}</span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}{/* Process Modal */}
        {showProcessModal && selectedWithdrawal && (
          <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Process Withdrawal</h3>
              
              <div className="form-group">
                <label>Amount to Process</label>
                <input
                  type="text"
                  value={formatCurrency(selectedWithdrawal.amount)}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={processForm.transactionId}
                  onChange={(e) => setProcessForm({ ...processForm, transactionId: e.target.value })}
                  placeholder="Enter transaction ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Processing Fee</label>
                <input
                  type="number"
                  value={processForm.fee}
                  onChange={(e) => setProcessForm({ ...processForm, fee: parseFloat(e.target.value) })}
                  placeholder="Enter processing fee (if any)"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={processForm.notes}
                  onChange={(e) => setProcessForm({ ...processForm, notes: e.target.value })}
                  placeholder="Add any notes about this transaction"
                />
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowProcessModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn success" onClick={handleSubmitProcess}>
                  Confirm Process
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedWithdrawal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Reject Withdrawal</h3>
              
              <div className="form-group">
                <label>Reason for Rejection</label>
                <select
                  value={rejectForm.reason}
                  onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
                  required
                >
                  <option value="">Select reason</option>
                  <option value="insufficient_balance">Insufficient Balance</option>
                  <option value="invalid_details">Invalid Payment Details</option>
                  <option value="fraud_suspicion">Fraud Suspicion</option>
                  <option value="duplicate_request">Duplicate Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={rejectForm.notes}
                  onChange={(e) => setRejectForm({ ...rejectForm, notes: e.target.value })}
                  placeholder="Add any additional information"
                />
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn danger" onClick={handleSubmitReject}>
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminWithdrawals;
