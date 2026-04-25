import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { universitiesAPI } from '../services/api';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export default function SearchBar({ filters, onChange, compact = false }) {
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    universitiesAPI.list().then(r => setUniversities(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.university_id) {
      universitiesAPI.getDepartments(filters.university_id)
        .then(r => setDepartments(r.data))
        .catch(() => setDepartments([]));
    } else {
      setDepartments([]);
    }
  }, [filters.university_id]);

  const handleChange = (key, value) => {
    const updates = { [key]: value };
    if (key === 'university_id') updates.department_id = '';
    onChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onChange({ search: '', university_id: '', department_id: '', semester: '', year: '' });
  };

  const hasActiveFilters = filters.university_id || filters.department_id || filters.semester || filters.year;

  const selectClass = "w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer hover:border-blue-300";

  return (
    <div className="w-full">
      {/* Search input */}
      <div className={`flex gap-2 ${compact ? '' : 'mb-3'}`}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 hover:border-blue-300"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-bold flex items-center justify-center">
              {[filters.university_id, filters.department_id, filters.semester, filters.year].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up">
          {/* University */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">University</label>
            <select value={filters.university_id || ''} onChange={(e) => handleChange('university_id', e.target.value)} className={selectClass}>
              <option value="">All Universities</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Department</label>
            <select value={filters.department_id || ''} onChange={(e) => handleChange('department_id', e.target.value)} className={selectClass} disabled={!filters.university_id}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Semester</label>
            <select value={filters.semester || ''} onChange={(e) => handleChange('semester', e.target.value)} className={selectClass}>
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>{s}{['st','nd','rd','th'][Math.min(s-1,3)]} Semester</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Year</label>
            <select value={filters.year || ''} onChange={(e) => handleChange('year', e.target.value)} className={selectClass}>
              <option value="">All Years</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="col-span-2 md:col-span-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <X size={12} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
