import React from 'react';
import { FileText, Download, Eye, Calendar, BookOpen, Building2 } from 'lucide-react';
import { papersAPI } from '../services/api';

export default function PaperCard({ paper, onPreview }) {
  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const semesterLabel = (s) => {
    if (!s) return null;
    const suffix = ['st','nd','rd','th'][Math.min(s - 1, 3)];
    return `${s}${suffix} Semester`;
  };

  const handleDownload = () => {
    const url = papersAPI.downloadUrl(paper.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = paper.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-blue-600 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-blue-800 transition-colors">
              {paper.title}
            </h3>
            {paper.subject_name && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{paper.subject_name}</p>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
            {paper.university_code}
          </span>
          {paper.semester && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              {semesterLabel(paper.semester)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Calendar size={10} />
            {paper.year}
          </span>
        </div>

        {/* Department */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-slate-500">
          <Building2 size={12} />
          <span className="truncate">{paper.department_name}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Download size={12} />
            <span>{paper.download_count || 0} downloads</span>
            {paper.file_size && (
              <span className="ml-1 text-slate-300">· {formatSize(paper.file_size)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreview(paper)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200 hover:border-blue-300"
            >
              <Eye size={13} />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download size={13} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
