import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  image,
  imageAlt = 'Card image',
  header,
  footer,
  variant = 'default',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  // Card variants
  const variants = {
    default: 'card-default',
    bordered: 'card-bordered',
    elevated: 'card-elevated',
    flat: 'card-flat',
    primary: 'card-primary',
    success: 'card-success',
    danger: 'card-danger',
    warning: 'card-warning'
  };

  const cardClasses = [
    'card',
    variants[variant] || 'card-default',
    hoverable ? 'card-hoverable' : '',
    clickable ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses} 
      onClick={handleClick}
      role={clickable ? 'button' : 'article'}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {/* Image Section */}
      {image && (
        <div className="card-image">
          <img src={image} alt={imageAlt} loading="lazy" />
        </div>
      )}

      {/* Header Section */}
      {header && <div className="card-header">{header}</div>}

      {/* Content Section */}
      <div className="card-content">
        {/* Title */}
        {title && <h3 className="card-title">{title}</h3>}
        
        {/* Subtitle */}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        
        {/* Main Content */}
        {children && <div className="card-body">{children}</div>}
      </div>

      {/* Footer Section */}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// Styles for the card
const styles = `
  .card {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Card Variants */
  .card-default {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-bordered {
    border: 1px solid #e9ecef;
    box-shadow: none;
  }

  .card-elevated {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  .card-flat {
    background: #f8f9fa;
    box-shadow: none;
  }

  .card-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .card-primary .card-title,
  .card-primary .card-subtitle,
  .card-primary .card-body {
    color: white;
  }

  .card-success {
    background: #28a745;
    color: white;
  }

  .card-success .card-title,
  .card-success .card-subtitle,
  .card-success .card-body {
    color: white;
  }

  .card-danger {
    background: #dc3545;
    color: white;
  }

  .card-danger .card-title,
  .card-danger .card-subtitle,
  .card-danger .card-body {
    color: white;
  }

  .card-warning {
    background: #ffc107;
    color: #212529;
  }

  .card-warning .card-title,
  .card-warning .card-subtitle,
  .card-warning .card-body {
    color: #212529;
  }

  /* Hover Effects */
  .card-hoverable:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
  }

  .card-clickable {
    cursor: pointer;
  }

  .card-clickable:active {
    transform: scale(0.98);
  }

  .card-clickable:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }

  /* Card Sections */
  .card-image {
    width: 100%;
    overflow: hidden;
  }

  .card-image img {
    width: 100%;
    height: auto;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .card-hoverable:hover .card-image img {
    transform: scale(1.05);
  }

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e9ecef;
    font-weight: 600;
  }

  .card-primary .card-header,
  .card-success .card-header,
  .card-danger .card-header {
    border-bottom-color: rgba(255, 255, 255, 0.2);
  }

  .card-content {
    padding: 20px;
    flex: 1;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  .card-subtitle {
    font-size: 14px;
    color: #6c757d;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .card-body {
    font-size: 14px;
    line-height: 1.6;
    color: #4a5568;
  }

  .card-footer {
    padding: 16px 20px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .card-primary .card-footer,
  .card-success .card-footer,
  .card-danger .card-footer {
    border-top-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
  }

  /* Card with no padding */
  .card-no-padding .card-content {
    padding: 0;
  }

  /* Card with image overlay */
  .card-image-overlay {
    position: relative;
  }

  .card-image-overlay .card-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .card-image-overlay .card-image img {
    height: 100%;
    object-fit: cover;
  }

  .card-image-overlay .card-content {
    position: relative;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .card-image-overlay .card-title,
  .card-image-overlay .card-subtitle,
  .card-image-overlay .card-body {
    color: white;
  }

  /* Card Grid Layout */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  /* Card Horizontal Layout */
  .card-horizontal {
    display: flex;
    flex-direction: row;
  }

  .card-horizontal .card-image {
    flex: 0 0 40%;
  }

  .card-horizontal .card-image img {
    height: 100%;
    object-fit: cover;
  }

  /* Card Sizes */
  .card-sm .card-content {
    padding: 12px;
  }

  .card-sm .card-title {
    font-size: 16px;
  }

  .card-sm .card-body {
    font-size: 12px;
  }

  .card-lg .card-content {
    padding: 24px;
  }

  .card-lg .card-title {
    font-size: 20px;
  }

  .card-lg .card-body {
    font-size: 16px;
  }

  /* Loading State */
  .card-loading {
    position: relative;
    overflow: hidden;
  }

  .card-loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Card Actions */
  .card-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .card-actions .btn {
    flex: 1;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card-horizontal {
      flex-direction: column;
    }

    .card-horizontal .card-image {
      flex: auto;
    }

    .card-grid {
      grid-template-columns: 1fr;
    }

    .card-header,
    .card-footer {
      padding: 12px 16px;
    }

    .card-content {
      padding: 16px;
    }
  }

  /* Dark Mode Support */
  @media (prefers-color-scheme: dark) {
    .card {
      background: #2d3748;
    }

    .card-title {
      color: #f7fafc;
    }

    .card-subtitle {
      color: #a0aec0;
    }

    .card-body {
      color: #e2e8f0;
    }

    .card-header,
    .card-footer {
      border-color: #4a5568;
      background: #1a202c;
    }

    .card-flat {
      background: #1a202c;
    }
  }
`;

export default Card;
