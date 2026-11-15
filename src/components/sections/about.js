import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';

const StyledAboutSection = styled.section`
  .glass-card {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    gap: 44px;
    padding: clamp(24px, 4vw, 44px);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 28px;
    }
  }

  p {
    margin: 0 0 16px;
    color: var(--slate);
    font-size: var(--fz-lg);
    line-height: 1.65;
  }

  .skills-title {
    margin: 26px 0 12px;
    color: var(--lightest-slate);
    font-size: var(--fz-sm);
    font-weight: 600;
  }

  .photo {
    align-self: start;
    max-width: 320px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid var(--glass-border);
    box-shadow: 0 18px 40px -22px var(--navy-shadow);

    @media (max-width: 768px) {
      order: -1;
      max-width: 220px;
    }
  }
`;

const skills = [
  'Bare-metal',
  'Device drivers',
  'Low-power design',
  'Altium PCB design',
  'Multi-threading',
  'Event-driven scheduling',
];

const About = () => (
  <StyledAboutSection id="about">
    <div className="section-head" data-reveal>
      <span className="eyebrow">About</span>
      <h2>A bit about me</h2>
    </div>

    <div className="glass-card" data-reveal style={{ '--reveal-delay': '120ms' }}>
      <div>
        <p>
          I&apos;m Rajat Chaple, an embedded systems engineer with 7+ years of experience developing
          robust firmware and real-time software for automotive and consumer electronics. I hold a
          Master’s in Embedded Systems from the University of Colorado Boulder and have contributed
          to projects at Lucid Motors, Canoo, Analog Devices, and John Deere.
        </p>
        <p>
          My expertise spans bare-metal development, C programming, MATLAB/Simulink modeling, and
          device driver design. I’ve worked extensively with CAN, UART, SPI, and I2C, and have
          hands-on experience with battery management, telematics (JDLink), and system-level
          debugging.
        </p>
        <p>
          I enjoy bridging hardware and software to solve complex problems. Outside work, I’m into
          table tennis, badminton, bowling, and the Marvel Cinematic Universe.
        </p>

        <p className="skills-title">Recently working with</p>
        <ul className="tag-list">
          {skills.map(skill => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className="photo">
        <StaticImage
          src="../../images/me.jpg"
          width={500}
          quality={90}
          formats={['AUTO', 'WEBP', 'AVIF']}
          alt="Rajat Chaple"
        />
      </div>
    </div>
  </StyledAboutSection>
);

export default About;
