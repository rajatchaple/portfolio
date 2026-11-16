import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'gatsby';
import styled from 'styled-components';
import { navLinks, socialMedia } from '@config';
import { KEY_CODES } from '@utils';
import { useOnClickOutside } from '@hooks';
import { Icon } from '@components/icons';
import { LineIcon } from './sidebar';
import { scrollToElement } from '@utils/smoothScroll';

const links = [{ name: 'Overview', url: '/#top' }, ...navLinks];

/* Round glass button; two lines that fold into an X */
const StyledMenuButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  background: var(--surface-2);
  color: var(--lightest-slate);
  cursor: pointer;
  transition: background 0.3s var(--ease-soft), transform 0.3s var(--ease-soft);

  &:active {
    transform: scale(0.94);
  }

  span {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 1.8px;
    border-radius: 2px;
    background: currentColor;
    transition: transform 0.45s var(--ease-soft), top 0.45s var(--ease-soft);
  }
  span:nth-child(1) {
    top: ${({ menuOpen }) => (menuOpen ? '20px' : '16px')};
    transform: rotate(${({ menuOpen }) => (menuOpen ? '45deg' : '0')});
  }
  span:nth-child(2) {
    top: ${({ menuOpen }) => (menuOpen ? '20px' : '23px')};
    transform: rotate(${({ menuOpen }) => (menuOpen ? '-45deg' : '0')});
  }
`;

/* Glass sheet that drops down under the bar */
const StyledPanel = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: -1px;
  right: -1px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  background: var(--glass-bg), var(--menu-bg);
  box-shadow: inset 0 1px 0 var(--glass-highlight), 0 24px 50px -20px var(--navy-shadow);
  opacity: ${({ menuOpen }) => (menuOpen ? 1 : 0)};
  visibility: ${({ menuOpen }) => (menuOpen ? 'visible' : 'hidden')};
  transform: ${({ menuOpen }) =>
    menuOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, -10px, 0) scale(0.98)'};
  transform-origin: top center;
  transition: opacity 0.35s var(--ease-soft), transform 0.5s var(--ease-soft),
    visibility 0s linear ${({ menuOpen }) => (menuOpen ? '0s' : '0.5s')};

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    opacity: ${({ menuOpen }) => (menuOpen ? 1 : 0)};
    transform: translate3d(0, ${({ menuOpen }) => (menuOpen ? 0 : '6px')}, 0);
    transition: opacity 0.4s var(--ease-soft), transform 0.5s var(--ease-soft);
    transition-delay: ${({ menuOpen }) => (menuOpen ? 'calc(var(--i) * 35ms + 60ms)' : '0ms')};
  }

  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 14px;
    border-radius: 14px;
    color: var(--slate);
    font-size: var(--fz-md);
    font-weight: 500;
    text-decoration: none;
    transition: background 0.25s, color 0.25s;

    &:hover,
    &:focus-visible {
      color: var(--lightest-slate);
      background: var(--surface-1);
    }

    &.is-active {
      color: var(--lightest-slate);
      background: var(--surface-3);
      box-shadow: 0 6px 16px -10px var(--navy-shadow);
    }

    .feather {
      width: 18px;
      height: 18px;
      fill: none;
      flex: none;
    }

    .arrow {
      margin-left: auto;
      color: var(--green);
      font-size: 13px;
    }
  }

  .divider {
    height: 1px;
    margin: 8px 14px;
    background: var(--lightest-navy);
  }

  .socials {
    display: flex;
    gap: 8px;
    padding: 6px 8px 4px;

    a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      background: var(--surface-1);
      color: var(--slate);

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

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    li {
      transition: none;
    }
  }
`;

const Menu = ({ isHome, onToggle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pathname, setPathname] = useState('');
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const wrapperRef = useRef(null);

  const setOpen = open => {
    setMenuOpen(open);
    if (onToggle) {
      onToggle(open);
    }
  };

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === KEY_CODES.ESCAPE || e.key === KEY_CODES.ESCAPE_IE11) {
        setOpen(false);
        return;
      }
      if (e.key !== KEY_CODES.TAB || !panelRef.current) {
        return;
      }
      // Keep keyboard focus inside the open menu
      const focusables = [buttonRef.current, ...panelRef.current.querySelectorAll('a')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1080) {
        setOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', onKeyDown);
    }
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  useOnClickOutside(wrapperRef, () => setOpen(false));

  // On the home page, glide to the section instead of jumping
  const handleNav = (e, url) => {
    setOpen(false);
    const id = url.split('#')[1];
    const el = isHome && id && document.getElementById(id);
    if (el) {
      e.preventDefault();
      scrollToElement(el);
    }
  };

  const isActive = url => (url.includes('#') ? false : pathname.startsWith(url.replace(/\/$/, '')));

  return (
    <div ref={wrapperRef}>
      <Helmet>
        <body className={menuOpen ? 'blur' : ''} />
      </Helmet>

      <StyledMenuButton
        type="button"
        ref={buttonRef}
        menuOpen={menuOpen}
        onClick={() => setOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}>
        <span />
        <span />
      </StyledMenuButton>

      <StyledPanel ref={panelRef} menuOpen={menuOpen} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <ol>
            {links.map(({ name, url }, i) => (
              <li key={name} style={{ '--i': i }}>
                <Link
                  to={url}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`item${isActive(url) ? ' is-active' : ''}`}
                  onClick={e => handleNav(e, url)}>
                  <LineIcon name={name} />
                  {name}
                </Link>
              </li>
            ))}
            <li className="divider" aria-hidden="true" style={{ '--i': links.length }} />
            <li style={{ '--i': links.length + 1 }}>
              <a
                className="item"
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={menuOpen ? 0 : -1}>
                <LineIcon name="Resume" />
                Resume
                <span className="arrow">↗</span>
              </a>
            </li>
            <li className="socials" style={{ '--i': links.length + 2 }}>
              {socialMedia.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  aria-label={name}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={menuOpen ? 0 : -1}>
                  <Icon name={name} />
                </a>
              ))}
            </li>
          </ol>
        </nav>
      </StyledPanel>
    </div>
  );
};

Menu.propTypes = {
  isHome: PropTypes.bool,
  onToggle: PropTypes.func,
};

export default Menu;
