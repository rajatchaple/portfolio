import React, { useState } from 'react';
import styled from 'styled-components';
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

  .coming-soon-banner {
    background-color    power: {
      title: 'power-management',
      icon: '📁',
      topics: [
        {
          id: 9,
          title: 'low-power-modes',
          filename: 'low-power-modes.md',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Sleep modes, power optimization techniques, and battery-efficient embedded system design.',
          prerequisites: 'Microcontroller Basics, Interrupt Handling',
          status: 'not-started'
        }
      ]
    },
    images: {
      title: 'images',
      icon: '📁',
      topics: [
        {
          id: 10,
          title: 'circuit-diagrams',
          filename: 'circuit-diagrams.md',
          type: 'md',
          difficulty: 'beginner',
          description: 'Collection of circuit diagrams, schematics, and visual references for embedded systems projects.',
          prerequisites: 'None',
          status: 'completed',
          githubLink: 'https://github.com/rajatchaple/embedded-circuits'
        },
        {
          id: 11,
          title: 'pcb-layouts',
          filename: 'pcb-layouts.md',
          type: 'md',
          difficulty: 'intermediate',
          description: 'PCB design examples, layouts, and best practices for embedded hardware development.',
          prerequisites: 'Circuit Diagrams',
          status: 'completed',
          githubLink: 'https://github.com/rajatchaple/pcb-designs'
        },
        {
          id: 12,
          title: 'project-photos',
          filename: 'project-photos.md',
          type: 'md',
          difficulty: 'beginner',
          description: 'Photo gallery of completed embedded systems projects and prototypes.',
          prerequisites: 'None',
          status: 'completed',
          imageGallery: '/images/embedded/gallery'
        }
      ]
    } 218, 0.1);
    border: 1px solid rgba(100, 255, 218, 0.3);
    border-radius: var(--border-radius);
    padding: 20px;
    margin-bottom: 25px;
    text-align: center;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    
    h3 {
      color: var(--green);
      margin-bottom: 10px;
      font-size: var(--fz-xl);
      
      @media (max-width: 768px) {
        font-size: var(--fz-lg);
      }
    }
    
    p {
      font-size: var(--fz-md);
      color: var(--lightest-slate);
      max-width: 700px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        font-size: var(--fz-sm);
      }
    }
    
    @media (max-width: 768px) {
      padding: 15px;
    }
  }

  .learning-platform {
    margin-top: 40px;
  }

  .search-bar {
    margin-bottom: 25px;
    
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--light-navy);
      border: 1px solid var(--dark-slate);
      border-radius: 12px;
      padding: 0 16px;
      width: 100%;
      max-width: none;
      transition: all 0.3s ease;
      
      @media (max-width: 768px) {
        max-width: 500px;
      }
      
      &:focus-within {
        border-color: var(--green);
        box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
      }
      
      svg {
        color: var(--slate);
        width: 18px;
        height: 18px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      
      input {
        background: none;
        border: none;
        color: var(--lightest-slate);
        font-size: var(--fz-md);
        padding: 14px 0;
        width: 100%;
        outline: none;
        
        &::placeholder {
          color: var(--slate);
        }
      }
      
      .clear-search {
        background: none;
        border: none;
        color: var(--slate);
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        transition: var(--transition);
        
        &:hover {
          color: var(--green);
          background: rgba(100, 255, 218, 0.1);
        }
        
        svg {
          width: 16px;
          height: 16px;
          margin: 0;
        }
      }
    }
  }

  .modern-container {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    @media (max-width: 768px) {
      gap: 12px;
    }
  }

  .navigation-sidebar {
    background: linear-gradient(135deg, var(--light-navy) 0%, rgba(23, 42, 69, 0.8) 100%);
    border: 1px solid var(--dark-slate);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    height: 600px;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
    
    @media (max-width: 1024px) {
      height: 400px;
    }
    
    @media (max-width: 768px) {
      height: 350px;
      border-radius: 12px;
    }
    
    @media (max-width: 480px) {
      height: 300px;
      border-radius: 8px;
    }
    
    /* Completely hide any external link icons in sidebar */
    .feather-external-link,
    [class*="external"],
    [aria-label*="External"] {
      display: none !important;
    }
    
    /* Hide pseudo-elements that might contain external link icons */
    *::after,
    *::before {
      content: none !important;
    }
    
    .nav-header {
      padding: 20px;
      border-bottom: 1px solid rgba(100, 255, 218, 0.1);
      background: rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
      
      @media (max-width: 768px) {
        padding: 16px;
      }
      
      @media (max-width: 480px) {
        padding: 12px;
      }
      
      .header-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, var(--green), #4fd6b3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        font-size: 16px;
      }
      
      .title {
        color: var(--lightest-slate);
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
        
        @media (max-width: 768px) {
          font-size: 16px;
        }
        
        @media (max-width: 480px) {
          font-size: 14px;
        }
      }
      
      .subtitle {
        color: var(--slate);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        
        .badge {
          background: var(--green);
          color: var(--navy);
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
        }
      }
    }
    
    .category-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      
      /* Custom scrollbar styling */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(100, 255, 218, 0.05);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(100, 255, 218, 0.3);
        border-radius: 3px;
        
        &:hover {
          background: rgba(100, 255, 218, 0.5);
        }
      }
      
      /* For Firefox */
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 255, 218, 0.3) rgba(100, 255, 218, 0.05);
      
      .category-item {
        margin-bottom: 4px;
        
        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          
          &:hover {
            background: rgba(100, 255, 218, 0.08);
            transform: translateX(2px);
          }
          
          .category-icon {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            
            &.fundamentals { background: linear-gradient(135deg, #96CEB4, #7ab899); }
            &.communication { background: linear-gradient(135deg, #4ECDC4, #3ab5ac); }
            &.realtime { background: linear-gradient(135deg, #FF6B6B, #e55555); }
            &.power { background: linear-gradient(135deg, #FFEAA7, #f7d794); }
          }
          
          .category-info {
            flex: 1;
            
            .category-name {
              color: var(--lightest-slate);
              font-size: 14px;
              font-weight: 500;
              margin-bottom: 2px;
              text-transform: capitalize;
            }
            
            .topic-count {
              color: var(--slate);
              font-size: 11px;
            }
          }
          
          .expand-icon {
            color: var(--slate);
            width: 16px;
            height: 16px;
            transition: transform 0.2s ease;
            
            &.expanded {
              transform: rotate(90deg);
            }
          }
        }
        
        .topics-list {
          overflow: hidden;
          transition: max-height 0.3s ease;
          max-height: 0;
          
          &.expanded {
            max-height: none;
          }
          
          .topic-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px 8px 56px;
            cursor: pointer;
            border-radius: 8px;
            margin: 2px 8px;
            transition: all 0.2s ease;
            
            &:hover {
              background: rgba(100, 255, 218, 0.06);
            }
            
            &.active {
              background: rgba(100, 255, 218, 0.12);
              border-left: 3px solid var(--green);
              
              .topic-name {
                color: var(--green);
                font-weight: 500;
              }
            }
            
            .topic-indicator {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              flex-shrink: 0;
              
              &.fundamentals { background: #96CEB4; }
              &.communication { background: #4ECDC4; }
              &.realtime { background: #FF6B6B; }
              &.power { background: #FFEAA7; }
            }
            
            .topic-name {
              color: var(--light-slate);
              font-size: 13px;
              flex: 1;
              font-weight: 400;
            }
            
            .status-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              
              &.completed { background: #4CAF50; }
              &.in-progress { background: #FF9800; }
              &.not-started { background: var(--dark-slate); }
            }
          }
        }
      }
    }
  }

  .content-panel {
    background: linear-gradient(135deg, var(--light-navy) 0%, rgba(23, 42, 69, 0.9) 100%);
    border: 1px solid var(--dark-slate);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    
    @media (max-width: 768px) {
      padding: 24px;
      border-radius: 12px;
    }
    
    @media (max-width: 480px) {
      padding: 16px;
      border-radius: 8px;
    }
    
    .content-header {
      margin-bottom: 24px;
      
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 12px;
        color: var(--slate);
        font-size: 12px;
        
        .path-segment {
          &.current {
            color: var(--green);
            font-weight: 500;
          }
        }
        
        .separator {
          color: var(--dark-slate);
          margin: 0 4px;
        }
      }
      
      .title {
        color: var(--lightest-slate);
        font-size: clamp(24px, 4vw, 32px);
        font-weight: 700;
        margin-bottom: 12px;
        line-height: 1.2;
        background: linear-gradient(135deg, var(--lightest-slate), var(--green));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .meta {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        
        .difficulty {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          
          &.beginner { 
            background: linear-gradient(135deg, rgba(150, 206, 180, 0.2), rgba(150, 206, 180, 0.1));
            color: #96CEB4;
            border: 1px solid rgba(150, 206, 180, 0.3);
          }
          &.intermediate { 
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.1));
            color: #4ECDC4;
            border: 1px solid rgba(78, 205, 196, 0.3);
          }
          &.advanced { 
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
            color: #FF6B6B;
            border: 1px solid rgba(255, 107, 107, 0.3);
          }
        }
        
        .prerequisites {
          color: var(--slate);
          font-size: 12px;
          padding: 4px 8px;
          background: rgba(100, 255, 218, 0.05);
          border-radius: 6px;
        }
      }
    }
    
    .content-body {
      .description {
        color: var(--light-slate);
        font-size: var(--fz-lg);
        line-height: 1.6;
        margin-bottom: 32px;
      }
      
        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          
          @media (max-width: 768px) {
            gap: 8px;
          }
          
          @media (max-width: 480px) {
            flex-direction: column;
            gap: 8px;
          }
          
          .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: linear-gradient(135deg, var(--green), #4fd6b3);
            color: var(--navy);
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(100, 255, 218, 0.3);
            
            @media (max-width: 768px) {
              padding: 10px 16px;
              font-size: 13px;
              border-radius: 10px;
            }
            
            @media (max-width: 480px) {
              padding: 12px 16px;
              font-size: 14px;
              justify-content: center;
              width: 100%;
            }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(100, 255, 218, 0.4);
          }
          
          &.secondary {
            background: transparent;
            color: var(--green);
            border: 2px solid var(--green);
            box-shadow: none;
            
            &:hover {
              background: rgba(100, 255, 218, 0.1);
              box-shadow: 0 4px 12px rgba(100, 255, 218, 0.2);
            }
          }
          
          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const LearnEmbedded = () => {
  const [selectedCategory, setSelectedCategory] = useState('fundamentals');
  const [selectedTopic, setSelectedTopic] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(['fundamentals', 'communication', 'images']);

  // Enhanced topic categories with VS Code file structure
  const topicCategories = {
    fundamentals: {
      title: 'fundamentals',
      icon: '�',
      topics: [
        {
          id: 1,
          title: 'microcontroller-basics',
          filename: 'microcontroller-basics.md',
          type: 'md',
          difficulty: 'beginner',
          description: 'Introduction to microcontroller architecture, GPIO, timers, and basic peripherals. Perfect starting point for embedded programming.',
          prerequisites: 'Basic C programming',
          status: 'completed'
        },
        {
          id: 2,
          title: 'memory-management',
          filename: 'memory-management.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Explore memory organization, stack, heap, BSS, data and text sections. Learn efficient allocation and usage patterns.',
          prerequisites: 'Microcontroller Basics, C programming',
          status: 'in-progress'
        },
        {
          id: 3,
          title: 'interrupt-handling',
          filename: 'interrupt-handling.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Master interrupt service routines, priority levels, and real-time event handling for responsive embedded systems.',
          prerequisites: 'Microcontroller Basics',
          status: 'not-started'
        }
      ]
    },
    communication: {
      title: 'communication',
      icon: '�',
      topics: [
        {
          id: 4,
          title: 'uart-protocol',
          filename: 'uart-protocol.c',
          type: 'md',
          difficulty: 'beginner',
          description: 'Serial communication fundamentals, baud rates, frame structure, and error handling in UART systems.',
          prerequisites: 'Microcontroller Basics',
          status: 'completed'
        },
        {
          id: 5,
          title: 'spi-communication',
          filename: 'spi-communication.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Master-slave communication, clock polarity, phase settings, and multi-device SPI bus management.',
          prerequisites: 'UART Protocol',
          status: 'in-progress'
        },
        {
          id: 6,
          title: 'i2c-protocol',
          filename: 'i2c-protocol.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Two-wire communication, addressing modes, clock stretching, and multi-master I2C implementations.',
          prerequisites: 'SPI Communication',
          status: 'not-started'
        }
      ]
    },
    realtime: {
      title: 'real-time-systems',
      icon: '📁',
      topics: [
        {
          id: 7,
          title: 'rtos-fundamentals',
          filename: 'rtos-fundamentals.c',
          type: 'md',
          difficulty: 'advanced',
          description: 'Task scheduling, priority management, and real-time operating system concepts for embedded applications.',
          prerequisites: 'Interrupt Handling, Memory Management',
          status: 'not-started'
        },
        {
          id: 8,
          title: 'timing-and-delays',
          filename: 'timing-and-delays.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Precise timing control, timer configurations, PWM generation, and time-critical applications.',
          prerequisites: 'Microcontroller Basics',
          status: 'not-started'
        }
      ]
    },
    power: {
      title: 'power-management',
      icon: '�',
      topics: [
        {
          id: 9,
          title: 'low-power-modes',
          filename: 'low-power-modes.c',
          type: 'md',
          difficulty: 'intermediate',
          description: 'Sleep modes, power optimization techniques, and battery-efficient embedded system design.',
          prerequisites: 'Microcontroller Basics, Interrupt Handling',
          status: 'not-started'
        }
      ]
    }
  };

  // Get current topic details
  const getCurrentTopic = () => {
    for (const category of Object.values(topicCategories)) {
      const topic = category.topics.find(t => t.id === selectedTopic);
      if (topic) return topic;
    }
    return topicCategories[selectedCategory].topics[0];
  };

  // Filter topics based on search
  const getFilteredTopics = (categoryKey) => {
    const category = topicCategories[categoryKey];
    if (!searchTerm) return category.topics;
    
    return category.topics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get total visible topics count
  const getTotalTopicsCount = () => {
    return Object.keys(topicCategories).reduce((total, categoryKey) => {
      return total + getFilteredTopics(categoryKey).length;
    }, 0);
  };

  // Toggle folder expansion
  const toggleFolder = (categoryKey) => {
    setExpandedFolders(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Select topic
  const selectTopic = (topicId, categoryKey) => {
    setSelectedTopic(topicId);
    setSelectedCategory(categoryKey);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get progress percentage based on difficulty
  const getProgressPercentage = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 25;
      case 'intermediate': return 65;
      case 'advanced': return 90;
      default: return 0;
    }
  };

  const currentTopic = getCurrentTopic();
  const totalTopics = getTotalTopicsCount();

  return (
    <StyledLearnEmbeddedSection id="learn-embedded">
      <div className="inner">
        <h2>Learn Embedded Systems</h2>
        <p>
          Master embedded systems through hands-on learning. Choose a learning path and progress at your own pace.
        </p>

        <div className="coming-soon-banner">
          <h3>🚀 Interactive Learning Platform</h3>
          <p>
            Comprehensive embedded systems curriculum with practical projects, code examples, and 
            progressive skill building. Currently implementing the final features.
          </p>
        </div>

        <div className="learning-platform">
          <div className="search-bar">
            <div className="search-box">
              <Icon name="Search" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <Icon name="X" />
                </button>
              )}
            </div>
          </div>

          <div className="modern-container">
            <div className="navigation-sidebar" data-no-external-links="true">
              <div className="nav-header">
                <div className="header-icon">📚</div>
                <div className="title">EmbedLab</div>
                <div className="subtitle">
                  Interactive Learning
                  <span className="badge">{totalTopics}</span>
                </div>
              </div>

              <div className="category-list">
                {Object.entries(topicCategories).map(([categoryKey, category]) => {
                  const filteredTopics = getFilteredTopics(categoryKey);
                  const isExpanded = expandedFolders.includes(categoryKey);

                  if (filteredTopics.length === 0 && searchTerm) return null;

                  return (
                    <div key={categoryKey} className="category-item">
                      <button 
                        className="category-header"
                        onClick={() => toggleFolder(categoryKey)}
                        type="button"
                        data-no-external-icon="true"
                      >
                        <div className={`category-icon ${categoryKey}`}>
                          {categoryKey === 'fundamentals' && '⚡'}
                          {categoryKey === 'communication' && '📡'}
                          {categoryKey === 'realtime' && '⏱️'}
                          {categoryKey === 'power' && '🔋'}
                        </div>
                        <div className="category-info">
                          <div className="category-name">{category.title.replace('-', ' ')}</div>
                          <div className="topic-count">{filteredTopics.length} topics</div>
                        </div>
                        <Icon 
                          name="ChevronRight" 
                          className={`expand-icon ${isExpanded ? 'expanded' : ''}`} 
                        />
                      </button>
                      
                      <div className={`topics-list ${isExpanded ? 'expanded' : ''}`}>
                        {filteredTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}
                            onClick={() => selectTopic(topic.id, categoryKey)}
                          >
                            <div className={`topic-indicator ${categoryKey}`}></div>
                            <span className="topic-name">{topic.title.replace(/-/g, ' ')}</span>
                            <div className={`status-dot ${topic.status}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="content-panel">
              <div className="content-header">
                <div className="breadcrumb">
                  <span className="path-segment">{topicCategories[selectedCategory].title}</span>
                  <span className="separator">/</span>
                  <span className="path-segment current">{currentTopic.title}</span>
                </div>

                <h1 className="title">{currentTopic.title.replace(/-/g, ' ')}</h1>
                <div className="meta">
                  <span className={`difficulty ${currentTopic.difficulty}`}>
                    {currentTopic.difficulty}
                  </span>
                  {currentTopic.prerequisites && (
                    <span className="prerequisites">
                      Prerequisites: {currentTopic.prerequisites}
                    </span>
                  )}
                </div>
              </div>

              <div className="content-body">
                <div className="description">
                  {currentTopic.description}
                </div>

                <div className="action-buttons">
                  <a href="#" className="action-btn">
                    <Icon name="Play" />
                    Start Learning
                  </a>
                  {currentTopic.githubLink && (
                    <a href={currentTopic.githubLink} target="_blank" rel="noopener noreferrer" className="action-btn secondary">
                      <Icon name="Github" />
                      View Code
                    </a>
                  )}
                  {currentTopic.imageGallery && (
                    <a href={currentTopic.imageGallery} className="action-btn secondary">
                      <Icon name="Image" />
                      Gallery
                    </a>
                  )}
                  <a href="#" className="action-btn secondary">
                    <Icon name="BookOpen" />
                    Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledLearnEmbeddedSection>
  );
};

export default LearnEmbedded;
