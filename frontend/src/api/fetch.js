const BASE_URL = 'http://127.0.0.1:8000/api'

const tokenStore = {
    access: null,
    refresh: null,
}

export const setTokens = (access, refresh) => {
    tokenStore.access = access
    tokenStore.refresh = refresh
}

export const clearTokens = () => {
    tokenStore.access = null
    tokenStore.refresh = null
}

export async function apiFetch(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (tokenStore.access) {
        headers['Authorization'] = `Bearer ${tokenStore.access}`
    }

    let response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    })

    if (response.status === 401 && tokenStore.refresh) {
        const refreshResponse = await fetch(`${BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: tokenStore.refresh }),
        })

        if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            tokenStore.access = data.access

            headers['Authorization'] = `Bearer ${tokenStore.access}`
            response = await fetch(`${BASE_URL}${path}`, {
                ...options,
                headers,
            })
        } else {
            clearTokens()
            window.location.href = '/login'
            return
        }
    }

    return response
}