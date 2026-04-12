import axios from "axios";
import { getErrorMessage } from "../../../utils/errorMessages";
import { sanitizeMultilineText } from "../../../utils/inputSanitization";
import { validateJobDescription, validateSelfDescription, validateFile } from "../../../utils/inputValidation";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

const handleApiError = (error, context = 'interview') => {
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

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED') {
        userMessage = 'The request took too long to complete. Please try again or check your internet connection.';
    }

    // Create detailed error object
    const err = new Error(userMessage);
    err.statusCode = statusCode;
    err.errorCode = errorCode;
    err.originalError = error;
    err.rawMessage = backendMessage; // Keep original backend message for debugging
    
    console.error(`Interview API Error (${statusCode}):`, {
        code: errorCode,
        message: backendMessage,
        userMessage
    });
    
    throw err;
};

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    try {
        // Validate job description if provided
        if (jobDescription?.trim()) {
            const jobValidation = validateJobDescription(jobDescription);
            if (!jobValidation.isValid) {
                throw new Error(jobValidation.error);
            }
        }

        // Validate self description if provided
        if (selfDescription?.trim()) {
            const selfValidation = validateSelfDescription(selfDescription);
            if (!selfValidation.isValid) {
                throw new Error(selfValidation.error);
            }
        }

        // At least one of job description or self-description required
        if (!jobDescription?.trim() && !selfDescription?.trim()) {
            throw new Error("Please provide either a job description or a self-description");
        }

        // Must have either resume or self-description
        if (!resumeFile && !selfDescription?.trim()) {
            throw new Error("Please upload a resume file or provide a self-description");
        }

        // Validate and sanitize file if provided
        if (resumeFile) {
            const fileValidation = validateFile(resumeFile, {
                maxSize: 5 * 1024 * 1024,
                allowedTypes: ['application/pdf'],
                fieldName: 'Resume'
            });
            if (!fileValidation.isValid) {
                throw new Error(fileValidation.error);
            }
        }

        // Sanitize text inputs before sending to backend
        const sanitizedJobDescription = jobDescription ? sanitizeMultilineText(jobDescription, { maxLength: 5000 }) : '';
        const sanitizedSelfDescription = selfDescription ? sanitizeMultilineText(selfDescription, { maxLength: 2000 }) : '';

        const formData = new FormData()
        formData.append("jobDescription", sanitizedJobDescription)
        formData.append("selfDescription", sanitizedSelfDescription)
        
        if (resumeFile) {
            formData.append("resume", resumeFile)
        }

        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            timeout: 120000 // 2 minute timeout for AI processing
        })

        return response.data
    } catch (error) {
        handleApiError(error, 'interview');
    }
}


/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        if (!interviewId?.trim()) {
            throw new Error("Interview ID is required to retrieve your report");
        }

        const response = await api.get(`/api/interview/report/${interviewId}`, {
            timeout: 30000
        })

        return response.data
    } catch (error) {
        handleApiError(error, 'interview');
    }
}


/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/", {
            timeout: 30000
        })

        return response.data
    } catch (error) {
        handleApiError(error, 'interview');
    }
}


/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        if (!interviewReportId?.trim()) {
            throw new Error("Interview report ID is required to generate a PDF");
        }

        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob",
            timeout: 60000 // 1 minute for PDF generation
        })

        return response.data
    } catch (error) {
        handleApiError(error, 'interview');
    }
}
