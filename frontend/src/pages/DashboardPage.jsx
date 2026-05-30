import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../services/api'; 
import AttachmentSection from '../components/TaskDetailModal/AttachmentSection';
import CommentSection from '../components/TaskDetailModal/CommentSection';

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Form Field Input States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design');
  const [newStatus, setNewStatus] = useState('DRAFT');
  const [newAssignee, setNewAssignee] = useState('');

  // Context Core Constants
  const currentStudioId = 1; // Default fallback to active studio context node
  const columns = ["DRAFT", "REVIEW", "REVISION", "APPROVED", "COMPLETED"];
  
  const displayNames = {
    "DRAFT": "Drafts / To Do",
    "REVIEW": "Under Review",
    "REVISION": "Needs Revision",
    "APPROVED": "Approved",
    "COMPLETED": "Completed 🎉"
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Central Database Fetch Lifecycles
  useEffect(() => {
    async function fetchTasksFromDB() {
      try {
        setIsLoading(true);
        const data = await apiClient.get('/tasks/');
        setTasks(data);
      } catch (err) {
        console.error("Could not reach Django API layout node.", err);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchStudioMembersOnly() {
      try {
        // Enforces RBAC constraints: Fetches team pool belonging strictly to this studio
        const data = await apiClient.get(`/studios/${currentStudioId}/members/`);
        setMembers(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Could not fetch isolated studio members, using profile fallback...", err);
        try {
          const me = await apiClient.get('/auth/me/');
          setMembers([me]);
        } catch (e) {
          console.error("Profile fallback frame failed", e);
        }
      }
    }

    async function fetchNotifications() {
      try {
        const data = await apiClient.get('/notifications/');
        setNotifications(Array.isArray(data) ? data : data.results || []);
      } catch (e) {
        console.error("Could not fetch notifications", e);
      }
    }

    fetchTasksFromDB();
    fetchStudioMembersOnly();
    fetchNotifications();
  }, [currentStudioId]);

  // Operational Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle,
      description: '', // Bypasses backend model database null limitations safely
      stage: newStatus.toUpperCase(), 
      project: 1, // Explicit binding connection to parent baseline campaign project #1
      tags: [newCategory],
      ...(newAssignee && { assignee: newAssignee }),
    };

    try {
      const savedTask = await apiClient.post('/tasks/', payload);
      setTasks([...tasks, savedTask]);
      setNewTitle('');
      setNewStatus('DRAFT');
      setNewCategory('Design');
      setNewAssignee('');
      setIsFormOpen(false);
    } catch (err) {
      console.error("Django engine validation diagnostics:", err.response?.data);
      alert(`Failed to save task: ${JSON.stringify(err.response?.data || "Network Timeout")}`);
    }
  };

  const handleUpdateTaskStage = async (taskId, newStage) => {
    try {
      const updatedTask = await apiClient.patch(`/tasks/${taskId}/`, { stage: newStage });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      setActiveTask(updatedTask);
    } catch (err) {
      console.error("Failed to alter pipeline state position on database server node:", err);
      alert("Failed to update the task stage on the server.");
    }
  };

  const handleUpdateAssignee = async (taskId, assigneeId) => {
    try {
      const updatedTask = await apiClient.patch(`/tasks/${taskId}/`, { 
        assignee: assigneeId || null 
      });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      setActiveTask(updatedTask);
    } catch (err) {
      console.error("Failed to update assignee mapping row constraint:", err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await apiClient.patch(`/notifications/${notifId}/`, { is_read: true });
      setNotifications(notifications.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => handleMarkAsRead(n.id)));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold tracking-wide">
        Loading Authoritative Studio Board from Database Node...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      
      {/* GLOBAL APPLICATION HEADER BAR CONTAINER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm tracking-wider">CS</div>
          <h1 className="text-lg font-bold tracking-tight text-white">Creative Studio Workspace</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* BELL ICON NOTIFICATION DRIVER SYSTEM */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* FLOATING DROPDOWN LIST OVERLAY VIEW */}
            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`px-4 py-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${!n.is_read ? 'bg-indigo-950/30' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                          {!n.is_read && <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            + Create Task Card
          </button>
        </div>
      </header>

      {/* KANBAN CANVAS MATRIX VIEWPORT SECTION */}
      <main className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Production Kanban Board</h2>
          <p className="text-sm text-slate-400 mt-1">Authorized Session Terminal Connecting to Live Pipeline Nodes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1.5rem' }}>
          {columns.map((columnName) => {
            const columnTasks = tasks.filter(t => (t.stage || t.status) === columnName);
            
            return (
              <div key={columnName} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-4 px-1 shrink-0">
                  <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">{displayNames[columnName]}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">{columnTasks.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:shadow-xl cursor-pointer transition-all group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700/60 inline-block mb-2">
                        {task.tags && task.tags[0] ? task.tags[0] : "General"}
                      </span>
                      
                      <h4 className="text-sm font-bold text-slate-200 mt-1 group-hover:text-white leading-snug break-words">
                        {task.title}
                      </h4>
                      
                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                        <span className="truncate max-w-[120px]">👤 {task.assignee_username || task.created_by_username || 'Unassigned'}</span>
                        <span className="font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">Open →</span>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.75rem', color: '#334155', border: '1px dashed #1e293b', borderRadius: '0.75rem' }}>
                      No active items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* COMPONENT POPUP OVERLAY: CREATE WORKSPACE TASK FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Create Workspace Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Task Deliverable Title</label>
                <input
                  type="text"
                  placeholder="e.g., Script editing for intro trailer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl bg-white text-slate-900 outline-none focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category Domain</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer">
                    <option value="Design">Design</option>
                    <option value="Anchoring">Anchoring</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline State</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer">
                    <option value="DRAFT">To Do / Draft</option>
                    <option value="REVIEW">Under Review</option>
                    <option value="REVISION">Needs Revision</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* ISOLATED STUDIO TEAM MEMBER ASSIGNEE SELECTOR DROP-DOWN */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assign To (Studio Team)</label>
                <select 
                  value={newAssignee} 
                  onChange={(e) => setNewAssignee(e.target.value)} 
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 cursor-pointer"
                >
                  <option value="">— Unassigned —</option>
                  {members.map(m => (
                    <option key={m.id} value={m.user || m.id}>
                      {m.username || m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-colors cursor-pointer">Add Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPONENT OVERLAY: ACTIVE TASK DETAIL MODAL BLOCKS */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Workspace Deliverable
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-2 tracking-tight">{activeTask.title}</h2>
              </div>
              
              <div className="flex items-center gap-3">
                {/* INTERACTIVE TEAM ASSIGNEE SWITCHER DRIVER */}
                <select
                  value={activeTask.assignee || ''}
                  onChange={(e) => handleUpdateAssignee(activeTask.id, e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="">— Unassigned —</option>
                  {members.map(m => (
                    <option key={m.id} value={m.user || m.id}>
                      👤 {m.username || m.email}
                    </option>
                  ))}
                </select>

                {/* WORKFLOW PIPELINE STAGE SELECTOR DROPDOWN SWITCHER */}
                <select 
                  value={activeTask.stage || activeTask.status || "DRAFT"} 
                  onChange={(e) => handleUpdateTaskStage(activeTask.id, e.target.value)}
                  className="text-xs font-bold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="REVISION">Revision</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button 
                  onClick={() => setActiveTask(null)} 
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold h-8 w-8 flex items-center justify-center bg-slate-200/50 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* NESTED CONTENT THREAD SEGMENT BLOCKS */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="border-t border-slate-100 pt-4">
                <AttachmentSection taskId={activeTask.id} />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <CommentSection taskId={activeTask.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;