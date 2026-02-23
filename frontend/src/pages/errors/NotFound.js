import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiAlertCircle,
  FiHome,
  FiArrowLeft,
  FiSearch,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiRefreshCw,
  FiMap,
  FiCompass,
  FiGlobe,
  FiLink,
  FiExternalLink,
  FiGithub,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiCode,
  FiServer,
  FiDatabase,
  FiCloud,
  FiShield,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff,
  FiStar,
  FiHeart,
  FiThumbsUp,
  FiSmile,
  FiFrown,
  FiMeh,
  FiZap,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiPieChart,
  FiSettings,
  FiTool,
  FiWifi,
  FiPower,
  FiTerminal,
  FiCopy,
  FiShare2,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit,
  FiSave,
  FiClock,
  FiCalendar,
  FiMapPin
} from 'react-icons/fi';
import {
  FaGhost,
  FaRocket,
  FaSpaceShuttle,
  FaSatellite,
  FaUserAstronaut,
  FaMeteor,
  FaMoon,
  FaSun,
  FaStar,
  FaGalacticRepublic,
  FaJedi,
  FaRobot,
  FaBug,
  FaSkull,
  FaDragon,
  FaPhoenixFramework,
  FaMagic,
  FaHatWizard,
  FaCrown,
  FaGem,
  FaDiamond,
  FaTrophy
} from 'react-icons/fa';
import { GiSpaceship, GiAlienSkull, GiGalaxy, GiPlanetConquest, GiBlackHoleBolas } from 'react-icons/gi';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [errorCode] = useState(404);
  const [errorMessage] = useState('Page Not Found');
  const [suggestions, setSuggestions] = useState([]);
  const [relatedLinks, setRelatedLinks] = useState([]);
  const [funFacts, setFunFacts] = useState([]);
  const [dadJokes, setDadJokes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 404 jokes collection
  const jokes = [
    { setup: "Why did the page go to therapy?", punchline: "It had too many 404 issues!" },
    { setup: "What do you call a ghost page?", punchline: "A 404-boo!" },
    { setup: "Why was the JavaScript developer sad?", punchline: "They couldn't find their 'this'!" },
    { setup: "How many programmers does it take to find a 404 page?", punchline: "None, it's a server issue!" },
    { setup: "Why did the page break up with the server?", punchline: "It couldn't find a connection!" },
    { setup: "What's a 404 page's favorite song?", punchline: "U Can't Touch This!" },
    { setup: "Why do 404 pages make terrible comedians?", punchline: "They always miss the mark!" },
    { setup: "What did the 404 page say to the visitor?", punchline: "You've lost that lovin' feeling!" }
  ];

  // Fun facts about 404
  const facts = [
    "The first 404 error was recorded at CERN in 1992.",
    "404 is the room number where the first web server was located at CERN.",
    "Some websites have creative 404 pages with games and easter eggs.",
    "Google's 404 page has a broken robot and a search bar.",
    "GitHub's 404 page features a random Star Wars scene.",
    "Amazon's 404 page shows a dog looking confused.",
    "404 errors can hurt your website's SEO ranking.",
    "The term '404' comes from HTTP status code for 'Not Found'."
  ];

  // Dad jokes
  const dadJokeList = [
    "I'm reading a book on anti-gravity. It's impossible to put down!",
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fake noodle? An impasta!",
    "How does a penguin build its house? Igloos it together!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "What do you call a bear with no teeth? A gummy bear!",
    "I told my wife she should embrace her mistakes. She gave me a hug.",
    "Why don't eggs tell jokes? They'd crack each other up!"
  ];

  // Suggested pages based on current path
  const getSuggestions = (path) => {
    const baseSuggestions = [
      { path: '/', name: 'Home', icon: <FiHome />, description: 'Go back to the homepage' },
      { path: '/dashboard', name: 'Dashboard', icon: <FiActivity />, description: 'View your analytics' },
      { path: '/products', name: 'Products', icon: <FiStar />, description: 'Browse affiliate products' },
      { path: '/earnings', name: 'Earnings', icon: <FiTrendingUp />, description: 'Check your earnings' },
      { path: '/support', name: 'Support', icon: <FiHelpCircle />, description: 'Get help' },
      { path: '/settings', name: 'Settings', icon: <FiSettings />, description: 'Configure your account' }
    ];

    if (path.includes('admin')) {
      return [
        { path: '/admin', name: 'Admin Dashboard', icon: <FiServer />, description: 'Return to admin panel' },
        { path: '/admin/users', name: 'User Management', icon: <FiUsers />, description: 'Manage users' },
        ...baseSuggestions
      ];
    }
    return baseSuggestions;
  };

  // Related links based on path
  const getRelatedLinks = (path) => {
    const segments = path.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1] || '';
    
    return [
      { path: `/${lastSegment}`, name: `Try /${lastSegment}`, icon: <FiLink />, probability: 'high' },
      { path: `/${lastSegment}-list`, name: `/${lastSegment}-list`, icon: <FiLink />, probability: 'medium' },
      { path: `/${lastSegment}s`, name: `/${lastSegment}s`, icon: <FiLink />, probability: 'low' },
      { path: `/api/${lastSegment}`, name: `/api/${lastSegment}`, icon: <FiCode />, probability: 'api' }
    ];
  };

  useEffect(() => {
    // Initialize suggestions and links
    setSuggestions(getSuggestions(location.pathname));
    setRelatedLinks(getRelatedLinks(location.pathname));
    setFunFacts(facts);
    setDadJokes(dadJokeList);

    // Random joke index
    setJokeIndex(Math.floor(Math.random() * jokes.length));

    // Create particles
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    setParticles(newParticles);

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
  }, [navigate, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast or feedback
  };

  const handleReportIssue = () => {
    navigate('/support', { state: { issue: '404', url: location.pathname } });
  };

  const getRandomIcon = () => {
    const icons = [
      <FaGhost />,
      <FaRocket />,
      <FaSpaceShuttle />,
      <FaSatellite />,
      <FaUserAstronaut />,
      <FaMeteor />,
      <FaMoon />,
      <FaSun />,
      <FaStar />,
      <GiSpaceship />,
      <GiAlienSkull />,
      <GiGalaxy />,
      <GiPlanetConquest />,
      <GiBlackHoleBolas />,
      <FaRobot />,
      <FaBug />,
      <FaSkull />,
      <FaDragon />,
      <FaPhoenixFramework />,
      <FaMagic />,
      <FaHatWizard />
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
      pointerEvents: 'none'
    },
    particle: {
      position: 'absolute',
      borderRadius: '50%',
      background: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)',
      transition: 'transform 0.1s ease'
    },
    content: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '800px',
      width: '90%',
      padding: '40px',
      textAlign: 'center',
      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
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
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
            }}
          />
        ))}
      </div>
{/* Main Content */}
<div style={styles.content}>
  {/* Error Code with Animation */}
  <div style={{ marginBottom: '30px', position: 'relative' }}>
    <div style={{
      fontSize: '180px',
      fontWeight: 'bold',
      lineHeight: 1,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 10px 30px rgba(102,126,234,0.3)',
      animation: 'float 3s ease-in-out infinite'
    }}>
      {errorCode}
    </div>
    <div style={{
      fontSize: '28px',
      color: theme === 'dark' ? '#fff' : '#333',
      marginTop: '-20px',
      fontWeight: 500
    }}>
      {errorMessage}
    </div>
  </div>

  {/* Fun Icon */}
  <div style={{
    fontSize: '80px',
    marginBottom: '20px',
    animation: 'spin 10s linear infinite'
  }}>
    {getRandomIcon()}
  </div>

  {/* Location Info */}
  <div style={{
    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'inline-block'
  }}>
    <code style={{
      color: theme === 'dark' ? '#ff6b6b' : '#dc3545',
      fontSize: '16px'
    }}>
      {location.pathname}
    </code>
    <button
      onClick={handleCopyUrl}
      style={{
        marginLeft: '10px',
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
  </div>

  {/* Funny Message */}
  <div style={{
    fontSize: '18px',
    color: theme === 'dark' ? '#e2e8f0' : '#4a5568',
    marginBottom: '30px',
    lineHeight: 1.6,
    padding: '0 20px'
  }}>
    <p>Oops! Looks like you've ventured into the digital void.</p>
    <p style={{ fontStyle: 'italic', color: '#667eea' }}>
      "{jokes[jokeIndex]?.setup}"
    </p>
    <p style={{ fontSize: '20px', marginTop: '10px' }}>
      {jokes[jokeIndex]?.punchline}
    </p>
  </div>

  {/* Countdown */}
  <div style={{
    marginBottom: '30px',
    fontSize: '16px',
    color: theme === 'dark' ? '#a0aec0' : '#718096'
  }}>
    Redirecting to home in <span style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#667eea'
    }}>{countdown}</span> seconds...
  </div>

  {/* Search Bar */}
  <form onSubmit={handleSearch} style={{
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    maxWidth: '500px',
    margin: '0 auto 30px'
  }}>
    <input
      type="text"
      placeholder="Search for what you're looking for..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        flex: 1,
        padding: '12px 20px',
        border: `2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        borderRadius: '30px',
        fontSize: '16px',
        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'white',
        color: theme === 'dark' ? 'white' : '#333',
        outline: 'none'
      }}
    />
    <button
      type="submit"
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
        gap: '5px'
      }}
    >
      <FiSearch />
      Search
    </button>
  </form>

  {/* Action Buttons */}
  <div style={{
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap'
  }}>
    <button
      onClick={() => navigate('/')}
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
      <FiHome />
      Go Home
    </button>
    
    <button
      onClick={() => navigate(-1)}
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
      <FiArrowLeft />
      Go Back
    </button>
    
    <button
      onClick={handleReportIssue}
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
      <FiHelpCircle />
      Report Issue
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
    {showDetails ? 'Hide Details' : 'Show Technical Details'}
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
        <FiCode />
        Technical Details
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>Status Code</div>
          <code style={{ color: '#ff6b6b' }}>{errorCode} Not Found</code>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>Request URL</div>
          <code style={{ color: '#667eea' }}>{window.location.href}</code>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>Path</div>
          <code>{location.pathname}</code>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>Timestamp</div>
          <code>{new Date().toLocaleString()}</code>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>User Agent</div>
          <code style={{ fontSize: '11px' }}>{navigator.userAgent.substring(0, 50)}...</code>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>Referrer</div>
          <code>{document.referrer || 'Direct'}</code>
        </div>
      </div>
    </div>
  )}
        {/* Suggestions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px',
              fontSize: '16px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiMap />
              Suggested Pages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => navigate(suggestion.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: theme === 'dark' ? '#fff' : '#333',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <span style={{ color: '#667eea' }}>{suggestion.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{suggestion.name}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{suggestion.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px',
              fontSize: '16px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiLink />
              Did you mean?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => navigate(link.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: theme === 'dark' ? '#fff' : '#333'
                  }}
                >
                  <span style={{
                    color: link.probability === 'high' ? '#28a745' : 
                           link.probability === 'medium' ? '#ffc107' : 
                           link.probability === 'low' ? '#dc3545' : '#667eea'
                  }}>
                    {link.icon}
                  </span>
                  <div>
                    <div>{link.name}</div>
                    <div style={{ fontSize: '11px', color: '#999', textTransform: 'capitalize' }}>
                      {link.probability} probability
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fun Facts & Jokes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px',
              fontSize: '16px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FaStar />
              Fun Fact #{Math.floor(Math.random() * 100)}
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: theme === 'dark' ? '#e2e8f0' : '#4a5568'
            }}>
              {funFacts[Math.floor(Math.random() * funFacts.length)]}
            </p>
          </div>

          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3 style={{
              margin: '0 0 15px',
              fontSize: '16px',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FaSmile />
              Dad Joke
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: theme === 'dark' ? '#e2e8f0' : '#4a5568',
              fontStyle: 'italic'
            }}>
              {dadJokes[Math.floor(Math.random() * dadJokes.length)]}
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
          <a href="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms</a>
          <a href="/support" style={{ color: '#667eea', textDecoration: 'none' }}>Support</a>
          <a href="/contact" style={{ color: '#667eea', textDecoration: 'none' }}>Contact</a>
          <a href="/about" style={{ color: '#667eea', textDecoration: 'none' }}>About</a>
        </div>

        {/* Social Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '10px'
        }}>
          <a href="#" style={{ color: '#667eea', fontSize: '20px' }}><FiGithub /></a>
          <a href="#" style={{ color: '#667eea', fontSize: '20px' }}><FiTwitter /></a>
          <a href="#" style={{ color: '#667eea', fontSize: '20px' }}><FiFacebook /></a>
          <a href="#" style={{ color: '#667eea', fontSize: '20px' }}><FiInstagram /></a>
          <a href="#" style={{ color: '#667eea', fontSize: '20px' }}><FiLinkedin /></a>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
