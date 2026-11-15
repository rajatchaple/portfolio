import React from 'react';
import PropTypes from 'prop-types';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { Icon } from '@components/icons';

const StyledWork = styled.section`
  .featured {
    display: grid;
    gap: 22px;
  }

  .feature {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: clamp(20px, 3vw, 36px);
    align-items: center;
    padding: clamp(16px, 2.5vw, 22px);

    @media (max-width: 860px) {
      grid-template-columns: 1fr;
    }
  }

  .cover {
    display: block;
    border-radius: 14px;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    background: var(--surface-1);

    .gatsby-image-wrapper {
      width: 100%;
      height: 100%;
    }
    img {
      transition: transform 0.8s var(--easing) !important;
    }
    &:hover img,
    &:focus-visible img {
      transform: scale(1.03);
    }
  }

  .feature-body {
    padding-right: clamp(0px, 2vw, 16px);
  }

  .label {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h3 {
    margin: 8px 0 10px;
    color: var(--lightest-slate);
    font-size: clamp(20px, 2.2vw, 24px);
    font-weight: 600;

    a:hover,
    a:focus-visible {
      color: var(--green);
    }
  }

  .desc {
    margin-bottom: 16px;
    color: var(--slate);
    font-size: var(--fz-md);
    line-height: 1.6;

    p {
      margin: 0;
    }
    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .links {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 14px 0 0 -8px;
    color: var(--light-slate);

    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      font-size: var(--fz-sm);

      &:hover,
      &:focus-visible {
        color: var(--green);
      }
    }
    svg {
      width: 18px;
      height: 18px;
    }
  }

  .others-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin: 56px 0 18px;

    h3 {
      margin: 0;
      font-size: var(--fz-xl);
    }
    a {
      color: var(--light-slate);
      font-size: var(--fz-sm);
      &:hover,
      &:focus-visible {
        color: var(--green);
      }
    }
  }

  .others {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .project {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 22px;

    h4 {
      margin: 0 0 8px;
      color: var(--lightest-slate);
      font-size: var(--fz-lg);
      font-weight: 600;
    }
    .company {
      margin-bottom: 8px;
      color: var(--dark-slate);
      font-size: 13px;
    }
    .desc {
      flex: 1;
      font-size: 15px;
    }
    .tech {
      margin: 0;
      padding: 0;
      list-style: none;
      color: var(--dark-slate);
      font-family: var(--font-mono);
      font-size: 12px;

      li {
        display: inline;
        &:not(:last-child):after {
          content: ' · ';
        }
      }
    }
    .links {
      margin-top: 6px;
    }
  }
`;

const ProjectLinks = ({ github, external, title }) => {
  if (!github && !external) {
    return null;
  }
  const internal = external && external.startsWith('/');
  return (
    <div className="links">
      {github && (
        <a href={github} aria-label={`${title} on GitHub`} target="_blank" rel="noreferrer">
          <Icon name="GitHub" />
        </a>
      )}
      {external && internal && <Link to={external}>Read more →</Link>}
      {external && !internal && (
        <a href={external} aria-label={`${title} website`} target="_blank" rel="noreferrer">
          <Icon name="External" />
        </a>
      )}
    </div>
  );
};

ProjectLinks.propTypes = {
  github: PropTypes.string,
  external: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const Work = () => {
  const data = useStaticQuery(graphql`
    query {
      featured: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/featured/" } }
        sort: { fields: [frontmatter___date], order: ASC }
      ) {
        nodes {
          frontmatter {
            title
            cover {
              childImageSharp {
                gatsbyImageData(width: 760, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
              }
            }
            tech
            github
            external
          }
          html
        }
      }
      projects: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/content/projects/" }
          frontmatter: { showInProjects: { ne: false } }
        }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        nodes {
          frontmatter {
            title
            company
            tech
            github
            external
          }
          html
        }
      }
    }
  `);

  return (
    <StyledWork id="projects">
      <div className="section-head" data-reveal>
        <span className="eyebrow">Work</span>
        <h2>Things I&apos;ve built</h2>
      </div>

      <div className="featured">
        {data.featured.nodes.map(({ frontmatter, html }) => {
          const { title, cover, tech, github, external } = frontmatter;
          const image = getImage(cover);
          const href = external || github;
          const internal = href && href.startsWith('/');
          const Cover = internal ? Link : 'a';
          const coverProps = internal
            ? { to: href }
            : { href, target: '_blank', rel: 'noreferrer' };

          return (
            // Reveal sits on a wrapper so it never fights the card's hover transition
            <div key={title} data-reveal>
              <article className="glass-card is-interactive feature">
                {image && (
                  <Cover className="cover" aria-label={title} {...coverProps}>
                    <GatsbyImage image={image} alt={title} />
                  </Cover>
                )}
                <div className="feature-body">
                  <span className="label">Featured project</span>
                  <h3>
                    <Cover {...coverProps}>{title}</Cover>
                  </h3>
                  <div className="desc" dangerouslySetInnerHTML={{ __html: html }} />
                  {tech && (
                    <ul className="tag-list">
                      {tech.map(t => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                  <ProjectLinks github={github} external={external} title={title} />
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <div className="others-head">
        <h3>Other projects</h3>
        <Link to="/archive">View the archive →</Link>
      </div>

      <ul className="others">
        {data.projects.nodes.map(({ frontmatter, html }, i) => {
          const { title, company, tech, github, external } = frontmatter;
          return (
            <li key={title} data-reveal style={{ '--reveal-delay': `${(i % 3) * 90}ms` }}>
              <article className="glass-card is-interactive project">
                <h4>{title}</h4>
                {company && <div className="company">{company}</div>}
                <div className="desc" dangerouslySetInnerHTML={{ __html: html }} />
                {tech && (
                  <ul className="tech">
                    {tech.map(t => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <ProjectLinks github={github} external={external} title={title} />
              </article>
            </li>
          );
        })}
      </ul>
    </StyledWork>
  );
};

export default Work;
