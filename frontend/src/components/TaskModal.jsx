import { useState, useEffect } from 'react'
import { apiFetch } from '../api/fetch'
import './TaskModal.css'

function TaskModal({ task, studioId, projectId, onClose, onTaskUpdate }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [replyTo, setReplyTo] = useState(null)

    useEffect(() => {
        const fetchComments = async () => {
            const response = await apiFetch(
                `/studios/${studioId}/projects/${projectId}/tasks/${task.id}/comments/`
            )
            if (response.ok) setComments(await response.json())
        }
        fetchComments()
    }, [task.id])

    const handleComment = async (e) => {
        e.preventDefault()
        const body = { content: newComment }
        if (replyTo) body.parent = replyTo

        const response = await apiFetch(
            `/studios/${studioId}/projects/${projectId}/tasks/${task.id}/comments/`,
            { method: 'POST', body: JSON.stringify(body) }
        )
        if (response.ok) {
            const data = await response.json()
            if (replyTo) {
                // Add reply inside the parent comment
                setComments(comments.map(c =>
                    c.id === replyTo
                        ? { ...c, replies: [...(c.replies || []), data] }
                        : c
                ))
            } else {
                setComments([...comments, { ...data, replies: [] }])
            }
            setNewComment('')
            setReplyTo(null)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{task.title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-meta">
                    <span className={`tag priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                    </span>
                    <span className={`tag stage-${task.stage.toLowerCase()}`}>
                        {task.stage}
                    </span>
                    {task.deadline && <span className="modal-deadline">Due {task.deadline}</span>}
                </div>

                {task.description && (
                    <p className="modal-description">{task.description}</p>
                )}

                <div className="modal-section">
                    <p className="modal-section-title">Comments</p>
                    {comments.length === 0
                        ? <p className="empty">No comments yet.</p>
                        : comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.author_name}</span>
                                    <span className="comment-time">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="comment-content">{comment.content}</p>
                                <button
                                    className="reply-btn"
                                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                >
                                    {replyTo === comment.id ? 'Cancel' : 'Reply'}
                                </button>
                                {/* Replies */}
                                {comment.replies?.map(reply => (
                                    <div key={reply.id} className="comment reply">
                                        <div className="comment-header">
                                            <span className="comment-author">{reply.author_name}</span>
                                            <span className="comment-time">{new Date(reply.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="comment-content">{reply.content}</p>
                                    </div>
                                ))}
                                {replyTo === comment.id && (
                                    <form onSubmit={handleComment} className="reply-form">
                                        <input
                                            placeholder="Write a reply..."
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            required
                                        />
                                        <button type="submit" className="btn-primary">Reply</button>
                                    </form>
                                )}
                            </div>
                        ))
                    }
                    {!replyTo && (
                        <form onSubmit={handleComment} className="comment-form">
                            <input
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">Post</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TaskModal