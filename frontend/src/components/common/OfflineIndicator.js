import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(!navigator.onLine);
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      setWasOffline(true);
      
      // Show reconnected message
      setShowReconnectedMessage(true);
      setTimeout(() => setShowReconnectedMessage(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setShowReconnectedMessage(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const styles = {
    offlineContainer: {
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      zIndex: 9998,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    offlineMessage: {
      background: '#ff6b6b',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: 500,
      pointerEvents: 'all',
      animation: 'slideDown 0.3s ease-in-out',
    },
    reconnectedMessage: {
      background: '#51cf66',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(81,207,102,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      fontWeight: 500,
      pointerEvents: 'all',
      animation: 'slideDown 0.3s ease-in-out',
    },
    refreshButton: {
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.3s ease',
    },
    icon: {
      fontSize: '18px',
    },
    offlineIndicator: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#ff6b6b',
      color: 'white',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
      zIndex: 9999,
      animation: 'pulse 2s infinite',
    },
    onlineIndicator: {
      background: '#51cf66',
      boxShadow: '0 4px 12px rgba(81,207,102,0.3)',
    },
    progressBar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: '#f1f3f5',
      zIndex: 10000,
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #51cf66, #20c997)',
      transition: 'width 0.3s ease',
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .offline-indicator:hover {
            transform: scale(1.1);
          }
        `}
      </style>

      {/* Top banner messages */}
      {showOfflineMessage && (
        <div style={styles.offlineContainer}>
          <div style={styles.offlineMessage}>
            <FiWifiOff style={styles.icon} />
            <span>You are offline. Some features may be unavailable.</span>
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      )}

      {showReconnectedMessage && (
        <div style={styles.offlineContainer}>
          <div style={styles.reconnectedMessage}>
            <FiWifi style={styles.icon} />
            <span>Back online! Your connection has been restored.</span>
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Bottom corner indicator */}
      {!isOnline && (
        <div 
          style={styles.offlineIndicator}
          className="offline-indicator"
          title="You are offline"
        >
          <FiWifiOff />
        </div>
      )}

      {isOnline && wasOffline && (
        <div 
          style={{...styles.offlineIndicator, ...styles.onlineIndicator}}
          className="offline-indicator"
          title="You are back online"
          onClick={() => setWasOffline(false)}
        >
          <FiWifi />
        </div>
      )}
    </>
  );
};

// Advanced version with connection quality monitoring
export const AdvancedOfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnectionQuality = () => {
        if (connection.downlink) {
          if (connection.downlink < 0.5) setConnectionQuality('poor');
          else if (connection.downlink < 1.5) setConnectionQuality('fair');
          else if (connection.downlink < 5) setConnectionQuality('good');
          else setConnectionQuality('excellent');
        }
      };

      updateConnectionQuality();
      connection.addEventListener('change', updateConnectionQuality);

      return () => {
        connection.removeEventListener('change', updateConnectionQuality);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getQualityColor = () => {
    switch(connectionQuality) {
      case 'poor': return '#ff6b6b';
      case 'fair': return '#ffd93d';
      case 'good': return '#51cf66';
      case 'excellent': return '#20c997';
      default: return '#868e96';
    }
  };

  const getQualityText = () => {
    switch(connectionQuality) {
      case 'poor': return 'Poor Connection';
      case 'fair': return 'Fair Connection';
      case 'good': return 'Good Connection';
      case 'excellent': return 'Excellent Connection';
      default: return 'Unknown Connection';
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      bottom: '80px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    indicator: {
      background: isOnline ? getQualityColor() : '#ff6b6b',
      color: 'white',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
      animation: isOnline ? 'none' : 'pulse 2s infinite',
    },
    details: {
      background: 'white',
      borderRadius: '10px',
      padding: '15px',
      marginTop: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      minWidth: '200px',
    },
    detailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '13px',
    },
    label: {
      color: '#666',
    },
    value: {
      color: '#333',
      fontWeight: 500,
    },
    progressBar: {
      width: '100%',
      height: '4px',
      background: '#e9ecef',
      borderRadius: '2px',
      marginTop: '10px',
    },
    progressFill: {
      height: '100%',
      background: getQualityColor(),
      borderRadius: '2px',
      width: connectionQuality === 'poor' ? '25%' :
        connectionQuality === 'fair' ? '50%' :
          connectionQuality === 'good' ? '75%' :
            connectionQuality === 'excellent' ? '100%' : '0%',
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>

      <div style={styles.container}>
        <div 
          style={styles.indicator}
          onClick={() => setShowDetails(!showDetails)}
          title={isOnline ? getQualityText() : 'Offline'}
        >
          {isOnline ? <FiWifi /> : <FiWifiOff />}
        </div>

        {showDetails && (
          <div style={styles.details}>
            <div style={styles.detailItem}>
              <span style={styles.label}>Status:</span>
              <span style={styles.value}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {isOnline && (
              <>
                <div style={styles.detailItem}>
                  <span style={styles.label}>Connection:</span>
                  <span style={styles.value}>{getQualityText()}</span>
                </div>
                
                {navigator.connection && (
                  <>
                    <div style={styles.detailItem}>
                      <span style={styles.label}>Downlink:</span>
                      <span style={styles.value}>
                        {navigator.connection.downlink} Mbps
                      </span>
                    </div>
                    
                    <div style={styles.detailItem}>
                      <span style={styles.label}>RTT:</span>
                      <span style={styles.value}>
                        {navigator.connection.rtt} ms
                      </span>
                    </div>
                    
                    <div style={styles.detailItem}>
                      <span style={styles.label}>Type:</span>
                      <span style={styles.value}>
                        {navigator.connection.effectiveType}
                      </span>
                    </div>
                  </>
                )}
                
                <div style={styles.progressBar}>
                  <div style={styles.progressFill} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OfflineIndicator;
