import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@components/icons';

const StyledLearnEmbeddedSection = styled.section`
  max-width: 1200px;
  height: 100vh;
  min-height: 700px;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    height: auto;
    min-height: 100vh;
    max-height: none;
    overflow: visible;
  }

  .inner {
    display: flex;
    flex-direction: column;
    height: 100%;

    h2 {
      font-size: clamp(18px, 3vw, 24px);
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--lightest-slate);
      flex-shrink: 0;
    }

    p {
      margin-bottom: 6px;
      color: var(--light-slate);
      font-size: var(--fz-sm);
      flex-shrink: 0;
    }
  }

  .coming-soon-banner {
    background: linear-gradient(135deg, rgba(100, 255, 218, 0.1), rgba(100, 255, 218, 0.05));
    border: 1px solid rgba(100, 255, 218, 0.3);
    border-radius: var(--border-radius);
    padding: 10px;
    margin-bottom: 10px;
    text-align: center;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    flex-shrink: 0;
    
    h3 {
      color: var(--green);
      margin-bottom: 4px;
      font-size: var(--fz-sm);
      
      @media (max-width: 768px) {
        font-size: var(--fz-xs);
      }
    }
    
    p {
      font-size: 11px;
      color: var(--lightest-slate);
      max-width: 700px;
      margin: 0 auto;
      
      @media (max-width: 768px) {
        font-size: 10px;
      }
    }
    
    @media (max-width: 768px) {
      padding: 8px;
    }
  }

  .learning-platform {
    margin-top: 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .search-bar {
    margin-bottom: 10px;
    flex-shrink: 0;
    
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
        padding: 10px 0;
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
    gap: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    
    @media (max-width: 1024px) {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100vh;
      overflow: visible;
    }
    
    @media (max-width: 768px) {
      gap: 10px;
    }
  }

  .navigation-sidebar {
    background: linear-gradient(135deg, var(--light-navy) 0%, rgba(23, 42, 69, 0.8) 100%);
    border: 1px solid var(--dark-slate);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    height: 100%;
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
      min-height: 0;
      max-height: 100%;
      
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
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--fz-md);
            
            &.fundamentals { background: linear-gradient(135deg, #96CEB4, #7ab899); }
            &.communication { background: linear-gradient(135deg, #4ECDC4, #3ab5ac); }
            &.realtime { background: linear-gradient(135deg, #FF6B6B, #e55555); }
            &.power { background: linear-gradient(135deg, #FFEAA7, #f7d794); }
          }
          
          .category-info {
            flex: 1;
            
            .category-name {
              color: var(--lightest-slate);
              font-size: var(--fz-md);
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
              font-size: var(--fz-md);
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
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    @media (max-width: 1024px) {
      height: calc(100vh - 100px);
      min-height: calc(100vh - 100px);
    }
    
    @media (max-width: 768px) {
      height: calc(100vh - 120px);
      min-height: calc(100vh - 120px);
      padding: 20px;
      border-radius: 12px;
    }
    
    @media (max-width: 480px) {
      height: calc(100vh - 100px);
      min-height: calc(100vh - 100px);
      padding: 16px;
      border-radius: 8px;
    }
    
    .content-header {
      margin-bottom: 20px;
      flex-shrink: 0;
      
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
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      
      .scrollable-content {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;
        
        /* Custom scrollbar */
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
        
        scrollbar-width: thin;
        scrollbar-color: rgba(100, 255, 218, 0.3) rgba(100, 255, 218, 0.05);
      }
      
      .diagram-section {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid rgba(100, 255, 218, 0.1);
        
        .diagram-header {
          margin-bottom: 16px;
          
          .diagram-title {
            color: var(--lightest-slate);
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .diagram-subtitle {
            color: var(--slate);
            font-size: 13px;
          }
        }
        
        .diagram-content {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(100, 255, 218, 0.2);
          border-radius: 8px;
          background: rgba(100, 255, 218, 0.02);
          position: relative;
          overflow: hidden;
          
          .diagram-placeholder {
            text-align: center;
            color: var(--slate);
            
            .diagram-icon {
              font-size: 48px;
              margin-bottom: 12px;
              opacity: 0.5;
            }
            
            .diagram-text {
              font-size: 14px;
              line-height: 1.4;
            }
          }
        }
      }
      
      .explanation-section {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid rgba(100, 255, 218, 0.05);
        
        .section-header {
          margin-bottom: 16px;
          
          .section-title {
            color: var(--lightest-slate);
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .section-subtitle {
            color: var(--slate);
            font-size: 13px;
          }
        }
      }
      
      .description {
        color: var(--light-slate);
        font-size: var(--fz-md);
        line-height: 1.6;
        margin-bottom: 16px;
      }
      
      .key-concepts {
        margin-bottom: 16px;
        
        .concepts-title {
          color: var(--green);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .concepts-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          
          .concept-item {
            background: rgba(100, 255, 218, 0.05);
            border: 1px solid rgba(100, 255, 218, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            color: var(--light-slate);
            font-size: 13px;
            
            .concept-icon {
              color: var(--green);
              margin-right: 6px;
              font-size: 12px;
            }
          }
        }
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
            icon: '🔧',
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
                },
                {
                    id: 11,
                    title: 'gpio-programming',
                    filename: 'gpio-programming.c',
                    type: 'md',
                    difficulty: 'beginner',
                    description: 'General Purpose Input/Output programming fundamentals. Pin configuration, digital I/O operations, and external interfacing.',
                    prerequisites: 'Microcontroller Basics',
                    status: 'completed'
                },
                {
                    id: 12,
                    title: 'adc-dac',
                    filename: 'adc-dac.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'Analog-to-Digital and Digital-to-Analog conversion principles. Resolution, sampling rates, and sensor interfacing.',
                    prerequisites: 'GPIO Programming',
                    status: 'in-progress'
                },
                {
                    id: 13,
                    title: 'pwm-control',
                    filename: 'pwm-control.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'Pulse Width Modulation for motor control, LED dimming, and analog signal generation.',
                    prerequisites: 'GPIO Programming',
                    status: 'not-started'
                },
                {
                    id: 14,
                    title: 'timers-counters',
                    filename: 'timers-counters.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'Hardware timers, watchdog timers, and counter modules. Precise timing and event counting.',
                    prerequisites: 'Interrupt Handling',
                    status: 'not-started'
                },
                {
                    id: 15,
                    title: 'dma-programming',
                    filename: 'dma-programming.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Direct Memory Access for high-speed data transfers without CPU intervention.',
                    prerequisites: 'Memory Management, Interrupt Handling',
                    status: 'not-started'
                },
                {
                    id: 16,
                    title: 'clock-systems',
                    filename: 'clock-systems.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'System clocks, PLLs, clock domains, and frequency scaling. Crystal and RC oscillators.',
                    prerequisites: 'Microcontroller Basics',
                    status: 'not-started'
                }
            ]
        },
        communication: {
            title: 'communication',
            icon: '🔗',
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
                },
                {
                    id: 17,
                    title: 'can-protocol',
                    filename: 'can-protocol.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Controller Area Network protocol for automotive applications. Message-based communication and arbitration.',
                    prerequisites: 'I2C Protocol',
                    status: 'not-started'
                },
                {
                    id: 18,
                    title: 'usb-protocol',
                    filename: 'usb-protocol.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Universal Serial Bus implementation. Device classes, descriptors, and enumeration process.',
                    prerequisites: 'UART Protocol',
                    status: 'not-started'
                },
                {
                    id: 19,
                    title: 'ethernet-tcp',
                    filename: 'ethernet-tcp.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Network connectivity in embedded systems. Ethernet MAC/PHY layers and TCP/IP stack implementation.',
                    prerequisites: 'CAN Protocol',
                    status: 'not-started'
                },
                {
                    id: 20,
                    title: 'wireless-protocols',
                    filename: 'wireless-protocols.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'WiFi, Bluetooth, ZigBee protocols. RF considerations and wireless network topologies.',
                    prerequisites: 'UART Protocol',
                    status: 'not-started'
                },
                {
                    id: 21,
                    title: 'modbus-protocol',
                    filename: 'modbus-protocol.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'Industrial communication protocol for SCADA systems. Modbus RTU, ASCII, and TCP variants.',
                    prerequisites: 'UART Protocol',
                    status: 'not-started'
                }
            ]
        },
        realtime: {
            title: 'real-time-systems',
            icon: '⚡',
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
                },
                {
                    id: 22,
                    title: 'mutex-semaphore',
                    filename: 'mutex-semaphore.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Understanding mutexes vs semaphores. Exclusive access and resource counting in RTOS environments.',
                    prerequisites: 'RTOS Fundamentals',
                    status: 'not-started'
                },
                {
                    id: 23,
                    title: 'priority-inversion',
                    filename: 'priority-inversion.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Critical RTOS problem where low-priority tasks block high-priority tasks. Solutions and prevention.',
                    prerequisites: 'Mutex Semaphore',
                    status: 'not-started'
                },
                {
                    id: 24,
                    title: 'task-scheduling',
                    filename: 'task-scheduling.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'RTOS scheduling algorithms: preemptive, cooperative, round-robin, and priority-based scheduling.',
                    prerequisites: 'RTOS Fundamentals',
                    status: 'not-started'
                },
                {
                    id: 25,
                    title: 'task-communication',
                    filename: 'task-communication.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Inter-task communication: message queues, event flags, mailboxes, and shared memory.',
                    prerequisites: 'Task Scheduling',
                    status: 'not-started'
                },
                {
                    id: 26,
                    title: 'memory-pools',
                    filename: 'memory-pools.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Dynamic memory management in RTOS. Avoiding heap fragmentation and deterministic allocation.',
                    prerequisites: 'RTOS Fundamentals, Memory Management',
                    status: 'not-started'
                },
                {
                    id: 27,
                    title: 'timing-analysis',
                    filename: 'timing-analysis.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'WCET analysis, deadline analysis, and response time calculation for real-time constraints.',
                    prerequisites: 'Task Scheduling',
                    status: 'not-started'
                }
            ]
        },
        power: {
            title: 'power-management',
            icon: '🔋',
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
                },
                {
                    id: 28,
                    title: 'power-optimization',
                    filename: 'power-optimization.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Dynamic voltage scaling, power islands, and advanced energy optimization for battery systems.',
                    prerequisites: 'Low Power Modes',
                    status: 'not-started'
                },
                {
                    id: 29,
                    title: 'battery-management',
                    filename: 'battery-management.c',
                    type: 'md',
                    difficulty: 'intermediate',
                    description: 'Battery monitoring, charging algorithms, and power management ICs for portable devices.',
                    prerequisites: 'Low Power Modes',
                    status: 'not-started'
                },
                {
                    id: 30,
                    title: 'energy-harvesting',
                    filename: 'energy-harvesting.c',
                    type: 'md',
                    difficulty: 'advanced',
                    description: 'Solar, thermal, and kinetic energy harvesting for self-powered embedded systems.',
                    prerequisites: 'Power Optimization',
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
        switch (difficulty) {
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
                                <div className="scrollable-content">
                                    {/* Overview Diagram */}
                                    <div className="diagram-section">
                                        <div className="diagram-header">
                                            <div className="diagram-title">System Overview</div>
                                            <div className="diagram-subtitle">High-level architecture and component relationships</div>
                                        </div>
                                        <div className="diagram-content">
                                            <div className="diagram-placeholder">
                                                <div className="diagram-icon">🔌</div>
                                                <div className="diagram-text">
                                                    {currentTopic.title.replace(/-/g, ' ')} System Overview<br />
                                                    <small>Interactive block diagram</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hardware Diagram */}
                                    <div className="diagram-section">
                                        <div className="diagram-header">
                                            <div className="diagram-title">Hardware Configuration</div>
                                            <div className="diagram-subtitle">Physical connections and pinout details</div>
                                        </div>
                                        <div className="diagram-content">
                                            <div className="diagram-placeholder">
                                                <div className="diagram-icon">⚡</div>
                                                <div className="diagram-text">
                                                    Hardware Setup & Wiring<br />
                                                    <small>Pin configurations and connections</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Learning Content */}
                                    <div className="explanation-section">
                                        <div className="section-header">
                                            <div className="section-title">Learning Content</div>
                                            <div className="section-subtitle">Core concepts and practical knowledge</div>
                                        </div>

                                        <div className="description">
                                            {currentTopic.description}
                                        </div>

                                        <div className="key-concepts">
                                            <div className="concepts-title">Key Concepts</div>
                                            <div className="concepts-list">
                                                <div className="concept-item">
                                                    <span className="concept-icon">⚡</span>
                                                    Hardware Architecture
                                                </div>
                                                <div className="concept-item">
                                                    <span className="concept-icon">💻</span>
                                                    Programming Concepts
                                                </div>
                                                <div className="concept-item">
                                                    <span className="concept-icon">🔧</span>
                                                    Practical Applications
                                                </div>
                                                <div className="concept-item">
                                                    <span className="concept-icon">📊</span>
                                                    Performance Metrics
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Code Examples */}
                                    <div className="diagram-section">
                                        <div className="diagram-header">
                                            <div className="diagram-title">Code Examples</div>
                                            <div className="diagram-subtitle">Practical implementation and snippets</div>
                                        </div>
                                        <div className="diagram-content">
                                            <div className="diagram-placeholder">
                                                <div className="diagram-icon">💻</div>
                                                <div className="diagram-text">
                                                    Code Examples & Implementation<br />
                                                    <small>Ready-to-use code snippets</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="explanation-section">
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
                </div>
            </div>
        </StyledLearnEmbeddedSection>
    );
};

export default LearnEmbedded;
