import { createAction } from '@reduxjs/toolkit';

// ==================== Action Types ====================

export const AUTH_ACTION_TYPES = {
  // Login actions
  LOGIN_REQUEST: 'auth/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'auth/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'auth/LOGIN_FAILURE',
  
  // Register actions
  REGISTER_REQUEST: 'auth/REGISTER_REQUEST',
  REGISTER_SUCCESS: 'auth/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'auth/REGISTER_FAILURE',
  
  // Logout actions
  LOGOUT_REQUEST: 'auth/LOGOUT_REQUEST',
  LOGOUT_SUCCESS: 'auth/LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'auth/LOGOUT_FAILURE',
  
  // Token refresh actions
  REFRESH_TOKEN_REQUEST: 'auth/REFRESH_TOKEN_REQUEST',
  REFRESH_TOKEN_SUCCESS: 'auth/REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'auth/REFRESH_TOKEN_FAILURE',
  
  // Email verification actions
  VERIFY_EMAIL_REQUEST: 'auth/VERIFY_EMAIL_REQUEST',
  VERIFY_EMAIL_SUCCESS: 'auth/VERIFY_EMAIL_SUCCESS',
  VERIFY_EMAIL_FAILURE: 'auth/VERIFY_EMAIL_FAILURE',
  
  // Password reset actions
  FORGOT_PASSWORD_REQUEST: 'auth/FORGOT_PASSWORD_REQUEST',
  FORGOT_PASSWORD_SUCCESS: 'auth/FORGOT_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_FAILURE: 'auth/FORGOT_PASSWORD_FAILURE',
  
  RESET_PASSWORD_REQUEST: 'auth/RESET_PASSWORD_REQUEST',
  RESET_PASSWORD_SUCCESS: 'auth/RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'auth/RESET_PASSWORD_FAILURE',
  
  // Password change actions
  CHANGE_PASSWORD_REQUEST: 'auth/CHANGE_PASSWORD_REQUEST',
  CHANGE_PASSWORD_SUCCESS: 'auth/CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_FAILURE: 'auth/CHANGE_PASSWORD_FAILURE',
  
  // Profile update actions
  UPDATE_PROFILE_REQUEST: 'auth/UPDATE_PROFILE_REQUEST',
  UPDATE_PROFILE_SUCCESS: 'auth/UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'auth/UPDATE_PROFILE_FAILURE',
  
  // Two-factor authentication actions
  ENABLE_2FA_REQUEST: 'auth/ENABLE_2FA_REQUEST',
  ENABLE_2FA_SUCCESS: 'auth/ENABLE_2FA_SUCCESS',
  ENABLE_2FA_FAILURE: 'auth/ENABLE_2FA_FAILURE',
  
  VERIFY_2FA_REQUEST: 'auth/VERIFY_2FA_REQUEST',
  VERIFY_2FA_SUCCESS: 'auth/VERIFY_2FA_SUCCESS',
  VERIFY_2FA_FAILURE: 'auth/VERIFY_2FA_FAILURE',
  
  DISABLE_2FA_REQUEST: 'auth/DISABLE_2FA_REQUEST',
  DISABLE_2FA_SUCCESS: 'auth/DISABLE_2FA_SUCCESS',
  DISABLE_2FA_FAILURE: 'auth/DISABLE_2FA_FAILURE',
  
  // Social login actions
  SOCIAL_LOGIN_REQUEST: 'auth/SOCIAL_LOGIN_REQUEST',
  SOCIAL_LOGIN_SUCCESS: 'auth/SOCIAL_LOGIN_SUCCESS',
  SOCIAL_LOGIN_FAILURE: 'auth/SOCIAL_LOGIN_FAILURE',
  
  // Session actions
  SET_SESSION: 'auth/SET_SESSION',
  CLEAR_SESSION: 'auth/CLEAR_SESSION',
  UPDATE_SESSION: 'auth/UPDATE_SESSION',
  EXTEND_SESSION: 'auth/EXTEND_SESSION',
  
  // User actions
  SET_USER: 'auth/SET_USER',
  UPDATE_USER: 'auth/UPDATE_USER',
  CLEAR_USER: 'auth/CLEAR_USER',
  
  // Token actions
  SET_TOKEN: 'auth/SET_TOKEN',
  SET_REFRESH_TOKEN: 'auth/SET_REFRESH_TOKEN',
  CLEAR_TOKENS: 'auth/CLEAR_TOKENS',
  
  // Permission actions
  SET_PERMISSIONS: 'auth/SET_PERMISSIONS',
  UPDATE_PERMISSIONS: 'auth/UPDATE_PERMISSIONS',
  
  // Status actions
  SET_AUTHENTICATED: 'auth/SET_AUTHENTICATED',
  SET_LOADING: 'auth/SET_LOADING',
  SET_ERROR: 'auth/SET_ERROR',
  CLEAR_ERROR: 'auth/CLEAR_ERROR',
  
  // Login attempt actions
  INCREMENT_LOGIN_ATTEMPTS: 'auth/INCREMENT_LOGIN_ATTEMPTS',
  RESET_LOGIN_ATTEMPTS: 'auth/RESET_LOGIN_ATTEMPTS',
  SET_LOCKOUT: 'auth/SET_LOCKOUT',
  
  // 2FA actions
  SET_2FA_REQUIRED: 'auth/SET_2FA_REQUIRED',
  SET_2FA_TYPE: 'auth/SET_2FA_TYPE',
  SET_2FA_SENT: 'auth/SET_2FA_SENT',
  
  // Verification actions
  SET_EMAIL_VERIFIED: 'auth/SET_EMAIL_VERIFIED',
  SET_VERIFICATION_SENT: 'auth/SET_VERIFICATION_SENT',
  
  // Password reset actions
  SET_RESET_TOKEN: 'auth/SET_RESET_TOKEN',
  SET_RESET_SENT: 'auth/SET_RESET_SENT',
  
  // History actions
  ADD_LOGIN_HISTORY: 'auth/ADD_LOGIN_HISTORY',
  CLEAR_LOGIN_HISTORY: 'auth/CLEAR_LOGIN_HISTORY',
  
  // Session info actions
  SET_SESSION_INFO: 'auth/SET_SESSION_INFO',
  UPDATE_LAST_ACTIVITY: 'auth/UPDATE_LAST_ACTIVITY',
  
  // Reset actions
  RESET_AUTH: 'auth/RESET_AUTH',
};

// ==================== Action Creators ====================

// Login actions
export const loginRequest = createAction(
  AUTH_ACTION_TYPES.LOGIN_REQUEST,
  (credentials) => ({ payload: credentials }),
);

export const loginSuccess = createAction(
  AUTH_ACTION_TYPES.LOGIN_SUCCESS,
  (user, token, refreshToken) => ({ 
    payload: { user, token, refreshToken }, 
  }),
);

export const loginFailure = createAction(
  AUTH_ACTION_TYPES.LOGIN_FAILURE,
  (error) => ({ payload: error }),
);

// Register actions
export const registerRequest = createAction(
  AUTH_ACTION_TYPES.REGISTER_REQUEST,
  (userData) => ({ payload: userData }),
);

export const registerSuccess = createAction(
  AUTH_ACTION_TYPES.REGISTER_SUCCESS,
  (user, token, refreshToken) => ({ 
    payload: { user, token, refreshToken }, 
  }),
);

export const registerFailure = createAction(
  AUTH_ACTION_TYPES.REGISTER_FAILURE,
  (error) => ({ payload: error }),
);

// Logout actions
export const logoutRequest = createAction(AUTH_ACTION_TYPES.LOGOUT_REQUEST);
export const logoutSuccess = createAction(AUTH_ACTION_TYPES.LOGOUT_SUCCESS);
export const logoutFailure = createAction(
  AUTH_ACTION_TYPES.LOGOUT_FAILURE,
  (error) => ({ payload: error }),
);

// Token refresh actions
export const refreshTokenRequest = createAction(AUTH_ACTION_TYPES.REFRESH_TOKEN_REQUEST);
export const refreshTokenSuccess = createAction(
  AUTH_ACTION_TYPES.REFRESH_TOKEN_SUCCESS,
  (token, refreshToken) => ({ payload: { token, refreshToken } }),
);
export const refreshTokenFailure = createAction(
  AUTH_ACTION_TYPES.REFRESH_TOKEN_FAILURE,
  (error) => ({ payload: error }),
);

// Email verification actions
export const verifyEmailRequest = createAction(
  AUTH_ACTION_TYPES.VERIFY_EMAIL_REQUEST,
  (token) => ({ payload: token }),
);
export const verifyEmailSuccess = createAction(
  AUTH_ACTION_TYPES.VERIFY_EMAIL_SUCCESS,
  (message) => ({ payload: message }),
);
export const verifyEmailFailure = createAction(
  AUTH_ACTION_TYPES.VERIFY_EMAIL_FAILURE,
  (error) => ({ payload: error }),
);

// Forgot password actions
export const forgotPasswordRequest = createAction(
  AUTH_ACTION_TYPES.FORGOT_PASSWORD_REQUEST,
  (email) => ({ payload: email }),
);
export const forgotPasswordSuccess = createAction(
  AUTH_ACTION_TYPES.FORGOT_PASSWORD_SUCCESS,
  (message) => ({ payload: message }),
);
export const forgotPasswordFailure = createAction(
  AUTH_ACTION_TYPES.FORGOT_PASSWORD_FAILURE,
  (error) => ({ payload: error }),
);
// Reset password actions
export const resetPasswordRequest = createAction(
  AUTH_ACTION_TYPES.RESET_PASSWORD_REQUEST,
  ({ token, password }) => ({ payload: { token, password } }),
);
export const resetPasswordSuccess = createAction(
  AUTH_ACTION_TYPES.RESET_PASSWORD_SUCCESS,
  (message) => ({ payload: message }),
);
export const resetPasswordFailure = createAction(
  AUTH_ACTION_TYPES.RESET_PASSWORD_FAILURE,
  (error) => ({ payload: error }),
);

// Change password actions
export const changePasswordRequest = createAction(
  AUTH_ACTION_TYPES.CHANGE_PASSWORD_REQUEST,
  ({ currentPassword, newPassword }) => ({ payload: { currentPassword, newPassword } }),
);
export const changePasswordSuccess = createAction(
  AUTH_ACTION_TYPES.CHANGE_PASSWORD_SUCCESS,
  (message) => ({ payload: message }),
);
export const changePasswordFailure = createAction(
  AUTH_ACTION_TYPES.CHANGE_PASSWORD_FAILURE,
  (error) => ({ payload: error }),
);

// Profile update actions
export const updateProfileRequest = createAction(
  AUTH_ACTION_TYPES.UPDATE_PROFILE_REQUEST,
  (profileData) => ({ payload: profileData }),
);
export const updateProfileSuccess = createAction(
  AUTH_ACTION_TYPES.UPDATE_PROFILE_SUCCESS,
  (user) => ({ payload: user }),
);
export const updateProfileFailure = createAction(
  AUTH_ACTION_TYPES.UPDATE_PROFILE_FAILURE,
  (error) => ({ payload: error }),
);

// 2FA actions
export const enable2FARequest = createAction(AUTH_ACTION_TYPES.ENABLE_2FA_REQUEST);
export const enable2FASuccess = createAction(
  AUTH_ACTION_TYPES.ENABLE_2FA_SUCCESS,
  (data) => ({ payload: data }),
);
export const enable2FAFailure = createAction(
  AUTH_ACTION_TYPES.ENABLE_2FA_FAILURE,
  (error) => ({ payload: error }),
);

export const verify2FARequest = createAction(
  AUTH_ACTION_TYPES.VERIFY_2FA_REQUEST,
  (code) => ({ payload: code }),
);
export const verify2FASuccess = createAction(
  AUTH_ACTION_TYPES.VERIFY_2FA_SUCCESS,
  (message) => ({ payload: message }),
);
export const verify2FAFailure = createAction(
  AUTH_ACTION_TYPES.VERIFY_2FA_FAILURE,
  (error) => ({ payload: error }),
);

export const disable2FARequest = createAction(
  AUTH_ACTION_TYPES.DISABLE_2FA_REQUEST,
  (code) => ({ payload: code }),
);
export const disable2FASuccess = createAction(
  AUTH_ACTION_TYPES.DISABLE_2FA_SUCCESS,
  (message) => ({ payload: message }),
);
export const disable2FAFailure = createAction(
  AUTH_ACTION_TYPES.DISABLE_2FA_FAILURE,
  (error) => ({ payload: error }),
);

// Social login actions
export const socialLoginRequest = createAction(
  AUTH_ACTION_TYPES.SOCIAL_LOGIN_REQUEST,
  ({ provider, code }) => ({ payload: { provider, code } }),
);
export const socialLoginSuccess = createAction(
  AUTH_ACTION_TYPES.SOCIAL_LOGIN_SUCCESS,
  (user, token, refreshToken) => ({ 
    payload: { user, token, refreshToken }, 
  }),
);
export const socialLoginFailure = createAction(
  AUTH_ACTION_TYPES.SOCIAL_LOGIN_FAILURE,
  (error) => ({ payload: error }),
);

// Session actions
export const setSession = createAction(
  AUTH_ACTION_TYPES.SET_SESSION,
  (sessionData) => ({ payload: sessionData }),
);

export const clearSession = createAction(AUTH_ACTION_TYPES.CLEAR_SESSION);

export const updateSession = createAction(
  AUTH_ACTION_TYPES.UPDATE_SESSION,
  (sessionData) => ({ payload: sessionData }),
);

export const extendSession = createAction(AUTH_ACTION_TYPES.EXTEND_SESSION);

// User actions
export const setUser = createAction(
  AUTH_ACTION_TYPES.SET_USER,
  (user) => ({ payload: user }),
);

export const updateUser = createAction(
  AUTH_ACTION_TYPES.UPDATE_USER,
  (userData) => ({ payload: userData }),
);

export const clearUser = createAction(AUTH_ACTION_TYPES.CLEAR_USER);

// Token actions
export const setToken = createAction(
  AUTH_ACTION_TYPES.SET_TOKEN,
  (token) => ({ payload: token }),
);

export const setRefreshToken = createAction(
  AUTH_ACTION_TYPES.SET_REFRESH_TOKEN,
  (refreshToken) => ({ payload: refreshToken }),
);

export const clearTokens = createAction(AUTH_ACTION_TYPES.CLEAR_TOKENS);

// Permission actions
export const setPermissions = createAction(
  AUTH_ACTION_TYPES.SET_PERMISSIONS,
  (permissions) => ({ payload: permissions }),
);

export const updatePermissions = createAction(
  AUTH_ACTION_TYPES.UPDATE_PERMISSIONS,
  (permissions) => ({ payload: permissions }),
);
// Status actions
export const setAuthenticated = createAction(
  AUTH_ACTION_TYPES.SET_AUTHENTICATED,
  (isAuthenticated) => ({ payload: isAuthenticated }),
);

export const setLoading = createAction(
  AUTH_ACTION_TYPES.SET_LOADING,
  (isLoading) => ({ payload: isLoading }),
);

export const setError = createAction(
  AUTH_ACTION_TYPES.SET_ERROR,
  (error) => ({ payload: error }),
);

export const clearError = createAction(AUTH_ACTION_TYPES.CLEAR_ERROR);

// Login attempt actions
export const incrementLoginAttempts = createAction(AUTH_ACTION_TYPES.INCREMENT_LOGIN_ATTEMPTS);
export const resetLoginAttempts = createAction(AUTH_ACTION_TYPES.RESET_LOGIN_ATTEMPTS);
export const setLockout = createAction(
  AUTH_ACTION_TYPES.SET_LOCKOUT,
  (lockoutUntil) => ({ payload: lockoutUntil }),
);

// 2FA status actions
export const set2FARequired = createAction(
  AUTH_ACTION_TYPES.SET_2FA_REQUIRED,
  (required) => ({ payload: required }),
);
export const set2FAType = createAction(
  AUTH_ACTION_TYPES.SET_2FA_TYPE,
  (type) => ({ payload: type }),
);
export const set2FASent = createAction(
  AUTH_ACTION_TYPES.SET_2FA_SENT,
  (sent) => ({ payload: sent }),
);

// Verification status actions
export const setEmailVerified = createAction(
  AUTH_ACTION_TYPES.SET_EMAIL_VERIFIED,
  (verified) => ({ payload: verified }),
);
export const setVerificationSent = createAction(
  AUTH_ACTION_TYPES.SET_VERIFICATION_SENT,
  (sent) => ({ payload: sent }),
);

// Password reset status actions
export const setResetToken = createAction(
  AUTH_ACTION_TYPES.SET_RESET_TOKEN,
  (token) => ({ payload: token }),
);
export const setResetSent = createAction(
  AUTH_ACTION_TYPES.SET_RESET_SENT,
  (sent) => ({ payload: sent }),
);

// History actions
export const addLoginHistory = createAction(
  AUTH_ACTION_TYPES.ADD_LOGIN_HISTORY,
  (entry) => ({ payload: entry }),
);
export const clearLoginHistory = createAction(AUTH_ACTION_TYPES.CLEAR_LOGIN_HISTORY);

// Session info actions
export const setSessionInfo = createAction(
  AUTH_ACTION_TYPES.SET_SESSION_INFO,
  (info) => ({ payload: info }),
);
export const updateLastActivity = createAction(AUTH_ACTION_TYPES.UPDATE_LAST_ACTIVITY);

// Reset auth state
export const resetAuth = createAction(AUTH_ACTION_TYPES.RESET_AUTH);

// ==================== Thunk Action Creators ====================

// These thunks will be used with redux-thunk middleware
export const authThunks = {
  // Login thunk
  login: (credentials) => async (dispatch) => {
    try {
      dispatch(loginRequest(credentials));
      
      // API call would go here
      // const response = await authService.login(credentials);
      
      // Mock success response
      const mockResponse = {
        user: { id: 1, name: 'John Doe', email: credentials.email },
        token: 'mock_token',
        refreshToken: 'mock_refresh_token',
      };
      
      dispatch(loginSuccess(mockResponse.user, mockResponse.token, mockResponse.refreshToken));
      dispatch(setAuthenticated(true));
      dispatch(clearError());
      dispatch(resetLoginAttempts());
      
      return mockResponse;
    } catch (error) {
      dispatch(loginFailure(error.message));
      dispatch(incrementLoginAttempts());
      throw error;
    }
  },

  // Register thunk
  register: (userData) => async (dispatch) => {
    try {
      dispatch(registerRequest(userData));
      
      // API call would go here
      // const response = await authService.register(userData);
      
      // Mock success response
      const mockResponse = {
        user: { id: 1, name: userData.name, email: userData.email },
        token: 'mock_token',
        refreshToken: 'mock_refresh_token',
      };
      
      dispatch(registerSuccess(mockResponse.user, mockResponse.token, mockResponse.refreshToken));
      dispatch(setAuthenticated(true));
      dispatch(clearError());
      
      return mockResponse;
    } catch (error) {
      dispatch(registerFailure(error.message));
      throw error;
    }
  },

  // Logout thunk
  logout: () => async (dispatch) => {
    try {
      dispatch(logoutRequest());
      
      // API call would go here
      // await authService.logout();
      
      dispatch(logoutSuccess());
      dispatch(clearSession());
      dispatch(clearUser());
      dispatch(clearTokens());
      dispatch(setAuthenticated(false));
    } catch (error) {
      dispatch(logoutFailure(error.message));
      throw error;
    }
  },

  // Refresh token thunk
  refreshToken: () => async (dispatch, getState) => {
    try {
      dispatch(refreshTokenRequest());
      
      const { refreshToken } = getState().auth;
      
      // API call would go here
      // const response = await authService.refreshToken(refreshToken);
      
      // Mock success response
      const mockResponse = {
        token: 'new_mock_token',
        refreshToken: 'new_mock_refresh_token',
      };
      
      dispatch(refreshTokenSuccess(mockResponse.token, mockResponse.refreshToken));
      
      return mockResponse;
    } catch (error) {
      dispatch(refreshTokenFailure(error.message));
      
      // If refresh fails, logout
      dispatch(authThunks.logout());
      
      throw error;
    }
  },

  // Verify email thunk
  verifyEmail: (token) => async (dispatch) => {
    try {
      dispatch(verifyEmailRequest(token));
      
      // API call would go here
      // const response = await authService.verifyEmail(token);
      
      dispatch(verifyEmailSuccess('Email verified successfully'));
      dispatch(setEmailVerified(true));
    } catch (error) {
      dispatch(verifyEmailFailure(error.message));
      throw error;
    }
  },

  // Forgot password thunk
  forgotPassword: (email) => async (dispatch) => {
    try {
      dispatch(forgotPasswordRequest(email));
      
      // API call would go here
      // const response = await authService.forgotPassword(email);
      
      dispatch(forgotPasswordSuccess('Password reset email sent'));
      dispatch(setResetSent(true));
    } catch (error) {
      dispatch(forgotPasswordFailure(error.message));
      throw error;
    }
  },

  // Reset password thunk
  resetPassword: (token, password) => async (dispatch) => {
    try {
      dispatch(resetPasswordRequest({ token, password }));
      
      // API call would go here
      // const response = await authService.resetPassword(token, password);
      
      dispatch(resetPasswordSuccess('Password reset successfully'));
    } catch (error) {
      dispatch(resetPasswordFailure(error.message));
      throw error;
    }
  },

  // Change password thunk
  changePassword: (currentPassword, newPassword) => async (dispatch) => {
    try {
      dispatch(changePasswordRequest({ currentPassword, newPassword }));
      
      // API call would go here
      // const response = await authService.changePassword(currentPassword, newPassword);
      
      dispatch(changePasswordSuccess('Password changed successfully'));
    } catch (error) {
      dispatch(changePasswordFailure(error.message));
      throw error;
    }
  },

  // Update profile thunk
  updateProfile: (profileData) => async (dispatch, getState) => {
    try {
      dispatch(updateProfileRequest(profileData));
      
      // API call would go here
      // const response = await authService.updateProfile(profileData);
      
      const { user } = getState().auth;
      const updatedUser = { ...user, ...profileData };
      
      dispatch(updateProfileSuccess(updatedUser));
      dispatch(setUser(updatedUser));
    } catch (error) {
      dispatch(updateProfileFailure(error.message));
      throw error;
    }
  },

  // Enable 2FA thunk
  enable2FA: () => async (dispatch) => {
    try {
      dispatch(enable2FARequest());
      
      // API call would go here
      // const response = await authService.enable2FA();
      
      const mockData = {
        secret: 'MOCK_SECRET',
        qrCode: 'data:image/png;base64,MOCK_QR_CODE',
      };
      
      dispatch(enable2FASuccess(mockData));
      dispatch(set2FARequired(true));
    } catch (error) {
      dispatch(enable2FAFailure(error.message));
      throw error;
    }
  },

  // Verify 2FA thunk
  verify2FA: (code) => async (dispatch) => {
    try {
      dispatch(verify2FARequest(code));
      
      // API call would go here
      // const response = await authService.verify2FA(code);
      
      dispatch(verify2FASuccess('2FA verified successfully'));
      dispatch(set2FARequired(false));
    } catch (error) {
      dispatch(verify2FAFailure(error.message));
      throw error;
    }
  },

  // Disable 2FA thunk
  disable2FA: (code) => async (dispatch) => {
    try {
      dispatch(disable2FARequest(code));
      
      // API call would go here
      // const response = await authService.disable2FA(code);
      
      dispatch(disable2FASuccess('2FA disabled successfully'));
    } catch (error) {
      dispatch(disable2FAFailure(error.message));
      throw error;
    }
  },

  // Social login thunk
  socialLogin: (provider, code) => async (dispatch) => {
    try {
      dispatch(socialLoginRequest({ provider, code }));
      
      // API call would go here
      // const response = await authService.socialLogin(provider, code);
      
      // Mock success response
      const mockResponse = {
        user: { id: 1, name: 'Social User', email: 'social@example.com' },
        token: 'mock_social_token',
        refreshToken: 'mock_social_refresh_token',
      };
      
      dispatch(socialLoginSuccess(
        mockResponse.user,
        mockResponse.token,
        mockResponse.refreshToken,
      ));
      dispatch(setAuthenticated(true));
      
      return mockResponse;
    } catch (error) {
      dispatch(socialLoginFailure(error.message));
      throw error;
    }
  },

  // Extend session thunk
  extendSession: () => async (dispatch) => {
    try {
      // API call would go here
      // await authService.extendSession();
      
      dispatch(extendSession());
      dispatch(updateLastActivity());
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  },

  // Check session thunk
  checkSession: () => async (dispatch, getState) => {
    const { sessionExpiry } = getState().auth;
    
    if (sessionExpiry && Date.now() > sessionExpiry) {
      try {
        await dispatch(authThunks.refreshToken());
      } catch (error) {
        dispatch(authThunks.logout());
      }
    }
  },
};

// ==================== Export all actions ====================

export default {
  ...AUTH_ACTION_TYPES,
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  enable2FARequest,
  enable2FASuccess,
  enable2FAFailure,
  verify2FARequest,
  verify2FASuccess,
  verify2FAFailure,
  disable2FARequest,
  disable2FASuccess,
  disable2FAFailure,
  socialLoginRequest,
  socialLoginSuccess,
  socialLoginFailure,
  setSession,
  clearSession,
  updateSession,
  extendSession,
  setUser,
  updateUser,
  clearUser,
  setToken,
  setRefreshToken,
  clearTokens,
  setPermissions,
  updatePermissions,
  setAuthenticated,
  setLoading,
  setError,
  clearError,
  incrementLoginAttempts,
  resetLoginAttempts,
  setLockout,
  set2FARequired,
  set2FAType,
  set2FASent,
  setEmailVerified,
  setVerificationSent,
  setResetToken,
  setResetSent,
  addLoginHistory,
  clearLoginHistory,
  setSessionInfo,
  updateLastActivity,
  resetAuth,
  authThunks,
};
