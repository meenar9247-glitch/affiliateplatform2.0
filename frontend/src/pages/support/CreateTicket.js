import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiArrowLeft,
  FiHelpCircle,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiFile,
  FiTrash2,
  FiInfo,
  FiTag,
  FiFlag,
  FiMessageSquare
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: details, 2: preview
  
  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
    attachments: [],
    orderId: '',
    productId: '',
    browser: '',
    os: '',
    device: ''
  });

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Attachments Preview
  const [attachments, setAttachments] = useState([]);

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: '🔧', description: 'Problems with website, links, or functionality' },
    { value: 'billing', label: 'Billing & Payments', icon: '💰', description: 'Issues with payments, invoices, or withdrawals' },
    { value: 'account', label: 'Account Issues', icon: '👤', description: 'Login, profile, or account settings problems' },
    { value: 'referral', label: 'Referral Problems', icon: '🤝', description: 'Issues with referral links or commissions' },
    { value: 'feature', label: 'Feature Request', icon: '✨', description: 'Suggest new features or improvements' },
    { value: 'security', label: 'Security Concern', icon: '🔒', description: 'Report security issues or suspicious activity' },
    { value: 'other', label: 'Other', icon: '📌', description: 'Anything else not covered above' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#28a745', bg: '#e8f5e9', icon: '🟢', description: 'General questions, non-urgent' },
    { value: 'medium', label: 'Medium', color: '#ff9800', bg: '#fff3e0', icon: '🟡', description: 'Need assistance, but not urgent' },
    { value: 'high', label: 'High', color: '#f44336', bg: '#ffebee', icon: '🔴', description: 'Important issue, needs attention' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545', bg: '#fde9e9', icon: '⛔', description: 'Critical issue, immediate help needed' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate total files count
    if (attachments.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Validate each file
    const validFiles = files.filter(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        toast.error(`${file.name} has unsupported file type`);
        return false;
      }
      
      return true;
    });

    // Create preview URLs
    const newAttachments = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachments([...attachments, ...newAttachments]);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...validFiles]
    });
  };

  const removeAttachment = (index) => {
    // Revoke preview URL if exists
    if (attachments[index].preview) {
      URL.revokeObjectURL(attachments[index].preview);
    }
    
    const newAttachments = attachments.filter((_, i) => i !== index);
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    
    setAttachments(newAttachments);
    setFormData({
      ...formData,
      attachments: newFiles
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 10) {
      newErrors.subject = 'Subject must be at least 10 characters';
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select priority level';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message cannot exceed 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const detectSystemInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    // Detect device
    if (ua.includes('Mobile')) device = 'Mobile';
    else if (ua.includes('Tablet')) device = 'Tablet';

    setFormData({
      ...formData,
      browser,
      os,
      device
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setCurrentStep(1);
      toast.error('Please fix the errors in the form');
      return;
    }

    setSending(true);
    try {
      // Detect system info before submitting
      detectSystemInfo();

      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'attachments') {
          formData.attachments.forEach(file => {
            formDataToSend.append('attachments', file);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/tickets`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Ticket created successfully!');
        // Clean up preview URLs
        attachments.forEach(att => {
          if (att.preview) URL.revokeObjectURL(att.preview);
        });
        navigate(`/support/tickets/${response.data.ticketId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSending(false);
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep(2);
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('text')) return '📃';
    return '📎';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/support')}
        >
          <FiArrowLeft />
          Back to Support
        </button>
        <h1 style={styles.title}>Create New Support Ticket</h1>
        <p style={styles.subtitle}>
          We'll respond to your query within 24 hours
        </p>
      </div>

      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: currentStep === 1 ? '50%' : '100%'
          }} />
        </div>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={{
              ...styles.stepCircle,
              ...(currentStep >= 1 ? styles.stepCircleActive : {})
            }}>
              {currentStep > 1 ? <FiCheckCircle /> : '1'}
            </div>
            <span style={styles.stepLabel}>Details</span>
          </div>
          <div style={styles.step}>
            <div style={{
              ...styles.stepCircle,
              ...(currentStep >= 2 ? styles.stepCircleActive : {})
            }}>
              {currentStep > 2 ? <FiCheckCircle /> : '2'}
            </div>
            <span style={styles.stepLabel}>Preview & Submit</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {currentStep === 1 ? (
          /* Step 1: Ticket Details */
          <div style={styles.step1}>
            {/* Subject */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Subject <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief summary of your issue"
                style={{
                  ...styles.input,
                  ...(errors.subject ? styles.inputError : {})
                }}
              />
              {errors.subject && (
                <span style={styles.errorText}>
                  <FiAlertCircle /> {errors.subject}
                </span>
              )}
              <span style={styles.hint}>
                {formData.subject.length}/200 characters
              </span>
            </div>

            {/* Category */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <div style={styles.categoryGrid}>
                {categories.map(cat => (
                  <label
                    key={cat.value}
                    style={{
                      ...styles.categoryOption,
                      ...(formData.category === cat.value ? styles.categoryOptionSelected : {})
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={formData.category === cat.value}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <span style={styles.categoryIcon}>{cat.icon}</span>
                    <div style={styles.categoryInfo}>
                      <span style={styles.categoryLabel}>{cat.label}</span>
                      <span style={styles.categoryDesc}>{cat.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.category && (
                <span style={styles.errorText}>
                  <FiAlertCircle /> {errors.category}
                </span>
              )}
            </div>

            {/* Priority */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Priority <span style={styles.required}>*</span>
              </label>
              <div style={styles.priorityGrid}>
                {priorities.map(p => (
                  <label
                    key={p.value}
                    style={{
                      ...styles.priorityOption,
                      background: p.bg,
                      border: formData.priority === p.value ? `2px solid ${p.color}` : '1px solid #ddd'
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={formData.priority === p.value}
                      onChange={handleInputChange}
                      style={{ display: 'none' }}
                    />
                    <span style={styles.priorityIcon}>{p.icon}</span>
                    <div style={styles.priorityInfo}>
                      <span style={{...styles.priorityLabel, color: p.color}}>
                        {p.label}
                      </span>
                      <span style={styles.priorityDesc}>{p.description}</span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.priority && (
                <span style={styles.errorText}>
                  <FiAlertCircle /> {errors.priority}
                </span>
              )}
            </div>

            {/* Message */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Message <span style={styles.required}>*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please describe your issue in detail. Include any steps to reproduce, error messages, or relevant information."
                rows="6"
                style={{
                  ...styles.textarea,
                  ...(errors.message ? styles.inputError : {})
                }}
              />
              {errors.message && (
                <span style={styles.errorText}>
                  <FiAlertCircle /> {errors.message}
                </span>
              )}
              <span style={styles.hint}>
                {formData.message.length}/5000 characters
              </span>
            </div>

            {/* Optional Fields */}
            <div style={styles.optionalSection}>
              <h3 style={styles.optionalTitle}>
                <FiInfo /> Additional Information (Optional)
              </h3>
              
              <div style={styles.optionalGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Order ID / Transaction ID</label>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder="If related to a specific order"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Product ID / Link</label>
                  <input
                    type="text"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    placeholder="If related to a specific product"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Attachments (Max 5 files, 5MB each)</label>
              <div style={styles.fileUploadArea}>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" style={styles.fileUploadLabel}>
                  <FiPaperclip />
                  Choose Files
                </label>
                <span style={styles.fileUploadHint}>
                  Supported: Images, PDF, DOC, DOCX, TXT
                </span>
              </div>

              {attachments.length > 0 && (
                <div style={styles.attachmentsList}>
                  {attachments.map((att, index) => (
                    <div key={index} style={styles.attachmentItem}>
                      {att.preview ? (
                        <img
                          src={att.preview}
                          alt={att.name}
                          style={styles.attachmentPreview}
                        />
                      ) : (
                        <span style={styles.attachmentIcon}>
                          {getFileIcon(att.type)}
                        </span>
                      )}
                      <div style={styles.attachmentInfo}>
                        <span style={styles.attachmentName}>{att.name}</span>
                        <span style={styles.attachmentSize}>
                          {formatFileSize(att.size)}
                        </span>
                      </div>
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

            {/* Next Button */}
            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.nextBtn}
                onClick={handleNext}
              >
                Next: Preview & Submit
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Preview & Submit */
          <div style={styles.step2}>
            <div style={styles.previewCard}>
              <h3 style={styles.previewTitle}>Review Your Ticket</h3>
              
              <div style={styles.previewSection}>
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Subject:</span>
                  <span style={styles.previewValue}>{formData.subject}</span>
                </div>
                
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Category:</span>
                  <span style={styles.previewValue}>
                    {categories.find(c => c.value === formData.category)?.icon}{' '}
                    {categories.find(c => c.value === formData.category)?.label}
                  </span>
                </div>
                
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Priority:</span>
                  <span style={{
                    ...styles.priorityPreview,
                    color: priorities.find(p => p.value === formData.priority)?.color,
       
                   background: priorities.find(p => p.value === formData.priority)?.bg
                  }}>
                    {priorities.find(p => p.value === formData.priority)?.icon}{' '}
                    {priorities.find(p => p.value === formData.priority)?.label}
                  </span>
                </div>
              </div>

              <div style={styles.previewMessage}>
                <h4 style={styles.previewMessageTitle}>Message:</h4>
                <p style={styles.previewMessageText}>{formData.message}</p>
              </div>

              {formData.orderId && (
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Order ID:</span>
                  <span style={styles.previewValue}>{formData.orderId}</span>
                </div>
              )}

              {formData.productId && (
                <div style={styles.previewRow}>
                  <span style={styles.previewLabel}>Product ID:</span>
                  <span style={styles.previewValue}>{formData.productId}</span>
                </div>
              )}

              {attachments.length > 0 && (
                <div style={styles.previewAttachments}>
                  <h4 style={styles.previewAttachmentsTitle}>Attachments:</h4>
                  <div style={styles.previewAttachmentList}>
                    {attachments.map((att, index) => (
                      <span key={index} style={styles.previewAttachmentItem}>
                        {getFileIcon(att.type)} {att.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.systemInfo}>
                <h4 style={styles.systemInfoTitle}>System Information:</h4>
                <div style={styles.systemInfoGrid}>
                  <div>Browser: {formData.browser || 'Detecting...'}</div>
                  <div>OS: {formData.os || 'Detecting...'}</div>
                  <div>Device: {formData.device || 'Detecting...'}</div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.backStepBtn}
                onClick={handleBack}
              >
                Back to Edit
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
          </div>
        )}
      </form>

      {/* Help Section */}
      <div style={styles.helpSection}>
        <FiHelpCircle style={styles.helpIcon} />
        <div style={styles.helpContent}>
          <h3 style={styles.helpTitle}>Need help?</h3>
          <p style={styles.helpText}>
            Check our <a href="/faq" style={styles.helpLink}>FAQ section</a> or 
            contact us at <a href="mailto:support@affiliate.com" style={styles.helpLink}>support@affiliate.com</a>
          </p>
        </div>
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '30px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    marginBottom: '15px'
  },
  title: {
    fontSize: '28px',
    color: '#333',
    margin: '0 0 10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0
  },
  progressContainer: {
    marginBottom: '30px'
  },
  progressBar: {
    height: '4px',
    background: '#e9ecef',
    borderRadius: '2px',
    marginBottom: '15px'
  },
  progressFill: {
    height: '100%',
    background: '#667eea',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  steps: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#f8f9fa',
    border: '2px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#666'
  },
  stepCircleActive: {
    background: '#667eea',
    borderColor: '#667eea',
    color: 'white'
  },
  stepLabel: {
    fontSize: '12px',
    color: '#666'
  },
  form: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  step1: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  step2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: '#333'
  },
  required: {
    color: '#dc3545'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '120px'
  },
  inputError: {
    borderColor: '#dc3545'
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  },
  hint: {
    display: 'block',
    fontSize: '11px',
    color: '#999',
    marginTop: '5px',
    textAlign: 'right'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  categoryOption: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  categoryOptionSelected: {
    borderColor: '#667eea',
    background: '#f0f4ff'
  },
  categoryIcon: {
    fontSize: '24px'
  },
  categoryInfo: {
    flex: 1
  },
  categoryLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '2px'
  },
  categoryDesc: {
    display: 'block',
    fontSize: '11px',
    color: '#999'
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  priorityOption: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  priorityIcon: {
    fontSize: '20px'
  },
  priorityInfo: {
    flex: 1
  },
  priorityLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '2px'
  },
  priorityDesc: {
    display: 'block',
    fontSize: '11px',
    color: '#999'
  },
  optionalSection: {
    background: '#f8f9fa',
    borderRadius: '5px',
    padding: '20px',
    marginTop: '10px'
  },
  optionalTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  optionalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  fileUploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  fileUploadLabel: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  fileUploadHint: {
    fontSize: '12px',
    color: '#999'
  },
  attachmentsList: {
    marginTop: '15px'
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '8px'
  },
  attachmentPreview: {
    width: '40px',
    height: '40px',
    borderRadius: '5px',
    objectFit: 'cover'
  },
  attachmentIcon: {
    fontSize: '24px'
  },
  attachmentInfo: {
    flex: 1
  },
  attachmentName: {
    display: 'block',
    fontSize: '13px',
    color: '#333',
    marginBottom: '2px'
  },
  attachmentSize: {
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
    gap: '15px',
    marginTop: '20px'
  },
  nextBtn: {
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  backStepBtn: {
    padding: '12px 30px',
    background: 'white',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '12px 30px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  previewCard: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '25px'
  },
  previewTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    color: '#333'
  },
  previewSection: {
    marginBottom: '20px'
  },
  previewRow: {
    display: 'flex',
    marginBottom: '10px'
  },
  previewLabel: {
    width: '100px',
    fontSize: '14px',
    color: '#666'
  },
  previewValue: {
    flex: 1,
    fontSize: '14px',
    color: '#333',
    fontWeight: 500
  },
  priorityPreview: {
    padding: '3px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    display: 'inline-block'
  },
  previewMessage: {
    marginBottom: '20px'
  },
  previewMessageTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    color: '#666'
  },
  previewMessageText: {
    margin: 0,
    padding: '15px',
    background: 'white',
    borderRadius: '5px',
    color: '#333',
    lineHeight: '1.6'
  },
  previewAttachments: {
    marginTop: '20px'
  },
  previewAttachmentsTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    color: '#666'
  },
  previewAttachmentList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  previewAttachmentItem: {
    padding: '5px 10px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '12px'
  },
  systemInfo: {
    marginTop: '20px',
    padding: '15px',
    background: '#e9ecef',
    borderRadius: '5px'
  },
  systemInfoTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    color: '#666'
  },
  systemInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    fontSize: '12px',
    color: '#333'
  },
  helpSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  helpIcon: {
    fontSize: '32px',
    color: '#667eea'
  },
  helpContent: {
    flex: 1
  },
  helpTitle: {
    margin: '0 0 5px',
    fontSize: '16px',
    color: '#333'
  },
  helpText: {
    margin: 0,
    color: '#666'
  },
  helpLink: {
    color: '#667eea',
    textDecoration: 'none'
  },
  spin: {
    animation: 'spin 1s linear infinite'
  }
};

export default CreateTicket;
