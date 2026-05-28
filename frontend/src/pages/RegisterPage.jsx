import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api/fetch'
import './AuthPage.css'

function RegisterPage() {
    const [form, setForm] = useState({
        username: '', email: '', password: '', first_name: '', last_name: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await apiFetch('/auth/register/', {
                method: 'POST',
                body: JSON.stringify(form),
            })
            if (!response.ok) throw new Error()
            navigate('/login')
        } catch {
            setError('Registration failed. Username may already be taken.')
        } finally {
            setLoading(false)
        }
    }

    const fields = [
        { name: 'username', label: 'Username' },
        { name: 'email', label: 'Email' },
        { name: 'first_name', label: 'First name' },
        { name: 'last_name', label: 'Last name' },
        { name: 'password', label: 'Password', type: 'password' },
    ]

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create account</h2>
                <p className="auth-subtitle">Join Creative Studio</p>
                <form onSubmit={handleSubmit} className="auth-form">
                    {fields.map(({ name, label, type }) => (
                        <div className="field" key={name}>
                            <label>{label}</label>
                            <input
                                type={type || 'text'}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage