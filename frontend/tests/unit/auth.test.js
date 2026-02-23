import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import toast from 'react-hot-toast';

// Components to test
import { Login } from '../../src/pages/auth/Login';
import { Register } from '../../src/pages/auth/Register';
import { ForgotPassword } from '../../src/pages/auth/ForgotPassword';
import { ResetPassword } from '../../src/pages/auth/ResetPassword';
import { VerifyEmail } from '../../src/pages/auth/VerifyEmail';
import { TwoFactorAuth } from '../../src/pages/auth/TwoFactorAuth';

// Redux slices
import authReducer, { 
  login, 
  register, 
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  enableTwoFactor,
  verifyTwoFactor,
  disableTwoFactor
} from '../../src/store/slices/authSlice';

// Hooks
import { useAuth } from '../../src/hooks/useAuth';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../src/hooks/useAuth');
jest.mock('axios');

// Mock adapter for axios
const mockAxios = new MockAdapter(axios);

// ==================== Test Setup ====================

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: initialState
  });
};

// Mock user data
const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  isEmailVerified: true,
  twoFactorEnabled: false,
  avatar: null,
  createdAt: '2024-01-01T00:00:00.000Z'
};

const mockAdmin = {
  ...mockUser,
  id: '456',
  email: 'admin@example.com',
  role: 'admin'
};

const mockToken = 'mock-jwt-token';
const mockRefreshToken = 'mock-refresh-token';

// Mock auth hook implementation
const mockAuthHook = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  enableTwoFactor: jest.fn(),
  verifyTwoFactor: jest.fn(),
  disableTwoFactor: jest.fn()
};

// ==================== Test Utilities ====================

const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// ==================== Login Component Tests ====================

describe('Login Component', () => {
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows validation errors for empty fields', async () => {
    renderWithProviders(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ user: mockUser, token: mockToken });
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      login: mockLogin
    }));

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123', false);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    const mockLogin = jest.fn().mockRejectedValue(new Error(errorMessage));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      login: mockLogin
    }));

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('handles remember me checkbox', () => {
    renderWithProviders(<Login />);
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i);
    fireEvent.click(rememberCheckbox);
    
    expect(rememberCheckbox.checked).toBe(true);
  });

  test('displays loading state during login', async () => {
    const mockLogin = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      login: mockLogin,
      loading: true
    }));

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  test('handles 2FA requirement', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ 
      requiresTwoFactor: true,
      userId: '123'
    });
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      login: mockLogin
    }));

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });
  });

  test('handles account lockout after multiple failures', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      login: mockLogin
    }));

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Attempt login 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);
      await waitFor(() => {});
    }
    
    await waitFor(() => {
      expect(screen.getByText(/account temporarily locked/i)).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });
  });
});
// ==================== Register Component Tests ====================

describe('Register Component', () => {
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders registration form correctly', () => {
    renderWithProviders(<Register />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    renderWithProviders(<Register />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    
    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('Password123!');
    expect(confirmInput.value).toBe('Password123!');
  });

  test('validates password strength', async () => {
    renderWithProviders(<Register />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
    
    // Test medium password
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText(/medium strength/i)).toBeInTheDocument();
    
    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText(/strong password/i)).toBeInTheDocument();
  });

  test('validates password confirmation match', async () => {
    renderWithProviders(<Register />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ user: mockUser, token: mockToken });
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      register: mockRegister
    }));

    renderWithProviders(<Register />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('handles registration failure', async () => {
    const errorMessage = 'Email already exists';
    const mockRegister = jest.fn().mockRejectedValue(new Error(errorMessage));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      register: mockRegister
    }));

    renderWithProviders(<Register />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('accepts terms and conditions', () => {
    renderWithProviders(<Register />);
    
    const termsCheckbox = screen.getByLabelText(/i agree to the terms/i);
    fireEvent.click(termsCheckbox);
    
    expect(termsCheckbox.checked).toBe(true);
  });

  test('shows password requirements', () => {
    renderWithProviders(<Register />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.focus(passwordInput);
    
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
    expect(screen.getByText(/one special character/i)).toBeInTheDocument();
  });
});

// ==================== Forgot Password Tests ====================

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders forgot password form correctly', () => {
    renderWithProviders(<ForgotPassword />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  test('handles successful password reset request', async () => {
    const mockForgotPassword = jest.fn().mockResolvedValue({});
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      forgotPassword: mockForgotPassword
    }));

    renderWithProviders(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('john@example.com');
      expect(toast.success).toHaveBeenCalled();
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  test('handles failed password reset request', async () => {
    const errorMessage = 'Email not found';
    const mockForgotPassword = jest.fn().mockRejectedValue(new Error(errorMessage));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      forgotPassword: mockForgotPassword
    }));

    renderWithProviders(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('validates email format', async () => {
    renderWithProviders(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });
});

// ==================== Reset Password Tests ====================

describe('ResetPassword Component', () => {
  const mockToken = 'reset-token-123';
  
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders reset password form correctly', () => {
    renderWithProviders(<ResetPassword token={mockToken} />);
    
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  test('handles successful password reset', async () => {
    const mockResetPassword = jest.fn().mockResolvedValue({});
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      resetPassword: mockResetPassword
    }));

    renderWithProviders(<ResetPassword token={mockToken} />);
    
    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(mockToken, 'NewPassword123!');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('validates password match', async () => {
    renderWithProviders(<ResetPassword token={mockToken} />);
    
    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('validates password strength', async () => {
    renderWithProviders(<ResetPassword token={mockToken} />);
    
    const passwordInput = screen.getByLabelText(/new password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
    });
  });
});
// ==================== Two-Factor Authentication Tests ====================

describe('TwoFactorAuth Component', () => {
  const mockUserId = '123';
  
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders 2FA verification form correctly', () => {
    renderWithProviders(<TwoFactorAuth userId={mockUserId} />);
    
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
    expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument();
  });

  test('handles successful 2FA verification', async () => {
    const mockVerify2FA = jest.fn().mockResolvedValue({ success: true });
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      verifyTwoFactor: mockVerify2FA
    }));

    renderWithProviders(<TwoFactorAuth userId={mockUserId} />);
    
    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(mockVerify2FA).toHaveBeenCalledWith(mockUserId, '123456');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('handles 2FA verification failure', async () => {
    const errorMessage = 'Invalid code';
    const mockVerify2FA = jest.fn().mockRejectedValue(new Error(errorMessage));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      verifyTwoFactor: mockVerify2FA
    }));

    renderWithProviders(<TwoFactorAuth userId={mockUserId} />);
    
    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    fireEvent.change(codeInput, { target: { value: 'wrong' } });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('validates code format (6 digits)', async () => {
    renderWithProviders(<TwoFactorAuth userId={mockUserId} />);
    
    const codeInput = screen.getByLabelText(/verification code/i);
    const verifyButton = screen.getByRole('button', { name: /verify/i });
    
    fireEvent.change(codeInput, { target: { value: '123' } });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/code must be 6 digits/i)).toBeInTheDocument();
    });
  });

  test('handles resend code', async () => {
    const mockResendCode = jest.fn().mockResolvedValue({});
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      resendTwoFactorCode: mockResendCode
    }));

    renderWithProviders(<TwoFactorAuth userId={mockUserId} />);
    
    const resendButton = screen.getByText(/resend code/i);
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(mockResendCode).toHaveBeenCalledWith(mockUserId);
      expect(toast.success).toHaveBeenCalledWith('Code resent');
    });
  });
});

// ==================== Verify Email Tests ====================

describe('VerifyEmail Component', () => {
  const mockToken = 'verify-token-123';
  
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders email verification message', () => {
    renderWithProviders(<VerifyEmail token={mockToken} />);
    
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
  });

  test('handles successful email verification', async () => {
    const mockVerifyEmail = jest.fn().mockResolvedValue({ success: true });
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      verifyEmail: mockVerifyEmail
    }));

    renderWithProviders(<VerifyEmail token={mockToken} />);
    
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith(mockToken);
      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
    });
  });

  test('handles email verification failure', async () => {
    const errorMessage = 'Invalid token';
    const mockVerifyEmail = jest.fn().mockRejectedValue(new Error(errorMessage));
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      verifyEmail: mockVerifyEmail
    }));

    renderWithProviders(<VerifyEmail token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /request new link/i })).toBeInTheDocument();
    });
  });
});

// ==================== Redux Slice Tests ====================

describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  test('should handle initial state', () => {
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      twoFactorRequired: false,
      twoFactorType: null,
      emailVerified: false,
      loginAttempts: 0,
      lockoutUntil: null,
      permissions: []
    });
  });

  test('should handle login.pending', () => {
    store.dispatch({ type: 'auth/login/pending' });
    expect(store.getState().auth.isLoading).toBe(true);
    expect(store.getState().auth.error).toBe(null);
  });

  test('should handle login.fulfilled', () => {
    const payload = {
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    };
    
    store.dispatch({ type: 'auth/login/fulfilled', payload });
    
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.refreshToken).toBe(mockRefreshToken);
    expect(state.loginAttempts).toBe(0);
  });

  test('should handle login.rejected', () => {
    const errorMessage = 'Invalid credentials';
    store.dispatch({ type: 'auth/login/rejected', payload: errorMessage });
    
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.loginAttempts).toBe(1);
  });

  test('should handle register.fulfilled', () => {
    const payload = {
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    };
    
    store.dispatch({ type: 'auth/register/fulfilled', payload });
    
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
  });

  test('should handle logout.fulfilled', () => {
    // First login
    store.dispatch({ 
      type: 'auth/login/fulfilled', 
      payload: { user: mockUser, token: mockToken, refreshToken: mockRefreshToken }
    });
    
    // Then logout
    store.dispatch({ type: 'auth/logout/fulfilled' });
    
    const state = store.getState().auth;
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.refreshToken).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  test('should handle setUser action', () => {
    store.dispatch({ type: 'auth/setUser', payload: mockUser });
    expect(store.getState().auth.user).toEqual(mockUser);
  });

  test('should handle setAuthenticated action', () => {
    store.dispatch({ type: 'auth/setAuthenticated', payload: true });
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  test('should handle setLoading action', () => {
    store.dispatch({ type: 'auth/setLoading', payload: true });
    expect(store.getState().auth.isLoading).toBe(true);
  });

  test('should handle setError action', () => {
    const error = 'Test error';
    store.dispatch({ type: 'auth/setError', payload: error });
    expect(store.getState().auth.error).toBe(error);
  });

  test('should handle clearError action', () => {
    store.dispatch({ type: 'auth/setError', payload: 'Test error' });
    store.dispatch({ type: 'auth/clearError' });
    expect(store.getState().auth.error).toBe(null);
  });

  test('should handle incrementLoginAttempts action', () => {
    store.dispatch({ type: 'auth/incrementLoginAttempts' });
    expect(store.getState().auth.loginAttempts).toBe(1);
    
    store.dispatch({ type: 'auth/incrementLoginAttempts' });
    expect(store.getState().auth.loginAttempts).toBe(2);
  });

  test('should handle resetLoginAttempts action', () => {
    store.dispatch({ type: 'auth/incrementLoginAttempts' });
    store.dispatch({ type: 'auth/incrementLoginAttempts' });
    store.dispatch({ type: 'auth/resetLoginAttempts' });
    expect(store.getState().auth.loginAttempts).toBe(0);
  });

  test('should handle setLockout action', () => {
    const lockoutTime = Date.now() + 3600000;
    store.dispatch({ type: 'auth/setLockout', payload: lockoutTime });
    expect(store.getState().auth.lockoutUntil).toBe(lockoutTime);
  });

  test('should handle set2FARequired action', () => {
    store.dispatch({ type: 'auth/set2FARequired', payload: true });
    expect(store.getState().auth.twoFactorRequired).toBe(true);
  });

  test('should handle set2FAType action', () => {
    store.dispatch({ type: 'auth/set2FAType', payload: 'app' });
    expect(store.getState().auth.twoFactorType).toBe('app');
  });

  test('should handle setEmailVerified action', () => {
    store.dispatch({ type: 'auth/setEmailVerified', payload: true });
    expect(store.getState().auth.emailVerified).toBe(true);
  });

  test('should handle resetAuth action', () => {
    // First set some state
    store.dispatch({ 
      type: 'auth/login/fulfilled', 
      payload: { user: mockUser, token: mockToken, refreshToken: mockRefreshToken }
    });
    
    // Then reset
    store.dispatch({ type: 'auth/resetAuth' });
    
    expect(store.getState().auth).toEqual({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      twoFactorRequired: false,
      twoFactorType: null,
      emailVerified: false,
      loginAttempts: 0,
      lockoutUntil: null,
      permissions: []
    });
  });
});

// ==================== Integration Tests ====================

describe('Auth Integration', () => {
  beforeEach(() => {
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('complete login flow with valid credentials', async () => {
    // Mock successful API response
    mockAxios.onPost('/api/auth/login').reply(200, {
      success: true,
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    });

    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].url).toBe('/api/auth/login');
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({
        email: 'john@example.com',
        password: 'password123'
      });
    });
  });

  test('complete registration flow with valid data', async () => {
    // Mock successful API response
    mockAxios.onPost('/api/auth/register').reply(200, {
      success: true,
      user: mockUser,
      token: mockToken,
      refreshToken: mockRefreshToken
    });

    renderWithProviders(<Register />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].url).toBe('/api/auth/register');
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      });
    });
  });

  test('protected route redirects to login when not authenticated', async () => {
    const ProtectedComponent = () => <div>Protected Content</div>;
    
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <ProtectedComponent />
            </AuthGuard>
          } 
        />
      </Routes>,
      { initialEntries: ['/dashboard'] }
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
    });
  });

  test('persists authentication state after page reload', () => {
    // Setup authenticated state
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    const store = createTestStore({
      auth: {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true
      }
    });
    
    renderWithProviders(<Dashboard />, { store });
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    
    // Cleanup
    localStorage.clear();
  });
});
