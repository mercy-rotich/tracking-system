import { useState } from 'react';

export const usePagination = (initialPageSize = 20) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const updatePagination = (paginationData) => {
    console.log('🔄 Updating pagination with:', paginationData);
    if (paginationData) {
      setTotalElements(paginationData.totalElements || 0);
      setTotalPages(paginationData.totalPages || 0);
      setHasNext(paginationData.hasNext || false);
      setHasPrevious(paginationData.hasPrevious || false);
      
      
      if (paginationData.currentPage !== undefined) {
        setCurrentPage(paginationData.currentPage);
      }
      
    
      if (paginationData.pageSize !== undefined) {
        setPageSize(paginationData.pageSize);
      }
    }
  };

  const goToPage = (page) => {
    console.log('🔄 Going to page:', page);
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    console.log('🔄 Going to previous page, current:', currentPage);
    if (hasPrevious && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    console.log('🔄 Going to next page, current:', currentPage);
    if (hasNext && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const changePageSize = (newSize) => {
    console.log('🔄 Changing page size to:', newSize);
    setPageSize(newSize);
    setCurrentPage(0); 
  };

  const resetPagination = () => {
    console.log('🔄 Resetting pagination');
    setCurrentPage(0);
    setTotalElements(0);
    setTotalPages(0);
    setHasNext(false);
    setHasPrevious(false);
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
    resetPagination
  };
};