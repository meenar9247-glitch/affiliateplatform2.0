import React, { useState, useRef, useEffect } from 'react';
import {
  FiUpload,
  FiX,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiDownload,
  FiEye,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';

const FileUpload = ({
  name,
  value = [],
  onChange,
  onBlur,
  label,
  helperText,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  multiple = false,
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 10,
  minFiles = 0,
  onFileSelect,
  onFileRemove,
  onFileError,
  preview = true,
  previewType = 'auto', // auto, image, video, audio, document
  showFileList = true,
  showProgress = true,
  showPreview = true,
  showRemoveButton = true,
  showDownloadButton = false,
  dragDrop = true,
  customPreview,
  customFileIcon,
  size = 'medium',
  variant = 'outlined', // outlined, filled, underlined
  fullWidth = true,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize files from value prop
    if (value && Array.isArray(value)) {
      setFiles(value);
    }
  }, [value]);

  const getFileType = (file) => {
    if (file.type) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      if (file.type.startsWith('audio/')) return 'audio';
      return 'document';
    }
    
    const extension = file.name?.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    if (archiveExtensions.includes(extension)) return 'archive';
    return 'document';
  };

  const getFileIcon = (file) => {
    const type = getFileType(file);
    switch (type) {
      case 'image':
        return <FiImage />;
      case 'video':
        return <FiVideo />;
      case 'audio':
        return <FiMusic />;
      case 'archive':
        return <FiArchive />;
      default:
        return <FiFile />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type || `application/${file.name.split('.').pop()}`;
      
      if (!acceptedTypes.some(type => {
        if (type.includes('*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType);
        }
        return type === fileType;
      })) {
        return 'File type not accepted';
      }
    }

    return null;
  };

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles = [];
    const errors = {};

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} files allowed`;
      onFileError?.(error);
      setUploadErrors({ ...uploadErrors, maxFiles: error });
      return;
    }

    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors[`new-${index}`] = error;
        onFileError?.(error);
      } else {
        newFiles.push(file);
      }
    });

    if (Object.keys(errors).length > 0) {
      setUploadErrors({ ...uploadErrors, ...errors });
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      
      // Simulate upload progress
      newFiles.forEach((file, index) => {
        simulateUpload(file, `${Date.now()}-${index}`);
      });

      onChange?.({
        target: {
          name,
          value: updatedFiles,
          type: 'file'
        }
      });

      onFileSelect?.(newFiles);
    }
  };

  const simulateUpload = (file, id) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({
        ...prev,
        [id]: Math.min(progress, 100)
      }));
    }, 200);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    onChange?.({
      target: {
        name,
        value: updatedFiles,
        type: 'file'
      }
    });

    onFileRemove?.(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || readOnly) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    if (!disabled && !readOnly) {
      fileInputRef.current?.click();
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'upload-small',
    medium: 'upload-medium',
    large: 'upload-large'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'upload-outlined',
    filled: 'upload-filled',
    underlined: 'upload-underlined'
  };

  // Status classes
  const statusClass = error && touched ? 'upload-error' : '';

  // Styles
  const styles = `
    .file-upload-wrapper {
      display: flex;
      flex-direction: column;
      ${fullWidth ? 'width: 100%;' : ''}
    }

    /* Label */
    .file-upload-label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    .file-upload-label-required {
      color: var(--danger);
      font-size: var(--text-xs);
    }

    /* Drop Zone */
    .file-upload-dropzone {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-primary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .file-upload-dropzone:hover:not(.disabled) {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .file-upload-dropzone.dragging {
      border-color: var(--primary);
      background: var(--primary-50);
      transform: scale(1.02);
    }

    .file-upload-dropzone.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: var(--bg-secondary);
    }

    .file-upload-dropzone.error {
      border-color: var(--danger);
    }

    /* Size Variants */
    .upload-small .file-upload-dropzone {
      padding: 12px;
    }

    .upload-small .upload-icon {
      font-size: 24px;
    }

    .upload-medium .file-upload-dropzone {
      padding: 20px;
    }

    .upload-medium .upload-icon {
      font-size: 32px;
    }

    .upload-large .file-upload-dropzone {
      padding: 28px;
    }

    .upload-large .upload-icon {
      font-size: 40px;
    }

    /* Variant Styles */
    .upload-outlined .file-upload-dropzone {
      border: 2px dashed var(--border);
      background: var(--bg-primary);
    }

    .upload-filled .file-upload-dropzone {
      border: 2px dashed var(--border);
      background: var(--bg-secondary);
    }

    .upload-underlined .file-upload-dropzone {
      border: none;
      border-bottom: 2px solid var(--border);
      border-radius: 0;
      padding: 12px 0;
    }

    /* Dropzone Content */
    .upload-icon {
      margin-bottom: 12px;
      color: var(--primary);
    }

    .upload-title {
      font-size: var(--text-base);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .upload-hint {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .upload-accept {
      font-size: var(--text-xs);
      color: var(--text-disabled);
    }

    .upload-browse {
      color: var(--primary);
      text-decoration: underline;
    }

    /* Hidden Input */
    .file-upload-input {
      display: none;
    }

    /* File List */
    .file-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      animation: slideIn 0.3s var(--transition-ease);
    }

    .file-item.error {
      background: var(--danger-50);
    }

    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 20px;
    }

    .file-info {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    .file-size {
      color: var(--text-disabled);
    }

    .file-error {
      color: var(--danger);
    }

    .file-actions {
      display: flex;
      gap: 4px;
    }

    .file-action-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .file-action-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .file-action-btn.remove:hover {
      color: var(--danger);
    }

    /* Preview */
    .file-preview {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--bg-tertiary);
    }

    .file-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Progress Bar */
    .file-progress {
      margin-top: 4px;
      width: 100%;
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .file-progress-bar {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s var(--transition-ease);
    }

    /* Helper Text */
    .file-upload-helper {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .file-upload-error {
      margin-top: 4px;
      font-size: var(--text-xs);
      color: var(--danger);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-icon {
      flex-shrink: 0;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .file-upload-label {
        color: var(--dark-text-primary);
      }

      .file-upload-dropzone {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .file-upload-dropzone:hover:not(.disabled) {
        background: var(--dark-primary-50);
      }

      .upload-title {
        color: var(--dark-text-primary);
      }

      .upload-hint {
        color: var(--dark-text-muted);
      }

      .file-item {
        background: var(--dark-bg-tertiary);
      }

      .file-name {
        color: var(--dark-text-primary);
      }

      .file-meta {
        color: var(--dark-text-muted);
      }

      .file-upload-helper {
        color: var(--dark-text-muted);
      }
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`file-upload-wrapper ${className}`}>
        {/* Label */}
        {label && (
          <label htmlFor={name} className={`file-upload-label ${labelClassName}`}>
            {label}
            {required && <span className="file-upload-label-required">*</span>}
          </label>
        )}

        {/* Drop Zone */}
        {dragDrop ? (
          <div
            className={`
              file-upload-dropzone
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${isDragging ? 'dragging' : ''}
              ${statusClass}
              ${disabled || readOnly ? 'disabled' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <FiUpload className="upload-icon" />
            <div className="upload-title">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </div>
            <div className="upload-hint">
              or <span className="upload-browse">browse</span>
            </div>
            <div className="upload-accept">
              Accepted files: {accept === '*/*' ? 'All files' : accept}
            </div>
            {maxSize && (
              <div className="upload-accept">
                Max size: {formatFileSize(maxSize)}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={`
              file-upload-dropzone
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${statusClass}
              ${disabled || readOnly ? 'disabled' : ''}
            `}
            onClick={handleBrowseClick}
            disabled={disabled || readOnly}
          >
            <FiUpload className="upload-icon" />
            <div className="upload-title">Click to upload files</div>
            <div className="upload-accept">
              Accepted files: {accept === '*/*' ? 'All files' : accept}
            </div>
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          onBlur={onBlur}
          disabled={disabled || readOnly}
          className="file-upload-input"
          {...props}
        />

        {/* File List */}
        {showFileList && files.length > 0 && (
          <div className="file-list">
            {files.map((file, index) => {
              const fileId = `${file.name}-${index}`;
              const progress = uploadProgress[fileId];
              const error = uploadErrors[fileId];
              const fileType = getFileType(file);
              const fileIcon = customFileIcon || getFileIcon(file);
              const filePreview = customPreview || (preview && fileType === 'image' && URL.createObjectURL(file));

              return (
                <div
                  key={`${file.name}-${index}`}
                  className={`file-item ${error ? 'error' : ''}`}
                >
                  {/* Preview */}
                  {showPreview && filePreview && (
                    <div className="file-preview">
                      <img src={filePreview} alt={file.name} />
                    </div>
                  )}

                  {/* Icon */}
                  {(!showPreview || !filePreview) && (
                    <div className="file-icon">{fileIcon}</div>
                  )}

                  {/* File Info */}
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      {error && <span className="file-error">{error}</span>}
                    </div>
                    
                    {/* Progress Bar */}
                    {showProgress && progress !== undefined && progress < 100 && (
                      <div className="file-progress">
                        <div
                          className="file-progress-bar"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="file-actions">
                    {showDownloadButton && (
                      <button
                        type="button"
                        className="file-action-btn"
                        onClick={() => {/* Download logic */}}
                        title="Download"
                      >
                        <FiDownload size={16} />
                      </button>
                    )}
                    
                    {showRemoveButton && (
                      <button
                        type="button"
                        className="file-action-btn remove"
                        onClick={() => handleRemoveFile(index)}
                        title="Remove"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error / Helper Text */}
        {error && touched ? (
          <div className={`file-upload-error ${errorClassName}`}>
            <FiAlertCircle className="error-icon" size={14} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <div className={`file-upload-helper ${helperClassName}`}>
            <span>{helperText}</span>
          </div>
        ) : null}
      </div>
    </>
  );
};

// Image Upload Component (specialized for images)
export const ImageUpload = ({
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  preview = true,
  ...props
}) => {
  return (
    <FileUpload
      accept={accept}
      maxSize={maxSize}
      preview={preview}
      previewType="image"
      customFileIcon={<FiImage />}
      {...props}
    />
  );
};

// Avatar Upload Component (circular preview)
export const AvatarUpload = ({
  value,
  onChange,
  size = 100,
  ...props
}) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (value && value[0]) {
      const url = URL.createObjectURL(value[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const styles = `
    .avatar-upload-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .avatar-preview {
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--border);
    }

    .avatar-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-preview-icon {
      font-size: ${size * 0.4}px;
      color: var(--text-secondary);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="avatar-upload-wrapper">
        <div className="avatar-preview">
          {preview ? (
            <img src={preview} alt="Avatar preview" />
          ) : (
            <FiImage className="avatar-preview-icon" />
          )}
        </div>
        <FileUpload
          {...props}
          value={value}
          onChange={onChange}
          multiple={false}
          accept="image/*"
          preview={false}
          showFileList={false}
          dragDrop={false}
        />
      </div>
    </>
  );
};

// Document Upload Component
export const DocumentUpload = (props) => {
  return (
    <FileUpload
      accept=".pdf,.doc,.docx,.txt"
      maxSize={20 * 1024 * 1024}
      customFileIcon={<FiFile />}
      {...props}
    />
  );
};

export default FileUpload;
