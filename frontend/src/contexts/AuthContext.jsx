import { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch, setTokens, clearTokens, getAccessToken } from '../api/fetch'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const restoreSession = async () => {
            const token = getAccessToken()
            if (token) {
                try {
                    const response = await apiFetch('/auth/me/')
                    if (response.ok) {
                        const userData = await response.json()
                        setUser(userData)
                    } else {
                        clearTokens()
                    }
                } catch {
                    clearTokens()
                }
            }
            setLoading(false)
        }
        restoreSession()
    }, [])

    const login = async (username, password) => {
        const response = await apiFetch('/auth/token/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })
        if (!response.ok) throw new Error('Invalid credentials')

        const data = await response.json()
        setTokens(data.access, data.refresh)

        const meResponse = await apiFetch('/auth/me/')
        const userData = await meResponse.json()
        setUser(userData)
    }

    const logout = () => {
        clearTokens()
        setUser(null)
    }

    if (loading) return null

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}