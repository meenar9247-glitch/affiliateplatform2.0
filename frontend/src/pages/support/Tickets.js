import React, { useState, useEffect } from 'react';
import {
  FiMessageCircle,
  FiPlus,
  FiSend,
  FiPaperclip,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiTag,
  FiArrowLeft,
  FiRefreshCw,
  FiFile,
  FiDownload,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Tickets = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, closed
  const [searchQuery, setSearchQuery] = useState('');

  // New Ticket Form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
    attachments: []
  });

  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: '🔧' },
    { value: 'billing', label: 'Billing & Payments', icon: '💰' },
    { value: 'account', label: 'Account Issues', icon: '👤' },
    { value: 'referral', label: 'Referral Problems', icon: '🤝' },
    { value: 'feature', label: 'Feature Request', icon: '✨' },
    { value: 'other', label: 'Other', icon: '📌' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#28a745', bg: '#e8f5e9' },
    { value: 'medium', label: 'Medium', color: '#ff9800', bg: '#fff3e0' },
    { value: 'high', label: 'High', color: '#f44336', bg: '#ffebee' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545', bg: '#fde9e9' }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({
      ...newTicket,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setNewTicket({
      ...newTicket,
      attachments: [...newTicket.attachments, ...validFiles]
    });
  };

  const handleReplyFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setReplyAttachments([...replyAttachments, ...files]);
  };

  const removeAttachment = (index) => {
    setNewTicket({
      ...newTicket,
      attachments: newTicket.attachments.filter((_, i) => i !== index)
    });
  };

  const removeReplyAttachment = (index) => {
    setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets`,
        newTicket,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket created successfully');
        setShowNewTicket(false);
        setNewTicket({
          subject: '',
          category: 'technical',
          priority: 'medium',
          message: '',
          attachments: []
        });
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/reply`,
        { message: replyMessage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        setReplyAttachments([]);
        fetchTickets();
        const updatedTicket = tickets.find(t => t._id === ticketId);
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket closed');
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const handleReopenTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/reopen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket reopened');
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to reopen ticket');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open':
        return { bg: '#e3f2fd', color: '#1976d2', text: 'Open' };
      case 'in-progress':
        return { bg: '#fff3e0', color: '#f57c00', text: 'In Progress' };
      case 'resolved':
        return { bg: '#e8f5e9', color: '#388e3c', text: 'Resolved' };
      case 'closed':
        return { bg: '#f5f5f5', color: '#757575', text: 'Closed' };
      default:
        return { bg: '#f5f5f5', color: '#757575', text: status };
    }
  };

  const getPriorityStyle = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (searchQuery) {
      return ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Support Tickets</h1>
          <p style={styles.subtitle}>Manage your support requests</p>
        </div>
        <button
          style={styles.newTicketBtn}
          onClick={() => setShowNewTicket(true)}
        >
          <FiPlus />
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📫</div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Tickets</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#e3f2fd', color: '#1976d2'}}>📨</div>
          <div>
            <div style={styles.statValue}>{stats.open}</div>
            <div style={styles.statLabel}>Open</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#fff3e0', color: '#f57c00'}}>⏳</div>
          <div>
            <div style={styles.statValue}>{stats.inProgress}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#e8f5e9', color: '#388e3c'}}>✅</div>
          <div>
            <div style={styles.statValue}>{stats.resolved}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterTabs}>
          <button
            style={{...styles.filterTab, ...(filter === 'all' ? styles.activeFilter : {})}}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            style={{...styles.filterTab, ...(filter === 'open' ? styles.activeFilter : {})}}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            style={{...styles.filterTab, ...(filter === 'in-progress' ? styles.activeFilter : {})}}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button
            style={{...styles.filterTab, ...(filter === 'resolved' ? styles.activeFilter : {})}}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
          <button
            style={{...styles.filterTab, ...(filter === 'closed' ? styles.activeFilter : {})}}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>
        <div style={styles.searchBox}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Main Content */}
      {!selectedTicket ? (
        <>
          {/* New Ticket Form */}
          {showNewTicket && (
            <div style={styles.newTicketForm}>
              <h3 style={styles.formTitle}>Create New Ticket</h3>
              <form onSubmit={handleSubmitTicket}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={newTicket.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                      name="category"
                      value={newTicket.category}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Priority</label>
                    <select
                      name="priority"
                      value={newTicket.priority}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      {priorities.map(p => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={newTicket.message}
                    onChange={handleInputChange}
                    placeholder="Describe your issue in detail..."
                    rows="5"
                    style={styles.textarea}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Attachments</label>
                  <div style={styles.fileUpload}>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" style={styles.fileUploadLabel}>
                      <FiPaperclip />
                      Choose Files
                    </label>
                    <span style={styles.fileUploadHint}>Max 5MB per file</span>
                  </div>

                  {newTicket.attachments.length > 0 && (
                    <div style={styles.attachmentsList}>
                      {newTicket.attachments.map((file, index) => (
                        <div key={index} style={styles.attachmentItem}>
                          <FiFile />
                          <span style={styles.fileName}>{file.name}</span>
                          <span style={styles.fileSize}>
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            type="button"
                            style={styles.removeAttachment}
                            onClick={() => removeAttachment(index)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => setShowNewTicket(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    disabled={sending}
                  >
                    {sending ? <FiRefreshCw style={styles.spin} /> : <FiSend />}
                    {sending ? ' Submitting...' : ' Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tickets List */}
          {!showNewTicket && (
            <div style={styles.ticketsList}>
              {filteredTickets.length === 0 ? (
                <div style={styles.emptyState}>
                  <FiMessageCircle style={styles.emptyIcon} />
                  <h3>No tickets found</h3>
                  <p>
                    {searchQuery || filter !== 'all'
                      ? 'Try changing your filters'
                      : 'Create your first support ticket'}
                  </p>
                  {!searchQuery && filter === 'all' && (
                    <button
                      style={styles.createFirstBtn}
                      onClick={() => setShowNewTicket(true)}
                    >
                      Create Ticket
                    </button>
                  )}
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const status = getStatusColor(ticket.status);
                  const priority = getPriorityStyle(ticket.priority);
                  return (
                    <div
                      key={ticket._id}
                      style={styles.ticketCard}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div style={styles.ticketHeader}>
                        <div style={styles.ticketTitleSection}>
                          <h3 style={styles.ticketSubject}>{ticket.subject}</h3>
                          <div style={styles.ticketBadges}>
                            <span style={{
                              ...styles.priorityBadge,
                              background: priority.bg,
                              color: priority.color
                            }}>
                              {priority.label}
                            </span>
                            <span style={{
                              ...styles.statusBadge,
                              background: status.bg,
                              color: status.color
                            }}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                        <span style={styles.ticketId}>#{ticket.ticketNumber}</span>
                      </div>

                      <p style={styles.ticketPreview}>
                        {ticket.message?.substring(0, 100)}...
                      </p>

                      <div style={styles.ticketFooter}>
                        <div style={styles.ticketMeta}>
                          <span style={styles.metaItem}>
                            <FiTag />
                            {categories.find(c => c.value === ticket.category)?.label}
                          </span>
                          <span style={styles.metaItem}>
                            <FiCalendar />
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                        <span style={styles.replyCount}>
                          <FiMessageCircle />
                          {ticket.replies?.length || 0} replies
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        /* Ticket Detail View */
        <div style={styles.ticketDetail}>
          <button
            style={styles.backBtn}
            onClick={() => setSelectedTicket(null)}
          >
            <FiArrowLeft />
            Back to Tickets
          </button>

          <div style={styles.ticketDetailHeader}>
            <h2 style={styles.ticketDetailTitle}>{selectedTicket.subject}</h2>
            <div style={styles.ticketDetailActions}>
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                <button
                  style={styles.closeTicketBtn}
                  onClick={() => handleCloseTicket(selectedTicket._id)}
                >
                  <FiXCircle />
                  Close Ticket
                </button>
              ) : (
                <button
                  style={styles.reopenTicketBtn}
                  onClick={() => handleReopenTicket(selectedTicket._id)}
                >
                  <FiRefreshCw />
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>

          <div style={styles.ticketDetailMeta}>
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Ticket ID:</span>
                <span style={styles.metaValue}>#{selectedTicket.ticketNumber}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Status:</span>
                <span style={{
                  ...styles.statusValue,
                  ...getStatusColor(selectedTicket.status)
                }}>
                  {getStatusColor(selectedTicket.status).text}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Priority:</span>
                <span style={{
                  ...styles.priorityValue,
                  background: getPriorityStyle(selectedTicket.priority).bg,
                  color: getPriorityStyle(selectedTicket.priority).color
                }}>
                  {getPriorityStyle(selectedTicket.priority).label}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Category:</span>
                <span style={styles.metaValue}>
                  {categories.find(c => c.value === selectedTicket.category)?.icon}{' '}
                  {categories.find(c => c.value === selectedTicket.category)?.label}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created:</span>
                <span style={styles.metaValue}>
                  {formatDate(selectedTicket.createdAt)}
                </span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Last Updated:</span>
                <span style={styles.metaValue}>
                  {formatDate(selectedTicket.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div style={styles.messageThread}>
            {/* Original Message */}
            <div style={styles.messageItem}>
              <div style={styles.messageHeader}>
                <div style={styles.messageAuthor}>
                  <div style={styles.authorAvatar}>
                    <FiUser />
                  </div>
                  <div>
                    <span style={styles.authorName}>You</span>
                    <span style={styles.messageTime}>
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                <span style={styles.messageBadge}>Original</span>
              </div>
              <div style={styles.messageContent}>
                {selectedTicket.message}
              </div>
            </div>

            {/* Replies */}
            {selectedTicket.replies?.map((reply, index) => (
              <div key={index} style={styles.messageItem}>
                <div style={styles.messageHeader}>
                  <div style={styles.messageAuthor}>
                    <div style={styles.authorAvatar}>
                      {reply.isStaff ? '👨‍💻' : <FiUser />}
                    </div>
                    <div>
                      <span style={styles.authorName}>
                        {reply.isStaff ? 'Support Team' : 'You'}
                      </span>
                      <span style={styles.messageTime}>
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                  </div>
                  {reply.isStaff && (
                    <span style={{...styles.messageBadge, ...styles.staffBadge}}>
                      Staff
                    </span>
                  )}
                </div>
                <div style={styles.messageContent}>
                  {reply.message}
                </div>
                {reply.attachments?.length > 0 && (
                  <div style={styles.messageAttachments}>
                    {reply.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.attachmentLink}
                      >
                        <FiFile />
                        {att.filename}
                        <FiDownload />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply Form */}
          {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
            <div style={styles.replyForm}>
              <h3 style={styles.replyFormTitle}>Add Reply</h3>
              
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows="4"
                style={styles.replyTextarea}
              />

              {replyAttachments.length > 0 && (
                <div style={styles.replyAttachments}>
                  {replyAttachments.map((file, index) => (
                    <div key={index} style={styles.attachmentItem}>
                      <FiFile />
                      <span style={styles.fileName}>{file.name}</span>
                      <button
                        type="button"
                        style={styles.removeAttachment}
                        onClick={() => removeReplyAttachment(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.replyActions}>
                <div style={styles.replyFileUpload}>
                  <input
                    type="file"
                    id="reply-file-upload"
                    multiple
                    onChange={handleReplyFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="reply-file-upload" style={styles.replyFileLabel}>
                    <FiPaperclip />
                    Attach Files
                  </label>
                </div>
                <button
                  style={styles.sendReplyBtn}
                  onClick={() => handleReply(selectedTicket._id)}
                  disabled={sending || !replyMessage.trim()}
                >
                  {sending ? <FiRefreshCw style={styles.spin} /> : <FiSend />}
                  Send Reply
                </button>
              </div>
            </div>
          )}
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
    maxWidth: '1200px',
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
  newTicketBtn: {
    padding: '12px 24px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    background: '#e3f2fd',
    color: '#1976d2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: '13px',
    color: '#666'
  },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  filterTabs: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterTab: {
    padding: '8px 16px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  activeFilter: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    maxWidth: '300px'
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
    borderRadius: '8px',
    fontSize: '14px'
  },
  newTicketForm: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '30px'
  },
  formTitle: {
    margin: '0 0 20px',
    color: '#333',
    fontSize: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '100px'
  },
  fileUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  fileUploadLabel: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px'
  },
  fileUploadHint: {
    fontSize: '12px',
    color: '#999'
  },
  attachmentsList: {
    marginTop: '10px'
  },
  attachmentItem: {
  display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '5px'
  },
  fileName: {
    flex: 1,
    fontSize: '13px',
    color: '#333'
  },
  fileSize: {
    fontSize: '11px',
    color: '#999'
  },
  removeAttachment: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    color: '#666',
    cursor: 'pointer'
  },
  submitBtn: {
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
  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#ddd',
    marginBottom: '15px'
  },
  createFirstBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '15px'
  },
  ticketCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  ticketTitleSection: {
    flex: 1
  },
  ticketSubject: {
    margin: '0 0 8px',
    fontSize: '16px',
    color: '#333'
  },
  ticketBadges: {
    display: 'flex',
    gap: '8px'
  },
  priorityBadge: {
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '11px',
    fontWeight: 500
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '11px',
    fontWeight: 500
  },
  ticketId: {
    fontSize: '12px',
    color: '#999'
  },
  ticketPreview: {
    margin: '0 0 15px',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  },
  ticketMeta: {
    display: 'flex',
    gap: '15px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    color: '#666'
  },
  replyCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    color: '#666'
  },
  ticketDetail: {
    padding: '20px 0'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  ticketDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  ticketDetailTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#333'
  },
  ticketDetailActions: {
    display: 'flex',
    gap: '10px'
  },
  closeTicketBtn: {
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
  reopenTicketBtn: {
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
  ticketDetailMeta: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px'
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  metaLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px'
  },
  metaValue: {
    fontSize: '14px',
    color: '#333'
  },
  statusValue: {
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    display: 'inline-block'
  },
  priorityValue: {
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    display: 'inline-block'
  },
  messageThread: {
    marginBottom: '25px'
  },
  messageItem: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px'
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  messageAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  authorAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  authorName: {
    fontWeight: 500,
    color: '#333',
    marginRight: '8px'
  },
  messageTime: {
    fontSize: '11px',
    color: '#999'
  },
  messageBadge: {
    padding: '3px 10px',
    background: '#e9ecef',
    borderRadius: '15px',
    fontSize: '11px'
  },
  staffBadge: {
    background: '#667eea',
    color: 'white'
  },
  messageContent: {
    color: '#666',
    lineHeight: '1.6'
  },
  messageAttachments: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '15px'
  },
  attachmentLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#666',
    fontSize: '12px'
  },
  replyForm: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px'
  },
  replyFormTitle: {
    margin: '0 0 15px',
    fontSize: '18px',
    color: '#333'
  },
  replyTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '15px'
  },
  replyAttachments: {
    marginBottom: '15px'
  },
  replyActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  replyFileUpload: {
    display: 'flex',
    alignItems: 'center'
  },
  replyFileLabel: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  sendReplyBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
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
  },
  spin: {
    animation: 'spin 1s linear infinite'
  }
};

export default Tickets;
