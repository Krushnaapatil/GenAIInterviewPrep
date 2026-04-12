/**
 * Comprehensive error message mapping
 * Converts error types, status codes, and context into user-friendly messages
 */

// HTTP Status Code Error Messages
const statusCodeMessages = {
    0: {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        action: 'Retry'
    },
    400: {
        title: 'Invalid Input',
        message: 'The information you provided is invalid. Please check your entries and try again.',
        action: 'Review & Retry'
    },
    401: {
        title: 'Authentication Failed',
        message: 'Your session has expired. Please log in again to continue.',
        action: 'Log In'
    },
    403: {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        action: 'Go Back'
    },
    404: {
        title: 'Not Found',
        message: 'The resource you\'re looking for doesn\'t exist.',
        action: 'Go Home'
    },
    409: {
        title: 'Conflict',
        message: 'This information already exists. Please try with different details.',
        action: 'Retry'
    },
    413: {
        title: 'File Too Large',
        message: 'The file you\'re trying to upload is too large. Maximum size is 5MB.',
        action: 'Choose Different File'
    },
    429: {
        title: 'Too Many Requests',
        message: 'You\'re making requests too quickly. Please wait a moment and try again.',
        action: 'Wait & Retry'
    },
    500: {
        title: 'Server Error',
        message: 'Something went wrong on our end. Our team has been notified. Please try again later.',
        action: 'Retry'
    },
    502: {
        title: 'Service Unavailable',
        message: 'The server is temporarily unavailable. Please try again in a few moments.',
        action: 'Retry'
    },
    503: {
        title: 'Service Maintenance',
        message: 'We\'re performing maintenance. Please check back shortly.',
        action: 'Retry Later'
    },
    504: {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'Retry'
    }
};

// Authentication Error Messages
const authErrorMessages = {
    'INVALID_CREDENTIALS': {
        message: 'Email or password is incorrect. Please try again.',
        severity: 'error'
    },
    'EMAIL_ALREADY_EXISTS': {
        message: 'This email is already registered. Please log in or use a different email.',
        severity: 'error'
    },
    'USERNAME_ALREADY_EXISTS': {
        message: 'This username is already taken. Please choose a different username.',
        severity: 'error'
    },
    'INVALID_EMAIL': {
        message: 'Please enter a valid email address.',
        severity: 'error'
    },
    'WEAK_PASSWORD': {
        message: 'Password must be at least 6 characters long.',
        severity: 'error'
    },
    'SESSION_EXPIRED': {
        message: 'Your session has expired. Please log in again.',
        severity: 'error'
    },
    'UNAUTHORIZED': {
        message: 'You must be logged in to access this feature.',
        severity: 'error'
    }
};

// Interview/Report Generation Error Messages
const interviewErrorMessages = {
    'INVALID_JOB_DESCRIPTION': {
        message: 'Please provide a valid job description (at least 10 characters).',
        severity: 'error'
    },
    'INVALID_RESUME': {
        message: 'The resume file is invalid or corrupted. Please upload a valid PDF file.',
        severity: 'error'
    },
    'INVALID_FILE_TYPE': {
        message: 'Only PDF files are supported. Please upload a PDF resume.',
        severity: 'error'
    },
    'FILE_TOO_LARGE': {
        message: 'The resume file is too large. Maximum size is 5MB.',
        severity: 'error'
    },
    'MISSING_CONTENT': {
        message: 'Please provide either a resume or a self-description to generate an interview plan.',
        severity: 'error'
    },
    'GENERATION_FAILED': {
        message: 'Failed to generate your interview plan. Please try again with different content.',
        severity: 'error'
    },
    'REPORT_NOT_FOUND': {
        message: 'The interview plan you\'re looking for doesn\'t exist or has been deleted.',
        severity: 'error'
    },
    'PDF_GENERATION_FAILED': {
        message: 'Failed to generate the PDF. Please try again.',
        severity: 'error'
    },
    'AI_SERVICE_UNAVAILABLE': {
        message: 'The AI service is temporarily unavailable. Please try again in a few moments.',
        severity: 'error'
    }
};

// Network Error Messages
const networkErrorMessages = {
    'NETWORK_ERROR': {
        message: 'Network connection error. Please check your internet connection and try again.',
        severity: 'error'
    },
    'TIMEOUT': {
        message: 'The request took too long. Please check your connection and try again.',
        severity: 'error'
    },
    'ABORT': {
        message: 'The operation was cancelled. Please try again.',
        severity: 'error'
    },
    'ERR_NETWORK': {
        message: 'Unable to connect to the server. Please check your internet connection.',
        severity: 'error'
    }
};

// Form Validation Error Messages
const validationMessages = {
    'REQUIRED_FIELD': 'This field is required.',
    'INVALID_EMAIL': 'Please enter a valid email address.',
    'PASSWORD_MIN_LENGTH': 'Password must be at least 6 characters long.',
    'PASSWORD_MISMATCH': 'Passwords do not match.',
    'USERNAME_MIN_LENGTH': 'Username must be at least 3 characters long.',
    'USERNAME_MAX_LENGTH': 'Username cannot exceed 30 characters.',
    'JOB_DESCRIPTION_MIN': 'Job description must be at least 10 characters.',
    'JOB_DESCRIPTION_MAX': 'Job description cannot exceed 5000 characters.',
    'SELF_DESCRIPTION_MIN': 'Self-description should be more descriptive.',
    'FILE_REQUIRED': 'Please upload a file or provide a description.',
    'PDF_ONLY': 'Only PDF files are allowed.',
    'FILE_SIZE': 'File size must not exceed 5MB.'
};

/**
 * Get user-friendly error message from error object or status code
 * @param {Error|string} error - Error object or error code
 * @param {number} statusCode - HTTP status code (optional)
 * @param {string} context - Error context (auth, interview, etc.)
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, statusCode = null, context = null) => {
    // If it's a string, treat as error code
    if (typeof error === 'string') {
        // Check context-specific errors first
        if (context === 'auth' && authErrorMessages[error]) {
            return authErrorMessages[error].message;
        }
        if (context === 'interview' && interviewErrorMessages[error]) {
            return interviewErrorMessages[error].message;
        }
        if (networkErrorMessages[error]) {
            return networkErrorMessages[error].message;
        }
        return error; // Return as-is if no mapping found
    }

    // Handle network errors
    if (error instanceof TypeError) {
        if (error.message.includes('fetch')) {
            return networkErrorMessages.NETWORK_ERROR.message;
        }
    }

    if (error.code === 'ECONNABORTED') {
        return networkErrorMessages.TIMEOUT.message;
    }

    if (error.message === 'Network Error') {
        return networkErrorMessages.NETWORK_ERROR.message;
    }

    // Try to extract message from error object
    let message = error.response?.data?.message || 
                  error.message || 
                  'An unexpected error occurred. Please try again.';

    // If we have the actual error message from backend, check for known patterns
    if (typeof message === 'string') {
        const lowerMessage = message.toLowerCase();
        
        // Authentication errors
        if (lowerMessage.includes('invalid') && lowerMessage.includes('password')) {
            return authErrorMessages.INVALID_CREDENTIALS.message;
        }
        if (lowerMessage.includes('email') && lowerMessage.includes('already')) {
            return authErrorMessages.EMAIL_ALREADY_EXISTS.message;
        }
        if (lowerMessage.includes('username') && lowerMessage.includes('already')) {
            return authErrorMessages.USERNAME_ALREADY_EXISTS.message;
        }
        if (lowerMessage.includes('unauthorized') || lowerMessage.includes('not authenticated')) {
            return authErrorMessages.UNAUTHORIZED.message;
        }
        if (lowerMessage.includes('session') || lowerMessage.includes('expired')) {
            return authErrorMessages.SESSION_EXPIRED.message;
        }

        // Interview errors
        if (lowerMessage.includes('job description')) {
            return interviewErrorMessages.INVALID_JOB_DESCRIPTION.message;
        }
        if (lowerMessage.includes('resume') && lowerMessage.includes('invalid')) {
            return interviewErrorMessages.INVALID_RESUME.message;
        }
        if (lowerMessage.includes('file type') || lowerMessage.includes('pdf')) {
            return interviewErrorMessages.INVALID_FILE_TYPE.message;
        }
        if (lowerMessage.includes('file size') || lowerMessage.includes('too large')) {
            return interviewErrorMessages.FILE_TOO_LARGE.message;
        }
        if (lowerMessage.includes('generation') || lowerMessage.includes('failed')) {
            return interviewErrorMessages.GENERATION_FAILED.message;
        }
        if (lowerMessage.includes('not found')) {
            return interviewErrorMessages.REPORT_NOT_FOUND.message;
        }
    }

    // Use status code fallback
    if (statusCode && statusCodeMessages[statusCode]) {
        return statusCodeMessages[statusCode].message;
    }

    // Return original message or generic fallback
    return message;
};

/**
 * Get error details including title and action
 * @param {Error|string} error - Error object or error code
 * @param {number} statusCode - HTTP status code
 * @param {string} context - Error context
 * @returns {Object} Error details { title, message, action }
 */
export const getErrorDetails = (error, statusCode = null, context = null) => {
    if (statusCode && statusCodeMessages[statusCode]) {
        return statusCodeMessages[statusCode];
    }

    if (typeof error === 'string') {
        const message = getErrorMessage(error, statusCode, context);
        return {
            title: 'Error',
            message,
            action: 'Retry'
        };
    }

    return {
        title: 'Error',
        message: getErrorMessage(error, statusCode, context),
        action: 'Retry'
    };
};

/**
 * Get validation error message
 * @param {string} code - Validation error code
 * @returns {string} Validation error message
 */
export const getValidationMessage = (code) => {
    return validationMessages[code] || 'Invalid input. Please check and try again.';
};

/**
 * Format error message with context
 * @param {string} message - Base message
 * @param {Object} context - Context variables for interpolation
 * @returns {string} Formatted message
 */
export const formatErrorMessage = (message, context = {}) => {
    let formatted = message;
    Object.entries(context).forEach(([key, value]) => {
        formatted = formatted.replace(`{${key}}`, value);
    });
    return formatted;
};

export default {
    getErrorMessage,
    getErrorDetails,
    getValidationMessage,
    formatErrorMessage,
    statusCodeMessages,
    authErrorMessages,
    interviewErrorMessages,
    networkErrorMessages,
    validationMessages
};
