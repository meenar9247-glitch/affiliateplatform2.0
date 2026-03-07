/**
 * Universal Error Logger - पूरे app में errors capture करेगा
 * Copy-paste this entire file
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.originalConsoleError = console.error;
    this.setupGlobalErrorHandler();
    this.setupReactErrorHandler();
    this.setupNetworkInterceptor();
  }

  // Global error handler (window.onerror)
  setupGlobalErrorHandler() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError({
        type: 'GLOBAL',
        message,
        source,
        line: lineno,
        column: colno,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      });
    };
  }

  // Promise rejection handler
  setupReactErrorHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'PROMISE',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Network request interceptor
  setupNetworkInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.logError({
            type: 'HTTP',
            url: args[0],
            method: args[1]?.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
          });
        }
        return response;
      } catch (error) {
        this.logError({
          type: 'NETWORK',
          url: args[0],
          method: args[1]?.method || 'GET',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
  }

  // Log error to console and store
  logError(errorData) {
    this.errors.push(errorData);
    
    // Log to console with colors
    console.group(`%c❌ ERROR DETECTED: ${errorData.type}`, 'color: #ff4444; font-weight: bold');
    console.log('📅 Time:', errorData.timestamp);
    console.log('📝 Message:', errorData.message || errorData.error);
    if (errorData.url) console.log('🔗 URL:', errorData.url);
    if (errorData.status) console.log('📟 Status:', errorData.status);
    if (errorData.stack) console.log('📚 Stack:', errorData.stack);
    console.groupEnd();

    // Show toast notification in development
    if (process.env.NODE_ENV === 'development') {
      this.showErrorToast(errorData);
    }

    return errorData;
  }

  showErrorToast(errorData) {
    // Create floating error notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      max-width: 400px;
      word-wrap: break-word;
    `;

    toast.innerHTML = `
      <strong style="font-size: 16px; display: block; margin-bottom: 8px;">🚨 ERROR DETECTED</strong>
      <div style="margin-bottom: 5px;"><strong>Type:</strong> ${errorData.type}</div>
      <div style="margin-bottom: 5px;"><strong>Message:</strong> ${errorData.message || errorData.error || 'Unknown error'}</div>
      ${errorData.url ? `<div style="margin-bottom: 5px;"><strong>URL:</strong> ${errorData.url}</div>` : ''}
      ${errorData.status ? `<div style="margin-bottom: 5px;"><strong>Status:</strong> ${errorData.status}</div>` : ''}
      <button onclick="this.parentElement.remove()" style="
        background: white;
        color: #ff4444;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        margin-top: 10px;
        cursor: pointer;
      ">Dismiss</button>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 10000);
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Clear errors
  clearErrors() {
    this.errors = [];
  }

  // Show error panel
  showErrorPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      background: #1a1a1a;
      color: #00ff00;
      padding: 20px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 14px;
      z-index: 100000;
      overflow: auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    `;

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: white; margin: 0;">🐛 Error Logger (${this.errors.length} errors)</h2>
        <div>
          <button onclick="errorLogger.clearErrors(); this.parentElement.parentElement.remove()" style="
            background: #444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            margin-right: 10px;
            cursor: pointer;
          ">Clear All</button>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
      ${this.errors.length === 0 ? '<p style="color: #888;">No errors logged yet.</p>' : ''}
      ${this.errors.map((error, index) => `
        <div style="
          background: #2a2a2a;
          margin-bottom: 15px;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ff4444;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <strong style="color: #ff4444;">#${index + 1} - ${error.type}</strong>
            <span style="color: #888;">${error.timestamp}</span>
          </div>
          <div style="color: #ddd; margin-bottom: 5px;"><strong>Message:</strong> ${error.message || error.error || 'N/A'}</div>
          ${error.url ? `<div style="color: #ddd; margin-bottom: 5px;"><strong>URL:</strong> ${error.url}</div>` : ''}
          ${error.status ? `<div style="color: #ddd; margin-bottom: 5px;"><strong>Status:</strong> ${error.status}</div>` : ''}
          ${error.stack ? `<div style="color: #aaa; font-size: 12px; margin-top: 10px;"><strong>Stack:</strong><br>${error.stack}</div>` : ''}
        </div>
      `).join('')}
    `;

    document.body.appendChild(panel);
  }
}

// Create global instance
window.errorLogger = new ErrorLogger();

// Export for use in components
export default window.errorLogger;
