import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
import io from 'socket.io-client';

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  ERROR: 'error',
  CONNECT_ERROR: 'connect_error',
  CONNECT_TIMEOUT: 'connect_timeout',
  PING: 'ping',
  PONG: 'pong'
};

// Connection states
export const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  TIMEOUT: 'timeout'
};

// Message types
export const MESSAGE_TYPES = {
  CHAT: 'chat',
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  UPDATE: 'update',
  SYNC: 'sync',
  PRESENCE: 'presence',
  TYPING: 'typing',
  READ_RECEIPT: 'read_receipt',
  DELIVERY_RECEIPT: 'delivery_receipt'
};

// Default options
const DEFAULT_OPTIONS = {
  url: process.env.REACT_APP_SOCKET_URL || window.location.origin,
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true,
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
  auth: null,
  query: {},
  extraHeaders: {},
  rememberUpgrade: true,
  secure: true,
  rejectUnauthorized: true,
  timestampRequests: true,
  timestampParam: 't',
  enableQueue: true,
  queueSize: 100,
  enableRetry: true,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCompression: true,
  enableLogging: false,
  enableHeartbeat: true,
  heartbeatInterval: 25000,
  heartbeatTimeout: 5000,
  onConnect: null,
  onDisconnect: null,
  onError: null,
  onReconnect: null,
  onMessage: null
};

export const useSocket = (namespace = '', options = {}) => {
  // Merge options with defaults
  const {
    url = DEFAULT_OPTIONS.url,
    path = DEFAULT_OPTIONS.path,
    transports = DEFAULT_OPTIONS.transports,
    autoConnect = DEFAULT_OPTIONS.autoConnect,
    reconnection = DEFAULT_OPTIONS.reconnection,
    reconnectionAttempts = DEFAULT_OPTIONS.reconnectionAttempts,
    reconnectionDelay = DEFAULT_OPTIONS.reconnectionDelay,
    reconnectionDelayMax = DEFAULT_OPTIONS.reconnectionDelayMax,
    randomizationFactor = DEFAULT_OPTIONS.randomizationFactor,
    timeout = DEFAULT_OPTIONS.timeout,
    pingTimeout = DEFAULT_OPTIONS.pingTimeout,
    pingInterval = DEFAULT_OPTIONS.pingInterval,
    upgrade = DEFAULT_OPTIONS.upgrade,
    forceNew = DEFAULT_OPTIONS.forceNew,
    multiplex = DEFAULT_OPTIONS.multiplex,
    withCredentials = DEFAULT_OPTIONS.withCredentials,
    auth = DEFAULT_OPTIONS.auth,
    query = DEFAULT_OPTIONS.query,
    extraHeaders = DEFAULT_OPTIONS.extraHeaders,
    rememberUpgrade = DEFAULT_OPTIONS.rememberUpgrade,
    secure = DEFAULT_OPTIONS.secure,
    rejectUnauthorized = DEFAULT_OPTIONS.rejectUnauthorized,
    timestampRequests = DEFAULT_OPTIONS.timestampRequests,
    timestampParam = DEFAULT_OPTIONS.timestampParam,
    enableQueue = DEFAULT_OPTIONS.enableQueue,
    queueSize = DEFAULT_OPTIONS.queueSize,
    enableRetry = DEFAULT_OPTIONS.enableRetry,
    retryAttempts = DEFAULT_OPTIONS.retryAttempts,
    retryDelay = DEFAULT_OPTIONS.retryDelay,
    enableCompression = DEFAULT_OPTIONS.enableCompression,
    enableLogging = DEFAULT_OPTIONS.enableLogging,
    enableHeartbeat = DEFAULT_OPTIONS.enableHeartbeat,
    heartbeatInterval = DEFAULT_OPTIONS.heartbeatInterval,
    heartbeatTimeout = DEFAULT_OPTIONS.heartbeatTimeout,
    onConnect = DEFAULT_OPTIONS.onConnect,
    onDisconnect = DEFAULT_OPTIONS.onDisconnect,
    onError = DEFAULT_OPTIONS.onError,
    onReconnect = DEFAULT_OPTIONS.onReconnect,
    onMessage = DEFAULT_OPTIONS.onMessage
  } = { ...DEFAULT_OPTIONS, ...options };

  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [lastPing, setLastPing] = useState(null);
  const [lastPong, setLastPong] = useState(null);
  const [latency, setLatency] = useState(0);
  const [messageQueue, setMessageQueue] = useState([]);
  const [messageHistory, setMessageHistory] = useLocalStorage('socket_messages', []);
  const [subscriptions, setSubscriptions] = useState({});
  const [presence, setPresence] = useState({});

  // Refs
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const messageHandlersRef = useRef({});
  const eventHandlersRef = useRef({});
  const pendingMessagesRef = useRef(new Map());
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Build full URL with namespace
  const fullUrl = useMemo(() => {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const ns = namespace.startsWith('/') ? namespace : `/${namespace}`;
    return namespace ? `${baseUrl}${ns}` : baseUrl;
  }, [url, namespace]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!mountedRef.current) return null;

    try {
      // Socket.io connection options
      const socketOptions = {
        path,
        transports,
        autoConnect: false, // We'll connect manually
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        reconnectionDelayMax,
        randomizationFactor,
        timeout,
        pingTimeout,
        pingInterval,
        upgrade,
        forceNew,
        multiplex,
        withCredentials,
        auth: auth || (user ? { userId: user.id, token } : null),
        query,
        extraHeaders,
        rememberUpgrade,
        secure,
        rejectUnauthorized,
        timestampRequests,
        timestampParam,
        transportsOptions: {
          polling: {
            extraHeaders
          }
        }
      };

      // Create socket instance
      const newSocket = io(fullUrl, socketOptions);
      socketRef.current = newSocket;
      setSocket(newSocket);
      setConnectionState(CONNECTION_STATES.CONNECTING);

      if (enableLogging) {
        console.log('Socket initialized:', fullUrl, socketOptions);
      }

      return newSocket;
    } catch (error) {
      setConnectionError(error);
      setConnectionState(CONNECTION_STATES.ERROR);
      onError?.(error);
      if (enableLogging) console.error('Socket initialization error:', error);
      return null;
    }
  }, [fullUrl, path, transports, reconnection, reconnectionAttempts, reconnectionDelay, reconnectionDelayMax, randomizationFactor, timeout, pingTimeout, pingInterval, upgrade, forceNew, multiplex, withCredentials, auth, user, token, query, extraHeaders, rememberUpgrade, secure, rejectUnauthorized, timestampRequests, timestampParam, enableLogging, onError]);

  // Connect socket
  const connect = useCallback(() => {
    if (!socketRef.current) {
      initializeSocket();
    }

    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
      setConnectionState(CONNECTION_STATES.CONNECTING);
      if (enableLogging) console.log('Socket connecting...');
    }
  }, [initializeSocket, enableLogging]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.disconnect();
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
      if (enableLogging) console.log('Socket disconnected');
    }
  }, [enableLogging]);

  // Reconnect socket
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);
  // Setup socket event listeners
useEffect(() => {
  if (!socketRef.current) return;

  const socket = socketRef.current;

  // Connection events
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    setConnectionState(CONNECTION_STATES.CONNECTED);
    setConnectionError(null);
    setReconnectCount(0);
    retryCountRef.current = 0;
    onConnect?.();

    if (enableLogging) console.log('Socket connected:', socket.id);

    // Process queued messages
    if (enableQueue && messageQueue.length > 0) {
      messageQueue.forEach(msg => {
        sendMessage(msg.event, msg.data, msg.options);
      });
      setMessageQueue([]);
    }
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
    onDisconnect?.(reason);

    if (enableLogging) console.log('Socket disconnected:', reason);

    // Handle unexpected disconnections
    if (reason === 'io server disconnect' || reason === 'transport close') {
      if (reconnection) {
        setConnectionState(CONNECTION_STATES.RECONNECTING);
      }
    }
  });

  socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
    setConnectionState(CONNECTION_STATES.CONNECTED);
    setReconnectCount(attemptNumber);
    onReconnect?.(attemptNumber);

    if (enableLogging) console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
    setConnectionState(CONNECTION_STATES.RECONNECTING);
    setReconnectCount(attemptNumber);

    if (enableLogging) console.log('Socket reconnection attempt:', attemptNumber);
  });

  socket.on(SOCKET_EVENTS.RECONNECT_ERROR, (error) => {
    setConnectionError(error);
    if (enableLogging) console.error('Socket reconnection error:', error);
  });

  socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
    setConnectionState(CONNECTION_STATES.ERROR);
    setConnectionError(new Error('Reconnection failed'));
    if (enableLogging) console.error('Socket reconnection failed');
  });

  socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
    setConnectionError(error);
    setConnectionState(CONNECTION_STATES.ERROR);
    onError?.(error);
    if (enableLogging) console.error('Socket connection error:', error);
  });

  socket.on(SOCKET_EVENTS.CONNECT_TIMEOUT, () => {
    setConnectionState(CONNECTION_STATES.TIMEOUT);
    if (enableLogging) console.error('Socket connection timeout');
  });

  socket.on(SOCKET_EVENTS.ERROR, (error) => {
    setConnectionError(error);
    onError?.(error);
    if (enableLogging) console.error('Socket error:', error);
  });

  // Heartbeat events
  if (enableHeartbeat) {
    socket.on(SOCKET_EVENTS.PING, () => {
      setLastPing(Date.now());
    });

    socket.on(SOCKET_EVENTS.PONG, (latency) => {
      setLastPong(Date.now());
      setLatency(latency);
    });
  }

  // Custom event handlers
  Object.entries(eventHandlersRef.current).forEach(([event, handlers]) => {
    handlers.forEach(handler => {
      socket.on(event, handler);
    });
  });

  return () => {
    socket.off(SOCKET_EVENTS.CONNECT);
    socket.off(SOCKET_EVENTS.DISCONNECT);
    socket.off(SOCKET_EVENTS.RECONNECT);
    socket.off(SOCKET_EVENTS.RECONNECT_ATTEMPT);
    socket.off(SOCKET_EVENTS.RECONNECT_ERROR);
    socket.off(SOCKET_EVENTS.RECONNECT_FAILED);
    socket.off(SOCKET_EVENTS.CONNECT_ERROR);
    socket.off(SOCKET_EVENTS.CONNECT_TIMEOUT);
    socket.off(SOCKET_EVENTS.ERROR);
    
    if (enableHeartbeat) {
      socket.off(SOCKET_EVENTS.PING);
      socket.off(SOCKET_EVENTS.PONG);
    }

    Object.entries(eventHandlersRef.current).forEach(([event, handlers]) => {
      handlers.forEach(handler => {
        socket.off(event, handler);
      });
    });
  };
}, [enableLogging, enableQueue, messageQueue, reconnection, enableHeartbeat, onConnect, onDisconnect, onReconnect, onError]);

// Auto-connect on mount
useEffect(() => {
  if (autoConnect && user) {
    connect();
  }

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, [autoConnect, user, connect]);

// Heartbeat monitoring
useEffect(() => {
  if (!enableHeartbeat || !socketRef.current) return;

  heartbeatTimerRef.current = setInterval(() => {
    if (socketRef.current?.connected) {
      const now = Date.now();
      if (lastPing && lastPong && now - lastPong > heartbeatTimeout) {
        if (enableLogging) console.warn('Heartbeat timeout, reconnecting...');
        reconnect();
      }
    }
  }, heartbeatInterval);

  return () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }
  };
}, [enableHeartbeat, heartbeatInterval, heartbeatTimeout, lastPing, lastPong, reconnect, enableLogging]);

// Send message
const sendMessage = useCallback((event, data, options = {}) => {
  const {
    retry = enableRetry,
    retryAttempts: msgRetryAttempts = retryAttempts,
    retryDelay: msgRetryDelay = retryDelay,
    timeout: msgTimeout = 30000,
    queue = enableQueue,
    priority = 0,
    compress = enableCompression
  } = options;

  if (!socketRef.current) {
    if (queue) {
      // Queue message for later
      if (messageQueue.length < queueSize) {
        setMessageQueue(prev => [...prev, { event, data, options }]);
      }
    }
    return null;
  }

  if (!socketRef.current.connected) {
    if (queue) {
      setMessageQueue(prev => [...prev, { event, data, options }]);
    }
    return null;
  }

  const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  const message = {
    id: messageId,
    event,
    data,
    timestamp,
    priority,
    compress,
    options
  };

  // Store in history
  setMessageHistory(prev => [message, ...prev].slice(0, 100));

  // Send with acknowledgment
  if (msgTimeout > 0) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingMessagesRef.current.delete(messageId);
        reject(new Error('Message timeout'));
      }, msgTimeout);

      pendingMessagesRef.current.set(messageId, { resolve, reject, timeoutId });

      socketRef.current.emit(event, data, (response) => {
        clearTimeout(timeoutId);
        pendingMessagesRef.current.delete(messageId);
        
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    });
  }

  // Send without acknowledgment
  socketRef.current.emit(event, data);
  return Promise.resolve({ id: messageId, sent: true });
}, [enableRetry, retryAttempts, retryDelay, enableQueue, queueSize, enableCompression, messageQueue]);

// Subscribe to event
const on = useCallback((event, handler) => {
  if (!eventHandlersRef.current[event]) {
    eventHandlersRef.current[event] = [];
  }
  eventHandlersRef.current[event].push(handler);

  if (socketRef.current) {
    socketRef.current.on(event, handler);
  }

  return () => off(event, handler);
}, []);

// Unsubscribe from event
const off = useCallback((event, handler) => {
  if (eventHandlersRef.current[event]) {
    eventHandlersRef.current[event] = eventHandlersRef.current[event].filter(h => h !== handler);
  }

  if (socketRef.current) {
    socketRef.current.off(event, handler);
  }
}, []);

// Once subscription
const once = useCallback((event, handler) => {
  const wrappedHandler = (...args) => {
    handler(...args);
    off(event, wrappedHandler);
  };
  on(event, wrappedHandler);
}, [on, off]);
    // Join room
  const joinRoom = useCallback((room, data = {}) => {
    if (!socketRef.current?.connected) return false;

    return new Promise((resolve, reject) => {
      socketRef.current.emit('join_room', { room, ...data }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          setSubscriptions(prev => ({
            ...prev,
            [room]: [...(prev[room] || []), socketRef.current.id]
          }));
          resolve(response);
        }
      });
    });
  }, []);

  // Leave room
  const leaveRoom = useCallback((room) => {
    if (!socketRef.current?.connected) return false;

    return new Promise((resolve, reject) => {
      socketRef.current.emit('leave_room', { room }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          setSubscriptions(prev => {
            const newSubs = { ...prev };
            delete newSubs[room];
            return newSubs;
          });
          resolve(response);
        }
      });
    });
  }, []);

  // Send to room
  const sendToRoom = useCallback((room, event, data, options = {}) => {
    return sendMessage('room_message', { room, event, data }, options);
  }, [sendMessage]);

  // Broadcast to all
  const broadcast = useCallback((event, data, options = {}) => {
    return sendMessage('broadcast', { event, data }, options);
  }, [sendMessage]);

  // Update presence
  const updatePresence = useCallback((status, data = {}) => {
    if (!socketRef.current?.connected) return false;

    return new Promise((resolve, reject) => {
      socketRef.current.emit('presence_update', { status, ...data }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          setPresence(prev => ({
            ...prev,
            [socketRef.current.id]: { status, ...data, lastSeen: Date.now() }
          }));
          resolve(response);
        }
      });
    });
  }, []);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    if (!socketRef.current?.connected) return [];

    return new Promise((resolve, reject) => {
      socketRef.current.emit('get_online_users', {}, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.users);
        }
      });
    });
  }, []);

  // Typing indicator
  const startTyping = useCallback((room) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing_start', { room });
  }, []);

  const stopTyping = useCallback((room) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('typing_stop', { room });
  }, []);

  // Read receipt
  const sendReadReceipt = useCallback((messageId, room) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('read_receipt', { messageId, room });
  }, []);

  // Delivery receipt
  const sendDeliveryReceipt = useCallback((messageId, recipient) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('delivery_receipt', { messageId, recipient });
  }, []);

  // Get connection stats
  const getConnectionStats = useCallback(() => {
    return {
      state: connectionState,
      connected: socketRef.current?.connected || false,
      disconnected: socketRef.current?.disconnected || false,
      id: socketRef.current?.id || null,
      reconnectCount,
      lastPing,
      lastPong,
      latency,
      messageQueueSize: messageQueue.length,
      pendingMessages: pendingMessagesRef.current.size,
      subscriptions: Object.keys(subscriptions).length,
      transport: socketRef.current?.io?.engine?.transport?.name || null
    };
  }, [connectionState, reconnectCount, lastPing, lastPong, latency, messageQueue, subscriptions]);

  // Return socket interface
  return {
    // Socket instance
    socket: socketRef.current,
    
    // Connection state
    connected: socketRef.current?.connected || false,
    disconnected: socketRef.current?.disconnected || false,
    connectionState,
    connectionError,
    reconnectCount,
    lastPing,
    lastPong,
    latency,
    
    // Connection methods
    connect,
    disconnect,
    reconnect,
    
    // Message methods
    send: sendMessage,
    emit: sendMessage,
    on,
    off,
    once,
    
    // Room methods
    joinRoom,
    leaveRoom,
    sendToRoom,
    broadcast,
    
    // Presence methods
    updatePresence,
    getOnlineUsers,
    presence,
    
    // Typing indicators
    startTyping,
    stopTyping,
    
    // Receipts
    sendReadReceipt,
    sendDeliveryReceipt,
    
    // Queue management
    messageQueue,
    clearQueue: useCallback(() => setMessageQueue([]), []),
    
    // History
    messageHistory,
    clearHistory: useCallback(() => setMessageHistory([]), []),
    
    // Subscriptions
    subscriptions,
    
    // Stats
    getConnectionStats,
    
    // Constants
    SOCKET_EVENTS,
    CONNECTION_STATES,
    MESSAGE_TYPES
  };
};

// Specialized hooks
export const useChatSocket = (room, options = {}) => {
  const socket = useSocket('chat', options);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!room) return;

    socket.joinRoom(room);

    const handleMessage = (data) => {
      setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleTypingStart = (data) => {
      setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
    };

    const handleTypingStop = (data) => {
      setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
    };

    const handleReadReceipt = (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, read: true } : msg
      ));
    };

    socket.on('chat_message', handleMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('read_receipt', handleReadReceipt);

    return () => {
      socket.leaveRoom(room);
      socket.off('chat_message', handleMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('read_receipt', handleReadReceipt);
    };
  }, [room, socket]);

  const sendMessage = useCallback((content, type = MESSAGE_TYPES.CHAT) => {
    return socket.sendToRoom(room, 'chat_message', {
      content,
      type,
      room
    });
  }, [room, socket]);

  const markAsRead = useCallback((messageId) => {
    socket.sendReadReceipt(messageId, room);
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [room, socket]);

  return {
    ...socket,
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    markAsRead,
    startTyping: () => socket.startTyping(room),
    stopTyping: () => socket.stopTyping(room)
  };
};

export const useNotificationSocket = (options = {}) => {
  const socket = useSocket('notifications', options);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const handleNotification = (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
      if (!data.read) {
        setUnreadNotifications(prev => prev + 1);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const markAsRead = useCallback((notificationId) => {
    socket.send('mark_read', { notificationId });
    setUnreadNotifications(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    socket.send('mark_all_read', {});
    setUnreadNotifications(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [socket]);

  return {
    ...socket,
    notifications,
    unreadNotifications,
    markAsRead,
    markAllAsRead
  };
};

export const usePresenceSocket = (userId, options = {}) => {
  const socket = useSocket('presence', options);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    socket.updatePresence('online', { userId });

    const handlePresenceUpdate = (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: { ...data, lastSeen: Date.now() }
      }));
    };

    const handleUserOffline = (data) => {
      setOnlineUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[data.userId];
        return newUsers;
      });
    };

    socket.on('presence_update', handlePresenceUpdate);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.updatePresence('offline', { userId });
      socket.off('presence_update', handlePresenceUpdate);
      socket.off('user_offline', handleUserOffline);
    };
  }, [userId, socket]);

  const getUserStatus = useCallback((targetUserId) => {
    return onlineUsers[targetUserId]?.status || 'offline';
  }, [onlineUsers]);

  return {
    ...socket,
    onlineUsers,
    getUserStatus
  };
};

// Export constants
export const SOCKET_CONSTANTS = {
  EVENTS: SOCKET_EVENTS,
  CONNECTION_STATES,
  MESSAGE_TYPES,
  DEFAULTS: DEFAULT_OPTIONS
};

export default useSocket;
