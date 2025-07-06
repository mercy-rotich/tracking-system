import React from 'react';

const Pagination = ({
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  isLoading
}) => {
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageSizeChange(newSize);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 0) {
      pages.push(
        <button
          key={0}
          onClick={() => onPageChange(0)}
          disabled={isLoading}
          className={`pagination-btn ${currentPage === 0 ? 'active' : ''}`}
        >
          1
        </button>
      );
      if (startPage > 1) {
        pages.push(
          <span key="ellipsis-start" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i + 1}
        </button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis-end" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={isLoading}
          className={`pagination-btn ${currentPage === totalPages - 1 ? 'active' : ''}`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (totalElements === 0) {
    return null;
  }

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startItem} to {endItem} of {totalElements} entries
        </span>
        <div className="pagination-page-size">
          <label htmlFor="pageSize">Show: </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={isLoading}
            className="pagination-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span> per page</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={onPreviousPage}
            disabled={!hasPrevious || isLoading}
            className="pagination-btn pagination-nav"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>

          <div className="pagination-pages">
            {renderPageNumbers()}
          </div>

          <button
            onClick={onNextPage}
            disabled={!hasNext || isLoading}
            className="pagination-btn pagination-nav"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;