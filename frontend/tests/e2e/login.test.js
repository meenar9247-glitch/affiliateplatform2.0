import { Selector, ClientFunction } from 'testcafe';
import { waitForReact } from 'testcrave-react';

// ==================== Test Configuration ====================

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// ==================== Selectors ====================

// Page elements
const getLoginPage = () => Selector('[data-testid="login-page"]');
const getEmailInput = () => Selector('[data-testid="email-input"]');
const getPasswordInput = () => Selector('[data-testid="password-input"]');
const getLoginButton = () => Selector('[data-testid="login-button"]');
const getRememberMeCheckbox = () => Selector('[data-testid="remember-me"]');
const getForgotPasswordLink = () => Selector('[data-testid="forgot-password-link"]');
const getRegisterLink = () => Selector('[data-testid="register-link"]');

// Error messages
const getEmailError = () => Selector('[data-testid="email-error"]');
const getPasswordError = () => Selector('[data-testid="password-error"]');
const getGeneralError = () => Selector('[data-testid="error-message"]');
const getSuccessMessage = () => Selector('[data-testid="success-message"]');

// Loading state
const getLoadingSpinner = () => Selector('[data-testid="loading-spinner"]');

// Dashboard elements
const getDashboardPage = () => Selector('[data-testid="dashboard-page"]');
const getUserMenu = () => Selector('[data-testid="user-menu"]');
const getUserName = () => Selector('[data-testid="user-name"]');

// Navigation helpers
const getCurrentUrl = ClientFunction(() => window.location.href);
const getLocalStorageItem = ClientFunction((key) => localStorage.getItem(key));
const getSessionStorageItem = ClientFunction((key) => sessionStorage.getItem(key));

// ==================== Test Data ====================

const validUser = {
  email: 'john@example.com',
  password: 'Password123!',
  name: 'John Doe'
};

const invalidUser = {
  email: 'invalid@example.com',
  password: 'wrongpassword'
};

const unverifiedUser = {
  email: 'unverified@example.com',
  password: 'Password123!'
};

const lockedUser = {
  email: 'locked@example.com',
  password: 'Password123!'
};

// ==================== Fixtures ====================

fixture`Login Page Tests`
  .page`${BASE_URL}/login`
  .beforeEach(async (t) => {
    await waitForReact();
    await t.maximizeWindow();
  });

// ==================== Initial Page Load Tests ====================

test('Should display login page correctly', async (t) => {
  await t
    .expect(getLoginPage().exists).ok()
    .expect(getEmailInput().exists).ok()
    .expect(getPasswordInput().exists).ok()
    .expect(getLoginButton().exists).ok()
    .expect(getRememberMeCheckbox().exists).ok()
    .expect(getForgotPasswordLink().exists).ok()
    .expect(getRegisterLink().exists).ok();
});

test('Should have correct page title', async (t) => {
  await t
    .expect(Selector('title').innerText).eql('Login | Affiliate Platform');
});

test('Should have empty form fields initially', async (t) => {
  await t
    .expect(getEmailInput().value).eql('')
    .expect(getPasswordInput().value).eql('')
    .expect(getRememberMeCheckbox().checked).notOk();
});

test('Should have proper input attributes', async (t) => {
  await t
    .expect(getEmailInput().getAttribute('type')).eql('email')
    .expect(getEmailInput().getAttribute('required')).ok()
    .expect(getPasswordInput().getAttribute('type')).eql('password')
    .expect(getPasswordInput().getAttribute('required')).ok()
    .expect(getLoginButton().getAttribute('type')).eql('submit');
});

test('Should have correct placeholder texts', async (t) => {
  await t
    .expect(getEmailInput().getAttribute('placeholder')).eql('Enter your email')
    .expect(getPasswordInput().getAttribute('placeholder')).eql('Enter your password');
});

test('Should have working navigation links', async (t) => {
  await t
    .click(getForgotPasswordLink())
    .expect(getCurrentUrl()).contains('/forgot-password')
    .navigateTo(`${BASE_URL}/login`)
    .click(getRegisterLink())
    .expect(getCurrentUrl()).contains('/register');
});

// ==================== Form Interaction Tests ====================

test('Should allow typing in email and password fields', async (t) => {
  await t
    .typeText(getEmailInput(), 'test@example.com')
    .typeText(getPasswordInput(), 'password123')
    .expect(getEmailInput().value).eql('test@example.com')
    .expect(getPasswordInput().value).eql('password123');
});

test('Should toggle remember me checkbox', async (t) => {
  await t
    .click(getRememberMeCheckbox())
    .expect(getRememberMeCheckbox().checked).ok()
    .click(getRememberMeCheckbox())
    .expect(getRememberMeCheckbox().checked).notOk();
});

test('Should show password when show/hide toggle is clicked', async (t) => {
  const showPasswordButton = Selector('[data-testid="show-password"]');
  
  await t
    .typeText(getPasswordInput(), 'secretpassword')
    .click(showPasswordButton)
    .expect(getPasswordInput().getAttribute('type')).eql('text')
    .click(showPasswordButton)
    .expect(getPasswordInput().getAttribute('type')).eql('password');
});

test('Should clear form fields when reset button is clicked', async (t) => {
  const resetButton = Selector('[data-testid="reset-button"]');
  
  await t
    .typeText(getEmailInput(), 'test@example.com')
    .typeText(getPasswordInput(), 'password123')
    .click(resetButton)
    .expect(getEmailInput().value).eql('')
    .expect(getPasswordInput().value).eql('');
});

test('Should handle copy-paste in form fields', async (t) => {
  await t
    .typeText(getEmailInput(), 'test@example.com')
    .pressKey('ctrl+a ctrl+c')
    .click(getPasswordInput())
    .pressKey('ctrl+v')
    .expect(getPasswordInput().value).eql('test@example.com');
});

test('Should handle tab key navigation', async (t) => {
  await t
    .click(getEmailInput())
    .pressKey('tab')
    .expect(getPasswordInput().focused).ok()
    .pressKey('tab')
    .expect(getRememberMeCheckbox().focused).ok()
    .pressKey('tab')
    .expect(getLoginButton().focused).ok();
});
// ==================== Validation Tests ====================

test('Should show error when submitting empty form', async (t) => {
  await t
    .click(getLoginButton())
    .expect(getEmailError().exists).ok()
    .expect(getEmailError().innerText).contains('required')
    .expect(getPasswordError().exists).ok()
    .expect(getPasswordError().innerText).contains('required');
});

test('Should validate email format', async (t) => {
  await t
    .typeText(getEmailInput(), 'invalid-email')
    .click(getLoginButton())
    .expect(getEmailError().exists).ok()
    .expect(getEmailError().innerText).contains('valid email');
});

test('Should validate minimum password length', async (t) => {
  await t
    .typeText(getEmailInput(), 'test@example.com')
    .typeText(getPasswordInput(), 'short')
    .click(getLoginButton())
    .expect(getPasswordError().exists).ok()
    .expect(getPasswordError().innerText).contains('at least 8 characters');
});

test('Should clear validation errors when typing', async (t) => {
  await t
    .click(getLoginButton())
    .expect(getEmailError().exists).ok()
    .typeText(getEmailInput(), 't')
    .expect(getEmailError().exists).notOk()
    .typeText(getPasswordInput(), 'p')
    .expect(getPasswordError().exists).notOk();
});

test('Should validate multiple fields simultaneously', async (t) => {
  await t
    .typeText(getEmailInput(), 'invalid')
    .typeText(getPasswordInput(), 'short')
    .click(getLoginButton())
    .expect(getEmailError().exists).ok()
    .expect(getPasswordError().exists).ok();
});

// ==================== Error Handling Tests ====================

test('Should show error for invalid credentials', async (t) => {
  // Mock API response for invalid credentials
  await t.addRequestHooks(createMockResponse('/api/auth/login', 401, {
    success: false,
    message: 'Invalid email or password'
  }));

  await t
    .typeText(getEmailInput(), invalidUser.email)
    .typeText(getPasswordInput(), invalidUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('Invalid email or password');

  await t.removeRequestHooks();
});

test('Should show error for unverified email', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 403, {
    success: false,
    message: 'Please verify your email first',
    requiresVerification: true
  }));

  await t
    .typeText(getEmailInput(), unverifiedUser.email)
    .typeText(getPasswordInput(), unverifiedUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('verify your email')
    .expect(Selector('[data-testid="resend-verification"]').exists).ok();

  await t.removeRequestHooks();
});

test('Should show account locked message after multiple attempts', async (t) => {
  // Mock rate limit response
  await t.addRequestHooks(createMockResponse('/api/auth/login', 429, {
    success: false,
    message: 'Too many attempts. Account locked for 30 minutes',
    lockoutDuration: 1800000
  }));

  await t
    .typeText(getEmailInput(), lockedUser.email)
    .typeText(getPasswordInput(), lockedUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('locked')
    .expect(getLoginButton().hasAttribute('disabled')).ok();

  await t.removeRequestHooks();
});

test('Should show network error when API is unavailable', async (t) => {
  // Simulate network error
  await t.addRequestHooks(createMockResponse('/api/auth/login', 0));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('Network error');

  await t.removeRequestHooks();
});

test('Should show server error message', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 500, {
    success: false,
    message: 'Internal server error'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('server error');

  await t.removeRequestHooks();
});

test('Should handle timeout errors gracefully', async (t) => {
  // Simulate timeout by delaying response
  await t.addRequestHooks(createDelayedResponse('/api/auth/login', 5000));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getLoadingSpinner().exists).ok()
    .wait(6000)
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('timeout');

  await t.removeRequestHooks();
});

// ==================== Rate Limiting Tests ====================

test('Should show rate limit warning after 5 failed attempts', async (t) => {
  const failedAttempts = 5;
  
  for (let i = 0; i < failedAttempts; i++) {
    await t.addRequestHooks(createMockResponse('/api/auth/login', 401, {
      success: false,
      message: 'Invalid credentials',
      attemptsRemaining: 5 - i - 1
    }));

    await t
      .typeText(getEmailInput(), invalidUser.email)
      .typeText(getPasswordInput(), invalidUser.password)
      .click(getLoginButton())
      .wait(500);

    await t.removeRequestHooks();
  }

  // Last attempt should trigger lockout
  await t.addRequestHooks(createMockResponse('/api/auth/login', 429, {
    success: false,
    message: 'Too many attempts. Account locked for 30 minutes',
    lockoutDuration: 1800000
  }));

  await t
    .typeText(getEmailInput(), invalidUser.email)
    .typeText(getPasswordInput(), invalidUser.password)
    .click(getLoginButton())
    .expect(getGeneralError().exists).ok()
    .expect(getGeneralError().innerText).contains('locked');

  await t.removeRequestHooks();
});

test('Should show remaining attempts counter', async (t) => {
  const attemptsCounter = Selector('[data-testid="attempts-remaining"]');
  
  await t.addRequestHooks(createMockResponse('/api/auth/login', 401, {
    success: false,
    message: 'Invalid credentials',
    attemptsRemaining: 4
  }));

  await t
    .typeText(getEmailInput(), invalidUser.email)
    .typeText(getPasswordInput(), invalidUser.password)
    .click(getLoginButton())
    .expect(attemptsCounter.exists).ok()
    .expect(attemptsCounter.innerText).contains('4 attempts remaining');

  await t.removeRequestHooks();
});
// ==================== Successful Login Tests ====================

test('Should successfully login with valid credentials', async (t) => {
  // Mock successful login response
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token',
    refreshToken: 'valid-refresh-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok({ timeout: 5000 })
    .expect(getUserName().innerText).contains(validUser.name);

  await t.removeRequestHooks();
});

test('Should redirect to dashboard after successful login', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getCurrentUrl()).contains('/dashboard');

  await t.removeRequestHooks();
});

test('Should store token in localStorage when "Remember Me" is checked', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token',
    refreshToken: 'valid-refresh-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getRememberMeCheckbox())
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok()
    .expect(getLocalStorageItem('token')).eql('valid-jwt-token')
    .expect(getLocalStorageItem('refreshToken')).eql('valid-refresh-token')
    .expect(getLocalStorageItem('user')).notEql(null);

  await t.removeRequestHooks();
});

test('Should store token in sessionStorage when "Remember Me" is unchecked', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok()
    .expect(getSessionStorageItem('token')).eql('valid-jwt-token')
    .expect(getLocalStorageItem('token')).eql(null);

  await t.removeRequestHooks();
});

test('Should redirect to originally requested page after login', async (t) => {
  // Navigate to protected page first
  await t.navigateTo(`${BASE_URL}/dashboard`);
  
  // Should be redirected to login with return URL
  await t
    .expect(getCurrentUrl()).contains('/login')
    .expect(Selector('[data-testid="return-url"]').getAttribute('value'))
    .eql('/dashboard');

  // Login
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getCurrentUrl()).contains('/dashboard');

  await t.removeRequestHooks();
});

// ==================== 2FA Tests ====================

test('Should show 2FA verification when enabled', async (t) => {
  const get2FAPage = () => Selector('[data-testid="2fa-page"]');
  const get2FACodeInput = () => Selector('[data-testid="2fa-code-input"]');
  const get2FASubmitButton = () => Selector('[data-testid="2fa-submit-button"]');

  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    requiresTwoFactor: true,
    userId: '123'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(get2FAPage().exists).ok()
    .expect(get2FACodeInput().exists).ok();

  await t.removeRequestHooks();
});

test('Should successfully verify 2FA code', async (t) => {
  const get2FAPage = () => Selector('[data-testid="2fa-page"]');
  const get2FACodeInput = () => Selector('[data-testid="2fa-code-input"]');
  const get2FASubmitButton = () => Selector('[data-testid="2fa-submit-button"]');

  // First request - login with 2FA requirement
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    requiresTwoFactor: true,
    userId: '123'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(get2FAPage().exists).ok();

  await t.removeRequestHooks();

  // Second request - verify 2FA
  await t.addRequestHooks(createMockResponse('/api/auth/2fa/verify', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token'
  }));

  await t
    .typeText(get2FACodeInput(), '123456')
    .click(get2FASubmitButton())
    .expect(getDashboardPage().exists).ok();

  await t.removeRequestHooks();
});

// ==================== Session Management Tests ====================

test('Should maintain session across page reload', async (t) => {
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token',
    refreshToken: 'valid-refresh-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getRememberMeCheckbox())
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok();

  // Reload page
  await t.eval(() => location.reload());
  
  // Should still be on dashboard
  await t
    .expect(getDashboardPage().exists).ok()
    .expect(getUserName().innerText).contains(validUser.name);

  await t.removeRequestHooks();
});

test('Should logout after session timeout', async (t) => {
  // Set short session timeout
  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token',
    sessionTimeout: 1000 // 1 second
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok();

  // Wait for session to expire
  await t.wait(2000);

  // Try to access dashboard
  await t.navigateTo(`${BASE_URL}/dashboard`);
  
  // Should be redirected to login
  await t
    .expect(getLoginPage().exists).ok()
    .expect(getCurrentUrl()).contains('/login');

  await t.removeRequestHooks();
});

test('Should logout when logout button is clicked', async (t) => {
  const getLogoutButton = () => Selector('[data-testid="logout-button"]');

  await t.addRequestHooks(createMockResponse('/api/auth/login', 200, {
    success: true,
    user: validUser,
    token: 'valid-jwt-token'
  }));

  await t
    .typeText(getEmailInput(), validUser.email)
    .typeText(getPasswordInput(), validUser.password)
    .click(getLoginButton())
    .expect(getDashboardPage().exists).ok()
    .click(getUserMenu())
    .click(getLogoutButton())
    .expect(getLoginPage().exists).ok();

  await t.removeRequestHooks();
});

// ==================== Accessibility Tests ====================

test('Should be keyboard accessible', async (t) => {
  await t
    .pressKey('tab')
    .expect(getEmailInput().focused).ok()
    .pressKey('tab')
    .expect(getPasswordInput().focused).ok()
    .pressKey('tab')
    .expect(getRememberMeCheckbox().focused).ok()
    .pressKey('tab')
    .expect(getLoginButton().focused).ok()
    .pressKey('enter')
    .expect(getEmailError().exists).ok();
});

test('Should have proper ARIA labels', async (t) => {
  await t
    .expect(getEmailInput().getAttribute('aria-label')).eql('Email')
    .expect(getPasswordInput().getAttribute('aria-label')).eql('Password')
    .expect(getRememberMeCheckbox().getAttribute('aria-label')).eql('Remember me')
    .expect(getLoginButton().getAttribute('aria-label')).eql('Login');
});

test('Should announce errors to screen readers', async (t) => {
  const liveRegion = Selector('[aria-live="polite"]');
  
  await t
    .click(getLoginButton())
    .expect(liveRegion.innerText).contains('Email is required')
    .expect(liveRegion.innerText).contains('Password is required');
});

test('Should have sufficient color contrast', async (t) => {
  // Check contrast ratio of text elements
  const emailLabel = Selector('label[for="email"]');
  const passwordLabel = Selector('label[for="password"]');
  
  await t
    .expect(emailLabel.getStyleProperty('color')).notEql(getComputedStyle(document.body).backgroundColor)
    .expect(passwordLabel.getStyleProperty('color')).notEql(getComputedStyle(document.body).backgroundColor);
});

// ==================== Responsive Design Tests ====================

test('Should display correctly on mobile devices', async (t) => {
  await t.resizeWindow(375, 667); // iPhone SE size
  
  await t
    .expect(getLoginPage().exists).ok()
    .expect(getEmailInput().clientWidth).lt(400)
    .expect(getLoginButton().clientWidth).gt(300);
});

test('Should display correctly on tablets', async (t) => {
  await t.resizeWindow(768, 1024); // iPad size
  
  await t
    .expect(getLoginPage().exists).ok()
    .expect(getEmailInput().clientWidth).gt(400);
});

test('Should display correctly on desktop', async (t) => {
  await t.resizeWindow(1920, 1080);
  
  await t
    .expect(getLoginPage().exists).ok()
    .expect(getEmailInput().clientWidth).gt(500);
});

// ==================== Helper Functions ====================

function createMockResponse(url, status, data) {
  return {
    filter: (request) => request.url.includes(url),
    getResponse: () => ({
      status,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    })
  };
}

function createDelayedResponse(url, delay) {
  return {
    filter: (request) => request.url.includes(url),
    getResponse: () => new Promise(resolve => 
      setTimeout(() => resolve({
        status: 200,
        body: JSON.stringify({ success: true })
      }), delay)
    )
  };
                          
