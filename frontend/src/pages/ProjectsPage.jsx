import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/fetch'
import './ProjectsPage.css'

function ProjectsPage() {
    const [studios, setStudios] = useState([])
    const [projects, setProjects] = useState([])
    const [selectedStudio, setSelectedStudio] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', type: 'POSTER', deadline: '' })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchStudios = async () => {
            const response = await apiFetch('/studios/')
            if (response.ok) {
                const data = await response.json()
                setStudios(data)

                if (data.length > 0) {
                    setSelectedStudio(data[0])
                }
            }
            setLoading(false)
        }
        fetchStudios()
    }, [])

    useEffect(() => {
        if (!selectedStudio) return
        const fetchProjects = async () => {
            const response = await apiFetch(`/studios/${selectedStudio.id}/projects/`)
            if (response.ok) {
                const data = await response.json()
                setProjects(data)
            }
        }
        fetchProjects()
    }, [selectedStudio])

    const handleCreate = async (e) => {
        e.preventDefault()
        const response = await apiFetch(`/studios/${selectedStudio.id}/projects/`, {
            method: 'POST',
            body: JSON.stringify(form),
        })
        if (response.ok) {
            const newProject = await response.json()
            setProjects([...projects, newProject])
            setShowForm(false)
            setForm({ name: '', type: 'POSTER', deadline: '' })
        }
    }

    if (loading) return <div className="page-loading">Loading...</div>

    return (
        <div className="page-wrapper">
            <header className="page-header">
                <span className="brand">Creative Studio</span>
                <nav className="nav-links">
                    <a href="/dashboard">Dashboard</a>
                    <a href="/projects" className="active">Projects</a>
                </nav>
            </header>

            <main className="page-main">
                {/* Studio selector */}
                {studios.length > 1 && (
                    <div className="studio-tabs">
                        {studios.map(s => (
                            <button
                                key={s.id}
                                className={`studio-tab ${selectedStudio?.id === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedStudio(s)}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="section-header">
                    <h2 className="page-title">
                        {selectedStudio ? selectedStudio.name : 'Projects'}
                    </h2>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Project'}
                    </button>
                </div>

                {/* Create project form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="inline-form">
                        <input
                            placeholder="Project name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="POSTER">Poster</option>
                            <option value="VIDEO">Video</option>
                            <option value="CAMPAIGN">Campaign</option>
                            <option value="CONTENT">Content</option>
                        </select>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={e => setForm({ ...form, deadline: e.target.value })}
                        />
                        <button type="submit" className="btn-primary">Create</button>
                    </form>
                )}

                {/* Projects list */}
                {projects.length === 0
                    ? <p className="empty">No projects yet.</p>
                    : (
                        <div className="projects-list">
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className="project-row"
                                    onClick={() => navigate(`/projects/${selectedStudio.id}/${project.id}`)}
                                >
                                    <div>
                                        <p className="project-name">{project.name}</p>
                                        <p className="project-sub">{project.type} {project.deadline ? `· Due ${project.deadline}` : ''}</p>
                                    </div>
                                    <span className={`tag status-${project.status.toLowerCase()}`}>
                                        {project.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )
                }
            </main>
        </div>
    )
}

export default ProjectsPage