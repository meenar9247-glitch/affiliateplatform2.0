import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = '#667eea', fullScreen = false }) => {
  const getSize = () => {
    switch(size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  };

  const spinnerSize = getSize();

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...(fullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.9)',
        zIndex: 9999,
      } : {
        padding: '20px',
      }),
    },
    spinner: {
      width: spinnerSize,
      height: spinnerSize,
      border: '3px solid #f3f3f3',
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    text: {
      marginLeft: '10px',
      color: '#666',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.spinner}></div>
      <span style={styles.text}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
