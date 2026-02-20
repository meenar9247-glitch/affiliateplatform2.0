import React, { useState, useEffect, useRef } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCircle,
  FiMaximize2,
  FiMinimize2,
  FiPlay,
  FiPause,
  FiRotateCw
} from 'react-icons/fi';

const Carousel = ({
  items = [],
  autoPlay = false,
  interval = 3000,
  infinite = true,
  showArrows = true,
  showDots = true,
  showThumbnails = false,
  showCounter = false,
  showPlayPause = false,
  showFullscreen = false,
  effect = 'slide', // slide, fade, flip, cube
  direction = 'horizontal', // horizontal, vertical
  speed = 500,
  slidesToShow = 1,
  slidesToScroll = 1,
  centerMode = false,
  centerPadding = '50px',
  variableWidth = false,
  adaptiveHeight = true,
  pauseOnHover = true,
  swipeable = true,
  draggable = true,
  wheelable = false,
  keyboardControl = true,
  rtl = false,
  startIndex = 0,
  onSlideChange,
  onSlideClick,
  className = '',
  itemClassName = '',
  ...props
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const intervalRef = useRef(null);
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    if (autoPlay && isPlaying) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [autoPlay, isPlaying, currentIndex]);

  useEffect(() => {
    if (keyboardControl) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [keyboardControl, currentIndex]);

  useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex]);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimerRef.current = setInterval(() => {
      nextSlide();
    }, interval);
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
  };

  const pauseAutoplay = () => {
    if (pauseOnHover) {
      stopAutoplay();
    }
  };

  const resumeAutoplay = () => {
    if (pauseOnHover && isPlaying) {
      startAutoplay();
    }
  };

  const goToSlide = (index) => {
    let newIndex = index;
    
    if (index < 0) {
      newIndex = infinite ? items.length - 1 : 0;
    } else if (index >= items.length) {
      newIndex = infinite ? 0 : items.length - 1;
    }

    setCurrentIndex(newIndex);
    setDragOffset(0);
  };

  const nextSlide = () => {
    goToSlide(currentIndex + slidesToScroll);
  };

  const prevSlide = () => {
    goToSlide(currentIndex - slidesToScroll);
  };

  const handleKeyDown = (e) => {
    if (direction === 'horizontal') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextSlide();
      }
    }
  };

  const handleTouchStart = (e) => {
    if (!swipeable) return;
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
    setTouchEnd(null);
    pauseAutoplay();
  };

  const handleTouchMove = (e) => {
    if (!swipeable || !touchStart) return;
    const touch = e.touches[0];
    setTouchEnd(touch.clientX);
    
    const diff = touch.clientX - touchStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!swipeable || !touchStart || !touchEnd) {
      setTouchStart(null);
      setDragOffset(0);
      resumeAutoplay();
      return;
    }

    const distance = touchEnd - touchStart;
    const threshold = 50;

    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setDragOffset(0);
    resumeAutoplay();
  };

  const handleDragStart = (e) => {
    if (!draggable) return;
    e.preventDefault();
    setDragStart(e.clientX);
    setIsDragging(true);
    pauseAutoplay();
  };

  const handleDragMove = (e) => {
    if (!draggable || !isDragging) return;
    e.preventDefault();
    const diff = e.clientX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!draggable || !isDragging) return;
    
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
    resumeAutoplay();
  };

  const handleWheel = (e) => {
    if (!wheelable) return;
    e.preventDefault();
    
    if (e.deltaY > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  const toggleFullscreen = () => {
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getSlideStyle = (index) => {
    const offset = (index - currentIndex) * 100 + (dragOffset / containerRef.current?.offsetWidth) * 100;
    const style = {
      transition: isDragging ? 'none' : `transform ${speed}ms ease`,
      transform: `translateX(${offset}%)`
    };

    if (effect === 'fade') {
      return {
        opacity: index === currentIndex ? 1 : 0,
        transition: `opacity ${speed}ms ease`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      };
    }

    return style;
  };

  const getSlideClasses = (index) => {
    const classes = ['carousel-slide', itemClassName];
    
    if (index === currentIndex) {
      classes.push('active');
    }
    
    if (centerMode && index === currentIndex) {
      classes.push('center');
    }
    
    return classes.join(' ');
  };

  // Styles
  const styles = `
    .carousel-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--bg-primary);
    }

    .carousel-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: var(--z-modal);
      background: var(--bg-primary);
    }

    .carousel-wrapper {
      position: relative;
      overflow: hidden;
      cursor: ${draggable ? 'grab' : 'default'};
    }

    .carousel-wrapper.dragging {
      cursor: grabbing;
    }

    .carousel-track {
      display: flex;
      transition: transform ${speed}ms ease;
    }

    .carousel-track.vertical {
      flex-direction: column;
    }

    /* Slides */
    .carousel-slide {
      flex: 0 0 ${100 / slidesToShow}%;
      padding: 0 ${centerMode ? centerPadding : '0'};
      transition: transform ${speed}ms ease;
    }

    .carousel-slide.vertical {
      flex: 0 0 auto;
    }

    .carousel-slide.center {
      transform: scale(1.1);
      z-index: 2;
    }

    .carousel-slide img {
      width: 100%;
      height: auto;
      object-fit: cover;
      pointer-events: none;
    }

    .carousel-slide-content {
      height: 100%;
    }

    /* Fade Effect */
    .fade-effect .carousel-track {
      position: relative;
    }

    .fade-effect .carousel-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity ${speed}ms ease;
    }

    .fade-effect .carousel-slide.active {
      opacity: 1;
      position: relative;
    }

    /* Arrows */
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all var(--transition-fast) var(--transition-ease);
      box-shadow: var(--shadow-md);
    }

    .carousel-arrow:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .carousel-arrow:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .carousel-arrow-left {
      left: 16px;
    }

    .carousel-arrow-right {
      right: 16px;
    }

    .carousel-arrow-vertical {
      left: 50%;
      transform: translateX(-50%);
    }

    .carousel-arrow-vertical.left {
      top: 16px;
      bottom: auto;
    }

    .carousel-arrow-vertical.right {
      bottom: 16px;
      top: auto;
    }

    /* Dots */
    .carousel-dots {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
      background: rgba(255, 255, 255, 0.8);
      padding: 8px 12px;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-md);
    }

    .carousel-dots.vertical {
      flex-direction: column;
      top: 50%;
      left: auto;
      right: 16px;
      transform: translateY(-50%);
    }

    .carousel-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-ease);
      border: none;
      padding: 0;
    }

    .carousel-dot:hover {
      background: var(--primary);
    }

    .carousel-dot.active {
      width: 24px;
      background: var(--primary);
    }

    .carousel-dot.vertical.active {
      width: 8px;
      height: 24px;
    }

    /* Thumbnails */
    .carousel-thumbnails {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      overflow-x: auto;
      padding: 8px;
    }

    .carousel-thumbnail {
      width: 80px;
      height: 60px;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      opacity: 0.6;
      transition: all var(--transition-fast) var(--transition-ease);
      border: 2px solid transparent;
    }

    .carousel-thumbnail:hover {
      opacity: 0.8;
    }

    .carousel-thumbnail.active {
      opacity: 1;
      border-color: var(--primary);
    }

    .carousel-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Counter */
    .carousel-counter {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      z-index: 10;
    }

    /* Controls */
    .carousel-controls {
      position: absolute;
      top: 16px;
      left: 16px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }

    .carousel-control-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .carousel-control-btn:hover {
      background: var(--primary);
      color: white;
    }

    /* Loading State */
    .carousel-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .carousel-spinner {
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
      .carousel-container {
        background: var(--dark-bg-secondary);
      }

      .carousel-arrow {
        background: var(--dark-bg-tertiary);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .carousel-arrow:hover:not(:disabled) {
        background: var(--dark-primary);
        color: white;
      }

      .carousel-dots {
        background: rgba(0, 0, 0, 0.8);
      }

      .carousel-dot {
        background: var(--dark-text-muted);
      }

      .carousel-control-btn {
        background: rgba(0, 0, 0, 0.8);
        border-color: var(--dark-border);
        color: var(--dark-text-secondary);
      }

      .carousel-counter {
        background: rgba(0, 0, 0, 0.8);
      }

      .carousel-loading {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .carousel-arrow {
        width: 32px;
        height: 32px;
      }

      .carousel-thumbnail {
        width: 60px;
        height: 45px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        ref={containerRef}
        className={`
          carousel-container
          ${isFullscreen ? 'fullscreen' : ''}
          ${effect === 'fade' ? 'fade-effect' : ''}
          ${className}
        `}
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
        onWheel={handleWheel}
      >
        {/* Controls */}
        {(showPlayPause || showFullscreen) && (
          <div className="carousel-controls">
            {showPlayPause && (
              <button className="carousel-control-btn" onClick={togglePlayPause}>
                {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
              </button>
            )}
            {showFullscreen && (
              <button className="carousel-control-btn" onClick={toggleFullscreen}>
                {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
              </button>
            )}
          </div>
        )}

        {/* Counter */}
        {showCounter && (
          <div className="carousel-counter">
            {currentIndex + 1} / {items.length}
          </div>
        )}

        {/* Carousel Wrapper */}
        <div
          ref={trackRef}
          className={`
            carousel-wrapper
            ${isDragging ? 'dragging' : ''}
            ${direction}
          `}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div
            className={`carousel-track ${direction}`}
            style={{
              transform: effect === 'fade' 
                ? 'none' 
                : `translate${direction === 'horizontal' ? 'X' : 'Y'}(-${currentIndex * 100}%)`
            }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={getSlideClasses(index)}
                style={getSlideStyle(index)}
                onClick={() => onSlideClick?.(index)}
              >
                <div className="carousel-slide-content">
                  {typeof item === 'string' ? (
                    <img src={item} alt={`Slide ${index + 1}`} />
                  ) : (
                    item
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        {showArrows && items.length > slidesToShow && (
          <>
            <button
              className={`carousel-arrow carousel-arrow-left ${direction === 'vertical' ? 'carousel-arrow-vertical' : ''}`}
              onClick={prevSlide}
              disabled={!infinite && currentIndex === 0}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className={`carousel-arrow carousel-arrow-right ${direction === 'vertical' ? 'carousel-arrow-vertical right' : ''}`}
              onClick={nextSlide}
              disabled={!infinite && currentIndex === items.length - slidesToShow}
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots */}
        {showDots && (
          <div className={`carousel-dots ${direction}`}>
            {items.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''} ${direction}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}

        {/* Thumbnails */}
        {showThumbnails && (
          <div className="carousel-thumbnails">
            {items.map((item, index) => (
              <div
                key={index}
                className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                {typeof item === 'string' ? (
                  <img src={item} alt={`Thumbnail ${index + 1}`} />
                ) : (
                  item.props?.children || <div>Thumbnail {index + 1}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Image Carousel Component
export const ImageCarousel = ({ images = [], ...props }) => {
  return (
    <Carousel
      items={images}
      showThumbnails
      effect="slide"
      {...props}
    />
  );
};

// Banner Carousel Component
export const BannerCarousel = ({ banners = [], ...props }) => {
  return (
    <Carousel
      items={banners}
      autoPlay
      interval={5000}
      showDots
      showArrows
      effect="fade"
      {...props}
    />
  );
};

// Product Carousel Component
export const ProductCarousel = ({ products = [], ...props }) => {
  const styles = `
    .product-carousel-slide {
      padding: 16px;
    }

    .product-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: all var(--transition-base) var(--transition-ease);
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .product-info {
      padding: 16px;
    }

    .product-name {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0 0 8px 0;
    }

    .product-price {
      font-size: var(--text-lg);
      font-weight: var(--font-bold);
      color: var(--primary);
    }

    .product-original-price {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-decoration: line-through;
      margin-left: 8px;
    }

    @media (prefers-color-scheme: dark) {
      .product-card {
        background: var(--dark-bg-secondary);
      }

      .product-name {
        color: var(--dark-text-primary);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Carousel
        items={products.map(product => (
          <div className="product-carousel-slide">
            <div className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <div>
                  <span className="product-price">${product.price}</span>
                  {product.originalPrice && (
                    <span className="product-original-price">${product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        slidesToShow={3}
        {...props}
      />
    </>
  );
};

// Testimonial Carousel Component
export const TestimonialCarousel = ({ testimonials = [], ...props }) => {
  const styles = `
    .testimonial-carousel-slide {
      padding: 20px;
    }

    .testimonial-card {
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-md);
      text-align: center;
    }

    .testimonial-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 16px;
      overflow: hidden;
    }

    .testimonial-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .testimonial-content {
      font-size: var(--text-base);
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: 16px;
      font-style: italic;
    }

    .testimonial-author {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .testimonial-role {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    @media (prefers-color-scheme: dark) {
      .testimonial-card {
        background: var(--dark-bg-secondary);
      }

      .testimonial-content {
        color: var(--dark-text-primary);
      }

      .testimonial-author {
        color: var(--dark-text-primary);
      }

      .testimonial-role {
        color: var(--dark-text-muted);
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <Carousel
        items={testimonials.map(testimonial => (
          <div className="testimonial-carousel-slide">
            <div className="testimonial-card">
              {testimonial.avatar && (
                <div className="testimonial-avatar">
                  <img src={testimonial.avatar} alt={testimonial.author} />
                </div>
              )}
              <p className="testimonial-content">{testimonial.content}</p>
              <h4 className="testimonial-author">{testimonial.author}</h4>
              <p className="testimonial-role">{testimonial.role}</p>
            </div>
          </div>
        ))}
        slidesToShow={2}
        autoPlay
        interval={5000}
        {...props}
      />
    </>
  );
};

export default Carousel;
