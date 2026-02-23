import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import toast from 'react-hot-toast';

// Components to test
import { Profile } from '../../src/pages/user/Profile';
import { Settings } from '../../src/pages/user/Settings';
import { Notifications } from '../../src/pages/user/Notifications';
import { Preferences } from '../../src/pages/user/Preferences';
import { Security } from '../../src/pages/user/Security';
import { Activity } from '../../src/pages/user/Activity';

// Redux slices
import userReducer, {
  fetchProfile,
  updateProfile,
  fetchSettings,
  updateSettings,
  fetchPreferences,
  updatePreferences,
  fetchActivity,
  updatePassword,
  deleteAccount
} from '../../src/store/slices/userSlice';

// Hooks
import { useUser } from '../../src/hooks/useUser';
import { useAuth } from '../../src/hooks/useAuth';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../src/hooks/useUser');
jest.mock('../../src/hooks/useAuth');
jest.mock('axios');

// Mock adapter for axios
const mockAxios = new MockAdapter(axios);

// ==================== Test Setup ====================

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer
    },
    preloadedState: initialState
  });
};

// Mock user data
const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  avatar: 'https://example.com/avatar.jpg',
  coverPhoto: 'https://example.com/cover.jpg',
  bio: 'Test user bio',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  location: 'New York, USA',
  website: 'https://johndoe.com',
  socialLinks: {
    facebook: 'https://facebook.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    instagram: 'https://instagram.com/johndoe',
    github: 'https://github.com/johndoe'
  },
  role: 'user',
  isEmailVerified: true,
  isPhoneVerified: false,
  twoFactorEnabled: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLogin: '2024-01-15T10:30:00.000Z'
};

const mockUserStats = {
  totalEarnings: 1250,
  totalReferrals: 45,
  totalClicks: 12500,
  totalConversions: 98,
  conversionRate: 7.84,
  rank: 42,
  level: 5,
  experience: 2340,
  nextLevelExp: 3000,
  achievements: [
    { id: 'ach1', name: 'First Sale', earnedAt: '2024-01-10' },
    { id: 'ach2', name: '100 Clicks', earnedAt: '2024-01-12' }
  ],
  badges: [
    { id: 'badge1', name: 'Bronze Affiliate', earnedAt: '2024-01-15' }
  ]
};

const mockUserSettings = {
  theme: 'dark',
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    showProfile: true
  }
};

const mockUserPreferences = {
  dashboardLayout: 'grid',
  itemsPerPage: 20,
  defaultView: 'list',
  compactMode: false,
  showTips: true,
  autoSave: true
};

const mockActivity = [
  {
    id: 'act1',
    type: 'login',
    description: 'Logged in from New York, USA',
    timestamp: '2024-01-15T10:30:00.000Z',
    ip: '192.168.1.1',
    device: 'Chrome on Windows'
  },
  {
    id: 'act2',
    type: 'profile_update',
    description: 'Updated profile information',
    timestamp: '2024-01-14T15:45:00.000Z',
    ip: '192.168.1.1',
    device: 'Chrome on Windows'
  },
  {
    id: 'act3',
    type: 'password_change',
    description: 'Changed password',
    timestamp: '2024-01-13T09:20:00.000Z',
    ip: '192.168.1.1',
    device: 'Chrome on Windows'
  }
];

// Mock user hook implementation
const mockUserHook = {
  user: mockUser,
  stats: mockUserStats,
  settings: mockUserSettings,
  preferences: mockUserPreferences,
  activity: mockActivity,
  loading: false,
  error: null,
  fetchProfile: jest.fn(),
  updateProfile: jest.fn(),
  fetchSettings: jest.fn(),
  updateSettings: jest.fn(),
  fetchPreferences: jest.fn(),
  updatePreferences: jest.fn(),
  fetchActivity: jest.fn(),
  updatePassword: jest.fn(),
  deleteAccount: jest.fn(),
  uploadAvatar: jest.fn(),
  removeAvatar: jest.fn(),
  uploadCoverPhoto: jest.fn()
};

const mockAuthHook = {
  user: mockUser,
  isAuthenticated: true,
  logout: jest.fn()
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

// ==================== Profile Component Tests ====================

describe('Profile Component', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('renders profile form with user data', () => {
    renderWithProviders(<Profile />);
    
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.bio)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.location)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.website)).toBeInTheDocument();
  });

  test('displays user stats correctly', () => {
    renderWithProviders(<Profile />);
    
    expect(screen.getByText(`$${mockUserStats.totalEarnings}`)).toBeInTheDocument();
    expect(screen.getByText(mockUserStats.totalReferrals)).toBeInTheDocument();
    expect(screen.getByText(mockUserStats.totalClicks.toLocaleString())).toBeInTheDocument();
    expect(screen.getByText(`${mockUserStats.conversionRate}%`)).toBeInTheDocument();
    expect(screen.getByText(`#${mockUserStats.rank}`)).toBeInTheDocument();
    expect(screen.getByText(`Level ${mockUserStats.level}`)).toBeInTheDocument();
  });

  test('handles profile update successfully', async () => {
    const updatedName = 'John Updated';
    const updatedBio = 'Updated bio text';
    const mockUpdateProfile = jest.fn().mockResolvedValue({ 
      ...mockUser, 
      name: updatedName,
      bio: updatedBio 
    });
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updateProfile: mockUpdateProfile
    }));

    renderWithProviders(<Profile />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const bioInput = screen.getByLabelText(/bio/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.change(nameInput, { target: { value: updatedName } });
    fireEvent.change(bioInput, { target: { value: updatedBio } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: updatedName,
        bio: updatedBio
      });
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    });
  });

  test('handles profile update failure', async () => {
    const errorMessage = 'Failed to update profile';
    const mockUpdateProfile = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updateProfile: mockUpdateProfile
    }));

    renderWithProviders(<Profile />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('handles avatar upload', async () => {
    const mockUploadAvatar = jest.fn().mockResolvedValue({ avatarUrl: 'new-avatar.jpg' });
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      uploadAvatar: mockUploadAvatar
    }));

    renderWithProviders(<Profile />);
    
    const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload avatar/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(file);
      expect(toast.success).toHaveBeenCalledWith('Avatar uploaded successfully');
    });
  });

  test('handles avatar removal', async () => {
    const mockRemoveAvatar = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      removeAvatar: mockRemoveAvatar
    }));

    renderWithProviders(<Profile />);
    
    const removeButton = screen.getByRole('button', { name: /remove avatar/i });
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(mockRemoveAvatar).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Avatar removed successfully');
    });
  });

  test('handles cover photo upload', async () => {
    const mockUploadCover = jest.fn().mockResolvedValue({ coverUrl: 'new-cover.jpg' });
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      uploadCoverPhoto: mockUploadCover
    }));

    renderWithProviders(<Profile />);
    
    const file = new File(['dummy content'], 'cover.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload cover/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUploadCover).toHaveBeenCalledWith(file);
      expect(toast.success).toHaveBeenCalledWith('Cover photo uploaded successfully');
    });
  });

  test('validates email format', async () => {
    renderWithProviders(<Profile />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  test('validates phone number format', async () => {
    renderWithProviders(<Profile />);
    
    const phoneInput = screen.getByLabelText(/phone/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
    });
  });

  test('displays loading state', () => {
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      loading: true
    }));

    renderWithProviders(<Profile />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
// ==================== Settings Component Tests ====================

describe('Settings Component', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    jest.clearAllMocks();
  });

  test('renders settings form with user settings', () => {
    renderWithProviders(<Settings />);
    
    expect(screen.getByLabelText(/theme/i)).toHaveValue(mockUserSettings.theme);
    expect(screen.getByLabelText(/language/i)).toHaveValue(mockUserSettings.language);
    expect(screen.getByLabelText(/timezone/i)).toHaveValue(mockUserSettings.timezone);
    expect(screen.getByLabelText(/date format/i)).toHaveValue(mockUserSettings.dateFormat);
    expect(screen.getByLabelText(/time format/i)).toHaveValue(mockUserSettings.timeFormat);
    expect(screen.getByLabelText(/currency/i)).toHaveValue(mockUserSettings.currency);
  });

  test('handles settings update successfully', async () => {
    const updatedTheme = 'light';
    const updatedLanguage = 'es';
    const mockUpdateSettings = jest.fn().mockResolvedValue({
      ...mockUserSettings,
      theme: updatedTheme,
      language: updatedLanguage
    });
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updateSettings: mockUpdateSettings
    }));

    renderWithProviders(<Settings />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    const languageSelect = screen.getByLabelText(/language/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    
    fireEvent.change(themeSelect, { target: { value: updatedTheme } });
    fireEvent.change(languageSelect, { target: { value: updatedLanguage } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        theme: updatedTheme,
        language: updatedLanguage
      });
      expect(toast.success).toHaveBeenCalledWith('Settings updated successfully');
    });
  });

  test('handles settings update failure', async () => {
    const errorMessage = 'Failed to update settings';
    const mockUpdateSettings = jest.fn().mockRejectedValue(new Error(errorMessage));
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updateSettings: mockUpdateSettings
    }));

    renderWithProviders(<Settings />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  test('toggles notification settings', () => {
    renderWithProviders(<Settings />);
    
    const emailToggle = screen.getByLabelText(/email notifications/i);
    const pushToggle = screen.getByLabelText(/push notifications/i);
    const smsToggle = screen.getByLabelText(/sms notifications/i);
    
    fireEvent.click(emailToggle);
    fireEvent.click(pushToggle);
    fireEvent.click(smsToggle);
    
    expect(emailToggle.checked).toBe(!mockUserSettings.notifications.email);
    expect(pushToggle.checked).toBe(!mockUserSettings.notifications.push);
    expect(smsToggle.checked).toBe(!mockUserSettings.notifications.sms);
  });

  test('toggles privacy settings', () => {
    renderWithProviders(<Settings />);
    
    const showEmailToggle = screen.getByLabelText(/show email/i);
    const showPhoneToggle = screen.getByLabelText(/show phone/i);
    const showProfileToggle = screen.getByLabelText(/show profile/i);
    
    fireEvent.click(showEmailToggle);
    fireEvent.click(showPhoneToggle);
    fireEvent.click(showProfileToggle);
    
    expect(showEmailToggle.checked).toBe(!mockUserSettings.privacy.showEmail);
    expect(showPhoneToggle.checked).toBe(!mockUserSettings.privacy.showPhone);
    expect(showProfileToggle.checked).toBe(!mockUserSettings.privacy.showProfile);
  });

  test('resets settings to default', async () => {
    const mockResetSettings = jest.fn().mockResolvedValue(mockUserSettings);
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      resetSettings: mockResetSettings
    }));

    renderWithProviders(<Settings />);
    
    const resetButton = screen.getByRole('button', { name: /reset to default/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(mockResetSettings).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Settings reset to default');
    });
  });
});

// ==================== Notifications Component Tests ====================

describe('Notifications Component', () => {
  const mockNotifications = [
    {
      id: 'notif1',
      type: 'info',
      title: 'Welcome!',
      message: 'Welcome to the platform',
      read: false,
      createdAt: '2024-01-15T10:30:00.000Z'
    },
    {
      id: 'notif2',
      type: 'success',
      title: 'Earning',
      message: 'You earned $25 from a referral',
      read: false,
      createdAt: '2024-01-14T15:45:00.000Z'
    },
    {
      id: 'notif3',
      type: 'warning',
      title: 'Verification',
      message: 'Please verify your email',
      read: true,
      createdAt: '2024-01-13T09:20:00.000Z'
    }
  ];

  beforeEach(() => {
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      notifications: mockNotifications
    }));
    jest.clearAllMocks();
  });

  test('renders notifications list', () => {
    renderWithProviders(<Notifications />);
    
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('You earned $25 from a referral')).toBeInTheDocument();
    expect(screen.getByText('Please verify your email')).toBeInTheDocument();
  });

  test('displays unread count', () => {
    renderWithProviders(<Notifications />);
    
    expect(screen.getByText('2 unread')).toBeInTheDocument();
  });

  test('marks notification as read', async () => {
    const mockMarkAsRead = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      markNotificationAsRead: mockMarkAsRead
    }));

    renderWithProviders(<Notifications />);
    
    const notificationItem = screen.getByText('Welcome!').closest('div');
    fireEvent.click(notificationItem);
    
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif1');
    });
  });

  test('marks all notifications as read', async () => {
    const mockMarkAllAsRead = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      markAllNotificationsAsRead: mockMarkAllAsRead
    }));

    renderWithProviders(<Notifications />);
    
    const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllButton);
    
    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('All notifications marked as read');
    });
  });

  test('deletes notification', async () => {
    const mockDeleteNotification = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      deleteNotification: mockDeleteNotification
    }));

    renderWithProviders(<Notifications />);
    
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteNotification).toHaveBeenCalledWith('notif1');
      expect(toast.success).toHaveBeenCalledWith('Notification deleted');
    });
  });

  test('clears all notifications', async () => {
    const mockClearAll = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      clearAllNotifications: mockClearAll
    }));

    renderWithProviders(<Notifications />);
    
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllButton);
    
    await waitFor(() => {
      expect(mockClearAll).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('All notifications cleared');
    });
  });

  test('filters notifications by type', () => {
    renderWithProviders(<Notifications />);
    
    const filterSelect = screen.getByLabelText(/filter by type/i);
    fireEvent.change(filterSelect, { target: { value: 'success' } });
    
    expect(screen.getByText('You earned $25 from a referral')).toBeInTheDocument();
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  test('loads more notifications on scroll', async () => {
    const mockLoadMore = jest.fn().mockResolvedValue([...mockNotifications]);
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      loadMoreNotifications: mockLoadMore
    }));

    renderWithProviders(<Notifications />);
    
    const scrollableDiv = screen.getByTestId('notifications-list');
    fireEvent.scroll(scrollableDiv, { target: { scrollY: 1000 } });
    
    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalled();
    });
  });

  test('displays empty state when no notifications', () => {
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      notifications: []
    }));

    renderWithProviders(<Notifications />);
    
    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });
});

// ==================== Preferences Component Tests ====================

describe('Preferences Component', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    jest.clearAllMocks();
  });

  test('renders preferences form with user preferences', () => {
    renderWithProviders(<Preferences />);
    
    expect(screen.getByLabelText(/dashboard layout/i)).toHaveValue(mockUserPreferences.dashboardLayout);
    expect(screen.getByLabelText(/items per page/i)).toHaveValue(mockUserPreferences.itemsPerPage.toString());
    expect(screen.getByLabelText(/default view/i)).toHaveValue(mockUserPreferences.defaultView);
    expect(screen.getByLabelText(/compact mode/i)).toBeChecked();
  });

  test('handles preferences update successfully', async () => {
    const updatedLayout = 'list';
    const updatedItemsPerPage = 50;
    const mockUpdatePreferences = jest.fn().mockResolvedValue({
      ...mockUserPreferences,
      dashboardLayout: updatedLayout,
      itemsPerPage: updatedItemsPerPage
    });
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updatePreferences: mockUpdatePreferences
    }));

    renderWithProviders(<Preferences />);
    
    const layoutSelect = screen.getByLabelText(/dashboard layout/i);
    const itemsPerPageInput = screen.getByLabelText(/items per page/i);
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    
    fireEvent.change(layoutSelect, { target: { value: updatedLayout } });
    fireEvent.change(itemsPerPageInput, { target: { value: updatedItemsPerPage.toString() } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        dashboardLayout: updatedLayout,
        itemsPerPage: updatedItemsPerPage
      });
      expect(toast.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  test('toggles compact mode', () => {
    renderWithProviders(<Preferences />);
    
    const compactModeToggle = screen.getByLabelText(/compact mode/i);
    fireEvent.click(compactModeToggle);
    
    expect(compactModeToggle.checked).toBe(!mockUserPreferences.compactMode);
  });

  test('toggles show tips', () => {
    renderWithProviders(<Preferences />);
    
    const showTipsToggle = screen.getByLabelText(/show tips/i);
    fireEvent.click(showTipsToggle);
    
    expect(showTipsToggle.checked).toBe(!mockUserPreferences.showTips);
  });

  test('toggles auto save', () => {
    renderWithProviders(<Preferences />);
    
    const autoSaveToggle = screen.getByLabelText(/auto save/i);
    fireEvent.click(autoSaveToggle);
    
    ex
      pect(autoSaveToggle.checked).toBe(!mockUserPreferences.autoSave);
  });
  // ==================== Security Component Tests ====================

describe('Security Component', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    jest.clearAllMocks();
  });

  test('renders security form', () => {
    renderWithProviders(<Security />);
    
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
  });

  test('handles password change successfully', async () => {
    const mockUpdatePassword = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      updatePassword: mockUpdatePassword
    }));

    renderWithProviders(<Security />);
    
    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm password/i);
    const changeButton = screen.getByRole('button', { name: /change password/i });
    
    fireEvent.change(currentPassword, { target: { value: 'oldPass123!' } });
    fireEvent.change(newPassword, { target: { value: 'newPass123!' } });
    fireEvent.change(confirmPassword, { target: { value: 'newPass123!' } });
    fireEvent.click(changeButton);
    
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        currentPassword: 'oldPass123!',
        newPassword: 'newPass123!'
      });
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully');
    });
  });

  test('validates password match', async () => {
    renderWithProviders(<Security />);
    
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm password/i);
    const changeButton = screen.getByRole('button', { name: /change password/i });
    
    fireEvent.change(newPassword, { target: { value: 'newPass123!' } });
    fireEvent.change(confirmPassword, { target: { value: 'different123!' } });
    fireEvent.click(changeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('validates password strength', async () => {
    renderWithProviders(<Security />);
    
    const newPassword = screen.getByLabelText(/new password/i);
    
    fireEvent.change(newPassword, { target: { value: 'weak' } });
    
    expect(screen.getByText(/password too weak/i)).toBeInTheDocument();
  });

  test('enables 2FA', async () => {
    const mockEnable2FA = jest.fn().mockResolvedValue({ 
      secret: 'ABCDEFGH',
      qrCode: 'data:image/png;base64,...'
    });
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      enableTwoFactor: mockEnable2FA
    }));

    renderWithProviders(<Security />);
    
    const enable2FAButton = screen.getByRole('button', { name: /enable 2fa/i });
    fireEvent.click(enable2FAButton);
    
    await waitFor(() => {
      expect(mockEnable2FA).toHaveBeenCalled();
      expect(screen.getByText(/scan qr code/i)).toBeInTheDocument();
    });
  });

  test('disables 2FA', async () => {
    const mockDisable2FA = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      disableTwoFactor: mockDisable2FA
    }));

    renderWithProviders(<Security />);
    
    const disable2FAButton = screen.getByRole('button', { name: /disable 2fa/i });
    fireEvent.click(disable2FAButton);
    
    await waitFor(() => {
      expect(mockDisable2FA).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('2FA disabled successfully');
    });
  });

  test('handles account deletion', async () => {
    const mockDeleteAccount = jest.fn().mockResolvedValue({});
    const mockLogout = jest.fn();
    
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      deleteAccount: mockDeleteAccount
    }));
    
    useAuth.mockImplementation(() => ({
      ...mockAuthHook,
      logout: mockLogout
    }));

    window.confirm = jest.fn(() => true);

    renderWithProviders(<Security />);
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Account deleted successfully');
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  test('shows recent login activity', () => {
    renderWithProviders(<Security />);
    
    expect(screen.getByText(/new york/i)).toBeInTheDocument();
    expect(screen.getByText(/chrome on windows/i)).toBeInTheDocument();
  });

  test('shows active sessions', () => {
    renderWithProviders(<Security />);
    
    expect(screen.getByText(/current session/i)).toBeInTheDocument();
  });
});

// ==================== Activity Component Tests ====================

describe('Activity Component', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    jest.clearAllMocks();
  });

  test('renders activity list', () => {
    renderWithProviders(<Activity />);
    
    expect(screen.getByText(/logged in from new york/i)).toBeInTheDocument();
    expect(screen.getByText(/updated profile/i)).toBeInTheDocument();
    expect(screen.getByText(/changed password/i)).toBeInTheDocument();
  });

  test('filters activities by type', () => {
    renderWithProviders(<Activity />);
    
    const filterSelect = screen.getByLabelText(/filter by type/i);
    fireEvent.change(filterSelect, { target: { value: 'login' } });
    
    expect(screen.getByText(/logged in from new york/i)).toBeInTheDocument();
    expect(screen.queryByText(/updated profile/i)).not.toBeInTheDocument();
  });

  test('filters activities by date range', () => {
    renderWithProviders(<Activity />);
    
    const startDate = screen.getByLabelText(/start date/i);
    const endDate = screen.getByLabelText(/end date/i);
    
    fireEvent.change(startDate, { target: { value: '2024-01-14' } });
    fireEvent.change(endDate, { target: { value: '2024-01-15' } });
    
    expect(screen.getByText(/logged in from new york/i)).toBeInTheDocument();
    expect(screen.queryByText(/changed password/i)).not.toBeInTheDocument();
  });

  test('exports activity log', async () => {
    const mockExport = jest.fn().mockResolvedValue({});
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      exportActivity: mockExport
    }));

    renderWithProviders(<Activity />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockExport).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Activity log exported');
    });
  });

  test('loads more activities on scroll', async () => {
    const mockLoadMore = jest.fn().mockResolvedValue([...mockActivity]);
    useUser.mockImplementation(() => ({
      ...mockUserHook,
      loadMoreActivity: mockLoadMore
    }));

    renderWithProviders(<Activity />);
    
    const scrollableDiv = screen.getByTestId('activity-list');
    fireEvent.scroll(scrollableDiv, { target: { scrollY: 1000 } });
    
    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalled();
    });
  });
});

// ==================== Redux Slice Tests ====================

describe('User Slice', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  test('should handle initial state', () => {
    expect(store.getState().user).toEqual({
      profile: null,
      settings: null,
      preferences: null,
      stats: null,
      activity: [],
      notifications: [],
      loading: false,
      error: null,
      lastUpdated: {}
    });
  });

  test('should handle fetchProfile.pending', () => {
    store.dispatch({ type: 'user/fetchProfile/pending' });
    expect(store.getState().user.loading).toBe(true);
    expect(store.getState().user.error).toBe(null);
  });

  test('should handle fetchProfile.fulfilled', () => {
    store.dispatch({ type: 'user/fetchProfile/fulfilled', payload: mockUser });
    
    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.profile).toEqual(mockUser);
    expect(state.lastUpdated.profile).toBeDefined();
  });

  test('should handle fetchProfile.rejected', () => {
    const errorMessage = 'Failed to fetch profile';
    store.dispatch({ type: 'user/fetchProfile/rejected', payload: errorMessage });
    
    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });

  test('should handle updateProfile.fulfilled', () => {
    const updatedProfile = { ...mockUser, name: 'Updated Name' };
    store.dispatch({ type: 'user/updateProfile/fulfilled', payload: updatedProfile });
    
    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.profile).toEqual(updatedProfile);
  });

  test('should handle fetchSettings.fulfilled', () => {
    store.dispatch({ type: 'user/fetchSettings/fulfilled', payload: mockUserSettings });
    
    const state = store.getState().user;
    expect(state.settings).toEqual(mockUserSettings);
  });

  test('should handle updateSettings.fulfilled', () => {
    const updatedSettings = { ...mockUserSettings, theme: 'dark' };
    store.dispatch({ type: 'user/updateSettings/fulfilled', payload: updatedSettings });
    
    const state = store.getState().user;
    expect(state.settings).toEqual(updatedSettings);
  });

  test('should handle fetchPreferences.fulfilled', () => {
    store.dispatch({ type: 'user/fetchPreferences/fulfilled', payload: mockUserPreferences });
    
    const state = store.getState().user;
    expect(state.preferences).toEqual(mockUserPreferences);
  });

  test('should handle updatePreferences.fulfilled', () => {
    const updatedPreferences = { ...mockUserPreferences, compactMode: true };
    store.dispatch({ type: 'user/updatePreferences/fulfilled', payload: updatedPreferences });
    
    const state = store.getState().user;
    expect(state.preferences).toEqual(updatedPreferences);
  });

  test('should handle fetchActivity.fulfilled', () => {
    store.dispatch({ type: 'user/fetchActivity/fulfilled', payload: mockActivity });
    
    const state = store.getState().user;
    expect(state.activity).toEqual(mockActivity);
  });

  test('should handle updatePassword.fulfilled', () => {
    store.dispatch({ type: 'user/updatePassword/fulfilled' });
    
    expect(store.getState().user.loading).toBe(false);
  });

  test('should handle updatePassword.rejected', () => {
    const errorMessage = 'Failed to update password';
    store.dispatch({ type: 'user/updatePassword/rejected', payload: errorMessage });
    
    expect(store.getState().user.error).toBe(errorMessage);
  });

  test('should handle deleteAccount.fulfilled', () => {
    store.dispatch({ type: 'user/deleteAccount/fulfilled' });
    
    const state = store.getState().user;
    expect(state.profile).toBe(null);
    expect(state.settings).toBe(null);
    expect(state.preferences).toBe(null);
  });

  test('should handle clearError action', () => {
    store.dispatch({ type: 'user/setError', payload: 'Test error' });
    store.dispatch({ type: 'user/clearError' });
    
    expect(store.getState().user.error).toBe(null);
  });
});

// ==================== Integration Tests ====================

describe('User Integration', () => {
  beforeEach(() => {
    useUser.mockImplementation(() => ({ ...mockUserHook }));
    useAuth.mockImplementation(() => ({ ...mockAuthHook }));
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('complete profile update flow', async () => {
    // Mock successful API response
    mockAxios.onPut('/api/user/profile').reply(200, {
      success: true,
      user: { ...mockUser, name: 'Updated Name' }
    });

    renderWithProviders(<Profile />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockAxios.history.put.length).toBe(1);
      expect(mockAxios.history.put[0].url).toBe('/api/user/profile');
      expect(JSON.parse(mockAxios.history.put[0].data)).toEqual({
        name: 'Updated Name'
      });
    });
  });

  test('complete settings update flow', async () => {
    // Mock successful API response
    mockAxios.onPut('/api/user/settings').reply(200, {
      success: true,
      settings: { ...mockUserSettings, theme: 'dark' }
    });

    renderWithProviders(<Settings />);
    
    const themeSelect = screen.getByLabelText(/theme/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockAxios.history.put.length).toBe(1);
      expect(mockAxios.history.put[0].url).toBe('/api/user/settings');
    });
  });

  test('complete password change flow', async () => {
    // Mock successful API response
    mockAxios.onPost('/api/user/change-password').reply(200, {
      success: true
    });

    renderWithProviders(<Security />);
    
    const currentPassword = screen.getByLabelText(/current password/i);
    const newPassword = screen.getByLabelText(/new password/i);
    const confirmPassword = screen.getByLabelText(/confirm password/i);
    const changeButton = screen.getByRole('button', { name: /change password/i });
    
    fireEvent.change(currentPassword, { target: { value: 'oldPass123!' } });
    fireEvent.change(newPassword, { target: { value: 'newPass123!' } });
    fireEvent.change(confirmPassword, { target: { value: 'newPass123!' } });
    fireEvent.click(changeButton);
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].url).toBe('/api/user/change-password');
    });
  });

  test('avatar upload flow', async () => {
    // Mock successful API response
    mockAxios.onPost('/api/user/avatar').reply(200, {
      success: true,
      avatarUrl: 'new-avatar.jpg'
    });

    renderWithProviders(<Profile />);
    
    const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/upload avatar/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].url).toBe('/api/user/avatar');
    });
  });
});
});
