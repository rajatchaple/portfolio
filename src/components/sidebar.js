import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { navLinks, socialMedia, email } from '@config';
import { Icon } from '@components/icons';
import { scrollToElement } from '@utils/smoothScroll';

const ITEM_HEIGHT = 44;
const ITEM_GAP = 4;

// Feather-style line icons for the sidebar links
const paths = {
  Overview: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  About: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  Experience: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  Work: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />,
  Contact: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  Notes: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  Resume: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
};

export const LineIcon = ({ name }) => (
  <svg
    className="feather"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    {paths[name]}
  </svg>
);

LineIcon.propTypes = { name: PropTypes.string.isRequired };

const links = [{ name: 'Overview', url: '/#top' }, ...navLinks];
const sectionIds = links.map(({ url }) => url.split('#')[1]);

const StyledSidebar = styled.aside`
  ${({ theme }) => theme.mixins.glass};
  ${({ theme }) => theme.mixins.frosted};
  display: none;
  position: fixed;
  top: var(--shell-gap);
  bottom: var(--shell-gap);
  left: var(--shell-gap);
  z-index: 11;
  width: var(--sidebar-width);
  padding: 18px 14px;
  flex-direction: column;
  border-radius: 26px;
  animation: sidebarIn 1.1s var(--ease-soft) both;

  @media (min-width: 1081px) {
    display: flex;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px 18px;
    color: var(--lightest-slate);

    .avatar {
      flex: 0 0 auto;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--glow);
    }
    .name {
      font-size: var(--fz-md);
      font-weight: 600;
      line-height: 1.2;
    }
    .role {
      color: var(--dark-slate);
      font-size: 13px;
    }
  }

  .label {
    margin: 18px 10px 8px;
    color: var(--dark-slate);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  ol {
    ${({ theme }) => theme.mixins.resetList};
    position: relative;
    display: grid;
    gap: ${ITEM_GAP}px;
  }

  /* White pill that slides to the active section */
  .active-pill {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${ITEM_HEIGHT}px;
    border-radius: 14px;
    background: var(--surface-3);
    box-shadow: 0 8px 20px -10px var(--navy-shadow);
    transition: transform 0.7s var(--ease-soft), opacity 0.4s var(--ease-soft);
    pointer-events: none;
  }

  .nav-link,
  .resume-link {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    height: ${ITEM_HEIGHT}px;
    padding: 0 14px;
    border-radius: 14px;
    color: var(--light-slate);
    font-size: var(--fz-sm);
    transition: color 0.3s var(--easing), background-color 0.3s var(--easing),
      transform 0.3s var(--easing);

    svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }

    &:hover,
    &:focus-visible {
      color: var(--lightest-slate);
      background-color: var(--surface-1);
      transform: translateX(3px);
    }

    &.is-active {
      color: var(--lightest-slate);
      font-weight: 600;
      background-color: transparent;
      transform: none;
    }
  }

  .resume-link .arrow {
    margin-left: auto;
    color: var(--green);
    font-size: 13px;
  }

  .socials {
    ${({ theme }) => theme.mixins.resetList};
    display: flex;
    gap: 6px;
    padding: 0 6px;

    a {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      color: var(--light-slate);
      background: var(--surface-1);
      transition: transform 0.35s var(--easing), color 0.3s var(--easing),
        background-color 0.3s var(--easing);

      &:hover,
      &:focus-visible {
        color: var(--green);
        background: var(--surface-3);
        transform: translateY(-3px);
      }

      svg {
        width: 17px;
        height: 17px;
      }
    }
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: auto;
    padding: 12px;
    border-radius: 16px;
    background: var(--surface-1);
    border: 1px solid var(--glass-border);

    .avatar {
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      overflow: hidden;
    }
    .who {
      min-width: 0;
      font-size: 13px;
      line-height: 1.3;
      color: var(--lightest-slate);
    }
    .mail {
      display: block;
      overflow: hidden;
      color: var(--dark-slate);
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        color: var(--green);
      }
    }
  }
`;

// Non-home pages that have their own sidebar entry (e.g. /notes/...)
const pageIndex = pathname =>
  links.findIndex(({ url }) => !url.includes('#') && pathname.startsWith(url));

const Sidebar = ({ isHome, pathname }) => {
  const [active, setActive] = useState(isHome ? 0 : pageIndex(pathname || ''));

  // Scroll-spy: highlight the section closest to the top of the viewport
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const visible = new Map();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
        const first = sectionIds.findIndex(id => visible.get(id));
        if (first !== -1) {
          setActive(first);
        }
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [isHome]);

  // On the home page, glide to the section instead of jumping
  const handleNav = (e, url) => {
    const id = url.split('#')[1];
    const el = isHome && id && document.getElementById(id);
    if (!el) {
      return;
    }
    e.preventDefault();
    scrollToElement(el);
  };

  const avatar = (
    <StaticImage src="../images/me.jpg" alt="Rajat Chaple" width={80} height={80} quality={90} />
  );

  return (
    <StyledSidebar aria-label="Site navigation">
      <div className="brand">
        <div className="avatar">{avatar}</div>
        <div>
          <div className="name">Rajat Chaple</div>
          <div className="role">Embedded Software</div>
        </div>
      </div>

      <div className="label">Main</div>
      <nav>
        <ol>
          <li
            className="active-pill"
            aria-hidden="true"
            style={{
              opacity: active === -1 ? 0 : 1,
              transform: `translateY(${Math.max(active, 0) * (ITEM_HEIGHT + ITEM_GAP)}px)`,
            }}
          />
          {links.map(({ name, url }, i) => (
            <li key={name}>
              <Link
                to={url}
                onClick={e => handleNav(e, url)}
                className={`nav-link${active === i ? ' is-active' : ''}`}
                aria-current={active === i ? 'location' : undefined}>
                <LineIcon name={name} />
                {name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="label">Documents</div>
      <a className="resume-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
        <LineIcon name="Resume" />
        Resume
        <span className="arrow">↗</span>
      </a>

      <div className="label">Elsewhere</div>
      <ul className="socials">
        {socialMedia.map(({ name, url }) => (
          <li key={name}>
            <a href={url} aria-label={name} target="_blank" rel="noreferrer">
              <Icon name={name} />
            </a>
          </li>
        ))}
      </ul>

      <div className="profile">
        <div className="avatar">{avatar}</div>
        <div className="who">
          Rajat Chaple
          <a className="mail" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      </div>
    </StyledSidebar>
  );
};

Sidebar.propTypes = {
  isHome: PropTypes.bool,
  pathname: PropTypes.string,
};

export default Sidebar;
