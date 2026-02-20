import React from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
  FiActivity,
  FiStar,
  FiHeart,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';

const Timeline = ({
  items = [],
  direction = 'vertical', // vertical, horizontal
  align = 'left', // left, right, alternate
  mode = 'left', // left, right, alternate (for content)
  size = 'medium', // small, medium, large
  variant = 'outlined', // outlined, contained, minimal
  showConnector = true,
  showIcon = true,
  showTime = true,
  showTitle = true,
  showDescription = true,
  showFooter = true,
  animated = true,
  reverse = false,
  className = '',
  itemClassName = '',
  connectorClassName = '',
  iconClassName = '',
  contentClassName = '',
  timeClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  footerClassName = '',
  onItemClick,
  ...props
}) => {
  // Sort items by date if provided
  const sortedItems = reverse ? [...items].reverse() : items;

  // Size classes
  const sizeClasses = {
    small: 'timeline-small',
    medium: 'timeline-medium',
    large: 'timeline-large'
  };

  // Direction classes
  const directionClasses = {
    vertical: 'timeline-vertical',
    horizontal: 'timeline-horizontal'
  };

  // Align classes
  const alignClasses = {
    left: 'timeline-left',
    right: 'timeline-right',
    alternate: 'timeline-alternate'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'timeline-outlined',
    contained: 'timeline-contained',
    minimal: 'timeline-minimal'
  };

  // Mode classes (for content placement)
  const modeClasses = {
    left: 'timeline-mode-left',
    right: 'timeline-mode-right',
    alternate: 'timeline-mode-alternate'
  };

  // Get icon based on type or custom
  const getIcon = (item) => {
    if (item.icon) return item.icon;

    switch (item.type) {
      case 'success':
        return <FiCheckCircle />;
      case 'error':
        return <FiXCircle />;
      case 'warning':
        return <FiAlertCircle />;
      case 'info':
        return <FiInfo />;
      case 'activity':
        return <FiActivity />;
      case 'achievement':
        return <FiAward />;
      case 'payment':
        return <FiDollarSign />;
      case 'user':
        return <FiUser />;
      case 'email':
        return <FiMail />;
      case 'phone':
        return <FiPhone />;
      case 'calendar':
        return <FiCalendar />;
      case 'trending':
        return <FiTrendingUp />;
      case 'favorite':
        return <FiHeart />;
      case 'star':
        return <FiStar />;
      default:
        return <FiClock />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'timeline-success';
      case 'error':
        return 'timeline-error';
      case 'warning':
        return 'timeline-warning';
      case 'info':
        return 'timeline-info';
      case 'pending':
        return 'timeline-pending';
      case 'active':
        return 'timeline-active';
      case 'inactive':
        return 'timeline-inactive';
      default:
        return 'timeline-default';
    }
  };

  // Get dot color based on status
  const getDotColor = (status) => {
    switch (status) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
        return 'var(--info)';
      case 'pending':
        return 'var(--warning)';
      case 'active':
        return 'var(--primary)';
      case 'inactive':
        return 'var(--gray-400)';
      default:
        return 'var(--primary)';
    }
  };

  // Styles
  const styles = `
    .timeline {
      position: relative;
      display: flex;
      width: 100%;
    }

    /* Direction Variants */
    .timeline-vertical {
      flex-direction: column;
    }

    .timeline-horizontal {
      flex-direction: row;
      overflow-x: auto;
      padding: 20px 0;
    }

    /* Size Variants */
    .timeline-small .timeline-item {
      margin-bottom: 16px;
    }

    .timeline-small .timeline-dot {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }

    .timeline-small .timeline-content {
      padding: 8px 12px;
    }

    .timeline-small .timeline-time {
      font-size: var(--text-xs);
    }

    .timeline-small .timeline-title {
      font-size: var(--text-sm);
    }

    .timeline-small .timeline-description {
      font-size: var(--text-xs);
    }

    .timeline-medium .timeline-item {
      margin-bottom: 24px;
    }

    .timeline-medium .timeline-dot {
      width: 30px;
      height: 30px;
      font-size: 14px;
    }

    .timeline-medium .timeline-content {
      padding: 12px 16px;
    }

    .timeline-medium .timeline-time {
      font-size: var(--text-xs);
    }

    .timeline-medium .timeline-title {
      font-size: var(--text-base);
    }

    .timeline-medium .timeline-description {
      font-size: var(--text-sm);
    }

    .timeline-large .timeline-item {
      margin-bottom: 32px;
    }

    .timeline-large .timeline-dot {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .timeline-large .timeline-content {
      padding: 16px 20px;
    }

    .timeline-large .timeline-time {
      font-size: var(--text-sm);
    }

    .timeline-large .timeline-title {
      font-size: var(--text-lg);
    }

    .timeline-large .timeline-description {
      font-size: var(--text-base);
    }

    /* Variant Styles */
    .timeline-outlined .timeline-item {
      background: transparent;
    }

    .timeline-contained .timeline-item {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .timeline-minimal .timeline-item {
      background: transparent;
      border: none;
    }

    /* Timeline Item */
    .timeline-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      transition: all var(--transition-base) var(--transition-ease);
      cursor: ${onItemClick ? 'pointer' : 'default'};
    }

    .timeline-vertical .timeline-item {
      width: 100%;
    }

    .timeline-horizontal .timeline-item {
      flex-direction: column;
      align-items: center;
      min-width: 200px;
      margin-right: 20px;
    }

    .timeline-item:hover {
      transform: ${animated ? 'translateY(-2px)' : 'none'};
    }

    /* Dot Container */
    .timeline-dot-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      z-index: 2;
    }

    .timeline-horizontal .timeline-dot-container {
      margin-right: 0;
      margin-bottom: 16px;
    }

    .timeline-right .timeline-dot-container {
      margin-right: 0;
      margin-left: 16px;
    }

    /* Dot */
    .timeline-dot {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-primary);
      border: 2px solid var(--primary);
      color: var(--primary);
      z-index: 2;
      transition: all var(--transition-base) var(--transition-ease);
    }

    .timeline-dot.timeline-success {
      border-color: var(--success);
      color: var(--success);
    }

    .timeline-dot.timeline-error {
      border-color: var(--danger);
      color: var(--danger);
    }

    .timeline-dot.timeline-warning {
      border-color: var(--warning);
      color: var(--warning);
    }

    .timeline-dot.timeline-info {
      border-color: var(--info);
      color: var(--info);
    }

    .timeline-dot.timeline-pending {
      border-color: var(--warning);
      color: var(--warning);
      animation: pulse 2s infinite;
    }

    .timeline-dot.timeline-active {
      border-color: var(--primary);
      color: var(--primary);
      animation: pulse 1.5s infinite;
    }

    .timeline-dot.timeline-inactive {
      border-color: var(--gray-400);
      color: var(--gray-400);
    }

    .timeline-dot.timeline-default {
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Connector */
    .timeline-connector {
      position: absolute;
      z-index: 1;
    }

    .timeline-vertical .timeline-connector {
      top: 30px;
      left: 14px;
      width: 2px;
      height: calc(100% - 30px);
      background: var(--border);
    }

    .timeline-horizontal .timeline-connector {
      top: 14px;
      left: 50%;
      width: calc(100% - 30px);
      height: 2px;
      background: var(--border);
    }

    .timeline-vertical.timeline-small .timeline-connector {
      left: 9px;
    }

    .timeline-vertical.timeline-large .timeline-connector {
      left: 19px;
    }

    .timeline-connector.dashed {
      background: none;
      border-top: 2px dashed var(--border);
    }

    .timeline-connector.dotted {
      background: none;
      border-top: 2px dotted var(--border);
    }

    /* Content */
    .timeline-content {
      flex: 1;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      transition: all var(--transition-base) var(--transition-ease);
    }

    .timeline-content:hover {
      background: var(--bg-tertiary);
    }

    .timeline-time {
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .timeline-title {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .timeline-description {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .timeline-footer {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    /* Alignments */
    .timeline-left .timeline-item {
      flex-direction: row;
    }

    .timeline-right .timeline-item {
      flex-direction: row-reverse;
    }

    .timeline-right .timeline-content {
      text-align: right;
    }

    .timeline-alternate .timeline-item:nth-child(odd) {
      flex-direction: row;
    }

    .timeline-alternate .timeline-item:nth-child(even) {
      flex-direction: row-reverse;
    }

    .timeline-alternate .timeline-item:nth-child(even) .timeline-content {
      text-align: right;
    }

    /* Mode for content placement */
    .timeline-mode-left .timeline-content {
      text-align: left;
    }

    .timeline-mode-right .timeline-content {
      text-align: right;
    }

    .timeline-mode-alternate .timeline-item:nth-child(odd) .timeline-content {
      text-align: left;
    }

    .timeline-mode-alternate .timeline-item:nth-child(even) .timeline-content {
      text-align: right;
    }

    /* Custom content */
    .timeline-custom-content {
      width: 100%;
    }

    /* Animations */
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
      }
    }

    .timeline-item {
      animation: fadeIn 0.5s var(--transition-ease);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .timeline-connector {
        background: var(--dark-border);
      }

      .timeline-content {
        background: var(--dark-bg-tertiary);
      }

      .timeline-content:hover {
        background: var(--dark-bg-secondary);
      }

      .timeline-time {
        color: var(--dark-text-muted);
      }

      .timeline-title {
        color: var(--dark-text-primary);
      }

      .timeline-description {
        color: var(--dark-text-secondary);
      }

      .timeline-footer {
        border-top-color: var(--dark-border);
      }

      .timeline-dot {
        background: var(--dark-bg-secondary);
      }

      .timeline-dot.timeline-inactive {
        border-color: var(--dark-text-muted);
        color: var(--dark-text-muted);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .timeline-horizontal {
        flex-direction: column;
        overflow-x: visible;
      }

      .timeline-horizontal .timeline-item {
        flex-direction: row;
        min-width: 100%;
        margin-right: 0;
        margin-bottom: 20px;
      }

      .timeline-horizontal .timeline-dot-container {
        margin-right: 16px;
        margin-bottom: 0;
      }

      .timeline-horizontal .timeline-connector {
        display: none;
      }

      .timeline-alternate .timeline-item:nth-child(even) {
        flex-direction: row;
      }

      .timeline-alternate .timeline-item:nth-child(even) .timeline-content {
        text-align: left;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          timeline
          ${directionClasses[direction]}
          ${alignClasses[align]}
          ${modeClasses[mode]}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {sortedItems.map((item, index) => {
          const isLast = index === sortedItems.length - 1;
          const status = item.status || 'default';
          const dotColor = getDotColor(status);

          return (
            <div
              key={item.id || index}
              className={`
                timeline-item
                ${getStatusColor(status)}
                ${itemClassName}
                ${item.className || ''}
              `}
              onClick={() => onItemClick?.(item, index)}
            >
              {/* Dot Container */}
              <div className="timeline-dot-container">
                <div
                  className={`
                    timeline-dot
                    ${getStatusColor(status)}
                    ${iconClassName}
                  `}
                  style={{ borderColor: dotColor, color: dotColor }}
                >
                  {showIcon && getIcon(item)}
                </div>

                {/* Connector */}
                {showConnector && !isLast && (
                  <div
                    className={`
                      timeline-connector
                      ${item.connectorType || 'solid'}
                      ${connectorClassName}
                    `}
                    style={direction === 'horizontal' ? {
                      left: index === 0 ? '50%' : '0',
                      width: index === 0 ? '50%' : '100%'
                    } : {}}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`timeline-content ${contentClassName}`}>
                {showTime && item.time && (
                  <div className={`timeline-time ${timeClassName}`}>
                    {item.time}
                  </div>
                )}

                {showTitle && item.title && (
                  <div className={`timeline-title ${titleClassName}`}>
                    {item.title}
                  </div>
                )}

                {showDescription && item.description && (
                  <div className={`timeline-description ${descriptionClassName}`}>
                    {item.description}
                  </div>
                )}

                {item.content}

                {showFooter && item.footer && (
                  <div className={`timeline-footer ${footerClassName}`}>
                    {item.footer}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// Vertical Timeline
export const VerticalTimeline = (props) => {
  return <Timeline direction="vertical" {...props} />;
};

// Horizontal Timeline
export const HorizontalTimeline = (props) => {
  return <Timeline direction="horizontal" {...props} />;
};

// Basic Timeline (for simple lists)
export const BasicTimeline = ({ items, ...props }) => {
  return (
    <Timeline
      items={items.map(item => ({
        ...item,
        icon: <FiClock />
      }))}
      variant="minimal"
      size="small"
      showTime={false}
      {...props}
    />
  );
};

// Order Timeline (for order tracking)
export const OrderTimeline = ({ steps = [], currentStep, ...props }) => {
  const getStatus = (index) => {
    if (index < currentStep) return 'success';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <Timeline
      items={steps.map((step, index) => ({
        ...step,
        status: getStatus(index)
      }))}
      variant="outlined"
      {...props}
    />
  );
};

// Notification Timeline
export const NotificationTimeline = ({ notifications = [], ...props }) => {
  return (
    <Timeline
      items={notifications.map(notification => ({
        ...notification,
        icon: notification.read ? <FiInfo /> : <FiAlertCircle />,
        status: notification.read ? 'inactive' : 'active'
      }))}
      variant="minimal"
      {...props}
    />
  );
};

// Achievement Timeline
export const AchievementTimeline = ({ achievements = [], ...props }) => {
  const styles = `
    .achievement-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: var(--primary-50);
      color: var(--primary);
      font-size: var(--text-xs);
      margin-right: 4px;
    }

    .achievement-points {
      font-weight: var(--font-bold);
      color: var(--primary);
    }

    @media (prefers-color-scheme: dark) {
      .achievement-badge {
        background: var(--dark-primary-50);
        color: var(--dark-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Timeline
        items={achievements.map(achievement => ({
          ...achievement,
          icon: <FiAward />,
          status: 'success',
          footer: (
            <div>
              <span className="achievement-badge">{achievement.category}</span>
              <span className="achievement-points">+{achievement.points} pts</span>
            </div>
          )
        }))}
        {...props}
      />
    </>
  );
};

export default Timeline;
