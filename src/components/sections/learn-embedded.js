import React, { useEffect, useRef, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { Icon } from '@components/icons';

const StyledLearnEmbeddedSection = styled.section`
  max-width: 1200px;

  .inner {
    display: flex;
    flex-direction: column;

    h2 {
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 600;
      margin-bottom: 30px;
      color: var(--lightest-slate);
    }

    p {
      margin-bottom: 15px;
      color: var(--light-slate);
      font-size: var(--fz-lg);
    }
  }

  .interactive-container {
    display: grid;
    grid-template-columns: 250px 1fr 1fr;
    gap: 25px;
    margin-top: 30px;
    min-height: 450px;
    
    @media (max-width: 1080px) {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 20px;
    }
    
    @media (max-width: 768px) {
      margin-top: 20px;
      gap: 15px;
    }
  }

  .topics-list {
    background-color: var(--light-navy);
    border-radius: var(--border-radius);
    padding: 20px;
    max-height: 450px;
    overflow-y: auto;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--navy);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--green);
      border-radius: 4px;
    }

    @media (max-width: 1080px) {
      max-height: none;
      padding: 15px;
    }

    @media (max-width: 768px) {
      overflow-x: auto;
      white-space: nowrap;
      padding: 10px;
      
      ul {
        display: flex;
        flex-wrap: nowrap;
        -webkit-overflow-scrolling: touch;
      }
      
      li {
        display: inline-block;
        margin-right: 8px;
        margin-bottom: 0;
        white-space: nowrap;
      }
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      padding: 10px 15px;
      margin-bottom: 8px;
      border-radius: var(--border-radius);
      transition: var(--transition);
      cursor: pointer;
      color: var(--light-slate);
      
      &:hover, &.active {
        background-color: var(--navy);
        color: var(--green);
      }
      
      &.active {
        border-left: 2px solid var(--green);
        padding-left: 13px;
        font-weight: 500;
        
        @media (max-width: 768px) {
          border-left: none;
          border-bottom: 2px solid var(--green);
          padding-left: 15px;
          padding-bottom: 8px;
        }
      }
      
      @media (max-width: 768px) {
        padding: 10px 12px;
        font-size: var(--fz-sm);
        touch-action: manipulation;
      }
    }
  }

  .topic-image {
    background-color: var(--light-navy);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    padding: 20px;
    position: relative;
    
    @media (max-width: 768px) {
      padding: 15px;
      min-height: 250px;
    }
    
    img, .svg-diagram {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 4px;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.02);
      }
      
      @media (max-width: 768px) {
        max-height: 250px;
      }
    }
    
    .placeholder {
      color: var(--slate);
      font-style: italic;
    }
    
    .click-hint {
      font-size: var(--fz-xs);
      color: var(--green);
      margin-top: 8px;
      font-family: var(--font-mono);
      opacity: 0.8;
      transition: opacity 0.2s ease;
      
      @media (max-width: 768px) {
        background-color: rgba(17, 34, 64, 0.7);
        position: absolute;
        bottom: 15px;
        padding: 5px 10px;
        border-radius: 4px;
        opacity: 1;
        font-size: var(--fz-xxs);
      }
    }
    
    &:hover .click-hint {
      opacity: 1;
    }
    
    @media (hover: none) {
      .click-hint {
        opacity: 1;
      }
    }
  }

  .topic-description {
    background-color: var(--light-navy);
    border-radius: var(--border-radius);
    padding: 25px;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    display: flex;
    flex-direction: column;
    
    @media (max-width: 768px) {
      padding: 20px 15px;
    }
    
    h3 {
      color: var(--lightest-slate);
      font-size: var(--fz-xxl);
      margin-bottom: 15px;
      
      @media (max-width: 768px) {
        font-size: var(--fz-xl);
        margin-bottom: 10px;
      }
    }
    
    p {
      color: var(--light-slate);
      font-size: var(--fz-lg);
      line-height: 1.5;
      margin-bottom: 20px;
      flex: 1;
      
      @media (max-width: 768px) {
        font-size: var(--fz-md);
        margin-bottom: 15px;
      }
    }
    
    .github-link {
      display: inline-flex;
      align-items: center;
      margin-top: auto;
      color: var(--green);
      font-family: var(--font-mono);
      font-size: var(--fz-sm);
      padding: 8px 12px;
      border-radius: var(--border-radius);
      transition: var(--transition);
      
      @media (max-width: 768px) {
        align-self: center;
        padding: 10px 15px;
        background-color: rgba(100, 255, 218, 0.07);
      }
      
      svg {
        margin-right: 8px;
        width: 20px;
        height: 20px;
      }
      
      &:hover {
        text-decoration: underline;
        background-color: rgba(100, 255, 218, 0.1);
      }
    }
  }
`;

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 10, 15, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px) saturate(110%) brightness(0.9) contrast(1.1);
  -webkit-backdrop-filter: blur(15px) saturate(110%) brightness(0.9) contrast(1.1);
  
  &.show {
    opacity: 1;
    visibility: visible;
    
    .modal-content {
      transform: scale(1);
    }
  }
  
  @media (max-width: 768px) {
    backdrop-filter: blur(12px) saturate(110%) brightness(0.9);
    -webkit-backdrop-filter: blur(12px) saturate(110%) brightness(0.9);
  }
  
  .modal-content {
    position: relative;
    width: 100%;
    max-width: 1200px;
    height: auto;
    max-height: 95vh;
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-color: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    
    @media (max-width: 1280px) {
      max-width: 95%;
    }
    
    @media (max-width: 768px) {
      width: 95%;
      height: 90vh;
    }
    
    .image-container {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-in;
      width: 100%;
      height: 100%;
      position: relative;
      background-color: rgba(20, 20, 30, 0.2);
      border-radius: 15px;
      overflow: hidden;
      max-width: 1200px;
      max-height: 85vh;
      margin: 0 auto;
      box-sizing: border-box;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px) saturate(120%) brightness(1.05);
      -webkit-backdrop-filter: blur(10px) saturate(120%) brightness(1.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      transition: all 0.25s ease;
      border-radius: 15px;
      
      @media (max-width: 768px) {
        max-height: 80vh;
      }
    }
    
    .close-button {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(20, 20, 30, 0.4);
      backdrop-filter: blur(8px) saturate(120%);
      -webkit-backdrop-filter: blur(8px) saturate(120%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--white);
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
      z-index: 20;
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      
      @media (max-width: 768px) {
        top: 10px;
        right: 10px;
      }
      
      &:hover {
        color: var(--green);
        transform: rotate(90deg);
        background: rgba(20, 20, 30, 0.7);
        border: 1px solid var(--green);
      }
    }
    
    .zoom-controls {
      position: absolute;
      bottom: 15px;
      right: 15px;
      background: rgba(20, 20, 30, 0.4);
      border-radius: var(--border-radius);
      padding: 8px 15px;
      display: flex;
      align-items: center;
      font-size: var(--fz-sm);
      color: var(--lightest-slate);
      font-family: var(--font-mono);
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(8px) saturate(120%);
      -webkit-backdrop-filter: blur(8px) saturate(120%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10;
      
      .zoom-level {
        margin-right: 15px;
      }
      
      .reset-zoom {
        background: rgba(100, 255, 218, 0.1);
        border: 1px solid rgba(100, 255, 218, 0.3);
        border-radius: 4px;
        color: var(--green);
        font-family: var(--font-mono);
        font-size: var(--fz-xs);
        cursor: pointer;
        padding: 3px 8px;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(100, 255, 218, 0.2);
          transform: translateY(-1px);
        }
      }
    }
    
    &:hover .zoom-controls {
      opacity: 1;
    }
  }
  
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    border: 3px solid rgba(100, 255, 218, 0.1);
    border-top: 3px solid var(--green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 10;
    background: transparent;
    
    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }

  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

// Define animation styles for larger components
const spinAnimationStyle = `
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

// Topic data - in a real app, this could come from an API or markdown files
const topics = [
  {
    id: 'priority-inversion',
    title: 'Priority Inversion',
    description: 'A critical RTOS problem where a low-priority task indirectly blocks a high-priority task by holding a resource needed by a medium-priority task. This can lead to missed deadlines and unpredictable behavior in real-time systems.',
    image: '/images/embedded/priority-inversion.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/priority_inversion'
  },
  {
    id: 'mutex-semaphore',
    title: 'Mutex vs Semaphore',
    description: 'Understanding the fundamental differences between mutexes and semaphores. While mutexes provide exclusive access with ownership (only the locking task can unlock), semaphores can count resources and be signaled by any task, making them suitable for different synchronization scenarios.',
    image: '/images/embedded/mutex-semaphore.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/mutex_semaphore'
  },
  {
    id: 'memory-management',
    title: 'Memory Management',
    description: 'Explore memory organization in embedded systems, including stack, heap, BSS, data, and text/code sections. Learn about efficient memory allocation strategies, avoiding fragmentation, and memory protection techniques essential for reliable embedded applications.',
    image: '/images/embedded/memory-management-improved.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Memory/management'
  },
  {
    id: 'rtos',
    title: 'RTOS Fundamentals',
    description: 'Core concepts of Real-Time Operating Systems including task scheduling, priority-based execution, and deterministic timing. Understand how an RTOS differs from general-purpose operating systems and when to use one in your embedded projects.',
    image: '/images/embedded/rtos.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/fundamentals'
  },
  {
    id: 'interrupt-handling',
    title: 'Interrupt Handling',
    description: 'Master the critical concept of hardware and software interrupts in embedded systems. Learn about interrupt service routines (ISRs), interrupt controllers, priorities, and best practices for writing efficient interrupt handlers.',
    image: '/images/embedded/interrupt-handling.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Interrupts'
  },
  {
    id: 'device-drivers',
    title: 'Device Drivers',
    description: 'Understand how to develop robust device drivers for embedded systems. This covers driver architecture, types of drivers, hardware abstraction layers, and implementation strategies for various peripherals.',
    image: '/images/embedded/device-drivers.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Drivers'
  },
  {
    id: 'boot-process',
    title: 'Boot Process',
    description: 'Explore the embedded system boot sequence from power-on to application execution. Learn about boot ROM, bootloaders, memory initialization, secure boot, and how to optimize boot time for your applications.',
    image: '/images/embedded/boot-process.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Firmware/boot_process'
  },
  {
    id: 'communication-protocols',
    title: 'Communication Protocols',
    description: 'Compare and contrast common embedded communication protocols like SPI, I2C, UART, CAN, and more. Understand their electrical characteristics, timing diagrams, advantages, limitations, and ideal use cases.',
    image: '/images/embedded/communication-protocols.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication'
  },
  {
    id: 'debugging',
    title: 'Debugging Techniques',
    description: 'Master essential debugging tools and techniques for embedded systems, including JTAG/SWD debugging, logic analyzers, oscilloscopes, printf debugging, and strategies for troubleshooting common embedded issues.',
    image: '/images/embedded/debugging.svg',
    githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Debugging'
  }
];

const LearnEmbedded = () => {
  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const revealContainer = useRef(null);
  const modalRef = useRef(null);
  const imageRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);
  
  // Preload the active topic image when it changes
  useEffect(() => {
    if (activeTopic.image) {
      const img = new Image();
      img.src = activeTopic.image;
    }
  }, [activeTopic]);

  // Handle modal open/close and body scroll lock
  useEffect(() => {
    const body = document.body;
    
    if (isModalOpen) {
      // Prevent scrolling when modal is open
      body.style.overflow = 'hidden';
      
      // Pre-load the image when modal is opened
      if (activeTopic.image) {
        const preloadImg = new Image();
        preloadImg.src = activeTopic.image;
        preloadImg.onload = handleModalImageLoad;
        preloadImg.onerror = handleModalImageError;
      } else {
        setIsImageLoading(false);
      }
      
      // Reset zoom level when opening modal
      setZoomLevel(1);
    } else {
      // Re-enable scrolling when modal is closed
      body.style.overflow = '';
    }
    
    return () => {
      // Cleanup - ensure scrolling is re-enabled when component unmounts
      body.style.overflow = '';
    };
  }, [isModalOpen, activeTopic.image]);
  
  // Handle wheel events for zooming
  useEffect(() => {
    const modalContent = modalRef.current;
    
    const handleWheel = (e) => {
      if (isModalOpen && !isImageLoading) {
        handleWheelZoom(e);
      }
    };
    
    if (modalContent) {
      modalContent.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (modalContent) {
        modalContent.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isModalOpen, isImageLoading, zoomLevel]);
  
  // Reset image position when zoom changes
  useEffect(() => {
    if (imageRef.current) {
      // Ensure the image stays centered as it zooms
      imageRef.current.style.transformOrigin = 'center center';
    }
  }, [zoomLevel]);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    // Only set loading to true if we're showing the modal
    if (activeTopic.image) {
      setIsImageLoading(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset loading state and zoom when closing
    setIsImageLoading(false);
    setZoomLevel(1);
  };

  const handleModalImageLoad = () => {
    // Ensure we only update state if component is still mounted
    console.log("Image loaded successfully");
    setIsImageLoading(false);
  };

  const handleModalImageError = (e) => {
    console.error("Error loading image:", e);
    setIsImageLoading(false);
    // You could set an error state here if you want to display an error message
  };
  
  const handleWheelZoom = (e) => {
    // Prevent default scrolling behavior
    e.preventDefault();
    
    // Get current container dimensions
    const container = modalRef.current;
    if (!container) return;
    
    // Determine zoom direction based on wheel delta
    const zoomDirection = e.deltaY < 0 ? 1 : -1;
    
    // Get the image and container dimensions
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.querySelector('.image-container').getBoundingClientRect();
    
    // Calculate new zoom level with constraints (min: 0.5, max: 5)
    const zoomSpeed = 0.1;
    let newZoomLevel = Math.min(Math.max(zoomLevel + (zoomDirection * zoomSpeed), 0.5), 5);
    
    // Apply magnetic effect: if zooming would cause the image to be slightly larger than container,
    // snap to the container bounds
    if (zoomDirection < 0) { // Zooming out
      // When zooming out and almost fitting container, snap to fit
      const imgWidth = imgRect.width / zoomLevel * newZoomLevel;
      const imgHeight = imgRect.height / zoomLevel * newZoomLevel;
      
      // If very close to fitting, snap to container dimensions
      const snapThreshold = 0.05; // 5% threshold for snapping
      
      if (Math.abs(imgWidth - containerRect.width) / containerRect.width < snapThreshold &&
          imgWidth < containerRect.width) {
        // Calculate the exact zoom level that makes the image width match container width
        newZoomLevel = (containerRect.width / (imgRect.width / zoomLevel)) * 0.98; // 98% of container to create slight margin
      }
      
      if (Math.abs(imgHeight - containerRect.height) / containerRect.height < snapThreshold &&
          imgHeight < containerRect.height) {
        // Choose the smaller of width-based and height-based zoom to ensure image fits
        const heightBasedZoom = (containerRect.height / (imgRect.height / zoomLevel)) * 0.98;
        newZoomLevel = Math.min(newZoomLevel, heightBasedZoom);
      }
    }
    
    // Update zoom level state
    setZoomLevel(newZoomLevel);
    
    // Update cursor based on zoom level
    if (imageRef.current) {
      imageRef.current.style.cursor = newZoomLevel > 1 ? 'zoom-out' : 'zoom-in';
      
      // Ensure image stays within modal bounds
      const imageRect = imageRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Check if image dimensions exceed container dimensions
      if (imageRect.width > containerRect.width || imageRect.height > containerRect.height) {
        // We're already constraining with CSS overflow: hidden
        // This is just to update the UI feedback
        imageRef.current.style.borderRadius = '0';
      } else {
        imageRef.current.style.borderRadius = '15px';
      }
    }
  };
  
  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <StyledLearnEmbeddedSection id="learn-embedded" ref={revealContainer}>
      <h2 className="numbered-heading">Learn Embedded</h2>

      <div className="inner">
        <p>
          Explore core embedded systems concepts explained with practical examples. 
          Each topic includes explanations, diagrams, and working code samples on GitHub.
        </p>

        <div className="interactive-container">
          {/* Topics List - Left Column */}
          <div className="topics-list">
            <ul>
              {topics.map(topic => (
                <li 
                  key={topic.id} 
                  className={activeTopic.id === topic.id ? 'active' : ''}
                  onClick={() => setActiveTopic(topic)}
                >
                  {topic.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Image/Diagram - Middle Column */}
          <div className="topic-image">
            {activeTopic.image ? (
              <>
                <img
                  key={activeTopic.id} // Add key to force re-render when topic changes
                  src={activeTopic.image}
                  alt={`${activeTopic.title} diagram`}
                  className="svg-diagram"
                  onClick={openModal}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="click-hint">Click to expand</span>
              </>
            ) : (
              <p className="placeholder">Diagram coming soon</p>
            )}
            <p className="placeholder" style={{display: 'none'}}>Image not available</p>
          </div>

          {/* Description - Right Column */}
          <div className="topic-description">
            <h3>{activeTopic.title}</h3>
            <p>{activeTopic.description}</p>
            <a 
              href={activeTopic.githubLink} 
              className="github-link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Icon name="GitHub" />
              View Code on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Modal for expanded image */}
      <StyledModal className={isModalOpen ? 'show' : ''}>
        <div className="modal-content" ref={modalRef}>
          <button className="close-button" onClick={closeModal} aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {isImageLoading && <div className="loading-spinner"></div>}
          {activeTopic.image && (
            <div className="image-container">
              <img 
                ref={imageRef}
                key={activeTopic.id} // Add key to force re-render when topic changes
                src={activeTopic.image} 
                alt={`${activeTopic.title} diagram expanded`}
                onLoad={handleModalImageLoad}
                onError={handleModalImageError}
                style={{
                  opacity: isImageLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease, transform 0.2s ease',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
                  width: activeTopic.image.endsWith('.svg') ? '100%' : 'auto',
                  height: 'auto',
                  maxHeight: '85vh',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  background: 'transparent',
                  boxShadow: 'none',
                  borderRadius: '15px'
                }}
              />
              {!isImageLoading && (
                <div className="zoom-controls">
                  <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                  {zoomLevel !== 1 && (
                    <button className="reset-zoom" onClick={resetZoom}>Reset</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </StyledModal>
    </StyledLearnEmbeddedSection>
  );
};

export default LearnEmbedded;
