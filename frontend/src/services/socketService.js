import { io } from 'socket.io-client';
import { authApi } from '../hooks/useAuth';

// Socket events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  CONNECT_ERROR: 'connect_error',
  CONNECT_TIMEOUT: 'connect_timeout',
  
  // Error events
  ERROR: 'error',
  EXCEPTION: 'exception',
  
  // Heartbeat events
  PING: 'ping',
  PONG: 'pong',
  
  // Authentication events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  UNAUTHORIZED: 'unauthorized',
  
  // Presence events
  USER_CONNECTED: 'user_connected',
  USER_DISCONNECTED: 'user_disconnected',
  USER_STATUS: 'user_status',
  TYPING: 'typing',
  TYPING_STOP: 'typing_stop',
  
  // Message events
  MESSAGE: 'message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_EDITED: 'message_edited',
  
  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  
  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  ROOM_MESSAGE: 'room_message',
  ROOM_USERS: 'room_users',
  
  // Broadcast events
  BROADCAST: 'broadcast',
  SYSTEM_BROADCAST: 'system_broadcast',
  
  // Data sync events
  SYNC: 'sync',
  SYNC_COMPLETE: 'sync_complete',
  SYNC_ERROR: 'sync_error',
  
  // Status events
  STATUS: 'status',
  SERVICE_STATUS: 'service_status',
  
  // Analytics events
  TRACK: 'track',
  PAGE_VIEW: 'page_view'
};

// Connection states
export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  TIMEOUT: 'timeout',
  UNAUTHORIZED: 'unauthorized'
};

// Socket namespaces
export const SOCKET_NAMESPACES = {
  MAIN: '/',
  CHAT: '/chat',
  NOTIFICATIONS: '/notifications',
  PRESENCE: '/presence',
  ANALYTICS: '/analytics',
  ADMIN: '/admin',
  AFFILIATE: '/affiliate'
};

// Socket transport protocols
export const TRANSPORTS = ['websocket', 'polling'];

// Default socket options
export const DEFAULT_OPTIONS = {
  url: process.env.REACT_APP_SOCKET_URL || window.location.origin,
  path: '/socket.io',
  transports: TRANSPORTS,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
  pingTimeout: 25000,
  pingInterval: 25000,
  upgrade: true,
  forceNew: false,
  multiplex: true,
  withCredentials: true,
  rememberUpgrade: true,
  secure: window.location.protocol === 'https:',
  rejectUnauthorized: true,
  timestampRequests: true,
  timestampParam: 't',
  auth: null,
  query: {},
  extraHeaders: {}
};

// Reconnection strategies
export const RECONNECTION_STRATEGIES = {
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
  FIBONACCI: 'fibonacci',
  RANDOM: 'random'
};

// Event priority levels
export const EVENT_PRIORITIES = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3
};

// Socket Service Class
class SocketService {
  constructor() {
    this.sockets = new Map();
    this.listeners = new Map();
    this.middlewares = [];
    this.reconnectionStrategy = RECONNECTION_STRATEGIES.EXPONENTIAL;
    this.eventQueue = [];
    this.processingQueue = false;
    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = DEFAULT_OPTIONS.reconnectionAttempts;
    this.reconnectDelay = DEFAULT_OPTIONS.reconnectionDelay;
    this.authenticated = false;
    this.userId = null;
    this.userRole = null;
    this.authToken = null;
    
    // Callbacks
    this.onConnectionChange = null;
    this.onAuthenticated = null;
    this.onError = null;
  }

  // ==================== Connection Management ====================

  // Initialize socket connection
  initialize(namespace = SOCKET_NAMESPACES.MAIN, options = {}) {
    try {
      const socketOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        auth: {
          token: this.authToken,
          userId: this.userId,
          role: this.userRole,
          ...options.auth
        }
      };

      const socket = io(socketOptions.url + namespace, socketOptions);
      
      this.sockets.set(namespace, socket);
      this.setupEventListeners(namespace, socket);
      
      return socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.handleError(error);
      return null;
    }
  }

  // Connect socket
  connect(namespace = SOCKET_NAMESPACES.MAIN) {
    let socket = this.sockets.get(namespace);
    
    if (!socket) {
      socket = this.initialize(namespace);
    }
    
    if (socket && !socket.connected) {
      socket.connect();
      this.updateConnectionState(CONNECTION_STATES.CONNECTING, namespace);
    }
    
    return socket;
  }

  // Disconnect socket
  disconnect(namespace = SOCKET_NAMESPACES.MAIN) {
    const socket = this.sockets.get(namespace);
    
    if (socket && socket.connected) {
      socket.disconnect();
      this.updateConnectionState(CONNECTION_STATES.DISCONNECTED, namespace);
    }
  }

  // Disconnect all sockets
  disconnectAll() {
    this.sockets.forEach((socket, namespace) => {
      this.disconnect(namespace);
    });
  }

  // Reconnect socket
  reconnect(namespace = SOCKET_NAMESPACES.MAIN) {
    this.disconnect(namespace);
    setTimeout(() => {
      this.connect(namespace);
    }, this.getReconnectDelay());
  }

  // Get reconnect delay based on strategy
  getReconnectDelay() {
    switch (this.reconnectionStrategy) {
      case RECONNECTION_STRATEGIES.EXPONENTIAL:
        return Math.min(
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
          DEFAULT_OPTIONS.reconnectionDelayMax
        );
      case RECONNECTION_STRATEGIES.FIBONACCI:
        const fib = (n) => n <= 1 ? 1 : fib(n - 1) + fib(n - 2);
        return this.reconnectDelay * fib(this.reconnectAttempts);
      case RECONNECTION_STRATEGIES.RANDOM:
        return this.reconnectDelay + Math.random() * this.reconnectDelay;
      default:
        return this.reconnectDelay;
    }
  }

  // Update connection state
  updateConnectionState(state, namespace = SOCKET_NAMESPACES.MAIN) {
    this.connectionState = state;
    
    if (this.onConnectionChange) {
      this.onConnectionChange(state, namespace);
    }
  }

  // ==================== Authentication ====================

  // Set authentication token
  setAuthToken(token) {
    this.authToken = token;
    this.updateSocketAuth();
  }

  // Set user info
  setUserInfo(userId, role) {
    this.userId = userId;
    this.userRole = role;
    this.updateSocketAuth();
  }

  // Update socket authentication
  updateSocketAuth() {
    this.sockets.forEach((socket) => {
      if (socket) {
        socket.auth = {
          token: this.authToken,
          userId: this.userId,
          role: this.userRole
        };
        
        if (socket.connected) {
          this.authenticate(socket);
        }
      }
    });
  }

  // Authenticate socket
  authenticate(socket) {
    socket.emit(SOCKET_EVENTS.AUTHENTICATE, {
      token: this.authToken,
      userId: this.userId,
      role: this.userRole
    });
  }

  // Check if authenticated
  isAuthenticated() {
    return this.authenticated;
  }

  // ==================== Event Listeners ====================

  // Setup event listeners for socket
  setupEventListeners(namespace, socket) {
    // Connection events
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log(`Socket connected: ${namespace}`);
      this.updateConnectionState(CONNECTION_STATES.CONNECTED, namespace);
      this.reconnectAttempts = 0;
      
      if (this.authToken) {
        this.authenticate(socket);
      }
      
      this.processEventQueue();
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`Socket disconnected: ${namespace}`, reason);
      this.updateConnectionState(CONNECTION_STATES.DISCONNECTED, namespace);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, attempt reconnect
        setTimeout(() => {
          this.connect(namespace);
        }, this.getReconnectDelay());
      }
    });

    socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log(`Socket reconnected: ${namespace}`, attemptNumber);
      this.updateConnectionState(CONNECTION_STATES.CONNECTED, namespace);
      this.reconnectAttempts = 0;
    });

    socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log(`Socket reconnect attempt: ${namespace}`, attemptNumber);
      this.reconnectAttempts = attemptNumber;
      this.updateConnectionState(CONNECTION_STATES.RECONNECTING, namespace);
    });

    socket.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
      console.error(`Socket reconnect error: ${namespace}`, error);
      this.handleError(error);
    });

    socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
      console.error(`Socket reconnect failed: ${namespace}`);
      this.updateConnectionState(CONNECTION_STATES.ERROR, namespace);
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error(`Socket connect error: ${namespace}`, error);
      this.handleError(error);
    });

    socket.on(SOCKET_EVENTS.CONNECT_TIMEOUT, () => {
      console.error(`Socket connect timeout: ${namespace}`);
      this.updateConnectionState(CONNECTION_STATES.TIMEOUT, namespace);
    });

    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error(`Socket error: ${namespace}`, error);
      this.handleError(error);
    });

    // Authentication events
    socket.on(SOCKET_EVENTS.AUTHENTICATED, (data) => {
      console.log('Socket authenticated:', data);
      this.authenticated = true;
      
      if (this.onAuthenticated) {
        this.onAuthenticated(data);
      }
    });

    socket.on(SOCKET_EVENTS.UNAUTHORIZED, (data) => {
      console.error('Socket unauthorized:', data);
      this.authenticated = false;
      this.updateConnectionState(CONNECTION_STATES.UNAUTHORIZED, namespace);
    });

    // Custom event listeners
    const namespaceListeners = this.listeners.get(namespace) || new Map();
    namespaceListeners.forEach((handlers, event) => {
      handlers.forEach(handler => {
        socket.on(event, handler);
      });
    });
  }
  // ==================== Event Emission ====================

// Emit event with acknowledgment
emit(event, data = {}, options = {}) {
  const {
    namespace = SOCKET_NAMESPACES.MAIN,
    timeout = 5000,
    priority = EVENT_PRIORITIES.NORMAL,
    retry = true,
    retryCount = 0
  } = options;

  const socket = this.sockets.get(namespace);
  
  if (!socket || !socket.connected) {
    if (retry && retryCount < 3) {
      // Queue event for later
      this.queueEvent({
        event,
        data,
        namespace,
        timeout,
        priority,
        retryCount: retryCount + 1
      });
      
      // Attempt to connect
      this.connect(namespace);
      
      return new Promise((resolve, reject) => {
        // Will be resolved when queue is processed
      });
    }
    
    return Promise.reject(new Error('Socket not connected'));
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Event timeout'));
    }, timeout);

    socket.emit(event, data, (response) => {
      clearTimeout(timeoutId);
      
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

// Emit event without acknowledgment
emitVolatile(event, data = {}, namespace = SOCKET_NAMESPACES.MAIN) {
  const socket = this.sockets.get(namespace);
  
  if (socket && socket.connected) {
    socket.volatile.emit(event, data);
    return true;
  }
  
  return false;
}

// Broadcast event to all connected sockets
broadcast(event, data = {}, rooms = []) {
  this.sockets.forEach((socket) => {
    if (rooms.length > 0) {
      rooms.forEach(room => {
        socket.to(room).emit(event, data);
      });
    } else {
      socket.broadcast.emit(event, data);
    }
  });
}

// ==================== Event Listening ====================

// Add event listener
on(event, handler, namespace = SOCKET_NAMESPACES.MAIN) {
  if (!this.listeners.has(namespace)) {
    this.listeners.set(namespace, new Map());
  }
  
  const namespaceListeners = this.listeners.get(namespace);
  
  if (!namespaceListeners.has(event)) {
    namespaceListeners.set(event, []);
  }
  
  namespaceListeners.get(event).push(handler);
  
  const socket = this.sockets.get(namespace);
  if (socket) {
    socket.on(event, handler);
  }
  
  return this;
}

// Add one-time event listener
once(event, handler, namespace = SOCKET_NAMESPACES.MAIN) {
  const socket = this.sockets.get(namespace);
  
  if (socket) {
    socket.once(event, handler);
  }
  
  return this;
}

// Remove event listener
off(event, handler = null, namespace = SOCKET_NAMESPACES.MAIN) {
  const socket = this.sockets.get(namespace);
  
  if (!socket) return this;
  
  if (handler) {
    socket.off(event, handler);
    
    // Remove from listeners map
    const namespaceListeners = this.listeners.get(namespace);
    if (namespaceListeners && namespaceListeners.has(event)) {
      const handlers = namespaceListeners.get(event).filter(h => h !== handler);
      if (handlers.length > 0) {
        namespaceListeners.set(event, handlers);
      } else {
        namespaceListeners.delete(event);
      }
    }
  } else {
    socket.removeAllListeners(event);
    
    // Remove from listeners map
    const namespaceListeners = this.listeners.get(namespace);
    if (namespaceListeners) {
      namespaceListeners.delete(event);
    }
  }
  
  return this;
}

// Remove all listeners
removeAllListeners(namespace = SOCKET_NAMESPACES.MAIN) {
  const socket = this.sockets.get(namespace);
  
  if (socket) {
    socket.removeAllListeners();
  }
  
  if (this.listeners.has(namespace)) {
    this.listeners.delete(namespace);
  }
  
  return this;
}

// ==================== Room Management ====================

// Join room
async joinRoom(room, namespace = SOCKET_NAMESPACES.MAIN) {
  return this.emit(SOCKET_EVENTS.JOIN_ROOM, { room }, { namespace });
}

// Leave room
async leaveRoom(room, namespace = SOCKET_NAMESPACES.MAIN) {
  return this.emit(SOCKET_EVENTS.LEAVE_ROOM, { room }, { namespace });
}

// Get room users
async getRoomUsers(room, namespace = SOCKET_NAMESPACES.MAIN) {
  return this.emit(SOCKET_EVENTS.ROOM_USERS, { room }, { namespace });
}

// Send message to room
async sendToRoom(room, event, data, namespace = SOCKET_NAMESPACES.MAIN) {
  return this.emit(SOCKET_EVENTS.ROOM_MESSAGE, {
    room,
    event,
    data
  }, { namespace });
}

// ==================== Presence Management ====================

// Update presence status
async updatePresence(status, metadata = {}) {
  return this.emit(SOCKET_EVENTS.USER_STATUS, {
    status,
    ...metadata
  }, { namespace: SOCKET_NAMESPACES.PRESENCE });
}

// Start typing
async startTyping(room, namespace = SOCKET_NAMESPACES.CHAT) {
  return this.emitVolatile(SOCKET_EVENTS.TYPING, { room }, namespace);
}

// Stop typing
async stopTyping(room, namespace = SOCKET_NAMESPACES.CHAT) {
  return this.emitVolatile(SOCKET_EVENTS.TYPING_STOP, { room }, namespace);
}

// ==================== Message Management ====================

// Send message
async sendMessage(message, to = null, namespace = SOCKET_NAMESPACES.CHAT) {
  return this.emit(SOCKET_EVENTS.MESSAGE, {
    message,
    to,
    timestamp: Date.now()
  }, { namespace });
}

// Mark message as delivered
async markDelivered(messageId, to, namespace = SOCKET_NAMESPACES.CHAT) {
  return this.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
    messageId,
    to
  }, { namespace });
}

// Mark message as read
async markRead(messageId, to, namespace = SOCKET_NAMESPACES.CHAT) {
  return this.emit(SOCKET_EVENTS.MESSAGE_READ, {
    messageId,
    to
  }, { namespace });
}

// ==================== Notification Management ====================

// Send notification
async sendNotification(notification, to = null) {
  return this.emit(SOCKET_EVENTS.NOTIFICATION, {
    notification,
    to
  }, { namespace: SOCKET_NAMESPACES.NOTIFICATIONS });
}

// Mark notification as read
async markNotificationRead(notificationId) {
  return this.emit(SOCKET_EVENTS.NOTIFICATION_READ, {
    notificationId
  }, { namespace: SOCKET_NAMESPACES.NOTIFICATIONS });
}

// ==================== Data Sync ====================

// Request data sync
async requestSync(entity, lastSync = null) {
  return this.emit(SOCKET_EVENTS.SYNC, {
    entity,
    lastSync
  }, { namespace: SOCKET_NAMESPACES.MAIN });
}

// ==================== Analytics ====================

// Track event
trackEvent(event, data = {}) {
  return this.emitVolatile(SOCKET_EVENTS.TRACK, {
    event,
    data,
    timestamp: Date.now()
  }, SOCKET_NAMESPACES.ANALYTICS);
}

// Track page view
trackPageView(page, referrer = null) {
  return this.emitVolatile(SOCKET_EVENTS.PAGE_VIEW, {
    page,
    referrer,
    timestamp: Date.now()
  }, SOCKET_NAMESPACES.ANALYTICS);
      }
  // ==================== Queue Management ====================

  // Queue event for later processing
  queueEvent(eventData) {
    this.eventQueue.push({
      ...eventData,
      queuedAt: Date.now()
    });
    
    if (!this.processingQueue) {
      this.processEventQueue();
    }
  }

  // Process event queue
  async processEventQueue() {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    while (this.eventQueue.length > 0) {
      const eventData = this.eventQueue.shift();
      
      try {
        await this.emit(eventData.event, eventData.data, {
          namespace: eventData.namespace,
          timeout: eventData.timeout,
          priority: eventData.priority,
          retry: eventData.retryCount < 3,
          retryCount: eventData.retryCount
        });
      } catch (error) {
        console.error('Failed to process queued event:', error);
        
        if (eventData.retryCount < 3) {
          // Re-queue with increased retry count
          this.eventQueue.push({
            ...eventData,
            retryCount: eventData.retryCount + 1
          });
        }
      }
      
      // Small delay between queue processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processingQueue = false;
  }

  // Clear event queue
  clearQueue() {
    this.eventQueue = [];
    this.processingQueue = false;
  }

  // ==================== Middleware ====================

  // Add middleware
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // Apply middlewares to event
  applyMiddlewares(event, data) {
    let result = { event, data };
    
    for (const middleware of this.middlewares) {
      result = middleware(result.event, result.data);
      if (!result) break;
    }
    
    return result;
  }

  // ==================== Error Handling ====================

  // Handle error
  handleError(error) {
    if (this.onError) {
      this.onError(error);
    }
    
    // Emit error event
    this.sockets.forEach((socket) => {
      if (socket) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: error.message,
          stack: error.stack
        });
      }
    });
  }

  // ==================== Status and Utilities ====================

  // Get connection status
  getConnectionStatus(namespace = SOCKET_NAMESPACES.MAIN) {
    const socket = this.sockets.get(namespace);
    
    return {
      connected: socket?.connected || false,
      disconnected: socket?.disconnected || false,
      id: socket?.id || null,
      namespace,
      state: this.connectionState,
      authenticated: this.authenticated,
      reconnectAttempts: this.reconnectAttempts,
      queueLength: this.eventQueue.length
    };
  }

  // Get all connection statuses
  getAllConnectionStatuses() {
    const statuses = {};
    
    this.sockets.forEach((socket, namespace) => {
      statuses[namespace] = {
        connected: socket.connected,
        disconnected: socket.disconnected,
        id: socket.id
      };
    });
    
    return statuses;
  }

  // Check if socket is connected
  isConnected(namespace = SOCKET_NAMESPACES.MAIN) {
    const socket = this.sockets.get(namespace);
    return socket?.connected || false;
  }

  // Get socket ID
  getSocketId(namespace = SOCKET_NAMESPACES.MAIN) {
    const socket = this.sockets.get(namespace);
    return socket?.id || null;
  }

  // Get all socket IDs
  getAllSocketIds() {
    const ids = {};
    
    this.sockets.forEach((socket, namespace) => {
      ids[namespace] = socket.id;
    });
    
    return ids;
  }

  // ==================== Reconnection Strategies ====================

  // Set reconnection strategy
  setReconnectionStrategy(strategy) {
    this.reconnectionStrategy = strategy;
  }

  // Set max reconnect attempts
  setMaxReconnectAttempts(max) {
    this.maxReconnectAttempts = max;
  }

  // Set reconnect delay
  setReconnectDelay(delay) {
    this.reconnectDelay = delay;
  }

  // ==================== Callbacks ====================

  // Set on connection change callback
  onConnectionChange(callback) {
    this.onConnectionChange = callback;
  }

  // Set on authenticated callback
  onAuthenticated(callback) {
    this.onAuthenticated = callback;
  }

  // Set on error callback
  onError(callback) {
    this.onError = callback;
  }

  // ==================== Cleanup ====================

  // Destroy socket service
  destroy() {
    this.disconnectAll();
    this.clearQueue();
    this.listeners.clear();
    this.middlewares = [];
    this.sockets.clear();
    
    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.authenticated = false;
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export helper functions
export const socketHelpers = {
  // Generate event name with namespace
  getEventName: (namespace, event) => {
    return namespace === '/' ? event : `${namespace}:${event}`;
  },

  // Parse event name
  parseEventName: (eventName) => {
    const parts = eventName.split(':');
    if (parts.length === 1) {
      return { namespace: '/', event: parts[0] };
    }
    return { namespace: parts[0], event: parts.slice(1).join(':') };
  },

  // Create socket options
  createOptions: (options = {}) => {
    return {
      ...DEFAULT_OPTIONS,
      ...options
    };
  },

  // Check if event is system event
  isSystemEvent: (event) => {
    return Object.values(SOCKET_EVENTS).includes(event);
  },

  // Get event priority
  getEventPriority: (event) => {
    const priorityMap = {
      [SOCKET_EVENTS.CONNECT]: EVENT_PRIORITIES.CRITICAL,
      [SOCKET_EVENTS.DISCONNECT]: EVENT_PRIORITIES.CRITICAL,
      [SOCKET_EVENTS.AUTHENTICATE]: EVENT_PRIORITIES.HIGH,
      [SOCKET_EVENTS.MESSAGE]: EVENT_PRIORITIES.NORMAL,
      [SOCKET_EVENTS.NOTIFICATION]: EVENT_PRIORITIES.NORMAL,
      [SOCKET_EVENTS.TYPING]: EVENT_PRIORITIES.LOW
    };
    
    return priorityMap[event] || EVENT_PRIORITIES.NORMAL;
  },

  // Format socket error
  formatError: (error) => {
    return {
      message: error.message,
      code: error.code || 'SOCKET_ERROR',
      timestamp: Date.now()
    };
  },

  // Generate unique event ID
  generateEventId: () => {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Calculate reconnect delay with jitter
  calculateReconnectDelay: (baseDelay, attempt, maxDelay, withJitter = true) => {
    const delay = baseDelay * Math.pow(2, attempt);
    const limitedDelay = Math.min(delay, maxDelay);
    
    if (withJitter) {
      return limitedDelay * (0.5 + Math.random() * 0.5);
    }
    
    return limitedDelay;
  },

  // Group events by namespace
  groupByNamespace: (events) => {
    const groups = {};
    
    events.forEach(({ event, data, namespace }) => {
      if (!groups[namespace]) {
        groups[namespace] = [];
      }
      groups[namespace].push({ event, data });
    });
    
    return groups;
  }
};

// Export constants
export const SOCKET_CONSTANTS = {
  EVENTS: SOCKET_EVENTS,
  CONNECTION_STATES,
  NAMESPACES: SOCKET_NAMESPACES,
  TRANSPORTS,
  DEFAULT_OPTIONS,
  RECONNECTION_STRATEGIES,
  EVENT_PRIORITIES
};

export default socketService;
