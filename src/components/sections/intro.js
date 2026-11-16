import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { email, socialMedia } from '@config';

const StyledIntro = styled.section`
  &&& {
    max-width: none;
    margin: 0;
    padding: clamp(40px, 12vh, 140px) 0 clamp(60px, 12vh, 120px);
  }

  > * {
    animation: fadeUp 1.2s var(--ease-soft) both;
    animation-delay: calc(var(--i, 0) * 110ms + 150ms);
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 22px;
    color: var(--slate);
    font-size: var(--fz-sm);

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 0 4px var(--green-tint);
    }
  }

  h1 {
    margin: 0;
    color: var(--lightest-slate);
    font-size: clamp(42px, 7vw, 76px);
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .lede {
    max-width: 600px;
    margin: 22px 0 0;
    color: var(--slate);
    font-size: clamp(18px, 2vw, 21px);
    line-height: 1.55;
  }

  .aside {
    max-width: 600px;
    margin: 10px 0 0;
    color: var(--dark-slate);
    font-size: clamp(16px, 1.7vw, 18px);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 32px;
  }

  .text-link {
    margin-left: 6px;
    color: var(--light-slate);
    font-size: var(--fz-sm);

    &:hover,
    &:focus-visible {
      color: var(--green);
    }
  }

  .previously {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 22px;
    margin: 48px 0 0;
    padding: 0;
    list-style: none;
    color: var(--dark-slate);
    font-size: var(--fz-sm);

    li:first-child {
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1.7;
    }
  }
`;

const Intro = () => {
  const data = useStaticQuery(graphql`
    query {
      jobs: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        nodes {
          frontmatter {
            title
            company
          }
        }
      }
    }
  `);

  const [current, ...past] = data.jobs.nodes.map(n => n.frontmatter);
  const linkedin = socialMedia.find(s => s.name === 'Linkedin');

  return (
    <StyledIntro id="top">
      <p className="status" style={{ '--i': 0 }}>
        <span className="dot" aria-hidden="true" />
        {current.title} at {current.company}
      </p>

      <h1 style={{ '--i': 1 }}>Rajat Chaple</h1>

      <p className="lede" style={{ '--i': 2 }}>
        I build firmware for vehicles and consumer electronics: bare-metal drivers, low-power
        hardware, and safety-critical battery software.
      </p>

      <p className="aside" style={{ '--i': 2.5 }}>
        Off the clock I draw with machines, take photos, and build things I don&apos;t strictly
        need.
      </p>

      <div className="actions" style={{ '--i': 3 }}>
        <a className="pill-btn dark" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
          Resume
        </a>
        <a className="pill-btn" href={`mailto:${email}`}>
          Email me
        </a>
        {linkedin && (
          <a className="text-link" href={linkedin.url} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        )}
      </div>

      <ul className="previously" style={{ '--i': 4 }}>
        <li>Previously</li>
        {past.map(({ company }) => (
          <li key={company}>{company}</li>
        ))}
      </ul>
    </StyledIntro>
  );
};

export default Intro;
