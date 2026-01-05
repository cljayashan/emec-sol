import { useState, useEffect } from 'react';

/**
 * Reusable hook for table pagination with search and items per page functionality
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialItemsPerPage - Initial items per page (default: 10)
 * @param {string} options.initialSearchTerm - Initial search term (default: '')
 * @param {boolean} options.enableSearch - Whether to enable search functionality (default: true)
 * @returns {Object} Pagination state and handlers
 */
export const useTablePagination = ({
  initialPage = 1,
  initialItemsPerPage = 10,
  initialSearchTerm = '',
  enableSearch = true
} = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [totalItems, setTotalItems] = useState(0);

  // Reset to page 1 when search term or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  const handleSearchChange = (newSearchTerm) => {
    if (enableSearch) {
      setSearchTerm(newSearchTerm);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setSearchTerm('');
  };

  return {
    // State
    currentPage,
    itemsPerPage,
    searchTerm,
    totalItems,
    
    // Setters
    setCurrentPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
    setSearchTerm: handleSearchChange,
    setTotalItems,
    
    // Helpers
    resetPagination,
    
    // Computed values
    totalPages: Math.ceil(totalItems / itemsPerPage),
    offset: (currentPage - 1) * itemsPerPage
  };
};

