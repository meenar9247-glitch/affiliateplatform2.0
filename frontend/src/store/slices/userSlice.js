import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

// ==================== Initial State ====================

const initialState = {
  // Profile data
  profile: null,
  settings: null,
  preferences: null,
  
  // User statistics
  stats: {
    totalEarnings: 0,
    totalReferrals: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    rank: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 1000,
    achievements: [],
    badges: []
  },
  
  // Activity
  activity: [],
  loginHistory: [],
  
  // Referrals
  referrals: [],
  referralStats: null,
  
  // Notifications
  notifications: [],
  unreadNotifications: 0,
  
  // Saved items
  savedItems: [],
  savedSearches: [],
  
  // Loading states
  loading: {
    profile: false,
    settings: false,
    preferences: false,
    stats: false,
    activity: false,
    referrals: false,
    notifications: false,
    savedItems: false,
    updateProfile: false,
    updateSettings: false,
    updatePreferences: false
  },
  
  // Errors
  errors: {
    profile: null,
    settings: null,
    preferences: null,
    stats: null,
    activity: null,
    referrals: null,
    notifications: null,
    savedItems: null,
    updateProfile: null,
    updateSettings: null,
    updatePreferences: null
  },
  
  // Success messages
  success: {
    profile: null,
    settings: null,
    preferences: null,
    updateProfile: null,
    updateSettings: null,
    updatePreferences: null
  },
  
  // Metadata
  lastUpdated: {
    profile: null,
    settings: null,
    preferences: null,
    stats: null,
    activity: null,
    referrals: null,
    notifications: null
  },
  
  // Pagination
  pagination: {
    activity: { page: 1, limit: 20, total: 0, hasMore: false },
    referrals: { page: 1, limit: 20, total: 0, hasMore: false },
    notifications: { page: 1, limit: 20, total: 0, hasMore: false }
  }
};

// ==================== Async Thunks ====================

// Fetch profile
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch settings
export const fetchSettings = createAsyncThunk(
  'user/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getSettings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update settings
export const updateSettings = createAsyncThunk(
  'user/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await userService.updateSettings(settingsData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch preferences
export const fetchPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getPreferences();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update preferences
export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await userService.updatePreferences(preferencesData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch stats
export const fetchStats = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch activity
export const fetchActivity = createAsyncThunk(
  'user/fetchActivity',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getActivity(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch login history
export const fetchLoginHistory = createAsyncThunk(
  'user/fetchLoginHistory',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getLoginHistory(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referrals
export const fetchReferrals = createAsyncThunk(
  'user/fetchReferrals',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getReferrals(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch referral stats
export const fetchReferralStats = createAsyncThunk(
  'user/fetchReferralStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getReferralStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'user/fetchNotifications',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getNotifications(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark notification as read
export const markNotificationRead = createAsyncThunk(
  'user/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await userService.markNotificationRead(notificationId);
      return { notificationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  'user/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.markAllNotificationsRead();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch saved items
export const fetchSavedItems = createAsyncThunk(
  'user/fetchSavedItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getSavedItems();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save item
export const saveItem = createAsyncThunk(
  'user/saveItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await userService.saveItem(itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove saved item
export const removeSavedItem = createAsyncThunk(
  'user/removeSavedItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await userService.removeSavedItem(itemId);
      return { itemId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// ==================== User Slice ====================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.errors = {
        profile: null,
        settings: null,
        preferences: null,
        stats: null,
        activity: null,
        referrals: null,
        notifications: null,
        savedItems: null,
        updateProfile: null,
        updateSettings: null,
        updatePreferences: null
      };
    },

    // Clear success
    clearSuccess: (state) => {
      state.success = {
        profile: null,
        settings: null,
        preferences: null,
        updateProfile: null,
        updateSettings: null,
        updatePreferences: null
      };
    },

    // Update local profile (optimistic updates)
    updateLocalProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },

    // Update local settings
    updateLocalSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Update local preferences
    updateLocalPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    // Add notification
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadNotifications++;
    },

    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
      state.pagination.notifications = { page: 1, limit: 20, total: 0, hasMore: false };
    },

    // Add activity
    addActivity: (state, action) => {
      state.activity.unshift(action.payload);
      if (state.activity.length > 100) {
        state.activity.pop();
      }
    },

    // Update stats
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },

    // Add achievement
    addAchievement: (state, action) => {
      if (!state.stats.achievements) {
        state.stats.achievements = [];
      }
      state.stats.achievements.unshift(action.payload);
    },

    // Add badge
    addBadge: (state, action) => {
      if (!state.stats.badges) {
        state.stats.badges = [];
      }
      state.stats.badges.unshift(action.payload);
    },

    // Update level
    updateLevel: (state, action) => {
      state.stats.level = action.payload.level;
      state.stats.experience = action.payload.experience;
      state.stats.nextLevelExp = action.payload.nextLevelExp;
    },

    // Add experience
    addExperience: (state, action) => {
      state.stats.experience += action.payload;
      if (state.stats.experience >= state.stats.nextLevelExp) {
        // Level up logic would be handled by server
      }
    },

    // Reset user state
    resetUser: () => initialState,

    // Set loading state
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
      const { key, pagination } = action.payload;
      if (state.pagination.hasOwnProperty(key)) {
        state.pagination[key] = { ...state.pagination[key], ...pagination };
      }
    },

    // Clear pagination
    clearPagination: (state, action) => {
      const key = action.payload;
      if (state.pagination.hasOwnProperty(key)) {
        state.pagination[key] = { page: 1, limit: 20, total: 0, hasMore: false };
      }
    },

    // Update last updated timestamp
    updateLastUpdated: (state, action) => {
      const key = action.payload;
      if (state.lastUpdated.hasOwnProperty(key)) {
        state.lastUpdated[key] = Date.now();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
        state.lastUpdated.profile = Date.now();
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.errors.updateProfile = null;
        state.success.updateProfile = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false;
        state.profile = { ...state.profile, ...action.payload };
        state.success.updateProfile = 'Profile updated successfully';
        state.lastUpdated.profile = Date.now();
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.errors.updateProfile = action.payload;
      })

      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading.settings = true;
        state.errors.settings = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
        state.lastUpdated.settings = Date.now();
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.errors.settings = action.payload;
      })

      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading.updateSettings = true;
        state.errors.updateSettings = null;
        state.success.updateSettings = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading.updateSettings = false;
        state.settings = { ...state.settings, ...action.payload };
        state.success.updateSettings = 'Settings updated successfully';
        state.lastUpdated.settings = Date.now();
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading.updateSettings = false;
        state.errors.updateSettings = action.payload;
      })

      // Fetch preferences
      .addCase(fetchPreferences.pending, (state) => {
        state.loading.preferences = true;
        state.errors.preferences = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.loading.preferences = false;
        state.preferences = action.payload;
        state.lastUpdated.preferences = Date.now();
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.loading.preferences = false;
        state.errors.preferences = action.payload;
      })

      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.loading.updatePreferences = true;
        state.errors.updatePreferences = null;
        state.success.updatePreferences = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading.updatePreferences = false;
        state.preferences = { ...state.preferences, ...action.payload };
        state.success.updatePreferences = 'Preferences updated successfully';
        state.lastUpdated.preferences = Date.now();
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading.updatePreferences = false;
        state.errors.updatePreferences = action.payload;
      })

      // Fetch stats
      .addCase(fetchStats.pending, (state) => {
        state.loading.stats = true;
        state.errors.stats = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = { ...state.stats, ...action.payload };
        state.lastUpdated.stats = Date.now();
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.errors.stats = action.payload;
      });
  }
});
// Continue extraReducers
builder
  // Fetch activity
  .addCase(fetchActivity.pending, (state) => {
    state.loading.activity = true;
    state.errors.activity = null;
  })
  .addCase(fetchActivity.fulfilled, (state, action) => {
    state.loading.activity = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.activity = data;
    } else {
      state.activity = [...state.activity, ...data];
    }
    
    state.pagination.activity = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.lastUpdated.activity = Date.now();
  })
  .addCase(fetchActivity.rejected, (state, action) => {
    state.loading.activity = false;
    state.errors.activity = action.payload;
  })

  // Fetch login history
  .addCase(fetchLoginHistory.pending, (state) => {
    state.loading.activity = true;
    state.errors.activity = null;
  })
  .addCase(fetchLoginHistory.fulfilled, (state, action) => {
    state.loading.activity = false;
    const { data, pagination } = action.payload;
    state.loginHistory = data;
    state.lastUpdated.activity = Date.now();
  })
  .addCase(fetchLoginHistory.rejected, (state, action) => {
    state.loading.activity = false;
    state.errors.activity = action.payload;
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

  // Fetch notifications
  .addCase(fetchNotifications.pending, (state) => {
    state.loading.notifications = true;
    state.errors.notifications = null;
  })
  .addCase(fetchNotifications.fulfilled, (state, action) => {
    state.loading.notifications = false;
    const { data, pagination } = action.payload;
    
    if (pagination.page === 1) {
      state.notifications = data;
    } else {
      state.notifications = [...state.notifications, ...data];
    }
    
    state.pagination.notifications = {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      hasMore: pagination.hasMore
    };
    state.unreadNotifications = data.filter(n => !n.read).length;
    state.lastUpdated.notifications = Date.now();
  })
  .addCase(fetchNotifications.rejected, (state, action) => {
    state.loading.notifications = false;
    state.errors.notifications = action.payload;
  })

  // Mark notification as read
  .addCase(markNotificationRead.fulfilled, (state, action) => {
    const { notificationId } = action.payload;
    const notification = state.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = Date.now();
      state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
    }
  })

  // Mark all notifications as read
  .addCase(markAllNotificationsRead.fulfilled, (state) => {
    state.notifications.forEach(n => {
      n.read = true;
      n.readAt = Date.now();
    });
    state.unreadNotifications = 0;
  })

  // Fetch saved items
  .addCase(fetchSavedItems.pending, (state) => {
    state.loading.savedItems = true;
    state.errors.savedItems = null;
  })
  .addCase(fetchSavedItems.fulfilled, (state, action) => {
    state.loading.savedItems = false;
    state.savedItems = action.payload;
  })
  .addCase(fetchSavedItems.rejected, (state, action) => {
    state.loading.savedItems = false;
    state.errors.savedItems = action.payload;
  })

  // Save item
  .addCase(saveItem.fulfilled, (state, action) => {
    state.savedItems.unshift(action.payload);
  })

  // Remove saved item
  .addCase(removeSavedItem.fulfilled, (state, action) => {
    const { itemId } = action.payload;
    state.savedItems = state.savedItems.filter(item => item.id !== itemId);
  });

// ==================== Actions ====================

export const {
  clearError,
  clearSuccess,
  updateLocalProfile,
  updateLocalSettings,
  updateLocalPreferences,
  addNotification,
  clearNotifications,
  addActivity,
  updateStats,
  addAchievement,
  addBadge,
  updateLevel,
  addExperience,
  resetUser,
  setLoading,
  setError,
  setSuccess,
  updatePagination,
  clearPagination,
  updateLastUpdated
} = userSlice.actions;

// ==================== Selectors ====================

// Base selectors
export const selectUserState = (state) => state.user;
export const selectProfile = (state) => state.user.profile;
export const selectSettings = (state) => state.user.settings;
export const selectPreferences = (state) => state.user.preferences;
export const selectStats = (state) => state.user.stats;
export const selectActivity = (state) => state.user.activity;
export const selectLoginHistory = (state) => state.user.loginHistory;
export const selectReferrals = (state) => state.user.referrals;
export const selectReferralStats = (state) => state.user.referralStats;
export const selectNotifications = (state) => state.user.notifications;
export const selectUnreadNotifications = (state) => state.user.unreadNotifications;
export const selectSavedItems = (state) => state.user.savedItems;
export const selectSavedSearches = (state) => state.user.savedSearches;

// Loading selectors
export const selectProfileLoading = (state) => state.user.loading.profile;
export const selectSettingsLoading = (state) => state.user.loading.settings;
export const selectPreferencesLoading = (state) => state.user.loading.preferences;
export const selectStatsLoading = (state) => state.user.loading.stats;
export const selectActivityLoading = (state) => state.user.loading.activity;
export const selectReferralsLoading = (state) => state.user.loading.referrals;
export const selectNotificationsLoading = (state) => state.user.loading.notifications;
export const selectSavedItemsLoading = (state) => state.user.loading.savedItems;
export const selectUpdateProfileLoading = (state) => state.user.loading.updateProfile;
export const selectUpdateSettingsLoading = (state) => state.user.loading.updateSettings;
export const selectUpdatePreferencesLoading = (state) => state.user.loading.updatePreferences;

// Error selectors
export const selectProfileError = (state) => state.user.errors.profile;
export const selectSettingsError = (state) => state.user.errors.settings;
export const selectPreferencesError = (state) => state.user.errors.preferences;
export const selectStatsError = (state) => state.user.errors.stats;
export const selectActivityError = (state) => state.user.errors.activity;
export const selectReferralsError = (state) => state.user.errors.referrals;
export const selectNotificationsError = (state) => state.user.errors.notifications;
export const selectSavedItemsError = (state) => state.user.errors.savedItems;
export const selectUpdateProfileError = (state) => state.user.errors.updateProfile;
export const selectUpdateSettingsError = (state) => state.user.errors.updateSettings;
export const selectUpdatePreferencesError = (state) => state.user.errors.updatePreferences;

// Success selectors
export const selectUpdateProfileSuccess = (state) => state.user.success.updateProfile;
export const selectUpdateSettingsSuccess = (state) => state.user.success.updateSettings;
export const selectUpdatePreferencesSuccess = (state) => state.user.success.updatePreferences;

// Last updated selectors
export const selectProfileLastUpdated = (state) => state.user.lastUpdated.profile;
export const selectSettingsLastUpdated = (state) => state.user.lastUpdated.settings;
export const selectPreferencesLastUpdated = (state) => state.user.lastUpdated.preferences;
export const selectStatsLastUpdated = (state) => state.user.lastUpdated.stats;
export const selectActivityLastUpdated = (state) => state.user.lastUpdated.activity;
export const selectReferralsLastUpdated = (state) => state.user.lastUpdated.referrals;
export const selectNotificationsLastUpdated = (state) => state.user.lastUpdated.notifications;

// Pagination selectors
export const selectActivityPagination = (state) => state.user.pagination.activity;
export const selectReferralsPagination = (state) => state.user.pagination.referrals;
export const selectNotificationsPagination = (state) => state.user.pagination.notifications;

// Computed selectors
export const selectUserDisplayName = createSelector(
  [selectProfile],
  (profile) => {
    if (!profile) return 'User';
    return profile.name || profile.username || profile.email?.split('@')[0] || 'User';
  }
);

export const selectUserInitials = createSelector(
  [selectProfile],
  (profile) => {
    if (!profile) return 'U';
    const name = profile.name || profile.username || profile.email;
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
);

export const selectUserAvatar = createSelector(
  [selectProfile],
  (profile) => profile?.avatar || null
);

export const selectUserEmail = createSelector(
  [selectProfile],
  (profile) => profile?.email || null
);

export const selectUserPhone = createSelector(
  [selectProfile],
  (profile) => profile?.phone || null
);

export const selectUserJoinDate = createSelector(
  [selectProfile],
  (profile) => profile?.createdAt || null
);

export const selectUserLevel = createSelector(
  [selectStats],
  (stats) => stats?.level || 1
);

export const selectUserExperience = createSelector(
  [selectStats],
  (stats) => stats?.experience || 0
);

export const selectUserRank = createSelector(
  [selectStats],
  (stats) => stats?.rank || 0
);

export const selectUserAchievements = createSelector(
  [selectStats],
  (stats) => stats?.achievements || []
);

export const selectUserBadges = createSelector(
  [selectStats],
  (stats) => stats?.badges || []
);

export const selectUserTotalEarnings = createSelector(
  [selectStats],
  (stats) => stats?.totalEarnings || 0
);

export const selectUserTotalReferrals = createSelector(
  [selectStats],
  (stats) => stats?.totalReferrals || 0
);

export const selectUserTotalClicks = createSelector(
  [selectStats],
  (stats) => stats?.totalClicks || 0
);

export const selectUserTotalConversions = createSelector(
  [selectStats],
  (stats) => stats?.totalConversions || 0
);

export const selectUserConversionRate = createSelector(
  [selectUserTotalClicks, selectUserTotalConversions],
  (clicks, conversions) => {
    if (!clicks) return 0;
    return (conversions / clicks) * 100;
  }
);

export const selectRecentActivity = (limit = 10) => createSelector(
  [selectActivity],
  (activity) => activity.slice(0, limit)
);

export const selectUnreadNotificationsCount = (state) => state.user.unreadNotifications;

export const selectNotificationById = (notificationId) => createSelector(
  [selectNotifications],
  (notifications) => notifications.find(n => n.id === notificationId)
);

export const selectIsItemSaved = (itemId) => createSelector(
  [selectSavedItems],
  (savedItems) => savedItems.some(item => item.id === itemId)
);

export const selectSavedItemById = (itemId) => createSelector(
  [selectSavedItems],
  (savedItems) => savedItems.find(item => item.id === itemId)
);

// ==================== Export ====================

export default userSlice.reducer;
