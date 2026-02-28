// Number formatting options
export const NUMBER_FORMATS = {
  DECIMAL: 'decimal',
  PERCENT: 'percent',
  CURRENCY: 'currency',
  SCIENTIFIC: 'scientific',
  ENGINEERING: 'engineering',
  COMPACT: 'compact',
};

// Currency display formats
export const CURRENCY_DISPLAY = {
  SYMBOL: 'symbol',
  CODE: 'code',
  NAME: 'name',
  NARROW_SYMBOL: 'narrowSymbol',
};

// Compact display formats
export const COMPACT_DISPLAY = {
  SHORT: 'short',
  LONG: 'long',
};

// Number formatter class
export class NumberFormatter {
  constructor(locale = 'en-US', options = {}) {
    this.locale = locale;
    this.options = {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
      useGrouping: true,
      ...options,
    };
  }

  // Format number
  format(number, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    return new Intl.NumberFormat(this.locale, mergedOptions).format(number);
  }

  // Format as decimal
  decimal(number, decimals = 2) {
    return this.format(number, {
      style: NUMBER_FORMATS.DECIMAL,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format as percentage
  percent(number, decimals = 2) {
    return this.format(number / 100, {
      style: NUMBER_FORMATS.PERCENT,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format as currency
  currency(number, currency = 'USD', options = {}) {
    return this.format(number, {
      style: NUMBER_FORMATS.CURRENCY,
      currency,
      currencyDisplay: CURRENCY_DISPLAY.SYMBOL,
      ...options,
    });
  }

  // Format in compact notation (K, M, B)
  compact(number, decimals = 1, display = COMPACT_DISPLAY.SHORT) {
    return this.format(number, {
      notation: NUMBER_FORMATS.COMPACT,
      compactDisplay: display,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format as scientific notation
  scientific(number, decimals = 2) {
    return this.format(number, {
      notation: NUMBER_FORMATS.SCIENTIFIC,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format as engineering notation
  engineering(number, decimals = 2) {
    return this.format(number, {
      notation: NUMBER_FORMATS.ENGINEERING,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Format as ordinal (1st, 2nd, 3rd)
  ordinal(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
    return `${number}${suffix}`;
  }

  // Format as Roman numerals
  roman(number) {
    if (number < 1 || number > 3999) return number.toString();
    
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    
    let result = '';
    let remaining = number;
    
    for (let i = 0; i < values.length; i++) {
      while (remaining >= values[i]) {
        result += symbols[i];
        remaining -= values[i];
      }
    }
    
    return result;
  }

  // Format as words (123 => one hundred twenty three)
  words(number, locale = 'en') {
    if (locale === 'en') {
      return this.numberToWordsEnglish(number);
    }
    return number.toString();
  }

  // English number to words
  numberToWordsEnglish(number) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
    
    if (number === 0) return 'zero';
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' hundred';
        n %= 100;
        if (n > 0) result += ' ';
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) result += '-' + ones[n];
      } else if (n > 0) {
        result += ones[n];
      }
      
      return result;
    };
    
    let result = '';
    let scaleIndex = 0;
    
    while (number > 0) {
      const chunk = number % 1000;
      if (chunk > 0) {
        const chunkWords = convertLessThanThousand(chunk);
        if (scaleIndex > 0) {
          result = chunkWords + ' ' + scales[scaleIndex] + (result ? ' ' + result : '');
        } else {
          result = chunkWords + (result ? ' ' + result : '');
        }
      }
      number = Math.floor(number / 1000);
      scaleIndex++;
    }
    
    return result;
  }

  // Parse formatted number
  parse(formatted) {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = formatted.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned);
  }

  // Round number
  round(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
  }

  // Ceil number
  ceil(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.ceil(number * factor) / factor;
  }

  // Floor number
  floor(number, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.floor(number * factor) / factor;
  }

  // Format file size
  fileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${this.decimal(bytes / Math.pow(k, i), decimals)} ${sizes[i]}`;
  }

  // Format percentage change
  percentageChange(oldValue, newValue, decimals = 2) {
    if (oldValue === 0) return newValue > 0 ? '+100%' : '0%';
    
    const change = ((newValue - oldValue) / oldValue) * 100;
    const sign = change > 0 ? '+' : '';
    
    return `${sign}${this.decimal(change, decimals)}%`;
  }

  // Format as fraction
  fraction(decimal, options = {}) {
    const tolerance = options.tolerance || 1.0E-6;
    const maxDenominator = options.maxDenominator || 1000;
    
    let numerator = Math.floor(decimal);
    let denominator = 1;
    let remaining = decimal - numerator;
    
    if (Math.abs(remaining) < tolerance) {
      return `${numerator}`;
    }
    
    let bestNumerator = 0;
    let bestDenominator = 1;
    let bestError = Math.abs(remaining);
    
    for (let d = 1; d <= maxDenominator; d++) {
      const n = Math.round(remaining * d);
      const error = Math.abs(remaining - n / d);
      
      if (error < bestError) {
        bestError = error;
        bestNumerator = n;
        bestDenominator = d;
        
        if (error < tolerance) break;
      }
    }
    
    const totalNumerator = numerator * bestDenominator + bestNumerator;
    
    if (totalNumerator === 0) return '0';
    if (bestDenominator === 1) return `${totalNumerator}`;
    
    return `${totalNumerator}/${bestDenominator}`;
  }
}
// Date formats
export const DATE_FORMATS = {
  ISO: 'iso',
  UTC: 'utc',
  LOCAL: 'local',
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  FULL: 'full',
  RELATIVE: 'relative',
};

// Time formats
export const TIME_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  FULL: 'full',
};

// Date formatter class
export class DateFormatter {
  constructor(locale = 'en-US', timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    this.locale = locale;
    this.timezone = timezone;
    this.relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  }

  // Format date
  format(date, options = {}) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return 'Invalid date';
    
    const formatOptions = {
      timeZone: this.timezone,
      ...options,
    };
    
    return new Intl.DateTimeFormat(this.locale, formatOptions).format(dateObj);
  }

  // Format as ISO string
  iso(date) {
    const dateObj = this.normalizeDate(date);
    return dateObj ? dateObj.toISOString() : 'Invalid date';
  }

  // Format as UTC string
  utc(date) {
    const dateObj = this.normalizeDate(date);
    return dateObj ? dateObj.toUTCString() : 'Invalid date';
  }

  // Format as local string
  local(date, options = {}) {
    return this.format(date, { dateStyle: DATE_FORMATS.FULL, timeStyle: TIME_FORMATS.MEDIUM, ...options });
  }

  // Format date only
  date(date, format = DATE_FORMATS.MEDIUM) {
    const options = {
      [DATE_FORMATS.SHORT]: { dateStyle: 'short' },
      [DATE_FORMATS.MEDIUM]: { dateStyle: 'medium' },
      [DATE_FORMATS.LONG]: { dateStyle: 'long' },
      [DATE_FORMATS.FULL]: { dateStyle: 'full' },
    };
    
    return this.format(date, options[format] || options[DATE_FORMATS.MEDIUM]);
  }

  // Format time only
  time(date, format = TIME_FORMATS.MEDIUM) {
    const options = {
      [TIME_FORMATS.SHORT]: { timeStyle: 'short' },
      [TIME_FORMATS.MEDIUM]: { timeStyle: 'medium' },
      [TIME_FORMATS.LONG]: { timeStyle: 'long' },
      [TIME_FORMATS.FULL]: { timeStyle: 'full' },
    };
    
    return this.format(date, options[format] || options[TIME_FORMATS.MEDIUM]);
  }

  // Format relative time (2 hours ago, in 3 days)
  relative(date, base = new Date()) {
    const dateObj = this.normalizeDate(date);
    const baseObj = this.normalizeDate(base);
    
    if (!dateObj || !baseObj) return 'Invalid date';
    
    const diffInSeconds = (dateObj - baseObj) / 1000;
    const absDiff = Math.abs(diffInSeconds);
    
    const units = [
      { name: 'year', seconds: 31536000 },
      { name: 'month', seconds: 2592000 },
      { name: 'week', seconds: 604800 },
      { name: 'day', seconds: 86400 },
      { name: 'hour', seconds: 3600 },
      { name: 'minute', seconds: 60 },
      { name: 'second', seconds: 1 },
    ];
    
    for (const unit of units) {
      if (absDiff >= unit.seconds) {
        const value = Math.round(diffInSeconds / unit.seconds);
        return this.relativeFormatter.format(value, unit.name);
      }
    }
    
    return 'just now';
  }

  // Format as age (25 years old)
  age(date) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return 'Invalid date';
    
    const today = new Date();
    let age = today.getFullYear() - dateObj.getFullYear();
    const monthDiff = today.getMonth() - dateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  }

  // Format as day of week
  dayOfWeek(date, format = 'long') {
    const options = {
      short: { weekday: 'short' },
      long: { weekday: 'long' },
      narrow: { weekday: 'narrow' },
    };
    
    return this.format(date, options[format] || options.long);
  }

  // Format as month name
  month(date, format = 'long') {
    const options = {
      numeric: { month: 'numeric' },
      '2-digit': { month: '2-digit' },
      short: { month: 'short' },
      long: { month: 'long' },
      narrow: { month: 'narrow' },
    };
    
    return this.format(date, options[format] || options.long);
  }

  // Format as year
  year(date, format = 'numeric') {
    const options = {
      numeric: { year: 'numeric' },
      '2-digit': { year: '2-digit' },
    };
    
    return this.format(date, options[format] || options.numeric);
  }

  // Format as quarter
  quarter(date) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return 'Invalid date';
    
    const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
    return `Q${quarter}`;
  }

  // Format as week number
  weekNumber(date) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return 'Invalid date';
    
    const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Format as timestamp
  timestamp(date) {
    const dateObj = this.normalizeDate(date);
    return dateObj ? dateObj.getTime() : null;
  }

  // Format with custom pattern
  formatPattern(date, pattern) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return 'Invalid date';
    
    const tokens = {
      'YYYY': dateObj.getFullYear(),
      'YY': String(dateObj.getFullYear()).slice(-2),
      'MM': String(dateObj.getMonth() + 1).padStart(2, '0'),
      'M': dateObj.getMonth() + 1,
      'DD': String(dateObj.getDate()).padStart(2, '0'),
      'D': dateObj.getDate(),
      'HH': String(dateObj.getHours()).padStart(2, '0'),
      'H': dateObj.getHours(),
      'hh': String(dateObj.getHours() % 12 || 12).padStart(2, '0'),
      'h': dateObj.getHours() % 12 || 12,
      'mm': String(dateObj.getMinutes()).padStart(2, '0'),
      'm': dateObj.getMinutes(),
      'ss': String(dateObj.getSeconds()).padStart(2, '0'),
      's': dateObj.getSeconds(),
      'SSS': String(dateObj.getMilliseconds()).padStart(3, '0'),
      'A': dateObj.getHours() >= 12 ? 'PM' : 'AM',
      'a': dateObj.getHours() >= 12 ? 'pm' : 'am',
      'ddd': this.dayOfWeek(date, 'short'),
      'dddd': this.dayOfWeek(date, 'long'),
      'MMM': this.month(date, 'short'),
      'MMMM': this.month(date, 'long'),
    };
    
    return pattern.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ddd|dddd|MMM|MMMM/g, 
      match => tokens[match] || match);
  }

  // Get start of period
  startOf(date, unit) {
    const dateObj = this.normalizeDate(date);
    if (!dateObj) return null;
    
    const result = new Date(dateObj);
    
    switch (unit) {
      case 'year':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'month':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1);
        result.setDate(diff);
        result.setHours(0, 0, 0, 0);
        break;
      case 'day':
        result.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        result.setMinutes(0, 0, 0);
        break;
      case 'minute':
        result.setSeconds(0, 0);
        break;
      case 'second':
        result.setMilliseconds(0);
        break;
    }
    
    return result;
  }

  // Get end of period
  endOf(date, unit) {
    const result = this.startOf(date, unit);
    if (!result) return null;
    
    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + 1);
        result.setMilliseconds(-1);
        break;
      case 'month':
        result.setMonth(result.getMonth() + 1);
        result.setMilliseconds(-1);
        break;
      case 'week':
        result.setDate(result.getDate() + 7);
        result.setMilliseconds(-1);
        break;
      case 'day':
        result.setDate(result.getDate() + 1);
        result.setMilliseconds(-1);
        break;
      case 'hour':
        result.setHours(result.getHours() + 1);
        result.setMilliseconds(-1);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + 1);
        result.setMilliseconds(-1);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + 1);
        result.setMilliseconds(-1);
        break;
    }
    
    return result;
  }

  // Normalize date input
  normalizeDate(date) {
    if (!date) return null;
    
    if (date instanceof Date) return date;
    
    if (typeof date === 'string' || typeof date === 'number') {
      const parsed = new Date(date);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }

  // Get difference between dates
  diff(date1, date2, unit = 'milliseconds') {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    
    if (!d1 || !d2) return null;
    
    const diffInMs = d1 - d2;
    
    const units = {
      milliseconds: 1,
      seconds: 1000,
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
      years: 365 * 24 * 60 * 60 * 1000,
    };
    
    return diffInMs / units[unit];
  }
}
// String formatter class
export class StringFormatter {
  // Truncate string
  truncate(str, length, suffix = '...') {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  // Capitalize first letter
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Capitalize each word
  capitalizeWords(str) {
    if (!str) return '';
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  // Convert to camelCase
  camelCase(str) {
    if (!str) return '';
    return str
      .replace(/[^\w\s]/g, '')
      .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^\w/, c => c.toLowerCase());
  }

  // Convert to PascalCase
  pascalCase(str) {
    if (!str) return '';
    return str
      .replace(/[^\w\s]/g, '')
      .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^\w/, c => c.toUpperCase());
  }

  // Convert to snake_case
  snakeCase(str) {
    if (!str) return '';
    return str
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  // Convert to kebab-case
  kebabCase(str) {
    if (!str) return '';
    return str
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  // Convert to title case
  titleCase(str) {
    if (!str) return '';
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    return str.replace(/\w\S*/g, (word, index) => {
      if (index > 0 && index < str.length && word.match(smallWords)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  // Reverse string
  reverse(str) {
    if (!str) return '';
    return str.split('').reverse().join('');
  }

  // Count words
  wordCount(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).length;
  }

  // Count characters
  charCount(str, includeSpaces = true) {
    if (!str) return 0;
    return includeSpaces ? str.length : str.replace(/\s/g, '').length;
  }

  // Extract initials
  initials(str, count = 2) {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word[0])
      .slice(0, count)
      .join('')
      .toUpperCase();
  }

  // Mask string (e.g., credit card, email)
  mask(str, options = {}) {
    if (!str) return '';
    
    const {
      type = 'default',
      visibleStart = 4,
      visibleEnd = 4,
      maskChar = '*',
      preserveLength = true,
    } = options;
    
    if (type === 'email') {
      const [local, domain] = str.split('@');
      if (!domain) return str;
      const maskedLocal = local.charAt(0) + maskChar.repeat(Math.max(0, local.length - 2)) + local.charAt(local.length - 1);
      return `${maskedLocal}@${domain}`;
    }
    
    if (type === 'phone') {
      const cleaned = str.replace(/\D/g, '');
      if (cleaned.length < 10) return str;
      return maskChar.repeat(cleaned.length - 4) + cleaned.slice(-4);
    }
    
    if (preserveLength) {
      return str.slice(0, visibleStart) + 
             maskChar.repeat(str.length - visibleStart - visibleEnd) + 
             str.slice(-visibleEnd);
    }
    
    return maskChar.repeat(str.length);
  }

  // Slugify string
  slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Format phone number
  phoneNumber(str, format = 'international') {
    if (!str) return '';
    
    const cleaned = str.replace(/\D/g, '');
    
    if (format === 'international' && cleaned.length >= 11) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    
    if (format === 'national' && cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return cleaned;
  }

  // Format credit card
  creditCard(str) {
    if (!str) return '';
    const cleaned = str.replace(/\D/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }

  // Format as hashtag
  hashtag(str) {
    if (!str) return '';
    const cleaned = str.replace(/[^\w]/g, '');
    return `#${cleaned}`;
  }
}

// Array formatter class
export class ArrayFormatter {
  // Format as list
  list(arr, options = {}) {
    if (!arr || arr.length === 0) return '';
    
    const {
      type = 'conjunction',
      style = 'long',
      locale = 'en',
    } = options;
    
    return new Intl.ListFormat(locale, { type, style }).format(arr);
  }

  // Format as comma-separated
  csv(arr) {
    if (!arr) return '';
    return arr.join(', ');
  }

  // Format as key-value pairs
  keyValue(obj, separator = ': ') {
    if (!obj) return '';
    return Object.entries(obj)
      .map(([key, value]) => `${key}${separator}${value}`)
      .join(', ');
  }

  // Format as table
  table(arr, headers = null) {
    if (!arr || arr.length === 0) return '';
    
    const rows = arr.map(item => {
      if (typeof item === 'object') {
        return Object.values(item).join('\t');
      }
      return item;
    });
    
    if (headers) {
      rows.unshift(headers.join('\t'));
    }
    
    return rows.join('\n');
  }

  // Format as bullet points
  bullet(arr, bullet = '•') {
    if (!arr || arr.length === 0) return '';
    return arr.map(item => `${bullet} ${item}`).join('\n');
  }

  // Format as numbered list
  numbered(arr) {
    if (!arr || arr.length === 0) return '';
    return arr.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
}

// Object formatter class
export class ObjectFormatter {
  // Format as JSON
  json(obj, pretty = true) {
    if (!obj) return '';
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  }

  // Format as query string
  queryString(obj) {
    if (!obj) return '';
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  // Format as XML
  xml(obj, root = 'root') {
    if (!obj) return '';
    
    const toXml = (data, tag) => {
      if (typeof data !== 'object') {
        return `<${tag}>${data}</${tag}>`;
      }
      
      const items = Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(item => toXml(item, key)).join('');
        }
        return toXml(value, key);
      }).join('');
      
      return `<${tag}>${items}</${tag}>`;
    };
    
    return toXml(obj, root);
  }

  // Format as YAML
  yaml(obj, indent = 0) {
    if (!obj) return '';
    
    const spaces = ' '.repeat(indent * 2);
    const lines = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        lines.push(`${spaces}${key}:`);
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object') {
              lines.push(`${spaces}  -`);
              Object.entries(item).forEach(([k, v]) => {
                lines.push(`${spaces}    ${k}: ${v}`);
              });
            } else {
              lines.push(`${spaces}  - ${item}`);
            }
          });
        } else {
          lines.push(this.yaml(value, indent + 1));
        }
      } else {
        lines.push(`${spaces}${key}: ${value}`);
      }
    });
    
    return lines.join('\n');
  }

  // Format as CSV
  csv(arr, headers = null) {
    if (!arr || arr.length === 0) return '';
    
    const rows = arr.map(obj => {
      if (headers) {
        return headers.map(h => obj[h] || '').join(',');
      }
      return Object.values(obj).join(',');
    });
    
    if (headers) {
      rows.unshift(headers.join(','));
    }
    
    return rows.join('\n');
  }

  // Format as human readable
  humanize(obj, options = {}) {
    if (!obj) return '';
    
    const { indent = 0, prefix = '', separator = ': ' } = options;
    const spaces = ' '.repeat(indent * 2);
    
    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${spaces}${prefix}${key}:\n${this.humanize(value, { indent: indent + 1, prefix: '  ' })}`;
        }
        return `${spaces}${prefix}${key}${separator}${value}`;
      })
      .join('\n');
  }
}

// Main formatter class
export class Formatter {
  constructor(locale = 'en-US', options = {}) {
    this.number = new NumberFormatter(locale, options.number);
    this.date = new DateFormatter(locale, options.timezone);
    this.string = new StringFormatter();
    this.array = new ArrayFormatter();
    this.object = new ObjectFormatter();
  }

  // Format based on type
  format(value, type, options = {}) {
    switch (type) {
      case 'number':
        return this.number.format(value, options);
      case 'currency':
        return this.number.currency(value, options.currency, options);
      case 'percent':
        return this.number.percent(value, options.decimals);
      case 'compact':
        return this.number.compact(value, options.decimals, options.display);
      case 'date':
        return this.date.format(value, options);
      case 'time':
        return this.date.time(value, options.format);
      case 'relative':
        return this.date.relative(value, options.base);
      case 'phone':
        return this.string.phoneNumber(value, options.format);
      case 'creditCard':
        return this.string.creditCard(value);
      case 'email':
        return this.string.mask(value, { type: 'email' });
      case 'truncate':
        return this.string.truncate(value, options.length, options.suffix);
      case 'slug':
        return this.string.slugify(value);
      case 'csv':
        return this.array.csv(value);
      case 'json':
        return this.object.json(value, options.pretty);
      default:
        return String(value);
    }
  }
}

// Export singleton instance
export const formatter = new Formatter();

// Export individual formatters
export const numberFormatter = new NumberFormatter();
export const dateFormatter = new DateFormatter();
export const stringFormatter = new StringFormatter();
export const arrayFormatter = new ArrayFormatter();
export const objectFormatter = new ObjectFormatter();

// Export constants
export const FORMATTER_CONSTANTS = {
  NUMBER_FORMATS,
  CURRENCY_DISPLAY,
  COMPACT_DISPLAY,
  DATE_FORMATS,
  TIME_FORMATS,
};

export default formatter;
