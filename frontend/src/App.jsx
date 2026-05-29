import React, { useState, useEffect } from 'react';
import { apiClient } from './services/api';
import AttachmentSection from './components/TaskDetailModal/AttachmentSection';
import CommentSection from './components/TaskDetailModal/CommentSection';

function App() {
  // 1. Initialize state as an EMPTY array because data lives in the DB now!
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form Input States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design');
  const [newStatus, setNewStatus] = useState('To Do');

  const columns = ["To Do", "In Progress", "Completed"];

  // 2. DATABASE FETCH TRIGGER: Runs automatically when the dashboard opens
  useEffect(() => {
    async function fetchTasksFromDB() {
      try {
        setIsLoading(true);
        // Hits your Django endpoint: http://localhost:8000/api/tasks/
        const data = await apiClient.get('/tasks/');
        setTasks(data);
      } catch (err) {
        console.error("Could not reach Django API. Using local fallback sandbox data.", err);
        // Temporary developer fallback so your UI doesn't break while server is off
        setTasks([
          { id: 1, title: "Design Primary Podcast Poster Layout (Sandbox Fallback)", category: "Design", assignee: "Siddhi Gupta", status: "In Progress", statusColor: "text-amber-600 bg-amber-50" }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasksFromDB();
  }, []);

  // 3. DATABASE INSERT TRIGGER: Sends the form payload to Django
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Build the payload exactly matching what your Django Post Serializer requires
    const payload = {
      title: newTitle,
      category: newCategory,
      status: newStatus
    };

    try {
      // POST the data to your database via Django
      const savedTask = await apiClient.post('/tasks/', payload);
      // Append the newly saved database entry directly into the UI state board
      setTasks([...tasks, savedTask]);
      
      // Reset form fields
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
      {/* Central Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-sm tracking-wider">ON</div>
          <h1 className="text-lg font-bold tracking-tight text-white">Creative Studio</h1>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all"
        >
          + Create Task Card
        </button>
      </header>

      {/* Main Board Grid Canvas */}
      <main className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Production Kanban Board</h2>
          <p className="text-sm text-slate-400 mt-1">Connected to Live Studio API Engine.</p>
        </div>

        {/* The 3-Column Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((columnName) => {
            const columnTasks = tasks.filter(t => t.status === columnName);
            return (
              <div key={columnName} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[500px]">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">{columnName}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">{columnTasks.length}</span>
                </div>

                {/* Task Cards Container */}
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:shadow-xl cursor-pointer transition-all group"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700/60">
                        {task.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-200 mt-2.5 group-hover:text-white leading-snug">
                        {task.title}
                      </h4>
                      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                        <span>👤 {task.assignee || 'Unassigned'}</span>
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

      {/* --- ADD NEW TASK POPUP FORM OVERLAY --- */}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category Domain</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white">
                    <option value="Design">Design</option>
                    <option value="Anchoring">Anchoring</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline State</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full text-sm p-2.5 border border-slate-300 rounded-xl bg-white">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-slate-500 px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Add Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TASK DETAIL MODAL OVERLAY --- */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{activeTask.category} Channel Workspace</span>
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

export default App;