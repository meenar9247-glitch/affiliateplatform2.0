const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Setting key (unique identifier)
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },

  // Setting value (can be any type)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Setting type for validation/parsing
  type: {
    type: String,
    enum: [
      'string',
      'number',
      'boolean',
      'array',
      'object',
      'json',
      'date',
      'email',
      'url',
      'phone',
      'color',
      'image',
      'file'
    ],
    default: 'string'
  },

  // Setting category for organization
  category: {
    type: String,
    enum: [
      'general',
      'site',
      'affiliate',
      'commission',
      'payout',
      'referral',
      'user',
      'auth',
      'email',
      'sms',
      'payment',
      'withdrawal',
      'notification',
      'security',
      'api',
      'seo',
      'analytics',
      'social',
      'integration',
      'appearance',
      'localization',
      'system'
    ],
    default: 'general',
    index: true
  },

  // Setting group within category
  group: {
    type: String,
    trim: true,
    default: 'default'
  },

  // Display name for UI
  label: {
    type: String,
    required: true,
    trim: true
  },

  // Description of what this setting does
  description: {
    type: String,
    trim: true
  },

  // Placeholder for UI inputs
  placeholder: {
    type: String,
    trim: true
  },

  // Options for select/multi-select inputs
  options: [{
    label: String,
    value: mongoose.Schema.Types.Mixed,
    description: String,
    disabled: {
      type: Boolean,
      default: false
    }
  }],

  // Validation rules
  validation: {
    required: {
      type: Boolean,
      default: false
    },
    min: mongoose.Schema.Types.Mixed,
    max: mongoose.Schema.Types.Mixed,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    patternMessage: String,
    custom: mongoose.Schema.Types.Mixed,
    messages: {
      type: Map,
      of: String
    }
  },

  // UI component type
  component: {
    type: String,
    enum: [
      'input',
      'textarea',
      'select',
      'multi-select',
      'checkbox',
      'radio',
      'switch',
      'slider',
      'color-picker',
      'date-picker',
      'time-picker',
      'datetime-picker',
      'file-upload',
      'image-upload',
      'code-editor',
      'rich-text-editor',
      'key-value-editor',
      'array-editor',
      'json-editor'
    ],
    default: 'input'
  },

  // UI attributes
  ui: {
    width: {
      type: String,
      enum: ['full', 'half', 'third', 'quarter', 'auto'],
      default: 'full'
    },
    order: {
      type: Number,
      default: 0
    },
    colSpan: {
      type: Number,
      default: 1
    },
    rowSpan: {
      type: Number,
      default: 1
    },
    className: String,
    style: mongoose.Schema.Types.Mixed,
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },

  // Dependencies (show/hide based on other settings)
  dependencies: [{
    key: String,
    value: mongoose.Schema.Types.Mixed,
    operator: {
      type: String,
      enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains', 'regex'],
      default: 'eq'
    }
  }],

  // Permissions (who can view/edit)
  permissions: {
    view: [{
      type: String,
      enum: ['admin', 'manager', 'user', 'guest', 'system']
    }],
    edit: [{
      type: String,
      enum: ['admin', 'manager', 'user', 'system']
    }],
    roles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },

  // Environment-specific overrides
  environments: {
    development: mongoose.Schema.Types.Mixed,
    staging: mongoose.Schema.Types.Mixed,
    production: mongoose.Schema.Types.Mixed,
    test: mongoose.Schema.Types.Mixed
  },

  // Default value (if not set)
  defaultValue: mongoose.Schema.Types.Mixed,

  // Is this setting encrypted?
  isEncrypted: {
    type: Boolean,
    default: false
  },

  // Is this setting required?
  isRequired: {
    type: Boolean,
    default: false
  },

  // Is this setting public (accessible via API without auth)?
  isPublic: {
    type: Boolean,
    default: false
  },

  // Is this setting read-only?
  isReadOnly: {
    type: Boolean,
    default: false
  },

  // Is this setting system critical?
  isSystem: {
    type: Boolean,
    default: false
  },

  // Is this setting deprecated?
  isDeprecated: {
    type: Boolean,
    default: false
  },

  // Deprecation message
  deprecationMessage: {
    type: String,
    trim: true
  },

  // Alternative setting to use
  alternativeKey: {
    type: String,
    trim: true
  },

  // Version information
  version: {
    type: String,
    default: '1.0.0'
  },

  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },

  // History of changes
  history: [{
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    ipAddress: String,
    userAgent: String
  }],

  // Notes
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],

  // Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
settingSchema.index({ key: 1, category: 1 });
settingSchema.index({ category: 1, group: 1 });
settingSchema.index({ tags: 1 });
settingSchema.index({ isPublic: 1, isActive: 1 });
settingSchema.index({ isSystem: 1 });
settingSchema.index({ isDeprecated: 1 });
settingSchema.index({ isDeleted: 1 });

// Update the updatedAt field on save
settingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Encrypt value if needed
settingSchema.pre('save', function(next) {
  if (this.isEncrypted && this.value && this.value !== this.defaultValue) {
    // Here you would encrypt the value
    // For now, we'll just mark it
    this.value = `[ENCRYPTED]${this.value}`;
  }
  next();
});

// Decrypt value when needed
settingSchema.methods.decrypt = function() {
  if (this.isEncrypted && typeof this.value === 'string' && this.value.startsWith('[ENCRYPTED]')) {
    return this.value.replace('[ENCRYPTED]', '');
  }
  return this.value;
};

// Virtual for typed value
settingSchema.virtual('typedValue').get(function() {
  switch (this.type) {
    case 'number':
      return Number(this.value);
    case 'boolean':
      return Boolean(this.value);
    case 'json':
      try {
        return typeof this.value === 'string' ? JSON.parse(this.value) : this.value;
      } catch (e) {
        return this.value;
      }
    case 'array':
      return Array.isArray(this.value) ? this.value : [];
    case 'object':
      return typeof this.value === 'object' ? this.value : {};
    default:
      return String(this.value);
  }
});

// Virtual for value as string
settingSchema.virtual('stringValue').get(function() {
  if (this.value === null || this.value === undefined) return '';
  return String(this.value);
});

// Virtual for value as number
settingSchema.virtual('numberValue').get(function() {
  const num = Number(this.value);
  return isNaN(num) ? 0 : num;
});

// Virtual for value as boolean
settingSchema.virtual('booleanValue').get(function() {
  if (typeof this.value === 'boolean') return this.value;
  if (typeof this.value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(this.value.toLowerCase());
  }
  return Boolean(this.value);
});

// Virtual for value as array
settingSchema.virtual('arrayValue').get(function() {
  if (Array.isArray(this.value)) return this.value;
  if (typeof this.value === 'string') {
    try {
      const parsed = JSON.parse(this.value);
      return Array.isArray(parsed) ? parsed : [this.value];
    } catch (e) {
      return this.value.split(',').map(s => s.trim());
    }
  }
  return [];
});

// Virtual for value as object
settingSchema.virtual('objectValue').get(function() {
  if (typeof this.value === 'object' && this.value !== null) return this.value;
  if (typeof this.value === 'string') {
    try {
      return JSON.parse(this.value);
    } catch (e) {
      return {};
    }
  }
  return {};
});

// Virtual for value as JSON
settingSchema.virtual('jsonValue').get(function() {
  try {
    if (typeof this.value === 'object') return JSON.stringify(this.value);
    if (typeof this.value === 'string') {
      JSON.parse(this.value); // validate
      return this.value;
    }
    return JSON.stringify(this.value);
  } catch (e) {
    return '{}';
  }
});

// Virtual for value with environment override
settingSchema.virtual('environmentValue').get(function() {
  const env = process.env.NODE_ENV || 'development';
  if (this.environments && this.environments[env] !== undefined) {
    return this.environments[env];
  }
  return this.value;
});

// Virtual for display value
settingSchema.virtual('displayValue').get(function() {
  if (this.isEncrypted) return '••••••••';
  if (this.type === 'password') return '••••••••';
  return this.value;
});

// Method to validate value
settingSchema.methods.validateValue = function(value) {
  if (this.validation.required && (value === null || value === undefined || value === '')) {
    return { valid: false, message: this.validation.messages?.required || 'This field is required' };
  }
  
  if (this.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, message: 'Must be a valid number' };
    }
    if (this.validation.min !== undefined && num < this.validation.min) {
      return { valid: false, message: `Minimum value is ${this.validation.min}` };
    }
    if (this.validation.max !== undefined && num > this.validation.max) {
      return { valid: false, message: `Maximum value is ${this.validation.max}` };
    }
  }
  
  if (this.type === 'string' && typeof value === 'string') {
    if (this.validation.minLength && value.length < this.validation.minLength) {
      return { valid: false, message: `Minimum length is ${this.validation.minLength}` };
    }
    if (this.validation.maxLength && value.length > this.validation.maxLength) {
      return { valid: false, message: `Maximum length is ${this.validation.maxLength}` };
    }
    if (this.validation.pattern) {
      const regex = new RegExp(this.validation.pattern);
      if (!regex.test(value)) {
        return { valid: false, message: this.validation.patternMessage || 'Invalid format' };
      }
    }
  }
  
  if (this.type === 'email' && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: 'Invalid email address' };
    }
  }
  
  if (this.type === 'url' && typeof value === 'string') {
    try {
      new URL(value);
    } catch (e) {
      return { valid: false, message: 'Invalid URL' };
    }
  }
  
  return { valid: true };
};

// Method to set value with history
settingSchema.methods.setValue = async function(newValue, userId, options = {}) {
  const validation = this.validateValue(newValue);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  const oldValue = this.value;
  
  // Convert value based on type
  let processedValue = newValue;
  if (this.type === 'number') {
    processedValue = Number(newValue);
  } else if (this.type === 'boolean') {
    processedValue = Boolean(newValue);
  } else if (this.type === 'json' && typeof newValue === 'object') {
    processedValue = JSON.stringify(newValue);
  }
  
  this.value = processedValue;
  
  // Add to history
  this.history.push({
    oldValue,
    newValue: processedValue,
    changedBy: userId,
    changedAt: Date.now(),
    reason: options.reason,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent
  });
  
  return this.save();
};

// Method to reset to default
settingSchema.methods.resetToDefault = async function(userId) {
  return this.setValue(this.defaultValue, userId, { reason: 'Reset to default' });
};

// Method to add note
settingSchema.methods.addNote = async function(text, userId, isPrivate = false) {
  this.notes.push({
    text,
    addedBy: userId,
    addedAt: Date.now(),
    isPrivate
  });
  
  return this.save();
};

// Method to check dependency
settingSchema.methods.checkDependency = function(dependency, allSettings) {
  const dependentSetting = allSettings.find(s => s.key === dependency.key);
  if (!dependentSetting) return false;
  
  const value = dependentSetting.value;
  
  switch (dependency.operator) {
    case 'eq':
      return value === dependency.value;
    case 'neq':
      return value !== dependency.value;
    case 'gt':
      return value > dependency.value;
    case 'gte':
      return value >= dependency.value;
    case 'lt':
      return value < dependency.value;
    case 'lte':
      return value <= dependency.value;
    case 'in':
      return Array.isArray(dependency.value) && dependency.value.includes(value);
    case 'nin':
      return Array.isArray(dependency.value) && !dependency.value.includes(value);
    case 'contains':
      return typeof value === 'string' && value.includes(dependency.value);
    case 'regex':
      const regex = new RegExp(dependency.value);
      return regex.test(value);
    default:
      return false;
  }
};

// Method to soft delete
settingSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Static method to get setting by key
settingSchema.statics.get = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key, isDeleted: false });
  if (!setting) return defaultValue;
  return setting.value;
};

// Static method to get typed value
settingSchema.statics.getTyped = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key, isDeleted: false });
  if (!setting) return defaultValue;
  return setting.typedValue;
};

// Static method to set setting
settingSchema.statics.set = async function(key, value, userId = null, options = {}) {
  let setting = await this.findOne({ key });
  
  if (!setting) {
    setting = new this({
      key,
      value,
      label: options.label || key,
      type: options.type || 'string',
      category: options.category || 'general',
      defaultValue: options.defaultValue
    });
  } else {
    await setting.setValue(value, userId, options);
  }
  
  return setting.save();
};

// Static method to get multiple settings
settingSchema.statics.getMultiple = async function(keys) {
  const settings = await this.find({ key: { $in: keys }, isDeleted: false });
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
};

// Static method to get settings by category
settingSchema.statics.getByCategory = async function(category) {
  return this.find({ 
    category, 
    isDeleted: false,
    isActive: true 
  }).sort({ 'ui.order': 1, key: 1 });
};

// Static method to get settings by group
settingSchema.statics.getByGroup = async function(category, group) {
  return this.find({ 
    category, 
    group,
    isDeleted: false,
    isActive: true 
  }).sort({ 'ui.order': 1, key: 1 });
};

// Static method to get public settings
settingSchema.statics.getPublicSettings = async function() {
  return this.find({ 
    isPublic: true, 
    isDeleted: false,
    isActive: true 
  });
};

// Static method to get system settings
settingSchema.statics.getSystemSettings = async function() {
  return this.find({ 
    isSystem: true, 
    isDeleted: false,
    isActive: true 
  });
};

// Static method to initialize default settings
settingSchema.statics.initializeDefaults = async function(defaultSettings) {
  for (const setting of defaultSettings) {
    await this.findOneAndUpdate(
      { key: setting.key },
      { 
        $setOnInsert: {
          ...setting,
          createdAt: Date.now()
        }
      },
      { upsert: true }
    );
  }
};

// Static method to reset all settings to default
settingSchema.statics.resetAllToDefault = async function(userId) {
  const settings = await this.find({ isDeleted: false });
  
  for (const setting of settings) {
    if (setting.defaultValue !== undefined) {
      await setting.resetToDefault(userId);
    }
  }
};

// Static method to get settings by tag
settingSchema.statics.getByTag = async function(tag) {
  return this.find({ 
    tags: tag, 
    isDeleted: false,
    isActive: true 
  });
};

// Static method to search settings
settingSchema.statics.search = async function(query, options = {}) {
  const searchQuery = {
    isDeleted: false,
    $or: [
      { key: new RegExp(query, 'i') },
      { label: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { category: new RegExp(query, 'i') },
      { group: new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ]
  };
  
  if (options.category) searchQuery.category = options.category;
  if (options.group) searchQuery.group = options.group;
  if (options.isPublic !== undefined) searchQuery.isPublic = options.isPublic;
  if (options.isSystem !== undefined) searchQuery.isSystem = options.isSystem;
  
  return this.find(searchQuery)
    .sort(options.sort || { category: 1, group: 1, 'ui.order': 1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to get settings statistics
settingSchema.statics.getStats = async function() {
  const total = await this.countDocuments({ isDeleted: false });
  
  const byCategory = await this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const byType = await this.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  const publicCount = await this.countDocuments({ isPublic: true, isDeleted: false });
  const systemCount = await this.countDocuments({ isSystem: true, isDeleted: false });
  const encryptedCount = await this.countDocuments({ isEncrypted: true, isDeleted: false });
  const deprecatedCount = await this.countDocuments({ isDeprecated: true, isDeleted: false });
  
  return {
    total,
    byCategory,
    byType,
    public: publicCount,
    system: systemCount,
    encrypted: encryptedCount,
    deprecated: deprecatedCount
  };
};

// Static method to export settings
settingSchema.statics.exportSettings = async function(categories = [], format = 'json') {
  const query = { isDeleted: false };
  if (categories.length > 0) query.category = { $in: categories };
  
  const settings = await this.find(query).select('-history -notes');
  
  if (format === 'json') {
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }
  
  return settings;
};

// Static method to import settings
settingSchema.statics.importSettings = async function(data, userId, options = {}) {
  const results = { success: [], failed: [] };
  
  for (const [key, value] of Object.entries(data)) {
    try {
      const setting = await this.findOne({ key });
      
      if (setting && !options.overwrite) {
        results.failed.push({ key, reason: 'Already exists' });
        continue;
      }
      
      if (setting) {
        await setting.setValue(value, userId, { reason: 'Import' });
      } else {
        await this.create({
          key,
          value,
          label: key,
          type: typeof value,
          category: options.defaultCategory || 'general'
        });
      }
      
      results.success.push(key);
    } catch (error) {
      results.failed.push({ key, reason: error.message });
    }
  }
  
  return results;
};

// Static method to migrate settings
settingSchema.statics.migrate = async function(migrations) {
  for (const migration of migrations) {
    const setting = await this.findOne({ key: migration.oldKey });
    
    if (setting) {
      // Create new setting with new key
      await this.create({
        key: migration.newKey,
        value: setting.value,
        label: migration.newLabel || setting.label,
        type: setting.type,
        category: migration.newCategory || setting.category,
        defaultValue: setting.defaultValue
      });
      
      // Optionally delete old setting
      if (migration.deleteOld) {
        await setting.softDelete();
      }
    }
  }
};

// Create and export model
const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
