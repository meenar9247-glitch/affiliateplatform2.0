import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiUser,
  FiUserPlus,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCalendar,
  FiAward,
  FiStar,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiZoomIn,
  FiZoomOut,
  FiMove,
  FiMaximize2,
  FiMinimize2,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiGrid,
  FiList
} from 'react-icons/fi';

const ReferralTree = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree, list, grid
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    deepestLevel: 0,
    averagePerLevel: 0,
    topReferrer: null
  });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchTreeData();
  }, []);

  useEffect(() => {
    if (treeData && viewMode === 'tree') {
      drawTree();
    }
  }, [treeData, zoom, position, selectedNode, viewMode]);

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/tree`
      );
      
      if (response.data.success) {
        setTreeData(response.data.tree);
        setStats(response.data.stats);
        // Expand first few levels by default
        expandInitialLevels(response.data.tree);
      }
    } catch (error) {
      toast.error('Failed to fetch referral tree');
    } finally {
      setLoading(false);
    }
  };

  const expandInitialLevels = (node, level = 0, maxLevels = 2) => {
    if (level < maxLevels) {
      setExpandedNodes(prev => new Set([...prev, node.id]));
      node.children?.forEach(child => expandInitialLevels(child, level + 1, maxLevels));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTreeData();
    setRefreshing(false);
    toast.success('Tree refreshed');
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/referrals/tree/export`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `referral-tree.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Tree exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export tree');
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const toggleNodeExpand = (nodeId, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      setDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas || !treeData) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(zoom, zoom);

    // Draw tree starting from root
    const startX = width / 2 / zoom - position.x / zoom;
    const startY = 50;
    drawNode(ctx, treeData, startX, startY, 0);

    ctx.restore();
  };

  const drawNode = (ctx, node, x, y, level) => {
    const nodeWidth = 120;
    const nodeHeight = 60;
    const horizontalSpacing = 180;
    const verticalSpacing = 100;

    // Draw node
    ctx.fillStyle = selectedNode?.id === node.id ? '#667eea20' : '#ffffff';
    ctx.strokeStyle = selectedNode?.id === node.id ? '#667eea' : '#e9ecef';
    ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - nodeWidth/2, y - nodeHeight/2, nodeWidth, nodeHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Node content
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, x, y - 8);

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`$${node.earnings}`, x, y + 10);

    // Status indicator
    ctx.beginPath();
    ctx.arc(x + nodeWidth/2 - 15, y - nodeHeight/2 + 15, 5, 0, 2 * Math.PI);
    ctx.fillStyle = node.isActive ? '#28a745' : '#dc3545';
    ctx.fill();

    // Draw children
    if (expandedNodes.has(node.id) && node.children && node.children.length > 0) {
      const childrenCount = node.children.length;
      const startChildX = x - ((childrenCount - 1) * horizontalSpacing) / 2;

      node.children.forEach((child, index) => {
        const childX = startChildX + index * horizontalSpacing;
        const childY = y + verticalSpacing;

        // Draw connector line
        ctx.beginPath();
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.moveTo(x, y + nodeHeight/2);
        ctx.lineTo(childX, childY - nodeHeight/2);
        ctx.stroke();

        // Draw child node
        drawNode(ctx, child, childX, childY, level + 1);
      });
    }

    // Expand/collapse button
    if (node.children && node.children.length > 0) {
      ctx.beginPath();
      ctx.arc(x + nodeWidth/2 - 20, y + nodeHeight/2 - 15, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8f9fa';
      ctx.fill();
      ctx.strokeStyle = '#e9ecef';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(expandedNodes.has(node.id) ? '-' : '+', x + nodeWidth/2 - 20, y + nodeHeight/2 - 15);
    }
  };

  // Helper function for rounded rectangle
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
  };

  // TreeNode Component for List/Grid view
  const TreeNode = ({ node, depth = 0 }) => (
    <div className={`tree-node depth-${depth}`} onClick={() => handleNodeClick(node)}>
      <div className="node-avatar">
        {node.avatar || node.name.charAt(0)}
      </div>
      <div className="node-info">
        <div className="node-name">
          {node.name}
          {depth > 0 && <span className="node-depth">Level {depth}</span>}
        </div>
        <div className="node-meta">
          <span className="node-email">{node.email}</span>
          <span className="node-date">Joined {new Date(node.joinedAt).toLocaleDateString()}</span>
        </div>
        <div className="node-stats">
          <span className="stat-item">
            <FiDollarSign /> ${node.earnings}
          </span>
          <span className="stat-item">
            <FiUsers /> {node.children?.length || 0} referrals
          </span>
          <span className={`stat-item status ${node.isActive ? 'active' : 'inactive'}`}>
            {node.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <button
          className="expand-btn"
          onClick={(e) => toggleNodeExpand(node.id, e)}
        >
          {expandedNodes.has(node.id) ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      )}
      {expandedNodes.has(node.id) && node.children && (
        <div className="node-children">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  // Stats Card Component
  const StatsCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  // Styles
  const styles = `
    .referral-tree-page {
      padding: 20px;
      height: calc(100vh - 80px);
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left h1 {
      margin: 0 0 4px;
      font-size: 24px;
      color: var(--text-primary);
    }

    .header-left p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .header-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      width: 250px;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-disabled);
    }

    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      cursor: pointer;
    }

    .view-toggle {
      display: flex;
      gap: 4px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .view-btn {
      padding: 8px 12px;
      border: none;
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .view-btn.active {
      background: var(--primary);
      color: white;
    }

    .action-btn {
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .action-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--primary-50);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .stat-content h3 {
      margin: 0 0 4px;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: var(--font-normal);
    }

    .stat-value {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: var(--font-bold);
      color: var(--text-primary);
    }

    .stat-subtitle {
      margin: 0;
      font-size: 11px;
      color: var(--text-disabled);
    }

    /* Tree Container */
    .tree-container {
      flex: 1;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      position: relative;
      border: 1px solid var(--border);
    }

    .tree-canvas {
      width: 100%;
      height: 100%;
      cursor: grab;
    }

    .tree-canvas:active {
      cursor: grabbing;
    }

    .tree-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }

    .tree-control-btn {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
      box-shadow: var(--shadow-md);
    }

    .tree-control-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    /* List View */
    .tree-list {
      padding: 20px;
      overflow-y: auto;
      height: 100%;
    }

    .tree-node {
      position: relative;
      display: flex;
      align-items: center;
      padding: 12px;
      margin: 4px 0;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .tree-node:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
    }

    .tree-node.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .node-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
      margin-right: 12px;
    }

    .node-info {
      flex: 1;
    }

    .node-name {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .node-depth {
      font-size: 11px;
      color: var(--text-disabled);
    }

    .node-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-disabled);
      margin-bottom: 4px;
    }

    .node-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-secondary);
    }

    .stat-item.status.active {
      color: var(--success);
    }

    .stat-item.status.inactive {
      color: var(--danger);
    }

    .expand-btn {
      padding: 4px;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 16px;
    }

    .node-children {
      margin-left: 52px;
      margin-top: 8px;
    }

    .depth-1 {
      margin-left: 20px;
    }

    .depth-2 {
      margin-left: 40px;
    }

    .depth-3 {
      margin-left: 60px;
    }

    .depth-4 {
      margin-left: 80px;
    }

    .depth-5 {
      margin-left: 100px;
    }

    /* Grid View */
    .tree-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      padding: 20px;
      overflow-y: auto;
      height: 100%;
    }

    .grid-node {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .grid-node:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }

    .grid-node.selected {
      border-color: var(--primary);
      background: var(--primary-50);
    }

    .grid-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .grid-avatar {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
      font-size: 18px;
    }

    .grid-name {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .grid-email {
      font-size: 12px;
      color: var(--text-disabled);
    }

    .grid-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 12px 0;
    }

    .grid-stat {
      text-align: center;
    }

    .grid-stat-label {
      font-size: 11px;
      color: var(--text-disabled);
      margin-bottom: 2px;
    }

    .grid-stat-value {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .grid-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--text-disabled);
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    .grid-children {
      color: var(--primary);
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--primary);
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

    /* Node Details Panel */
    .node-details-panel {
      position: fixed;
      right: 20px;
      top: 100px;
      width: 300px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      padding: 20px;
      z-index: 100;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items:center;
      margin-bottom: 16px;
    }

    .panel-header h3 {
      margin: 0;
      color: var(--text-primary);
    }

    .panel-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 18px;
    }

    .panel-avatar {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
      font-size: 24px;
      margin: 0 auto 16px;
    }

    .panel-info {
      text-align: center;
      margin-bottom: 16px;
    }

    .panel-name {
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .panel-email {
      font-size: 12px;
      color: var(--text-disabled);
      margin-bottom: 4px;
    }

    .panel-level {
      font-size: 12px;
      color: var(--primary);
    }

    .panel-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .panel-stat {
      text-align: center;
    }

    .panel-stat-label {
      font-size: 11px;
      color: var(--text-disabled);
      margin-bottom: 2px;
    }

    .panel-stat-value {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
    }

    .panel-actions {
      display: flex;
      gap: 8px;
    }

    .panel-btn {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 12px;
    }

    .panel-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .stat-card,
      .tree-container,
      .tree-node,
      .grid-node,
      .node-details-panel {
        background: var(--dark-bg-secondary);
      }

      .stat-content h3 {
        color: var(--dark-text-muted);
      }

      .stat-value {
        color: var(--dark-text-primary);
      }

      .node-name {
        color: var(--dark-text-primary);
      }

      .node-meta {
        color: var(--dark-text-muted);
      }

      .stat-item {
        color: var(--dark-text-secondary);
      }

      .grid-stat-label {
        color: var(--dark-text-muted);
      }

      .grid-stat-value {
        color: var(--dark-text-primary);
      }

      .grid-footer {
        border-top-color: var(--dark-border);
      }

      .search-box input,
      .filter-select,
      .view-btn,
      .action-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .view-btn.active {
        background: var(--dark-primary);
        color: white;
      }

      .action-btn:hover {
        background: var(--dark-bg-secondary);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .header-right {
        width: 100%;
      }

      .search-box {
        width: 100%;
      }

      .node-details-panel {
        left: 20px;
        right: 20px;
        width: auto;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading referral tree...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="referral-tree-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>Referral Tree</h1>
            <p>Visualize your referral network</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4+</option>
            </select>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode('tree')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
            <button className="action-btn" onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="action-btn" onClick={() => handleExport('png')}>
              <FiDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={FiUsers}
            title="Total Referrals"
            value={stats.totalReferrals}
            subtitle={`${stats.activeReferrals} active`}
          />
          <StatsCard
            icon={FiDollarSign}
            title="Total Earnings"
            value={`$${stats.totalEarnings}`}
          />
          <StatsCard
            icon={FiTrendingUp}
            title="Deepest Level"
            value={`Level ${stats.deepestLevel}`}
          />
          <StatsCard
            icon={FiAward}
            title="Top Referrer"
            value={stats.topReferrer?.name || 'N/A'}
            subtitle={`${stats.topReferrer?.count || 0} referrals`}
          />
        </div>

        {/* Tree Container */}
        <div className="tree-container" ref={containerRef}>
          {viewMode === 'tree' && (
            <>
              <canvas
                ref={canvasRef}
                className="tree-canvas"
                width={containerRef.current?.clientWidth || 800}
                height={containerRef.current?.clientHeight || 600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="tree-controls">
                <button className="tree-control-btn" onClick={handleZoomIn}>
                  <FiZoomIn />
                </button>
                <button className="tree-control-btn" onClick={handleZoomOut}>
                  <FiZoomOut />
                </button>
                <button className="tree-control-btn" onClick={handleReset}>
                  <FiMaximize2 />
                </button>
              </div>
            </>
          )}

          {viewMode === 'list' && (
            <div className="tree-list">
              <TreeNode node={treeData} depth={0} />
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="tree-grid">
              {treeData && (
                <>
                  <div
                    className={`grid-node ${selectedNode?.id === treeData.id ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(treeData)}
                  >
                    <div className="grid-header">
                      <div className="grid-avatar">
                        {treeData.avatar || treeData.name.charAt(0)}
                      </div>
                      <div>
                        <div className="grid-name">{treeData.name}</div>
                        <div className="grid-email">{treeData.email}</div>
                      </div>
                    </div>
                    <div className="grid-stats">
                      <div className="grid-stat">
                        <div className="grid-stat-label">Earnings</div>
                        <div className="grid-stat-value">${treeData.earnings}</div>
                      </div>
                      <div className="grid-stat">
                        <div className="grid-stat-label">Referrals</div>
                        <div className="grid-stat-value">{treeData.children?.length || 0}</div>
                      </div>
                    </div>
                    <div className="grid-footer">
                      <span className="grid-level">Level 0 (You)</span>
                      <span className={`grid-status ${treeData.isActive ? 'active' : 'inactive'}`}>
                        {treeData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {treeData.children?.map((child, index) => (
                    <div
                      key={child.id}
                      className={`grid-node ${selectedNode?.id === child.id ? 'selected' : ''}`}
                      onClick={() => handleNodeClick(child)}
                    >
                      <div className="grid-header">
                        <div className="grid-avatar">
                          {child.avatar || child.name.charAt(0)}
                        </div>
                        <div>
                          <div className="grid-name">{child.name}</div>
                          <div className="grid-email">{child.email}</div>
                        </div>
                      </div>
                      <div className="grid-stats">
                        <div className="grid-stat">
                          <div className="grid-stat-label">Earnings</div>
                          <div className="grid-stat-value">${child.earnings}</div>
                        </div>
                        <div className="grid-stat">
                          <div className="grid-stat-label">Referrals</div>
                          <div className="grid-stat-value">{child.children?.length || 0}</div>
                        </div>
                      </div>
                      <div className="grid-footer">
                        <span className="grid-level">Level 1</span>
                        <span className={`grid-status ${child.isActive ? 'active' : 'inactive'}`}>
                          {child.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="node-details-panel">
            <div className="panel-header">
              <h3>Referral Details</h3>
              <button className="panel-close" onClick={() => setSelectedNode(null)}>
                ×
              </button>
            </div>
            <div className="panel-avatar">
              {selectedNode.avatar || selectedNode.name.charAt(0)}
            </div>
            <div className="panel-info">
              <div className="panel-name">{selectedNode.name}</div>
              <div className="panel-email">{selectedNode.email}</div>
              <div className="panel-level">
                Level {selectedNode.level || 0} • Joined {new Date(selectedNode.joinedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="panel-stats">
              <div className="panel-stat">
                <div className="panel-stat-label">Earnings</div>
                <div className="panel-stat-value">${selectedNode.earnings}</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-label">Referrals</div>
                <div className="panel-stat-value">{selectedNode.children?.length || 0}</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-label">Clicks</div>
                <div className="panel-stat-value">{selectedNode.clicks || 0}</div>
              </div>
              <div className="panel-stat">
                <div className="panel-stat-label">Conv. Rate</div>
                <div className="panel-stat-value">{selectedNode.conversionRate || 0}%</div>
              </div>
            </div>
            <div className="panel-actions">
              <button className="panel-btn">
                <FiEye /> View Profile
              </button>
              <button className="panel-btn">
                <FiMail /> Message
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReferralTree;
