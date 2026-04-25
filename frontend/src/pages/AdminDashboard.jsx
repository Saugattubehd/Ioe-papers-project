import React, { useState, useEffect } from 'react';
import { FileText, Download, Users, Building2, TrendingUp, BookOpen } from 'lucide-react';
import { papersAPI, usersAPI, universitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="font-display font-bold text-3xl text-slate-800 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ papers: 0, downloads: 0, users: 0, departments: 0 });
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      papersAPI.adminList({ limit: 5, page: 1 }),
      usersAPI.list().catch(() => ({ data: [] })),
      universitiesAPI.allDepartments().catch(() => ({ data: [] })),
    ]).then(([papersRes, usersRes, deptsRes]) => {
      const papers = papersRes.data;
      setRecentPapers(papers.papers || []);
      const totalDownloads = (papers.papers || []).reduce((s, p) => s + (p.download_count || 0), 0);
      setStats({
        papers: papers.total || 0,
        downloads: totalDownloads,
        users: usersRes.data.length || 0,
        departments: deptsRes.data.length || 0,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const semLabel = (s) => s ? `Sem ${s}` : '';

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-slate-800">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with IOE Papers today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Papers" value={stats.papers.toLocaleString()} icon={FileText} color="bg-blue-600" />
        <StatCard title="Total Downloads" value={stats.downloads.toLocaleString()} icon={Download} color="bg-sky-500" />
        <StatCard title="Team Members" value={stats.users} icon={Users} color="bg-indigo-500" />
        <StatCard title="Departments" value={stats.departments} icon={Building2} color="bg-cyan-600" />
      </div>

      {/* Recent Papers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-slate-800">Recent Uploads</h2>
          <a href="/admin/papers" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</a>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : recentPapers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No papers uploaded yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentPapers.map((paper) => (
              <div key={paper.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{paper.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {paper.university_code} · {paper.department_name} · {paper.year} {semLabel(paper.semester)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Download size={11} />
                  {paper.download_count || 0}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  paper.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {paper.is_published ? 'Live' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
