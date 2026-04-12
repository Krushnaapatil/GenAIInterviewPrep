import React from 'react';
import './ErrorBoundary.scss';

/**
 * Suggests helpful actions based on error message
 */
const getErrorSuggestions = (error) => {
    const message = error?.toString().toLowerCase() || '';

    if (message.includes('network') || message.includes('connect')) {
        return [
            'Check your internet connection',
            'Try disabling your VPN or proxy',
            'Ensure the server is running'
        ];
    }

    if (message.includes('memory') || message.includes('out of memory')) {
        return [
            'Close other applications to free up memory',
            'Refresh the page to clear cached data',
            'Try uploading a smaller file'
        ];
    }

    if (message.includes('timeout')) {
        return [
            'Check your internet connection speed',
            'Wait a moment and try again',
            'Contact support if the issue persists'
        ];
    }

    if (message.includes('undefined') || message.includes('null')) {
        return [
            'Refresh the page to reload the application state',
            'Clear your browser cache and cookies',
            'Contact support if the problem continues'
        ];
    }

    return [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if the issue persists'
    ];
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
            isRecovering: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));
        console.error('Error caught by boundary:', error, errorInfo);
        
        // Auto-recovery attempt on second occurrence
        if (this.state.errorCount > 0) {
            this.scheduleRecovery();
        }
    }

    scheduleRecovery = () => {
        this.setState({ isRecovering: true });
        setTimeout(() => {
            this.resetError();
        }, 3000);
    }

    resetError = () => {
        this.setState({ 
            hasError: false, 
            error: null, 
            errorInfo: null,
            isRecovering: false
        });
    }

    getDerivedErrorTitle = () => {
        const message = this.state.error?.toString().toLowerCase() || '';
        
        if (message.includes('network')) {
            return 'Network Connection Error';
        }
        if (message.includes('memory')) {
            return 'Memory Error';
        }
        if (message.includes('timeout')) {
            return 'Request Timeout';
        }
        if (message.includes('reference')) {
            return 'Reference Error';
        }
        if (message.includes('syntax')) {
            return 'Syntax Error';
        }
        if (message.includes('type')) {
            return 'Type Error';
        }
        
        return 'Unexpected Error';
    }

    render() {
        if (this.state.hasError) {
            const suggestions = getErrorSuggestions(this.state.error);
            const errorTitle = this.getDerivedErrorTitle();
            const isRecovering = this.state.isRecovering;

            return (
                <div className='error-boundary'>
                    <div className='error-container'>
                        {isRecovering ? (
                            <>
                                <div className='error-icon error-icon--recovering'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                                </div>
                                <h1>Recovering...</h1>
                                <p className='error-message'>
                                    Attempting to restore your session. Please wait.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className='error-icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <h1>{errorTitle}</h1>
                                <p className='error-title'>{errorTitle}</p>
                                <p className='error-message'>
                                    {this.state.error?.toString()}
                                </p>

                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className='error-suggestions'>
                                        <h3>What you can try:</h3>
                                        <ul>
                                            {suggestions.map((suggestion, index) => (
                                                <li key={index}>
                                                    <span className='checkmark'>✓</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Development Error Details */}
                                {process.env.NODE_ENV === 'development' && (
                                    <details className='error-details'>
                                        <summary>Error Details (Development Only)</summary>
                                        <pre className='error-stack'>
                                            {this.state.errorInfo?.componentStack}
                                        </pre>
                                        <pre className='error-stack'>
                                            {this.state.error?.stack}
                                        </pre>
                                    </details>
                                )}
                                
                                <div className='error-actions'>
                                    <button onClick={this.resetError} className='btn btn--primary'>
                                        Try Again
                                    </button>
                                    <button onClick={() => window.location.href = '/'} className='btn btn--secondary'>
                                        Go Home
                                    </button>
                                </div>

                                {/* Error count indicator */}
                                {this.state.errorCount > 1 && (
                                    <p className='error-count'>
                                        Error occurred {this.state.errorCount} times. 
                                        <a href="#" onClick={() => { window.location.reload(); }}>
                                            Click here to refresh the page.
                                        </a>
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
