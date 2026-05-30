import { useState, useEffect } from 'react'
import { apiFetch } from '../api/fetch'
import './NotificationsPanel.css'

function NotificationsPanel() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchNotifs = async () => {
            const response = await apiFetch('/notifications/')
            if (response.ok) setNotifications(await response.json())
        }
        fetchNotifs()
    }, [])

    const markRead = async (id) => {
        await apiFetch(`/notifications/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ is_read: true }),
        })
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ))
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="notif-wrapper">
            <button className="notif-bell" onClick={() => setOpen(!open)}>
                Notifications
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {open && (
                <div className="notif-dropdown">
                    {notifications.length === 0
                        ? <p className="notif-empty">No notifications.</p>
                        : notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notif-item ${n.is_read ? 'read' : 'unread'}`}
                                onClick={() => !n.is_read && markRead(n.id)}
                            >
                                <p className="notif-message">{n.message}</p>
                                <p className="notif-time">
                                    {new Date(n.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}

export default NotificationsPanel