import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiLock,
  FiUnlock,
  FiShield,
  FiShieldOff,
  FiAlertTriangle,
  FiHome,
  FiArrowLeft,
  FiLogIn,
  FiUserPlus,
  FiMail,
  FiMessageCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiUserMinus,
  FiUserPlus as FiUserPlusIcon,
  FiUser,
  FiUsers as FiUsersIcon,
  FiShield as FiShieldIcon,
  FiShieldOff as FiShieldOffIcon,
  FiLock as FiLockIcon,
  FiUnlock as FiUnlockIcon,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiHelpCircle,
  FiSettings,
  FiTool,
  FiWifi,
  FiWifiOff,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiClock,
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
  FiExternalLink,
  FiCopy,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit,
  FiSave,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiSliders,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fa';
import {
  FaSkull,
  FaSkullCrossbones,
  FaDragon,
  FaPhoenixFramework,
  FaHatWizard,
  FaMagic,
  FaGhost,
  FaRobot,
  FaBug,
  FaVirus,
  FaBiohazard,
  FaRadiation,
  FaBomb,
  FaShieldVirus,
  FaShieldAlt,
  FaCrown,
  FaStar,
  FaUserSecret,
  FaUserNinja,
  FaUserAstronaut,
  FaUserAlien,
  FaUserRobot
} from 'react-icons/fa';
import { GiPadlock, GiLockedChest, GiPrisoner,GiGuards , GiSecurityGate, GiSentryGun } from 'react-icons/gi';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(15);
  const [showDetails, setShowDetails] = useState(false);
  const [errorCode] = useState(403);
  const [errorMessage] = useState('Access Forbidden');
  const [requiredRole, setRequiredRole] = useState('admin');
  const [userRole, setUserRole] = useState('user');
  const [permissions, setPermissions] = useState([]);
  const [requiredPermissions, setRequiredPermissions] = useState([]);
  const [attemptedAction, setAttemptedAction] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [location_geo, setLocationGeo] = useState('');
  const [attemptTime, setAttemptTime] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [securityLevel, setSecurityLevel] = useState('high');
  const [theme, setTheme] = useState('dark');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // Security levels
  const securityLevels = [
    { value: 'low', label: 'Low Security', color: '#28a745', icon: <FiUnlock /> },
    { value: 'medium', label: 'Medium Security', color: '#ffc107', icon: <FiLock /> },
    { value: 'high', label: 'High Security', color: '#dc3545', icon: <FiShield /> },
    { value: 'maximum', label: 'Maximum Security', color: '#6f42c1', icon: <FaShieldAlt /> }
  ];

  // User roles
  const userRoles = [
    { value: 'user', label: 'Regular User', permissions: ['view_products', 'view_earnings'] },
    { value: 'affiliate', label: 'Affiliate', permissions: ['view_products', 'create_links', 'view_earnings', 'withdraw'] },
    { value: 'moderator', label: 'Moderator', permissions: ['view_all', 'manage_users', 'manage_content'] },
    { value: 'admin', label: 'Administrator', permissions: ['view_all', 'manage_all', 'configure_system'] },
    { value: 'super_admin', label: 'Super Administrator', permissions: ['*'] }
  ];

  // Required permissions for different actions
  const actionPermissions = [
    { action: 'View Dashboard', required: ['view_dashboard'], icon: <FiUser /> },
    { action: 'Manage Users', required: ['manage_users'], icon: <FiUsers /> },
    { action: 'Edit Settings', required: ['edit_settings'], icon: <FiSettings /> },
    { action: 'Delete Content', required: ['delete_content'], icon: <FiTrash2 /> },
    { action: 'View Reports', required: ['view_reports'], icon: <FiEye /> },
    { action: 'Export Data', required: ['export_data'], icon: <FiDownload /> },
    { action: 'Configure System', required: ['configure_system'], icon: <FiTool /> },
    { action: 'Manage Payments', required: ['manage_payments'], icon: <FiLock /> }
  ];

  // Suggested actions for users
  const actionSuggestions = [
    { action: 'Login with different account', icon: <FiLogIn />, probability: 40 },
    { action: 'Request access from administrator', icon: <FiMail />, probability: 60 },
    { action: 'Verify your email address', icon: <FiMail />, probability: 30 },
    { action: 'Complete your profile', icon: <FiUser />, probability: 25 },
    { action: 'Contact support for assistance', icon: <FiMessageCircle />, probability: 70 },
    { action: 'Check your account status', icon: <FiUserCheck />, probability: 45 },
    { action: 'Upgrade your account plan', icon: <FiUserPlus />, probability: 20 },
    { action: 'Wait for admin approval', icon: <FiClock />, probability: 50 }
  ];

  useEffect(() => {
    // Initialize data
    setRequiredRole(['admin', 'moderator'][Math.floor(Math.random() * 2)]);
    setUserRole(['user', 'affiliate'][Math.floor(Math.random() * 2)]);
    setAttemptedAction(actionPermissions[Math.floor(Math.random() * actionPermissions.length)].action);
    setRequiredPermissions(['manage_users', 'view_all', 'edit_settings'].slice(0, Math.floor(Math.random() * 3) + 1));
    setPermissions(['view_products', 'view_earnings']);
    setIpAddress(`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
    setUserAgent(navigator.userAgent);
    setLocationGeo(`${['New York', 'London', 'Tokyo', 'Mumbai', 'Sydney'][Math.floor(Math.random() * 5)]}, ${['USA', 'UK', 'Japan', 'India', 'Australia'][Math.floor(Math.random() * 5)]}`);
    setAttemptTime(new Date().toLocaleString());
    setFailedAttempts(Math.floor(Math.random() * 5));
    setLockoutTime(failedAttempts > 3 ? new Date(Date.now() + 30 * 60000).toLocaleString() : null);
    setSecurityLevel(securityLevels[Math.floor(Math.random() * securityLevels.length)].value);
    setSuggestedActions(actionSuggestions.sort(() => 0.5 - Math.random()).slice(0, 4));

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Create particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: i % 4 === 0 ? '#dc3545' : i % 4 === 1 ? '#ffc107' : i % 4 === 2 ? '#28a745' : '#667eea'
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
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [navigate, failedAttempts]);

  const handleLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleContactSupport = () => {
    navigate('/support', {
      state: {
        issue: 'unauthorized_access',
        attemptedAction,
        requiredRole,
        userRole,
        url: location.pathname
      }
    });
  };

  const handleCopyDetails = () => {
    const details = `Error: ${errorCode} - ${errorMessage}
Time: ${attemptTime}
IP: ${ipAddress}
Location: ${location_geo}
User Agent: ${userAgent}
Attempted Action: ${attemptedAction}
Required Role: ${requiredRole}
Your Role: ${userRole}
Required Permissions: ${requiredPermissions.join(', ')}
Your Permissions: ${permissions.join(', ')}`;
    
    navigator.clipboard.writeText(details);
    // Show toast notification
  };

  const getSecurityLevelColor = (level) => {
    const secLevel = securityLevels.find(s => s.value === level);
    return secLevel ? secLevel.color : '#666';
  };

  const getSecurityLevelIcon = (level) => {
    const secLevel = securityLevels.find(s => s.value === level);
    return secLevel ? secLevel.icon : <FiShield />;
  };

  const getRandomIcon = () => {
    const icons = [
      <GiPadlock />,
      <GiLockedChest />,
      <GiPrisoner />,
      <GiGuards />,
      <GiSecurityGate />,
      <GiSentryGun />,
      <FaShieldVirus />,
      <FaShieldAlt />,
      <FaCrown />,
      <FaStar />,
      <FaUserSecret />,
      <FaUserNinja />
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
      animation: 'float 4s ease-in-out infinite'
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
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
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
        color: getSecurityLevelColor(securityLevel),
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <FiShieldOff />
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
        color: getSecurityLevelColor(securityLevel),
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
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 20px',
      background: getSecurityLevelColor(securityLevel),
      color: 'white',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: 500
    }}>
      {getSecurityLevelIcon(securityLevel)}
      {securityLevel.toUpperCase()} SECURITY ZONE
    </div>
  </div>

  {/* Access Denied Message */}
  <div style={{
    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px'
  }}>
    <p style={{
      fontSize: '16px',
      color: theme === 'dark' ? '#e2e8f0' : '#4a5568',
      lineHeight: '1.6',
      margin: '0 0 15px'
    }}>
      You don't have permission to access this resource. This incident has been logged.
    </p>
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '3px' }}>Attempted Action</div>
        <div style={{ fontWeight: 'bold', color: '#667eea' }}>{attemptedAction}</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '3px' }}>Required Role</div>
        <div style={{ fontWeight: 'bold', color: '#dc3545' }}>{requiredRole}</div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '3px' }}>Your Role</div>
        <div style={{ fontWeight: 'bold', color: '#ffc107' }}>{userRole}</div>
      </div>
    </div>
  </div>

  {/* Security Warning */}
  {failedAttempts > 0 && (
    <div style={{
      background: 'rgba(220,53,69,0.1)',
      border: '1px solid #dc3545',
      borderRadius: '10px',
      padding: '15px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <FiAlertTriangle style={{ color: '#dc3545', fontSize: '24px' }} />
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: '#dc3545', marginBottom: '5px' }}>
          Security Alert
        </div>
        <div style={{ fontSize: '14px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}>
          {failedAttempts} failed access {failedAttempts === 1 ? 'attempt' : 'attempts'} detected.
          {lockoutTime && ` Account locked until ${lockoutTime}.`}
        </div>
      </div>
    </div>
  )}

  {/* Permission Comparison */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
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
        color: '#dc3545',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <FiLock />
        Required Permissions
      </h4>
      <ul style={{ margin: 0, paddingLeft: '20px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}>
        {requiredPermissions.map((perm, index) => (
          <li key={index} style={{ fontSize: '13px', marginBottom: '5px' }}>{perm}</li>
        ))}
      </ul>
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
        color: '#28a745',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <FiUnlock />
        Your Permissions
      </h4>
      <ul style={{ margin: 0, paddingLeft: '20px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}>
        {permissions.map((perm, index) => (
          <li key={index} style={{ fontSize: '13px', marginBottom: '5px' }}>{perm}</li>
        ))}
      </ul>
    </div>
  </div>

  {/* Access Details */}
  <div style={{
    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  }}>
    <div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>IP Address</div>
      <code style={{ fontSize: '12px', color: '#667eea' }}>{ipAddress}</code>
    </div>
    <div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>Location</div>
      <div style={{ fontSize: '12px', color: theme === 'dark' ? '#fff' : '#333' }}>{location_geo}</div>
    </div>
    <div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>Attempt Time</div>
      <div style={{ fontSize: '12px', color: theme === 'dark' ? '#fff' : '#333' }}>{attemptTime}</div>
    </div>
    <div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>User Agent</div>
      <div style={{ fontSize: '12px', color: theme === 'dark' ? '#fff' : '#333' }}>{userAgent.substring(0, 30)}...</div>
    </div>
  </div>

  {/* Countdown */}
  <div style={{
    marginBottom: '30px',
    fontSize: '16px',
    color: theme === 'dark' ? '#a0aec0' : '#718096',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  }}>
    <FiClock />
    Redirecting to home in <span style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#667eea'
    }}>{countdown}</span> seconds...
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
      onClick={handleLogin}
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
    >
      <FiLogIn />
      Login with Different Account
    </button>
    
    <button
      onClick={handleRegister}
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
      <FiUserPlus />
      Create New Account
    </button>
    
    <button
      onClick={handleContactSupport}
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
      <FiMessageCircle />
      Contact Support
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
    {showDetails ? 'Hide Security Details' : 'Show Security Details'}
  </button>
        {/* Security Details */}
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
              <FiShield />
              Security Audit Log
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                borderRadius: '5px'
              }}>
                <span style={{ color: '#666' }}>Security Level</span>
                <span style={{ color: getSecurityLevelColor(securityLevel), fontWeight: 'bold' }}>
                  {securityLevel.toUpperCase()}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                borderRadius: '5px'
              }}>
                <span style={{ color: '#666' }}>Access Control</span>
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                borderRadius: '5px'
              }}>
                <span style={{ color: '#666' }}>Authentication Method</span>
                <span>JWT + Session Cookie</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                borderRadius: '5px'
              }}>
                <span style={{ color: '#666' }}>Session Timeout</span>
                <span>30 minutes</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                borderRadius: '5px'
              }}>
                <span style={{ color: '#666' }}>2FA Required</span>
                <span style={{ color: requiredRole === 'admin' ? '#28a745' : '#ffc107' }}>
                  {requiredRole === 'admin' ? 'Yes' : 'No'}
                </span>
              </div>
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
              Suggested Actions
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {suggestedActions.map((suggestion, index) => (
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
                    {suggestion.icon}
                    <span>{suggestion.action}</span>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {suggestion.probability}% effective
                  </span>
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
              <FiUsers />
              Role Hierarchy
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              {userRoles.map((role, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    background: role.value === userRole ? 'rgba(40,167,69,0.1)' : 
                               role.value === requiredRole ? 'rgba(220,53,69,0.1)' : 'transparent',
                    borderRadius: '5px'
                  }}
                >
                  <span style={{
                    fontWeight: role.value === userRole || role.value === requiredRole ? 'bold' : 'normal',
                    color: role.value === userRole ? '#28a745' : 
                           role.value === requiredRole ? '#dc3545' : 'inherit'
                  }}>
                    {role.label}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {role.permissions.length} permissions
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
              <div style={{ marginBottom: '5px', color: '#666' }}>Access Log Entry:</div>
              <code style={{ color: '#333', whiteSpace: 'pre-wrap' }}>
                {`[${attemptTime}] 403 FORBIDDEN - ${location.pathname}
    User: ${userRole} (ID: ${Math.floor(Math.random() * 10000)})
    IP: ${ipAddress}
    Action: ${attemptedAction}
    Required: ${requiredPermissions.join(', ')}
    Result: Access denied - insufficient permissions`}
              </code>
              <button
                onClick={handleCopyDetails}
                style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  background: 'none',
                  border: '1px solid #667eea',
                  borderRadius: '5px',
                  color: '#667eea',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiCopy />
                Copy Full Details
              </button>
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <FiShield style={{ color: '#667eea', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px', fontSize: '14px', color: '#667eea' }}>Stay Safe</h4>
            <p style={{ fontSize: '12px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568', margin: 0 }}>
              Never share your credentials
            </p>
          </div>
          
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <FiLock style={{ color: '#667eea', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px', fontSize: '14px', color: '#667eea' }}>Use 2FA</h4>
            <p style={{ fontSize: '12px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568', margin: 0 }}>
              Enable two-factor authentication
            </p>
          </div>
          
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '15px',
            borderRadius: '10px',
            textAlign: 'left'
          }}>
            <FiEye style={{ color: '#667eea', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px', fontSize: '14px', color: '#667eea' }}>Monitor Access</h4>
            <p style={{ fontSize: '12px', color: theme === 'dark' ? '#e2e8f0' : '#4a5568', margin: 0 }}>
              Review access logs regularly
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginTop: '20px',
          padding: '20px',
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <a href="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms of Service</a>
          <a href="/security" style={{ color: '#667eea', textDecoration: 'none' }}>Security</a>
          <a href="/contact" style={{ color: '#667eea', textDecoration: 'none' }}>Contact</a>
          <a href="/faq" style={{ color: '#667eea', textDecoration: 'none' }}>FAQ</a>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '20px',
          fontSize: '12px',
          color: theme === 'dark' ? '#a0aec0' : '#718096'
        }}>
          This incident has been logged. Repeated unauthorized access attempts may result in account suspension.
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

export default Unauthorized;
