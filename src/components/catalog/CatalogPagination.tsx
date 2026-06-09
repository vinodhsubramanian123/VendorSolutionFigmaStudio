import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogPaginationProps {
  filteredSkusLength: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
}

export function CatalogPagination({
  filteredSkusLength,
  currentPage,
  setCurrentPage,
  pageSize,
}: CatalogPaginationProps) {
  if (filteredSkusLength <= pageSize) return null;

  const totalPages = Math.ceil(filteredSkusLength / pageSize) || 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-surface-elevated border border-white/5 rounded-xl shrink-0 text-[10px] sm:text-xs">
      <span className="text-gray-400 font-medium">
        Showing{" "}
        <strong className="text-white font-bold">
          {Math.min(filteredSkusLength, (currentPage - 1) * pageSize + 1)}
          -{Math.min(filteredSkusLength, currentPage * pageSize)}
        </strong>{" "}
        of{" "}
        <strong className="text-white font-bold">{filteredSkusLength}</strong>{" "}
        catalog items
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          className="p-1.5 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center cursor-pointer ${
                isCurrent
                  ? "bg-indigo-500 text-white shadow shadow-indigo-500/25"
                  : "border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          className="p-1.5 rounded-lg border border-white/5 bg-black/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
