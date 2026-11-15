import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';

const StyledExperience = styled.section`
  .glass-card {
    padding: 8px clamp(20px, 4vw, 40px);
  }

  .role {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 24px;
    padding: 28px 0;

    & + .role {
      border-top: 1px solid var(--lightest-navy);
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 6px;
    }
  }

  .when {
    padding-top: 3px;
    color: var(--dark-slate);
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
  }

  h3 {
    margin: 0;
    color: var(--lightest-slate);
    font-size: var(--fz-xl);
    font-weight: 600;
  }

  .where {
    margin: 4px 0 12px;
    color: var(--slate);
    font-size: var(--fz-sm);

    a {
      color: var(--light-slate);
      font-weight: 500;
      &:hover,
      &:focus-visible {
        color: var(--green);
      }
    }
  }

  .now {
    margin-left: 10px;
    padding: 2px 9px;
    border-radius: 999px;
    color: var(--green);
    background: var(--green-tint);
    font-size: 12px;
    font-weight: 600;
    vertical-align: middle;
  }

  .details {
    color: var(--slate);
    font-size: var(--fz-md);
    line-height: 1.6;

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      position: relative;
      margin-bottom: 8px;
      padding-left: 18px;

      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.7em;
        width: 6px;
        height: 1px;
        background: var(--green);
      }
    }
    p {
      margin: 0;
    }
    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }
`;

const Experience = () => {
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
            location
            range
            url
          }
          html
        }
      }
    }
  `);

  return (
    <StyledExperience id="jobs">
      <div className="section-head" data-reveal>
        <span className="eyebrow">Experience</span>
        <h2>Where I&apos;ve worked</h2>
      </div>

      <div className="glass-card" data-reveal style={{ '--reveal-delay': '120ms' }}>
        {data.jobs.nodes.map(({ frontmatter, html }, i) => {
          const { title, company, location, range, url } = frontmatter;
          return (
            <article className="role" key={`${company}-${title}`} data-reveal>
              <div className="when">{range}</div>
              <div>
                <h3>
                  {title}
                  {i === 0 && <span className="now">Now</span>}
                </h3>
                <div className="where">
                  <a href={url} target="_blank" rel="noreferrer">
                    {company}
                  </a>{' '}
                  · {location}
                </div>
                <div className="details" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </article>
          );
        })}
      </div>
    </StyledExperience>
  );
};

export default Experience;
