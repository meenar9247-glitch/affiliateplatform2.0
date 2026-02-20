import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Tabs = ({
  tabs = [],
  activeTab: controlledActiveTab,
  defaultActiveTab = 0,
  onChange,
  variant = 'underlined', // underlined, contained, pills, minimal
  size = 'medium', // small, medium, large
  orientation = 'horizontal', // horizontal, vertical
  align = 'start', // start, center, end, justify
  scrollable = false,
  destroyInactiveTabPane = true,
  animated = true,
  animationDuration = 300,
  tabBarExtraContent,
  tabBarStyle,
  tabBarClassName,
  tabPaneClassName,
  className = '',
  children,
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsRef = useRef(null);
  const tabRefs = useRef([]);

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  useEffect(() => {
    if (variant === 'underlined' && tabsRef.current) {
      updateIndicator();
      window.addEventListener('resize', updateIndicator);
      return () => window.removeEventListener('resize', updateIndicator);
    }
  }, [activeTab, tabs, variant]);

  useEffect(() => {
    if (scrollable && tabsRef.current) {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
    }
  }, [tabs]);

  const updateIndicator = () => {
    if (tabRefs.current[activeTab]) {
      const tab = tabRefs.current[activeTab];
      setIndicatorStyle({
        left: tab.offsetLeft,
        width: tab.offsetWidth
      });
    }
  };

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const handleTabClick = (index, disabled) => {
    if (disabled) return;
    
    if (controlledActiveTab === undefined) {
      setActiveTab(index);
    }
    onChange?.(index, tabs[index]);
  };

  const handleScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = tabsRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'tabs-small',
    medium: 'tabs-medium',
    large: 'tabs-large'
  };

  // Variant classes
  const variantClasses = {
    underlined: 'tabs-underlined',
    contained: 'tabs-contained',
    pills: 'tabs-pills',
    minimal: 'tabs-minimal'
  };

  // Align classes
  const alignClasses = {
    start: 'tabs-start',
    center: 'tabs-center',
    end: 'tabs-end',
    justify: 'tabs-justify'
  };

  // Orientation classes
  const orientationClasses = {
    horizontal: 'tabs-horizontal',
    vertical: 'tabs-vertical'
  };

  // Styles
  const styles = `
    .tabs-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .tabs-wrapper.vertical {
      flex-direction: row;
    }

    /* Tab Bar */
    .tabs-bar {
      position: relative;
      display: flex;
      background: var(--bg-primary);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .tabs-bar.horizontal {
      flex-direction: row;
      align-items: center;
      width: 100%;
    }

    .tabs-bar.vertical {
      flex-direction: column;
      min-width: 200px;
      border-right: 1px solid var(--border);
    }

    .tabs-bar.scrollable {
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .tabs-bar.scrollable::-webkit-scrollbar {
      display: none;
    }

    .tabs-bar.scrollable.horizontal {
      flex-wrap: nowrap;
    }

    /* Scroll Buttons */
    .scroll-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      transition: all var(--transition-fast) var(--transition-ease);
      box-shadow: var(--shadow-sm);
    }

    .scroll-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .scroll-btn.left {
      left: 5px;
    }

    .scroll-btn.right {
      right: 5px;
    }

    .scroll-btn:disabled {
      opacity: 0;
      pointer-events: none;
    }

    /* Tab List */
    .tabs-list {
      display: flex;
      position: relative;
      flex: 1;
    }

    .tabs-list.horizontal {
      flex-direction: row;
    }

    .tabs-list.vertical {
      flex-direction: column;
      width: 100%;
    }

    .tabs-list.align-start {
      justify-content: flex-start;
    }

    .tabs-list.align-center {
      justify-content: center;
    }

    .tabs-list.align-end {
      justify-content: flex-end;
    }

    .tabs-list.align-justify .tab-item {
      flex: 1;
      text-align: center;
    }

    /* Tab Item */
    .tab-item {
      position: relative;
      padding: 12px 20px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      white-space: nowrap;
      border: none;
      background: none;
      outline: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tab-item:hover:not(.disabled) {
      color: var(--primary);
    }

    .tab-item:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .tab-item.active {
      color: var(--primary);
    }

    .tab-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Size Variants */
    .tabs-small .tab-item {
      padding: 8px 16px;
      font-size: var(--text-xs);
    }

    .tabs-large .tab-item {
      padding: 16px 24px;
      font-size: var(--text-base);
    }

    /* Underlined Variant */
    .tabs-underlined {
      border-bottom: 2px solid var(--border);
    }

    .tabs-underlined .tab-item {
      margin-bottom: -2px;
      border-bottom: 2px solid transparent;
    }

    .tabs-underlined .tab-item.active {
      border-bottom-color: var(--primary);
    }

    .tabs-underlined .tab-indicator {
      position: absolute;
      bottom: -2px;
      height: 2px;
      background: var(--primary);
      transition: all ${animationDuration}ms var(--transition-ease);
    }

    /* Contained Variant */
    .tabs-contained {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: 4px;
    }

    .tabs-contained .tab-item.active {
      background: var(--bg-primary);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    /* Pills Variant */
    .tabs-pills .tab-item {
      border-radius: var(--radius-full);
    }

    .tabs-pills .tab-item.active {
      background: var(--primary);
      color: white;
    }

    .tabs-pills .tab-item.active:hover {
      background: var(--primary-dark);
    }

    /* Minimal Variant */
    .tabs-minimal {
      background: transparent;
    }

    .tabs-minimal .tab-item {
      border-radius: 0;
    }

    .tabs-minimal .tab-item.active {
      background: var(--bg-tertiary);
    }

    /* Vertical Tabs */
    .tabs-vertical .tabs-bar {
      border-right: 1px solid var(--border);
    }

    .tabs-vertical .tab-item {
      width: 100%;
      text-align: left;
      border-right: 2px solid transparent;
    }

    .tabs-vertical .tab-item.active {
      border-right-color: var(--primary);
      background: var(--primary-50);
    }

    /* Tab Content */
    .tab-content {
      flex: 1;
      padding: 16px;
    }

    .tab-pane {
      display: none;
    }

    .tab-pane.active {
      display: block;
      animation: fadeIn ${animationDuration}ms var(--transition-ease);
    }

    /* Tab Pane Animation */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Tab Bar Extra Content */
    .tab-bar-extra {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tabs-vertical .tab-bar-extra {
      margin-left: 0;
      margin-top: auto;
      padding: 16px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .tab-item {
        color: var(--dark-text-secondary);
      }

      .tab-item:hover:not(.disabled) {
        color: var(--dark-primary);
      }

      .tab-item.active {
        color: var(--dark-primary);
      }

      .tabs-underlined {
        border-bottom-color: var(--dark-border);
      }

      .tabs-contained {
        background: var(--dark-bg-tertiary);
      }

      .tabs-contained .tab-item.active {
        background: var(--dark-bg-secondary);
      }

      .tabs-pills .tab-item.active {
        background: var(--dark-primary);
      }

      .tabs-minimal .tab-item.active {
        background: var(--dark-bg-tertiary);
      }

      .tabs-vertical .tabs-bar {
        border-right-color: var(--dark-border);
      }

      .tabs-vertical .tab-item.active {
        background: var(--dark-primary-50);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .tabs-wrapper.vertical {
        flex-direction: column;
      }

      .tabs-bar.vertical {
        border-right: none;
        border-bottom: 1px solid var(--border);
        min-width: 100%;
      }

      .tabs-vertical .tab-item.active {
        border-right-color: transparent;
        border-bottom-color: var(--primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          tabs-wrapper
          ${orientationClasses[orientation]}
          ${className}
        `}
        {...props}
      >
        {/* Tab Bar */}
        <div
          className={`
            tabs-bar
            ${orientationClasses[orientation]}
            ${variantClasses[variant]}
            ${scrollable ? 'scrollable' : ''}
            ${tabBarClassName}
          `}
          style={tabBarStyle}
          ref={tabsRef}
          onScroll={checkScroll}
        >
          {/* Scroll Buttons */}
          {scrollable && orientation === 'horizontal' && (
            <>
              <button
                className="scroll-btn left"
                onClick={() => handleScroll('left')}
                disabled={!showLeftArrow}
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                className="scroll-btn right"
                onClick={() => handleScroll('right')}
                disabled={!showRightArrow}
              >
                <FiChevronRight size={16} />
              </button>
            </>
          )}

          {/* Tab List */}
          <div
            className={`
              tabs-list
              ${orientationClasses[orientation]}
              ${alignClasses[align]}
            `}
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.key || index}
                ref={el => tabRefs.current[index] = el}
                className={`
                  tab-item
                  ${activeTab === index ? 'active' : ''}
                  ${tab.disabled ? 'disabled' : ''}
                `}
                onClick={() => handleTabClick(index, tab.disabled)}
                disabled={tab.disabled}
              >
                {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="tab-badge">{tab.badge}</span>
                )}
              </button>
            ))}

            {/* Indicator for underlined variant */}
            {variant === 'underlined' && orientation === 'horizontal' && (
              <div
                className="tab-indicator"
                style={indicatorStyle}
              />
            )}
          </div>

          {/* Extra Content */}
          {tabBarExtraContent && (
            <div className="tab-bar-extra">
              {tabBarExtraContent}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className={`tab-content ${tabPaneClassName}`}>
          {React.Children.map(children, (child, index) => {
            if (!child) return null;
            
            const isActive = index === activeTab;
            
            if (destroyInactiveTabPane && !isActive) {
              return null;
            }
            
            return React.cloneElement(child, {
              className: `tab-pane ${isActive ? 'active' : ''}`,
              role: 'tabpanel',
              hidden: !isActive
            });
          })}
        </div>
      </div>
    </>
  );
};

// Tab Pane Component
export const TabPane = ({ children, className = '', ...props }) => {
  return (
    <div className={`tab-pane-content ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Tabs Component
export const CardTabs = ({ tabs = [], activeTab, onChange, ...props }) => {
  const styles = `
    .card-tabs {
      display: flex;
      gap: 16px;
      padding: 8px;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
    }

    .card-tab {
      flex: 1;
      padding: 16px;
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      border: 1px solid var(--border);
    }

    .card-tab:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .card-tab.active {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    .card-tab-icon {
      font-size: 24px;
      color: var(--primary);
      margin-bottom: 8px;
    }

    .card-tab-label {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .card-tab-description {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .card-tabs {
        flex-direction: column;
      }
    }

    @media (prefers-color-scheme: dark) {
      .card-tab {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
      }

      .card-tab.active {
        border-color: var(--dark-primary);
      }

      .card-tab-label {
        color: var(--dark-text-primary);
      }

      .card-tab-description {
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="card-tabs">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`card-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => onChange(index)}
          >
            {tab.icon && <div className="card-tab-icon">{tab.icon}</div>}
            <div className="card-tab-label">{tab.label}</div>
            {tab.description && (
              <div className="card-tab-description">{tab.description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

// Icon Tabs Component
export const IconTabs = ({ tabs = [], activeTab, onChange, ...props }) => {
  const styles = `
    .icon-tabs {
      display: flex;
      gap: 8px;
      padding: 8px;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
    }

    .icon-tab {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .icon-tab:hover {
      color: var(--primary);
      transform: translateY(-2px);
    }

    .icon-tab.active {
      background: var(--primary);
      color: white;
    }

    @media (prefers-color-scheme: dark) {
      .icon-tab {
        background: var(--dark-bg-tertiary);
        color: var(--dark-text-secondary);
      }

      .icon-tab.active {
        background: var(--dark-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="icon-tabs">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`icon-tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => onChange(index)}
            title={tab.label}
          >
            {tab.icon}
          </div>
        ))}
      </div>
    </>
  );
};

// Steps Tabs Component (for wizards)
export const StepsTabs = ({ steps = [], currentStep, onChange, ...props }) => {
  const styles = `
    .steps-tabs {
      display: flex;
      margin-bottom: 24px;
    }

    .step-item {
      flex: 1;
      position: relative;
    }

    .step-item:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      right: -50%;
      width: 100%;
      height: 2px;
      background: var(--border);
      z-index: 0;
    }

    .step-item.completed:not(:last-child)::after {
      background: var(--success);
    }

    .step-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .step-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-bold);
      color: var(--text-secondary);
      margin-bottom: 8px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .step-item.completed .step-indicator {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .step-item.active .step-indicator {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .step-label {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
    }

    .step-item.active .step-label {
      color: var(--primary);
    }

    .step-item.completed .step-label {
      color: var(--success);
    }

    .step-description {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-align: center;
    }

    @media (max-width: 768px) {
      .steps-tabs {
        flex-direction: column;
        gap: 16px;
      }

      .step-item:not(:last-child)::after {
        display: none;
      }

      .step-content {
        flex-direction: row;
        gap: 12px;
      }
    }

    @media (prefers-color-scheme: dark) {
      .step-indicator {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .step-label {
        color: var(--dark-text-secondary);
      }

      .step-description {
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="steps-tabs">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`
              step-item
              ${index < currentStep ? 'completed' : ''}
              ${index === currentStep ? 'active' : ''}
            `}
            onClick={() => index < currentStep && onChange(index)}
          >
            <div className="step-content">
              <div className="step-indicator">
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div>
                <div className="step-label">{step.label}</div>
                {step.description && (
                  <div className="step-description">{step.description}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Tabs;
