import React, { useEffect, useRef } from 'react';
import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';
import { scrollToElement } from '@utils/smoothScroll';

const StyledNote = styled.main`
  max-width: 1040px;
  padding-top: 40px;

  @media (max-width: 1080px) {
    padding-top: var(--nav-height);
  }

  .breadcrumb {
    margin-bottom: 28px;
  }

  header {
    margin-bottom: 32px;

    h1 {
      margin: 0 0 12px;
      color: var(--lightest-slate);
      font-size: clamp(32px, 5vw, 46px);
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 14px;
      color: var(--dark-slate);
      font-size: var(--fz-sm);
    }
  }

  /* Contents: one compact row of top-level headings above the article,
     so the article keeps the full width for code and tables */
  .toc {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 14px;
    margin-bottom: 18px;
    font-size: var(--fz-sm);

    .toc-title {
      color: var(--dark-slate);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 14px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    ul ul {
      display: none;
    }
    li > p {
      margin: 0;
    }
    a {
      color: var(--slate);
      border-bottom: 1px solid transparent;
      &:hover,
      &:focus-visible {
        color: var(--green);
        border-bottom-color: currentColor;
      }
    }
  }
`;

const StyledBody = styled.article`
  padding: clamp(22px, 4vw, 40px);
  color: var(--slate);
  font-size: var(--fz-md);
  line-height: 1.65;

  & > *:first-child {
    margin-top: 0;
  }

  h2,
  h3,
  h4 {
    margin: 2em 0 0.6em;
    color: var(--lightest-slate);
    font-weight: 600;
    scroll-margin-top: 24px;
  }
  h2 {
    padding-top: 1.2em;
    border-top: 1px solid var(--lightest-navy);
    font-size: var(--fz-xxl);
  }
  h2:first-child {
    padding-top: 0;
    border-top: 0;
  }
  h3 {
    font-size: var(--fz-xl);
  }

  p,
  ul,
  ol {
    margin: 0.8em 0;
  }
  li {
    margin: 0.3em 0;
  }
  strong {
    color: var(--light-slate);
  }

  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }

  blockquote {
    margin: 1.2em 0;
    padding: 12px 18px;
    border-left: 3px solid var(--green);
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    background: var(--green-tint);
    color: var(--light-slate);

    p {
      margin: 0;
      font-size: inherit;
      font-style: normal;
    }
  }

  *:not(pre) > code {
    padding: 0.12em 0.4em;
    border-radius: 6px;
    background: var(--lightest-navy);
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: 0.85em;
  }

  /* Warm ink instead of the old navy, to sit with the Sand palette */
  .gatsby-highlight {
    margin: 1.2em 0;
    padding: 1.1em 1.25em;
    border-radius: 14px;
    background-color: #1f1c19;
    font-size: 13px;
  }
  .gatsby-highlight pre[class*='language-'] {
    padding-top: 0;
  }

  table {
    width: 100%;
    margin: 1.2em 0;
    border-collapse: collapse;
    font-size: var(--fz-sm);
    display: block;
    overflow-x: auto;
  }
  th,
  td {
    padding: 9px 12px;
    border-bottom: 1px solid var(--lightest-navy);
    text-align: left;
    vertical-align: top;
  }
  th {
    color: var(--lightest-slate);
    font-weight: 600;
    white-space: nowrap;
  }

  hr {
    margin: 2em 0;
    border: 0;
    border-top: 1px solid var(--lightest-navy);
  }
`;

const NoteTemplate = ({ data, location }) => {
  const { frontmatter, html, tableOfContents, timeToRead } = data.markdownRemark;
  const { title, date, tags } = frontmatter;
  const hasToc = tableOfContents && tableOfContents.includes('<li>');
  const bodyRef = useRef(null);
  const tocRef = useRef(null);

  // The TOC links to #slugs; give each heading the id of the TOC entry with the same text
  useEffect(() => {
    if (!bodyRef.current || !tocRef.current) {
      return;
    }
    const hrefByText = new Map();
    tocRef.current.querySelectorAll('a').forEach(a => {
      hrefByText.set(a.textContent.trim(), a.getAttribute('href'));
    });
    bodyRef.current.querySelectorAll('h1, h2, h3').forEach(h => {
      const href = hrefByText.get(h.textContent.trim());
      if (href && href.startsWith('#')) {
        h.id = decodeURIComponent(href.slice(1));
      }
    });
  }, [html, tableOfContents]);

  const onTocClick = e => {
    const a = e.target.closest('a');
    const href = a && a.getAttribute('href');
    if (!href || !href.startsWith('#')) {
      return;
    }
    const el = document.getElementById(decodeURIComponent(href.slice(1)));
    if (el) {
      e.preventDefault();
      scrollToElement(el);
      window.history.replaceState(null, '', href);
    }
  };

  return (
    <Layout location={location}>
      <Helmet title={`${title} · Notes`} />

      <StyledNote>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/notes/">All notes</Link>
        </span>

        <header>
          <h1>{title}</h1>
          <div className="meta">
            {date && (
              <span>
                Updated{' '}
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </span>
            )}
            <span>· {timeToRead} min read</span>
            {tags && tags.length > 0 && (
              <ul className="tag-list">
                {tags.map(tag => (
                  <li key={tag}>
                    <Link to={`/notes/?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {hasToc && (
          <nav className="toc" aria-label="On this page">
            <span className="toc-title">On this page</span>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
              ref={tocRef}
              onClick={onTocClick}
              dangerouslySetInnerHTML={{ __html: tableOfContents }}
            />
          </nav>
        )}

        <StyledBody
          ref={bodyRef}
          className="glass-card"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </StyledNote>
    </Layout>
  );
};

NoteTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default NoteTemplate;

export const pageQuery = graphql`
  query ($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      tableOfContents(maxDepth: 3)
      frontmatter {
        title
        date
        tags
      }
    }
  }
`;
