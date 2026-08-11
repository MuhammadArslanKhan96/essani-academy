import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: '#FFFFFF',
      borderTop: '1px solid #EDF2F7',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--card-subtext)', fontWeight: 600 }}>
        Showing <span style={{ color: 'var(--bg-purple-main)', fontWeight: 800 }}>{startItem}</span> to{' '}
        <span style={{ color: 'var(--bg-purple-main)', fontWeight: 800 }}>{endItem}</span> of{' '}
        <span style={{ color: '#D4AF37', fontWeight: 800 }}>{totalItems}</span> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E0',
            background: currentPage === 1 ? '#F7FAFC' : '#FFFFFF',
            color: currentPage === 1 ? '#A0AEC0' : 'var(--bg-purple-main)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: currentPage === page ? '1px solid var(--gold-primary)' : '1px solid #CBD5E0',
              background: currentPage === page ? 'var(--bg-purple-main)' : '#FFFFFF',
              color: currentPage === page ? '#FFD700' : '#4A5568',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E0',
            background: currentPage >= totalPages ? '#F7FAFC' : '#FFFFFF',
            color: currentPage >= totalPages ? '#A0AEC0' : 'var(--bg-purple-main)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 700,
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
