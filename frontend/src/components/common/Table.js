import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiSearch, FiDownload } from 'react-icons/fi';

const Table = ({
  columns,
  data,
  loading = false,
  pagination = true,
  pageSize = 10,
  totalItems,
  currentPage = 1,
  onPageChange,
  onSort,
  onSearch,
  onExport,
  selectable = false,
  onSelect,
  actions,
  emptyMessage = 'No data found',
  className = ''
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (onSort) {
      onSort(key, direction);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allIds = data.map(item => item.id);
      setSelectedRows(allIds);
      if (onSelect) {
        onSelect(allIds);
      }
    } else {
      setSelectedRows([]);
      if (onSelect) {
        onSelect([]);
      }
    }
  };

  // Handle row select
  const handleRowSelect = (id) => {
    let newSelectedRows = [...selectedRows];
    if (newSelectedRows.includes(id)) {
      newSelectedRows = newSelectedRows.filter(rowId => rowId !== id);
      setSelectAll(false);
    } else {
      newSelectedRows.push(id);
      if (newSelectedRows.length === data.length) {
        setSelectAll(true);
      }
    }
    setSelectedRows(newSelectedRows);
    if (onSelect) {
      onSelect(newSelectedRows);
    }
  };

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="sort-icon">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon">↑</span> : 
      <span className="sort-icon">↓</span>;
  };

  // Pagination component
  const Pagination = () => {
    const totalPages = Math.ceil((totalItems || data.length) / pageSize);
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems || data.length);

    return (
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {startItem} to {endItem} of {totalItems || data.length} entries
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>
          <span className="pagination-current">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight />
          </button>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <FiChevronsRight />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`table-wrapper ${className}`}>
      {/* Table Toolbar */}
      <div className="table-toolbar">
        {onSearch && (
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        )}
        {onExport && (
          <button className="export-btn" onClick={onExport}>
            <FiDownload /> Export
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="th-content">
                    {column.title}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="actions-col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="table-loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}>
                  <div className="table-empty">
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className={selectedRows.includes(row.id) ? 'selected' : ''}>
                  {selectable && (
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="actions-col">
                      <div className="action-buttons">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <Pagination />
      )}
    </div>
  );
};

// Styles
const styles = `
  .table-wrapper {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* Toolbar */
  .table-toolbar {
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .search-box {
    position: relative;
    flex: 1;
    max-width: 300px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }

  .search-input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .export-btn {
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }

  .export-btn:hover {
    background: #5a67d8;
    transform: translateY(-2px);
  }

  /* Table */
  .table-responsive {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .table thead {
    background: #f8f9fa;
  }

  .table th {
    padding: 15px 20px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
    white-space: nowrap;
  }

  .table th.sortable {
    cursor: pointer;
    user-select: none;
  }

  .table th.sortable:hover {
    background: #e9ecef;
  }

  .th-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sort-icon {
    font-size: 12px;
    color: #999;
  }

  .table td {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
    color: #666;
    font-size: 14px;
  }

  .table tbody tr:hover {
    background: #f8f9fa;
  }

  .table tbody tr.selected {
    background: #e8f0fe;
  }

  /* Checkbox column */
  .checkbox-col {
    width: 50px;
    text-align: center;
  }

  .checkbox-col input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  /* Actions column */
  .actions-col {
    width: 100px;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .action-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-btn.edit {
    background: #667eea;
    color: white;
  }

  .action-btn.edit:hover {
    background: #5a67d8;
  }

  .action-btn.delete {
    background: #dc3545;
    color: white;
  }

  .action-btn.delete:hover {
    background: #c82333;
  }

  .action-btn.view {
    background: #28a745;
    color: white;
  }

  .action-btn.view:hover {
    background: #218838;
  }

  /* Loading and empty states */
  .table-loading,
  .table-empty {
    padding: 40px;
    text-align: center;
    color: #999;
  }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Pagination */
  .table-pagination {
    padding: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .pagination-info {
    color: #666;
    font-size: 14px;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pagination-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .pagination-btn:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-current {
    padding: 0 10px;
    font-size: 14px;
    color: #666;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .table-wrapper {
      background: #2d3748;
    }

    .table-toolbar {
      border-bottom-color: #4a5568;
    }

    .search-input {
      background: #1a202c;
      border-color: #4a5568;
      color: #f7fafc;
    }

    .search-input::placeholder {
      color: #a0aec0;
    }

    .table thead {
      background: #1a202c;
    }

    .table th {
      color: #f7fafc;
    }

    .table th.sortable:hover {
      background: #4a5568;
    }

    .table td {
      border-top-color: #4a5568;
      color: #e2e8f0;
    }

    .table tbody tr:hover {
      background: #1a202c;
    }

    .table tbody tr.selected {
      background: #2a3a5a;
    }

    .pagination-btn {
      background: #1a202c;
      border-color: #4a5568;
      color: #e2e8f0;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .pagination-current {
      color: #e2e8f0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .table-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-box {
      max-width: none;
    }

    .table-pagination {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .pagination-info {
      margin-bottom: 10px;
    }

    .table th,
    .table td {
      padding: 12px 15px;
    }
  }
`;

export default Table;
