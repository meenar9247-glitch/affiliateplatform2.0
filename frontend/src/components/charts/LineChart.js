import React, { useEffect, useRef, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiMinimize2,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const LineChart = ({
  data = [],
  width = '100%',
  height = 400,
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  series = [],
  colors = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8'],
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showZoom = true,
  showDownload = true,
  showRefresh = true,
  showFullscreen = true,
  animate = true,
  animationDuration = 1000,
  curved = true,
  fill = false,
  fillOpacity = 0.1,
  strokeWidth = 2,
  pointSize = 4,
  pointHoverSize = 6,
  xAxisTickCount = 5,
  yAxisTickCount = 5,
  margin = { top: 40, right: 40, bottom: 40, left: 60 },
  onDataPointClick,
  onSeriesClick,
  className = '',
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: containerWidth - margin.left - margin.right,
          height: height - margin.top - margin.bottom
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height, margin]);

  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      drawChart();
    }
  }, [data, dimensions, zoomLevel, panOffset, hoveredPoint]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = dimensions.width + margin.left + margin.right;
    canvas.height = dimensions.height + margin.top + margin.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate scales
    const xScale = dimensions.width / (data.length - 1);
    const yValues = data.flatMap(d => 
      series.map(s => d[s.key] || 0)
    );
    const minY = Math.min(0, ...yValues);
    const maxY = Math.max(...yValues);
    const yRange = maxY - minY;
    const yScale = dimensions.height / (yRange || 1);
    
    // Draw grid
    if (showGrid) {
      drawGrid(ctx, xScale, yScale, minY);
    }
    
    // Draw axes
    drawAxes(ctx, minY, maxY);
    
    // Draw series
    series.forEach((s, index) => {
      drawSeries(ctx, s, index, xScale, yScale, minY);
    });
    
    // Draw points
    if (pointSize > 0) {
      series.forEach((s, index) => {
        drawPoints(ctx, s, index, xScale, yScale, minY);
      });
    }
    
    // Draw hover point
    if (hoveredPoint) {
      drawHoverPoint(ctx, hoveredPoint, xScale, yScale, minY);
    }
    
    // Draw labels
    drawLabels(ctx, minY, maxY);
  };

  const drawGrid = (ctx, xScale, yScale, minY) => {
    ctx.beginPath();
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = margin.left + i * xScale + xScale / 2;
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + dimensions.height);
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= yAxisTickCount; i++) {
      const y = margin.top + (dimensions.height / yAxisTickCount) * i;
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + dimensions.width, y);
    }
    
    ctx.stroke();
  };

  const drawAxes = (ctx, minY, maxY) => {
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.moveTo(margin.left, margin.top + dimensions.height);
    ctx.lineTo(margin.left + dimensions.width, margin.top + dimensions.height);
    
    // Y-axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + dimensions.height);
    
    ctx.stroke();
  };

  const drawSeries = (ctx, series, index, xScale, yScale, minY) => {
    if (data.length === 0) return;
    
    ctx.beginPath();
    ctx.strokeStyle = colors[index % colors.length];
    ctx.lineWidth = strokeWidth;
    
    if (curved) {
      // Draw curved line
      const points = data.map((d, i) => ({
        x: margin.left + i * xScale + xScale / 2,
        y: margin.top + dimensions.height - (d[series.key] - minY) * yScale
      }));
      
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    } else {
      // Draw straight line
      data.forEach((d, i) => {
        const x = margin.left + i * xScale + xScale / 2;
        const y = margin.top + dimensions.height - (d[series.key] - minY) * yScale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    }
    
    ctx.stroke();
    
    // Fill area under the line
    if (fill) {
      ctx.beginPath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.globalAlpha = fillOpacity;
      
      data.forEach((d, i) => {
        const x = margin.left + i * xScale + xScale / 2;
        const y = margin.top + dimensions.height - (d[series.key] - minY) * yScale;
        
        if (i === 0) {
          ctx.moveTo(x, margin.top + dimensions.height);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.lineTo(
        margin.left + (data.length - 1) * xScale + xScale / 2,
        margin.top + dimensions.height
      );
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  const drawPoints = (ctx, series, index, xScale, yScale, minY) => {
    data.forEach((d, i) => {
      const x = margin.left + i * xScale + xScale / 2;
      const y = margin.top + dimensions.height - (d[series.key] - minY) * yScale;
      
      ctx.beginPath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.arc(x, y, pointSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Add white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawHoverPoint = (ctx, point, xScale, yScale, minY) => {
    const { seriesIndex, dataIndex } = point;
    const x = margin.left + dataIndex * xScale + xScale / 2;
    const y = margin.top + dimensions.height - (data[dataIndex][series[seriesIndex].key] - minY) * yScale;
    
    // Draw outer glow
    ctx.beginPath();
    ctx.fillStyle = colors[seriesIndex % colors.length];
    ctx.globalAlpha = 0.2;
    ctx.arc(x, y, pointHoverSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw point
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.fillStyle = colors[seriesIndex % colors.length];
    ctx.arc(x, y, pointHoverSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw white border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw tooltip
    drawTooltip(ctx, point, x, y);
  };

  const drawTooltip = (ctx, point, x, y) => {
    const { seriesIndex, dataIndex } = point;
    const value = data[dataIndex][series[seriesIndex].key];
    const label = data[dataIndex].label || `Point ${dataIndex + 1}`;
    const seriesName = series[seriesIndex].name || `Series ${seriesIndex + 1}`;
    
    const tooltipText = `${seriesName}: ${value}`;
    const metrics = ctx.measureText(tooltipText);
    const tooltipWidth = metrics.width + 20;
    const tooltipHeight = 30;
    
    let tooltipX = x - tooltipWidth / 2;
    let tooltipY = y - tooltipHeight - 20;
    
    // Keep tooltip within canvas
    if (tooltipX < margin.left) tooltipX = margin.left;
    if (tooltipX + tooltipWidth > margin.left + dimensions.width) {
      tooltipX = margin.left + dimensions.width - tooltipWidth;
    }
    if (tooltipY < margin.top) tooltipY = y + 20;
    
    // Draw tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
    ctx.fill();
    
    // Draw tooltip text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tooltipText, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);
  };

  const drawLabels = (ctx, minY, maxY) => {
    // X-axis labels
    ctx.fillStyle = '#999';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    const xLabelStep = Math.max(1, Math.floor(data.length / xAxisTickCount));
    
    data.forEach((d, i) => {
      if (i % xLabelStep === 0 || i === data.length - 1) {
        const x = margin.left + i * (dimensions.width / (data.length - 1));
        ctx.fillText(d.label || i + 1, x, margin.top + dimensions.height + 20);
      }
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= yAxisTickCount; i++) {
      const value = minY + (maxY - minY) * (i / yAxisTickCount);
      const y = margin.top + dimensions.height - (dimensions.height / yAxisTickCount) * i;
      ctx.fillText(value.toFixed(1), margin.left - 10, y + 4);
    }
    
    // Axis labels
    if (xAxisLabel) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        xAxisLabel,
        margin.left + dimensions.width / 2,
        margin.top + dimensions.height + 40
      );
    }
    
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(margin.left - 40, margin.top + dimensions.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#666';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if hovering over a point
    const xScale = dimensions.width / (data.length - 1);
    const yValues = data.flatMap(d => 
      series.map(s => d[s.key] || 0)
    );
    const minY = Math.min(0, ...yValues);
    const maxY = Math.max(...yValues);
    const yScale = dimensions.height / (maxY - minY || 1);
    
    for (let sIndex = 0; sIndex < series.length; sIndex++) {
      for (let dIndex = 0; dIndex < data.length; dIndex++) {
        const pointX = margin.left + dIndex * xScale + xScale / 2;
        const pointY = margin.top + dimensions.height - (data[dIndex][series[sIndex].key] - minY) * yScale;
        
        const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
        
        if (distance < pointHoverSize) {
          setHoveredPoint({ seriesIndex: sIndex, dataIndex: dIndex });
          return;
        }
      }
    }
    
    setHoveredPoint(null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRefresh = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    drawChart();
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Add roundRect method to Canvas context
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

  // Styles
  const styles = `
    .line-chart-container {
      position: relative;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 16px;
      transition: all var(--transition-base) var(--transition-ease);
    }

    .line-chart-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: var(--z-modal);
      background: var(--bg-primary);
      padding: 20px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .chart-title-section {
      flex: 1;
    }

    .chart-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .chart-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .chart-controls {
      display: flex;
      gap: 8px;
    }

    .chart-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .chart-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .chart-btn:active {
      transform: scale(0.95);
    }

    .chart-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chart-wrapper {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-md);
    }

    .chart-canvas {
      display: block;
      width: 100%;
      height: auto;
      cursor: crosshair;
      transition: transform var(--transition-base) var(--transition-ease);
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .legend-item:hover {
      background: var(--bg-tertiary);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      font-size: var(--text-sm);
      color: var(--text-primary);
    }

    .legend-value {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-left: 4px;
    }

    .chart-context-menu {
      position: fixed;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 8px 0;
      z-index: var(--z-tooltip);
      min-width: 150px;
    }

    .context-menu-item {
      padding: 8px 16px;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--text-primary);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .context-menu-item:hover {
      background: var(--bg-tertiary);
    }

    .context-menu-item.danger {
      color: var(--danger);
    }

    .context-menu-item.danger:hover {
      background: var(--danger-50);
    }

    /* Loading State */
    .chart-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .chart-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--bg-tertiary);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .line-chart-container {
        background: var(--dark-bg-secondary);
      }

      .chart-title {
        color: var(--dark-text-primary);
      }

      .chart-subtitle {
        color: var(--dark-text-muted);
      }

      .chart-btn {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .chart-btn:hover {
        background: var(--dark-primary);
        color: white;
      }

      .chart-legend {
        border-top-color: var(--dark-border);
      }

      .legend-item:hover {
        background: var(--dark-bg-tertiary);
      }

      .legend-label {
        color: var(--dark-text-primary);
      }

      .legend-value {
        color: var(--dark-text-muted);
      }

      .chart-context-menu {
        background: var(--dark-bg-secondary);
        border-color: var(--dark-border);
      }

      .context-menu-item {
        color: var(--dark-text-primary);
      }

      .context-menu-item:hover {
        background: var(--dark-bg-tertiary);
      }

      .chart-loading {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        ref={containerRef}
        className={`line-chart-container ${isFullscreen ? 'fullscreen' : ''} ${className}`}
        onContextMenu={handleContextMenu}
      >
        {/* Header */}
        <div className="chart-header">
          <div className="chart-title-section">
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
          
          <div className="chart-controls">
            {showZoom && (
              <>
                <button className="chart-btn" onClick={handleZoomIn} title="Zoom In">
                  <FiZoomIn size={16} />
                </button>
                <button className="chart-btn" onClick={handleZoomOut} title="Zoom Out">
                  <FiZoomOut size={16} />
                </button>
              </>
            )}
            
            {showRefresh && (
              <button className="chart-btn" onClick={handleRefresh} title="Refresh">
                <FiRefreshCw size={16} />
              </button>
            )}
        {showDownload && (
              <button className="chart-btn" onClick={handleDownload} title="Download">
                <FiDownload size={16} />
              </button>
            )}
            
            {showFullscreen && (
              <button className="chart-btn" onClick={handleFullscreen} title="Fullscreen">
                {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Chart */}
        <div
          className="chart-wrapper"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          <canvas
            ref={canvasRef}
            className="chart-canvas"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Legend */}
        {showLegend && series.length > 0 && (
          <div className="chart-legend">
            {series.map((s, index) => {
              const total = data.reduce((sum, d) => sum + (d[s.key] || 0), 0);
              const average = total / data.length;
              
              return (
                <div
                  key={index}
                  className="legend-item"
                  onClick={() => onSeriesClick?.(s, index)}
                >
                  <div
                    className="legend-color"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="legend-label">{s.name || `Series ${index + 1}`}</span>
                  <span className="legend-value">(avg: {average.toFixed(1)})</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className="chart-context-menu"
            style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
            onMouseLeave={() => setShowContextMenu(false)}
          >
            <div className="context-menu-item" onClick={handleDownload}>
              Download as PNG
            </div>
            <div className="context-menu-item" onClick={handleRefresh}>
              Reset Zoom
            </div>
            <div className="context-menu-item danger">Export Data</div>
          </div>
        )}
      </div>
    </>
  );
};

// Mini Line Chart (for dashboards)
export const MiniLineChart = ({
  data = [],
  width = '100%',
  height = 100,
  color = '#667eea',
  ...props
}) => {
  const styles = `
    .mini-line-chart {
      position: relative;
    }

    .mini-line-chart-tooltip {
      position: absolute;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 4px 8px;
      font-size: var(--text-xs);
      color: var(--text-primary);
      pointer-events: none;
      box-shadow: var(--shadow-sm);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="mini-line-chart">
        <LineChart
          data={data}
          width={width}
          height={height}
          colors={[color]}
          showLegend={false}
          showGrid={false}
          showZoom={false}
          showDownload={false}
          showRefresh={false}
          showFullscreen={false}
          pointSize={0}
          strokeWidth={1.5}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          {...props}
        />
      </div>
    </>
  );
};

// Sparkline Chart (tiny inline chart)
export const SparklineChart = ({
  data = [],
  width = 100,
  height = 30,
  color = '#667eea',
  ...props
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    const values = data.map(d => d.value || d);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    values.forEach((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((value - min) / (range || 1)) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, [data, width, height, color]);

  return <canvas ref={canvasRef} className="sparkline-chart" {...props} />;
};

export default LineChart;
