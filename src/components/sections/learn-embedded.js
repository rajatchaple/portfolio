import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledLearnEmbeddedSection = styled.section`
  max-width: 900px;

  .inner {
    display: flex;
    flex-direction: column;

    h2 {
      font-size: clamp(24px, 5vw, 32px);
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--lightest-slate);
    }

    p {
      margin-bottom: 15px;
      color: var(--light-slate);
      font-size: var(--fz-lg);
    }

    ul {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 20px;
      padding: 0;
      list-style: none;

      li {
        padding: 20px;
        background-color: var(--light-navy);
        border-radius: var(--border-radius);
        box-shadow: 0 10px 30px -15px var(--navy-shadow);
        transition: var(--transition);

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px -15px var(--navy-shadow);
        }

        h3 {
          margin-bottom: 10px;
          color: var(--lightest-slate);
          font-size: var(--fz-xxl);
        }

        p {
          font-size: var(--fz-md);
          margin-bottom: 0;
        }
        
        a {
          color: var(--green);
          font-family: var(--font-mono);
          font-size: var(--fz-sm);
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
`;

const LearnEmbedded = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  return (
    <StyledLearnEmbeddedSection id="learn-embedded" ref={revealContainer}>
      <h2 className="numbered-heading">Learn Embedded</h2>

      <div className="inner">
        <p>
          Explore core embedded systems concepts explained with practical examples. 
          Each topic includes explanations, diagrams, and working code samples on GitHub.
        </p>

        <ul className="topic-list">
          <li>
            <h3>Priority Inversion</h3>
            <p>A classic RTOS problem where a low-priority task blocks a high-priority one due to resource locking.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/priority_inversion_demo" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
          
          <li>
            <h3>Mutex vs Semaphore</h3>
            <p>Understand the difference and use-cases for mutexes and semaphores in embedded systems.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/RTOS/mutex_vs_semaphore.md" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
          
          <li>
            <h3>SPI Bit Bang</h3>
            <p>Manual SPI implementation for microcontrollers without hardware SPI support.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/Drivers/spi_bit_bang" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
          
          <li>
            <h3>UART with DMA</h3>
            <p>Efficient UART communication using DMA for high-speed data transfer.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/Drivers/uart_dma_example" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
          
          <li>
            <h3>Stack Usage Analysis</h3>
            <p>Techniques to analyze and optimize stack usage in embedded firmware.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/Debugging/stack_usage_analysis" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
          
          <li>
            <h3>GDB Cheatsheet</h3>
            <p>Quick reference for debugging embedded code using GDB.</p>
            <a href="https://github.com/rajatchaple/embedded-concepts/tree/main/Debugging/gdb_cheatsheet/gdb_cheatsheet.md" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </li>
        </ul>
      </div>
    </StyledLearnEmbeddedSection>
  );
};

export default LearnEmbedded;
