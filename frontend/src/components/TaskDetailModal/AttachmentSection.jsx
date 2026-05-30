import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

const AttachmentSection = ({ taskId }) => {
  const [attachments, setAttachments] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    apiClient.get(`/attachments/?task=${taskId}`)
      .then(data => setAttachments(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, [taskId]);

  const getPlatformBadge = (urlStr = '') => {
    const lowerUrl = urlStr.toLowerCase();
    if (lowerUrl.includes('figma.com'))
      return { text: '🎨 Figma', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
    if (lowerUrl.includes('docs.google') || lowerUrl.includes('drive.google'))
      return { text: '📄 Google Docs', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { text: '🔗 Link', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    try {
      const saved = await apiClient.post('/attachments/', {
        task: taskId,
        title,
        resource_url: url,
        label: 'other'
      });
      setAttachments([...attachments, saved]);
      setTitle('');
      setUrl('');
      setIsAdding(false);
    } catch (err) {
      alert("Failed to save attachment.");
    }
  };

  return (
    <div className="text-slate-900">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Workspace Deliverables ({attachments.length})
        </h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded-lg transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add Asset Link'}
        </button>
      </div>

      <div className="space-y-2">
        {attachments.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 text-center py-4">No attachments yet.</p>
        )}
        {attachments.map((asset) => {
          const badge = getPlatformBadge(asset.resource_url);
          return (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                  {badge.text}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-700 leading-none">{asset.title}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
                    {asset.label_display || asset.label}
                  </span>
                </div>
              </div>
              
                <a href={asset.resource_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Open →
              </a>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asset Title</label>
            <input
              type="text"
              placeholder="e.g., Final Thumbnail Layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resource URL</label>
            <input
              type="url"
              placeholder="https://figma.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Save Deliverable
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AttachmentSection;