import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSend,
  FiPaperclip,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiTag,
  FiRefreshCw,
  FiFile,
  FiDownload,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiInfo,
  FiHelpCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');

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
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTicket(response.data.ticket);
      }
    } catch (error) {
      toast.error('Failed to fetch ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setReplyAttachments([...replyAttachments, ...validFiles]);
  };

  const removeReplyAttachment = (index) => {
    setReplyAttachments(replyAttachments.filter((_, i) => i !== index));
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/reply`,
        { message: replyMessage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        setReplyAttachments([]);
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket closed');
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const handleReopenTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/reopen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket reopened');
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to reopen ticket');
    }
  };

  const handleSubmitRating = async () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/rating`,
        { rating, feedback },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setTicket({ ...ticket, rating: { rating, feedback } });
      }
    } catch (error) {
      toast.error('Failed to submit rating');
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle style={styles.errorIcon} />
        <h2>Ticket not found</h2>
        <p>The ticket you're looking for doesn't exist</p>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/support')}
        >
          <FiArrowLeft />
          Back to Support
        </button>
      </div>
    );
  }

  const status = getStatusColor(ticket.status);
  const priority = getPriorityStyle(ticket.priority);
  const category = categories.find(c => c.value === ticket.category);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/support')}
        >
          <FiArrowLeft />
          Back to Tickets
        </button>
        <div style={styles.headerActions}>
          {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
            <button
              style={styles.closeBtn}
              onClick={handleCloseTicket}
            >
              <FiXCircle />
              Close Ticket
            </button>
          ) : (
            <button
              style={styles.reopenBtn}
              onClick={handleReopenTicket}
            >
              <FiRefreshCw />
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      {/* Ticket Info */}
      <div style={styles.ticketHeader}>
        <div>
          <div style={styles.ticketId}>Ticket #{ticket.ticketNumber}</div>
          <h1 style={styles.ticketTitle}>{ticket.subject}</h1>
        </div>
        <div style={styles.ticketBadges}>
          <span style={{
            ...styles.priorityBadge,
            background: priority.bg,
            color: priority.color
          }}>
            {priority.label} Priority
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

      {/* Meta Info */}
      <div style={styles.metaGrid}>
        <div style={styles.metaItem}>
          <FiTag style={styles.metaIcon} />
          <div>
            <div style={styles.metaLabel}>Category</div>
            <div style={styles.metaValue}>{category?.icon} {category?.label}</div>
          </div>
        </div>
        <div style={styles.metaItem}>
          <FiUser style={styles.metaIcon} />
          <div>
            <div style={styles.metaLabel}>Created By</div>
            <div style={styles.metaValue}>{ticket.user?.name || 'You'}</div>
          </div>
        </div>
        <div style={styles.metaItem}>
          <FiCalendar style={styles.metaIcon} />
          <div>
            <div style={styles.metaLabel}>Created At</div>
            <div style={styles.metaValue}>{formatDate(ticket.createdAt)}</div>
          </div>
        </div>
        <div style={styles.metaItem}>
          <FiClock style={styles.metaIcon} />
          <div>
            <div style={styles.metaLabel}>Last Updated</div>
            <div style={styles.metaValue}>{formatDate(ticket.updatedAt)}</div>
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
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
            <span style={styles.messageBadge}>Original</span>
          </div>
          <div style={styles.messageContent}>
            {ticket.message}
          </div>
          {ticket.attachments?.length > 0 && (
            <div style={styles.messageAttachments}>
              {ticket.attachments.map((att, index) => (
                <a
                  key={index}
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

        {/* Replies */}
        {ticket.replies?.map((reply, index) => (
          <div key={index} style={styles.messageItem}>
            <div style={styles.messageHeader}>
              <div style={styles.messageAuthor}>
                <div style={{
                  ...styles.authorAvatar,
                  background: reply.isStaff ? '#667eea' : '#6c757d'
                }}>
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
      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
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
                  <span style={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
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
              onClick={handleReply}
              disabled={sending || !replyMessage.trim()}
            >
              {sending ? <FiRefreshCw style={styles.spin} /> : <FiSend />}
              {sending ? ' Sending...' : ' Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Rating Section (shown when ticket is resolved/closed) */}
      {(ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.rating && (
        <div style={styles.ratingSection}>
          <h3 style={styles.ratingTitle}>How was your experience?</h3>
          <p style={styles.ratingSubtitle}>
            Your feedback helps us improve our support
          </p>

          <div style={styles.ratingButtons}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                style={{
                  ...styles.ratingBtn,
                  ...(rating >= star ? styles.ratingBtnActive : {})
                }}
                onClick={() => setRating(star)}
              >
                <FiStar style={rating >= star ? styles.starActive : {}} />
              </button>
            ))}
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us more about your experience (optional)"
            rows="3"
            style={styles.feedbackTextarea}
          />

          <button
            style={styles.submitRatingBtn}
            onClick={handleSubmitRating}
            disabled={!rating}
          >
            Submit Feedback
          </button>
        </div>
      )}

      {/* Show existing rating */}
      {ticket.rating && (
        <div style={styles.existingRating}>
          <div style={styles.ratingDisplay}>
            <span style={styles.ratingLabel}>Your Rating:</span>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  style={{
                    ...styles.starIcon,
                    ...(star <= ticket.rating.rating ? styles.starFilled : {})
                  }}
                />
              ))}
            </div>
          </div>
          {ticket.rating.feedback && (
            <p style={styles.ratingFeedback}>"{ticket.rating.feedback}"</p>
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    color: '#666',
    cursor: 'pointer'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  closeBtn: {
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
  reopenBtn: {
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
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  ticketId: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '5px'
  },
  ticketTitle: {
    margin: 0,
    fontSize: '28px',
    color: '#333'
  },
  ticketBadges: {
    display: 'flex',
    gap: '10px'
  },
  priorityBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  statusBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metaIcon: {
    fontSize: '20px',
    color: '#667eea'
  },
  metaLabel: {
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px'
  },
  metaValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 500
  },
  messageThread: {
    marginBottom: '30px'
  },
  messageItem: {
    background: '#f8f9fa',
    borderRadius: '10px',
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
    background: '#6c757d',
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
    borderRadius: '10px',
    padding: '25px',
    marginTop: '20px'
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
  ratingSection: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '25px',
    marginTop: '20px',
    textAlign: 'center'
  },
  ratingTitle: {
    margin: '0 0 5px',
    fontSize: '18px',
    color: '#333'
  },
  ratingSubtitle: {
    margin: '0 0 20px',
    color: '#666'
  },
  ratingButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  ratingBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '2px solid #ddd',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingBtnActive: {
    borderColor: '#ffc107',
    background: '#fff3e0'
  },
  starActive: {
    color: '#ffc107',
    fill: '#ffc107'
  },
  feedbackTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '15px'
  },
  submitRatingBtn: {
    padding: '10px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  existingRating: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginTop: '20px'
  },
  ratingDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px'
  },
  ratingLabel: {
    fontSize: '14px',
    color: '#666'
  },
  stars: {
    display: 'flex',
    gap: '5px'
  },
  starIcon: {
    color: '#ddd',
    fontSize: '20px'
  },
  starFilled: {
    color: '#ffc107',
    fill: '#ffc107'
  },
  ratingFeedback: {
    margin: 0,
    color: '#666',
    fontStyle: 'italic'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  errorIcon: {
    fontSize: '48px',
    color: '#dc3545',
    marginBottom: '15px'
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

export default TicketDetails;
    margin: 0,
    fontSize: '28px',
    color: '#333'
  },
  ticketBadges: {
    display: 'flex',
    gap: '10px'
  },
  priorityBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  statusBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metaIcon: {
    fontSize: '20px',
    color: '#667eea'
  },
  metaLabel: {
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px'
  },
  metaValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 500
  },
  messageThread: {
    marginBottom: '30px'
  },
  messageItem: {
    background: '#f8f9fa',
    borderRadius: '10px',
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
  author
