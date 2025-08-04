import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { Icon } from '@components/icons';

// Enhanced topic data with categories and learning paths - moved outside component
const topicCategories = {
    'Hardware Fundamentals': {
        icon: '🔧',
        color: '#64ffda',
        description: 'Core hardware concepts every embedded engineer should master',
        topics: [
            {
                id: 'memory-management',
                title: 'Memory Management',
                difficulty: 'beginner',
                description: 'Memory layout, stack vs heap, and efficient memory usage in resource-constrained embedded systems. Learn about memory segmentation, dynamic allocation strategies, and memory protection techniques essential for reliable embedded applications.',
                image: '/images/embedded/memory-management.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Memory/management',
                prerequisites: [],
                nextTopics: ['interrupt-handling', 'rtos-basics']
            },
            {
                id: 'interrupt-handling',
                title: 'Interrupt Handling',
                difficulty: 'intermediate',
                description: 'Master the critical concept of hardware and software interrupts in embedded systems. Learn about interrupt service routines (ISRs), interrupt controllers, priorities, and best practices for writing efficient interrupt handlers.',
                image: '/images/embedded/interrupt-handling.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Interrupts',
                prerequisites: ['memory-management'],
                nextTopics: ['priority-inversion', 'rtos-basics']
            },
            {
                id: 'power-management',
                title: 'Power Management',
                difficulty: 'advanced',
                description: 'Low-power design techniques, sleep modes, and energy optimization for battery-powered embedded systems. Understand dynamic voltage scaling, power islands, and wake-up strategies.',
                image: '/images/embedded/power-management.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Power',
                prerequisites: ['interrupt-handling'],
                nextTopics: []
            },
            {
                id: 'gpio-programming',
                title: 'GPIO Programming',
                difficulty: 'beginner',
                description: 'General Purpose Input/Output programming fundamentals. Learn pin configuration, digital I/O operations, pull-up/pull-down resistors, and interfacing with external components.',
                image: '/images/embedded/gpio.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/GPIO',
                prerequisites: [],
                nextTopics: ['adc-dac', 'pwm-control']
            },
            {
                id: 'adc-dac',
                title: 'ADC & DAC',
                difficulty: 'intermediate',
                description: 'Analog-to-Digital and Digital-to-Analog conversion principles. Understanding resolution, sampling rates, reference voltages, and implementing sensor interfacing.',
                image: '/images/embedded/adc-dac.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/ADC_DAC',
                prerequisites: ['gpio-programming'],
                nextTopics: ['sensor-interfacing']
            },
            {
                id: 'pwm-control',
                title: 'PWM Control',
                difficulty: 'intermediate',
                description: 'Pulse Width Modulation for motor control, LED dimming, and analog signal generation. Learn duty cycle calculations, frequency considerations, and hardware PWM vs software PWM.',
                image: '/images/embedded/pwm.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/PWM',
                prerequisites: ['gpio-programming'],
                nextTopics: ['motor-control']
            },
            {
                id: 'timers-counters',
                title: 'Timers & Counters',
                difficulty: 'intermediate',
                description: 'Hardware timers, watchdog timers, and counter modules. Implementing precise timing, timeouts, event counting, and timer-based interrupts.',
                image: '/images/embedded/timers.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Timers',
                prerequisites: ['interrupt-handling'],
                nextTopics: ['pwm-control']
            },
            {
                id: 'dma-programming',
                title: 'DMA Programming',
                difficulty: 'advanced',
                description: 'Direct Memory Access for high-speed data transfers without CPU intervention. Learn DMA channels, transfer modes, and optimizing system performance.',
                image: '/images/embedded/dma.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/DMA',
                prerequisites: ['memory-management', 'interrupt-handling'],
                nextTopics: []
            },
            {
                id: 'clock-systems',
                title: 'Clock Systems',
                difficulty: 'intermediate',
                description: 'Understanding system clocks, PLLs, clock domains, and frequency scaling. Learn about crystal oscillators, internal RC oscillators, and clock distribution.',
                image: '/images/embedded/clocks.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Clocks',
                prerequisites: [],
                nextTopics: ['power-management']
            }
        ]
    },
    'Real-Time Systems': {
        icon: '⚡',
        color: '#ffd700',
        description: 'Master real-time computing and RTOS concepts',
        topics: [
            {
                id: 'rtos-basics',
                title: 'RTOS Fundamentals',
                difficulty: 'beginner',
                description: 'Core concepts of Real-Time Operating Systems including task scheduling, priority-based execution, and deterministic timing. Understand how an RTOS differs from general-purpose operating systems and when to use one.',
                image: '/images/embedded/rtos.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/fundamentals',
                prerequisites: ['memory-management'],
                nextTopics: ['mutex-semaphore', 'priority-inversion']
            },
            {
                id: 'mutex-semaphore',
                title: 'Mutex vs Semaphore',
                difficulty: 'intermediate',
                description: 'Understanding the fundamental differences between mutexes and semaphores. While mutexes provide exclusive access with ownership, semaphores can count resources and be signaled by any task, making them suitable for different synchronization scenarios.',
                image: '/images/embedded/mutex-semaphore.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/mutex_semaphore',
                prerequisites: ['rtos-basics'],
                nextTopics: ['priority-inversion']
            },
            {
                id: 'priority-inversion',
                title: 'Priority Inversion',
                difficulty: 'advanced',
                description: 'A critical RTOS problem where a low-priority task indirectly blocks a high-priority task by holding a resource needed by a medium-priority task. This can lead to missed deadlines and unpredictable behavior in real-time systems.',
                image: '/images/embedded/priority-inversion.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/priority_inversion',
                prerequisites: ['mutex-semaphore'],
                nextTopics: []
            },
            {
                id: 'task-scheduling',
                title: 'Task Scheduling',
                difficulty: 'intermediate',
                description: 'Deep dive into RTOS scheduling algorithms including preemptive, cooperative, round-robin, and priority-based scheduling. Learn about task states, context switching, and scheduler overhead.',
                image: '/images/embedded/scheduling.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/scheduling',
                prerequisites: ['rtos-basics'],
                nextTopics: ['mutex-semaphore', 'task-communication']
            },
            {
                id: 'task-communication',
                title: 'Task Communication',
                difficulty: 'intermediate',
                description: 'Inter-task communication mechanisms including message queues, event flags, mailboxes, and shared memory. Understanding when to use each method and avoiding common pitfalls.',
                image: '/images/embedded/task-comm.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/communication',
                prerequisites: ['task-scheduling'],
                nextTopics: ['mutex-semaphore']
            },
            {
                id: 'memory-pools',
                title: 'Memory Pools',
                difficulty: 'advanced',
                description: 'Dynamic memory management in RTOS environments using memory pools. Avoiding heap fragmentation and ensuring deterministic memory allocation in real-time systems.',
                image: '/images/embedded/memory-pools.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/memory_pools',
                prerequisites: ['rtos-basics', 'memory-management'],
                nextTopics: []
            },
            {
                id: 'timing-analysis',
                title: 'Timing Analysis',
                difficulty: 'advanced',
                description: 'Worst-case execution time (WCET) analysis, deadline analysis, and response time calculation. Tools and techniques for ensuring real-time constraints are met.',
                image: '/images/embedded/timing-analysis.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/timing',
                prerequisites: ['task-scheduling'],
                nextTopics: ['priority-inversion']
            },
            {
                id: 'interrupt-rtos',
                title: 'Interrupts in RTOS',
                difficulty: 'advanced',
                description: 'Managing interrupts in RTOS environments. Interrupt nesting, deferred interrupt handling, and maintaining real-time guarantees with interrupt service routines.',
                image: '/images/embedded/rtos-interrupts.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/interrupts',
                prerequisites: ['interrupt-handling', 'rtos-basics'],
                nextTopics: ['timing-analysis']
            }
        ]
    },
    'Communication Protocols': {
        icon: '🔗',
        color: '#ff6b6b',
        description: 'Essential communication interfaces and protocols',
        topics: [
            {
                id: 'spi-communication',
                title: 'SPI Communication',
                difficulty: 'beginner',
                description: 'Serial Peripheral Interface protocol for high-speed communication between microcontrollers and peripherals. Master-slave architecture and full-duplex communication with timing diagrams and practical examples.',
                image: '/images/embedded/spi-communication.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/SPI',
                prerequisites: [],
                nextTopics: ['i2c-communication']
            },
            {
                id: 'i2c-communication',
                title: 'I2C Communication',
                difficulty: 'beginner',
                description: 'Inter-Integrated Circuit protocol for multi-master, multi-slave communication with address-based device selection. Learn about clock stretching, arbitration, and error handling.',
                image: '/images/embedded/i2c-communication.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/I2C',
                prerequisites: ['spi-communication'],
                nextTopics: ['can-protocol']
            },
            {
                id: 'can-protocol',
                title: 'CAN Protocol',
                difficulty: 'intermediate',
                description: 'Controller Area Network protocol used extensively in automotive applications. Message-based communication with priority arbitration, error handling, and fault tolerance mechanisms.',
                image: '/images/embedded/can-protocol.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/CAN',
                prerequisites: ['i2c-communication'],
                nextTopics: []
            },
            {
                id: 'uart-communication',
                title: 'UART Communication',
                difficulty: 'beginner',
                description: 'Universal Asynchronous Receiver-Transmitter protocol fundamentals. Baud rate configuration, frame format, flow control, and debugging serial communication issues.',
                image: '/images/embedded/uart.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/UART',
                prerequisites: [],
                nextTopics: ['spi-communication']
            },
            {
                id: 'usb-protocol',
                title: 'USB Protocol',
                difficulty: 'advanced',
                description: 'Universal Serial Bus protocol implementation in embedded systems. USB device classes, descriptors, enumeration process, and creating custom USB devices.',
                image: '/images/embedded/usb.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/USB',
                prerequisites: ['uart-communication'],
                nextTopics: []
            },
            {
                id: 'ethernet-tcp',
                title: 'Ethernet & TCP/IP',
                difficulty: 'advanced',
                description: 'Implementing network connectivity in embedded systems. Ethernet MAC/PHY layers, TCP/IP stack implementation, socket programming, and network protocols.',
                image: '/images/embedded/ethernet.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/Ethernet',
                prerequisites: ['can-protocol'],
                nextTopics: []
            },
            {
                id: 'wireless-protocols',
                title: 'Wireless Protocols',
                difficulty: 'intermediate',
                description: 'WiFi, Bluetooth, ZigBee, and LoRa communication protocols. Understanding radio frequency considerations, antenna design basics, and wireless network topologies.',
                image: '/images/embedded/wireless.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/Wireless',
                prerequisites: ['uart-communication'],
                nextTopics: ['ethernet-tcp']
            },
            {
                id: 'modbus-protocol',
                title: 'Modbus Protocol',
                difficulty: 'intermediate',
                description: 'Industrial communication protocol for SCADA systems. Modbus RTU, ASCII, and TCP variants. Master-slave communication and register mapping in industrial applications.',
                image: '/images/embedded/modbus.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/Modbus',
                prerequisites: ['uart-communication'],
                nextTopics: ['can-protocol']
            },
            {
                id: 'protocol-stacks',
                title: 'Protocol Stacks',
                difficulty: 'advanced',
                description: 'Building and optimizing communication protocol stacks. Layer architecture, protocol encapsulation, error handling, and performance optimization techniques.',
                image: '/images/embedded/protocol-stacks.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Communication/Stacks',
                prerequisites: ['ethernet-tcp', 'can-protocol'],
                nextTopics: []
            }
        ]
    },
    'Development Tools': {
        icon: '🛠️',
        color: '#4ecdc4',
        description: 'Essential tools and techniques for embedded development',
        topics: [
            {
                id: 'debugging-tools',
                title: 'Debugging Tools',
                difficulty: 'intermediate',
                description: 'Master essential debugging tools and techniques including JTAG/SWD debugging, logic analyzers, oscilloscopes, printf debugging, and strategies for troubleshooting common embedded issues.',
                image: '/images/embedded/debugging.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Debugging',
                prerequisites: [],
                nextTopics: ['version-control']
            },
            {
                id: 'version-control',
                title: 'Version Control',
                difficulty: 'beginner',
                description: 'Git workflows, branching strategies, and collaborative development practices specifically tailored for embedded software teams. Learn about handling binary files and hardware-specific configurations.',
                image: '/images/embedded/version-control.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/git',
                prerequisites: [],
                nextTopics: []
            },
            {
                id: 'build-systems',
                title: 'Build Systems',
                difficulty: 'intermediate',
                description: 'Modern build systems for embedded projects including Make, CMake, and platform-specific tools. Managing dependencies, cross-compilation, and automated builds.',
                image: '/images/embedded/build-systems.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/build',
                prerequisites: ['version-control'],
                nextTopics: ['testing-frameworks']
            },
            {
                id: 'testing-frameworks',
                title: 'Testing Frameworks',
                difficulty: 'intermediate',
                description: 'Unit testing, integration testing, and hardware-in-the-loop testing for embedded systems. Using frameworks like Unity, CppUTest, and custom testing strategies.',
                image: '/images/embedded/testing.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/testing',
                prerequisites: ['build-systems'],
                nextTopics: ['static-analysis']
            },
            {
                id: 'static-analysis',
                title: 'Static Analysis',
                difficulty: 'advanced',
                description: 'Code quality tools, static analyzers, and MISRA C compliance. Detecting potential bugs, security vulnerabilities, and ensuring coding standards in embedded projects.',
                image: '/images/embedded/static-analysis.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/analysis',
                prerequisites: ['testing-frameworks'],
                nextTopics: []
            },
            {
                id: 'profiling-optimization',
                title: 'Profiling & Optimization',
                difficulty: 'advanced',
                description: 'Performance profiling, memory usage analysis, and code optimization techniques. Tools for measuring execution time, stack usage, and optimizing for speed and size.',
                image: '/images/embedded/profiling.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/profiling',
                prerequisites: ['debugging-tools'],
                nextTopics: ['static-analysis']
            },
            {
                id: 'simulation-emulation',
                title: 'Simulation & Emulation',
                difficulty: 'intermediate',
                description: 'Hardware simulation, emulation platforms, and virtual prototyping. Accelerating development with QEMU, simulators, and hardware abstraction layers.',
                image: '/images/embedded/simulation.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/simulation',
                prerequisites: ['debugging-tools'],
                nextTopics: ['profiling-optimization']
            },
            {
                id: 'documentation-tools',
                title: 'Documentation Tools',
                difficulty: 'beginner',
                description: 'Technical documentation, API documentation generation, and project documentation best practices. Tools like Doxygen, Sphinx, and collaborative documentation platforms.',
                image: '/images/embedded/documentation.svg',
                githubLink: 'https://github.com/rajatchaple/embedded-concepts/tree/main/Tools/docs',
                prerequisites: [],
                nextTopics: ['version-control']
            }
        ]
    }
};

const StyledLearnEmbeddedSection = styled.section`
  max-width: 1400px;

  .inner {
    display: flex;
    flex-direction: column;

    h2 {
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--lightest-slate);
    }

    .section-intro {
      margin-bottom: 40px;
      color: var(--light-slate);
      font-size: var(--fz-lg);
      max-width: 700px;
    }
  }

  .learning-paths-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
    margin-bottom: 50px;

    @media (max-width: 768px) {
      gap: 20px;
      margin-bottom: 30px;
    }
  }

  .learning-path-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }

  .category-card {
    background-color: var(--light-navy);
    border-radius: var(--border-radius);
    padding: 25px;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    transition: var(--transition);
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px -15px var(--navy-shadow);
      border-color: rgba(100, 255, 218, 0.3);
    }

    &.active {
      border-color: var(--green);
      box-shadow: 0 15px 35px -10px rgba(100, 255, 218, 0.2);
    }

    .category-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .icon {
        font-size: 24px;
        margin-right: 12px;
        filter: grayscale(1);
        transition: filter 0.3s ease;
      }

      h3 {
        color: var(--lightest-slate);
        font-size: var(--fz-xl);
        margin: 0;
      }
    }

    &:hover .icon,
    &.active .icon {
      filter: grayscale(0);
    }

    .category-description {
      color: var(--light-slate);
      font-size: var(--fz-sm);
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .topic-count {
      color: var(--green);
      font-family: var(--font-mono);
      font-size: var(--fz-xs);
      display: flex;
      align-items: center;

      .difficulty-badges {
        margin-left: auto;
        display: flex;
        gap: 5px;

        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: var(--fz-xxs);
          border: 1px solid;

          &.beginner {
            color: #4ecdc4;
            border-color: #4ecdc4;
            background: rgba(78, 205, 196, 0.1);
          }

          &.intermediate {
            color: #ffd700;
            border-color: #ffd700;
            background: rgba(255, 215, 0, 0.1);
          }

          &.advanced {
            color: #ff6b6b;
            border-color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
          }
        }
      }
    }

    @media (max-width: 768px) {
      padding: 20px;

      .category-header {
        .icon {
          font-size: 20px;
        }

        h3 {
          font-size: var(--fz-lg);
        }
      }
    }
  }

  .interactive-learning-area {
    background: linear-gradient(135deg, var(--navy) 0%, var(--light-navy) 100%);
    border-radius: var(--border-radius);
    padding: 30px;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    border: 1px solid rgba(100, 255, 218, 0.1);

    @media (max-width: 768px) {
      padding: 20px;
    }

    .learning-header {
      text-align: center;
      margin-bottom: 30px;

      h3 {
        color: var(--green);
        font-size: var(--fz-xxl);
        margin-bottom: 10px;
      }

      p {
        color: var(--light-slate);
        max-width: 600px;
        margin: 0 auto;
      }
    }

    .topic-explorer {
      display: grid;
      grid-template-columns: 280px 1fr 1fr;
      gap: 25px;
      min-height: 500px;

      @media (max-width: 1080px) {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 20px;
      }

      @media (max-width: 768px) {
        gap: 15px;
        min-height: auto;
      }
    }
  }

  .topics-sidebar {
    background-color: rgba(23, 42, 69, 0.8);
    border-radius: var(--border-radius);
    padding: 20px;
    max-height: 500px;
    overflow-y: auto;
    border: 1px solid rgba(100, 255, 218, 0.1);

    @media (max-width: 1080px) {
      max-height: 200px;
      overflow-x: auto;
      overflow-y: hidden;
      white-space: nowrap;

      .topics-list {
        display: flex;
        gap: 10px;
      }
    }

    .category-title {
      color: var(--green);
      font-size: var(--fz-md);
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;

      .icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }

    .topics-list {
      list-style: none;
      padding: 0;
      margin: 0;

      @media (max-width: 1080px) {
        display: flex;
        gap: 10px;
        padding-bottom: 10px;
      }
    }

    .topic-item {
      padding: 12px 15px;
      margin-bottom: 8px;
      border-radius: var(--border-radius);
      transition: var(--transition);
      cursor: pointer;
      color: var(--light-slate);
      border: 1px solid transparent;
      position: relative;

      @media (max-width: 1080px) {
        white-space: nowrap;
        margin-bottom: 0;
        min-width: 150px;
      }

      .topic-title {
        font-size: var(--fz-sm);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .topic-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .difficulty {
          font-size: var(--fz-xxs);
          font-family: var(--font-mono);
          padding: 2px 6px;
          border-radius: 8px;
          border: 1px solid;

          &.beginner {
            color: #4ecdc4;
            border-color: #4ecdc4;
            background: rgba(78, 205, 196, 0.1);
          }

          &.intermediate {
            color: #ffd700;
            border-color: #ffd700;
            background: rgba(255, 215, 0, 0.1);
          }

          &.advanced {
            color: #ff6b6b;
            border-color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
          }
        }

        .prerequisites {
          font-size: var(--fz-xxs);
          color: var(--slate);
          font-family: var(--font-mono);
        }
      }

      &:hover {
        background-color: rgba(100, 255, 218, 0.05);
        border-color: rgba(100, 255, 218, 0.3);
        color: var(--lightest-slate);
      }

      &.active {
        background-color: rgba(100, 255, 218, 0.1);
        border-color: var(--green);
        color: var(--lightest-slate);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background-color: var(--green);
          border-radius: 2px;

          @media (max-width: 1080px) {
            left: 50%;
            top: auto;
            bottom: 0;
            transform: translateX(-50%);
            width: 60%;
            height: 3px;
          }
        }
      }
    }

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(100, 255, 218, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--green);
      border-radius: 3px;
    }
  }

  .topic-visual {
    background-color: rgba(23, 42, 69, 0.6);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    border: 1px solid rgba(100, 255, 218, 0.1);
    min-height: 400px;

    @media (max-width: 768px) {
      min-height: 300px;
      padding: 15px;
    }

    img, .diagram {
      max-width: 100%;
      max-height: 350px;
      object-fit: contain;
      border-radius: 8px;
      transition: transform 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: scale(1.02);
      }

      @media (max-width: 768px) {
        max-height: 250px;
      }
    }

    .placeholder {
      text-align: center;
      color: var(--slate);
      font-style: italic;

      .icon {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: var(--fz-md);
      }
    }

    .click-hint {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(100, 255, 218, 0.1);
      border: 1px solid rgba(100, 255, 218, 0.3);
      color: var(--green);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: var(--fz-xs);
      font-family: var(--font-mono);
      opacity: 0;
      transition: opacity 0.3s ease;

      @media (max-width: 768px) {
        opacity: 1;
        position: static;
        transform: none;
        margin-top: 15px;
      }
    }

    &:hover .click-hint {
      opacity: 1;
    }
  }

  .topic-details {
    background-color: rgba(23, 42, 69, 0.8);
    border-radius: var(--border-radius);
    padding: 25px;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(100, 255, 218, 0.1);

    @media (max-width: 768px) {
      padding: 20px;
    }

    .topic-header {
      margin-bottom: 20px;

      h3 {
        color: var(--lightest-slate);
        font-size: var(--fz-xxl);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;

        .difficulty-badge {
          padding: 4px 10px;
          border-radius: 15px;
          font-size: var(--fz-xs);
          font-weight: 400;
          border: 1px solid;

          &.beginner {
            color: #4ecdc4;
            border-color: #4ecdc4;
            background: rgba(78, 205, 196, 0.1);
          }

          &.intermediate {
            color: #ffd700;
            border-color: #ffd700;
            background: rgba(255, 215, 0, 0.1);
          }

          &.advanced {
            color: #ff6b6b;
            border-color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
          }
        }

        @media (max-width: 768px) {
          font-size: var(--fz-xl);
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .prerequisites {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 15px;

        .prereq-label {
          color: var(--slate);
          font-size: var(--fz-sm);
          font-weight: 500;
          margin-right: 5px;
        }

        .prereq-item {
          background: rgba(100, 255, 218, 0.1);
          border: 1px solid rgba(100, 255, 218, 0.3);
          color: var(--green);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: var(--fz-xs);
          font-family: var(--font-mono);
        }
      }
    }

    .topic-description {
      color: var(--light-slate);
      font-size: var(--fz-lg);
      line-height: 1.6;
      margin-bottom: auto;
      flex: 1;

      @media (max-width: 768px) {
        font-size: var(--fz-md);
      }
    }

    .topic-actions {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(100, 255, 218, 0.1);

      @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
      }

      .github-link {
        display: inline-flex;
        align-items: center;
        color: var(--green);
        font-family: var(--font-mono);
        font-size: var(--fz-sm);
        padding: 10px 15px;
        border: 1px solid var(--green);
        border-radius: var(--border-radius);
        transition: var(--transition);

        svg {
          margin-right: 8px;
          width: 18px;
          height: 18px;
        }

        &:hover {
          background-color: rgba(100, 255, 218, 0.1);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          width: 100%;
          justify-content: center;
        }
      }

      .next-topics {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        @media (max-width: 768px) {
          margin-left: 0;
          align-items: center;
          width: 100%;
        }

        .label {
          font-size: var(--fz-xs);
          color: var(--slate);
          margin-bottom: 5px;
        }

        .next-topic-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;

          @media (max-width: 768px) {
            justify-content: center;
          }

          .next-topic {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            color: #ffd700;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: var(--fz-xxs);
            cursor: pointer;
            transition: var(--transition);

            &:hover {
              background: rgba(255, 215, 0, 0.2);
              transform: translateY(-1px);
            }
          }
        }
      }
    }
  }

  .learning-roadmap {
    margin-top: 50px;
    text-align: center;

    h3 {
      color: var(--lightest-slate);
      font-size: var(--fz-xxl);
      margin-bottom: 20px;
    }

    p {
      color: var(--light-slate);
      margin-bottom: 30px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .roadmap-cta {
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--green) 0%, #4ecdc4 100%);
      color: var(--navy);
      text-decoration: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      transition: var(--transition);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(100, 255, 218, 0.3);
      }

      svg {
        margin-left: 8px;
        width: 16px;
        height: 16px;
      }
    }
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 10, 15, 0.8);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(15px);

    &.show {
      opacity: 1;
      visibility: visible;

      .modal-content {
        transform: scale(1);
      }
    }

    .modal-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      transform: scale(0.9);
      transition: transform 0.3s ease;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
      }

      .close-button {
        position: absolute;
        top: -40px;
        right: -40px;
        background: var(--navy);
        border: 1px solid var(--green);
        color: var(--green);
        width: 35px;
        height: 35px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);

        &:hover {
          background: var(--green);
          color: var(--navy);
          transform: rotate(90deg);
        }
      }
    }
  }
`;

const LearnEmbeddedEnhanced = () => {
    const revealContainer = useRef(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    // State management
    const [activeCategory, setActiveCategory] = useState('Hardware Fundamentals');
    const [activeTopic, setActiveTopic] = useState(topicCategories['Hardware Fundamentals'].topics[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Flatten all topics for easy access
    const allTopics = Object.values(topicCategories).flatMap(category => category.topics);

    useEffect(() => {
        if (prefersReducedMotion) {
            return;
        }
        sr.reveal(revealContainer.current, srConfig());
    }, []);

    // Handle category selection
    const handleCategorySelect = (categoryName) => {
        setActiveCategory(categoryName);
        setActiveTopic(topicCategories[categoryName].topics[0]);
    };

    // Handle topic selection
    const handleTopicSelect = (topic) => {
        setActiveTopic(topic);
        // Also update active category if needed
        const categoryName = Object.keys(topicCategories).find(cat =>
            topicCategories[cat].topics.some(t => t.id === topic.id)
        );
        if (categoryName && categoryName !== activeCategory) {
            setActiveCategory(categoryName);
        }
    };

    // Handle next topic navigation
    const handleNextTopic = (topicId) => {
        const topic = allTopics.find(t => t.id === topicId);
        if (topic) {
            handleTopicSelect(topic);
        }
    };

    // Modal handlers
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Handle modal escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    return (
        <StyledLearnEmbeddedSection id="learn-embedded" ref={revealContainer}>
            <div className="inner">
                <h2 className="numbered-heading">Learn Embedded Systems</h2>
                <p className="section-intro">
                    Explore core embedded systems concepts explained with practical examples, interactive diagrams,
                    and working code samples. Each topic includes detailed explanations and GitHub repositories
                    with hands-on implementations.
                </p>

                <div className="learning-paths-container">
                    {/* Category Cards */}
                    <div className="learning-path-cards">
                        {Object.entries(topicCategories).map(([categoryName, category]) => {
                            const difficultyCount = category.topics.reduce((acc, topic) => {
                                acc[topic.difficulty] = (acc[topic.difficulty] || 0) + 1;
                                return acc;
                            }, {});

                            return (
                                <div
                                    key={categoryName}
                                    className={`category-card ${activeCategory === categoryName ? 'active' : ''}`}
                                    onClick={() => handleCategorySelect(categoryName)}
                                >
                                    <div className="category-header">
                                        <span className="icon">{category.icon}</span>
                                        <h3>{categoryName}</h3>
                                    </div>
                                    <p className="category-description">{category.description}</p>
                                    <div className="topic-count">
                                        <span>{category.topics.length} topics</span>
                                        <div className="difficulty-badges">
                                            {Object.entries(difficultyCount).map(([difficulty, count]) => (
                                                <span key={difficulty} className={`badge ${difficulty}`}>
                                                    {count} {difficulty}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Interactive Learning Area */}
                    <div className="interactive-learning-area">
                        <div className="learning-header">
                            <h3>Interactive Topic Explorer</h3>
                            <p>Select a topic to explore detailed explanations, diagrams, and code examples</p>
                        </div>

                        <div className="topic-explorer">
                            {/* Topics Sidebar */}
                            <div className="topics-sidebar">
                                <div className="category-title">
                                    <span className="icon">{topicCategories[activeCategory].icon}</span>
                                    <span>{activeCategory}</span>
                                </div>
                                <ul className="topics-list">
                                    {topicCategories[activeCategory].topics.map((topic) => (
                                        <li
                                            key={topic.id}
                                            className={`topic-item ${activeTopic.id === topic.id ? 'active' : ''}`}
                                            onClick={() => setActiveTopic(topic)}
                                        >
                                            <div className="topic-title">{topic.title}</div>
                                            <div className="topic-meta">
                                                <span className={`difficulty ${topic.difficulty}`}>
                                                    {topic.difficulty}
                                                </span>
                                                {topic.prerequisites.length > 0 && (
                                                    <span className="prerequisites">
                                                        Prereq: {topic.prerequisites.length}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visual Area */}
                            <div className="topic-visual">
                                {activeTopic.image ? (
                                    <>
                                        <img
                                            src={activeTopic.image}
                                            alt={`${activeTopic.title} diagram`}
                                            onClick={openModal}
                                        />
                                        <div className="click-hint">Click to expand</div>
                                    </>
                                ) : (
                                    <div className="placeholder">
                                        <div className="icon">📊</div>
                                        <p>Diagram coming soon</p>
                                    </div>
                                )}
                            </div>

                            {/* Topic Details */}
                            <div className="topic-details">
                                <div className="topic-header">
                                    <h3>
                                        {activeTopic.title}
                                        <span className={`difficulty-badge ${activeTopic.difficulty}`}>
                                            {activeTopic.difficulty}
                                        </span>
                                    </h3>
                                    {activeTopic.prerequisites.length > 0 && (
                                        <div className="prerequisites">
                                            <span className="prereq-label">Prerequisites:</span>
                                            {activeTopic.prerequisites.map((prereq) => (
                                                <span
                                                    key={prereq}
                                                    className="prereq-item"
                                                    onClick={() => {
                                                        const prerequisiteTopic = allTopics.find(t => t.id === prereq);
                                                        if (prerequisiteTopic) handleTopicSelect(prerequisiteTopic);
                                                    }}
                                                >
                                                    {allTopics.find(t => t.id === prereq)?.title || prereq}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="topic-description">
                                    {activeTopic.description}
                                </div>

                                <div className="topic-actions">
                                    <a
                                        href={activeTopic.githubLink}
                                        className="github-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon name="GitHub" />
                                        View Code Examples
                                    </a>

                                    {activeTopic.nextTopics.length > 0 && (
                                        <div className="next-topics">
                                            <div className="label">Continue with:</div>
                                            <div className="next-topic-links">
                                                {activeTopic.nextTopics.map((nextTopicId) => (
                                                    <span
                                                        key={nextTopicId}
                                                        className="next-topic"
                                                        onClick={() => handleNextTopic(nextTopicId)}
                                                    >
                                                        {allTopics.find(t => t.id === nextTopicId)?.title || nextTopicId}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Roadmap CTA */}
                <div className="learning-roadmap">
                    <h3>Ready to Deep Dive?</h3>
                    <p>
                        Explore my complete embedded systems learning resources and project implementations
                        on GitHub. Each repository includes detailed documentation, code examples, and practical exercises.
                    </p>
                    <a
                        href="https://github.com/rajatchaple/embedded-concepts"
                        className="roadmap-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Explore Full Learning Path
                        <Icon name="External" />
                    </a>
                </div>
            </div>

            {/* Modal for expanded images */}
            <div className={`modal-overlay ${isModalOpen ? 'show' : ''}`} onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    {activeTopic.image && (
                        <img
                            src={activeTopic.image}
                            alt={`${activeTopic.title} expanded diagram`}
                        />
                    )}
                    <button className="close-button" onClick={closeModal}>
                        ✕
                    </button>
                </div>
            </div>
        </StyledLearnEmbeddedSection>
    );
};

export default LearnEmbeddedEnhanced;
