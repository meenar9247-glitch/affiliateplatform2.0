import React, { useState, useEffect } from 'react';
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiThumbsUp,
  FiThumbsDown,
  FiHelpCircle,
  FiBookOpen,
  FiVideo,
  FiFileText,
  FiExternalLink,
  FiMail,
  FiMessageCircle,
  FiClock,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiShield,
  FiLock,
  FiCreditCard,
  FiSmartphone,
  FiGlobe,
  FiSettings,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo
} from 'react-icons/fi';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [loading, setLoading] = useState(true);

  // FAQ Categories
  const categories = [
    { id: 'all', name: 'All FAQs', icon: '📚', count: 24 },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀', count: 4 },
    { id: 'earnings', name: 'Earnings & Commissions', icon: '💰', count: 5 },
    { id: 'withdrawals', name: 'Withdrawals & Payments', icon: '💳', count: 4 },
    { id: 'referrals', name: 'Referrals', icon: '👥', count: 3 },
    { id: 'account', name: 'Account & Profile', icon: '👤', count: 3 },
    { id: 'security', name: 'Security & Privacy', icon: '🔒', count: 3 },
    { id: 'technical', name: 'Technical Issues', icon: '🔧', count: 2 }
  ];

  // Popular Questions
  const popularQuestions = [
    { id: 5, question: 'How do I withdraw my earnings?', views: 15420 },
    { id: 1, question: 'How do I earn commissions?', views: 12350 },
    { id: 8, question: 'What is the minimum withdrawal amount?', views: 10890 },
    { id: 3, question: 'How do I create referral links?', views: 9870 }
  ];

  // Related Guides
  const guides = [
    { title: 'Complete Guide for Beginners', icon: '📘', url: '/guides/beginners' },
    { title: 'How to Maximize Your Earnings', icon: '📈', url: '/guides/earnings' },
    { title: 'Marketing Tips & Strategies', icon: '🎯', url: '/guides/marketing' },
    { title: 'Understanding Commission Structure', icon: '📊', url: '/guides/commissions' }
  ];

  // Video Tutorials
  const videos = [
    { title: 'Getting Started with Affiliate Marketing', duration: '5:30', url: '#' },
    { title: 'How to Create Your First Referral Link', duration: '3:45', url: '#' },
    { title: 'Understanding Your Dashboard', duration: '4:20', url: '#' },
    { title: 'Tips for Higher Conversions', duration: '6:15', url: '#' }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // FAQ Data
  const faqs = [
    // Getting Started
    {
      id: 1,
      question: 'How do I get started as an affiliate?',
      answer: 'Getting started is easy! Simply sign up for an account, complete your profile, and browse our products page. Once you find products you want to promote, generate your unique referral links and start sharing them on your social media, website, or with your network.',
      category: 'getting-started',
      icon: '🚀',
      helpful: 245,
      notHelpful: 12,
      views: 12350,
      lastUpdated: '2024-01-15',
      tags: ['beginner', 'signup', 'basics']
    },
    {
      id: 2,
      question: 'Do I need a website to become an affiliate?',
      answer: 'No, you don\'t need a website! You can share your referral links on social media platforms (Facebook, Instagram, Twitter, LinkedIn), through WhatsApp, email, or even in YouTube video descriptions. A website can help, but it\'s not required.',
      category: 'getting-started',
      icon: '🌐',
      helpful: 189,
      notHelpful: 8,
      views: 8760,
      lastUpdated: '2024-01-10',
      tags: ['website', 'social-media', 'requirements']
    },
    {
      id: 3,
      question: 'How do I create referral links?',
      answer: 'To create referral links: 1) Log in to your dashboard, 2) Go to "Affiliate Links" page, 3) Browse or search for products, 4) Click the "Get Link" button on any product, 5) Your unique referral link will be generated. You can also customize your link if you have a preferred format.',
      category: 'getting-started',
      icon: '🔗',
      helpful: 312,
      notHelpful: 15,
      views: 15400,
      lastUpdated: '2024-01-20',
      tags: ['links', 'generation', 'how-to']
    },
    {
      id: 4,
      question: 'Is it really free to join?',
      answer: 'Yes, absolutely! Joining our affiliate program is completely free. There are no signup fees, monthly fees, or hidden charges. You only earn money - you never pay anything.',
      category: 'getting-started',
      icon: '💰',
      helpful: 567,
      notHelpful: 3,
      views: 23450,
      lastUpdated: '2024-01-05',
      tags: ['free', 'cost', 'pricing']
    },

    // Earnings & Commissions
    {
      id: 5,
      question: 'How do I earn commissions?',
      answer: 'You earn commissions when someone clicks your unique referral link and makes a purchase. The commission rate varies by product (typically 5-50%). Commissions are credited to your account when the sale is confirmed (usually after the return period ends).',
      category: 'earnings',
      icon: '💵',
      helpful: 423,
      notHelpful: 21,
      views: 18900,
      lastUpdated: '2024-01-18',
      tags: ['earnings', 'commissions', 'how-it-works']
    },
    {
      id: 6,
      question: 'When do commissions get credited?',
      answer: 'Commissions are initially marked as "Pending" and become "Approved" after the order\'s return period (usually 30 days). This ensures that returns or cancellations don\'t affect your earnings. Once approved, the amount is added to your available balance.',
      category: 'earnings',
      icon: '⏳',
      helpful: 278,
      notHelpful: 19,
      views: 12340,
      lastUpdated: '2024-01-12',
      tags: ['pending', 'approval', 'timing']
    },
    {
      id: 7,
      question: 'What commission rates do you offer?',
      answer: 'Commission rates vary by product and category. Most products offer between 5-30% commission. Some digital products and services offer up to 50%. You can see the exact commission rate for each product on its details page before generating your link.',
      category: 'earnings',
      icon: '📊',
      helpful: 345,
      notHelpful: 17,
      views: 15670,
      lastUpdated: '2024-01-22',
      tags: ['rates', 'percentage', 'products']
    },
    {
      id: 8,
      question: 'Can I earn from multi-level referrals?',
      answer: 'Yes! We offer a multi-level referral program. When someone you refer becomes an affiliate themselves, you earn a small percentage (usually 5%) of their commissions. This is our way of rewarding you for building a team.',
      category: 'earnings',
      icon: '👥',
      helpful: 198,
      notHelpful: 23,
      views: 9870,
      lastUpdated: '2024-01-08',
      tags: ['multi-level', 'team', 'referrals']
    },
    {
      id: 9,
      question: 'Why is my commission pending?',
      answer: 'Commissions show as "Pending" during the order verification and return period. This is standard practice to protect against fraud and ensure that returns/cancellations don\'t result in negative balances. The pending period is usually 30 days.',
      category: 'earnings',
      icon: '⏰',
      helpful: 234,
      notHelpful: 11,
      views: 11230,
      lastUpdated: '2024-01-14',
      tags: ['pending', 'status', 'verification']
    },

    // Withdrawals & Payments
    {
      id: 10,
      question: 'How do I withdraw my earnings?',
      answer: 'To withdraw: 1) Go to Wallet → Withdrawals, 2) Choose your payment method (PayPal, Bank Transfer, or UPI), 3) Enter the amount (minimum $10), 4) Submit your request. Withdrawals are processed within 1-3 business days.',
      category: 'withdrawals',
      icon: '💳',
      helpful: 456,
      notHelpful: 18,
      views: 19870,
      lastUpdated: '2024-01-25',
      tags: ['withdraw', 'payout', 'payment']
    },
    {
      id: 11,
      question: 'What is the minimum withdrawal amount?',
      answer: 'The minimum withdrawal amount is $10 for PayPal and $25 for bank transfers. This helps us keep transaction costs low so we can offer better commission rates to our affiliates.',
      category: 'withdrawals',
      icon: '💰',
      helpful: 389,
      notHelpful: 9,
      views: 16780,
      lastUpdated: '2024-01-17',
      tags: ['minimum', 'threshold', 'amount']
    },
    {
      id: 12,
      question: 'How long do withdrawals take?',
      answer: 'Withdrawal processing times: PayPal - 24-48 hours, Bank Transfer - 2-5 business days, UPI - 24-72 hours. Weekends and holidays may cause slight delays. You\'ll receive an email confirmation when your withdrawal is processed.',
      category: 'withdrawals',
      icon: '⏱️',
      helpful: 267,
      notHelpful: 14,
      views: 13450,
      lastUpdated: '2024-01-19',
      tags: ['timing', 'processing', 'delays']
    },
    {
      id: 13,
      question: 'What payment methods do you support?',
      answer: 'We currently support: PayPal, Direct Bank Transfer (ACH), UPI (for India), and Wire Transfer (for international). More payment options like Payoneer and cryptocurrency are coming soon!',
      category: 'withdrawals',
      icon: '💳',
      helpful: 312,
      notHelpful: 16,
      views: 14560,
      lastUpdated: '2024-01-21',
      tags: ['methods', 'options', 'payment']
    },

    // Referrals
    {
      id: 14,
      question: 'How do I track my referrals?',
      answer: 'Your dashboard shows detailed referral statistics: total clicks, unique visitors, conversions, and earnings. You can also see individual referral activity in the "My Referrals" section, including when they joined and their activity.',
      category: 'referrals',
      icon: '📊',
      helpful: 234,
      notHelpful: 12,
      views: 10890,
      lastUpdated: '2024-01-13',
      tags: ['tracking', 'stats', 'analytics']
    },
    {
      id: 15,
      question: 'What happens if a referral returns a product?',
      answer: 'If a customer returns a product, the corresponding commission is deducted from your account. This is why we have a pending period - to ensure all returns and cancellations are processed before commissions become available.',
      category: 'referrals',
      icon: '🔄',
      helpful: 178,
      notHelpful: 21,
      views: 8760,
      lastUpdated: '2024-01-09',
      tags: ['returns', 'refunds', 'deductions']
    },
    {
      id: 16,
      question: 'Can I refer myself?',
      answer: 'No, self-referrals are strictly prohibited and violate our terms of service. Our system detects and flags suspicious activity, including self-referrals. Violations may result in account suspension and forfeiture of earnings.',
      category: 'referrals',
      icon: '🚫',
      helpful: 445,
      notHelpful: 5,
      views: 18900,
      lastUpdated: '2024-01-07',
      tags: ['self-referral', 'fraud', 'policy']
    },

    // Account & Profile
    {
      id: 17,
      question: 'How do I change my password?',
      answer: 'Go to Settings → Security → Change Password. You\'ll need to enter your current password and then your new password twice. For security, choose a strong password with at least 8 characters including letters, numbers, and symbols.',
      category: 'account',
      icon: '🔐',
      helpful: 289,
      notHelpful: 8,
      views: 12340,
      lastUpdated: '2024-01-16',
      tags: ['password', 'security', 'change']
    },
    {
      id: 18,
      question: 'How do I update my payment information?',
      answer: 'Go to Wallet → Payment Methods. You can add, remove, or update your payment methods here. Make sure to verify your details before saving to ensure smooth withdrawals.',
      category: 'account',
      icon: '💳',
      helpful: 234,
      notHelpful: 11,
      views: 10980,
      lastUpdated: '2024-01-11',
      tags: ['payment', 'bank', 'paypal']
    },
    {
      id: 19,
      question: 'Can I have multiple accounts?',
      answer: 'No, each person is allowed only one account. Multiple accounts are against our terms and may result in all accounts being suspended. If you need to change your account type or have special requirements, please contact support.',
      category: 'account',
      icon: '👤',
      helpful: 167,
      notHelpful: 19,
      views: 7650,
      lastUpdated: '2024-01-06',
      tags: ['multiple', 'duplicate', 'policy']
    },

    // Security & Privacy
    {
      id: 20,
      question: 'How do you protect my data?',
      answer: 'We use industry-standard encryption (SSL/TLS) for all data transmission. Your password is hashed and never stored in plain text. We regularly audit our security and comply with data protection regulations like GDPR.',
      category: 'security',
      icon: '🔒',
      helpful: 198,
      notHelpful: 7,
      views: 9870,
      lastUpdated: '2024-01-19',
      tags: ['security', 'privacy', 'encryption']
    },
    {
      id: 21,
      question: 'What should I do if I suspect fraud?',
      answer: 'If you notice suspicious activity on your account, immediately change your password and contact our support team. We take fraud seriously and have measures in place to protect your account and earnings.',
      category: 'security',
      icon: '⚠️',
      helpful: 156,
      notHelpful: 4,
      views: 6540,
      lastUpdated: '2024-01-14',
      tags: ['fraud', 'suspicious', 'report']
    },
    {
      id: 22,
      question: 'Do you sell my data?',
      answer: 'No, we never sell your personal data. We use your information only to provide and improve our services. You can read our full privacy policy for details about how we handle your data.',
      category: 'security',
      icon: '🛡️',
      helpful: 234,
      notHelpful: 3,
      views: 11230,
      lastUpdated: '2024-01-08',
      tags: ['data', 'privacy', 'gdpr']
    },

    // Technical Issues
    {
      id: 23,
      question: 'Why is my dashboard not loading?',
      answer: 'Try these steps: 1) Clear your browser cache, 2) Use an updated browser (Chrome, Firefox, Safari), 3) Disable ad-blockers temporarily, 4) Check your internet connection. If the issue persists, contact support with your browser details.',
      category: 'technical',
      icon: '🔧',
      helpful: 189,
      notHelpful: 23,
      views: 8760,
      lastUpdated: '2024-01-20',
      tags: ['loading', 'dashboard', 'issues']
    },
    {
      id: 24,
      question: 'Why are my referral links not working?',
      answer: 'Common reasons: 1) Links might be incorrectly formatted, 2) Some platforms block affiliate links, 3) The product might be out of stock, 4) Cookies might be disabled. Test your links in an incognito window first.',
      category: 'technical',
      icon: '🔗',
      helpful: 267,
      notHelpful: 18,
      views: 12340,
      lastUpdated: '2024-01-22',
      tags: ['links', 'broken', 'not-working']
    }
  ];
  // Filter FAQs based on search and category
const filteredFaqs = faqs.filter(faq => {
  const matchesSearch = searchQuery === '' || 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
  
  return matchesSearch && matchesCategory;
});

const getCategoryIcon = (categoryId) => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.icon : '📌';
};

const handleHelpfulClick = (faqId, isHelpful) => {
  setHelpfulFeedback({
    ...helpfulFeedback,
    [faqId]: isHelpful
  });
  // Here you would send feedback to backend
};

if (loading) {
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p>Loading FAQs...</p>
    </div>
  );
}

return (
  <div style={styles.container}>
    {/* Header */}
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <FiHelpCircle style={styles.headerIcon} />
        <div>
          <h1 style={styles.title}>Frequently Asked Questions</h1>
          <p style={styles.subtitle}>
            Find answers to common questions about our affiliate program
          </p>
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div style={styles.statsGrid}>
      <div style={styles.statCard}>
        <FiBookOpen style={styles.statIcon} />
        <div>
          <div style={styles.statValue}>{faqs.length}+</div>
          <div style={styles.statLabel}>Articles</div>
        </div>
      </div>
      <div style={styles.statCard}>
        <FiUsers style={styles.statIcon} />
        <div>
          <div style={styles.statValue}>10k+</div>
          <div style={styles.statLabel}>Happy Affiliates</div>
        </div>
      </div>
      <div style={styles.statCard}>
        <FiClock style={styles.statIcon} />
        <div>
          <div style={styles.statValue}>24/7</div>
          <div style={styles.statLabel}>Support</div>
        </div>
      </div>
      <div style={styles.statCard}>
        <FiTrendingUp style={styles.statIcon} />
        <div>
          <div style={styles.statValue}>98%</div>
          <div style={styles.statLabel}>Satisfaction</div>
        </div>
      </div>
    </div>

    {/* Search Bar */}
    <div style={styles.searchContainer}>
      <FiSearch style={styles.searchIcon} />
      <input
        type="text"
        placeholder="Search FAQs (e.g., withdrawal, commission, referral)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />
      {searchQuery && (
        <button
          style={styles.clearSearch}
          onClick={() => setSearchQuery('')}
        >
          <FiXCircle />
        </button>
      )}
    </div>

    {/* Main Content */}
    <div style={styles.mainContent}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Categories */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarTitle}>Categories</h3>
          {categories.map(category => (
            <button
              key={category.id}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === category.id ? styles.categoryButtonActive : {})
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span style={styles.categoryName}>{category.name}</span>
              <span style={styles.categoryCount}>{category.count}</span>
            </button>
          ))}
        </div>

        {/* Popular Questions */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarTitle}>🔥 Popular Questions</h3>
          {popularQuestions.map(item => {
            const faq = faqs.find(f => f.id === item.id);
            return faq ? (
              <button
                key={item.id}
                style={styles.popularButton}
                onClick={() => {
                  setExpandedFaq(item.id);
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                <span style={styles.popularQuestion}>{faq.question}</span>
                <span style={styles.popularViews}>{item.views.toLocaleString()} views</span>
              </button>
            ) : null;
          })}
        </div>

        {/* Related Guides */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarTitle}>📘 Related Guides</h3>
          {guides.map((guide, index) => (
            <a
              key={index}
              href={guide.url}
              style={styles.guideLink}
            >
              <span>{guide.icon}</span>
              <span style={styles.guideTitle}>{guide.title}</span>
              <FiExternalLink style={styles.externalIcon} />
            </a>
          ))}
        </div>

        {/* Video Tutorials */}
        <div style={styles.sidebarSection}>
          <h3 style={styles.sidebarTitle}>🎥 Video Tutorials</h3>
          {videos.map((video, index) => (
            <a
              key={index}
              href={video.url}
              style={styles.videoLink}
            >
              <FiVideo style={styles.videoIcon} />
              <div style={styles.videoInfo}>
                <span style={styles.videoTitle}>{video.title}</span>
                <span style={styles.videoDuration}>{video.duration}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Need More Help */}
        <div style={styles.helpBox}>
          <FiMessageCircle style={styles.helpBoxIcon} />
          <h4 style={styles.helpBoxTitle}>Still need help?</h4>
          <p style={styles.helpBoxText}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a href="/support/tickets/new" style={styles.helpBoxButton}>
            Contact Support
          </a>
        </div>
      </div>

      {/* FAQ List */}
      <div style={styles.faqList}>
        {filteredFaqs.length === 0 ? (
          <div style={styles.noResults}>
            <FiAlertCircle style={styles.noResultsIcon} />
            <h3 style={styles.noResultsTitle}>No results found</h3>
            <p style={styles.noResultsText}>
              We couldn't find any FAQs matching "{searchQuery}"
            </p>
            <button
              style={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} style={styles.faqItem}>
              <div
                style={styles.faqQuestion}
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <div style={styles.faqQuestionContent}>
                  <span style={styles.faqIcon}>{faq.icon}</span>
                  <div style={styles.faqQuestionText}>
                    <span>{faq.question}</span>
                    <div style={styles.faqMeta}>
                      <span style={styles.faqCategory}>
                        {getCategoryIcon(faq.category)} {categories.find(c => c.id === faq.category)?.name}
                      </span>
                      <span style={styles.faqViews}>
                        👁️ {faq.views.toLocaleString()} views
                      </span>
                      <span style={styles.faqUpdated}>
                        Updated: {new Date(faq.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span style={styles.expandIcon}>
                  {expandedFaq === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </div>
              
              {expandedFaq === faq.id && (
                <div style={styles.faqAnswer}>
                  <div style={styles.faqAnswerText}>
                    {faq.answer}
                  </div>

                  {/* Tags */}
                  {faq.tags && (
                    <div style={styles.tags}>
                      {faq.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={styles.tag}
                          onClick={() => setSearchQuery(tag)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Helpful Buttons */}
                  <div style={styles.helpfulSection}>
                    <span style={styles.helpfulQuestion}>Was this helpful?</span>
                    <div style={styles.helpfulButtons}>
                      <button
                        style={{
                          ...styles.helpfulBtn,
                          ...(helpfulFeedback[faq.id] === true ? styles.helpfulBtnActive : {})
                        }}
                        onClick={() => handleHelpfulClick(faq.id, true)}
                      >
                        <FiThumbsUp />
                        Yes ({faq.helpful})
                      </button>
                      <button
                        style={{
                          ...styles.helpfulBtn,
                          ...(helpfulFeedback[faq.id] === false ? styles.helpfulBtnActive : {})
                        }}
                        onClick={() => handleHelpfulClick(faq.id, false)}
                      >
                        <FiThumbsDown />
                        No ({faq.notHelpful})
                      </button>
                    </div>
                  </div>

                  {/* Related FAQs */}
                  <div style={styles.relatedSection}>
                    <h4 style={styles.relatedTitle}>Related Questions</h4>
                    <div style={styles.relatedList}>
                      {faqs
                        .filter(f => f.category === faq.category && f.id !== faq.id)
                        .slice(0, 3)
                        .map(related => (
                          <button
                            key={related.id}
                            style={styles.relatedItem}
                            onClick={() => setExpandedFaq(related.id)}
                          >
                            <FiHelpCircle />
                            {related.question}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>

    {/* Still Need Help Banner */}
    <div style={styles.helpBanner}>
      <div style={styles.helpBannerContent}>
        <h3 style={styles.helpBannerTitle}>Still have questions?</h3>
        <p style={styles.helpBannerText}>
          Can't find the answer you're looking for? Our support team is ready to help.
        </p>
      </div>
      <div style={styles.helpBannerActions}>
        <a href="/support/tickets/new" style={styles.helpBannerButton}>
          <FiMessageCircle />
          Create Ticket
        </a>
        <a href="mailto:support@affiliate.com" style={styles.helpBannerButtonSecondary}>
          <FiMail />
          Email Us
        </a>
      </div>
    </div>

    {/* Quick Links */}
    <div style={styles.quickLinks}>
      <h3 style={styles.quickLinksTitle}>Quick Links</h3>
      <div style={styles.quickLinksGrid}>
        <a href="/guides/getting-started" style={styles.quickLink}>
          <FiBookOpen />
          Getting Started Guide
        </a>
        <a href="/guides/earnings" style={styles.quickLink}>
          <FiDollarSign />
          Earnings Guide
        </a>
        <a href="/guides/withdrawals" style={styles.quickLink}>
          <FiCreditCard />
          Withdrawal Guide
        </a>
        <a href="/guides/referrals" style={styles.quickLink}>
          <FiUsers />
          Referral Guide
        </a>
        <a href="/guides/security" style={styles.quickLink}>
          <FiShield />
          Security Tips
        </a>
        <a href="/guides/best-practices" style={styles.quickLink}>
          <FiAward />
          Best Practices
        </a>
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    padding: '40px',
    marginBottom: '30px',
    color: 'white'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIcon: {
    fontSize: '48px'
  },
  title: {
    fontSize: '32px',
    margin: '0 0 10px'
  },
  subtitle: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.9
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
    fontSize: '32px',
    color: '#667eea'
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
  searchContainer: {
    position: 'relative',
    marginBottom: '30px'
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '15px 15px 15px 50px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '16px'
  },
  clearSearch: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '30px',
    marginBottom: '40px'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  sidebarSection: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sidebarTitle: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
    borderBottom: '2px solid #667eea',
    paddingBottom: '8px'
  },
  categoryButton: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '5px',
    background: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left'
  },
  categoryButtonActive: {
    background: '#f0f4ff',
    color: '#667eea'
  },
  categoryName: {
    flex: 1,
    fontSize: '14px'
  },
  categoryCount: {
    fontSize: '12px',
    color: '#999',
    background: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  popularButton: {
    width: '100%',
    padding: '10px',
    marginBottom: '5px',
    background: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  popularQuestion: {
    display: 'block',
    fontSize: '13px',
    color: '#333',
    marginBottom: '3px'
  },
  popularViews: {
    fontSize: '11px',
    color: '#999'
  },
  guideLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    marginBottom: '5px',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '5px'
  },
  guideTitle: {
    flex: 1,
    fontSize: '13px'
  },
  externalIcon: {
    fontSize: '12px',
    color: '#999'
  },
  videoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    marginBottom: '5px',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '5px'
  },
  videoIcon: {
    color: '#ff4444'
  },
  videoInfo: {
    flex: 1
  },
  videoTitle: {
    display: 'block',
    fontSize: '13px',
    marginBottom: '2px'
  },
  videoDuration: {
    fontSize: '11px',
    color: '#999'
  },
  helpBox: {
    background: '#667eea',
    borderRadius: '10px',
    padding: '20px',
    color: 'white',
    textAlign: 'center'
  },
  helpBoxIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  helpBoxTitle: {
    margin: '0 0 10px',
    fontSize: '16px'
  },
  helpBoxText: {
    margin: '0 0 15px',
    fontSize: '13px',
    opacity: 0.9
  },
  helpBoxButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 500
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  faqItem: {
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  faqQuestion: {
    padding: '20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqQuestionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1
  },
  faqIcon: {
    fontSize: '24px'
  },
  faqQuestionText: {
    flex: 1
  },
  faqMeta: {
    display: 'flex',
    gap: '15px',
    marginTop: '5px',
    fontSize: '11px',
    color: '#999'
  },
  faqCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  faqViews: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  faqUpdated: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  expandIcon: {
    color: '#999'
  },
  faqAnswer: {
    padding: '0 20px 20px 59px',
    borderTop: '1px solid #e9ecef'
  },
  faqAnswerText: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '15px'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px'
  },
  tag: {
    padding: '4px 10px',
    background: '#f0f4ff',
    color: '#667eea',
    borderRadius: '15px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  helpfulSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  helpfulQuestion: {
    fontSize: '14px',
    color: '#666'
  },
  helpfulButtons: {
    display: 'flex',
    gap: '10px'
  },
  helpfulBtn: {
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  helpfulBtnActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  relatedSection: {
    marginTop: '15px'
  },
  relatedTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    color: '#666'
  },
  relatedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  relatedItem: {
    padding: '8px 12px',
    background: '#f8f9fa',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left'
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '10px'
  },
  noResultsIcon: {
    fontSize: '48px',
    color: '#999',
    marginBottom: '15px'
  },
  noResultsTitle: {
    margin: '0 0 10px',
    color: '#666'
  },
  noResultsText: {
    margin: '0 0 20px',
    color: '#999'
  },
  clearSearchBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  helpBanner: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  helpBannerContent: {
    flex: 1
  },
  helpBannerTitle: {
    margin: '0 0 5px',
    fontSize: '20px',
    color: '#333'
  },
  helpBannerText: {
    margin: 0,
    color: '#666'
  },
  helpBannerActions: {
    display: 'flex',
    gap: '10px'
  },
  helpBannerButton: {
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  helpBannerButtonSecondary: {
    padding: '12px 24px',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '5px',
    border: '1px solid #667eea',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  quickLinks: {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  quickLinksTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    color: '#333'
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  quickLink: {
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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

export default FAQ;
