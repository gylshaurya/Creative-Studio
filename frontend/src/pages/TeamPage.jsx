import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api/fetch'
import { useAuth } from '../contexts/AuthContext'
import './TeamPage.css'

const ROLES = ['ADMIN', 'LEAD', 'DESIGNER', 'WRITER', 'REVIEWER', 'CLIENT']

function TeamPage() {
    const { studioId } = useParams()
    const { user } = useAuth()
    const [members, setMembers] = useState([])
    const [inviteId, setInviteId] = useState('')
    const [inviteRole, setInviteRole] = useState('DESIGNER')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMembers = async () => {
            const response = await apiFetch(`/studios/${studioId}/members/`)
            if (response.ok) setMembers(await response.json())
            setLoading(false)
        }
        fetchMembers()
    }, [studioId])

    const handleInvite = async (e) => {
        e.preventDefault()
        const response = await apiFetch(`/studios/${studioId}/members/`, {
            method: 'POST',
            body: JSON.stringify({ user_id: parseInt(inviteId), role: inviteRole }),
        })
        if (response.ok) {
            const newMember = await response.json()
            setMembers([...members, newMember])
            setInviteId('')
        } else {
            alert('Could not invite user. Check the user ID.')
        }
    }

    const handleRoleChange = async (memberId, newRole) => {
        const response = await apiFetch(`/studios/${studioId}/members/${memberId}/`, {
            method: 'PATCH',
            body: JSON.stringify({ role: newRole }),
        })
        if (response.ok) {
            setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
        }
    }

    const handleRemove = async (memberId) => {
        if (!confirm('Remove this member?')) return
        const response = await apiFetch(`/studios/${studioId}/members/${memberId}/`, {
            method: 'DELETE',
        })
        if (response.ok || response.status === 204) {
            setMembers(members.filter(m => m.id !== memberId))
        }
    }

    if (loading) return <div className="page-loading">Loading...</div>

    return (
        <div className="page-wrapper">
            <header className="page-header">
                <span className="brand">Creative Studio</span>
                <nav className="nav-links">
                    <a href="/dashboard">Dashboard</a>
                    <a href="/projects">Projects</a>
                </nav>
            </header>

            <main className="page-main">
                <div className="section-header">
                    <h2 className="page-title">Team</h2>
                </div>

                {/* Invite form */}
                <form onSubmit={handleInvite} className="inline-form">
                    <input
                        placeholder="User ID"
                        value={inviteId}
                        onChange={e => setInviteId(e.target.value)}
                        required
                        style={{ maxWidth: '120px' }}
                    />
                    <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value)}
                    >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" className="btn-primary">Invite</button>
                </form>

                <div className="members-list">
                    {members.map(member => (
                        <div key={member.id} className="member-row">
                            <div className="member-info">
                                <p className="member-name">{member.user.username}</p>
                                <p className="member-email">{member.user.email}</p>
                            </div>
                            <select
                                className="stage-select"
                                value={member.role}
                                onChange={e => handleRoleChange(member.id, e.target.value)}
                            >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button
                                className="btn-remove"
                                onClick={() => handleRemove(member.id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default TeamPage