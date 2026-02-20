import React, { useEffect, useRef, useState } from 'react';
import {
  FiDownload,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
  FiPieChart as FiPieChartIcon,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const PieChart = ({
  data = [],
  width = '100%',
  height = 400,
  title,
  subtitle,
  colors = ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#fd7e14', '#20c997', '#e83e8c', '#6f42c1'],
  showLegend = true,
  showTooltip = true,
  showDownload = true,
  showRefresh = true,
  showFullscreen = true,
  animate = true,
  animationDuration = 1000,
  innerRadius = 0, // For donut chart
  outerRadius = 0.8, // Percentage of container size
  startAngle = 0,
  endAngle = 360,
  padAngle = 0.02,
  cornerRadius = 0,
  sortValues = true,
  valueFormat = (value) => value.toFixed(1),
  percentFormat = (percent) => `${(percent * 100).toFixed(1)}%`,
  onSliceClick,
  onSliceHover,
  className = '',
  ...props
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth } = containerRef.current.getBoundingClientRect();
        const size = Math.min(containerWidth, height) * 0.9;
        setDimensions({
          width: size,
          height: size
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (animate) {
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / animationDuration, 1);
        setAnimationProgress(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    } else {
      setAnimationProgress(1);
    }
  }, [data, animate, animationDuration]);

  useEffect(() => {
    if (canvasRef.current && data.length > 0) {
      drawChart();
    }
  }, [data, dimensions, hoveredSlice, animationProgress]);

  const processData = () => {
    let total = 0;
    const processedData = data.map(item => ({
      ...item,
      value: item.value || 0
    }));

    if (sortValues) {
      processedData.sort((a, b) => b.value - a.value);
    }

    total = processedData.reduce((sum, item) => sum + item.value, 0);

    let start = startAngle;
    const angleRange = endAngle - startAngle;
    
    return processedData.map(item => {
      const percentage = item.value / total;
      const angle = (angleRange * percentage) * animationProgress;
      const slice = {
        ...item,
        percentage,
        startAngle: start,
        endAngle: start + angle,
        midAngle: start + angle / 2
      };
      start += angle;
      return slice;
    });
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate center and radius
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(dimensions.width, dimensions.height) / 2;
    const outerR = maxRadius * outerRadius;
    const innerR = maxRadius * innerRadius;
    
    // Process data
    const slices = processData();
    
    // Draw slices
    slices.forEach((slice, index) => {
      const isHovered = hoveredSlice === index;
      const radius = isHovered ? outerR * 1.05 : outerR;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        (slice.startAngle * Math.PI) / 180,
        (slice.endAngle * Math.PI) / 180
      );
      ctx.closePath();
      
      // Fill slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Add shadow for hovered slice
      if (isHovered) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      
      // Stroke slice
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      
      // Draw donut hole
      if (innerRadius > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerR, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    
    // Draw labels
    if (showTooltip && hoveredSlice !== null) {
      drawTooltip(ctx, slices[hoveredSlice], centerX, centerY);
    }
    
    // Draw percentage labels
    if (outerRadius > 0.7) {
      slices.forEach((slice, index) => {
        if (slice.percentage > 0.05) { // Only show labels for slices > 5%
          drawSliceLabel(ctx, slice, index, centerX, centerY, outerR, innerR);
        }
      });
    }
  };

  const drawSliceLabel = (ctx, slice, index, centerX, centerY, outerR, innerR) => {
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const labelRadius = innerR > 0 ? (innerR + outerR) / 2 : outerR * 0.7;
    
    const x = centerX + Math.cos(midAngle * Math.PI / 180) * labelRadius;
    const y = centerY + Math.sin(midAngle * Math.PI / 180) * labelRadius;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(percentFormat(slice.percentage), x, y);
  };

  const drawTooltip = (ctx, slice, centerX, centerY) => {
    const tooltipText = `${slice.label || slice.name}: ${valueFormat(slice.value)} (${percentFormat(slice.percentage)})`;
    
    ctx.font = '12px Inter, sans-serif';
    const metrics = ctx.measureText(tooltipText);
    const tooltipWidth = metrics.width + 20;
    const tooltipHeight = 30;
    
    const tooltipX = centerX - tooltipWidth / 2;
    const tooltipY = centerY - dimensions.height / 2 + 10;
    
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

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(dimensions.width, dimensions.height) / 2;
    const outerR = maxRadius * outerRadius;
    
    // Calculate distance from center
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if within outer radius
    if (distance <= outerR) {
      // Calculate angle
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      angle = angle < 0 ? angle + 360 : angle;
      
      // Process data to find slice
      const slices = processData();
      const hoveredIndex = slices.findIndex(
        slice => angle >= slice.startAngle && angle < slice.endAngle
      );
      
      if (hoveredIndex !== -1 && hoveredIndex !== hoveredSlice) {
        setHoveredSlice(hoveredIndex);
        onSliceHover?.(slices[hoveredIndex], hoveredIndex);
      }
    } else {
      setHoveredSlice(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  const handleSliceClick = () => {
    if (hoveredSlice !== null) {
      const slices = processData();
      onSliceClick?.(slices[hoveredSlice], hoveredSlice);
    }
  };

  const handleRefresh = () => {
    setAnimationProgress(0);
    setTimeout(() => setAnimationProgress(1), 100);
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
    link.download = 'piechart.png';
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
    .pie-chart-container {
      position: relative;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      padding: 16px;
      transition: all var(--transition-base) var(--transition-ease);
      display: flex;
      flex-direction: column;
    }

    .pie-chart-container.fullscreen {
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
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      cursor: pointer;
    }

    .chart-canvas {
      max-width: 100%;
      height: auto;
      transition: transform var(--transition-base) var(--transition-ease);
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast) var(--transition-ease);
      background: var(--bg-secondary);
    }

    .legend-item:hover {
      background: var(--bg-tertiary);
      transform: translateY(-2px);
    }

    .legend-item.hovered {
      background: var(--primary-50);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
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

    .legend-percent {
      font-size: var(--text-xs);
      color: var(--primary);
      font-weight: var(--font-semibold);
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
      .pie-chart-container {
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

      .legend-item {
        background: var(--dark-bg-tertiary);
      }

      .legend-item:hover {
        background: var(--dark-bg-secondary);
      }

      .legend-item.hovered {
        background: var(--dark-primary-50);
      }

      .legend-label {
        color: var(--dark-text-primary);
      }

      .legend-value {
        color: var(--dark-text-muted);
      }

      .legend-percent {
        color: var(--dark-primary);
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

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const slices = processData();

  return (
    <>
      <style>{styles}</style>
      <div
        ref={containerRef}
        className={`pie-chart-container ${isFullscreen ? 'fullscreen' : ''} ${className}`}
        onContextMenu={handleContextMenu}
      >
        {/* Header */}
        <div className="chart-header">
          <div className="chart-title-section">
            {title && <h3 className="chart-title">{title}</h3>}
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
          
          <div className="chart-controls">
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
        <div className="chart-wrapper" onClick={handleSliceClick}>
          <canvas
            ref={canvasRef}
            className="chart-canvas"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>

        {/* Legend */}
        {showLegend && data.length > 0 && (
          <div className="chart-legend">
            {slices.map((slice, index) => (
              <div
                key={index}
                className={`legend-item ${hoveredSlice === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => onSliceClick?.(slice, index)}
              >
                <div
                  className="legend-color"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="legend-label">{slice.label || slice.name}</span>
                <span className="legend-value">{valueFormat(slice.value)}</span>
                <span className="legend-percent">{percentFormat(slice.percentage)}</span>
              </div>
            ))}
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
              Refresh Chart
            </div>
            <div className="context-menu-item danger">Export Data</div>
          </div>
        )}
      </div>
    </>
  );
};

// Donut Chart (Pie chart with hole)
export const DonutChart = ({
  innerRadius = 0.6,
  centerText,
  centerSubtext,
  ...props
}) => {
  const styles = `
    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }

    .donut-center-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.2;
    }

    .donut-center-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  `;

  const total = props.data?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;

  return (
    <>
      <style>{styles}</style>
      <div style={{ position: 'relative' }}>
        <PieChart innerRadius={innerRadius} {...props} />
        {(centerText || centerSubtext) && (
  <div className="donut-center">
            {centerText && <div className="donut-center-value">{centerText}</div>}
            {centerSubtext && <div className="donut-center-label">{centerSubtext}</div>}
          </div>
        )}
      </div>
    </>
  );
};

// Mini Pie Chart (for dashboards)
export const MiniPieChart = ({
  data = [],
  width = 100,
  height = 100,
  showLegend = false,
  ...props
}) => {
  return (
    <PieChart
      data={data}
      width={width}
      height={height}
      showLegend={showLegend}
      showDownload={false}
      showRefresh={false}
      showFullscreen={false}
      outerRadius={0.9}
      {...props}
    />
  );
};

// Progress Pie Chart
export const ProgressPieChart = ({
  value = 0,
  max = 100,
  color = '#667eea',
  backgroundColor = '#e9ecef',
  size = 100,
  thickness = 10,
  showPercentage = true,
  ...props
}) => {
  const percentage = (value / max) * 100;
  
  const data = [
    { value: percentage, color, label: 'Progress' },
    { value: 100 - percentage, color: backgroundColor, label: 'Remaining' }
  ];

  return (
    <DonutChart
      data={data}
      width={size}
      height={size}
      innerRadius={0.7}
      outerRadius={0.9}
      colors={[color, backgroundColor]}
      showLegend={false}
      showDownload={false}
      showRefresh={false}
      showFullscreen={false}
      sortValues={false}
      centerText={showPercentage ? `${percentage.toFixed(1)}%` : undefined}
      centerSubtext="Complete"
      {...props}
    />
  );
};

export default PieChart;
