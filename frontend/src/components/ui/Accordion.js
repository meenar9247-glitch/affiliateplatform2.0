import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiMinus } from 'react-icons/fi';

const Accordion = ({
  items = [],
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onChange,
  allowMultiple = false,
  collapsible = true,
  expandIcon,
  collapseIcon,
  iconPosition = 'right', // left, right
  variant = 'outlined', // outlined, contained, minimal, ghost
  size = 'medium', // small, medium, large
  bordered = true,
  showSeparator = true,
  animated = true,
  animationDuration = 300,
  destroyInactivePanel = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [activeKeys, setActiveKeys] = useState([]);
  const contentRefs = useRef([]);

  useEffect(() => {
    if (controlledActiveKey !== undefined) {
      setActiveKeys(Array.isArray(controlledActiveKey) ? controlledActiveKey : [controlledActiveKey]);
    } else if (defaultActiveKey !== undefined) {
      setActiveKeys(Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey]);
    }
  }, [controlledActiveKey, defaultActiveKey]);

  useEffect(() => {
    if (animated) {
      contentRefs.current.forEach((ref, index) => {
        if (ref) {
          if (activeKeys.includes(index)) {
            ref.style.maxHeight = `${ref.scrollHeight}px`;
            ref.style.opacity = '1';
          } else {
            ref.style.maxHeight = '0';
            ref.style.opacity = '0';
          }
        }
      });
    }
  }, [activeKeys, animated]);

  const handleToggle = (key) => {
    if (!collapsible && activeKeys.includes(key)) return;

    let newActiveKeys;
    
    if (allowMultiple) {
      newActiveKeys = activeKeys.includes(key)
        ? activeKeys.filter(k => k !== key)
        : [...activeKeys, key];
    } else {
      newActiveKeys = activeKeys.includes(key) ? [] : [key];
    }

    if (controlledActiveKey === undefined) {
      setActiveKeys(newActiveKeys);
    }

    onChange?.(newActiveKeys);
  };

  const isActive = (key) => activeKeys.includes(key);

  const getIcon = (isActive) => {
    if (isActive) {
      return collapseIcon || <FiChevronUp />;
    }
    return expandIcon || <FiChevronDown />;
  };

  // Size classes
  const sizeClasses = {
    small: 'accordion-small',
    medium: 'accordion-medium',
    large: 'accordion-large'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'accordion-outlined',
    contained: 'accordion-contained',
    minimal: 'accordion-minimal',
    ghost: 'accordion-ghost'
  };

  // Styles
  const styles = `
    .accordion {
      width: 100%;
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    /* Size Variants */
    .accordion-small .accordion-header {
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .accordion-medium .accordion-header {
      padding: 12px 16px;
      font-size: var(--text-base);
    }

    .accordion-large .accordion-header {
      padding: 16px 20px;
      font-size: var(--text-lg);
    }

    /* Variant Styles */
    .accordion-outlined {
      border: 1px solid var(--border);
    }

    .accordion-contained {
      background: var(--bg-secondary);
    }

    .accordion-minimal {
      border: none;
    }

    .accordion-ghost {
      background: transparent;
      border: none;
    }

    /* Accordion Item */
    .accordion-item {
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .accordion-item:last-child {
      border-bottom: none;
    }

    /* Separator */
    .accordion-separator .accordion-item {
      border-bottom: 1px solid var(--border);
    }

    .accordion-separator .accordion-item:last-child {
      border-bottom: none;
    }

    /* Bordered */
    .accordion-bordered .accordion-item {
      border: 1px solid var(--border);
      margin-bottom: 8px;
      border-radius: var(--radius-md);
    }

    .accordion-bordered .accordion-item:last-child {
      margin-bottom: 0;
    }

    /* Accordion Header */
    .accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--text-primary);
      font-weight: var(--font-medium);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .accordion-header:hover {
      background: var(--bg-tertiary);
    }

    .accordion-header:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .accordion-header.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .accordion-header.disabled:hover {
      background: transparent;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .header-title {
      flex: 1;
      text-align: left;
    }

    .header-extra {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Icon Position */
    .icon-left .header-content {
      flex-direction: row-reverse;
    }

    .icon-left .header-icon {
      margin-right: 0;
      margin-left: 8px;
    }

    /* Expand Icon */
    .expand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: transform var(--transition-fast) var(--transition-ease);
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
    }

    /* Accordion Content */
    .accordion-content-wrapper {
      overflow: hidden;
      transition: max-height ${animationDuration}ms var(--transition-ease),
                  opacity ${animationDuration}ms var(--transition-ease);
      background: var(--bg-primary);
    }

    .accordion-content {
      padding: 16px;
      color: var(--text-secondary);
    }

    /* Size Variants for Content */
    .accordion-small .accordion-content {
      padding: 8px 12px;
      font-size: var(--text-xs);
    }

    .accordion-medium .accordion-content {
      padding: 12px 16px;
      font-size: var(--text-sm);
    }

    .accordion-large .accordion-content {
      padding: 16px 20px;
      font-size: var(--text-base);
    }

    /* Variant specific content background */
    .accordion-contained .accordion-content-wrapper {
      background: var(--bg-primary);
    }

    .accordion-minimal .accordion-content-wrapper {
      background: transparent;
    }

    .accordion-ghost .accordion-content-wrapper {
      background: transparent;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .accordion-header {
        color: var(--dark-text-primary);
      }

      .accordion-header:hover {
        background: var(--dark-bg-tertiary);
      }

      .header-icon,
      .expand-icon {
        color: var(--dark-text-muted);
      }

      .accordion-content {
        color: var(--dark-text-secondary);
      }

      .accordion-outlined {
        border-color: var(--dark-border);
      }

      .accordion-contained {
        background: var(--dark-bg-tertiary);
      }

      .accordion-bordered .accordion-item {
        border-color: var(--dark-border);
      }

      .accordion-separator .accordion-item {
        border-bottom-color: var(--dark-border);
      }

      .accordion-content-wrapper {
        background: var(--dark-bg-secondary);
      }
    }

    /* Animation */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .accordion-content {
      animation: slideDown ${animationDuration}ms var(--transition-ease);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          accordion
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${bordered ? 'accordion-bordered' : ''}
          ${showSeparator ? 'accordion-separator' : ''}
          ${className}
        `}
        {...props}
      >
        {items.map((item, index) => {
          const active = isActive(index);
          const disabled = item.disabled || false;

          return (
            <div key={item.key || index} className="accordion-item">
              {/* Header */}
              <button
                className={`
                  accordion-header
                  ${iconPosition === 'left' ? 'icon-left' : ''}
                  ${disabled ? 'disabled' : ''}
                  ${headerClassName}
                `}
                onClick={() => !disabled && handleToggle(index)}
                disabled={disabled}
              >
                <div className="header-content">
                  {/* Left Icon */}
                  {item.icon && (
                    <span className="header-icon">{item.icon}</span>
                  )}

                  {/* Title */}
                  <span className="header-title">{item.title}</span>

                  {/* Extra Content */}
                  {item.extra && (
                    <span className="header-extra">{item.extra}</span>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                <span className={`expand-icon ${active ? 'rotated' : ''}`}>
                  {getIcon(active)}
                </span>
              </button>

              {/* Content */}
              {(!destroyInactivePanel || active) && (
                <div
                  ref={el => contentRefs.current[index] = el}
                  className="accordion-content-wrapper"
                  style={animated ? {} : { maxHeight: active ? 'none' : 0 }}
                >
                  <div className={`accordion-content ${contentClassName}`}>
                    {item.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// Collapse Panel Component (for single collapsible panel)
export const Collapse = ({
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onChange,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleToggle = () => {
    if (controlledOpen === undefined) {
      setIsOpen(!isOpen);
    }
    onChange?.(!isOpen);
  };

  return (
    <Accordion
      items={[
        {
          title,
          content: children,
          key: 'collapse'
        }
      ]}
      activeKey={isOpen ? [0] : []}
      onChange={(keys) => handleToggle()}
      allowMultiple={false}
      {...props}
    />
  );
};

// Nested Accordion Component
export const NestedAccordion = ({ items, ...props }) => {
  const renderItems = (items, level = 0) => {
    return items.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={index} className={`nested-accordion-level-${level}`}>
          <Accordion
            items={[item]}
            {...props}
          />
          {hasChildren && item.active && (
            <div className="nested-accordion-children">
              {renderItems(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const styles = `
    .nested-accordion-level-1 .accordion-item {
      margin-left: 20px;
    }

    .nested-accordion-level-2 .accordion-item {
      margin-left: 40px;
    }

    .nested-accordion-level-3 .accordion-item {
      margin-left: 60px;
    }

    .nested-accordion-children {
      border-left: 1px dashed var(--border);
    }

    @media (prefers-color-scheme: dark) {
      .nested-accordion-children {
        border-left-color: var(--dark-border);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="nested-accordion">
        {renderItems(items)}
      </div>
    </>
  );
};

// FAQ Accordion Component (pre-styled for FAQs)
export const FAQAccordion = ({ items, ...props }) => {
  const styles = `
    .faq-accordion .accordion-item {
      margin-bottom: 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .faq-accordion .accordion-header {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      font-weight: var(--font-semibold);
    }

    .faq-accordion .accordion-header:hover {
      background: var(--bg-tertiary);
    }

    .faq-accordion .accordion-content {
      background: var(--bg-primary);
      line-height: 1.6;
    }

    .faq-accordion .expand-icon {
      color: var(--primary);
    }

    @media (prefers-color-scheme: dark) {
      .faq-accordion .accordion-item {
        border-color: var(--dark-border);
      }

      .faq-accordion .accordion-header {
        background: var(--dark-bg-tertiary);
      }

      .faq-accordion .accordion-content {
        background: var(--dark-bg-secondary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Accordion
        className="faq-accordion"
        items={items}
        variant="minimal"
        bordered={false}
        {...props}
      />
    </>
  );
};

// Controlled Accordion Group
export const AccordionGroup = ({
  items,
  activeKeys = [],
  onChange,
  ...props
}) => {
  return (
    <Accordion
      items={items}
      activeKey={activeKeys}
      onChange={onChange}
      allowMultiple
      {...props}
    />
  );
};

// Icon Accordion (with custom expand/collapse icons)
export const IconAccordion = ({
  items,
  expandIcon = <FiPlus />,
  collapseIcon = <FiMinus />,
  ...props
}) => {
  return (
    <Accordion
      items={items}
      expandIcon={expandIcon}
      collapseIcon={collapseIcon}
      iconPosition="left"
      {...props}
    />
  );
};

export default Accordion;
