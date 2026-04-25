import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Loader2, Frown, ChevronLeft, ChevronRight } from 'lucide-react';
import PaperCard from '../components/PaperCard';
import SearchBar from '../components/SearchBar';
import PDFPreviewModal from '../components/PDFPreviewModal';
import { papersAPI, universitiesAPI } from '../services/api';

export default function PapersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [universities, setUniversities] = useState([]);

  // Build filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    university_id: searchParams.get('university_id') || '',
    department_id: searchParams.get('department_id') || '',
    semester: searchParams.get('semester') || '',
    year: searchParams.get('year') || '',
  });

  // Handle uni code from homepage shortcut
  useEffect(() => {
    const uniCode = searchParams.get('uni');
    if (uniCode) {
      universitiesAPI.list().then(r => {
        const uni = r.data.find(u => u.code === uniCode);
        if (uni) {
          setFilters(f => ({ ...f, university_id: uni.id }));
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    universitiesAPI.list().then(r => setUniversities(r.data)).catch(() => {});
  }, []);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 18 };
      if (filters.search) params.search = filters.search;
      if (filters.university_id) params.university_id = filters.university_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.semester) params.semester = filters.semester;
      if (filters.year) params.year = filters.year;

      const res = await papersAPI.list(params);
      setPapers(res.data.papers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Sync filters to URL
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.university_id) params.university_id = filters.university_id;
    if (filters.department_id) params.department_id = filters.department_id;
    if (filters.semester) params.semester = filters.semester;
    if (filters.year) params.year = filters.year;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [filters]);

  const getActiveUniversityName = () => {
    if (!filters.university_id) return null;
    const u = universities.find(u => u.id === filters.university_id);
    return u ? `${u.code} — ${u.name}` : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar filters={filters} onChange={setFilters} compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">
              {getActiveUniversityName() || 'All Papers'}
            </h1>
            {!loading && (
              <p className="text-slate-500 text-sm mt-0.5">
                {total.toLocaleString()} paper{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Papers Grid */}
        {!loading && papers.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Frown size={28} className="text-slate-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-700 text-lg mb-2">No papers found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {papers.map((paper, i) => (
              <div key={paper.id} className="animate-fade-up" style={{ animationDelay: `${(i % 18) * 30}ms` }}>
                <PaperCard paper={paper} onPreview={setPreviewPaper} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewPaper && (
        <PDFPreviewModal paper={previewPaper} onClose={() => setPreviewPaper(null)} />
      )}
    </div>
  );
}
