import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiCamera,
  FiUpload,
  FiX,
  FiCheck,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';

const Avatar = ({
  src,
  alt,
  name,
  size = 'medium',
  shape = 'circle',
  border = false,
  status,
  statusPosition = 'bottom-right',
  icon: CustomIcon,
  onClick,
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);

  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    
    const words = name.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate color based on name
  const getColorFromName = () => {
    if (!name) return 'avatar-primary';
    
    const colors = [
      'avatar-primary',
      'avatar-secondary',
      'avatar-success',
      'avatar-danger',
      'avatar-warning',
      'avatar-info'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  // Size classes
  const sizeClasses = {
    xs: 'avatar-xs',
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large',
    xl: 'avatar-xl',
    xxl: 'avatar-xxl'
  };

  // Shape classes
  const shapeClasses = {
    circle: 'avatar-circle',
    rounded: 'avatar-rounded',
    square: 'avatar-square'
  };

  // Status position classes
  const statusPositionClasses = {
    'top-left': 'status-top-left',
    'top-right': 'status-top-right',
    'bottom-left': 'status-bottom-left',
    'bottom-right': 'status-bottom-right'
  };

  // Status color classes
  const statusColorClasses = {
    online: 'status-online',
    offline: 'status-offline',
    away: 'status-away',
    busy: 'status-busy',
    idle: 'status-idle'
  };

  // Styles
  const styles = `
    .avatar-wrapper {
      position: relative;
      display: inline-flex;
      cursor: ${onClick ? 'pointer' : 'default'};
    }

    /* Avatar */
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--bg-secondary);
      color: var(--text-primary);
      transition: all var(--transition-fast) var(--transition-ease);
      position: relative;
    }

    .avatar-clickable:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

    .avatar-clickable:active {
      transform: scale(0.95);
    }

    /* Size Variants */
    .avatar-xs {
      width: 24px;
      height: 24px;
      font-size: var(--text-xs);
    }

    .avatar-small {
      width: 32px;
      height: 32px;
      font-size: var(--text-sm);
    }

    .avatar-medium {
      width: 40px;
      height: 40px;
      font-size: var(--text-base);
    }

    .avatar-large {
      width: 48px;
      height: 48px;
      font-size: var(--text-lg);
    }

    .avatar-xl {
      width: 64px;
      height: 64px;
      font-size: var(--text-xl);
    }

    .avatar-xxl {
      width: 80px;
      height: 80px;
      font-size: var(--text-2xl);
    }

    /* Shape Variants */
    .avatar-circle {
      border-radius: 50%;
    }

    .avatar-rounded {
      border-radius: var(--radius-lg);
    }

    .avatar-square {
      border-radius: 0;
    }

    /* Border */
    .avatar-border {
      border: 2px solid var(--primary);
      box-shadow: 0 0 0 2px var(--bg-primary);
    }

    /* Image */
    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-image-loading {
      opacity: 0;
    }

    .avatar-image-loaded {
      opacity: 1;
      animation: fadeIn 0.3s var(--transition-ease);
    }

    /* Icon */
    .avatar-icon {
      width: 50%;
      height: 50%;
      color: currentColor;
    }

    /* Initials */
    .avatar-initials {
      font-weight: var(--font-medium);
      line-height: 1;
    }

    /* Color Variants */
    .avatar-primary {
      background: var(--primary);
      color: white;
    }

    .avatar-secondary {
      background: var(--secondary);
      color: white;
    }

    .avatar-success {
      background: var(--success);
      color: white;
    }

    .avatar-danger {
      background: var(--danger);
      color: white;
    }

    .avatar-warning {
      background: var(--warning);
      color: white;
    }

    .avatar-info {
      background: var(--info);
      color: white;
    }

    /* Status */
    .avatar-status {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--bg-primary);
      box-shadow: var(--shadow-sm);
    }

    .avatar-xs .avatar-status {
      width: 8px;
      height: 8px;
      border-width: 1px;
    }

    .avatar-small .avatar-status {
      width: 10px;
      height: 10px;
    }

    .avatar-large .avatar-status {
      width: 14px;
      height: 14px;
    }

    .avatar-xl .avatar-status {
      width: 16px;
      height: 16px;
    }

    .avatar-xxl .avatar-status {
      width: 18px;
      height: 18px;
    }

    .status-top-left {
      top: 0;
      left: 0;
    }

    .status-top-right {
      top: 0;
      right: 0;
    }

    .status-bottom-left {
      bottom: 0;
      left: 0;
    }

    .status-bottom-right {
      bottom: 0;
      right: 0;
    }

    .status-online {
      background: var(--success);
    }

    .status-offline {
      background: var(--gray-400);
    }

    .status-away {
      background: var(--warning);
    }

    .status-busy {
      background: var(--danger);
    }

    .status-idle {
      background: var(--info);
    }

    /* Overlay */
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-fast) var(--transition-ease);
      color: white;
    }

    .avatar-wrapper:hover .avatar-overlay {
      opacity: 1;
    }

    .avatar-overlay-icon {
      font-size: 20px;
    }

    /* Group */
    .avatar-group {
      display: flex;
      align-items: center;
    }

    .avatar-group .avatar-wrapper {
      margin-left: -8px;
      transition: transform var(--transition-fast) var(--transition-ease);
    }

    .avatar-group .avatar-wrapper:first-child {
      margin-left: 0;
    }

    .avatar-group .avatar-wrapper:hover {
      transform: translateY(-4px);
      z-index: 1;
    }

    .avatar-group-count {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      font-weight: var(--font-medium);
      margin-left: -8px;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .avatar-status {
        border-color: var(--dark-bg-primary);
      }

      .avatar-group-count {
        background: var(--dark-bg-tertiary);
        color: var(--dark-text-primary);
      }
    }

    /* RTL Support */
    [dir="rtl"] .avatar-group .avatar-wrapper {
      margin-left: 0;
      margin-right: -8px;
    }

    [dir="rtl"] .avatar-group .avatar-wrapper:first-child {
      margin-right: 0;
    }

    [dir="rtl"] .avatar-group-count {
      margin-left: 0;
      margin-right: -8px;
    }
  `;

  const avatarContent = () => {
    if (src && !imageError) {
      return (
        <>
          {!imageLoaded && (
            <div className="avatar-loading">
              <FiUser className="avatar-icon" />
            </div>
          )}
          <img
            src={src}
            alt={alt || name || 'avatar'}
            className={`avatar-image ${imageLoaded ? 'avatar-image-loaded' : 'avatar-image-loading'}`}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoaded(true)}
          />
        </>
      );
    }

    if (CustomIcon) {
      return <CustomIcon className="avatar-icon" />;
    }

    if (name) {
      return <span className="avatar-initials">{getInitials()}</span>;
    }

    return <FiUser className="avatar-icon" />;
  };

  return (
    <>
      <style>{styles}</style>
      <div
        className={`
          avatar-wrapper
          ${className}
        `}
        onClick={onClick}
      >
        <div
          className={`
            avatar
            ${sizeClasses[size]}
            ${shapeClasses[shape]}
            ${border ? 'avatar-border' : ''}
            ${!src || imageError ? getColorFromName() : ''}
            ${onClick ? 'avatar-clickable' : ''}
          `}
          {...props}
        >
          {avatarContent()}
        </div>

        {/* Status Indicator */}
        {status && (
          <span
            className={`
              avatar-status
              ${statusColorClasses[status]}
              ${statusPositionClasses[statusPosition]}
            `}
          />
        )}
      </div>
    </>
  );
};

// Avatar Group Component
export const AvatarGroup = ({
  avatars = [],
  max = 5,
  size = 'medium',
  shape = 'circle',
  spacing = 2,
  showCount = true,
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const styles = `
    .avatar-group-spacing-1 {
      gap: 4px;
    }
    .avatar-group-spacing-1 .avatar-wrapper {
      margin-left: -4px;
    }
    .avatar-group-spacing-2 {
      gap: 8px;
    }
    .avatar-group-spacing-2 .avatar-wrapper {
      margin-left: -8px;
    }
    .avatar-group-spacing-3 {
      gap: 12px;
    }
    .avatar-group-spacing-3 .avatar-wrapper {
      margin-left: -12px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`avatar-group avatar-group-spacing-${spacing}`}>
        {visibleAvatars.map((avatar, index) => (
          <Avatar
            key={index}
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
            shape={shape}
            {...props}
          />
        ))}
        {showCount && remainingCount > 0 && (
          <div
            className={`
              avatar
              avatar-group-count
              ${sizeClasses[size]}
              ${shapeClasses[shape]}
            `}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </>
  );
};

// Editable Avatar Component
export const EditableAvatar = ({
  onUpload,
  onRemove,
  uploading = false,
  ...props
}) => {
  const fileInputRef = React.useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const styles = `
    .avatar-edit-overlay {
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .avatar-edit-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .avatar-edit-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .avatar-edit-btn:active {
      transform: scale(0.95);
    }

    .avatar-upload-input {
      display: none;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="avatar-wrapper avatar-editable">
        <Avatar {...props} />
        
        {/* Edit Overlay */}
        <div className="avatar-overlay avatar-edit-overlay">
          <button
            className="avatar-edit-btn"
            onClick={handleClick}
            disabled={uploading}
            title="Upload new photo"
          >
            {uploading ? <FiCamera /> : <FiUpload />}
          </button>
          {props.src && (
            <button
              className="avatar-edit-btn"
              onClick={onRemove}
              title="Remove photo"
            >
              <FiTrash2 />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="avatar-upload-input"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </>
  );
};

// Organization Avatar Component
export const OrganizationAvatar = ({ organization, ...props }) => {
  const getOrgInitials = () => {
    if (!organization.name) return '?';
    
    const words = organization.name.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  };

  return (
    <Avatar
      src={organization.logo}
      name={organization.name}
      icon={FiUser}
      {...props}
    >
      {getOrgInitials()}
    </Avatar>
  );
};

// Team Avatar Component
export const TeamAvatar = ({ team, ...props }) => {
  return (
    <AvatarGroup
      avatars={team.members?.map(member => ({
        src: member.avatar,
        name: member.name
      }))}
      max={3}
      size={props.size}
      {...props}
    />
  );
};

export default Avatar;
