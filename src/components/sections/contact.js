import React from 'react';
import styled from 'styled-components';
import { email } from '@config';

const StyledContactSection = styled.section`
  .glass-card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: clamp(28px, 4vw, 44px);
  }

  .section-head {
    margin: 0;
  }

  p {
    max-width: 520px;
    margin: 12px 0 0;
    color: var(--slate);
    font-size: var(--fz-lg);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const Contact = () => (
  <StyledContactSection id="contact">
    <div className="glass-card" data-reveal>
      <div>
        <div className="section-head">
          <span className="eyebrow">Contact</span>
          <h2>Get in touch</h2>
        </div>
        <p>
          My inbox is always open. Whether you have a question or just want to say hi, I’ll do my
          best to get back to you.
        </p>
      </div>
      <div className="actions">
        <a className="pill-btn dark" href={`mailto:${email}`}>
          Say hello
        </a>
        <a className="pill-btn" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </div>
    </div>
  </StyledContactSection>
);

export default Contact;
