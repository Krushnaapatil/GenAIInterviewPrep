import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { useToast } from "../../../context/ToastContext";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context
    const { error: errorToast, success: successToast } = useToast()


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            successToast("Login successful!")
            return true
        } catch (err) {
            setUser(null)
            errorToast(err.message || "Login failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            successToast("Registration successful!")
            return true
        } catch (err) {
            setUser(null)
            errorToast(err.message || "Registration failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
            successToast("Logged out successfully")
            return true
        } catch (err) {
            // Even if logout fails on server, clear user locally
            setUser(null)
            errorToast(err.message || "Logout failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                if (data) {
                    setUser(data.user)
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}