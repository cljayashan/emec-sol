import React from 'react';

const Paginator = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      pages.push('...');
    }
  }

  return (
    <div style={{ display: 'flex', gap: '5px', marginTop: '20px', justifyContent: 'center', alignItems: 'center' }}>
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span>...</span>
          ) : (
            <button
              className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
      
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      
      <span style={{ marginLeft: '10px' }}>
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
    </div>
  );
};

export default Paginator;

