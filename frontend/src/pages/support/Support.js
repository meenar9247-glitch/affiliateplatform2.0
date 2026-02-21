import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiPaperclip,
  FiSearch,
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiFile,
  FiImage,
  FiDownload,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiMinus,
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiSmile,
  FiFrown,
  FiMeh,
  FiAward,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiLink,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';

const Support = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, faq, contact
  
  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  
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

  // FAQ State
  const [faqs, setFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Categories
  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: <FiAlertCircle /> },
    { value: 'billing', label: 'Billing & Payments', icon: <FiMail /> },
    { value: 'account', label: 'Account Issues', icon: <FiUser /> },
    { value: 'referral', label: 'Referral Problems', icon: <FiStar /> },
    { value: 'feature', label: 'Feature Request', icon: <FiPlus /> },
    { value: 'other', label: 'Other', icon: <FiHelpCircle /> }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#28a745' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'high', label: 'High', color: '#dc3545' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchTickets();
    fetchFAQs();
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

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/faqs`
      );
      
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs');
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
    
    // Validate file size (max 5MB)
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
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('subject', newTicket.subject);
      formData.append('category', newTicket.category);
      formData.append('priority', newTicket.priority);
      formData.append('message', newTicket.message);
      
      newTicket.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
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
      const formData = new FormData();
      formData.append('message', replyMessage);
      
      replyAttachments.forEach(file => {
        formData.append('attachments', file);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${ticketId}/reply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        setReplyAttachments([]);
        fetchTickets();
        
        // Refresh selected ticket
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
      case 'open': return { bg: '#e3f2fd', color: '#1976d2' };
      case 'in-progress': return { bg: '#fff3e0', color: '#f57c00' };
      case 'resolved': return { bg: '#e8f5e9', color: '#388e3c' };
      case 'closed': return { bg: '#f5f5f5', color: '#757575' };
      default: return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'low': return <FiChevronDown className="text-green-500" />;
      case 'medium': return <FiMinus className="text-yellow-500" />;
      case 'high': return <FiChevronUp className="text-orange-500" />;
      case 'urgent': return <FiAlertCircle className="text-red-500" />;
      default: return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading support center...</p>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Support Center</h1>
        <p>How can we help you today?</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon response">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">&lt; 2h</span>
            <span className="stat-label">Avg Response Time</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon satisfaction">
            <FiSmile />
          </div>
          <div className="stat-info">
            <span className="stat-value">98%</span>
            <span className="stat-label">Satisfaction Rate</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon tickets">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">24/7</span>
            <span className="stat-label">Support Available</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="support-tabs">
        <button
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <FiMessageCircle />
          My Tickets
        </button>
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <FiBookOpen />
          FAQ
        </button>
        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FiMail />
          Contact Us
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            {!selectedTicket ? (
              <>
                {/* Tickets List */}
                <div className="tickets-header">
                  <h2>Your Support Tickets</h2>
                  <button
                    className="new-ticket-btn"
                    onClick={() => setShowNewTicket(true)}
                  >
                    <FiPlus />
                    New Ticket
                  </button>
                </div>

                {showNewTicket ? (
                  <div className="new-ticket-form">
                    <h3>Create New Ticket</h3>
                    
                    <form onSubmit={handleSubmitTicket}>
                      <div className="form-group">
                        <label>Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          value={newTicket.subject}
                          onChange={handleInputChange}
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Category</label>
                          <select
                            name="category"
                            value={newTicket.category}
                            onChange={handleInputChange}
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Priority</label>
                          <select
                            name="priority"
                            value={newTicket.priority}
                            onChange={handleInputChange}
                          >
                            {priorities.map(p => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Message *</label>
                        <textarea
                          name="message"
                          value={newTicket.message}
                          onChange={handleInputChange}
                          placeholder="Describe your issue in detail..."
                          rows="5"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Attachments</label>
                        <div className="file-upload">
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                          />
    <label htmlFor="file-upload" className="file-upload-label">
                            <FiPaperclip />
                            Choose Files
                          </label>
                          <span className="file-upload-hint">
                            Max 5MB per file
                          </span>
                        </div>

                        {newTicket.attachments.length > 0 && (
                          <div className="attachments-list">
                            {newTicket.attachments.map((file, index) => (
                              <div key={index} className="attachment-item">
                                <FiFile />
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                  type="button"
                                  className="remove-attachment"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <FiXCircle />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="cancel-btn"
                          onClick={() => setShowNewTicket(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="submit-btn"
                          disabled={sending}
                        >
                          {sending ? <FiRefreshCw className="spin" /> : <FiSend />}
                          {sending ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="tickets-list">
                    {tickets.length === 0 ? (
                      <div className="empty-state">
                        <FiMessageCircle className="empty-icon" />
                        <h3>No tickets yet</h3>
                        <p>Create your first support ticket to get help</p>
                        <button
                          className="create-first-btn"
                          onClick={() => setShowNewTicket(true)}
                        >
                          Create Ticket
                        </button>
                      </div>
                    ) : (
                      tickets.map(ticket => (
                        <div
                          key={ticket._id}
                          className="ticket-item"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="ticket-header">
                            <div className="ticket-title">
                              <h3>{ticket.subject}</h3>
                              <span
                                className="status-badge"
                                style={getStatusColor(ticket.status)}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <div className="ticket-meta">
                              <span className="ticket-id">
                                #{ticket.ticketNumber}
                              </span>
                              <span className="ticket-date">
                                <FiCalendar />
                                {formatDate(ticket.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="ticket-info">
                            <span className="ticket-category">
                              <FiTag />
                              {categories.find(c => c.value === ticket.category)?.label}
                            </span>
                            <span className="ticket-priority">
                              {getPriorityIcon(ticket.priority)}
                              {ticket.priority}
                            </span>
                          </div>

                          <div className="ticket-footer">
                            <span className="replies-count">
                              <FiMessageCircle />
                              {ticket.replies?.length || 0} replies
                            </span>
                            {ticket.lastReplyAt && (
                              <span className="last-reply">
                                Last reply: {formatDate(ticket.lastReplyAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Ticket Detail View */
              <div className="ticket-detail">
                <button
                  className="back-btn"
                  onClick={() => setSelectedTicket(null)}
                >
                  <FiArrowLeft />
                  Back to Tickets
                </button>

                <div className="ticket-detail-header">
                  <h2>{selectedTicket.subject}</h2>
                  <div className="ticket-actions">
                    {selectedTicket.status !== 'closed' && (
                      <button
                        className="close-ticket-btn"
                        onClick={() => handleCloseTicket(selectedTicket._id)}
                      >
                        <FiXCircle />
                        Close Ticket
                      </button>
                    )}
                    {selectedTicket.status === 'closed' && (
                      <button
                        className="reopen-ticket-btn"
                        onClick={() => handleReopenTicket(selectedTicket._id)}
                      >
                        <FiRefreshCw />
                        Reopen Ticket
                      </button>
                    )}
                  </div>
                </div>

                <div className="ticket-metadata">
                  <div className="metadata-item">
                    <span className="label">Ticket ID:</span>
                    <span className="value">#{selectedTicket.ticketNumber}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Status:</span>
                    <span
                      className="status-value"
                      style={getStatusColor(selectedTicket.status)}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Category:</span>
                    <span className="value">
                      {categories.find(c => c.value === selectedTicket.category)?.label}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Priority:</span>
                    <span className={`value priority-${selectedTicket.priority}`}>
                      {getPriorityIcon(selectedTicket.priority)}
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>

                {/* Original Message */}
                <div className="message-thread">
                  <div className="message-item original">
                    <div className="message-header">
                      <div className="message-author">
                        <div className="author-avatar">
                          <FiUser />
                        </div>
                        <div>
                          <span className="author-name">You</span>
                          <span className="message-time">
                            {formatDate(selectedTicket.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span className="message-badge">Original</span>
                    </div>
                    <div className="message-content">
                      {selectedTicket.message}
                    </div>
                    {selectedTicket.attachments?.length > 0 && (
                      <div className="message-attachments">
                        {selectedTicket.attachments.map((att, index) => (
                          <a
                            key={index}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-link"
                          >
                            <FiFile />
                            {att.filename}
                            <FiExternalLink />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
          {/* Replies */}
                  {selectedTicket.replies?.map((reply, index) => (
                    <div
                      key={index}
                      className={`message-item ${reply.isStaff ? 'staff' : ''}`}
                    >
                      <div className="message-header">
                        <div className="message-author">
                          <div className="author-avatar">
                            {reply.isStaff ? <FiAward /> : <FiUser />}
                          </div>
                          <div>
                            <span className="author-name">
                              {reply.isStaff ? 'Support Team' : 'You'}
                            </span>
                            <span className="message-time">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                        {reply.isStaff && (
                          <span className="message-badge staff">Staff</span>
                        )}
                      </div>
                      <div className="message-content">
                        {reply.message}
                      </div>
                      {reply.attachments?.length > 0 && (
                        <div className="message-attachments">
                          {reply.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-link"
                            >
                              <FiFile />
                              {att.filename}
                              <FiExternalLink />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <div className="reply-form">
                    <h3>Add Reply</h3>
                    
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      rows="4"
                    />

                    <div className="reply-attachments">
                      {replyAttachments.length > 0 && (
                        <div className="attachments-list">
                          {replyAttachments.map((file, index) => (
                            <div key={index} className="attachment-item">
                              <FiFile />
                              <span className="file-name">{file.name}</span>
                              <button
                                type="button"
                                className="remove-attachment"
                                onClick={() => removeReplyAttachment(index)}
                              >
                                <FiXCircle />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="reply-actions">
                        <div className="file-upload">
                          <input
                            type="file"
                            id="reply-file-upload"
                            multiple
                            onChange={handleReplyFileUpload}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="reply-file-upload" className="file-upload-btn">
                            <FiPaperclip />
                            Attach Files
                          </label>
                        </div>

                        <button
                          className="send-reply-btn"
                          onClick={() => handleReply(selectedTicket._id)}
                          disabled={sending || !replyMessage.trim()}
                        >
                          {sending ? <FiRefreshCw className="spin" /> : <FiSend />}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="faq-tab">
            <h2>Frequently Asked Questions</h2>
            
            <div className="faq-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="faq-categories">
              <button
                className={`category-chip ${searchQuery === '' ? 'active' : ''}`}
                onClick={() => setSearchQuery('')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`category-chip ${searchQuery === cat.label ? 'active' : ''}`}
                  onClick={() => setSearchQuery(cat.label)}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="faq-list">
              {filteredFAQs.length === 0 ? (
                <div className="empty-state">
                  <FiHelpCircle className="empty-icon" />
                  <h3>No FAQs found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              ) : (
                filteredFAQs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <div
                      className="faq-question"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <div className="question-content">
                        <span className="question-text">{faq.question}</span>
                        <span className="faq-category-tag">
                          {faq.category}
                        </span>
                      </div>
                      <span className="expand-icon">
                        {expandedFaq === index ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    </div>
                    {expandedFaq === index && (
                      <div className="faq-answer">
                        {faq.answer}
                        
                        {faq.links && faq.links.length > 0 && (
                          <div className="faq-links">
                            <h4>Related Links:</h4>
                            <ul>
                              {faq.links.map((link, idx) => (
                                <li key={idx}>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                                    <FiLink />
                                    {link.title}
                                    <FiExternalLink />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="faq-helpful">
                          <span>Was this helpful?</span>
                          <div className="helpful-buttons">
                            <button className="helpful-btn">
                              <FiThumbsUp />
                              Yes
                            </button>
                            <button className="helpful-btn">
                              <FiThumbsDown />
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="contact-tab">
            <h2>Contact Us Directly</h2>
            <p className="contact-description">
              Choose your preferred way to reach our support team
            </p>

            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon email">
                  <FiMail />
                </div>
                <h3>Email Support</h3>
                <p>Get a response within 24 hours</p>
                <a href="mailto:support@affiliate.com" className="contact-link">
                  support@affiliate.com
                </a>
                <div className="contact-hours">
                  <FiClock />
                  Response time: &lt; 24h
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon chat">
                  <FiMessageCircle />
                </div>
                <h3>Live Chat</h3>
                <p>Instant response during business hours</p>
                <button className="contact-link chat-btn">
                  Start Chat
                </button>
                <div className="contact-hours">
                  <FiClock />
                  Available: 9 AM - 6 PM IST
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon phone">
                  <FiPhone />
                </div>
                <h3>Phone Support</h3>
                <p>Speak directly with our team</p>
                <a href="tel:+18001234567" className="contact-link">
                  +1 (800) 123-4567
                </a>
                <div className="contact-hours">
                  <FiClock />
                  Available: 24/7
                </div>
              </div>
            </div>

            <div className="office-hours">
              <h3>Office Hours</h3>
              <div className="hours-grid">
                <div className="hours-item">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 8:00 PM IST</span>
                </div>
                <div className="hours-item">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM IST</span>
                </div>
                <div className="hours-item">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            <div className="emergency-section">
              <h3>Emergency Support</h3>
              <p>
                For urgent issues like security concerns or account access problems,
                please use our emergency contact:
              </p>
              <a href="mailto:emergency@affiliate.com" className="emergency-link">
                <FiAlertCircle />
                emergency@affiliate.com
              </a>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .support-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .support-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .support-header h1 {
          margin: 0 0 10px;
          font-size: 32px;
          color: #333;
        }

        .support-header p {
          margin: 0;
          color: #666;
          font-size: 18px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.response {
          background: #e3f2fd;
          color: #1976d2;
        }

        .stat-icon.satisfaction {
          background: #e8f5e9;
          color: #388e3c;
        }

        .stat-icon.tickets {
          background: #fff3e0;
          color: #f57c00;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 13px;
          color: #666;
                  }
                  /* Tabs */
        .support-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .tab-btn:hover {
          background: #f8f9fa;
        }

        .tab-btn.active {
          background: #667eea;
          color: white;
        }

        /* Tab Content */
        .tab-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          min-height: 500px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Tickets Tab */
        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tickets-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .new-ticket-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        /* New Ticket Form */
        .new-ticket-form {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .new-ticket-form h3 {
          margin: 0 0 20px;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .file-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
        }

        .file-upload-hint {
          margin-left: 10px;
          font-size: 12px;
          color: #999;
        }

        .attachments-list {
          margin-top: 10px;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 5px;
        }

        .file-name {
          flex: 1;
          font-size: 13px;
        }

        .file-size {
          font-size: 11px;
          color: #999;
        }

        .remove-attachment {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
        }

        .submit-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Tickets List */
        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ticket-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
        }

        .ticket-item:hover {
          background: #e9ecef;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .ticket-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ticket-title h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .ticket-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #666;
        }

        .ticket-info {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .ticket-category,
        .ticket-priority {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
        }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #999;
        }

        .replies-count {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* Ticket Detail */
        .ticket-detail {
          padding: 20px 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .ticket-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ticket-detail-header h2 {
          margin: 0;
          color: #333;
        }

        .ticket-actions {
          display: flex;
          gap: 10px;
        }

        .close-ticket-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .reopen-ticket-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .ticket-metadata {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
        }

        .metadata-item .label {
          font-size: 11px;
          color: #999;
          margin-bottom: 3px;
        }

        .metadata-item .value {
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .message-thread {
          margin-bottom: 30px;
        }

        .message-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .message-item.staff {
          background: #e3f2fd;
          border-left: 3px solid #1976d2;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .message-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          background: #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .author-name {
          font-weight: 500;
          color: #333;
        }

        .message-time {
          font-size: 11px;
          color: #999;
          margin-left: 5px;
        }

        .message-badge {
          padding: 2px 8px;
          background: #ddd;
          border-radius: 12px;
          font-size: 11px;
        }

        .message-badge.staff {
          background: #1976d2;
          color: white;
        }

        .message-content {
          color: #666;
          line-height: 1.6;
        }

        .message-attachments {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }

        .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          text-decoration: none;
          color: #666;
          font-size: 12px;
        }

        .reply-form {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .reply-form h3 {
          margin: 0 0 15px;
          color: #333;
        }

        .reply-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 15px;
          resize: vertical;
        }

        .reply-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
        }

        .send-reply-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .send-reply-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* FAQ Tab */
        .faq-search {
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

        .faq-search input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .faq-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .category-chip {
          padding: 6px 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
        }

        .category-chip.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-item {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .faq-question {
          padding: 15px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .question-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .question-text {
          font-weight: 500;
          color: #333;
        }
        .faq-category-tag {
          padding: 2px 8px;
          background: #e9ecef;
          border-radius: 12px;
          font-size: 11px;
          color: #666;
        }

        .expand-icon {
          color: #999;
        }

        .faq-answer {
          padding: 20px;
          background: white;
          color: #666;
          line-height: 1.6;
        }

        .faq-links {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .faq-links h4 {
          margin: 0 0 10px;
          font-size: 14px;
          color: #333;
        }

        .faq-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .faq-links li {
          margin-bottom: 5px;
        }

        .faq-links a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #667eea;
          text-decoration: none;
        }

        .faq-helpful {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .faq-helpful span {
          color: #666;
        }

        .helpful-buttons {
          display: flex;
          gap: 10px;
        }

        .helpful-btn {
          padding: 5px 10px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 3px;
          cursor: pointer;
        }

        /* Contact Tab */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .contact-card {
          padding: 30px;
          background: #f8f9fa;
          border-radius: 10px;
          text-align: center;
        }

        .contact-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 15px;
        }

        .contact-icon.email {
          background: #e3f2fd;
          color: #1976d2;
        }

        .contact-icon.chat {
          background: #e8f5e9;
          color: #388e3c;
        }

        .contact-icon.phone {
          background: #fff3e0;
          color: #f57c00;
        }

        .contact-card h3 {
          margin: 0 0 10px;
          color: #333;
        }

        .contact-card p {
          margin: 0 0 15px;
          color: #666;
          font-size: 14px;
        }

        .contact-link {
          display: inline-block;
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          text-decoration: none;
          color: #333;
          margin-bottom: 10px;
        }

        .contact-link:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .chat-btn {
          background: white;
          border: 1px solid #ddd;
          cursor: pointer;
        }

        .contact-hours {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 12px;
          color: #999;
        }

        .office-hours {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .office-hours h3 {
          margin: 0 0 15px;
          color: #333;
        }

        .hours-grid {
          display: grid;
          gap: 10px;
        }

        .hours-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .emergency-section {
          padding: 20px;
          background: #ffebee;
          border-radius: 8px;
          text-align: center;
        }

        .emergency-section h3 {
          margin: 0 0 10px;
          color: #c62828;
        }

        .emergency-section p {
          margin: 0 0 15px;
          color: #b71c1c;
        }

        .emergency-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 10px 20px;
          background: #c62828;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px;
        }

        .empty-icon {
          font-size: 48px;
          color: #ddd;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0 0 10px;
          color: #666;
        }

        .empty-state p {
          margin: 0 0 20px;
          color: #999;
        }

        .create-first-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          .support-header h1,
          .tickets-header h2,
          .new-ticket-form h3,
          .ticket-detail-header h2,
          .message-author .author-name,
          .office-hours h3,
          .contact-card h3 {
            color: #f7fafc;
          }

          .support-header p,
          .stat-label,
          .tab-description,
          .contact-card p,
          .contact-hours {
            color: #e2e8f0;
          }

          .tab-content,
          .stat-card,
          .ticket-item,
          .new-ticket-form,
          .ticket-metadata,
          .message-item,
          .reply-form,
          .contact-card,
          .office-hours {
            background: #2d3748;
          }

          .faq-question {
            background: #1a202c;
          }

          .question-text {
            color: #f7fafc;
          }

          .faq-answer {
            background: #2d3748;
            color: #e2e8f0;
          }

          .form-group label {
            color: #e2e8f0;
          }

          .form-group input,
          .form-group select,
          .form-group textarea,
          .faq-search input {
            background: #1a202c;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .ticket-item:hover {
            background: #1a202c;
          }

          .ticket-title h3,
          .metadata-item .value {
            color: #f7fafc;
          }

          .ticket-meta,
          .ticket-info,
          .ticket-footer,
          .metadata-item .label {
            color: #e2e8f0;
          }

          .message-item.staff {
            background: #1a2a4a;
          }

          .attachment-link,
          .file-upload-label,
          .file-upload-btn {
            background: #1a202c;
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .category-chip {
            background: #1a202c;
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .category-chip.active {
            background: #667eea;
            color: white;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .support-tabs {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 1;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .ticket-header,
          .ticket-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }

          .ticket-meta {
            flex-wrap: wrap;
          }

          .ticket-detail-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .ticket-metadata {
            grid-template-columns: 1fr;
          }

          .faq-categories {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Support;
