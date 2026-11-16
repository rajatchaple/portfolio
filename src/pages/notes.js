import React, { useEffect, useMemo, useRef, useState } from 'react';
import { graphql, Link } from 'gatsby';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledNotes = styled.main`
  max-width: 1040px;
  padding-top: 40px;

  @media (max-width: 1080px) {
    padding-top: var(--nav-height);
  }

  .intro {
    margin-bottom: 28px;

    h1 {
      margin: 0 0 10px;
      color: var(--lightest-slate);
      font-size: clamp(34px, 5vw, 48px);
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    p {
      max-width: 560px;
      margin: 0;
      color: var(--slate);
      font-size: var(--fz-lg);
    }
  }

  .search {
    position: relative;
    margin-bottom: 14px;

    svg {
      position: absolute;
      top: 50%;
      left: 18px;
      width: 18px;
      height: 18px;
      transform: translateY(-50%);
      color: var(--dark-slate);
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 15px 56px 15px 48px;
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      background: var(--surface-2);
      color: var(--lightest-slate);
      font-family: var(--font-sans);
      font-size: var(--fz-lg);
      transition: border-color 0.3s var(--ease-soft), background 0.3s var(--ease-soft);

      &::placeholder {
        color: var(--dark-slate);
      }
      &:focus {
        outline: none;
        border-color: var(--accent-border);
        background: var(--surface-3);
      }
    }

    kbd {
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      padding: 2px 8px;
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      color: var(--dark-slate);
      font-family: var(--font-mono);
      font-size: 12px;
    }
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 28px;
    padding: 0;
    list-style: none;

    button {
      padding: 6px 13px;
      border: 1px solid var(--glass-border);
      border-radius: 999px;
      background: var(--surface-1);
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: 12px;
      cursor: pointer;
      transition: color 0.25s, background 0.25s, border-color 0.25s;

      &:hover {
        color: var(--lightest-slate);
      }
      &[aria-pressed='true'] {
        border-color: var(--ink);
        background: var(--ink);
        color: var(--on-ink);
      }
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .note {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 22px 24px;
    color: inherit;

    h2 {
      margin: 0 0 8px;
      color: var(--lightest-slate);
      font-size: var(--fz-xl);
      font-weight: 600;
    }
    p {
      flex: 1;
      margin: 0 0 16px;
      color: var(--slate);
      font-size: var(--fz-sm);
      line-height: 1.55;
    }
    .foot {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 10px;
      color: var(--dark-slate);
      font-family: var(--font-mono);
      font-size: 12px;
    }
    .foot span + span::before {
      content: '·';
      margin-right: 10px;
    }
  }

  .empty {
    padding: 40px 0;
    color: var(--slate);
    text-align: center;
  }
`;

const DATE_FORMAT = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
const formatDate = date => (date ? new Date(date).toLocaleDateString('en-US', DATE_FORMAT) : '');

const NotesPage = ({ location, data }) => {
  const notes = data.allMarkdownRemark.nodes;
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);
  const inputRef = useRef(null);

  // Tag can come from a note page link: /notes/?tag=Bootloader
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get('tag');
    setTag(fromUrl || null);
  }, [location.search]);

  // Press "/" anywhere to jump to search
  useEffect(() => {
    const onKey = e => {
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tags = useMemo(() => {
    const counts = new Map();
    notes.forEach(n =>
      (n.frontmatter.tags || []).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)),
    );
    return [...counts.keys()].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return notes.filter(n => {
      const t = n.frontmatter.tags || [];
      if (tag && !t.includes(tag)) {
        return false;
      }
      const hay = `${n.frontmatter.title} ${t.join(' ')} ${n.rawMarkdownBody}`.toLowerCase();
      return words.every(w => hay.includes(w));
    });
  }, [notes, query, tag]);

  const pickTag = t => {
    const next = tag === t ? null : t;
    setTag(next);
    const url = next ? `/notes/?tag=${encodeURIComponent(next)}` : '/notes/';
    window.history.replaceState(null, '', url);
  };

  return (
    <Layout location={location}>
      <Helmet title="Notes" />

      <StyledNotes>
        <div className="intro">
          <h1>Notes</h1>
          <p>
            My engineering cheatsheets: things I&apos;ve figured out once and don&apos;t want to
            figure out again.
          </p>
        </div>

        <div className="search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, e.g. vector table"
            aria-label="Search notes"
          />
          <kbd aria-hidden="true">/</kbd>
        </div>

        {tags.length > 0 && (
          <ul className="filters" aria-label="Filter by tag">
            <li>
              <button type="button" aria-pressed={!tag} onClick={() => pickTag(null)}>
                All
              </button>
            </li>
            {tags.map(t => (
              <li key={t}>
                <button type="button" aria-pressed={tag === t} onClick={() => pickTag(t)}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}

        {shown.length > 0 ? (
          <ul className="list">
            {shown.map(n => (
              <li key={n.fields.slug}>
                <Link to={n.fields.slug} className="note glass-card is-interactive">
                  <h2>{n.frontmatter.title}</h2>
                  <p>{n.frontmatter.description || n.excerpt}</p>
                  <div className="foot">
                    {n.frontmatter.date && <span>{formatDate(n.frontmatter.date)}</span>}
                    {(n.frontmatter.tags || []).length > 0 && (
                      <span>{n.frontmatter.tags.join(', ')}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">No notes match that yet.</p>
        )}
      </StyledNotes>
    </Layout>
  );
};

NotesPage.propTypes = {
  location: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default NotesPage;

export const pageQuery = graphql`
  {
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/notes/" }
        frontmatter: { draft: { ne: true } }
      }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      nodes {
        fields {
          slug
        }
        excerpt(pruneLength: 140)
        rawMarkdownBody
        frontmatter {
          title
          description
          date
          tags
        }
      }
    }
  }
`;
