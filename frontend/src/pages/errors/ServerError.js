import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiServer,
  FiCloud,
  FiDatabase,
  FiRefreshCw,
  FiHome,
  FiArrowLeft,
  FiMail,
  FiMessageCircle,
  FiClock,
  FiActivity,
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiWifiOff,
  FiZap,
  FiZapOff,
  FiPower,
  FiTerminal,
  FiCode,
  FiCopy,
  FiDownload,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiHelpCircle,
  FiTool,
  FiSettings,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiLock,
  FiUnlock,
  FiShield,
  FiShieldOff,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiWatch,
  FiBell,
  FiBellOff,
  FiVolume2,
  FiVolumeX,
  FiRadio,
  FiSatellite,
  FiRss,
  FiCast,
  FiLink,
  FiLink2,
  FiExternalLink
} from 'react-icons/fi';
import {
  FaExclamationTriangle,
  FaSkullCrossbones,
  FaBomb,
  FaRadiation,
  FaBiohazard,
  FaVirus,
  FaMicrochip,
  FaRobot,
  FaBug,
  FaDragon,
  FaPhoenixFramework,
  FaHatWizard,
  FaMagic,
  FaGhost,
  FaSpaceShuttle,
  FaRocket,
  FaSatellite,
  FaMeteor,
  FaMoon,
  FaSun,
  FaStar
} from 'react-icons/fi';
import { GiCircuitry, GiProcessor, GiCpu, GiBrain, GiArtificialIntelligence } from 'react-icons/gi';

const ServerError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(30);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [errorCode] = useState(500);
  const [errorMessage] = useState('Internal Server Error');
  const [errorType, setErrorType] = useState('server');
  const [severity, setSeverity] = useState('critical');
  const [estimatedFixTime, setEstimatedFixTime] = useState('5-10 minutes');
  const [affectedServices, setAffectedServices] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [serverStatus, setServerStatus] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: 0,
    requests: 0,
    errors: 0
  });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // Error types and their descriptions
  const errorTypes = [
    { value: 'server', label: 'Server Error', icon: <FiServer />, description: 'Internal server configuration issue' },
    { value: 'database', label: 'Database Error', icon: <FiDatabase />, description: 'Database connection or query failed' },
    { value: 'network', label: 'Network Error', icon: <FiWifiOff />, description: 'Network connectivity issues' },
    { value: 'timeout', label: 'Timeout Error', icon: <FiClock />, description: 'Request timed out' },
    { value: 'memory', label: 'Memory Error', icon: <FiHardDrive />, description: 'Out of memory or resource exhaustion' },
    { value: 'cpu', label: 'CPU Error', icon: <FiCpu />, description: 'CPU overload or processing issues' },
    { value: 'auth', label: 'Authentication Error', icon: <FiLock />, description: 'Authentication service unavailable' },
    { value: 'api', label: 'API Error', icon: <FiCode />, description: 'API endpoint malfunction' }
  ];

  // Severity levels
  const severityLevels = [
    { value: 'low', label: 'Low', color: '#28a745', icon: <FiInfo /> },
    { value: 'medium', label: 'Medium', color: '#ffc107', icon: <FiAlertCircle /> },
    { value: 'high', label: 'High', color: '#ff6b6b', icon: <FiAlertTriangle /> },
    { value: 'critical', label: 'Critical', color: '#dc3545', icon: <FaSkullCrossbones /> }
  ];

  // Common solutions
  const commonSolutions = [
    { action: 'Refresh the page', icon: <FiRefreshCw />, probability: 70 },
    { action: 'Clear browser cache', icon: <FiHardDrive />, probability: 40 },
    { action: 'Try again in 5 minutes', icon: <FiClock />, probability: 60 },
    { action: 'Check your internet connection', icon: <FiWifi />, probability: 50 },
    { action: 'Disable browser extensions', icon: <FiZapOff />, probability: 30 },
    { action: 'Try a different browser', icon: <FiGlobe />, probability: 45 },
    { action: 'Contact support team', icon: <FiMail />, probability: 80 },
    { action: 'Check server status page', icon: <FiActivity />, probability: 65 }
  ];

  // Error logs
  const generateErrorLogs = () => {
    const logs = [];
    const timestamps = [];
    for (let i = 0; i < 10; i++) {
      timestamps.push(new Date(Date.now() - i * 60000).toISOString());
    }
    
    const messages = [
      'Failed to connect to database',
      'Connection pool exhausted',
      'Query timeout exceeded',
      'Memory allocation failed',
      'CPU usage exceeded threshold',
      'Disk write error',
      'Network socket timeout',
      'SSL handshake failed',
      'Authentication service unavailable',
      'API rate limit exceeded'
    ];

    for (let i = 0; i < 10; i++) {
      logs.push({
        timestamp: timestamps[i],
        level: ['error', 'critical', 'warning'][Math.floor(Math.random() * 3)],
        message: messages[Math.floor(Math.random() * messages.length)],
        code: `ERR_${Math.floor(Math.random() * 10000)}`,
        stack: `at process (${['api', 'db', 'auth', 'cache'][Math.floor(Math.random() * 4)]}.js:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 50)})`
      });
    }
    return logs;
  };

  // Affected services
  const serviceList = [
    { name: 'Database Server', status: 'down', icon: <FiDatabase />, impact: 'critical' },
    { name: 'API Gateway', status: 'degraded', icon: <FiCloud />, impact: 'high' },
    { name: 'Authentication Service', status: 'down', icon: <FiLock />, impact: 'critical' },
    { name: 'Cache Server', status: 'degraded', icon: <FiHardDrive />, impact: 'medium' },
    { name: 'Queue Service', status: 'down', icon: <FiClock />, impact: 'high' },
    { name: 'Email Service', status: 'down', icon: <FiMail />, impact: 'low' }
  ];

  useEffect(() => {
    // Initialize error data
    setErrorLogs(generateErrorLogs());
    setAffectedServices(serviceList);
    setSolutions(commonSolutions);
    setErrorType(errorTypes[Math.floor(Math.random() * errorTypes.length)].value);
    setSeverity(severityLevels[Math.floor(Math.random() * severityLevels.length)].value);

    // Server status simulation
    const interval = setInterval(() => {
      setServerStatus({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 100),
        uptime: Math.floor(Math.random() * 3600),
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 100)
      });
    }, 2000);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && autoRefresh) {
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Create particles
    const newParticles = [];
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: i % 3 === 0 ? '#dc3545' : i % 3 === 1 ? '#ffc107' : '#ff6b6b'
      });
    }
    setParticles(newParticles);

    // Mouse move effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopyError = () => {
    const errorText = `Error: ${errorCode} - ${errorMessage}\nType: ${errorType}\nTime: ${new Date().toLocaleString()}\nURL: ${window.location.href}`;
    navigator.clipboard.writeText(errorText);
    // Show toast or feedback
  };

  const handleReportError = () => {
    navigate('/support', { 
      state: { 
        error: 'server_error',
        code: errorCode,
        message: errorMessage,
        url: location.pathname
      }
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'up': return <FiCheckCircle style={{ color: '#28a745' }} />;
      case 'degraded': return <FiAlertCircle style={{ color: '#ffc107' }} />;
      case 'down': return <FiXCircle style={{ color: '#dc3545' }} />;
      default: return <FiInfo style={{ color: '#666' }} />;
    }
  };

  const getSeverityColor = (level) => {
    const severity = severityLevels.find(s => s.value === level);
    return severity ? severity.color : '#666';
  };

  const getRandomIcon = () => {
    const icons = [
      <FaRadiation />,
      <FaBiohazard />,
      <FaVirus />,
      <FaSkullCrossbones />,
      <FaBomb />,
      <FaMicrochip />,
      <FaRobot />,
      <GiCircuitry />,
      <GiProcessor />,
      <GiCpu />,
      <GiBrain />,
      <GiArtificialIntelligence />
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'Arial, sans-serif'
    },
    particlesContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    },
    particle: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(1px)',
      transition: 'transform 0.1s ease',
      animation: 'float 3s ease-in-out infinite'
    },
    content: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '900px',
      width: '95%',
      padding: '40px',
      textAlign: 'center',
      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Particles */}
      <div style={styles.particlesContainer}>
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              ...styles.particle,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              background: particle.color,
              transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
              animationDelay: `${particle.id * 0.1}s`
            }}
          />
        ))}
      </div>
{/* Main Content */}
<div style={styles.content}>
  {/* Error Header */}
  <div style={{ marginBottom: '30px', position: 'relative' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        fontSize: '80px',
        color: getSeverityColor(severity),
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <FaExclamationTriangle />
      </div>
      <div style={{
        fontSize: '120px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 10px 30px rgba(220,53,69,0.3)',
        lineHeight: 1
      }}>
        {errorCode}
      </div>
      <div style={{
        fontSize: '80px',
        color: getSeverityColor(severity),
        animation: 'pulse 2s ease-in-out infinite',
        animationDelay: '1s'
      }}>
        {getRandomIcon()}
      </div>
    </div>
    
    <div style={{
      fontSize: '32px',
      color: theme === 'dark' ? '#fff' : '#333',
      fontWeight: 500,
      marginBottom: '10px'
    }}>
      {errorMessage}
    </div>
    
    <div style={{
      display: 'inline-block',
      padding: '5px 15px',
      background: getSeverityColor(severity),
      color: 'white',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 500,
      textTransform: 'uppercase'
    }}>
      {severity} Severity
    </div>
  </div>

  {/* Server Status Dashboard */}
  <div style={{
    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px'
  }}>
    <h3 style={{
      margin: '0 0 15px',
      fontSize: '18px',
      color: '#667eea',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }}>
      <FiActivity />
      Live Server Status
    </h3>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '15px',
      marginBottom: '15px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <FiCpu style={{ fontSize: '24px', color: serverStatus.cpu > 80 ? '#dc3545' : '#28a745' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{serverStatus.cpu}%</div>
        <div style={{ fontSize: '12px', color: '#999' }}>CPU Usage</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <FiHardDrive style={{ fontSize: '24px', color: serverStatus.memory > 80 ? '#dc3545' : '#28a745' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{serverStatus.memory}%</div>
        <div style={{ fontSize: '12px', color: '#999' }}>Memory</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <FiDatabase style={{ fontSize: '24px', color: serverStatus.disk > 80 ? '#dc3545' : '#28a745' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{serverStatus.disk}%</div>
        <div style={{ fontSize: '12px', color: '#999' }}>Disk</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <FiWifi style={{ fontSize: '24px', color: serverStatus.network > 80 ? '#dc3545' : '#28a745' }} />
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{serverStatus.network}%</div>
        <div style={{ fontSize: '12px', color: '#999' }}>Network</div>
      </div>
    </div>

    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      color: '#666'
    }}>
      <span>Requests: {serverStatus.requests}/s</span>
      <span>Errors: {serverStatus.errors}/m</span>
      <span>Uptime: {Math.floor(serverStatus.uptime / 60)}m {serverStatus.uptime % 60}s</span>
    </div>
  </div>

  {/* Error Info */}
  <div style={{
    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FiServer style={{ color: '#667eea' }} />
      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
        {errorTypes.find(t => t.value === errorType)?.label}
      </span>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FiClock style={{ color: '#667eea' }} />
      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
        {new Date().toLocaleString()}
      </span>
    </div>
    
    <div style={{ display: 'flex', gap: '5px' }}>
      <button
        onClick={handleCopyError}
        style={{
          padding: '5px 10px',
          background: 'none',
          border: '1px solid #667eea',
          borderRadius: '5px',
          color: '#667eea',
          cursor: 'pointer'
        }}
      >
        <FiCopy />
      </button>
      <button
        onClick={handleReportError}
        style={{
          padding: '5px 10px',
          background: 'none',
          border: '1px solid #667eea',
          borderRadius: '5px',
          color: '#667eea',
          cursor: 'pointer'
        }}
      >
        <FiMail />
      </button>
    </div>
  </div>

  {/* Estimated Fix Time */}
  <div style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  }}>
    <FiClock style={{ fontSize: '24px' }} />
    <span>Estimated fix time: </span>
    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{estimatedFixTime}</span>
  </div>

  {/* Countdown Timer */}
  <div style={{
    marginBottom: '30px',
    fontSize: '16px',
    color: theme === 'dark' ? '#a0aec0' : '#718096',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px'
  }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <input
        type="checkbox"
        checked={autoRefresh}
        onChange={(e) => setAutoRefresh(e.target.checked)}
      />
      Auto-refresh
    </label>
    
    <div>
      Retrying in <span style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#667eea'
      }}>{countdown}</span> seconds...
    </div>
  </div>

  {/* Action Buttons */}
  <div style={{
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap'
  }}>
    <button
      onClick={handleRefresh}
      style={{
        padding: '12px 30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'transform 0.3s ease'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      <FiRefreshCw />
      Refresh Now
    </button>
    
    <button
      onClick={() => navigate('/')}
      style={{
        padding: '12px 30px',
        background: 'transparent',
        border: `2px solid #667eea`,
        color: '#667eea',
        borderRadius: '30px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <FiHome />
      Go Home
    </button>
    
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: '12px 30px',
        background: 'transparent',
        border: `2px solid ${theme === 'dark' ? '#fff' : '#333'}`,
        color: theme === 'dark' ? '#fff' : '#333',
        borderRadius: '30px',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <FiArrowLeft />
      Go Back
    </button>
  </div>

  {/* Toggle Details */}
  <button
    onClick={() => setShowDetails(!showDetails)}
    style={{
      background: 'none',
      border: 'none',
      color: '#667eea',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      margin: '0 auto 20px'
    }}
  >
    {showDetails ? <FiEyeOff /> : <FiEye />}
    {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
  </button>
        {/* Technical Details */}
        {showDetails && (
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{
              margin: '0 0 15px',
              fontSize: '18px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiTerminal />
              Error Logs
            </h3>
            
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              marginBottom: '20px'
            }}>
              {errorLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: log.level === 'error' ? '#dc3545' : log.level === 'critical' ? '#ff6b6b' : '#ffc107'
                  }}
                >
                  <span style={{ color: '#999' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span style={{ fontWeight: 'bold' }}>{log.code}</span>{' '}
                  {log.message}
                </div>
              ))}
            </div>

            <h3 style={{
              margin: '20px 0 15px',
              fontSize: '18px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiServer />
              Affected Services
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {affectedServices.map((service, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                    borderRadius: '5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {service.icon}
                    <span style={{ fontWeight: 500 }}>{service.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {getStatusIcon(service.status)}
                    <span style={{
                      color: service.status === 'up' ? '#28a745' : service.status === 'degraded' ? '#ffc107' : '#dc3545'
                    }}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{
              margin: '20px 0 15px',
              fontSize: '18px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiTool />
              Recommended Solutions
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                    borderRadius: '5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {solution.icon}
                    <span>{solution.action}</span>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {solution.probability}% success rate
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>
              <div style={{ marginBottom: '5px', color: '#666' }}>Stack Trace:</div>
              <code style={{ color: '#333', whiteSpace: 'pre-wrap' }}>
                {`Error: ${errorMessage}
    at Server.handleRequest (server.js:123:45)
    at Router.handle (router.js:67:89)
    at next (middleware.js:34:56)
    at process.processTicksAndTicks (internal/process/task_queues.js:95:5)`}
              </code>
            </div>
          </div>
        )}

        {/* Status Updates */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <h4 style={{
              margin: '0 0 10px',
              fontSize: '14px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiBell />
              Latest Updates
            </h4>
            <div style={{ fontSize: '13px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}>
              <p>• Engineering team notified at {new Date().toLocaleTimeString()}</p>
              <p>• Investigating root cause...</p>
              <p>• Estimated resolution: {estimatedFixTime}</p>
              <p>• Status page: <a href="/status" style={{ color: '#667eea' }}>status.example.com</a></p>
            </div>
          </div>

          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <h4 style={{
              margin: '0 0 10px',
              fontSize: '14px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiUsers />
              Impact Assessment
            </h4>
            <div style={{ fontSize: '13px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}>
              <p>• Affected users: 1,234 active sessions</p>
              <p>• Impacted features: Login, Dashboard, Payments</p>
              <p>• Data loss: None detected</p>
              <p>• Service level: Degraded</p>
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginTop: '20px',
          padding: '20px',
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <a href="/support" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiMessageCircle />
            Live Chat
          </a>
          <a href="mailto:support@example.com" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiMail />
            Email Support
          </a>
          <a href="/status" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiActivity />
            Status Page
          </a>
          <a href="/docs" style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiBook />
            Documentation
          </a>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: theme === 'dark' ? '#a0aec0' : '#718096'
        }}>
          Our team has been automatically notified. We apologize for the inconvenience.
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ServerError;
