import React, {useState} from 'react'
import "../auth.form.scss"
import {useNavigate, Link} from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../../../context/ToastContext'
import Spinner from '../../../components/Spinner'
import { rateLimiter } from '../../../utils/rateLimiter'
import { validateUsername, validateEmail, validatePassword } from '../../../utils/inputValidation'
import { sanitizeUsername, sanitizeEmail } from '../../../utils/inputSanitization'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [errors, setErrors] = useState({})

    const { loading, handleRegister } = useAuth()
    const { warning: warningToast } = useToast()

    const validateForm = () => {
        const newErrors = {};

        // Username validation using utility
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            newErrors.username = usernameValidation.error;
        }

        // Email validation using utility
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.error;
        }

        // Password validation using utility
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.error;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({});
        
        // Check rate limit
        const rateCheck = rateLimiter.isAllowed('register');
        if (!rateCheck.allowed) {
            warningToast(rateCheck.message)
            return
        }

        // Validate form
        if (!validateForm()) {
            return
        }

        // Sanitize inputs before passing to register
        const sanitizedUsername = sanitizeUsername(username);
        const sanitizedEmail = sanitizeEmail(email);
        
        const success = await handleRegister({ 
            username: sanitizedUsername, 
            email: sanitizedEmail, 
            password 
        })
        if (success) {
            rateLimiter.reset('register')
            navigate('/')
        }
    }

    if(loading){
        return (
            <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0d1117' }}>
                <Spinner size='large' text='Registering...' />
            </main>
        )
    }

    return (
        <main>
            <div className='form-container'>
                <h1>Create Your Account</h1>
                <p className="form-subtitle">Join us to access personalized interview strategies</p>

                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <label htmlFor='username'>Username</label>
                        <input  
                            type='text' 
                            id='username' 
                            name='username' 
                            placeholder='Choose a unique username' 
                            value={username} 
                            onChange={(e) => {
                                setUsername(e.target.value)
                                if (errors.username) setErrors({...errors, username: ''})
                            }}
                            className={errors.username ? 'error' : ''}
                        />
                        {errors.username && (
                            <span className="error-message">{errors.username}</span>
                        )}
                    </div>

                    <div className='input-group'>
                        <label htmlFor='email'>Email Address</label>
                        <input 
                            type='email' 
                            id='email' 
                            name='email' 
                            placeholder='your.email@example.com' 
                            value={email} 
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (errors.email) setErrors({...errors, email: ''})
                            }}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>

                    <div className='input-group'>
                        <label htmlFor='password'>Password</label>
                        <input 
                            type='password' 
                            id='password' 
                            name='password' 
                            placeholder='At least 6 characters' 
                            value={password} 
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password) setErrors({...errors, password: ''})
                            }}
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
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                </form>

                <p>Already have an account? <Link to='/login'>Login here</Link></p>
            </div>
        </main>
    )
}

export default Register