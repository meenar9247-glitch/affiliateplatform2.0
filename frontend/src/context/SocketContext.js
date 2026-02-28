import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext();

// Custom hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider component
export const SocketProvider = ({ children, url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000' }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketInstance = io(url, {
      auth: {
        token: localStorage.getItem('token'),
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketInstance.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    // Set up listeners from ref
    listenersRef.current.forEach((callback, event) => {
      socketInstance.on(event, callback);
    });

    // Cleanup
    return () => {
      socketInstance.disconnect();
      socketInstance.close();
    };
  }, [url, isAuthenticated, user]);

  // Listen to events
  const on = useCallback((event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, callback);
      if (socket) {
        socket.on(event, callback);
      }
    }
  }, [socket]);

  // Remove listener
  const off = useCallback((event, callback) => {
    if (listenersRef.current.has(event)) {
      listenersRef.current.delete(event);
      if (socket) {
        socket.off(event, callback);
      }
    }
  }, [socket]);

  // Emit event
  const emit = useCallback((event, data, callback) => {
    if (socket && connected) {
      socket.emit(event, data, callback);
    }
  }, [socket, connected]);

  // Join room
  const joinRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('join-room', room);
    }
  }, [socket, connected]);

  // Leave room
  const leaveRoom = useCallback((room) => {
    if (socket && connected) {
      socket.emit('leave-room', room);
    }
  }, [socket, connected]);

  // Send message
  const sendMessage = useCallback((message, room) => {
    if (socket && connected) {
      socket.emit('send-message', { message, room });
    }
  }, [socket, connected]);

  // Typing indicator
  const startTyping = useCallback((room) => {
    if (socket && connected) {
      socket.emit('typing-start', room);
    }
  }, [socket, connected]);

  const stopTyping = useCallback((room) => {
    if (socket && connected) {
      socket.emit('typing-stop', room);
    }
  }, [socket, connected]);

  const value = {
    socket,
    connected,
    onlineUsers,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
