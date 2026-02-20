import React, { useState, useEffect } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiMoreHorizontal
} from 'react-icons/fi';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  showItemsInfo = true,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  size = 'medium',
  variant = 'outlined', // outlined, solid, minimal
  shape = 'rounded', // rounded, circle, square
  disabled = false,
  className = '',
  ...props
}) => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    generatePages();
  }, [currentPage, totalPages, siblingCount, boundaryCount]);

  const generatePages = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      setPages(Array.from({ length: totalPages }, (_, i) => i + 1));
      return;
    }

    const leftBound = boundaryCount + 1;
    const rightBound = totalPages - boundaryCount;
    const leftSibling = Math.max(currentPage - siblingCount, leftBound);
    const rightSibling = Math.min(currentPage + siblingCount, rightBound);

    const shouldShowLeftDots = leftSibling > leftBound;
    const shouldShowRightDots = rightSibling < rightBound;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from({ length: 2 * siblingCount + 3 }, (_, i) => i + 1);
      setPages([...leftRange, '...', totalPages]);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from(
        { length: 2 * siblingCount + 3 },
        (_, i) => totalPages - (2 * siblingCount + 2) + i
      );
      setPages([1, '...', ...rightRange]);
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSibling - leftSibling + 1 },
        (_, i) => leftSibling + i
      );
      setPages([1, '...', ...middleRange, '...', totalPages]);
    }
  };

  const handlePageChange = (page) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageSizeChange?.(newSize);
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(currentPage - 1);
  const handleNextPage = () => handlePageChange(currentPage + 1);
  const handleLastPage = () => handlePageChange(totalPages);

  // Size classes
  const sizeClasses = {
    small: 'pagination-small',
    medium: 'pagination-medium',
    large: 'pagination-large'
  };

  // Variant classes
  const variantClasses = {
    outlined: 'pagination-outlined',
    solid: 'pagination-solid',
    minimal: 'pagination-minimal'
  };

  // Shape classes
  const shapeClasses = {
    rounded: 'pagination-rounded',
    circle: 'pagination-circle',
    square: 'pagination-square'
  };

  // Calculate range
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  // Styles
  const styles = `
    .pagination-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .pagination-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    /* Size Variants */
    .pagination-small .pagination-item {
      min-width: 28px;
      height: 28px;
      font-size: var(--text-xs);
    }

    .pagination-medium .pagination-item {
      min-width: 36px;
      height: 36px;
      font-size: var(--text-sm);
    }

    .pagination-large .pagination-item {
      min-width: 44px;
      height: 44px;
      font-size: var(--text-base);
    }

    /* Variant Styles */
    .pagination-outlined .pagination-item {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-primary);
    }

    .pagination-outlined .pagination-item:hover:not(:disabled):not(.active) {
      background: var(--bg-tertiary);
      border-color: var(--primary);
    }

    .pagination-solid .pagination-item {
      background: var(--bg-primary);
      border: 1px solid transparent;
      color: var(--text-primary);
    }

    .pagination-solid .pagination-item:hover:not(:disabled):not(.active) {
      background: var(--bg-tertiary);
    }

    .pagination-minimal .pagination-item {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-primary);
    }

    .pagination-minimal .pagination-item:hover:not(:disabled):not(.active) {
      color: var(--primary);
      border-color: var(--primary);
    }

    /* Shape Styles */
    .pagination-rounded .pagination-item {
      border-radius: var(--radius-md);
    }

    .pagination-circle .pagination-item {
      border-radius: 50%;
    }

    .pagination-square .pagination-item {
      border-radius: 0;
    }

    /* Pagination Item */
    .pagination-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      user-select: none;
    }

    .pagination-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .pagination-item.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .pagination-item.active:hover {
      background: var(--primary-dark);
    }

    .pagination-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      color: var(--text-secondary);
    }

    /* Items Info */
    .pagination-info {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    /* Page Size Selector */
    .pagination-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination-size-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .pagination-size-select {
      padding: 4px 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--text-sm);
      cursor: pointer;
      outline: none;
    }

    .pagination-size-select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .pagination-size-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pagination-wrapper {
        gap: 2px;
      }

      .pagination-small .pagination-item {
        min-width: 24px;
        height: 24px;
      }

      .pagination-medium .pagination-item {
        min-width: 32px;
        height: 32px;
      }

      .pagination-large .pagination-item {
        min-width: 38px;
        height: 38px;
      }

      .pagination-info {
        font-size: var(--text-xs);
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .pagination-outlined .pagination-item {
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .pagination-outlined .pagination-item:hover:not(:disabled):not(.active) {
        background: var(--dark-bg-tertiary);
      }

      .pagination-solid .pagination-item {
        background: var(--dark-bg-secondary);
        color: var(--dark-text-primary);
      }

      .pagination-solid .pagination-item:hover:not(:disabled):not(.active) {
        background: var(--dark-bg-tertiary);
      }

      .pagination-minimal .pagination-item {
        color: var(--dark-text-primary);
      }

      .pagination-dots {
        color: var(--dark-text-muted);
      }

      .pagination-info {
        color: var(--dark-text-muted);
      }

      .pagination-size-select {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }

      .pagination-size-label {
        color: var(--dark-text-muted);
      }
    }

    /* Animation */
    .pagination-item {
      animation: fadeIn 0.3s var(--transition-ease);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`pagination-container ${className}`}>
        <div
          className={`
            pagination-wrapper
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${shapeClasses[shape]}
          `}
        >
          {/* First Page Button */}
          {showFirstLast && (
            <button
              className="pagination-item"
              onClick={handleFirstPage}
              disabled={disabled || currentPage === 1}
              title="First Page"
            >
              <FiChevronsLeft size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
            </button>
          )}

          {/* Previous Page Button */}
          {showPrevNext && (
            <button
              className="pagination-item"
              onClick={handlePrevPage}
              disabled={disabled || currentPage === 1}
              title="Previous Page"
            >
              <FiChevronLeft size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
            </button>
          )}

          {/* Page Numbers */}
          {pages.map((page, index) => (
            page === '...' ? (
              <span key={`dots-${index}`} className="pagination-dots">
                <FiMoreHorizontal size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-item ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                disabled={disabled}
              >
                {page}
              </button>
            )
          ))}

          {/* Next Page Button */}
          {showPrevNext && (
            <button
              className="pagination-item"
              onClick={handleNextPage}
              disabled={disabled || currentPage === totalPages}
              title="Next Page"
            >
              <FiChevronRight size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
            </button>
          )}

          {/* Last Page Button */}
          {showFirstLast && (
            <button
              className="pagination-item"
              onClick={handleLastPage}
              disabled={disabled || currentPage === totalPages}
              title="Last Page"
            >
              <FiChevronsRight size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
            </button>
          )}
        </div>

        {/* Items Info */}
        {showItemsInfo && totalItems > 0 && (
          <div className="pagination-info">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
        )}

        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <div className="pagination-size-selector">
            <span className="pagination-size-label">Show:</span>
            <select
              className="pagination-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={disabled}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};

// Simple Pagination Component (for small datasets)
export const SimplePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  ...props
}) => {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showFirstLast={false}
      showItemsInfo={false}
      showPageSize={false}
      siblingCount={0}
      boundaryCount={0}
      {...props}
    />
  );
};

// Compact Pagination Component
export const CompactPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  ...props
}) => {
  const styles = `
    .compact-pagination {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .compact-pagination-info {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .compact-pagination-controls {
      display: flex;
      gap: 4px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="compact-pagination">
        <span className="compact-pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <div className="compact-pagination-controls">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showFirstLast={false}
            showItemsInfo={false}
            showPageSize={false}
            siblingCount={0}
            boundaryCount={0}
            {...props}
          />
        </div>
      </div>
    </>
  );
};

// Infinite Scroll Pagination Component (for infinite loading)
export const InfinitePagination = ({
  hasMore,
  onLoadMore,
  loading = false,
  threshold = 100,
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading || loading) return;

      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop <= clientHeight + threshold) {
        setIsLoading(true);
        onLoadMore?.();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, loading, threshold, onLoadMore]);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const styles = `
    .infinite-pagination {
      width: 100%;
    }

    .infinite-pagination-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .infinite-pagination-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .infinite-pagination-end {
      text-align: center;
      padding: 20px;
      color: var(--text-secondary);
      font-size: var(--text-sm);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div ref={scrollRef} className="infinite-pagination">
        {children}
        {(isLoading || loading) && (
          <div className="infinite-pagination-loader">
            <div className="infinite-pagination-spinner" />
          </div>
        )}
        {!hasMore && (
          <div className="infinite-pagination-end">
            No more items to load
          </div>
        )}
      </div>
    </>
  );
};

// Table Pagination Component
export const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  ...props
}) => {
  const styles = `
    .table-pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      padding: 16px;
      background: var(--bg-primary);
      border-top: 1px solid var(--border);
    }

    .table-pagination-info {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .table-pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-pagination-size {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-pagination-select {
      padding: 4px 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    @media (max-width: 768px) {
      .table-pagination {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .table-pagination-controls {
        justify-content: center;
      }

      .table-pagination-size {
        justify-content: center;
      }
    }

    @media (prefers-color-scheme: dark) {
      .table-pagination {
        background: var(--dark-bg-secondary);
        border-top-color: var(--dark-border);
      }

      .table-pagination-info {
        color: var(--dark-text-muted);
      }

      .table-pagination-select {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="table-pagination">
        <div className="table-pagination-info">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>

        <div className="table-pagination-controls">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showFirstLast={false}
            showItemsInfo={false}
            showPageSize={false}
            size="small"
            variant="minimal"
            {...props}
          />
        </div>

        {onPageSizeChange && (
          <div className="table-pagination-size">
            <span>Show</span>
            <select
              className="table-pagination-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
};

export default Pagination;
