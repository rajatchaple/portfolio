import React, { useEffect, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledAboutSection = styled.section`
  max-width: 900px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const StyledText = styled.div`
  ul.skills-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 200px));
    grid-gap: 0 10px;
    padding: 0;
    margin: 20px 0 0 0;
    overflow: hidden;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-family: var(--font-mono);
      font-size: var(--fz-xs);

      &:before {
        content: '▹';
        position: absolute;
        left: 0;
        color: var(--green);
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }

  ul.achievements-list {
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;

    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 20px;
      font-size: var(--fz-sm);
      color: var(--light-slate);

      &:before {
        content: '🏆';
        position: absolute;
        left: 0;
        font-size: var(--fz-sm);
        line-height: 12px;
      }
    }
  }
`;

const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    margin: 50px auto 0;
    width: 70%;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--grey);

    &:hover,
    &:focus {
      outline: 0;

      &:after {
        top: 15px;
        left: 15px;
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 20px;
      left: 20px;
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);

  // Enhanced skills with categories
  const skillCategories = {
    'Programming & Development': ['C/C++', 'Python', 'MATLAB/Simulink', 'Assembly (ARM)', 'Real-time Programming', 'Multi-threading'],
    'Hardware & Protocols': ['CAN Protocol', 'UART/SPI/I2C', 'PCB Design (Altium)', 'JTAG/SWD Debugging', 'Oscilloscope/Logic Analyzer', 'Power Management'],
    'Embedded Systems': ['Bare-metal Development', 'RTOS (FreeRTOS)', 'Device Drivers', 'Bootloader Development', 'Memory Management', 'Interrupt Handling'],
    'Tools & Platforms': ['Git/GitHub', 'JIRA/Confluence', 'Jenkins CI/CD', 'Docker', 'Linux/Windows', 'Embedded Linux']
  };

  const skills = Object.values(skillCategories).flat();

  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              I'm Rajat Chaple, an embedded systems engineer with 7+ years of experience developing robust firmware and real-time software for automotive and consumer electronics. I hold a Master's in Embedded Systems from the University of Colorado Boulder and have contributed to innovative projects at Lucid Motors, Canoo, Analog Devices, and John Deere.
            </p>

            <p>
              My expertise spans bare-metal development, C programming, MATLAB/Simulink modeling, and device driver design. I've worked extensively with CAN, UART, SPI, and I2C protocols, and have hands-on experience with battery management, telematics (JDLink), and system-level debugging.
            </p>

            <p>
              I enjoy bridging hardware and software to solve complex problems and create efficient embedded solutions. Outside work, I'm passionate about table tennis, badminton, bowling, and the Marvel Cinematic Universe.
            </p>

            <p><strong>Key Achievements:</strong></p>
            <ul className="achievements-list">
              <li>Led firmware development for next-generation automotive ECUs at Lucid Motors</li>
              <li>Designed power-efficient embedded solutions reducing system power consumption by 30%</li>
              <li>Developed robust CAN communication protocols for vehicle telematics systems</li>
              <li>Mentored junior engineers and contributed to embedded systems knowledge sharing</li>
            </ul>

            <p><strong>Technologies I've Been Working With Recently:</strong></p>
          </div>

          <ul className="skills-list">
            {skills && skills.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/me.jpg"
              width={500}
              quality={95}
              formats={['AUTO', 'WEBP', 'AVIF']}
              alt="Headshot"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
