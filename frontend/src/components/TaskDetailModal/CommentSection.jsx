import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

// 1. Individual Recursive Comment Card Component
const CommentCard = ({ comment, onAddReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    // Fire the callback passed down from the parent controller
    onAddReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className="mt-3">
      {/* Visual Indentation Indicator */}
      <div className={`relative ${comment.parent ? 'pl-4 border-l-2 border-slate-200 ml-2' : ''}`}>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
              {comment.author_details?.username || "Anonymous (Local)"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {comment.created_at}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {comment.text}
          </p>
          
          {/* Reply Toggle Button */}
          <button 
            type="button"
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded mt-2 cursor-pointer transition-colors block"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        </div>

        {/* Inline Reply Input Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-2 ml-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Write a reply..." 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 text-sm px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-slate-900"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Post
            </button>
          </form>
        )}

        {/* RECURSIVE STEP: Safely loop over sub-replies forwarding the handler */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1">
            {comment.replies.map((reply) => (
              <CommentCard 
                key={reply.id} 
                comment={reply} 
                onAddReply={onAddReply} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Main Activity Thread Controller
const CommentSection = ({ taskId = 1 }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [useLiveAPI, setUseLiveAPI] = useState(false);

  // Hardcoded blueprint mirroring your Django REST Framework JSON structure perfectly
  const localMockData = [
    { 
      id: 101, 
      text: "Hey team! I updated the design system constraints for the new anchoring podcast layout cards.", 
      created_at: "10 mins ago", 
      parent: null, 
      author_details: { username: "Siddhi" }, 
      replies: [
        { 
          id: 102, 
          text: "Typography weights look great, contrast is solid.", 
          created_at: "5 mins ago", 
          parent: 101, 
          author_details: { username: "Shaurya" }, 
          replies: [] 
        }
      ] 
    }
  ];

  // Sync dataset based on local sandbox vs live server toggle
  useEffect(() => {
    if (useLiveAPI) {
      apiClient.get(`/tasks/${taskId}/comments/`)
        .then(data => setComments(data))
        .catch(err => console.error("Server offline, staying on sandbox mode.", err));
    } else {
      setComments(localMockData);
    }
  }, [useLiveAPI, taskId]);

  // Handler for adding a top-level root comment
  const handleAddRootComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const payload = { text: newCommentText, parent: null };

    if (useLiveAPI) {
      try {
        const savedComment = await apiClient.post(`/tasks/${taskId}/comments/`, payload);
        setComments([...comments, { ...savedComment, replies: [] }]);
      } catch (err) {
        alert("Failed sending data to live Django server.");
      }
    } else {
      const localNode = {
        id: Date.now(),
        text: newCommentText,
        created_at: "Just now",
        parent: null,
        author_details: { username: "Siddhi (Local)" },
        replies: []
      };
      setComments([...comments, localNode]);
    }
    setNewCommentText('');
  };

  // Deep recursive state manipulator to insert a child node safely into client-side arrays
  const handleAddReply = async (targetParentId, textContent) => {
    const payload = { text: textContent, parent: targetParentId };

    if (useLiveAPI) {
      try {
        await apiClient.post(`/tasks/${taskId}/comments/`, payload);
        const refreshedTree = await apiClient.get(`/tasks/${taskId}/comments/`);
        setComments(refreshedTree);
      } catch (err) {
        console.error("Live post failed", err);
      }
    } else {
      const insertReplyRecursive = (nodes) => {
        return nodes.map(node => {
          if (node.id === targetParentId) {
            return {
              ...node,
              replies: [...node.replies, {
                id: Date.now(),
                text: textContent,
                created_at: "Just now",
                parent: targetParentId,
                author_details: { username: "Siddhi (Local)" },
                replies: []
              }]
            };
          } else if (node.replies && node.replies.length > 0) {
            return { ...node, replies: insertReplyRecursive(node.replies) };
          }
          return node;
        });
      };
      setComments(insertReplyRecursive(comments));
    }
  };

  return (
    <div className="max-h-[450px] overflow-y-auto pr-1 text-slate-900">
      {/* Dev Environment Connection Mode Switcher */}
      <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg mb-4 border border-slate-200">
        <span className="text-xs font-semibold text-slate-600">API Connection Mode:</span>
        <button 
          type="button"
          onClick={() => setUseLiveAPI(!useLiveAPI)}
          className={`text-xs px-2.5 py-1 rounded font-bold uppercase transition-colors cursor-pointer ${useLiveAPI ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}
        >
          {useLiveAPI ? '🔗 Live Django API' : '⚙️ Local Sandbox Mock Mode'}
        </button>
      </div>

      <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">
        Activity Threads
      </h3>

      {/* Render Current Tree */}
      <div className="space-y-2 mb-4">
        {comments.map((comment) => (
          <CommentCard 
            key={comment.id} 
            comment={comment} 
            onAddReply={handleAddReply} 
          />
        ))}
      </div>

      {/* Root Entry form field */}
      <form onSubmit={handleAddRootComment} className="border-t border-slate-200 pt-3">
        <textarea 
          rows="2" 
          placeholder="Add to the conversation thread..." 
          value={newCommentText} 
          onChange={(e) => setNewCommentText(e.target.value)}
          className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 bg-white text-slate-900 resize-none shadow-sm"
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
          >
            Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;