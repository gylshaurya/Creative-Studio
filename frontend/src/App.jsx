import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api'; // Check path path depth depending on structure
import AttachmentSection from '../components/TaskDetailModal/AttachmentSection';
import CommentSection from '../components/TaskDetailModal/CommentSection';

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design');
  const [newStatus, setNewStatus] = useState('todo'); // Changed to lowercase to match your fresh Django choices!

  // Updated array strings to match how Django tracks your status selections
  const columns = ["todo", "in_progress", "review", "done"];
  const displayNames = {
    "todo": "To Do",
    "in_progress": "In Progress",
    "review": "Under Review",
    "done": "Completed"
  };

  useEffect(() => {
    async function fetchTasksFromDB() {
      try {
        setIsLoading(true);
        const data = await apiClient.get('/tasks/');
        setTasks(data);
      } catch (err) {
        console.error("Could not reach Django API.", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasksFromDB();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload = {
      title: newTitle,
      status: newStatus
      // Add description or other model keys if desired
    };

    try {
      const savedTask = await apiClient.post('/tasks/', payload);
      setTasks([...tasks, savedTask]);
      setNewTitle('');
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to save task to the database server.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold">
        Loading Studio Board from Database...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm tracking-wider">ON</div>
          <h1 className="text-lg font-bold tracking-tight text-white">Creative Studio Workspace</h1>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all"
        >
          + Create Task Card
        </button>
      </header>

      <main className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Production Kanban Board</h2>
          <p className="text-sm text-slate-400 mt-1">Authorized Node Session Connected to Live Backend.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {columns.map((columnName) => {
            const columnTasks = tasks.filter(t => t.status === columnName);
            return (
              <div key={columnName} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[500px]">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">{displayNames[columnName]}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">{columnTasks.length}</span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:shadow-xl cursor-pointer transition-all group"
                    >
                      <h4 className="text-sm font-bold text-slate-200 mt-1 group-hover:text-white leading-snug">
                        {task.title}
                      </h4>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                        <span>👤 {task.created_by_username || 'System'}</span>
                        <span className="font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- POPUP FORM OVERLAY --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Create Workspace Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Task Deliverable Title</label>
                <input
                  type="text"
                  placeholder="e.g., Script editing for intro trailer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline State</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Add Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL OVERLAY --- */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mt-2">{activeTask.title}</h2>
              </div>
              <button onClick={() => setActiveTask(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold h-8 w-8 flex items-center justify-center bg-slate-200/50 rounded-full">✕</button>
            </div>
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