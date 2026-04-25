import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Eye, EyeOff, FileText, Loader2, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { papersAPI, universitiesAPI } from '../services/api';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', university_id: '', department_id: '', subject_id: '', semester: '', year: '' });
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    universitiesAPI.list().then(r => setUniversities(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.university_id) {
      universitiesAPI.getDepartments(form.university_id).then(r => setDepartments(r.data)).catch(() => setDepartments([]));
      setForm(f => ({ ...f, department_id: '', subject_id: '' }));
    }
  }, [form.university_id]);

  useEffect(() => {
    if (form.department_id) {
      const params = { department_id: form.department_id };
      if (form.semester) params.semester = form.semester;
      papersAPI.getSubjects(params).then(r => setSubjects(r.data)).catch(() => setSubjects([]));
    }
  }, [form.department_id, form.semester]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    if (f && f.size > 50 * 1024 * 1024) { toast.error('File must be under 50MB'); return; }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');
    if (!form.title || !form.university_id || !form.department_id || !form.semester || !form.year) {
      return toast.error('Please fill all required fields');
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
    data.append('file', file);

    setLoading(true);
    try {
      await papersAPI.upload(data);
      toast.success('Paper uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-all";
  const sel = inp + " appearance-none cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 text-lg">Upload Paper</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Engineering Mathematics II" className={inp} required />
          </div>

          {/* University + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">University *</label>
              <select value={form.university_id} onChange={e => setForm(f => ({ ...f, university_id: e.target.value }))} className={sel} required>
                <option value="">Select</option>
                {universities.map(u => <option key={u.id} value={u.id}>{u.code}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Department *</label>
              <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))} className={sel} required disabled={!form.university_id}>
                <option value="">Select</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Semester + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Semester *</label>
              <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className={sel} required>
                <option value="">Select</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}{['st','nd','rd','th'][Math.min(s-1,3)]} Sem</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Year *</label>
              <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className={sel} required>
                <option value="">Select</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Subject (optional) */}
          {subjects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Subject (optional)</label>
              <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} className={sel}>
                <option value="">None</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* File upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">PDF File *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to select PDF <span className="text-slate-400 text-xs">(max 50MB)</span></p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} /> Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPapersPage() {
  const [papers, setPapers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await papersAPI.adminList({ page, limit: 20 });
      setPapers(res.data.papers);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPapers(); }, [page]);

  const handleToggle = async (id) => {
    try {
      const res = await papersAPI.toggle(id);
      setPapers(prev => prev.map(p => p.id === id ? { ...p, is_published: res.data.is_published } : p));
      toast.success(res.data.is_published ? 'Paper published' : 'Paper unpublished');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await papersAPI.delete(id);
      toast.success('Paper deleted');
      fetchPapers();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Papers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total papers</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          Upload Paper
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-blue-600">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading papers...</span>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No papers yet. Upload your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">University</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Dept</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Year/Sem</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {papers.map(paper => (
                  <tr key={paper.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={13} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 line-clamp-1 max-w-[200px]">{paper.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">{paper.university_code}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-500 truncate max-w-[120px] block">{paper.department_code}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">{paper.year} · Sem {paper.semester}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paper.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {paper.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggle(paper.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={paper.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {paper.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(paper.id, paper.title)}
                          disabled={deleting === paper.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === paper.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchPapers} />}
    </div>
  );
}
