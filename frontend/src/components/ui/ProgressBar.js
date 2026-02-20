import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiX,
  FiAlertCircle,
  FiClock,
  FiLoader,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';

const ProgressBar = ({
  percent = 0,
  value = 0,
  max = 100,
  min = 0,
  type = 'linear', // linear, circular, dashboard, steps
  variant = 'default', // default, success, warning, danger, info, gradient
  size = 'medium', // small, medium, large, xl
  thickness = 8,
  color,
  trackColor,
  label,
  valueLabel,
  showValue = true,
  showPercent = true,
  showLabel = true,
  showIcon = false,
  striped = false,
  animated = true,
  animationDuration = 300,
  indeterminate = false,
  buffer = false,
  bufferValue = 0,
  steps = [],
  step = 0,
  format = 'percentage', // percentage, fraction, value
  labelPosition = 'top', // top, bottom, left, right, inside
  iconPosition = 'left', // left, right
  className = '',
  barClassName = '',
  labelClassName = '',
  valueClassName = '',
  onComplete,
  ...props
}) => {
  const [progress, setProgress] = useState(0);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Calculate progress percentage
    const calculatedPercent = percent || ((value - min) / (max - min)) * 100;
    setProgress(Math.min(100, Math.max(0, calculatedPercent)));

    // Format display value
    if (format === 'percentage') {
      setDisplayValue(`${Math.round(progress)}%`);
    } else if (format === 'fraction') {
      setDisplayValue(`${value}/${max}`);
    } else {
      setDisplayValue(`${value}`);
    }
  }, [percent, value, min, max, format, progress]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  // Size classes
  const sizeClasses = {
    small: 'progress-small',
    medium: 'progress-medium',
    large: 'progress-large',
    xl: 'progress-xl'
  };

  // Variant classes
  const variantClasses = {
    default: 'progress-default',
    success: 'progress-success',
    warning: 'progress-warning',
    danger: 'progress-danger',
    info: 'progress-info',
    gradient: 'progress-gradient'
  };

  // Get variant color
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'danger':
        return 'var(--danger)';
      case 'info':
        return 'var(--info)';
      case 'gradient':
        return 'linear-gradient(90deg, var(--primary), var(--secondary))';
      default:
        return color || 'var(--primary)';
    }
  };

  // Get icon
  const getIcon = () => {
    if (progress >= 100) return <FiCheck />;
    if (variant === 'danger') return <FiX />;
    if (variant === 'warning') return <FiAlertCircle />;
    if (indeterminate) return <FiLoader className="spin" />;
    if (progress > 50) return <FiTrendingUp />;
    return <FiActivity />;
  };

  // Linear Progress Bar
  const LinearProgress = () => (
    <div
      className={`
        progress-linear
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${striped ? 'striped' : ''}
        ${animated ? 'animated' : ''}
        ${barClassName}
      `}
      style={{
        height: thickness,
        backgroundColor: trackColor || 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-full)'
      }}
    >
      {/* Buffer bar */}
      {buffer && bufferValue > 0 && (
        <div
          className="progress-buffer"
          style={{
            width: `${bufferValue}%`,
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-full)',
            position: 'absolute'
          }}
        />
      )}

      {/* Main progress bar */}
      <div
        className="progress-bar"
        style={{
          width: indeterminate ? '25%' : `${progress}%`,
          height: '100%',
          background: getVariantColor(),
          borderRadius: 'var(--radius-full)',
          transition: animated ? `width ${animationDuration}ms var(--transition-ease)` : 'none',
          position: 'relative',
          animation: indeterminate ? 'indeterminate 1.5s infinite linear' : 'none'
        }}
      >
        {/* Glow effect */}
        {animated && !indeterminate && (
          <div className="progress-glow" />
        )}
      </div>
    </div>
  );

  // Circular Progress Bar
  const CircularProgress = () => {
    const sizeMap = {
      small: 80,
      medium: 120,
      large: 160,
      xl: 200
    };
    const strokeWidth = thickness;
    const radius = (sizeMap[size] / 2) - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        className={`progress-circular ${sizeClasses[size]}`}
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      >
        <svg
          width={sizeMap[size]}
          height={sizeMap[size]}
          viewBox={`0 0 ${sizeMap[size]} ${sizeMap[size]}`}
        >
          {/* Track */}
          <circle
            className="progress-track"
            cx={sizeMap[size] / 2}
            cy={sizeMap[size] / 2}
            r={radius}
            fill="none"
            stroke={trackColor || 'var(--bg-tertiary)'}
            strokeWidth={strokeWidth}
          />

          {/* Progress */}
          <circle
            className="progress-circle"
            cx={sizeMap[size] / 2}
            cy={sizeMap[size] / 2}
            r={radius}
            fill="none"
            stroke={getVariantColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animated ? `stroke-dashoffset ${animationDuration}ms var(--transition-ease)` : 'none'
            }}
            transform={`rotate(-90 ${sizeMap[size] / 2} ${sizeMap[size] / 2})`}
          />

          {/* Inner content */}
          {showValue && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".3em"
              className="progress-value-text"
            >
              {Math.round(progress)}%
            </text>
          )}
        </svg>
      </div>
    );
  };

  // Dashboard Progress (combination of linear and value)
  const DashboardProgress = () => (
    <div className={`progress-dashboard ${sizeClasses[size]}`}>
      <div className="dashboard-header">
        {label && <span className="dashboard-label">{label}</span>}
        {showValue && (
          <span className="dashboard-value">
            {valueLabel || displayValue}
          </span>
        )}
      </div>
      <LinearProgress />
    </div>
  );

  // Steps Progress
  const StepsProgress = () => (
    <div className={`progress-steps ${sizeClasses[size]}`}>
      {steps.map((stepItem, index) => {
        const isCompleted = index < step;
        const isCurrent = index === step;
        const stepProgress = isCompleted ? 100 : (isCurrent ? progress : 0);

        return (
          <div key={index} className="step-item">
            <div className="step-indicator">
              <div
                className="step-progress"
                style={{
                  width: `${stepProgress}%`,
                  background: getVariantColor()
                }}
              />
            </div>
            <div className="step-label">
              <span className="step-title">{stepItem.title}</span>
              {stepItem.description && (
                <span className="step-description">{stepItem.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Styles
  const styles = `
    .progress-wrapper {
      position: relative;
      width: 100%;
    }

    /* Label Positions */
    .progress-label-top {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-label-bottom {
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }

    .progress-label-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-label-right {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      gap: 12px;
    }

    .progress-label-inside {
      position: relative;
    }

    /* Progress Label */
    .progress-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
    }

    .progress-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .progress-icon.left {
      margin-right: 4px;
    }

    .progress-icon.right {
      margin-left: 4px;
    }

    .progress-text {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
    }

    .progress-value {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    /* Linear Progress */
    .progress-linear {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .progress-bar {
      position: relative;
      overflow: hidden;
    }

    .progress-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: shine 2s infinite;
    }

    @keyframes shine {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Striped */
    .striped .progress-bar {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }

    .striped.animated .progress-bar {
      animation: progress-bar-stripes 1s linear infinite;
    }

    @keyframes progress-bar-stripes {
      0% {
        background-position: 1rem 0;
      }
      100% {
        background-position: 0 0;
      }
    }

    /* Indeterminate */
    @keyframes indeterminate {
      0% {
        left: -25%;
        width: 25%;
      }
      50% {
        left: 50%;
        width: 50%;
      }
      100% {
        left: 100%;
        width: 25%;
      }
    }

    /* Circular Progress */
    .progress-circular {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .progress-track {
      stroke: var(--bg-tertiary);
    }

    .progress-circle {
      transition: stroke-dashoffset 0.3s ease;
    }

    .progress-value-text {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      fill: var(--text-primary);
    }

    /* Dashboard Progress */
    .progress-dashboard {
      width: 100%;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .dashboard-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .dashboard-value {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    /* Steps Progress */
    .progress-steps {
      width: 100%;
    }

    .step-item {
      margin-bottom: 16px;
    }

    .step-indicator {
      position: relative;
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
      margin-bottom: 8px;
      overflow: hidden;
    }

    .step-progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }

    .step-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .step-title {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .step-description {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    /* Size Variants */
    .progress-small .progress-label {
      font-size: var(--text-xs);
    }

    .progress-small .progress-value {
      font-size: var(--text-xs);
    }

    .progress-large .progress-label {
      font-size: var(--text-base);
    }

    .progress-large .progress-value {
      font-size: var(--text-base);
    }

    .progress-xl .progress-label {
      font-size: var(--text-lg);
    }

    .progress-xl .progress-value {
      font-size: var(--text-lg);
    }

    /* Variant Colors */
    .progress-success .progress-bar {
      background: var(--success);
    }

    .progress-warning .progress-bar {
      background: var(--warning);
    }

    .progress-danger .progress-bar {
      background: var(--danger);
    }

    .progress-info .progress-bar {
      background: var(--info);
    }

    .progress-gradient .progress-bar {
      background: linear-gradient(90deg, var(--primary), var(--secondary));
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .progress-label {
        color: var(--dark-text-primary);
      }

      .progress-value {
        color: var(--dark-text-muted);
      }

      .progress-track {
        stroke: var(--dark-bg-tertiary);
      }

      .progress-value-text {
        fill: var(--dark-text-primary);
      }

      .dashboard-label {
        color: var(--dark-text-muted);
      }

      .dashboard-value {
        color: var(--dark-text-primary);
      }

      .step-indicator {
        background: var(--dark-bg-tertiary);
      }

      .step-title {
        color: var(--dark-text-primary);
      }

      .step-description {
        color: var(--dark-text-muted);
      }
    }

    /* Animation */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation: spin 1s linear infinite;
    }
  `;

  const renderProgress = () => {
    switch (type) {
      case 'circular':
        return <CircularProgress />;
      case 'dashboard':
        return <DashboardProgress />;
      case 'steps':
        return <StepsProgress />;
      default:
        return <LinearProgress />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          progress-wrapper
          progress-label-${labelPosition}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {/* Label */}
        {(label || showIcon) && labelPosition !== 'inside' && (
          <div className="progress-label">
            {showIcon && iconPosition === 'left' && (
              <span className="progress-icon left">{getIcon()}</span>
            )}
            {showLabel && label && (
              <span className="progress-text">{label}</span>
            )}
            {showIcon && iconPosition === 'right' && (
              <span className="progress-icon right">{getIcon()}</span>
            )}
            {showValue && labelPosition === 'top' && type === 'linear' && (
              <span className="progress-value">{valueLabel || displayValue}</span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {renderProgress()}

        {/* Inside Label */}
        {labelPosition === 'inside' && (
          <div
            className="progress-label-inside"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {showValue && (
              <span className="progress-value">{valueLabel || displayValue}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Simple Progress Bar
export const SimpleProgress = ({ percent, ...props }) => {
  return (
    <ProgressBar
      percent={percent}
      type="linear"
      size="small"
      showValue={false}
      showLabel={false}
      {...props}
    />
  );
};

// Circular Progress Ring
export const ProgressRing = ({ percent, size = 120, ...props }) => {
  return (
    <ProgressBar
      percent={percent}
      type="circular"
      size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
      {...props}
    />
  );
};

// Step Progress
export const StepProgress = ({ steps, current, ...props }) => {
  return (
    <ProgressBar
      type="steps"
      steps={steps}
      step={current}
      {...props}
    />
  );
};

// Loading Bar (indeterminate)
export const LoadingBar = ({ ...props }) => {
  return (
    <ProgressBar
      indeterminate
      type="linear"
      size="small"
      showValue={false}
      showLabel={false}
      {...props}
    />
  );
};

// Multi Progress (multiple bars stacked)
export const MultiProgress = ({ sections = [], ...props }) => {
  const styles = `
    .multi-progress {
      display: flex;
      gap: 2px;
      height: 8px;
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .multi-progress-section {
      height: 100%;
      transition: width 0.3s ease;
    }

    .multi-progress-section:first-child {
      border-radius: var(--radius-full) 0 0 var(--radius-full);
    }

    .multi-progress-section:last-child {
      border-radius: 0 var(--radius-full) var(--radius-full) 0;
    }

    .multi-progress-legend {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-xs);
    }

    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .legend-label {
      color: var(--text-secondary);
    }

    .legend-value {
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    @media (prefers-color-scheme: dark) {
      .legend-label {
        color: var(--dark-text-muted);
      }

      .legend-value {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="multi-progress-wrapper">
        <div className="multi-progress">
          {sections.map((section, index) => (
            <div
              key={index}
              className="multi-progress-section"
              style={{
                width: `${section.percent}%`,
                backgroundColor: section.color || 'var(--primary)'
              }}
            />
          ))}
        </div>

        <div className="multi-progress-legend">
          {sections.map((section, index) => (
            <div key={index} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: section.color || 'var(--primary)' }}
              />
              <span className="legend-label">{section.label}</span>
              <span className="legend-value">{section.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProgressBar;
