import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { universitiesAPI } from '../services/api';

export default function AdminDepartmentsPage() {
  const [universities, setUniversities] = useState([]);
  const [allDepts, setAllDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showAddDept, setShowAddDept] = useState(null); // university id
  const [newDept, setNewDept] = useState({ name: '', code: '' });
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uniRes, deptsRes] = await Promise.all([
        universitiesAPI.list(),
        universitiesAPI.allDepartments(),
      ]);
      setUniversities(uniRes.data);
      setAllDepts(deptsRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const handleAddDept = async (uniId) => {
    if (!newDept.name.trim() || !newDept.code.trim()) return toast.error('Name and code required');
    setAdding(true);
    try {
      await universitiesAPI.addDepartment(uniId, newDept);
      toast.success('Department added!');
      setNewDept({ name: '', code: '' });
      setShowAddDept(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add department');
    } finally { setAdding(false); }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? All associated papers will lose their department link.`)) return;
    try {
      await universitiesAPI.deleteDepartment(id);
      toast.success('Department deleted');
      fetchData();
    } catch { toast.error('Failed to delete department'); }
  };

  const getDepts = (uniId) => allDepts.filter(d => d.university_id === uniId);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Departments</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage departments across all universities</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-blue-600">
          <Loader2 size={20} className="animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {universities.map(uni => {
            const depts = getDepts(uni.id);
            const isOpen = expanded[uni.id];
            return (
              <div key={uni.id} className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                {/* University header */}
                <button
                  onClick={() => toggleExpand(uni.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-display font-bold text-sm">{uni.code}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{uni.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{depts.length} department{depts.length !== 1 ? 's' : ''}</p>
                  </div>
                  {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100">
                    {/* Department list */}
                    {depts.length > 0 && (
                      <div className="divide-y divide-slate-50">
                        {depts.map(dept => (
                          <div key={dept.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50/30 transition-colors">
                            <Building2 size={15} className="text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-slate-700 font-medium">{dept.name}</span>
                              <span className="text-xs text-slate-400 ml-2 font-mono">{dept.code}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDept(dept.id, dept.name)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add department */}
                    {showAddDept === uni.id ? (
                      <div className="px-6 py-4 bg-blue-50/50 border-t border-slate-100 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Department name"
                          value={newDept.name}
                          onChange={e => setNewDept(d => ({ ...d, name: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Code (e.g. BCE)"
                          value={newDept.code}
                          onChange={e => setNewDept(d => ({ ...d, code: e.target.value }))}
                          className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                          maxLength={10}
                        />
                        <button
                          onClick={() => handleAddDept(uni.id)}
                          disabled={adding}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                          Add
                        </button>
                        <button
                          onClick={() => { setShowAddDept(null); setNewDept({ name: '', code: '' }); }}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddDept(uni.id)}
                        className="w-full flex items-center gap-2 px-6 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100 font-medium"
                      >
                        <Plus size={14} />
                        Add Department to {uni.code}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
