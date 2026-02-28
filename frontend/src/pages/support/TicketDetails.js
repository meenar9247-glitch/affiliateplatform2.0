import axios from 'axios';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  FiX,
  FiMoreVertical,
  FiPrinter,
  FiShare2,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';

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
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [similarTickets, setSimilarTickets] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: '🔧', color: '#f44336' },
    { value: 'billing', label: 'Billing & Payments', icon: '💰', color: '#4caf50' },
    { value: 'account', label: 'Account Issues', icon: '👤', color: '#2196f3' },
    { value: 'referral', label: 'Referral Problems', icon: '🤝', color: '#ff9800' },
    { value: 'feature', label: 'Feature Request', icon: '✨', color: '#9c27b0' },
    { value: 'security', label: 'Security Concern', icon: '🔒', color: '#f44336' },
    { value: 'other', label: 'Other', icon: '📌', color: '#607d8b' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4caf50', bg: '#e8f5e9' },
    { value: 'medium', label: 'Medium', color: '#ff9800', bg: '#fff3e0' },
    { value: 'high', label: 'High', color: '#f44336', bg: '#ffebee' },
    { value: 'urgent', label: 'Urgent', color: '#d32f2f', bg: '#fde9e9' },
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: '#2196f3', bg: '#e3f2fd' },
    { value: 'in-progress', label: 'In Progress', color: '#ff9800', bg: '#fff3e0' },
    { value: 'pending', label: 'Pending', color: '#9c27b0', bg: '#f3e5f5' },
    { value: 'resolved', label: 'Resolved', color: '#4caf50', bg: '#e8f5e9' },
    { value: 'closed', label: 'Closed', color: '#757575', bg: '#f5f5f5' },
  ];

  useEffect(() => {
    fetchTicketDetails();
    fetchTicketHistory();
    fetchSimilarTickets();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        setTicket(response.data.ticket);
        setIsUrgent(response.data.ticket.priority === 'urgent' || response.data.ticket.priority === 'high');
      }
    } catch (error) {
      toast.error('Failed to fetch ticket details');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/history`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        setTicketHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch ticket history');
    }
  };

  const fetchSimilarTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/similar`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        setSimilarTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch similar tickets');
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
      const formData = new FormData();
      formData.append('message', replyMessage);
      replyAttachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/reply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      
      if (response.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        setReplyAttachments([]);
        fetchTicketDetails();
        fetchTicketHistory();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleResolveTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success('Ticket resolved');
        setShowResolveModal(false);
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to resolve ticket');
    }
  };

  const handleReopenTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/reopen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success('Ticket reopened');
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to reopen ticket');
    }
  };

  const handleDeleteTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        toast.success('Ticket deleted');
        navigate('/support/tickets');
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const handleMarkUrgent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/tickets/${id}/urgent`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (response.data.success) {
        setIsUrgent(true);
        toast.success('Ticket marked as urgent');
        fetchTicketDetails();
      }
    } catch (error) {
      toast.error('Failed to mark as urgent');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket #${ticket?.ticketNumber}`,
          text: ticket?.subject,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const getStatusColor = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityStyle = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy • h:mm a');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
        <div style={styles.headerLeft}>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/support/tickets')}
          >
            <FiArrowLeft />
          Back
          </button>
          <div>
            <div style={styles.ticketId}>
            Ticket #{ticket.ticketNumber}
              {isUrgent && (
                <span style={styles.urgentBadge}>URGENT</span>
              )}
            </div>
            <h1 style={styles.ticketTitle}>{ticket.subject}</h1>
          </div>
        </div>
      
        <div style={styles.headerActions}>
          <button style={styles.actionBtn} onClick={handleCopyLink} title="Copy link">
            <FiCopy />
          </button>
          <button style={styles.actionBtn} onClick={handlePrint} title="Print">
            <FiPrinter />
          </button>
          <button style={styles.actionBtn} onClick={handleShare} title="Share">
            <FiShare2 />
          </button>
          <div style={styles.moreMenu}>
            <button style={styles.actionBtn}>
              <FiMoreVertical />
            </button>
            <div style={styles.menuItems}>
              <button onClick={() => setShowHistory(true)}>
                <FiClock /> View History
              </button>
              <button onClick={() => setShowShareModal(true)}>
                <FiShare2 /> Share
              </button>
              <button onClick={handlePrint}>
                <FiPrinter /> Print
              </button>
              <button onClick={() => setShowDeleteModal(true)}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Info Bar */}
      <div style={styles.infoBar}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Status</span>
          <span style={{
            ...styles.statusBadge,
            background: status.bg,
            color: status.color,
          }}>
            {status.label}
          </span>
        </div>
      
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Priority</span>
          <span style={{
            ...styles.priorityBadge,
            background: priority.bg,
            color: priority.color,
          }}>
            {priority.label}
          </span>
        </div>
      
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Category</span>
          <span style={styles.categoryValue}>
            {category?.icon} {category?.label}
          </span>
        </div>
      
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Created</span>
          <span style={styles.dateValue}>
            <FiCalendar />
            {formatDate(ticket.createdAt)}
          </span>
        </div>
      
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Last Updated</span>
          <span style={styles.dateValue}>
            <FiClock />
            {formatDate(ticket.updatedAt)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
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
                    <FiDownload style={styles.downloadIcon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Replies */}
          {ticket.replies?.map((reply, index) => (
            <div
              key={index}
              style={{
                ...styles.messageItem,
                ...(reply.isStaff ? styles.staffMessage : {}),
              }}
            >
              <div style={styles.messageHeader}>
                <div style={styles.messageAuthor}>
                  <div style={{
                    ...styles.authorAvatar,
                    ...(reply.isStaff ? styles.staffAvatar : {}),
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
                  <span style={styles.staffBadge}>Staff</span>
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
                      <FiDownload style={styles.downloadIcon} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Customer Info */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Customer Information</h3>
            <div style={styles.customerInfo}>
              <div style={styles.customerAvatar}>
                {ticket.customer?.name?.charAt(0) || 'U'}
              </div>
              <div style={styles.customerDetails}>
                <span style={styles.customerName}>
                  {ticket.customer?.name || 'You'}
                </span>
                <span style={styles.customerEmail}>
                  {ticket.customer?.email || ticket.userEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Quick Actions</h3>
            <div style={styles.quickActions}>
              {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                <>
                  <button
                    style={styles.resolveBtn}
                    onClick={() => setShowResolveModal(true)}
                  >
                    <FiCheckCircle />
                  Mark as Resolved
                  </button>
                  {!isUrgent && (
                    <button
                      style={styles.urgentBtn}
                      onClick={handleMarkUrgent}
                    >
                      <FiAlertCircle />
                    Mark as Urgent
                    </button>
                  )}
                </>
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

          {/* Similar Tickets */}
          {similarTickets.length > 0 && (
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Similar Tickets</h3>
              <div style={styles.similarTickets}>
                {similarTickets.map(similar => (
                  <button
                    key={similar.id}
                    style={styles.similarTicket}
                    onClick={() => navigate(`/support/tickets/${similar.id}`)}
                  >
                    <span style={styles.similarTicketId}>#{similar.ticketNumber}</span>
                    <span style={styles.similarTicketSubject}>{similar.subject}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {ticket.tags?.length > 0 && (
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Tags</h3>
              <div style={styles.tags}>
                {ticket.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>
                  #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Reply Form */}
      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
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
                  <span style={styles.attachmentName}>{file.name}</span>
                  <span style={styles.attachmentSize}>
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    style={styles.removeAttachment}
                    onClick={() => removeReplyAttachment(index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.replyActions}>
            <div style={styles.fileUpload}>
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleReplyFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={styles.fileUploadLabel}>
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

      {/* Resolve Modal */}
      {showResolveModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Resolve Ticket</h3>
            <p style={styles.modalText}>
              Are you sure you want to mark this ticket as resolved?
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add resolution notes (optional)"
              rows="3"
              style={styles.modalTextarea}
            />

            <div style={styles.modalRating}>
              <span>Rate your experience:</span>
              <div style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    style={{
                      ...styles.starBtn,
                      ...(rating >= star ? styles.starActive : {}),
                    }}
                    onClick={() => setRating(star)}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.modalConfirmBtn}
                onClick={handleResolveTicket}
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete Ticket</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.modalDeleteBtn}
                onClick={handleDeleteTicket}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, width: '600px'}}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Ticket History</h3>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setShowHistory(false)}
              >
                <FiX />
              </button>
            </div>
            
            <div style={styles.historyList}>
              {ticketHistory.map((event, index) => (
                <div key={index} style={styles.historyItem}>
                  <div style={styles.historyIcon}>
                    {event.type === 'created' && <FiCheckCircle style={{color: '#4caf50'}} />}
                    {event.type === 'replied' && <FiMessageCircle style={{color: '#2196f3'}} />}
                    {event.type === 'resolved' && <FiCheck style={{color: '#4caf50'}} />}
                    {event.type === 'reopened' && <FiRefreshCw style={{color: '#ff9800'}} />}
                    {event.type === 'priority_changed' && <FiAlertCircle style={{color: '#f44336'}} />}
                  </div>
                  <div style={styles.historyContent}>
                    <div style={styles.historyText}>{event.description}</div>
                    <div style={styles.historyTime}>{formatDate(event.timestamp)}</div>
                  </div>
                </div>
              ))}
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
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
    cursor: 'pointer',
    fontSize: '14px',
  },
  ticketId: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  urgentBadge: {
    padding: '2px 8px',
    background: '#f44336',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  ticketTitle: {
    margin: 0,
    fontSize: '28px',
    color: '#333',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  actionBtn: {
    padding: '8px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreMenu: {
    position: 'relative',
  },
  menuItems: {
    position: 'absolute',
    right: 0,
    top: '100%',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'none',
    zIndex: 10,
    minWidth: '150px',
  },
  infoBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  infoLabel: {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    display: 'inline-block',
    width: 'fit-content',
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    display: 'inline-block',
    width: 'fit-content',
  },
  categoryValue: {
    fontSize: '14px',
    color: '#333',
  },
  dateValue: {
    fontSize: '13px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '30px',
    marginBottom: '30px',
  },
  messageThread: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  messageItem: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
  },
  staffMessage: {
    background: '#e3f2fd',
    borderLeft: '4px solid #2196f3',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  messageAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  },
  staffAvatar: {
    background: '#2196f3',
  },
  authorName: {
    fontWeight: 500,
    color: '#333',
    marginRight: '8px',
  },
  messageTime: {
    fontSize: '11px',
    color: '#999',
  },
  messageBadge: {
    padding: '2px 8px',
    background: '#e9ecef',
    borderRadius: '12px',
    fontSize: '11px',
  },
  staffBadge: {
    padding: '2px 8px',
    background: '#2196f3',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
  },
  messageContent: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  messageAttachments: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  attachmentLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#666',
    fontSize: '13px',
  },
  downloadIcon: {
    marginLeft: 'auto',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sidebarTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
  },
  customerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  customerAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    display: 'block',
    fontWeight: 500,
    color: '#333',
    marginBottom: '3px',
  },
  customerEmail: {
    fontSize: '13px',
    color: '#666',
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  resolveBtn: {
    padding: '10px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },
  urgentBtn: {
    padding: '10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },
  reopenBtn: {
    padding: '10px',
    background: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
  },
  similarTickets: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  similarTicket: {
    padding: '10px',
    background: '#f8f9fa',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  similarTicketId: {
    display: 'block',
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px',
  },
  similarTicketSubject: {
    fontSize: '13px',
    color: '#333',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    padding: '4px 8px',
    background: '#f0f4ff',
    color: '#667eea',
    borderRadius: '15px',
    fontSize: '12px',
  },
  replyForm: {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  replyFormTitle: {
    margin: '0 0 15px',
    fontSize: '18px',
    color: '#333',
  },
  replyTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '15px',
  },
  replyAttachments: {
    marginBottom: '15px',
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '5px',
  },
  attachmentName: {
    flex: 1,
    fontSize: '13px',
    color: '#333',
  },
  attachmentSize: {
    fontSize: '11px',
    color: '#999',
  },
  removeAttachment: {
    background: 'none',
    border: 'none',
    color: '#f44336',
    cursor: 'pointer',
  },
  replyActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileUpload: {
    display: 'flex',
    alignItems: 'center',
  },
  fileUploadLabel: {
    padding: '8px 16px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
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
    gap: '5px',
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
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    width: '90%',
    maxWidth: '400px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    margin: '0 0 15px',
    fontSize: '20px',
    color: '#333',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
  },
  modalText: {
    margin: '0 0 20px',
    color: '#666',
    lineHeight: '1.6',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '15px',
    resize: 'vertical',
  },
  modalRating: {
    marginBottom: '20px',
  },
  ratingStars: {
    display: 'flex',
    gap: '5px',
    marginTop: '5px',
  },
  starBtn: {
    padding: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ddd',
  },
  starActive: {
    color: '#ffc107',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    padding: '8px 16px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalDeleteBtn: {
    padding: '8px 16px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  historyList: {
    maxHeight: '400px',
    overflow: 'auto',
  },
  historyItem: {
    display: 'flex',
    gap: '15px',
    padding: '15px 0',
    borderBottom: '1px solid #e9ecef',
  },
  historyIcon: {
    width: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '3px',
  },
  historyTime: {
    fontSize: '11px',
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
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#f44336',
    marginBottom: '15px',
  },
};

export default TicketDetails;
