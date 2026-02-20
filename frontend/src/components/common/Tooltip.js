import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  hideDelay = 100,
  trigger = 'hover', // hover, click, focus
  theme = 'dark', // dark, light
  size = 'medium', // small, medium, large
  arrow = true,
  interactive = false,
  disabled = false,
  maxWidth = 250,
  className = '',
  contentClassName = '',
  onShow,
  onHide,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Position classes
  const positionClasses = {
    top: 'tooltip-top',
    bottom: 'tooltip-bottom',
    left: 'tooltip-left',
    right: 'tooltip-right'
  };

  // Theme classes
  const themeClasses = {
    dark: 'tooltip-dark',
    light: 'tooltip-light'
  };

  // Size classes
  const sizeClasses = {
    small: 'tooltip-small',
    medium: 'tooltip-medium',
    large: 'tooltip-large'
  };

  // Calculate position
  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top + scrollY - tooltipRect.height - 8;
        left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + scrollY + 8;
        left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + scrollX + 8;
        break;
      default:
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 0) top = 8;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  // Event handlers
  const handleShow = () => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      if (onShow) onShow();
    }, delay);
  };

  const handleHide = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      if (onHide) onHide();
    }, hideDelay);
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isVisible) {
      handleHide();
    } else {
      handleShow();
    }
  };

  // Effects
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      const handleScroll = () => {
        calculatePosition();
      };
      
      const handleResize = () => {
        calculatePosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [children, content, position]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Event listeners based on trigger type
  const eventHandlers = {
    hover: {
      onMouseEnter: handleShow,
      onMouseLeave: interactive ? null : handleHide,
      onMouseMove: calculatePosition
    },
    click: {
      onClick: handleClick
    },
    focus: {
      onFocus: handleShow,
      onBlur: handleHide
    }
  };

  // Styles
  const styles = `
    .tooltip-wrapper {
      display: inline-block;
    }

    /* Tooltip */
    .tooltip-portal {
      position: absolute;
      z-index: var(--z-tooltip);
      pointer-events: ${interactive ? 'auto' : 'none'};
    }

    .tooltip-content {
      position: relative;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      line-height: 1.5;
      word-wrap: break-word;
      animation: tooltipFadeIn 0.2s ease;
      max-width: ${maxWidth}px;
    }

    /* Size Variants */
    .tooltip-small {
      padding: 4px 8px;
      font-size: var(--text-xs);
    }

    .tooltip-medium {
      padding: 6px 10px;
      font-size: var(--text-sm);
    }

    .tooltip-large {
      padding: 8px 12px;
      font-size: var(--text-base);
    }

    /* Theme Variants */
    .tooltip-dark {
      background: var(--gray-900);
      color: white;
    }

    .tooltip-light {
      background: white;
      color: var(--gray-900);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
    }

    /* Arrow */
    .tooltip-arrow {
      position: absolute;
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
    }

    .tooltip-top .tooltip-arrow {
      bottom: -4px;
      left: 50%;
      margin-left: -4px;
    }

    .tooltip-bottom .tooltip-arrow {
      top: -4px;
      left: 50%;
      margin-left: -4px;
    }

    .tooltip-left .tooltip-arrow {
      right: -4px;
      top: 50%;
      margin-top: -4px;
    }

    .tooltip-right .tooltip-arrow {
      left: -4px;
      top: 50%;
      margin-top: -4px;
    }

    .tooltip-dark .tooltip-arrow {
      background: var(--gray-900);
    }

    .tooltip-light .tooltip-arrow {
      background: white;
      border: 1px solid var(--border);
    }

    /* Animations */
    @keyframes tooltipFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .tooltip-light {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .tooltip-light .tooltip-arrow {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }
    }
  `;

  const target = (
    <span
      ref={targetRef}
      className={`tooltip-wrapper ${className}`}
      {...eventHandlers[trigger]}
      {...props}
    >
      {children}
    </span>
  );

  const tooltip = isVisible && content && (
    createPortal(
      <div
        ref={tooltipRef}
        className="tooltip-portal"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
        onMouseEnter={interactive ? handleShow : undefined}
        onMouseLeave={interactive ? handleHide : undefined}
      >
        <div
          className={`
            tooltip-content
            ${themeClasses[theme]}
            ${sizeClasses[size]}
            ${positionClasses[position]}
            ${contentClassName}
          `}
        >
          {content}
          {arrow && <div className="tooltip-arrow" />}
        </div>
      </div>,
      document.body
    )
  );

  return (
    <>
      <style>{styles}</style>
      {target}
      {tooltip}
    </>
  );
};

// Rich Tooltip Component
export const RichTooltip = ({
  title,
  description,
  image,
  actions,
  ...props
}) => {
  const styles = `
    .rich-tooltip {
      padding: 0;
      overflow: hidden;
    }

    .rich-tooltip-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .rich-tooltip-header {
      padding: 12px 12px 8px;
      font-weight: var(--font-semibold);
    }

    .rich-tooltip-body {
      padding: 0 12px 12px;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .rich-tooltip-actions {
      display: flex;
      border-top: 1px solid var(--border);
    }

    .rich-tooltip-action {
      flex: 1;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-sm);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .rich-tooltip-action:hover {
      background: var(--bg-tertiary);
    }

    .rich-tooltip-action:not(:last-child) {
      border-right: 1px solid var(--border);
    }

    @media (prefers-color-scheme: dark) {
      .rich-tooltip-body {
        color: var(--dark-text-secondary);
      }

      .rich-tooltip-actions {
        border-top-color: var(--dark-border);
      }

      .rich-tooltip-action:not(:last-child) {
        border-right-color: var(--dark-border);
      }

      .rich-tooltip-action:hover {
        background: var(--dark-bg-tertiary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Tooltip
        content={
          <div className="rich-tooltip">
            {image && (
              <img src={image} alt={title} className="rich-tooltip-image" />
            )}
            {title && <div className="rich-tooltip-header">{title}</div>}
            {description && (
              <div className="rich-tooltip-body">{description}</div>
            )}
            {actions && (
              <div className="rich-tooltip-actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="rich-tooltip-action"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
        interactive
        {...props}
      />
    </>
  );
};

// HTML Tooltip Component
export const HTMLTooltip = ({ html, ...props }) => {
  const styles = `
    .html-tooltip {
      pointer-events: none;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Tooltip
        content={<div dangerouslySetInnerHTML={{ __html: html }} />}
        {...props}
      />
    </>
  );
};

// Tooltip Provider for global configuration
export const TooltipProvider = ({ children, config = {} }) => {
  const [tooltips, setTooltips] = useState([]);

  const showTooltip = (id, content, options = {}) => {
    setTooltips(prev => [...prev, { id, content, ...options }]);
  };

  const hideTooltip = (id) => {
    setTooltips(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {children}
      {tooltips.map(tooltip => (
        <Tooltip key={tooltip.id} {...tooltip} />
      ))}
    </>
  );
};

// Tooltip Hook
export const useTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);
  const toggle = () => setIsVisible(prev => !prev);

  useEffect(() => {
    if (!targetRef.current || !isVisible) return;

    const updatePosition = () => {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return {
    isVisible,
    position,
    targetRef,
    show,
    hide,
    toggle
  };
};

export default Tooltip;
