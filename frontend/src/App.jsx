import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import HomePage from './pages/HomePage';
import PapersPage from './pages/PapersPage';

// Admin pages (secret)
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPapersPage from './pages/AdminPapersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

// Secret admin URL from environment variable
const ADMIN_SECRET = process.env.REACT_APP_ADMIN_PATH || 'secret-admin-panel-7x9k2m';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#2563eb', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/papers" element={<PublicLayout><PapersPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />

          {/* Secret admin login */}
          <Route path={`/${ADMIN_SECRET}`} element={<AdminLoginPage />} />

          {/* Admin panel (protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="papers" element={<AdminPapersPage />} />
            <Route path="departments" element={<AdminDepartmentsPage />} />
            <Route path="users" element={
              <ProtectedRoute adminOnly>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Simple about page
function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-4xl text-slate-800 mb-4">About IOE Papers</h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          IOE Papers is a free resource for engineering students across Nepal. We collect and organize past year question papers from Tribhuvan University (TU), Pokhara University (PU), Kathmandu University (KU), and Purbanchal University (PoU).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['TU', 'PU', 'KU', 'PoU'].map(code => (
            <div key={code} className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="font-display font-bold text-2xl text-blue-700">{code}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-10">
          All papers are shared for educational purposes only. If you have papers to contribute, please contact the site administrator.
        </p>
      </div>
    </div>
  );
}
