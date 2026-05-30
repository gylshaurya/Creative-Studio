import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../api/fetch'
import './ProjectsPage.css'

const ALLOWED_TRANSITIONS = {
    DRAFT:     ['REVIEW'],
    REVIEW:    ['REVISION', 'APPROVED'],
    REVISION:  ['REVIEW'],
    APPROVED:  ['COMPLETED'],
    COMPLETED: [],
}

const ALL_STAGES = ['DRAFT', 'REVIEW', 'REVISION', 'APPROVED', 'COMPLETED']

function TaskModal({ task, studioId, projectId, onClose, onStageChange }) {
    const [comments, setComments] = useState([])
    const [attachments, setAttachments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [attachmentLabel, setAttachmentLabel] = useState('')
    const [replyTo, setReplyTo] = useState(null)
    const [loadingComments, setLoadingComments] = useState(true)
    const [loadingAttachments, setLoadingAttachments] = useState(true)

    const base = `/studios/${studioId}/projects/${projectId}/tasks/${task.id}`

    useEffect(() => {
        const fetchDetails = async () => {
            const [cRes, aRes] = await Promise.all([
                apiFetch(`${base}/comments/`),
                apiFetch(`${base}/attachments/`),
            ])
            if (cRes.ok) setComments(await cRes.json())
            if (aRes.ok) setAttachments(await aRes.json())
            setLoadingComments(false)
            setLoadingAttachments(false)
        }
        fetchDetails()
    }, [task.id])

    const handleAddComment = async () => {
        if (!commentText.trim()) return
        const body = { content: commentText }
        if (replyTo) body.parent = replyTo.id
        const res = await apiFetch(`${base}/comments/`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
        if (res.ok) {
            const newComment = await res.json()
            setComments([...comments, newComment])
            setCommentText('')
            setReplyTo(null)
        }
    }

    const handleAddAttachment = async () => {
        if (!attachmentLabel.trim()) return
        const res = await apiFetch(`${base}/attachments/`, {
            method: 'POST',
            body: JSON.stringify({ label: attachmentLabel }),
        })
        if (res.ok) {
            const newAttachment = await res.json()
            setAttachments([...attachments, newAttachment])
            setAttachmentLabel('')
        }
    }

    const topLevelComments = comments.filter(c => !c.parent)
    const replies = (parentId) => comments.filter(c => c.parent === parentId)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h3 className="modal-title">{task.title}</h3>
                        <div className="modal-meta">
                            <span className={`tag priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                            <span className="modal-stage">{task.stage}</span>
                            {task.deadline && <span className="modal-deadline">Due {task.deadline}</span>}
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {task.description && (
                    <p className="modal-description">{task.description}</p>
                )}

                <div className="modal-body">
                    <div className="modal-section">
                        <h4 className="modal-section-title">Comments</h4>

                        {loadingComments
                            ? <p className="empty">Loading...</p>
                            : topLevelComments.length === 0
                                ? <p className="empty">No comments yet.</p>
                                : (
                                    <div className="comments-list">
                                        {topLevelComments.map(c => (
                                            <div key={c.id} className="comment">
                                                <div className="comment-header">
                                                    <span className="comment-author">{c.author_name || c.author}</span>
                                                    <span className="comment-time">{new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="comment-content">{c.content}</p>
                                                <button
                                                    className="reply-btn"
                                                    onClick={() => setReplyTo(replyTo?.id === c.id ? null : c)}
                                                >
                                                    {replyTo?.id === c.id ? 'Cancel reply' : 'Reply'}
                                                </button>

                                                {replies(c.id).map(r => (
                                                    <div key={r.id} className="comment comment-reply">
                                                        <div className="comment-header">
                                                            <span className="comment-author">{r.author_name || r.author}</span>
                                                            <span className="comment-time">{new Date(r.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="comment-content">{r.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )
                        }

                        {replyTo && (
                            <p className="reply-indicator">Replying to: <strong>{replyTo.content.slice(0, 40)}...</strong></p>
                        )}
                        <div className="modal-input-row">
                            <input
                                className="modal-input"
                                placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            />
                            <button className="btn-primary" onClick={handleAddComment}>Post</button>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h4 className="modal-section-title">Attachments</h4>

                        {loadingAttachments
                            ? <p className="empty">Loading...</p>
                            : attachments.length === 0
                                ? <p className="empty">No attachments yet.</p>
                                : (
                                    <div className="attachments-list">
                                        {attachments.map(a => (
                                            <div key={a.id} className="attachment-item">
                                                <span className="attachment-icon">📎</span>
                                                <span className="attachment-label">{a.label}</span>
                                                <span className="attachment-by">{a.added_by_name || a.added_by}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                        }

                        <div className="modal-input-row">
                            <input
                                className="modal-input"
                                placeholder="Attachment label..."
                                value={attachmentLabel}
                                onChange={e => setAttachmentLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddAttachment()}
                            />
                            <button className="btn-primary" onClick={handleAddAttachment}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProjectDetailPage() {
    const { studioId, projectId } = useParams()
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', priority: 'MEDIUM', deadline: '' })
    const [loading, setLoading] = useState(true)
    const [stageFilter, setStageFilter] = useState('ALL')
    const [selectedTask, setSelectedTask] = useState(null)

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

    const handleStageChange = async (taskId, newStage, e) => {
        e.stopPropagation()
        const response = await apiFetch(
            `/studios/${studioId}/projects/${projectId}/tasks/${taskId}/`,
            {
                method: 'PATCH',
                body: JSON.stringify({ stage: newStage }),
            }
        )
        if (response.ok) {
            const updated = await response.json()
            setTasks(tasks.map(t => t.id === taskId ? updated : t))
            if (selectedTask?.id === taskId) setSelectedTask(updated)
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

                {filteredTasks.length === 0
                    ? <p className="empty">No tasks here.</p>
                    : (
                        <div className="tasks-list">
                            {filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="task-row"
                                    onClick={() => setSelectedTask(task)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="task-info">
                                        <p className="task-name">{task.title}</p>
                                        {task.deadline && (
                                            <p className="project-sub">Due {task.deadline}</p>
                                        )}
                                    </div>
                                    <span className={`tag priority-${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                    <select
                                        className="stage-select"
                                        value={task.stage}
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => handleStageChange(task.id, e.target.value, e)}
                                    >
                                        <option value={task.stage}>{task.stage}</option>
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

            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    studioId={studioId}
                    projectId={projectId}
                    onClose={() => setSelectedTask(null)}
                    onStageChange={handleStageChange}
                />
            )}
        </div>
    )
}

export default ProjectDetailPage