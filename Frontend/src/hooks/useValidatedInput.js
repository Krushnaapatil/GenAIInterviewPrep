/**
 * Custom React hook for input validation and sanitization
 */

import { useState, useCallback } from 'react';
import { sanitizeText, sanitizeEmail, sanitizeUsername, sanitizeMultilineText } from '../utils/inputSanitization';
import { validateEmail, validateUsername, validatePassword, validateRequired, validateTextLength } from '../utils/inputValidation';

/**
 * Hook for managing a single input field with validation and sanitization
 * @param {string} initialValue - Initial value
 * @param {function} validator - Validation function
 * @param {function} sanitizer - Sanitization function
 * @returns {object} { value, setValue, error, setError, isValid, validate, sanitize, reset }
 */
export const useValidatedInput = (
    initialValue = '',
    validator = validateRequired,
    sanitizer = sanitizeText
) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');

    const sanitize = useCallback((input) => {
        const sanitized = sanitizer(input);
        setValue(sanitized);
        return sanitized;
    }, [sanitizer]);

    const validate = useCallback((inputValue = value) => {
        const result = validator(inputValue);
        setError(result.error || '');
        return result.isValid;
    }, [value, validator]);

    const handleChange = useCallback((newValue) => {
        setValue(newValue);
        // Clear error on change
        if (error) setError('');
    }, [error]);

    const handleBlur = useCallback(() => {
        validate(value);
    }, [value, validate]);

    const reset = useCallback(() => {
        setValue(initialValue);
        setError('');
    }, [initialValue]);

    return {
        value,
        setValue: handleChange,
        error,
        setError,
        isValid: !error && value !== '',
        validate,
        sanitize,
        handleChange,
        handleBlur,
        reset
    };
};

/**
 * Hook for managing email input
 * @param {string} initialValue - Initial email
 * @returns {object} Input properties
 */
export const useEmailInput = (initialValue = '') => {
    return useValidatedInput(
        initialValue,
        validateEmail,
        sanitizeEmail
    );
};

/**
 * Hook for managing username input
 * @param {string} initialValue - Initial username
 * @returns {object} Input properties
 */
export const useUsernameInput = (initialValue = '') => {
    return useValidatedInput(
        initialValue,
        validateUsername,
        sanitizeUsername
    );
};

/**
 * Hook for managing password input with strength indicator
 * @param {string} initialValue - Initial password
 * @param {number} minLength - Minimum password length
 * @returns {object} Input properties with strength
 */
export const usePasswordInput = (initialValue = '', minLength = 6) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');
    const [strength, setStrength] = useState(0);

    const validate = useCallback((inputValue = value) => {
        const result = validatePassword(inputValue, minLength);
        setError(result.error || '');
        setStrength(result.strength || 0);
        return result.isValid;
    }, [value, minLength]);

    const handleChange = useCallback((newValue) => {
        setValue(newValue);
        // Calculate strength on change
        const result = validatePassword(newValue, minLength);
        setStrength(result.strength || 0);
        if (error) setError('');
    }, [error, minLength]);

    const handleBlur = useCallback(() => {
        validate(value);
    }, [value, validate]);

    const reset = useCallback(() => {
        setValue(initialValue);
        setError('');
        setStrength(0);
    }, [initialValue]);

    const getStrengthLabel = () => {
        switch (strength) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return 'Unknown';
        }
    };

    return {
        value,
        setValue: handleChange,
        error,
        setError,
        isValid: !error && value !== '',
        validate,
        handleChange,
        handleBlur,
        reset,
        strength,
        strengthLabel: getStrengthLabel()
    };
};

/**
 * Hook for managing multiline text input (like job descriptions)
 * @param {string} initialValue - Initial text
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} Input properties with character count
 */
export const useMultilineInput = (initialValue = '', minLength = 10, maxLength = 5000) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState('');
    const [charCount, setCharCount] = useState(initialValue.length);

    const validate = useCallback((inputValue = value) => {
        const result = validateTextLength(inputValue, minLength, maxLength, 'Text');
        setError(result.error || '');
        return result.isValid;
    }, [value, minLength, maxLength]);

    const handleChange = useCallback((newValue) => {
        // Sanitize and limit length
        const sanitized = sanitizeMultilineText(newValue, { maxLength });
        setValue(sanitized);
        setCharCount(sanitized.length);
        
        if (error) setError('');
    }, [error, maxLength]);

    const handleBlur = useCallback(() => {
        validate(value);
    }, [value, validate]);

    const reset = useCallback(() => {
        setValue(initialValue);
        setCharCount(initialValue.length);
        setError('');
    }, [initialValue]);

    const charCountDisplay = `${charCount} / ${maxLength}`;
    const isNearLimit = charCount > maxLength * 0.9;

    return {
        value,
        setValue: handleChange,
        error,
        setError,
        isValid: !error && value.trim() !== '',
        validate,
        handleChange,
        handleBlur,
        reset,
        charCount,
        charCountDisplay,
        isNearLimit
    };
};

/**
 * Hook for managing form with multiple fields
 * @param {object} initialValues - Initial form values
 * @param {object} validators - Validation schema (field: validator function)
 * @returns {object} Form state and methods
 */
export const useValidatedForm = (initialValues = {}, validators = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = useCallback((fieldName, value) => {
        if (!validators[fieldName]) return true;

        const result = validators[fieldName](value);
        setErrors(prev => ({
            ...prev,
            [fieldName]: result.error || ''
        }));
        return result.isValid;
    }, [validators]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error on change if previously touched
        if (touched[name]) {
            validateField(name, value);
        }
    }, [touched, validateField]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    }, [validateField]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        for (const [fieldName, validator] of Object.entries(validators)) {
            const result = validator(values[fieldName]);
            if (!result.isValid) {
                newErrors[fieldName] = result.error;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    }, [values, validators]);

    const getFieldProps = useCallback((fieldName) => {
        return {
            name: fieldName,
            value: values[fieldName] || '',
            onChange: handleChange,
            onBlur: handleBlur,
            error: errors[fieldName],
            touched: touched[fieldName]
        };
    }, [values, errors, touched, handleChange, handleBlur]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        setValues,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateForm,
        validateField,
        getFieldProps,
        reset,
        isValid: Object.keys(errors).length === 0
    };
};

export default {
    useValidatedInput,
    useEmailInput,
    useUsernameInput,
    usePasswordInput,
    useMultilineInput,
    useValidatedForm
};
