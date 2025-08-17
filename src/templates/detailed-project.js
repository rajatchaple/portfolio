import React from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';

import { Layout } from '@components';

const StyledProjectContainer = styled.main`
  max-width: none;
  width: 100%;
`;

const StyledProjectHeader = styled.header`
  margin-bottom: 50px;
  .tag {
    margin-right: 10px;
  }
`;

const StyledProjectContent = styled.div`
  margin-bottom: 100px;
  
  /* Allow custom HTML and CSS from markdown */
  h1, h2, h3, h4, h5, h6 {
    margin: 2em 0 1em;
  }

  p {
    margin: 1em 0;
    line-height: 1.5;
    color: var(--light-slate);
  }

  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }

  code {
    background-color: var(--lightest-navy);
    color: var(--lightest-slate);
    border-radius: var(--border-radius);
    font-size: var(--fz-sm);
    padding: 0.2em 0.4em;
  }

  pre code {
    background-color: transparent;
    padding: 0;
  }

  /* Support for custom project layouts */
  .project-layout {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
    align-items: flex-start;
    max-width: none !important;
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    margin-right: 0;
    padding: 0 2rem 0 5rem;
    box-sizing: border-box;
    padding-top: 2rem;
  }

  .project-nav {
    width: 300px;
    min-width: 300px;
    flex-shrink: 0;
    position: sticky;
    top: 140px;
    height: fit-content;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    background: rgba(100, 255, 218, 0.08);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid rgba(100, 255, 218, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .nav-title {
    font-family: var(--font-mono);
    color: #ff6b6b !important;
    font-weight: 600;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: center;
    padding-bottom: 1rem;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-list li {
    margin-bottom: 0.6rem;
    position: relative;
  }

  .nav-link {
    color: #ccd6f6 !important;
    text-decoration: none;
    font-size: 0.85rem;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    display: block;
    transition: none;
    border-left: 3px solid transparent;
    font-weight: 500;
    line-height: 1.3;
  }

  .nav-link:hover {
    color: #ff6b6b !important;
    background: rgba(255, 107, 107, 0.05);
  }

  .nav-link.active {
    color: #ff6b6b !important;
    background: rgba(255, 107, 107, 0.1);
    border-left-color: #ff6b6b;
    font-weight: 600;
  }

  /* Support for inline arrow spans */
  span[style*="color: #ff6b6b"] {
    color: #ff6b6b !important;
    font-size: 1rem !important;
    margin-right: 0.8rem !important;
    display: inline-block !important;
    font-weight: bold !important;
  }

  .project-content {
    flex: 1;
    min-width: 0;
    max-width: none !important;
    overflow-x: auto;
  }

  .content-section {
    margin-bottom: 3rem;
    scroll-margin-top: 30vh;
    width: 100%;
    max-width: none !important;
  }

  /* Responsive design */
  @media (max-width: 1200px) {
    .project-layout {
      flex-direction: column;
      gap: 2rem;
      padding: 0 1rem;
    }
    
    .project-nav {
      width: 100%;
      min-width: auto;
      position: relative;
      top: 0;
      max-height: none;
      margin-bottom: 2rem;
    }
    
    .project-content {
      width: 100% !important;
    }
    
    .nav-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }
    
    .nav-list li {
      margin-bottom: 0;
    }
  }

  /* Smooth scroll */
  html {
    scroll-behavior: smooth;
  }
`;

const DetailedProjectTemplate = ({ data, location }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, tags, tech } = frontmatter;

  return (
    <Layout location={location}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <StyledProjectContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <a href="/archive">All projects</a>
        </span>

        <StyledProjectHeader>
          <h1 className="medium-title">{title}</h1>
          <p className="subtitle">
            {date && (
              <>
                <time>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>&nbsp;&mdash;&nbsp;</span>
              </>
            )}
            {tags &&
              tags.length > 0 &&
              tags.map((tag, i) => (
                <a
                  key={i}
                  href={`/pensieve/tags/${tag}/`}
                  className="tag">
                  #{tag}
                </a>
              ))}
            {tech &&
              tech.length > 0 &&
              tech.map((technology, i) => (
                <span key={i} className="tag">
                  {technology}
                </span>
              ))}
          </p>
        </StyledProjectHeader>

        <StyledProjectContent dangerouslySetInnerHTML={{ __html: html }} />
      </StyledProjectContainer>
    </Layout>
  );
};

export default DetailedProjectTemplate;

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { slug: { eq: $path } }) {
      html
      frontmatter {
        title
        date
        slug
        tags
        tech
        github
        external
      }
    }
  }
`;
