import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { affiliateService } from '../../services/affiliateService';
import { AFFILIATE_LEVELS } from '../../services/affiliateService';

// ==================== Initial State ====================

const initialState = {
  // Dashboard data
  dashboard: null,
  
  // Links
  links: [],
  currentLink: null,
  
  // Referrals
  referrals: [],
  referralTree: null,
  referralStats: null,
  
  // Earnings
  earnings: [],
  earningsSummary: null,
  earningsHistory: [],
  
  // Commissions
  commissions: [],
  commissionSummary: null,
  pendingCommissions: [],
  
  // Payouts
  payouts: [],
  payoutMethods: [],
  payoutSettings: null,
  
  // Products
  products: [],
  topProducts: [],
  productCategories: [],
  
  // Analytics
  analytics: {
    clicks: [],
    conversions: [],
    traffic: [],
    geo: [],
    devices: [],
    timeline: []
  },
  
  // Performance metrics
  metrics: {
    clicks: 0,
    uniqueClicks: 0,
    conversions: 0,
    conversionRate: 0,
    earnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    refunds: 0,
    chargebacks: 0
  },
  
  // Affiliate profile
  profile: null,
  level: AFFILIATE_LEVELS.BRONZE,
  status: 'active',
  
  // Leaderboard
  leaderboard: [],
  userRank: null,
  
  // Achievements
  achievements: [],
  unlockedAchievements: [],
  
  // Notifications
  notifications: [],
  
  // Loading states
  loading: {
    dashboard: false,
    links: false,
    referrals: false,
    earnings: false,
    commissions: false,
    payouts: false,
    products: false,
    analytics: false,
    profile: false,
    leaderboard: false,
    achievements: false,
    createLink: false,
    updateLink: false,
    deleteLink: false,
    requestPayout: false
  },
  
  // Errors
  errors: {
    dashboard: null,
    links: null,
    referrals: null,
    earnings: null,
    commissions: null,
    payouts: null,
    products: null,
    analytics: null,
    profile: null,
    leaderboard: null,
    achievements: null,
    createLink: null,
    updateLink: null,
    deleteLink: null,
    requestPayout: null
  },
  
  // Success messages
  success: {
    createLink: null,
    updateLink: null,
    deleteLink: null,
    requestPayout: null
  },
  
  // Metadata
  lastUpdated: {
    dashboard: null,
    links: null,
    referrals: null,
    earnings: null,
    commissions: null,
    payouts: null,
    products: null,
    analytics: null,
    profile: null,
    leaderboard: null,
    achievements: null
  },
  
  // Pagination
  pagination: {
    links: { page: 1, limit: 20, total: 0, hasMore: false },
    referrals: { page: 1, limit: 20, total: 0, hasMore: false },
    commissions: { page: 1, limit: 20, total: 0, hasMore: false },
    earnings: { page: 1, limit: 20, total: 0, hasMore: false },
    payouts: { page: 1, limit: 20, total: 0, hasMore: false },
    products: { page: 1, limit: 20, total: 0, hasMore: false }
  },
  
  // Filters
  filters: {
    links: {},
    referrals: {},
    commissions: {},
    earnings: {},
    payouts: {},
    products: {}
  },
  
  // Sort
  sort: {
    links: { field: 'createdAt', order: 'desc' },
    referrals: { field: 'createdAt', order: 'desc' },
    commissions: { field: 'createdAt', order: 'desc' },
    earnings: { field: 'createdAt', order: 'desc' },
    payouts: { field: 'createdAt', order: 'desc' },
    products: { field: 'name', order: 'asc' }
  }
};

// ==================== Async Thunks ====================

// Fetch dashboard
export const fetchDashboard = createAsyncThunk(
  'affiliate/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch links
export const fetchLinks = createAsyncThunk(
  'affiliate/fetchLinks',
  async ({ page = 1, limit = 20, filters = {}, sort = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getLinks({ page, limit, filters, sort });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create link
export const createLink = createAsyncThunk(
  'affiliate/createLink',
  async (linkData, { rejectWithValue }) => {
    try {
      const response = await affiliateService.createLink(linkData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update link
export const updateLink = createAsyncThunk(
  'affiliate/updateLink',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await affiliateService.updateLink(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete link
export const deleteLink = createAsyncThunk(
  'affiliate/deleteLink',
  async (id, { rejectWithValue }) => {
    try {
      const response = await affiliateService.deleteLink(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referrals
export const fetchReferrals = createAsyncThunk(
  'affiliate/fetchReferrals',
  async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getReferrals({ page, limit, filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referral tree
export const fetchReferralTree = createAsyncThunk(
  'affiliate/fetchReferralTree',
  async (depth = 3, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getReferralTree(depth);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referral stats
export const fetchReferralStats = createAsyncThunk(
  'affiliate/fetchReferralStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getReferralStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch earnings
export const fetchEarnings = createAsyncThunk(
  'affiliate/fetchEarnings',
  async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getEarnings({ page, limit, filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch earnings summary
export const fetchEarningsSummary = createAsyncThunk(
  'affiliate/fetchEarningsSummary',
  async (period = 'all', { rejectWithValue }) => {
    try {
      const response = await affiliateService.getEarningsSummary(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch commissions
export const fetchCommissions = createAsyncThunk(
  'affiliate/fetchCommissions',
  async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getCommissions({ page, limit, filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Continue Async Thunks
// Fetch commission summary
export const fetchCommissionSummary = createAsyncThunk(
  'affiliate/fetchCommissionSummary',
  async (period = 'all', { rejectWithValue }) => {
    try {
      const response = await affiliateService.getCommissionSummary(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch payouts
export const fetchPayouts = createAsyncThunk(
  'affiliate/fetchPayouts',
  async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getPayouts({ page, limit, filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Request payout
export const requestPayout = createAsyncThunk(
  'affiliate/requestPayout',
  async (payoutData, { rejectWithValue }) => {
    try {
      const response = await affiliateService.requestPayout(payoutData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch payout methods
export const fetchPayoutMethods = createAsyncThunk(
  'affiliate/fetchPayoutMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getPayoutMethods();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch products
export const fetchProducts = createAsyncThunk(
  'affiliate/fetchProducts',
  async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getProducts({ page, limit, filters });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch top products
export const fetchTopProducts = createAsyncThunk(
  'affiliate/fetchTopProducts',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getTopProducts(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch analytics
export const fetchAnalytics = createAsyncThunk(
  'affiliate/fetchAnalytics',
  async ({ period = '30days', type = 'all' } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getAnalytics(period, type);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch traffic analytics
export const fetchTrafficAnalytics = createAsyncThunk(
  'affiliate/fetchTrafficAnalytics',
  async (period = '30days', { rejectWithValue }) => {
    try {
      const response = await affiliateService.getTrafficAnalytics(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch conversion analytics
export const fetchConversionAnalytics = createAsyncThunk(
  'affiliate/fetchConversionAnalytics',
  async (period = '30days', { rejectWithValue }) => {
    try {
      const response = await affiliateService.getConversionAnalytics(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch profile
export const fetchAffiliateProfile = createAsyncThunk(
  'affiliate/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update profile
export const updateAffiliateProfile = createAsyncThunk(
  'affiliate/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await affiliateService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
  'affiliate/fetchLeaderboard',
  async ({ period = 'month', limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getLeaderboard(period, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch achievements
export const fetchAchievements = createAsyncThunk(
  'affiliate/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await affiliateService.getAchievements();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==================== Affiliate Slice ====================

const affiliateSlice = createSlice({
  name: 'affiliate',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.errors = {
        dashboard: null,
        links: null,
        referrals: null,
        earnings: null,
        commissions: null,
        payouts: null,
        products: null,
        analytics: null,
        profile: null,
        leaderboard: null,
        achievements: null,
        createLink: null,
        updateLink: null,
        deleteLink: null,
        requestPayout: null
      };
    },

    // Clear success
    clearSuccess: (state) => {
      state.success = {
        createLink: null,
        updateLink: null,
        deleteLink: null,
        requestPayout: null
      };
    },

    // Set current link
    setCurrentLink: (state, action) => {
      state.currentLink = action.payload;
    },

    // Clear current link
    clearCurrentLink: (state) => {
      state.currentLink = null;
    },

    // Update metrics
    updateMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },

    // Update level
    updateLevel: (state, action) => {
      state.level = action.payload;
    },

    // Update status
    updateStatus: (state, action) => {
      state.status = action.payload;
    },

    // Add notification
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },

    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Set filters
    setFilters: (state, action) => {
      const { type, filters } = action.payload;
      if (state.filters.hasOwnProperty(type)) {
        state.filters[type] = { ...state.filters[type], ...filters };
      }
    },

    // Clear filters
    clearFilters: (state, action) => {
      const type = action.payload;
      if (state.filters.hasOwnProperty(type)) {
        state.filters[type] = {};
      }
    },

    // Set sort
    setSort: (state, action) => {
      const { type, field, order } = action.payload;
      if (state.sort.hasOwnProperty(type)) {
        state.sort[type] = { field, order };
      }
    },

    // Reset affiliate state
    resetAffiliate: () => initialState,

    // Set loading
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      if (state.loading.hasOwnProperty(key)) {
        state.loading[key] = isLoading;
      }
    },

    // Set error
    setError: (state, action) => {
      const { key, error } = action.payload;
      if (state.errors.hasOwnProperty(key)) {
        state.errors[key] = error;
      }
    },

    // Set success
    setSuccess: (state, action) => {
      const { key, message } = action.payload;
      if (state.success.hasOwnProperty(key)) {
        state.success[key] = message;
      }
    },

    // Update pagination
    updatePagination: (state, action) => {
      const { type, pagination } = action.payload;
      if (state.pagination.hasOwnProperty(type)) {
        state.pagination[type] = { ...state.pagination[type], ...pagination };
      }
    },

    // Update last updated
    updateLastUpdated: (state, action) => {
      const key = action.payload;
      if (state.lastUpdated.hasOwnProperty(key)) {
        state.lastUpdated[key] = Date.now();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.errors.dashboard = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
        state.metrics = { ...state.metrics, ...action.payload.metrics };
        state.lastUpdated.dashboard = Date.now();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.errors.dashboard = action.payload;
      })

      // Fetch links
      .addCase(fetchLinks.pending, (state) => {
        state.loading.links = true;
        state.errors.links = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.loading.links = false;
        const { data, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.links = data;
        } else {
          state.links = [...state.links, ...data];
        }
        
        state.pagination.links = {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          hasMore: pagination.hasMore
        };
        state.lastUpdated.links = Date.now();
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.loading.links = false;
        state.errors.links = action.payload;
      })

      // Create link
      .addCase(createLink.pending, (state) => {
        state.loading.createLink = true;
        state.errors.createLink = null;
        state.success.createLink = null;
      })
      .addCase(createLink.fulfilled, (state, action) => {
        state.loading.createLink = false;
        state.links.unshift(action.payload);
        state.success.createLink = 'Link created successfully';
        state.lastUpdated.links = Date.now();
      })
      .addCase(createLink.rejected, (state, action) => {
        state.loading.createLink = false;
        state.errors.createLink = action.payload;
      });
  }
});
// Continue extraReducers
builder
  // Update link
  .addCase(updateLink.pending, (state) => {
    state.loading.updateLink = true;
    state.errors.updateLink = null;
    state.success.updateLink = null;
  })
  .addCase(updateLink.fulfilled, (state, action) => {
    state.loading.updateLink = false;
    const updatedLink = action.payload;
    const index = state.links.findIndex(link => link.id === updatedLink.id);
    if (index !== -1) {
      state.links[index] = { ...state.links[index], ...updatedLink };
    }
    state.success.updateLink = 'Link updated successfully';
    state.lastUpdated.links = Date.now();
  })
  .addCase(updateLink.rejected, (state, action) => {
    state.loading.updateLink = false;
    state.errors.updateLink = action.payload;
  })

  // Delete link
  .addCase(deleteLink.pending, (state) => {
    state.loading.deleteLink = true;
    state.errors.deleteLink = null;
    state.success.deleteLink = null;
  })
  .addCase(deleteLink.fulfilled, (state, action) => {
    state.loading.deleteLink = false;
    const { id } = action.payload;
    state.links = state.links.filter(link => link.id !== id);
    state.success.deleteLink = 'Link deleted successfully';
    state.lastUpdated.links = Date.now();
  })
  .addCase(deleteLink.rejected, (state, action) => {
    state.loading.deleteLink = false;
    state.errors.deleteLink = action.payload;
  })

  // Fetch referrals
  .addCase(fetchReferrals.pending, (state) => {
    state.loading.referrals = true;
    state.errors.referrals = null;
  })
  .addCase(fetchReferrals.fulfilled, (state, action) => {
    state.loading.referrals = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.referrals = data;
    } else {
      state.referrals = [...state.referrals, ...data];
    }
    
    state.pagination.referrals = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.referrals = Date.now();
  })
  .addCase(fetchReferrals.rejected, (state, action) => {
    state.loading.referrals = false;
    state.errors.referrals = action.payload;
  })

  // Fetch referral tree
  .addCase(fetchReferralTree.pending, (state) => {
    state.loading.referrals = true;
    state.errors.referrals = null;
  })
  .addCase(fetchReferralTree.fulfilled, (state, action) => {
    state.loading.referrals = false;
    state.referralTree = action.payload;
  })
  .addCase(fetchReferralTree.rejected, (state, action) => {
    state.loading.referrals = false;
    state.errors.referrals = action.payload;
  })

  // Fetch referral stats
  .addCase(fetchReferralStats.pending, (state) => {
    state.loading.referrals = true;
    state.errors.referrals = null;
  })
  .addCase(fetchReferralStats.fulfilled, (state, action) => {
    state.loading.referrals = false;
    state.referralStats = action.payload;
  })
  .addCase(fetchReferralStats.rejected, (state, action) => {
    state.loading.referrals = false;
    state.errors.referrals = action.payload;
  })

  // Fetch earnings
  .addCase(fetchEarnings.pending, (state) => {
    state.loading.earnings = true;
    state.errors.earnings = null;
  })
  .addCase(fetchEarnings.fulfilled, (state, action) => {
    state.loading.earnings = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.earnings = data;
    } else {
      state.earnings = [...state.earnings, ...data];
    }
    
    state.pagination.earnings = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.earnings = Date.now();
  })
  .addCase(fetchEarnings.rejected, (state, action) => {
    state.loading.earnings = false;
    state.errors.earnings = action.payload;
  })

  // Fetch earnings summary
  .addCase(fetchEarningsSummary.fulfilled, (state, action) => {
    state.earningsSummary = action.payload;
  })

  // Fetch commissions
  .addCase(fetchCommissions.pending, (state) => {
    state.loading.commissions = true;
    state.errors.commissions = null;
  })
  .addCase(fetchCommissions.fulfilled, (state, action) => {
    state.loading.commissions = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.commissions = data;
    } else {
      state.commissions = [...state.commissions, ...data];
    }
    
    state.pagination.commissions = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.commissions = Date.now();
  })
  .addCase(fetchCommissions.rejected, (state, action) => {
    state.loading.commissions = false;
    state.errors.commissions = action.payload;
  })

  // Fetch commission summary
  .addCase(fetchCommissionSummary.fulfilled, (state, action) => {
    state.commissionSummary = action.payload;
  })

  // Fetch payouts
  .addCase(fetchPayouts.pending, (state) => {
    state.loading.payouts = true;
    state.errors.payouts = null;
  })
  .addCase(fetchPayouts.fulfilled, (state, action) => {
    state.loading.payouts = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.payouts = data;
    } else {
      state.payouts = [...state.payouts, ...data];
    }
    
    state.pagination.payouts = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.payouts = Date.now();
  })
  .addCase(fetchPayouts.rejected, (state, action) => {
    state.loading.payouts = false;
    state.errors.payouts = action.payload;
  })

  // Request payout
  .addCase(requestPayout.pending, (state) => {
    state.loading.requestPayout = true;
    state.errors.requestPayout = null;
    state.success.requestPayout = null;
  })
  .addCase(requestPayout.fulfilled, (state, action) => {
    state.loading.requestPayout = false;
    state.payouts.unshift(action.payload);
    state.metrics.pendingEarnings -= action.payload.amount;
    state.success.requestPayout = 'Payout requested successfully';
    state.lastUpdated.payouts = Date.now();
  })
  .addCase(requestPayout.rejected, (state, action) => {
    state.loading.requestPayout = false;
    state.errors.requestPayout = action.payload;
  })

  // Fetch payout methods
  .addCase(fetchPayoutMethods.fulfilled, (state, action) => {
    state.payoutMethods = action.payload;
  })

  // Fetch products
  .addCase(fetchProducts.pending, (state) => {
    state.loading.products = true;
    state.errors.products = null;
  })
  .addCase(fetchProducts.fulfilled, (state, action) => {
    state.loading.products = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.products = data;
    } else {
      state.products = [...state.products, ...data];
    }
    
    state.pagination.products = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.products = Date.now();
  })
  .addCase(fetchProducts.rejected, (state, action) => {
    state.loading.products = false;
    state.errors.products = action.payload;
  })

  // Fetch top products
  .addCase(fetchTopProducts.fulfilled, (state, action) => {
    state.topProducts = action.payload;
  })

  // Fetch analytics
  .addCase(fetchAnalytics.pending, (state) => {
    state.loading.analytics = true;
    state.errors.analytics = null;
  })
  .addCase(fetchAnalytics.fulfilled, (state, action) => {
    state.loading.analytics = false;
    state.analytics = { ...state.analytics, ...action.payload };
    state.lastUpdated.analytics = Date.now();
  })
  .addCase(fetchAnalytics.rejected, (state, action) => {
    state.loading.analytics = false;
    state.errors.analytics = action.payload;
  })

  // Fetch traffic analytics
  .addCase(fetchTrafficAnalytics.fulfilled, (state, action) => {
    state.analytics.traffic = action.payload;
  })

  // Fetch conversion analytics
  .addCase(fetchConversionAnalytics.fulfilled, (state, action) => {
    state.analytics.conversions = action.payload;
  })

  // Fetch affiliate profile
  .addCase(fetchAffiliateProfile.pending, (state) => {
    state.loading.profile = true;
    state.errors.profile = null;
  })
  .addCase(fetchAffiliateProfile.fulfilled, (state, action) => {
    state.loading.profile = false;
    state.profile = action.payload;
    state.level = action.payload.level;
    state.status = action.payload.status;
    state.lastUpdated.profile = Date.now();
  })
  .addCase(fetchAffiliateProfile.rejected, (state, action) => {
    state.loading.profile = false;
    state.errors.profile = action.payload;
  })

  // Update affiliate profile
  .addCase(updateAffiliateProfile.fulfilled, (state, action) => {
    state.profile = { ...state.profile, ...action.payload };
    state.level = action.payload.level || state.level;
    state.status = action.payload.status || state.status;
    state.lastUpdated.profile = Date.now();
  })

  // Fetch leaderboard
  .addCase(fetchLeaderboard.pending, (state) => {
    state.loading.leaderboard = true;
    state.errors.leaderboard = null;
  })
  .addCase(fetchLeaderboard.fulfilled, (state, action) => {
    state.loading.leaderboard = false;
    state.leaderboard = action.payload.leaderboard;
    state.userRank = action.payload.userRank;
  })
  .addCase(fetchLeaderboard.rejected, (state, action) => {
    state.loading.leaderboard = false;
    state.errors.leaderboard = action.payload;
  })

  // Fetch achievements
  .addCase(fetchAchievements.pending, (state) => {
    state.loading.achievements = true;
    state.errors.achievements = null;
  })
  .addCase(fetchAchievements.fulfilled, (state, action) => {
    state.loading.achievements = false;
    state.achievements = action.payload.achievements;
    state.unlockedAchievements = action.payload.unlocked;
  })
  .addCase(fetchAchievements.rejected, (state, action) => {
    state.loading.achievements = false;
    state.errors.achievements = action.payload;
  });

// ==================== Actions ====================

export const {
  clearError,
  clearSuccess,
  setCurrentLink,
  clearCurrentLink,
  updateMetrics,
  updateLevel,
  updateStatus,
  addNotification,
  clearNotifications,
  setFilters,
  clearFilters,
  setSort,
  resetAffiliate,
  setLoading,
  setError,
  setSuccess,
  updatePagination,
  updateLastUpdated
} = affiliateSlice.actions;

// ==================== Selectors ====================

// Base selectors
export const selectAffiliateState = (state) => state.affiliate;
export const selectDashboard = (state) => state.affiliate.dashboard;
export const selectLinks = (state) => state.affiliate.links;
export const selectCurrentLink = (state) => state.affiliate.currentLink;
export const selectReferrals = (state) => state.affiliate.referrals;
export const selectReferralTree = (state) => state.affiliate.referralTree;
export const selectReferralStats = (state) => state.affiliate.referralStats;
export const selectEarnings = (state) => state.affiliate.earnings;
export const selectEarningsSummary = (state) => state.affiliate.earningsSummary;
export const selectCommissions = (state) => state.affiliate.commissions;
export const selectCommissionSummary = (state) => state.affiliate.commissionSummary;
export const selectPayouts = (state) => state.affiliate.payouts;
export const selectPayoutMethods = (state) => state.affiliate.payoutMethods;
export const selectProducts = (state) => state.affiliate.products;
export const selectTopProducts = (state) => state.affiliate.topProducts;
export const selectAnalytics = (state) => state.affiliate.analytics;
export const selectMetrics = (state) => state.affiliate.metrics;
export const selectAffiliateProfile = (state) => state.affiliate.profile;
export const selectAffiliateLevel = (state) => state.affiliate.level;
export const selectAffiliateStatus = (state) => state.affiliate.status;
export const selectLeaderboard = (state) => state.affiliate.leaderboard;
export const selectUserRank = (state) => state.affiliate.userRank;
export const selectAchievements = (state) => state.affiliate.achievements;
export const selectUnlockedAchievements = (state) => state.affiliate.unlockedAchievements;

// Loading selectors
export const selectDashboardLoading = (state) => state.affiliate.loading.dashboard;
export const selectLinksLoading = (state) => state.affiliate.loading.links;
export const selectReferralsLoading = (state) => state.affiliate.loading.referrals;
export const selectEarningsLoading = (state) => state.affiliate.loading.earnings;
export const selectCommissionsLoading = (state) => state.affiliate.loading.commissions;
export const selectPayoutsLoading = (state) => state.affiliate.loading.payouts;
export const selectProductsLoading = (state) => state.affiliate.loading.products;
export const selectAnalyticsLoading = (state) => state.affiliate.loading.analytics;
export const selectProfileLoading = (state) => state.affiliate.loading.profile;
export const selectLeaderboardLoading = (state) => state.affiliate.loading.leaderboard;
export const selectAchievementsLoading = (state) => state.affiliate.loading.achievements;
export const selectCreateLinkLoading = (state) => state.affiliate.loading.createLink;
export const selectUpdateLinkLoading = (state) => state.affiliate.loading.updateLink;
export const selectDeleteLinkLoading = (state) => state.affiliate.loading.deleteLink;
export const selectRequestPayoutLoading = (state) => state.affiliate.loading.requestPayout;

// Error selectors
export const selectDashboardError = (state) => state.affiliate.errors.dashboard;
export const selectLinksError = (state) => state.affiliate.errors.links;
export const selectReferralsError = (state) => state.affiliate.errors.referrals;
export const selectEarningsError = (state) => state.affiliate.errors.earnings;
export const selectCommissionsError = (state) => state.affiliate.errors.commissions;
export const selectPayoutsError = (state) => state.affiliate.errors.payouts;
export const selectProductsError = (state) => state.affiliate.errors.products;
export const selectAnalyticsError = (state) => state.affiliate.errors.analytics;
export const selectProfileError = (state) => state.affiliate.errors.profile;
export const selectLeaderboardError = (state) => state.affiliate.errors.leaderboard;
export const selectAchievementsError = (state) => state.affiliate.errors.achievements;
export const selectCreateLinkError = (state) => state.affiliate.errors.createLink;
export const selectUpdateLinkError = (state) => state.affiliate.errors.updateLink;
export const selectDeleteLinkError = (state) => state.affiliate.errors.deleteLink;
export const selectRequestPayoutError = (state) => state.affiliate.errors.requestPayout;

// Success selectors
export const selectCreateLinkSuccess = (state) => state.affiliate.success.createLink;
export const selectUpdateLinkSuccess = (state) => state.affiliate.success.updateLink;
export const selectDeleteLinkSuccess = (state) => state.affiliate.success.deleteLink;
export const selectRequestPayoutSuccess = (state) => state.affiliate.success.requestPayout;

// Pagination selectors
export const selectLinksPagination = (state) => state.affiliate.pagination.links;
export const selectReferralsPagination = (state) => state.affiliate.pagination.referrals;
export const selectCommissionsPagination = (state) => state.affiliate.pagination.commissions;
export const selectEarningsPagination = (state) => state.affiliate.pagination.earnings;
export const selectPayoutsPagination = (state) => state.affiliate.pagination.payouts;
export const selectProductsPagination = (state) => state.affiliate.pagination.products;

// Filter selectors
export const selectLinksFilters = (state) => state.affiliate.filters.links;
export const selectReferralsFilters = (state) => state.affiliate.filters.referrals;
export const selectCommissionsFilters = (state) => state.affiliate.filters.commissions;
export const selectEarningsFilters = (state) => state.affiliate.filters.earnings;
export const selectPayoutsFilters = (state) => state.affiliate.filters.payouts;
export const selectProductsFilters = (state) => state.affiliate.filters.products;

// Sort selectors
export const selectLinksSort = (state) => state.affiliate.sort.links;
export const selectReferralsSort = (state) => state.affiliate.sort.referrals;
export const selectCommissionsSort = (state) => state.affiliate.sort.commissions;
export const selectEarningsSort = (state) => state.affiliate.sort.earnings;
export const selectPayoutsSort = (state) => state.affiliate.sort.payouts;
export const selectProductsSort = (state) => state.affiliate.sort.products;

// Computed selectors
export const selectTotalEarnings = createSelector(
  [selectMetrics],
  (metrics) => metrics?.earnings || 0
);

export const selectPendingEarnings = createSelector(
  [selectMetrics],
  (metrics) => metrics?.pendingEarnings || 0
);

export const selectTotalClicks = createSelector(
  [selectMetrics],
  (metrics) => metrics?.clicks || 0
);

export const selectUniqueClicks = createSelector(
  [selectMetrics],
  (metrics) => metrics?.uniqueClicks || 0
);

export const selectTotalConversions = createSelector(
  [selectMetrics],
  (metrics) => metrics?.conversions || 0
);

export const selectConversionRate = createSelector(
  [selectTotalClicks, selectTotalConversions],
  (clicks, conversions) => {
    if (!clicks) return 0;
    return ((conversions / clicks) * 100).toFixed(2);
  }
);

export const selectActiveLinks = createSelector(
  [selectLinks],
  (links) => links?.filter(link => link.status === 'active') || []
);

export const selectPendingCommissions = createSelector(
  [selectCommissions],
  (commissions) => commissions?.filter(c => c.status === 'pending') || []
);

export const selectApprovedCommissions = createSelector(
  [selectCommissions],
  (commissions) => commissions?.filter(c => c.status === 'approved') || []
);

export const selectPaidCommissions = createSelector(
  [selectCommissions],
  (commissions) => commissions?.filter(c => c.status === 'paid') || []
);

export const selectLinkById = (linkId) => createSelector(
  [selectLinks],
  (links) => links?.find(link => link.id === linkId)
);

export const selectProductById = (productId) => createSelector(
  [selectProducts],
  (products) => products?.find(product => product.id === productId)
);

export const selectCommissionById = (commissionId) => createSelector(
  [selectCommissions],
  (commissions) => commissions?.find(c => c.id === commissionId)
);

export const selectPayoutById = (payoutId) => createSelector(
  [selectPayouts],
  (payouts) => payouts?.find(p => p.id === payoutId)
);

export const selectAchievementById = (achievementId) => createSelector(
  [selectAchievements],
  (achievements) => achievements?.find(a => a.id === achievementId)
);

export const selectIsAchievementUnlocked = (achievementId) => createSelector(
  [selectUnlockedAchievements],
  (unlocked) => unlocked?.includes(achievementId) || false
);

export const selectTopPerformingLinks = (limit = 5) => createSelector(
  [selectLinks],
  (links) => [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, limit)
);

export const selectHighestEarningLinks = (limit = 5) => createSelector(
  [selectLinks],
  (links) => [...links]
    .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
    .slice(0, limit)
);

export const selectRecentLinks = (limit = 5) => createSelector(
  [selectLinks],
  (links) => [...links]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
);

export const selectNextLevelRequirements = createSelector(
  [selectAffiliateLevel, selectTotalEarnings],
  (level, earnings) => {
    const requirements = {
      bronze: { next: 'silver', required: 1000, current: earnings },
    silver: { next: 'gold', required: 5000, current: earnings },
      gold: { next: 'platinum', required: 10000, current: earnings },
      platinum: { next: 'diamond', required: 50000, current: earnings },
      diamond: { next: 'elite', required: 100000, current: earnings },
      elite: { next: null, required: null, current: earnings }
    };
    
    return requirements[level] || null;
  }
);

// ==================== Export ====================

export default affiliateSlice.reducer;
