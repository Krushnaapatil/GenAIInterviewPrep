/**
 * Input Sanitization Utilities
 * Provides functions to prevent XSS and other injection attacks
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML
 */
export const escapeHTML = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;"
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Remove HTML tags from text
 * @param {string} html - HTML string to process
 * @returns {string} Plain text without HTML tags
 */
export const stripHTMLTags = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '');
};

/**
 * Trim whitespace and normalize spaces
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/(\r\n|\n|\r)/g, '\n'); // Normalize line breaks
};

/**
 * Remove potentially dangerous characters but keep safe ones
 * @param {string} text - Text to sanitize
 * @param {boolean} allowNewlines - Allow newline characters
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text, allowNewlines = true) => {
    if (!text || typeof text !== 'string') return '';

    let sanitized = text;

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    // Remove potentially dangerous HTML tags
    const dangerousTags = ['iframe', 'img', 'svg', 'embed', 'object', 'form'];
    dangerousTags.forEach(tag => {
        const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>|<${tag}[^>]*\/>`, 'gi');
        sanitized = sanitized.replace(regex, '');
    });

    // Normalize whitespace
    sanitized = normalizeText(sanitized);

    // Trim to reasonable length
    const maxLength = 100000;
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
};

/**
 * Sanitize username - remove special characters
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
    if (!username || typeof username !== 'string') return '';

    // Allow only alphanumeric, hyphens, underscores
    return username.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30);
};

/**
 * Sanitize email - basic normalization
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email (lowercase)
 */
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';

    return email.toLowerCase().trim().substring(0, 254);
};

/**
 * Sanitize URL to prevent javascript: attacks
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if dangerous
 */
export const sanitizeURL = (url) => {
    if (!url || typeof url !== 'string') return '';

    const trimmedUrl = url.trim();

    // Block javascript: and data: protocols
    if (/^(javascript:|data:|vbscript:)/i.test(trimmedUrl)) {
        return '';
    }

    // Ensure http:// or https://
    if (!/^https?:\/\//.test(trimmedUrl)) {
        return 'https://' + trimmedUrl;
    }

    return trimmedUrl;
};

/**
 * Sanitize JSON data to prevent injection
 * @param {object} data - Object to sanitize
 * @returns {object} Sanitized object with escaped string values
 */
export const sanitizeObject = (data) => {
    if (!data || typeof data !== 'object') return data;

    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
        // Sanitize key
        const sanitizedKey = sanitizeText(key);

        // Sanitize value based on type
        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeText(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[sanitizedKey] = sanitizeObject(value);
        } else {
            sanitized[sanitizedKey] = value;
        }
    }

    return sanitized;
};

/**
 * Remove null bytes and control characters
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
export const removeControlCharacters = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Remove null bytes and control characters
    return text.replace(/[\0-\x1F\x7F]/g, '').trim();
};

/**
 * Limit string to maximum length with proper handling
 * @param {string} text - Text to limit
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated (default '...')
 * @returns {string} Limited text
 */
export const limitLength = (text, maxLength, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Validate and sanitize multiline text (like job descriptions)
 * @param {string} text - Text to validate and sanitize
 * @param {object} options - Options for sanitization
 * @returns {string} Sanitized text
 */
export const sanitizeMultilineText = (text, options = {}) => {
    const {
        maxLength = 5000,
        maxLines = 100,
        allowHTML = false
    } = options;

    if (!text || typeof text !== 'string') return '';

    let sanitized = text;

    // Remove HTML tags unless allowed
    if (!allowHTML) {
        sanitized = stripHTMLTags(sanitized);
    } else {
        sanitized = sanitizeText(sanitized);
    }

    // Limit lines
    const lines = sanitized.split('\n');
    if (lines.length > maxLines) {
        sanitized = lines.slice(0, maxLines).join('\n');
    }

    // Limit total length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // Normalize whitespace
    sanitized = normalizeText(sanitized);

    return sanitized;
};

/**
 * Create a Content Security Policy compliant value
 * @param {string} text - Text to make CSP-compliant
 * @returns {string} CSP-compliant text
 */
export const makeCSPCompliant = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Remove inline event handlers and javascript: URLs
    let compliant = text.replace(/on\w+\s*=/gi, '');
    compliant = compliant.replace(/javascript:/gi, '');
    
    return escapeHTML(compliant);
};

/**
 * Sanitize file name to prevent directory traversal
 * @param {string} fileName - File name to sanitize
 * @returns {string} Safe file name
 */
export const sanitizeFileName = (fileName) => {
    if (!fileName || typeof fileName !== 'string') return 'file';

    // Remove path separators and dangerous characters
    return fileName
        .replace(/\.\./g, '') // Remove ..
        .replace(/[\/\\]/g, '') // Remove path separators
        .replace(/[<>:"|?*\x00-\x1F]/g, '') // Remove invalid chars
        .substring(0, 255); // Max filename length
};

/**
 * Batch sanitize form data
 * @param {object} formData - Form data to sanitize
 * @returns {object} Sanitized form data
 */
export const sanitizeFormData = (formData) => {
    const sanitized = {};

    for (const [key, value] of Object.entries(formData)) {
        if (value === null || value === undefined) {
            sanitized[key] = '';
            continue;
        }

        if (typeof value === 'string') {
            // Special handling for specific fields
            if (key.toLowerCase().includes('email')) {
                sanitized[key] = sanitizeEmail(value);
            } else if (key.toLowerCase().includes('username')) {
                sanitized[key] = sanitizeUsername(value);
            } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
                sanitized[key] = sanitizeURL(value);
            } else {
                sanitized[key] = sanitizeText(value);
            }
        } else if (typeof value === 'object' && value.type !== 'File') {
            // Don't sanitize File objects
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

export default {
    escapeHTML,
    stripHTMLTags,
    normalizeText,
    sanitizeText,
    sanitizeUsername,
    sanitizeEmail,
    sanitizeURL,
    sanitizeObject,
    removeControlCharacters,
    limitLength,
    sanitizeMultilineText,
    makeCSPCompliant,
    sanitizeFileName,
    sanitizeFormData
};
