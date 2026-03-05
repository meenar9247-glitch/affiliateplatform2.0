/**
 * ============================================
 * UPLOAD MIDDLEWARE
 * Professional file upload handling with multiple storage options,
 * file validation, virus scanning, and optimization
 * ============================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { AppError } = require('./errorMiddleware');

// ============================================
// Configuration
// ============================================

// Allowed file types
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac'],
  archive: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip', 'application/x-tar'],
  other: ['application/octet-stream']
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  archive: 50 * 1024 * 1024, // 50MB
  other: 20 * 1024 * 1024 // 20MB
};

// Upload paths
const UPLOAD_PATHS = {
  profile: 'uploads/profiles',
  product: 'uploads/products',
  document: 'uploads/documents',
  ticket: 'uploads/tickets',
  commission: 'uploads/commissions',
  payout: 'uploads/payouts',
  referral: 'uploads/referrals',
  banner: 'uploads/banners',
  logo: 'uploads/logos',
  temp: 'uploads/temp'
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique filename
 */
const generateFilename = (originalname, prefix = '') => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const basename = path.basename(originalname, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 50);
  
  return `${prefix}${basename}-${timestamp}-${random}${extension}`;
};

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = (dirPath) => {
  const fullPath = path.join(__dirname, '../../', dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`Created upload directory: ${fullPath}`);
  }
  return fullPath;
};

/**
 * Get file category from mimetype
 */
const getFileCategory = (mimetype) => {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return 'other';
};

/**
 * Validate file type
 */
const validateFileType = (file, allowedTypes = null) => {
  if (!file) return false;
  
  const categories = allowedTypes || Object.keys(ALLOWED_FILE_TYPES);
  const category = getFileCategory(file.mimetype);
  
  return categories.includes(category) || categories.includes(file.mimetype);
};

/**
 * Validate file size
 */
const validateFileSize = (file, maxSize = null) => {
  if (!file) return false;
  
  const category = getFileCategory(file.mimetype);
  const limit = maxSize || FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.other;
  
  return file.size <= limit;
};

/**
 * Scan file for viruses (mock implementation)
 * In production, integrate with ClamAV or similar
 */
const scanFileForVirus = async (filePath) => {
  // TODO: Implement actual virus scanning
  logger.info('Scanning file for viruses:', filePath);
  return { clean: true };
};

/**
 * Optimize image
 */
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 80,
    format = 'jpeg',
    fit = 'cover'
  } = options;

  try {
    let pipeline = sharp(inputPath);

    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit,
        withoutEnlargement: true
      });
    }

    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    }

    await pipeline.toFile(outputPath);
    logger.info(`Image optimized: ${outputPath}`);
    return true;
  } catch (error) {
    logger.error('Image optimization error:', error);
    return false;
  }
};

// ============================================
// Disk Storage Configuration
// ============================================

/**
 * Configure disk storage
 */
const diskStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = UPLOAD_PATHS[folder] || 'uploads/other';
    const fullPath = ensureUploadDir(uploadPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const prefix = folder ? `${folder}-` : '';
    const filename = generateFilename(file.originalname, prefix);
    cb(null, filename);
  }
});

// ============================================
// Memory Storage Configuration
// ============================================

/**
 * Configure memory storage (for cloud upload)
 */
const memoryStorage = multer.memoryStorage();

// ============================================
// File Filter
// ============================================

/**
 * Create file filter based on allowed types
 */
const createFileFilter = (allowedTypes = null) => {
  return (req, file, cb) => {
    if (validateFileType(file, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new AppError(
        `Invalid file type. Allowed types: ${allowedTypes?.join(', ') || 'images, documents, etc.'}`,
        400,
        'ERR_INVALID_FILE_TYPE'
      ));
    }
  };
};

// ============================================
// Upload Middleware Factory
// ============================================

/**
 * Create upload middleware with options
 */
exports.createUploader = (options = {}) => {
  const {
    folder = 'other',
    allowedTypes = null,
    maxSize = null,
    maxCount = 1,
    fieldName = 'file',
    useMemoryStorage = false,
    optimize = false,
    virusScan = false
  } = options;

  const storage = useMemoryStorage ? memoryStorage : diskStorage(folder);
  const fileFilter = createFileFilter(allowedTypes);

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize || FILE_SIZE_LIMITS[getFileCategory] || FILE_SIZE_LIMITS.other,
      files: maxCount
    }
  });

  // Return middleware with post-processing
  return async (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError(`File too large. Max size: ${maxSize / (1024*1024)}MB`, 400, 'ERR_FILE_TOO_LARGE'));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new AppError(`Too many files. Max: ${maxCount}`, 400, 'ERR_TOO_MANY_FILES'));
          }
          return next(new AppError(err.message, 400, 'ERR_UPLOAD'));
        }
        return next(err);
      }

      if (!req.files && !req.file) {
        return next();
      }

      const files = req.files || [req.file];

      try {
        // Process each file
        for (const file of files) {
          // Virus scan
          if (virusScan) {
            const scanResult = await scanFileForVirus(file.path);
            if (!scanResult.clean) {
              // Remove infected file
              fs.unlinkSync(file.path);
              return next(new AppError('File contains virus or malware', 400, 'ERR_VIRUS_DETECTED'));
            }
          }

          // Optimize images
          if (optimize && file.mimetype.startsWith('image/')) {
            const optimizedPath = file.path.replace(/(\.[^.]+)$/, '-optimized$1');
            const success = await optimizeImage(file.path, optimizedPath);
            if (success) {
              // Replace original with optimized
              fs.unlinkSync(file.path);
              fs.renameSync(optimizedPath, file.path);
            }
          }

          // Add file info to request
          file.url = `/uploads/${folder}/${path.basename(file.path)}`;
          file.sizeFormatted = (file.size / 1024).toFixed(2) + ' KB';
        }

        next();
      } catch (error) {
        // Clean up on error
        files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        next(error);
      }
    });
  };
};

// ============================================
// Pre-configured Upload Middlewares
// ============================================

/**
 * Profile picture upload
 */
exports.uploadProfilePicture = exports.createUploader({
  folder: 'profile',
  allowedTypes: ALLOWED_FILE_TYPES.image,
  maxSize: FILE_SIZE_LIMITS.image,
  maxCount: 1,
  fieldName: 'profilePicture',
  optimize: true
});

/**
 * Product image upload
 */
exports.uploadProductImage = exports.createUploader({
  folder: 'product',
  allowedTypes: ALLOWED_FILE_TYPES.image,
  maxSize: FILE_SIZE_LIMITS.image,
  maxCount: 5,
  fieldName: 'images',
  optimize: true
});

/**
 * Document upload
 */
exports.uploadDocument = exports.createUploader({
  folder: 'document',
  allowedTypes: [...ALLOWED_FILE_TYPES.document, ...ALLOWED_FILE_TYPES.image],
  maxSize: FILE_SIZE_LIMITS.document,
  maxCount: 3,
  fieldName: 'documents',
  virusScan: true
});

/**
 * Ticket attachment upload
 */
exports.uploadTicketAttachment = exports.createUploader({
  folder: 'ticket',
  allowedTypes: [
    ...ALLOWED_FILE_TYPES.image,
    ...ALLOWED_FILE_TYPES.document,
    ...ALLOWED_FILE_TYPES.archive
  ],
  maxSize: 20 * 1024 * 1024, // 20MB
  maxCount: 5,
  fieldName: 'attachments',
  virusScan: true
});

/**
 * Commission proof upload
 */
exports.uploadCommissionProof = exports.createUploader({
  folder: 'commission',
  allowedTypes: ALLOWED_FILE_TYPES.image,
  maxSize: FILE_SIZE_LIMITS.image,
  maxCount: 3,
  fieldName: 'proof',
  optimize: true
});

/**
 * Payout receipt upload
 */
exports.uploadPayoutReceipt = exports.createUploader({
  folder: 'payout',
  allowedTypes: [...ALLOWED_FILE_TYPES.document, ...ALLOWED_FILE_TYPES.image],
  maxSize: FILE_SIZE_LIMITS.document,
  maxCount: 1,
  fieldName: 'receipt'
});

/**
 * Banner upload
 */
exports.uploadBanner = exports.createUploader({
  folder: 'banner',
  allowedTypes: ALLOWED_FILE_TYPES.image,
  maxSize: FILE_SIZE_LIMITS.image,
  maxCount: 1,
  fieldName: 'banner',
  optimize: true
});

/**
 * Logo upload
 */
exports.uploadLogo = exports.createUploader({
  folder: 'logo',
  allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
  maxSize: 2 * 1024 * 1024, // 2MB
  maxCount: 1,
  fieldName: 'logo',
  optimize: true
});

/**
 * Bulk file upload
 */
exports.uploadBulkFiles = exports.createUploader({
  folder: 'temp',
  allowedTypes: [
    ...ALLOWED_FILE_TYPES.image,
    ...ALLOWED_FILE_TYPES.document,
    ...ALLOWED_FILE_TYPES.archive
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  maxCount: 10,
  fieldName: 'files',
  virusScan: true
});

// ============================================
// Memory Upload (for cloud storage)
// ============================================

/**
 * Memory upload for cloud storage
 */
exports.uploadToMemory = exports.createUploader({
  useMemoryStorage: true,
  allowedTypes: null,
  maxSize: 10 * 1024 * 1024, // 10MB
  maxCount: 1,
  fieldName: 'file'
});

// ============================================
// File Management Utilities
// ============================================

/**
 * Delete file
 */
exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '../../', filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          logger.error('Error deleting file:', err);
          reject(err);
        } else {
          logger.info(`File deleted: ${filePath}`);
          resolve(true);
        }
      });
    } else {
      resolve(false);
    }
  });
};

/**
 * Get file info
 */
exports.getFileInfo = (filePath) => {
  const fullPath = path.join(__dirname, '../../', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  const ext = path.extname(fullPath);
  const name = path.basename(fullPath, ext);

  return {
    name: name + ext,
    basename: name,
    extension: ext.substring(1),
    size: stats.size,
    sizeFormatted: (stats.size / 1024).toFixed(2) + ' KB',
    mimetype: mime.lookup(fullPath) || 'application/octet-stream',
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    path: filePath,
    url: `/${filePath.replace(/\\/g, '/')}`
  };
};

/**
 * Cleanup temp files
 */
exports.cleanupTempFiles = (hours = 24) => {
  const tempDir = path.join(__dirname, '../../', UPLOAD_PATHS.temp);
  const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        logger.error('Error reading temp directory:', err);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(`Error deleting temp file ${file}:`, err);
            } else {
              logger.info(`Deleted temp file: ${file}`);
            }
          });
        }
      });
    });
  }
};

// ============================================
// Cleanup job (run every day)
// ============================================

setInterval(() => {
  exports.cleanupTempFiles(24);
}, 24 * 60 * 60 * 1000);

module.exports = exports;
