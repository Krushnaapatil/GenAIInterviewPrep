import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../../../context/ToastContext'
import Spinner from '../../../components/Spinner'
import { rateLimiter } from '../../../utils/rateLimiter'
import { validateEmail } from '../../../utils/inputValidation'
import { sanitizeEmail } from '../../../utils/inputSanitization'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const { warning: warningToast } = useToast()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ errors, setErrors ] = useState({})

    const validateForm = () => {
        const newErrors = {};

        // Email validation using utility
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        // Password validation
        if (!password?.trim()) {
            newErrors.password = "Please enter your password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({});
        
        // Check rate limit first
        const rateCheck = rateLimiter.isAllowed('login');
        if (!rateCheck.allowed) {
            warningToast(rateCheck.message)
            return
        }

        // Validate form
        if (!validateForm()) {
            return
        }

        // Sanitize email before passing to login
        const sanitizedEmail = sanitizeEmail(email);
        const success = await handleLogin({email: sanitizedEmail, password})
        if (success) {
            rateLimiter.reset('login')
            navigate('/')
        }
    }

    if(loading){
        return (
            <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0d1117' }}>
                <Spinner size='large' text='Logging in...' />
            </main>
        )
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login to Your Account</h1>
                <p className="form-subtitle">Enter your credentials to access your interview plans</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={(e) => { 
                                setEmail(e.target.value)
                                if (errors.email) setErrors({...errors, email: ''})
                            }}
                            type="email" 
                            id="email" 
                            name='email' 
                            placeholder='your.email@example.com'
                            value={email}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { 
                                setPassword(e.target.value)
                                if (errors.password) setErrors({...errors, password: ''})
                            }}
                            type="password" 
                            id="password" 
                            name='password' 
                            placeholder='Enter your password'
                            value={password}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>
                    <button 
                        className='button primary-button'
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p>Don't have an account? <Link to={"/register"} >Register here</Link></p>
            </div>
        </main>
    )
}

export default Login