import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    setSuccess(false);
    try {
      await authAPI.resetPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully!');
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-all";

  const PasswordField = ({ label, field, showKey }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          className={inp + ' pr-11'}
          required
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 mb-6">
        <h2 className="font-display font-semibold text-slate-700 mb-4 text-lg">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-display font-bold text-xl">{user?.username?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.username}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              user?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-sky-50 text-sky-700'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <KeyRound size={17} className="text-blue-600" />
          </div>
          <h2 className="font-display font-semibold text-slate-700 text-lg">Change Password</h2>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle size={16} />
            Password updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField label="Current Password" field="currentPassword" showKey="cur" />
          <PasswordField label="New Password (min 8 chars)" field="newPassword" showKey="new" />
          <PasswordField label="Confirm New Password" field="confirmPassword" showKey="con" />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : <><KeyRound size={15} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
