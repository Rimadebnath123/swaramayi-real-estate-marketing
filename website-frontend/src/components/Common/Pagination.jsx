import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) items.push('...');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push('...');
    items.push(totalPages);
    return items;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gold-500 hover:text-navy-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors ${
              currentPage === page
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gold-500/20'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gold-500 hover:text-navy-900 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
