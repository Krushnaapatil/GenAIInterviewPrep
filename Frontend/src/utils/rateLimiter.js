/**
 * Simple rate limiter for frontend API calls
 * Prevents rapid repeated requests from the same action
 */
class RateLimiter {
    constructor() {
        this.requests = {}; // key: identifier, value: { count, timestamp, resetTime }
        this.maxAttempts = 5; // max requests per window
        this.windowMs = 60 * 1000; // 1 minute window
        this.blockDurationMs = 15 * 60 * 1000; // 15 minutes block duration
    }

    /**
     * Check if action is rate limited
     * @param {string} key - Unique identifier for the action (e.g., 'login', 'generate-report')
     * @returns {object} { allowed: boolean, retryAfter?: number, message?: string }
     */
    isAllowed(key) {
        const now = Date.now();
        const request = this.requests[key];

        // First request
        if (!request) {
            this.requests[key] = {
                count: 1,
                timestamp: now,
                resetTime: now + this.windowMs,
                blockedUntil: null,
            };
            return { allowed: true };
        }

        // Check if user is currently blocked
        if (request.blockedUntil && now < request.blockedUntil) {
            const retryAfter = Math.ceil((request.blockedUntil - now) / 1000);
            return {
                allowed: false,
                retryAfter,
                message: `Too many attempts. Please try again in ${retryAfter} seconds.`,
            };
        }

        // Reset window if expired
        if (now > request.resetTime) {
            this.requests[key] = {
                count: 1,
                timestamp: now,
                resetTime: now + this.windowMs,
                blockedUntil: null,
            };
            return { allowed: true };
        }

        // Increment counter
        request.count++;

        // Check if exceeded max attempts
        if (request.count > this.maxAttempts) {
            request.blockedUntil = now + this.blockDurationMs;
            const retryAfter = Math.ceil(this.blockDurationMs / 1000);
            return {
                allowed: false,
                retryAfter,
                message: `Too many attempts. Please try again in ${retryAfter} minutes.`,
            };
        }

        return { allowed: true };
    }

    /**
     * Reset rate limit for a specific key
     */
    reset(key) {
        delete this.requests[key];
    }

    /**
     * Clear all rate limits
     */
    clearAll() {
        this.requests = {};
    }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();
