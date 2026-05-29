const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const setTokens = (access, refresh) => {
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
}

export const clearTokens = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
}

export const getAccessToken = () => localStorage.getItem('access')
export const getRefreshToken = () => localStorage.getItem('refresh')

export async function apiFetch(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    const access = getAccessToken()
    if (access) {
        headers['Authorization'] = `Bearer ${access}`
    }

    let response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    // Token expired — try refreshing
    if (response.status === 401) {
        const refresh = getRefreshToken()
        if (!refresh) {
            clearTokens()
            window.location.href = '/login'
            return
        }

        const refreshResponse = await fetch(`${BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
        })

        if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            localStorage.setItem('access', data.access)

            headers['Authorization'] = `Bearer ${data.access}`
            response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
        } else {
            clearTokens()
            window.location.href = '/login'
            return
        }
    }

    return response
}