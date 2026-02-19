import React from 'react';

const Loader = ({
  type = 'spinner',
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  text = '',
  overlay = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  };

  // Color classes
  const colorClasses = {
    primary: 'loader-primary',
    secondary: 'loader-secondary',
    success: 'loader-success',
    danger: 'loader-danger',
    warning: 'loader-warning',
    info: 'loader-info',
    light: 'loader-light',
    dark: 'loader-dark'
  };

  // Render spinner
  const renderSpinner = () => (
    <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
      <div className="spinner-blade"></div>
    </div>
  );

  // Render dots
  const renderDots = () => (
    <div className={`dots ${sizeClasses[size]}`}>
      <div className={`dot ${colorClasses[color]}`}></div>
      <div className={`dot ${colorClasses[color]}`}></div>
      <div className={`dot ${colorClasses[color]}`}></div>
    </div>
  );

  // Render pulse
  const renderPulse = () => (
    <div className={`pulse ${sizeClasses[size]} ${colorClasses[color]}`}>
      <div className="pulse-circle"></div>
    </div>
  );

  // Render progress bar
  const renderProgress = () => (
    <div className={`progress-loader ${sizeClasses[size]}`}>
      <div className={`progress-bar ${colorClasses[color]}`}></div>
    </div>
  );

  // Render skeleton
  const renderSkeleton = () => (
    <div className="skeleton-loader">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );

  // Select loader type
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'progress':
        return renderProgress();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {overlay && <div className="loader-overlay"></div>}
        <div className="loader-container">
          {renderLoader()}
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  // Normal loader
  return (
    <div className={`loader-wrapper ${className}`}>
      {renderLoader()}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

// Styles
const styles = `
  /* Loader Wrapper */
  .loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  /* Full Screen Loader */
  .loader-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
  }

  .loader-container {
    position: relative;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  /* Loader Text */
  .loader-text {
    margin: 0;
    font-size: 14px;
    color: #666;
    text-align: center;
  }

  /* SPINNER LOADER */
  .spinner {
    position: relative;
    display: inline-block;
  }

  .spinner-small {
    width: 24px;
    height: 24px;
  }

  .spinner-medium {
    width: 40px;
    height: 40px;
  }

  .spinner-large {
    width: 60px;
    height: 60px;
  }

  .spinner-blade {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10%;
    height: 25%;
    background: currentColor;
    border-radius: 2px;
    transform-origin: 50% 100%;
    animation: spinner-fade 1s infinite linear;
  }

  @keyframes spinner-fade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.15;
    }
  }

  .spinner-primary {
    color: #667eea;
  }

  .spinner-secondary {
    color: #764ba2;
  }

  .spinner-success {
    color: #28a745;
  }

  .spinner-danger {
    color: #dc3545;
  }

  .spinner-warning {
    color: #ffc107;
  }

  .spinner-info {
    color: #17a2b8;
  }

  .spinner-light {
    color: #f8f9fa;
  }

  .spinner-dark {
    color: #343a40;
  }

  /* Generate spinner blades */
  .spinner .spinner-blade:nth-child(1) { transform: translate(-50%, -100%) rotate(0deg); animation-delay: -0.04166667s; }
  .spinner .spinner-blade:nth-child(2) { transform: translate(-50%, -100%) rotate(30deg); animation-delay: -0.08333333s; }
  .spinner .spinner-blade:nth-child(3) { transform: translate(-50%, -100%) rotate(60deg); animation-delay: -0.125s; }
  .spinner .spinner-blade:nth-child(4) { transform: translate(-50%, -100%) rotate(90deg); animation-delay: -0.16666667s; }
  .spinner .spinner-blade:nth-child(5) { transform: translate(-50%, -100%) rotate(120deg); animation-delay: -0.20833333s; }
  .spinner .spinner-blade:nth-child(6) { transform: translate(-50%, -100%) rotate(150deg); animation-delay: -0.25s; }
  .spinner .spinner-blade:nth-child(7) { transform: translate(-50%, -100%) rotate(180deg); animation-delay: -0.29166667s; }
  .spinner .spinner-blade:nth-child(8) { transform: translate(-50%, -100%) rotate(210deg); animation-delay: -0.33333333s; }
  .spinner .spinner-blade:nth-child(9) { transform: translate(-50%, -100%) rotate(240deg); animation-delay: -0.375s; }
  .spinner .spinner-blade:nth-child(10) { transform: translate(-50%, -100%) rotate(270deg); animation-delay: -0.41666667s; }
  .spinner .spinner-blade:nth-child(11) { transform: translate(-50%, -100%) rotate(300deg); animation-delay: -0.45833333s; }
  .spinner .spinner-blade:nth-child(12) { transform: translate(-50%, -100%) rotate(330deg); animation-delay: -0.5s; }

  /* DOTS LOADER */
  .dots {
    display: flex;
    gap: 8px;
  }

  .dots .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: dots-bounce 1.4s infinite ease-in-out both;
  }

  .dots.small .dot {
    width: 6px;
    height: 6px;
  }

  .dots.medium .dot {
    width: 10px;
    height: 10px;
  }

  .dots.large .dot {
    width: 14px;
    height: 14px;
  }

  .dots .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dots .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes dots-bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .dots .dot.loader-primary {
    background: #667eea;
  }

  .dots .dot.loader-secondary {
    background: #764ba2;
  }

  .dots .dot.loader-success {
    background: #28a745;
  }

  .dots .dot.loader-danger {
    background: #dc3545;
  }

  .dots .dot.loader-warning {
    background: #ffc107;
  }

  .dots .dot.loader-info {
    background: #17a2b8;
  }

  .dots .dot.loader-light {
    background: #f8f9fa;
  }

  .dots .dot.loader-dark {
    background: #343a40;
  }

  /* PULSE LOADER */
  .pulse {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 1.5s ease-out infinite;
  }

  .pulse.small {
    width: 24px;
    height: 24px;
  }

  .pulse.medium {
    width: 40px;
    height: 40px;
  }

  .pulse.large {
    width: 60px;
    height: 60px;
  }

  @keyframes pulse {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .pulse-primary {
    color: #667eea;
  }

  .pulse-secondary {
    color: #764ba2;
  }

  .pulse-success {
    color: #28a745;
  }

  .pulse-danger {
    color: #dc3545;
  }

  .pulse-warning {
    color: #ffc107;
  }

  .pulse-info {
    color: #17a2b8;
  }

  .pulse-light {
    color: #f8f9fa;
  }

  .pulse-dark {
    color: #343a40;
  }

  /* PROGRESS LOADER */
  .progress-loader {
    width: 200px;
    background: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-loader.small {
    width: 150px;
    height: 4px;
  }

  .progress-loader.medium {
    width: 200px;
    height: 6px;
  }

  .progress-loader.large {
    width: 250px;
    height: 8px;
  }

  .progress-bar {
    height: 100%;
    width: 30%;
    border-radius: 10px;
    animation: progress 1.5s ease-in-out infinite;
  }

  @keyframes progress {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }

  .progress-bar.progress-primary {
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .progress-bar.progress-secondary {
    background: linear-gradient(90deg, #764ba2, #667eea);
  }

  .progress-bar.progress-success {
    background: linear-gradient(90deg, #28a745, #34ce57);
  }

  .progress-bar.progress-danger {
    background: linear-gradient(90deg, #dc3545, #e04b59);
  }

  /* SKELETON LOADER */
  .skeleton-loader {
    width: 100%;
    max-width: 300px;
    padding: 15px;
  }

  .skeleton-line {
    height: 16px;
    margin-bottom: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton 1.5s infinite;
    border-radius: 4px;
  }

  .skeleton-line:last-child {
    width: 60%;
    margin-bottom: 0;
  }

  @keyframes skeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    .loader-text {
      color: #e2e8f0;
    }

    .loader-container {
      background: #1a202c;
    }

    .loader-overlay {
      background: rgba(0, 0, 0, 0.8);
    }

    .skeleton-line {
      background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
    }

    .progress-loader {
      background: #4a5568;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .loader-container {
      padding: 15px;
      max-width: 90%;
    }

    .loader-text {
      font-size: 13px;
    }

    .progress-loader.medium {
      width: 180px;
    }

    .skeleton-loader {
      max-width: 250px;
    }
  }
`;

export default Loader;
