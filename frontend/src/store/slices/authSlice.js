import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { ROLES } from '../../config/roles';

// ==================== Initial State ====================

const initialState = {
  // User data
  user: null,
  token: null,
  refreshToken: null,
  
  // Auth state
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  
  // Session
  sessionExpiry: null,
  lastActivity: null,
  
  // 2FA
  twoFactorRequired: false,
  twoFactorType: null,
  twoFactorSent: false,
  
  // Email verification
  emailVerified: false,
  verificationSent: false,
  
  // Password reset
  resetToken: null,
  resetSent: false,
  
  // Error states
  error: null,
  loginAttempts: 0,
  lockoutUntil: null,
  
  // Loading states for different actions
  loading: {
    login: false,
    register: false,
    logout: false,
    refresh: false,
    verifyEmail: false,
    resetPassword: false,
    changePassword: false,
    updateProfile: false,
    twoFactor: false
  },
  
  // Errors for different actions
  errors: {
    login: null,
    register: null,
    logout: null,
    refresh: null,
    verifyEmail: null,
    resetPassword: null,
    changePassword: null,
    updateProfile: null,
    twoFactor: null
  },
  
  // Success messages
  success: {
    login: null,
    register: null,
    logout: null,
    verifyEmail: null,
    resetPassword: null,
    changePassword: null,
    updateProfile: null,
    twoFactor: null
  },
  
  // Metadata
  lastLogin: null,
  lastLogout: null,
  loginHistory: [],
  
  // Permissions
  permissions: [],
  
  // Session info
  sessionId: null,
  deviceId: null,
  ipAddress: null,
  userAgent: null
};

// ==================== Async Thunks ====================

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Refresh token thunk
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      const response = await authService.refreshToken(refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Verify email thunk
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Resend verification thunk
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerification(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Forgot password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reset password thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Change password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Enable 2FA thunk
export const enableTwoFactor = createAsyncThunk(
  'auth/enableTwoFactor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.enableTwoFactor();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Verify 2FA thunk
export const verifyTwoFactor = createAsyncThunk(
  'auth/verifyTwoFactor',
  async (code, { rejectWithValue }) => {
    try {
      const response = await authService.verifyTwoFactor(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Disable 2FA thunk
export const disableTwoFactor = createAsyncThunk(
  'auth/disableTwoFactor',
  async (code, { rejectWithValue }) => {
    try {
      const response = await authService.disableTwoFactor(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Social login thunk
export const socialLogin = createAsyncThunk(
  'auth/socialLogin',
  async ({ provider, code }, { rejectWithValue }) => {
    try {
      const response = await authService.socialLogin(provider, code);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// ==================== Auth Slice ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.errors = {
        login: null,
        register: null,
        logout: null,
        refresh: null,
        verifyEmail: null,
        resetPassword: null,
        changePassword: null,
        updateProfile: null,
        twoFactor: null
      };
    },

    // Clear success
    clearSuccess: (state) => {
      state.success = {
        login: null,
        register: null,
        logout: null,
        verifyEmail: null,
        resetPassword: null,
        changePassword: null,
        updateProfile: null,
        twoFactor: null
      };
    },

    // Set user
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Set token
    setToken: (state, action) => {
      state.token = action.payload;
    },

    // Set refresh token
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },

    // Set session expiry
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },

    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Add login history
    addLoginHistory: (state, action) => {
      state.loginHistory.unshift({
        timestamp: Date.now(),
        ...action.payload
      });
      if (state.loginHistory.length > 50) {
        state.loginHistory.pop();
      }
    },

    // Reset auth state
    resetAuth: () => initialState,

    // Set loading state for specific action
    setLoading: (state, action) => {
      const { action: actionName, isLoading } = action.payload;
      if (state.loading.hasOwnProperty(actionName)) {
        state.loading[actionName] = isLoading;
      }
    },

    // Set error for specific action
    setError: (state, action) => {
      const { action: actionName, error } = action.payload;
      if (state.errors.hasOwnProperty(actionName)) {
        state.errors[actionName] = error;
        state.error = error;
      }
    },

    // Set success message for specific action
    setSuccess: (state, action) => {
      const { action: actionName, message } = action.payload;
      if (state.success.hasOwnProperty(actionName)) {
        state.success[actionName] = message;
      }
    },

    // Increment login attempts
    incrementLoginAttempts: (state) => {
      state.loginAttempts++;
      if (state.loginAttempts >= 5) {
        state.lockoutUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
    },

    // Reset login attempts
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lockoutUntil = null;
    },

    // Set 2FA required
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = action.payload.required;
      state.twoFactorType = action.payload.type || null;
    },

    // Set verification sent
    setVerificationSent: (state, action) => {
      state.verificationSent = action.payload;
    },

    // Set reset sent
    setResetSent: (state, action) => {
      state.resetSent = action.payload;
    },

    // Update permissions
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    },

    // Set session info
    setSessionInfo: (state, action) => {
      const { sessionId, deviceId, ipAddress, userAgent } = action.payload;
      state.sessionId = sessionId;
      state.deviceId = deviceId;
      state.ipAddress = ipAddress;
      state.userAgent = userAgent;
    },

    // Touch session (update last activity)
    touchSession: (state) => {
      state.lastActivity = Date.now();
    },

    // Extend session
    extendSession: (state) => {
      if (state.sessionExpiry) {
        state.sessionExpiry = Date.now() + 60 * 60 * 1000; // +1 hour
      }
    },

    // Clear session
    clearSession: (state) => {
      state.sessionExpiry = null;
      state.lastActivity = null;
      state.sessionId = null;
      state.deviceId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading.login = true;
        state.errors.login = null;
        state.success.login = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionExpiry = Date.now() + 60 * 60 * 1000;
        state.lastLogin = Date.now();
        state.lastActivity = Date.now();
        state.loginAttempts = 0;
        state.lockoutUntil = null;
        state.permissions = action.payload.permissions || [];
        state.success.login = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false;
        state.errors.login = action.payload;
        state.error = action.payload;
        state.loginAttempts++;
        if (state.loginAttempts >= 5) {
          state.lockoutUntil = Date.now() + 30 * 60 * 1000;
        }
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading.register = true;
        state.errors.register = null;
        state.success.register = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.register = false;
        if (action.payload.autoLogin) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
        state.success.register = 'Registration successful';
        state.verificationSent = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.register = false;
        state.errors.register = action.payload;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading.logout = true;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState);
        state.isInitialized = true;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading.logout = false;
        state.errors.logout = action.payload;
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading.refresh = true;
        state.errors.refresh = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = Date.now() + 60 * 60 * 1000;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading.refresh = false;
        state.errors.refresh = action.payload;
        state.error = action.payload;
        // Clear auth on refresh failure
        Object.assign(state, initialState);
        state.isInitialized = true;
      });
  }
});
// ==================== Auth Slice ====================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.errors = {
        login: null,
        register: null,
        logout: null,
        refresh: null,
        verifyEmail: null,
        resetPassword: null,
        changePassword: null,
        updateProfile: null,
        twoFactor: null
      };
    },

    // Clear success
    clearSuccess: (state) => {
      state.success = {
        login: null,
        register: null,
        logout: null,
        verifyEmail: null,
        resetPassword: null,
        changePassword: null,
        updateProfile: null,
        twoFactor: null
      };
    },

    // Set user
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Set token
    setToken: (state, action) => {
      state.token = action.payload;
    },

    // Set refresh token
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },

    // Set session expiry
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },

    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Add login history
    addLoginHistory: (state, action) => {
      state.loginHistory.unshift({
        timestamp: Date.now(),
        ...action.payload
      });
      if (state.loginHistory.length > 50) {
        state.loginHistory.pop();
      }
    },

    // Reset auth state
    resetAuth: () => initialState,

    // Set loading state for specific action
    setLoading: (state, action) => {
      const { action: actionName, isLoading } = action.payload;
      if (state.loading.hasOwnProperty(actionName)) {
        state.loading[actionName] = isLoading;
      }
    },

    // Set error for specific action
    setError: (state, action) => {
      const { action: actionName, error } = action.payload;
      if (state.errors.hasOwnProperty(actionName)) {
        state.errors[actionName] = error;
        state.error = error;
      }
    },

    // Set success message for specific action
    setSuccess: (state, action) => {
      const { action: actionName, message } = action.payload;
      if (state.success.hasOwnProperty(actionName)) {
        state.success[actionName] = message;
      }
    },

    // Increment login attempts
    incrementLoginAttempts: (state) => {
      state.loginAttempts++;
      if (state.loginAttempts >= 5) {
        state.lockoutUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }
    },

    // Reset login attempts
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lockoutUntil = null;
    },

    // Set 2FA required
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = action.payload.required;
      state.twoFactorType = action.payload.type || null;
    },

    // Set verification sent
    setVerificationSent: (state, action) => {
      state.verificationSent = action.payload;
    },

    // Set reset sent
    setResetSent: (state, action) => {
      state.resetSent = action.payload;
    },

    // Update permissions
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    },

    // Set session info
    setSessionInfo: (state, action) => {
      const { sessionId, deviceId, ipAddress, userAgent } = action.payload;
      state.sessionId = sessionId;
      state.deviceId = deviceId;
      state.ipAddress = ipAddress;
      state.userAgent = userAgent;
    },

    // Touch session (update last activity)
    touchSession: (state) => {
      state.lastActivity = Date.now();
    },

    // Extend session
    extendSession: (state) => {
      if (state.sessionExpiry) {
        state.sessionExpiry = Date.now() + 60 * 60 * 1000; // +1 hour
      }
    },

    // Clear session
    clearSession: (state) => {
      state.sessionExpiry = null;
      state.lastActivity = null;
      state.sessionId = null;
      state.deviceId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading.login = true;
        state.errors.login = null;
        state.success.login = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading.login = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.sessionExpiry = Date.now() + 60 * 60 * 1000;
        state.lastLogin = Date.now();
        state.lastActivity = Date.now();
        state.loginAttempts = 0;
        state.lockoutUntil = null;
        state.permissions = action.payload.permissions || [];
        state.success.login = 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading.login = false;
        state.errors.login = action.payload;
        state.error = action.payload;
        state.loginAttempts++;
        if (state.loginAttempts >= 5) {
          state.lockoutUntil = Date.now() + 30 * 60 * 1000;
        }
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading.register = true;
        state.errors.register = null;
        state.success.register = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading.register = false;
        if (action.payload.autoLogin) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
        state.success.register = 'Registration successful';
        state.verificationSent = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading.register = false;
        state.errors.register = action.payload;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading.logout = true;
      })
      .addCase(logout.fulfilled, (state) => {
        Object.assign(state, initialState);
        state.isInitialized = true;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading.logout = false;
        state.errors.logout = action.payload;
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading.refresh = true;
        state.errors.refresh = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiry = Date.now() + 60 * 60 * 1000;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading.refresh = false;
        state.errors.refresh = action.payload;
        state.error = action.payload;
        // Clear auth on refresh failure
        Object.assign(state, initialState);
        state.isInitialized = true;
      });
  }
});
// Continue extraReducers
builder
  // Verify email
  .addCase(verifyEmail.pending, (state) => {
    state.loading.verifyEmail = true;
    state.errors.verifyEmail = null;
    state.success.verifyEmail = null;
  })
  .addCase(verifyEmail.fulfilled, (state) => {
    state.loading.verifyEmail = false;
    state.emailVerified = true;
    if (state.user) {
      state.user.isEmailVerified = true;
    }
    state.success.verifyEmail = 'Email verified successfully';
  })
  .addCase(verifyEmail.rejected, (state, action) => {
    state.loading.verifyEmail = false;
    state.errors.verifyEmail = action.payload;
    state.error = action.payload;
  })

  // Resend verification
  .addCase(resendVerification.pending, (state) => {
    state.loading.verifyEmail = true;
    state.errors.verifyEmail = null;
    state.success.verifyEmail = null;
  })
  .addCase(resendVerification.fulfilled, (state) => {
    state.loading.verifyEmail = false;
    state.verificationSent = true;
    state.success.verifyEmail = 'Verification email sent';
  })
  .addCase(resendVerification.rejected, (state, action) => {
    state.loading.verifyEmail = false;
    state.errors.verifyEmail = action.payload;
    state.error = action.payload;
  })

  // Forgot password
  .addCase(forgotPassword.pending, (state) => {
    state.loading.resetPassword = true;
    state.errors.resetPassword = null;
    state.success.resetPassword = null;
  })
  .addCase(forgotPassword.fulfilled, (state) => {
    state.loading.resetPassword = false;
    state.resetSent = true;
    state.success.resetPassword = 'Password reset email sent';
  })
  .addCase(forgotPassword.rejected, (state, action) => {
    state.loading.resetPassword = false;
    state.errors.resetPassword = action.payload;
    state.error = action.payload;
  })

  // Reset password
  .addCase(resetPassword.pending, (state) => {
    state.loading.resetPassword = true;
    state.errors.resetPassword = null;
    state.success.resetPassword = null;
  })
  .addCase(resetPassword.fulfilled, (state) => {
    state.loading.resetPassword = false;
    state.resetToken = null;
    state.success.resetPassword = 'Password reset successful';
  })
  .addCase(resetPassword.rejected, (state, action) => {
    state.loading.resetPassword = false;
    state.errors.resetPassword = action.payload;
    state.error = action.payload;
  })

  // Change password
  .addCase(changePassword.pending, (state) => {
    state.loading.changePassword = true;
    state.errors.changePassword = null;
    state.success.changePassword = null;
  })
  .addCase(changePassword.fulfilled, (state) => {
    state.loading.changePassword = false;
    state.success.changePassword = 'Password changed successfully';
  })
  .addCase(changePassword.rejected, (state, action) => {
    state.loading.changePassword = false;
    state.errors.changePassword = action.payload;
    state.error = action.payload;
  })

  // Update profile
  .addCase(updateProfile.pending, (state) => {
    state.loading.updateProfile = true;
    state.errors.updateProfile = null;
    state.success.updateProfile = null;
  })
  .addCase(updateProfile.fulfilled, (state, action) => {
    state.loading.updateProfile = false;
    state.user = { ...state.user, ...action.payload.user };
    state.success.updateProfile = 'Profile updated successfully';
  })
  .addCase(updateProfile.rejected, (state, action) => {
    state.loading.updateProfile = false;
    state.errors.updateProfile = action.payload;
    state.error = action.payload;
  })

  // Enable 2FA
  .addCase(enableTwoFactor.pending, (state) => {
    state.loading.twoFactor = true;
    state.errors.twoFactor = null;
    state.success.twoFactor = null;
  })
  .addCase(enableTwoFactor.fulfilled, (state, action) => {
    state.loading.twoFactor = false;
    state.twoFactorRequired = true;
    state.twoFactorType = 'app';
    state.user.twoFactorEnabled = true;
    state.success.twoFactor = '2FA enabled successfully';
  })
  .addCase(enableTwoFactor.rejected, (state, action) => {
    state.loading.twoFactor = false;
    state.errors.twoFactor = action.payload;
    state.error = action.payload;
  })

  // Verify 2FA
  .addCase(verifyTwoFactor.pending, (state) => {
    state.loading.twoFactor = true;
    state.errors.twoFactor = null;
  })
  .addCase(verifyTwoFactor.fulfilled, (state) => {
    state.loading.twoFactor = false;
    state.twoFactorRequired = false;
    state.twoFactorSent = false;
  })
  .addCase(verifyTwoFactor.rejected, (state, action) => {
    state.loading.twoFactor = false;
    state.errors.twoFactor = action.payload;
    state.error = action.payload;
  })

  // Disable 2FA
  .addCase(disableTwoFactor.pending, (state) => {
    state.loading.twoFactor = true;
    state.errors.twoFactor = null;
    state.success.twoFactor = null;
  })
  .addCase(disableTwoFactor.fulfilled, (state) => {
    state.loading.twoFactor = false;
    state.twoFactorRequired = false;
    state.twoFactorType = null;
    state.user.twoFactorEnabled = false;
    state.success.twoFactor = '2FA disabled successfully';
  })
  .addCase(disableTwoFactor.rejected, (state, action) => {
    state.loading.twoFactor = false;
    state.errors.twoFactor = action.payload;
    state.error = action.payload;
  })

  // Social login
  .addCase(socialLogin.pending, (state) => {
    state.loading.login = true;
    state.errors.login = null;
  })
  .addCase(socialLogin.fulfilled, (state, action) => {
    state.loading.login = false;
    state.user = action.payload.user;
    state.token = action.payload.token;
    state.refreshToken = action.payload.refreshToken;
    state.isAuthenticated = true;
    state.sessionExpiry = Date.now() + 60 * 60 * 1000;
    state.lastLogin = Date.now();
    state.lastActivity = Date.now();
  })
  .addCase(socialLogin.rejected, (state, action) => {
    state.loading.login = false;
    state.errors.login = action.payload;
    state.error = action.payload;
  });

// ==================== Actions ====================

export const {
  clearError,
  clearSuccess,
  setUser,
  setToken,
  setRefreshToken,
  setSessionExpiry,
  updateLastActivity,
  addLoginHistory,
  resetAuth,
  setLoading,
  setError,
  setSuccess,
  incrementLoginAttempts,
  resetLoginAttempts,
  setTwoFactorRequired,
  setVerificationSent,
  setResetSent,
  updatePermissions,
  setSessionInfo,
  touchSession,
  extendSession,
  clearSession
} = authSlice.actions;

// ==================== Selectors ====================

// Base selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// Loading selectors
export const selectLoginLoading = (state) => state.auth.loading.login;
export const selectRegisterLoading = (state) => state.auth.loading.register;
export const selectLogoutLoading = (state) => state.auth.loading.logout;
export const selectRefreshLoading = (state) => state.auth.loading.refresh;
export const selectVerifyEmailLoading = (state) => state.auth.loading.verifyEmail;
export const selectResetPasswordLoading = (state) => state.auth.loading.resetPassword;
export const selectChangePasswordLoading = (state) => state.auth.loading.changePassword;
export const selectUpdateProfileLoading = (state) => state.auth.loading.updateProfile;
export const selectTwoFactorLoading = (state) => state.auth.loading.twoFactor;

// Error selectors
export const selectLoginError = (state) => state.auth.errors.login;
export const selectRegisterError = (state) => state.auth.errors.register;
export const selectLogoutError = (state) => state.auth.errors.logout;
export const selectRefreshError = (state) => state.auth.errors.refresh;
export const selectVerifyEmailError = (state) => state.auth.errors.verifyEmail;
export const selectResetPasswordError = (state) => state.auth.errors.resetPassword;
export const selectChangePasswordError = (state) => state.auth.errors.changePassword;
export const selectUpdateProfileError = (state) => state.auth.errors.updateProfile;
export const selectTwoFactorError = (state) => state.auth.errors.twoFactor;

// Success selectors
export const selectLoginSuccess = (state) => state.auth.success.login;
export const selectRegisterSuccess = (state) => state.auth.success.register;
export const selectVerifyEmailSuccess = (state) => state.auth.success.verifyEmail;
export const selectResetPasswordSuccess = (state) => state.auth.success.resetPassword;
export const selectChangePasswordSuccess = (state) => state.auth.success.changePassword;
export const selectUpdateProfileSuccess = (state) => state.auth.success.updateProfile;
export const selectTwoFactorSuccess = (state) => state.auth.success.twoFactor;

// Computed selectors
export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role || null
);

export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id || null
);

export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name || null
);

export const selectUserEmail = createSelector(
  [selectUser],
  (user) => user?.email || null
);

export const selectUserAvatar = createSelector(
  [selectUser],
  (user) => user?.avatar || null
);

export const selectIsEmailVerified = createSelector(
  [selectUser],
  (user) => user?.isEmailVerified || false
);

export const selectIsTwoFactorEnabled = createSelector(
  [selectUser],
  (user) => user?.twoFactorEnabled || false
);

export const selectHasRole = (role) => createSelector(
  [selectUserRole],
  (userRole) => userRole === role
);

export const selectHasAnyRole = (roles) => createSelector(
  [selectUserRole],
  (userRole) => roles.includes(userRole)
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
);

export const selectIsSuperAdmin = createSelector(
  [selectUserRole],
  (role) => role === ROLES.SUPER_ADMIN
);

export const selectIsAffiliate = createSelector(
  [selectUserRole],
  (role) => role === ROLES.AFFILIATE || role === ROLES.SUPER_ADMIN
);

export const selectSessionValid = createSelector(
  [selectIsAuthenticated, (state) => state.auth.sessionExpiry],
  (isAuthenticated, sessionExpiry) => {
    if (!isAuthenticated || !sessionExpiry) return false;
    return Date.now() < sessionExpiry;
  }
);

export const selectSessionTimeRemaining = createSelector(
  [(state) => state.auth.sessionExpiry],
  (sessionExpiry) => {
    if (!sessionExpiry) return 0;
    return Math.max(0, sessionExpiry - Date.now());
  }
);

export const selectIsLockedOut = createSelector(
  [(state) => state.auth.lockoutUntil],
  (lockoutUntil) => {
    if (!lockoutUntil) return false;
    return Date.now() < lockoutUntil;
  }
);

export const selectLockoutTimeRemaining = createSelector(
  [(state) => state.auth.lockoutUntil],
  (lockoutUntil) => {
    if (!lockoutUntil) return 0;
    return Math.max(0, lockoutUntil - Date.now());
  }
);

export const selectLoginAttemptsRemaining = createSelector(
  [(state) => state.auth.loginAttempts],
  (attempts) => Math.max(0, 5 - attempts)
);

export const selectPermissions = (state) => state.auth.permissions;

export const selectHasPermission = (permission) => createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => isAdmin || permissions.includes(permission)
);

export const selectHasAnyPermission = (requiredPermissions) => createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => {
    if (isAdmin) return true;
    return requiredPermissions.some(p => permissions.includes(p));
  }
);

export const selectHasAllPermissions = (requiredPermissions) => createSelector(
  [selectPermissions, selectIsAdmin],
  (permissions, isAdmin) => {
    if (isAdmin) return true;
    return requiredPermissions.every(p => permissions.includes(p));
  }
);

export const selectRecentLoginHistory = (limit = 10) => createSelector(
  [(state) => state.auth.loginHistory],
  (history) => history.slice(0, limit)
);

// ==================== Export ====================

export default authSlice.reducer;
