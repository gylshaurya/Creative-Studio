import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../api/fetch'
import './DashboardPage.css'

function DashboardPage() {
    const { user, logout } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            const response = await apiFetch('/dashboard/')
            if (response.ok) {
                const json = await response.json()
                setData(json)
            }
            setLoading(false)
        }
        fetchDashboard()
    }, [])

    if (loading) return <div className="dashboard-loading">Loading...</div>

    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header">
                <span className="dashboard-brand">Creative Studio</span>
                <nav className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                    <a href="/dashboard" style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'none' }}>
                        Dashboard
                    </a>
                    <a href="/projects" style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'none' }}>
                        Projects
                    </a>
                </nav>
                <div className="dashboard-user">
                    <span>{user?.username}</span>
                    <button onClick={logout} className="btn-logout">Log out</button>
                </div>
            </header>

            <main className="dashboard-main">

                {/* Overdue tasks */}
                <section className="dashboard-section">
                    <h3 className="section-title">
                        Overdue
                        <span className="badge">{data.overdue_tasks.length}</span>
                    </h3>
                    {data.overdue_tasks.length === 0
                        ? <p className="empty">No overdue tasks.</p>
                        : data.overdue_tasks.map(task => (
                            <div key={task.id} className="task-card overdue">
                                <span className="task-title">{task.title}</span>
                                <span className="task-meta">{task.project__name}</span>
                                <span className={`tag priority-${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                                <span className="task-deadline">{task.deadline}</span>
                            </div>
                        ))
                    }
                </section>

                {/* My tasks */}
                <section className="dashboard-section">
                    <h3 className="section-title">
                        My Tasks
                        <span className="badge">{data.my_tasks.length}</span>
                    </h3>
                    {data.my_tasks.length === 0
                        ? <p className="empty">No tasks assigned to you.</p>
                        : data.my_tasks.map(task => (
                            <div key={task.id} className="task-card">
                                <span className="task-title">{task.title}</span>
                                <span className="task-meta">{task.project__name}</span>
                                <span className={`tag stage-${task.stage.toLowerCase()}`}>
                                    {task.stage}
                                </span>
                            </div>
                        ))
                    }
                </section>

                {/* Projects */}
                <section className="dashboard-section">
                    <h3 className="section-title">Projects</h3>
                    {data.projects.length === 0
                        ? <p className="empty">No projects yet.</p>
                        : data.projects.map(project => (
                            <div key={project.id} className="project-card">
                                <div className="project-info">
                                    <span className="task-title">{project.name}</span>
                                    <span className="task-meta">{project.type}</span>
                                </div>
                                <div className="progress-row">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-label">
                                        {project.completed_tasks}/{project.total_tasks}
                                    </span>
                                </div>
                            </div>
                        ))
                    }
                </section>

            </main>
        </div>
    )
}

export default DashboardPage