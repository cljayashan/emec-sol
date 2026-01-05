import React from 'react';
import Paginator from './Paginator';

/**
 * Reusable pagination filters component with items per page selector and optional search
 * This component should be placed BEFORE the data grid
 */
export const PaginationFilters = ({
  itemsPerPage,
  onItemsPerPageChange,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = false,
  itemsPerPageOptions = [10, 25, 50, 100],
  itemsPerPageLabel = 'Records per page:'
}) => {
  if (!showSearch && !onItemsPerPageChange) {
    return null;
  }

  return (
    <div style={{ 
      marginBottom: '20px', 
      display: 'flex', 
      gap: '15px', 
      alignItems: 'center', 
      flexWrap: 'wrap' 
    }}>
      {showSearch && onSearchChange && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ 
            padding: '8px', 
            width: '300px', 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        />
      )}
      
      {onItemsPerPageChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>
            {itemsPerPageLabel}
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable pagination controls component with items per page selector and optional search
 * This is a convenience component that combines PaginationFilters and Paginator
 * For more control, use PaginationFilters and Paginator separately
 * @param {Object} props
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Current items per page
 * @param {number} props.currentPage - Current page number
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onItemsPerPageChange - Callback when items per page changes
 * @param {string} props.searchTerm - Current search term (optional)
 * @param {Function} props.onSearchChange - Callback when search term changes (optional)
 * @param {string} props.searchPlaceholder - Placeholder text for search input (optional)
 * @param {boolean} props.showSearch - Whether to show search input (default: false)
 * @param {Array<number>} props.itemsPerPageOptions - Options for items per page selector (default: [10, 25, 50, 100])
 * @param {string} props.itemsPerPageLabel - Label for items per page selector (default: 'Records per page:')
 * @param {boolean} props.showPaginator - Whether to show paginator component (default: true)
 */
const PaginationControls = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = false,
  itemsPerPageOptions = [10, 25, 50, 100],
  itemsPerPageLabel = 'Records per page:',
  showPaginator = true
}) => {
  return (
    <>
      <PaginationFilters
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
        itemsPerPageOptions={itemsPerPageOptions}
        itemsPerPageLabel={itemsPerPageLabel}
      />
      {showPaginator && (
        <Paginator
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default PaginationControls;

