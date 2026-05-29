import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api/fetch'
import './ProjectsPage.css'

// Allowed stage transitions — mirrors the backend validation
const ALLOWED_TRANSITIONS = {
    DRAFT:     ['REVIEW'],
    REVIEW:    ['REVISION', 'APPROVED'],
    REVISION:  ['REVIEW'],
    APPROVED:  ['COMPLETED'],
    COMPLETED: [],
}

const ALL_STAGES = ['DRAFT', 'REVIEW', 'REVISION', 'APPROVED', 'COMPLETED']

function ProjectDetailPage() {
    const { studioId, projectId } = useParams()
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', priority: 'MEDIUM', deadline: '' })
    const [loading, setLoading] = useState(true)
    const [stageFilter, setStageFilter] = useState('ALL')

    useEffect(() => {
        const fetchData = async () => {
            const [projRes, taskRes] = await Promise.all([
                apiFetch(`/studios/${studioId}/projects/${projectId}/`),
                apiFetch(`/studios/${studioId}/projects/${projectId}/tasks/`),
            ])
            if (projRes.ok) setProject(await projRes.json())
            if (taskRes.ok) setTasks(await taskRes.json())
            setLoading(false)
        }
        fetchData()
    }, [studioId, projectId])

    const handleCreateTask = async (e) => {
        e.preventDefault()
        const response = await apiFetch(`/studios/${studioId}/projects/${projectId}/tasks/`, {
            method: 'POST',
            body: JSON.stringify(form),
        })
        if (response.ok) {
            const newTask = await response.json()
            setTasks([...tasks, newTask])
            setShowForm(false)
            setForm({ title: '', priority: 'MEDIUM', deadline: '' })
        }
    }

    // Called when user picks a new stage from the dropdown
    const handleStageChange = async (taskId, newStage) => {
        const response = await apiFetch(
            `/studios/${studioId}/projects/${projectId}/tasks/${taskId}/`,
            {
                method: 'PATCH',
                body: JSON.stringify({ stage: newStage }),
            }
        )
        if (response.ok) {
            const updated = await response.json()
            // Replace the old task in state with the updated one
            setTasks(tasks.map(t => t.id === taskId ? updated : t))
        } else {
            alert('Stage transition not allowed')
        }
    }

    const filteredTasks = stageFilter === 'ALL'
        ? tasks
        : tasks.filter(t => t.stage === stageFilter)

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
                    <div>
                        <h2 className="page-title">{project?.name}</h2>
                        <p className="project-sub">{project?.type} {project?.deadline ? `· Due ${project.deadline}` : ''}</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Task'}
                    </button>
                </div>

                {/* Create task form */}
                {showForm && (
                    <form onSubmit={handleCreateTask} className="inline-form">
                        <input
                            placeholder="Task title"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <select
                            value={form.priority}
                            onChange={e => setForm({ ...form, priority: e.target.value })}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={e => setForm({ ...form, deadline: e.target.value })}
                        />
                        <button type="submit" className="btn-primary">Create</button>
                    </form>
                )}

                {/* Stage filter tabs */}
                <div className="stage-tabs">
                    {['ALL', ...ALL_STAGES].map(stage => (
                        <button
                            key={stage}
                            className={`stage-tab ${stageFilter === stage ? 'active' : ''}`}
                            onClick={() => setStageFilter(stage)}
                        >
                            {stage}
                        </button>
                    ))}
                </div>

                {/* Tasks list */}
                {filteredTasks.length === 0
                    ? <p className="empty">No tasks here.</p>
                    : (
                        <div className="tasks-list">
                            {filteredTasks.map(task => (
                                <div key={task.id} className="task-row">
                                    <div className="task-info">
                                        <p className="task-name">{task.title}</p>
                                        {task.deadline && (
                                            <p className="project-sub">Due {task.deadline}</p>
                                        )}
                                    </div>
                                    <span className={`tag priority-${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                    {/* Stage dropdown — only shows allowed next stages */}
                                    <select
                                        className="stage-select"
                                        value={task.stage}
                                        onChange={e => handleStageChange(task.id, e.target.value)}
                                    >
                                        {/* Always show current stage */}
                                        <option value={task.stage}>{task.stage}</option>
                                        {/* Show allowed transitions */}
                                        {ALLOWED_TRANSITIONS[task.stage].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )
                }
            </main>
        </div>
    )
}

export default ProjectDetailPage