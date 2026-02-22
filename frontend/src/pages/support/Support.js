import React, { useState, useEffect } from 'react';
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
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiFile,
  FiExternalLink,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Support = () => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('faq'); // faq, tickets, contact
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
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

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I earn commissions?',
      answer: 'You can earn commissions by sharing your unique referral links. When someone clicks your link and makes a purchase, you earn a commission based on the product\'s commission rate.',
      category: 'Earnings',
      helpful: true
    },
    {
      id: 2,
      question: 'When do I get paid?',
      answer: 'Payments are processed on the 1st and 15th of every month, provided you have reached the minimum payout threshold of $50.',
      category: 'Payments',
      helpful: true
    },
    {
      id: 3,
      question: 'How do I withdraw my earnings?',
      answer: 'Go to Wallet → Withdrawals, choose your preferred payment method (PayPal, Bank Transfer, or UPI), enter the amount, and submit your request.',
      category: 'Withdrawals',
      helpful: true
    },
    {
      id: 4,
      question: 'What is the minimum withdrawal amount?',
      answer: 'The minimum withdrawal amount is $10 for PayPal and $25 for bank transfers.',
      category: 'Withdrawals',
      helpful: true
    },
    {
      id: 5,
      question: 'How do I create referral links?',
      answer: 'Go to Affiliate Links page, browse products, and click "Get Link" to generate your unique referral link for any product.',
      category: 'Referrals',
      helpful: true
    },
    {
      id: 6,
      question: 'My commission is not showing up?',
      answer: 'Commissions may take 24-48 hours to appear in your account. If it\'s been longer, please check if the sale was valid (returns/cancellations don\'t earn commissions).',
      category: 'Earnings',
      helpful: false
    }
  ];

  const categories = [
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Issues' },
    { value: 'referral', label: 'Referral Problems' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#28a745' },
    { value: 'medium', label: 'Medium', color: '#ffc107' },
    { value: 'high', label: 'High', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/tickets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({ ...newTicket, [name]: value });
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Reply sent');
        setReplyMessage('');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return { bg: '#e3f2fd', color: '#1976d2' };
      case 'closed': return { bg: '#f5f5f5', color: '#757575' };
      default: return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading support center...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Support Center</h1>
        <p style={styles.headerSubtitle}>How can we help you today?</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'faq' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('faq')}
        >
          <FiHelpCircle style={styles.tabIcon} />
          FAQ
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'tickets' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('tickets')}
        >
          <FiMessageCircle style={styles.tabIcon} />
          My Tickets
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'contact' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('contact')}
        >
          <FiMail style={styles.tabIcon} />
          Contact Us
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            <div style={styles.searchBox}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.faqList}>
              {filteredFaqs.map((faq) => (
                <div key={faq.id} style={styles.faqItem}>
                  <div
                    style={styles.faqQuestion}
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    <div style={styles.faqQuestionContent}>
                      <span style={styles.faqQuestionText}>{faq.question}</span>
                      <span style={styles.faqCategory}>{faq.category}</span>
                    </div>
                    <span>
                      {expandedFaq === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </div>
                  
                  {expandedFaq === faq.id && (
                    <div style={styles.faqAnswer}>
                      <p style={styles.faqAnswerText}>{faq.answer}</p>
                      <div style={styles.faqHelpful}>
                        <span>Was this helpful?</span>
                        <div style={styles.helpfulButtons}>
                          <button style={styles.helpfulBtn}>
                            <FiThumbsUp /> Yes
                          </button>
                          <button style={styles.helpfulBtn}>
                            <FiThumbsDown /> No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            {!selectedTicket ? (
              <>
                <div style={styles.ticketsHeader}>
                  <h2 style={styles.ticketsTitle}>Your Support Tickets</h2>
                  <button
                    style={styles.newTicketBtn}
                    onClick={() => setShowNewTicket(true)}
                  >
                    + New Ticket
                  </button>
                </div>

                {showNewTicket ? (
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
                                {cat.label}
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
                          {sending ? <FiRefreshCw /> : <FiSend />}
                          {sending ? ' Submitting...' : ' Submit Ticket'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={styles.ticketsList}>
                    {tickets.length === 0 ? (
                      <div style={styles.emptyState}>
                        <FiMessageCircle style={styles.emptyIcon} />
                        <h3>No tickets yet</h3>
                        <p>Create your first support ticket</p>
                      </div>
                    ) : (
                      tickets.map(ticket => (
                        <div
                          key={ticket.id}
                          style={styles.ticketCard}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div style={styles.ticketHeader}>
                            <h3 style={styles.ticketSubject}>{ticket.subject}</h3>
                            <span style={{
                              ...styles.ticketStatus,
                              ...getStatusColor(ticket.status)
                            }}>
                              {ticket.status}
                            </span>
                          </div>
                          <div style={styles.ticketMeta}>
                            <span style={styles.ticketId}>#{ticket.id}</span>
                            <span style={styles.ticketDate}>
                              <FiCalendar /> {formatDate(ticket.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <button
                  style={styles.backBtn}
                  onClick={() => setSelectedTicket(null)}
                >
                  <FiArrowLeft /> Back to Tickets
                </button>
                <div style={styles.ticketDetail}>
                  <h2 style={styles.ticketDetailTitle}>{selectedTicket.subject}</h2>
                  <div style={styles.ticketDetailMeta}>
                    <span>ID: #{selectedTicket.id}</span>
                    <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                  </div>
                  <div style={styles.ticketMessage}>
                    {selectedTicket.message}
                  </div>
                  
                  {/* Reply Form */}
                  <div style={styles.replyForm}>
                    <h3>Add Reply</h3>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows="4"
                      style={styles.textarea}
                    />
                    <button
                      style={styles.sendReplyBtn}
                      onClick={() => handleReply(selectedTicket.id)}
                      disabled={sending}
                    >
                      {sending ? <FiRefreshCw /> : <FiSend />}
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <FiMail style={{...styles.contactIcon, color: '#1976d2'}} />
              <h3 style={styles.contactTitle}>Email Support</h3>
              <p style={styles.contactText}>Get response within 24 hours</p>
              <a href="mailto:support@affiliate.com" style={styles.contactLink}>
                support@affiliate.com
              </a>
            </div>

            <div style={styles.contactCard}>
              <FiMessageCircle style={{...styles.contactIcon, color: '#388e3c'}} />
              <h3 style={styles.contactTitle}>Live Chat</h3>
              <p style={styles.contactText}>Instant response</p>
              <button style={styles.contactBtn}>Start Chat</button>
            </div>

            <div style={styles.contactCard}>
              <FiPhone style={{...styles.contactIcon, color: '#f57c00'}} />
              <h3 style={styles.contactTitle}>Phone Support</h3>
              <p style={styles.contactText}>24/7 available</p>
              <a href="tel:+18001234567" style={styles.contactLink}>
                +1 (800) 123-4567
              </a>
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  headerTitle: {
    fontSize: '32px',
    color: '#333',
    margin: '0 0 10px'
  },
  headerSubtitle: {
    fontSize: '18px',
    color: '#666',
    margin: 0
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '10px'
  },
  tab: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  activeTab: {
    background: '#667eea',
    color: 'white'
  },
  tabIcon: {
    fontSize: '18px'
  },
  content: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    minHeight: '400px'
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px'
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
    padding: '12px 12px 12px 40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  faqItem: {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  faqQuestion: {
    padding: '15px',
    background: '#f8f9fa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  },
  faqQuestionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  faqQuestionText: {
    fontWeight: 500,
    color: '#333'
  },
  faqCategory: {
    padding: '2px 8px',
    background: '#e9ecef',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#666'
  },
  faqAnswer: {
    padding: '20px',
    background: 'white',
    color: '#666',
    lineHeight: '1.6'
  },
  faqAnswerText: {
    margin: '0 0 15px'
  },
  faqHelpful: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e9ecef'
  },
  helpfulButtons: {
    display: 'flex',
    gap: '10px'
  },
  helpfulBtn: {
    padding: '5px 10px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    cursor: 'pointer'
  },
  ticketsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  ticketsTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333'
  },
  newTicketBtn: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  newTicketForm: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },
  formTitle: {
    margin: '0 0 20px',
    color: '#333'
  },
  formGroup: {
    marginBottom: '15px',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 500,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical'
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
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer'
  },
  ticketsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px'
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#ddd',
    marginBottom: '15px'
  },
  ticketCard: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  ticketSubject: {
    margin: 0,
    fontSize: '16px',
    color: '#333'
  },
  ticketStatus: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px'
  },
  ticketMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#666'
  },
  ticketId: {
    fontSize: '12px'
  },
  ticketDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
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
  ticketDetail: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  ticketDetailTitle: {
    margin: '0 0 10px',
    color: '#333'
  },
  ticketDetailMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px'
  },
  ticketMessage: {
    padding: '15px',
    background: 'white',
    borderRadius: '5px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  replyForm: {
    marginTop: '20px'
  },
  sendReplyBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  contactCard: {
    padding: '30px',
    background: '#f8f9fa',
    borderRadius: '10px',
    textAlign: 'center'
  },
  contactIcon: {
    width: '60px',
    height: '60px',
    margin: '0 auto 15px',
    fontSize: '32px'
  },
  contactTitle: {
    margin: '0 0 10px',
    color: '#333'
  },
  contactText: {
    margin: '0 0 15px',
    color: '#666',
    fontSize: '14px'
  },
  contactLink: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#333'
  },
  contactBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer'
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

export default Support;
