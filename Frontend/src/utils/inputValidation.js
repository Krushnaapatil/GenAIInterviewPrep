/**
 * Input Validation Utilities
 * Provides comprehensive validation functions for form inputs
 */

// Regex patterns for common validations
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    username: /^[a-zA-Z0-9_-]{3,30}$/,
    password: /^.{6,}$/, // At least 6 characters
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    phoneNumber: /^[\d\s\-\+\(\)]{10,}$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    noSpecialChars: /^[a-zA-Z0-9\s\-_.,'!?()]+$/,
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { isValid, error }
 */
export const validateEmail = (email) => {
    if (!email || !email.trim()) {
        return { isValid: false, error: 'Email is required' };
    }
    if (email.length > 254) {
        return { isValid: false, error: 'Email is too long (max 254 characters)' };
    }
    if (!patterns.email.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} { isValid, error }
 */
export const validateUsername = (username) => {
    if (!username || !username.trim()) {
        return { isValid: false, error: 'Username is required' };
    }
    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 30) {
        return { isValid: false, error: 'Username cannot exceed 30 characters' };
    }
    if (!patterns.username.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
    }
    return { isValid: true };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default 6)
 * @returns {object} { isValid, error, strength }
 */
export const validatePassword = (password, minLength = 6) => {
    if (!password) {
        return { isValid: false, error: 'Password is required', strength: 0 };
    }
    
    if (password.length < minLength) {
        return { isValid: false, error: `Password must be at least ${minLength} characters`, strength: 0 };
    }

    let strength = 0;
    const feedback = [];

    // Check password strength
    if (/[a-z]/.test(password)) strength++; // Has lowercase
    if (/[A-Z]/.test(password)) strength++; // Has uppercase
    if (/\d/.test(password)) strength++; // Has numbers
    if (/[!@#$%^&*]/.test(password)) strength++; // Has special chars

    if (strength < 2) {
        feedback.push('Consider using a mix of uppercase, lowercase, numbers, and symbols');
    }

    return { 
        isValid: true, 
        strength: strength,
        feedback: feedback.length > 0 ? feedback : null
    };
};

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error messages
 * @returns {object} { isValid, error }
 */
export const validateTextLength = (text, minLength, maxLength, fieldName = 'Text') => {
    if (!text || !text.trim()) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    const trimmedText = text.trim();
    
    if (trimmedText.length < minLength) {
        return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }

    if (trimmedText.length > maxLength) {
        return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
    }

    return { isValid: true };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {object} { isValid, error }
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} { isValid, error }
 */
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['application/pdf'],
        minSize = 0,
        fieldName = 'File'
    } = options;

    if (!file) {
        return { isValid: false, error: `${fieldName} is required` };
    }

    if (file.size < minSize) {
        return { 
            isValid: false, 
            error: `${fieldName} is too small (minimum ${(minSize / 1024).toFixed(0)}KB)` 
        };
    }

    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return { 
            isValid: false, 
            error: `${fieldName} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxSizeMB}MB` 
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return { 
            isValid: false, 
            error: `${fieldName} has invalid type. Allowed types: ${allowedTypes.join(', ')}` 
        };
    }

    return { isValid: true };
};

/**
 * Validate job description
 * @param {string} jobDescription - Job description to validate
 * @returns {object} { isValid, error }
 */
export const validateJobDescription = (jobDescription) => {
    const minLength = 10;
    const maxLength = 5000;

    if (!jobDescription || !jobDescription.trim()) {
        return { isValid: false, error: 'Job description is required' };
    }

    const trimmed = jobDescription.trim();

    if (trimmed.length < minLength) {
        return { 
            isValid: false, 
            error: `Job description must be at least ${minLength} characters (currently ${trimmed.length})` 
        };
    }

    if (trimmed.length > maxLength) {
        return { 
            isValid: false, 
            error: `Job description cannot exceed ${maxLength} characters (currently ${trimmed.length})` 
        };
    }

    return { isValid: true };
};

/**
 * Validate self description
 * @param {string} selfDescription - Self description to validate
 * @returns {object} { isValid, error }
 */
export const validateSelfDescription = (selfDescription) => {
    const minLength = 10;
    const maxLength = 2000;

    if (!selfDescription || !selfDescription.trim()) {
        return { isValid: false, error: 'Self-description is required' };
    }

    const trimmed = selfDescription.trim();

    if (trimmed.length < minLength) {
        return { 
            isValid: false, 
            error: `Self-description must be at least ${minLength} characters (currently ${trimmed.length})` 
        };
    }

    if (trimmed.length > maxLength) {
        return { 
            isValid: false, 
            error: `Self-description cannot exceed ${maxLength} characters (currently ${trimmed.length})` 
        };
    }

    return { isValid: true };
};

/**
 * Validate interview report generation inputs
 * @param {object} inputs - { jobDescription, selfDescription, resumeFile }
 * @returns {object} { isValid, errors }
 */
export const validateInterviewInputs = (inputs) => {
    const errors = {};

    const { jobDescription, selfDescription, resumeFile } = inputs;

    // At least one of job description or self-description is needed
    if ((!jobDescription || !jobDescription.trim()) && (!selfDescription || !selfDescription.trim())) {
        errors.content = 'Please provide either a job description or a self-description';
    }

    // Validate job description if provided
    if (jobDescription && jobDescription.trim()) {
        const jobValidation = validateJobDescription(jobDescription);
        if (!jobValidation.isValid) {
            errors.jobDescription = jobValidation.error;
        }
    }

    // Validate self description if provided
    if (selfDescription && selfDescription.trim()) {
        const selfValidation = validateSelfDescription(selfDescription);
        if (!selfValidation.isValid) {
            errors.selfDescription = selfValidation.error;
        }
    }

    // Validate resume file if provided
    if (resumeFile) {
        const fileValidation = validateFile(resumeFile, {
            maxSize: 5 * 1024 * 1024,
            allowedTypes: ['application/pdf'],
            fieldName: 'Resume'
        });
        if (!fileValidation.isValid) {
            errors.resumeFile = fileValidation.error;
        }
    }

    // Must have either resume or self-description
    if (!resumeFile && (!selfDescription || !selfDescription.trim())) {
        errors.source = 'Please upload a resume or provide a self-description';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate form object against schema
 * @param {object} formData - Form data to validate
 * @param {object} schema - Validation schema
 * @returns {object} { isValid, errors }
 */
export const validateForm = (formData, schema) => {
    const errors = {};

    Object.entries(schema).forEach(([field, validator]) => {
        const value = formData[field];
        const result = validator(value);

        if (!result.isValid) {
            errors[field] = result.error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Check if string contains potentially dangerous characters
 * @param {string} input - Input string to check
 * @returns {boolean} True if dangerous characters found
 */
export const containsDangerousChars = (input) => {
    if (!input || typeof input !== 'string') return false;
    
    const dangerousPatterns = [
        /<script/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers like onclick=
        /<iframe/gi,
        /<img/gi,
        /<svg/gi
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
};

export default {
    validateEmail,
    validateUsername,
    validatePassword,
    validateTextLength,
    validateRequired,
    validateFile,
    validateJobDescription,
    validateSelfDescription,
    validateInterviewInputs,
    validateForm,
    containsDangerousChars,
    patterns
};
