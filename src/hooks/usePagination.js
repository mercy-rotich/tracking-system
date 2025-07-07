import { useState } from 'react';

export const usePagination = (initialPageSize = 20) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const updatePagination = (paginationData) => {
    if (paginationData) {
      setTotalElements(paginationData.totalElements || 0);
      setTotalPages(paginationData.totalPages || 0);
      setHasNext(paginationData.hasNext || false);
      setHasPrevious(paginationData.hasPrevious || false);
      
      // Update current page if provided
      if (paginationData.currentPage !== undefined) {
        setCurrentPage(paginationData.currentPage);
      }
      
      // Update page size if provided
      if (paginationData.pageSize !== undefined) {
        setPageSize(paginationData.pageSize);
      }
    }
  };

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (hasPrevious && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNext && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when page size changes
  };

  const resetPagination = () => {
    setCurrentPage(0);
    setTotalElements(0);
    setTotalPages(0);
    setHasNext(false);
    setHasPrevious(false);
  };

  // Force reset to first page (useful when filters change)
  const resetToFirstPage = () => {
    setCurrentPage(0);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    hasNext,
    hasPrevious,
    updatePagination,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    changePageSize,
    resetPagination,
    resetToFirstPage
  };
};