import axios from "axios"
import { getErrorMessage } from "../../../utils/errorMessages"
import { sanitizeUsername, sanitizeEmail } from "../../../utils/inputSanitization"
import { validateEmail, validateUsername, validatePassword } from "../../../utils/inputValidation"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

const handleApiError = (error, context = 'auth') => {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const errorCode = error.response?.data?.code;
    
    // Try to get a comprehensive error message
    let userMessage = backendMessage || error.message;
    
    // Map specific backend error codes to user-friendly messages
    if (errorCode) {
        userMessage = getErrorMessage(errorCode, statusCode, context) || userMessage;
    } else if (statusCode) {
        userMessage = getErrorMessage(userMessage, statusCode, context) || userMessage;
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        userMessage = getErrorMessage('NETWORK_ERROR', 0, context);
    }

    // Create detailed error object
    const err = new Error(userMessage);
    err.statusCode = statusCode;
    err.errorCode = errorCode;
    err.originalError = error;
    err.rawMessage = backendMessage; // Keep original backend message for debugging
    
    console.error(`Auth API Error (${statusCode}):`, {
        code: errorCode,
        message: backendMessage,
        userMessage
    });
    
    throw err;
};

export async function register({ username, email, password }) {
    try {
        // Validate inputs using validation utilities
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            throw new Error(usernameValidation.error);
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.error);
        }
        
        // Sanitize inputs before sending to backend
        const sanitizedUsername = sanitizeUsername(username);
        const sanitizedEmail = sanitizeEmail(email);
        // Don't sanitize password - keep as-is for security
        
        const response = await api.post("/api/auth/register", 
            { 
                username: sanitizedUsername, 
                email: sanitizedEmail, 
                password 
            },
        );

        return response.data;
    } catch (error) {
        handleApiError(error, 'auth');
    }
}

export async function login({email, password }) {
    try {
        // Validate inputs using validation utilities
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
        }

        if (!password?.trim()) {
            throw new Error("Please enter your password");
        }
        
        // Sanitize email before sending to backend
        const sanitizedEmail = sanitizeEmail(email);
        
        const response = await api.post("/api/auth/login", 
            { email: sanitizedEmail, password }
        );

        return response.data;
    } catch (error) {
        handleApiError(error, 'auth');
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout");
        return response.data;
    } catch (error) {
        handleApiError(error, 'auth');
    }  
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me");
        return response.data;
    } catch (error) {
        // Don't throw for getMe - it's okay if user is not authenticated
        console.warn("Failed to fetch user info:", error.message);
        return null;
    }
}