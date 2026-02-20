import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiLoader,
  FiArrowRight,
  FiArrowLeft,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';

const Steps = ({
  steps = [],
  current = 0,
  onChange,
  direction = 'horizontal', // horizontal, vertical
  size = 'medium', // small, medium, large
  variant = 'default', // default, navigation, progress, wizard
  status = 'process', // wait, process, finish, error
  showIcon = true,
  showNumber = true,
  showTitle = true,
  showDescription = true,
  showSubtitle = true,
  clickable = true,
  responsive = true,
  animated = true,
  progressDot = false,
  labelPlacement = 'horizontal', // horizontal, vertical
  iconPosition = 'left', // left, top
  className = '',
  stepClassName = '',
  contentClassName = '',
  iconClassName = '',
  titleClassName = '',
  descriptionClassName = '',
  onStepClick,
  onNext,
  onPrev,
  onFinish,
  children,
  ...props
}) => {
  const [activeStep, setActiveStep] = useState(current);
  const [stepsStatus, setStepsStatus] = useState([]);

  useEffect(() => {
    setActiveStep(current);
  }, [current]);

  useEffect(() => {
    // Initialize steps status
    const statuses = steps.map((step, index) => {
      if (step.status) return step.status;
      if (index < activeStep) return 'finish';
      if (index === activeStep) return 'process';
      return 'wait';
    });
    setStepsStatus(statuses);
  }, [steps, activeStep]);

  const handleStepClick = (index) => {
    if (!clickable) return;
    if (steps[index]?.disabled) return;

    setActiveStep(index);
    onChange?.(index);
    onStepClick?.(index, steps[index]);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      onChange?.(nextStep);
      onNext?.(nextStep, steps[nextStep]);
    } else if (activeStep === steps.length - 1) {
      onFinish?.();
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      onChange?.(prevStep);
      onPrev?.(prevStep, steps[prevStep]);
    }
  };

  const getStatusIcon = (status, index) => {
    if (status === 'finish') return <FiCheck />;
    if (status === 'error') return <FiXCircle />;
    if (status === 'process') return <FiLoader className="spin" />;
    if (status === 'wait') return index + 1;
    return index + 1;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finish':
        return 'steps-finish';
      case 'process':
        return 'steps-process';
      case 'error':
        return 'steps-error';
      case 'wait':
        return 'steps-wait';
      default:
        return 'steps-wait';
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'steps-small',
    medium: 'steps-medium',
    large: 'steps-large'
  };

  // Direction classes
  const directionClasses = {
    horizontal: 'steps-horizontal',
    vertical: 'steps-vertical'
  };

  // Variant classes
  const variantClasses = {
    default: 'steps-default',
    navigation: 'steps-navigation',
    progress: 'steps-progress',
    wizard: 'steps-wizard'
  };

  // Label placement classes
  const labelPlacementClasses = {
    horizontal: 'steps-label-horizontal',
    vertical: 'steps-label-vertical'
  };

  // Icon position classes
  const iconPositionClasses = {
    left: 'steps-icon-left',
    top: 'steps-icon-top'
  };

  // Styles
  const styles = `
    .steps-wrapper {
      width: 100%;
    }

    .steps {
      display: flex;
      position: relative;
      width: 100%;
    }

    /* Direction Variants */
    .steps-horizontal {
      flex-direction: row;
      align-items: flex-start;
    }

    .steps-vertical {
      flex-direction: column;
    }

    /* Size Variants */
    .steps-small .step-item {
      padding: 8px;
    }

    .steps-small .step-icon {
      width: 24px;
      height: 24px;
      font-size: var(--text-xs);
    }

    .steps-small .step-title {
      font-size: var(--text-xs);
    }

    .steps-small .step-description {
      font-size: var(--text-xs);
    }

    .steps-medium .step-item {
      padding: 12px;
    }

    .steps-medium .step-icon {
      width: 32px;
      height: 32px;
      font-size: var(--text-sm);
    }

    .steps-medium .step-title {
      font-size: var(--text-sm);
    }

    .steps-medium .step-description {
      font-size: var(--text-xs);
    }

    .steps-large .step-item {
      padding: 16px;
    }

    .steps-large .step-icon {
      width: 40px;
      height: 40px;
      font-size: var(--text-base);
    }

    .steps-large .step-title {
      font-size: var(--text-base);
    }

    .steps-large .step-description {
      font-size: var(--text-sm);
    }

    /* Step Item */
    .step-item {
      position: relative;
      display: flex;
      flex: 1;
      transition: all var(--transition-base) var(--transition-ease);
    }

    .steps-horizontal .step-item {
      flex-direction: column;
      align-items: center;
    }

    .steps-vertical .step-item {
      flex-direction: row;
      align-items: flex-start;
    }

    .step-item.clickable {
      cursor: pointer;
    }

    .step-item.clickable:hover .step-icon {
      transform: scale(1.1);
    }

    .step-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .step-item.disabled.clickable:hover .step-icon {
      transform: none;
    }

    /* Icon Position */
    .steps-icon-left .step-item {
      flex-direction: row;
    }

    .steps-icon-top .step-item {
      flex-direction: column;
      align-items: center;
    }

    /* Step Icon */
    .step-icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      z-index: 2;
    }

    .steps-horizontal .step-icon-container {
      margin-right: 0;
      margin-bottom: 8px;
    }

    .steps-icon-top .step-icon-container {
      margin-right: 0;
      margin-bottom: 8px;
    }

    .step-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      color: var(--text-secondary);
      transition: all var(--transition-base) var(--transition-ease);
    }

    .step-icon.steps-finish {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .step-icon.steps-process {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .step-icon.steps-error {
      background: var(--danger);
      border-color: var(--danger);
      color: white;
    }

    .step-icon.steps-wait {
      background: var(--bg-secondary);
      border-color: var(--border);
      color: var(--text-secondary);
    }

    /* Progress Dot */
    .progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--border);
    }

    .progress-dot.steps-finish {
      background: var(--success);
    }

    .progress-dot.steps-process {
      background: var(--primary);
      animation: pulse 1.5s infinite;
    }

    .progress-dot.steps-error {
      background: var(--danger);
    }

    .progress-dot.steps-wait {
      background: var(--border);
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 var(--primary);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
      }
    }

    /* Step Content */
    .step-content {
      flex: 1;
    }

    .steps-horizontal .step-content {
      text-align: center;
    }

    .steps-icon-left .step-content {
      text-align: left;
    }

    .step-title {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .step-description {
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .step-subtitle {
      font-size: var(--text-xs);
      color: var(--text-disabled);
      margin-top: 4px;
    }

    /* Connector */
    .step-connector {
      position: absolute;
      z-index: 1;
    }

    .steps-horizontal .step-connector {
      top: 30px;
      left: 50%;
      width: 100%;
      height: 2px;
    }

    .steps-vertical .step-connector {
      left: 24px;
      top: 40px;
      width: 2px;
      height: calc(100% - 40px);
    }

    .steps-small.steps-horizontal .step-connector {
      top: 20px;
    }

    .steps-large.steps-horizontal .step-connector {
      top: 40px;
    }

    .steps-small.steps-vertical .step-connector {
      left: 16px;
    }

    .steps-large.steps-vertical .step-connector {
      left: 32px;
    }

    .step-connector-line {
      width: 100%;
      height: 100%;
      background: var(--border);
      transition: background var(--transition-base) var(--transition-ease);
    }

    .step-connector-line.finished {
      background: var(--success);
    }

    .step-connector-line.active {
      background: var(--primary);
    }

    /* Navigation Variant */
    .steps-navigation .step-item {
      padding: 12px;
      border-bottom: 2px solid var(--border);
      transition: all var(--transition-base) var(--transition-ease);
    }

    .steps-navigation .step-item.steps-process {
      border-bottom-color: var(--primary);
    }

    .steps-navigation .step-item.steps-finish {
      border-bottom-color: var(--success);
    }

    .steps-navigation .step-item.steps-error {
      border-bottom-color: var(--danger);
    }

    .steps-navigation .step-icon-container {
      margin-right: 8px;
    }

    .steps-navigation .step-icon {
      width: 24px;
      height: 24px;
      font-size: var(--text-xs);
    }

    /* Progress Variant */
    .steps-progress .step-item {
      position: relative;
    }

    .steps-progress .step-icon {
      background: transparent;
      border: none;
    }

    .steps-progress .step-connector {
      height: 4px;
      border-radius: 2px;
    }

    .steps-progress .step-connector-line {
      border-radius: 2px;
    }

    /* Wizard Variant */
    .steps-wizard {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .steps-wizard .step-item {
      padding: 16px;
      border-radius: var(--radius-md);
      transition: all var(--transition-base) var(--transition-ease);
    }

    .steps-wizard .step-item.steps-process {
      background: var(--bg-primary);
      box-shadow: var(--shadow-md);
    }

    .steps-wizard .step-item.steps-finish {
      opacity: 0.8;
    }

    .steps-wizard .step-item.steps-error {
      background: var(--danger-50);
    }

    /* Navigation Buttons */
    .steps-navigation-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .steps-nav-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .steps-nav-btn:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .steps-nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .steps-nav-btn.prev {
      margin-right: auto;
    }

    .steps-nav-btn.next {
      margin-left: auto;
    }

    /* Step Content Area */
    .steps-content {
      margin-top: 24px;
      padding: 20px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .step-pane {
      display: none;
    }

    .step-pane.active {
      display: block;
      animation: fadeIn 0.3s var(--transition-ease);
    }

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

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .step-icon {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .step-icon.steps-wait {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-muted);
      }

      .step-title {
        color: var(--dark-text-primary);
      }

      .step-description {
        color: var(--dark-text-secondary);
      }

      .step-connector-line {
        background: var(--dark-border);
      }

      .steps-navigation .step-item {
        border-bottom-color: var(--dark-border);
      }

      .steps-wizard {
        background: var(--dark-bg-tertiary);
      }

      .steps-wizard .step-item.steps-process {
        background: var(--dark-bg-secondary);
      }

      .steps-content {
        background: var(--dark-bg-secondary);
      }

      .steps-nav-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .steps-horizontal {
        flex-direction: column;
      }

      .steps-horizontal .step-item {
        flex-direction: row;
        margin-bottom: 16px;
      }

      .steps-horizontal .step-icon-container {
        margin-right: 12px;
        margin-bottom: 0;
      }

      .steps-horizontal .step-content {
        text-align: left;
      }

      .steps-horizontal .step-connector {
        display: none;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`steps-wrapper ${className}`} {...props}>
        {/* Steps */}
        <div
          className={`
            steps
            ${directionClasses[direction]}
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${labelPlacementClasses[labelPlacement]}
            ${iconPositionClasses[iconPosition]}
          `}
        >
          {steps.map((step, index) => {
            const status = stepsStatus[index] || step.status || 'wait';
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.key || index}
                className={`
                  step-item
                  ${getStatusColor(status)}
                  ${clickable ? 'clickable' : ''}
                  ${step.disabled ? 'disabled' : ''}
                  ${stepClassName}
                  ${step.className || ''}
                `}
                onClick={() => handleStepClick(index)}
              >
                {/* Icon Container */}
                <div className="step-icon-container">
                  {progressDot ? (
                    <div className={`progress-dot ${getStatusColor(status)}`} />
                  ) : (
                    <div className={`step-icon ${getStatusColor(status)} ${iconClassName}`}>
                      {showIcon && getStatusIcon(status, index)}
                      {!showIcon && showNumber && index + 1}
                    </div>
                  )}

                  {/* Connector */}
                  {!isLast && (
                    <div className="step-connector">
                      <div
                        className={`
                          step-connector-line
                          ${index < activeStep ? 'finished' : ''}
                          ${index === activeStep ? 'active' : ''}
                        `}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`step-content ${contentClassName}`}>
                  {showTitle && step.title && (
                    <div className={`step-title ${titleClassName}`}>
                      {step.title}
                    </div>
                  )}

                  {showDescription && step.description && (
                    <div className={`step-description ${descriptionClassName}`}>
                      {step.description}
                    </div>
                  )}

                  {showSubtitle && step.subtitle && (
                    <div className="step-subtitle">{step.subtitle}</div>
                  )}

                  {step.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        {children && (
          <div className="steps-content">
            {React.Children.map(children, (child, index) => {
              if (!child) return null;
              return React.cloneElement(child, {
                className: `step-pane ${index === activeStep ? 'active' : ''}`
              });
            })}
          </div>
        )}

        {/* Navigation Buttons for Wizard variant */}
        {variant === 'wizard' && (
          <div className="steps-navigation-buttons">
            <button
              className="steps-nav-btn prev"
              onClick={handlePrev}
              disabled={activeStep === 0}
            >
              <FiChevronLeft /> Previous
            </button>
            <button
              className="steps-nav-btn next"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1 && !onFinish}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'} <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Step Pane Component (for content)
export const StepPane = ({ children, className = '', ...props }) => {
  return (
    <div className={`step-pane-content ${className}`} {...props}>
      {children}
    </div>
  );
};

// Vertical Steps
export const VerticalSteps = (props) => {
  return <Steps direction="vertical" {...props} />;
};

// Horizontal Steps
export const HorizontalSteps = (props) => {
  return <Steps direction="horizontal" {...props} />;
};

// Progress Steps (with dots)
export const ProgressSteps = ({ steps, current, ...props }) => {
  return (
    <Steps
      steps={steps}
      current={current}
      progressDot
      size="small"
      showTitle={false}
      showDescription={false}
      {...props}
    />
  );
};

// Navigation Steps (for tab-like navigation)
export const NavigationSteps = ({ steps, current, onChange, ...props }) => {
  return (
    <Steps
      steps={steps}
      current={current}
      variant="navigation"
      showDescription={false}
      showNumber={false}
      onChange={onChange}
      {...props}
    />
  );
};

// Checkout Steps (for e-commerce checkout)
export const CheckoutSteps = ({ steps, current, ...props }) => {
  const styles = `
    .checkout-steps {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: 20px;
    }

    .checkout-step {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .checkout-step-number {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-semibold);
      color: var(--text-secondary);
    }

    .checkout-step.active .checkout-step-number {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .checkout-step.completed .checkout-step-number {
      background: var(--success);
      border-color: var(--success);
      color: white;
    }

    .checkout-step-title {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .checkout-step-subtitle {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    @media (prefers-color-scheme: dark) {
      .checkout-steps {
        background: var(--dark-bg-tertiary);
      }

      .checkout-step-number {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .checkout-step-title {
        color: var(--dark-text-primary);
      }

      .checkout-step-subtitle {
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Steps
        steps={steps.map(step => ({
          ...step,
          icon: (
            <div className="checkout-step">
              <div className="checkout-step-content">
                <div className="checkout-step-title">{step.title}</div>
                <div className="checkout-step-subtitle">{step.subtitle}</div>
              </div>
            </div>
          )
        }))}
        current={current}
        variant="minimal"
        showIcon={false}
        showTitle={false}
        {...props}
      />
    </>
  );
};

// Form Steps (for multi-step forms)
export const FormSteps = ({ steps, current, onNext, onPrev, onFinish, children, ...props }) => {
  const styles = `
    .form-steps-content {
      min-height: 300px;
    }

    .form-steps-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .form-steps-btn {
      padding: 10px 24px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .form-steps-btn.prev {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .form-steps-btn.next {
      background: var(--primary);
      color: white;
    }

    .form-steps-btn.next:hover {
      background: var(--primary-dark);
    }

    .form-steps-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (prefers-color-scheme: dark) {
      .form-steps-actions {
        border-top-color: var(--dark-border);
      }

      .form-steps-btn.prev {
        background: var(--dark-bg-tertiary);
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="form-steps">
        <Steps
          steps={steps}
          current={current}
          variant="progress"
          showDescription={false}
          {...props}
        />
        
        <div className="form-steps-content">
          {children}
        </div>

        <div className="form-steps-actions">
          <button
            className="form-steps-btn prev"
            onClick={onPrev}
            disabled={current === 0}
          >
            Previous
          </button>
          <button
            className="form-steps-btn next"
            onClick={current === steps.length - 1 ? onFinish : onNext}
          >
            {current === steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Steps;
