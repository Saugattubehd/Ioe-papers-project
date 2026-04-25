import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { papersAPI } from '../services/api';

export default function PDFPreviewModal({ paper, onClose }) {
  const [zoom, setZoom] = useState(100);
  const previewUrl = papersAPI.previewUrl(paper.id);

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
    <div className="pdf-preview-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xs font-bold">PDF</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate">{paper.title}</h3>
              <p className="text-xs text-slate-500 truncate">
                {paper.university_code} · {paper.department_name} · {paper.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 25))}
                className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-slate-600 font-mono w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(200, z + 25))}
                className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <ExternalLink size={13} />
              Open
            </a>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="flex-1 overflow-auto bg-slate-200 flex items-start justify-center p-4">
          <div style={{ width: `${zoom}%`, minWidth: '300px', maxWidth: '100%', transition: 'width 0.2s ease' }}>
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full rounded-lg shadow-lg"
              style={{ height: 'calc(92vh - 120px)', minHeight: '400px' }}
              title={paper.title}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
