import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { useScrollDirection } from '@hooks';
import { Menu } from '@components';

/* Phones and tablets: a floating glass pill that matches the desktop sidebar.
   Hides while scrolling down, glides back on scroll up. */
const StyledHeader = styled.header`
  position: fixed;
  top: 12px;
  left: 12px;
  right: 12px;
  z-index: 11;
  transform: translate3d(0, 0, 0);
  transition: transform 0.6s var(--ease-soft);

  &.is-hidden {
    transform: translate3d(0, calc(-100% - 20px), 0);
  }

  @media (min-width: 1081px) {
    display: none;
  }

  .bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 10px 0 12px;
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    background: var(--glass-bg), var(--nav-bg);
    box-shadow: inset 0 1px 0 var(--glass-highlight), 0 10px 30px -14px var(--navy-shadow);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    animation: fadeUp 0.9s var(--ease-soft) both;
    transition: box-shadow 0.4s;
  }

  &.is-scrolled .bar {
    background: var(--glass-bg), var(--nav-bg-scrolled);
    box-shadow: inset 0 1px 0 var(--glass-highlight), 0 14px 34px -14px var(--navy-shadow);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
    color: inherit;
    text-decoration: none;
  }

  .avatar {
    flex: none;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 0 0 1px var(--glass-border);
  }

  .name {
    color: var(--lightest-slate);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
  }

  .role {
    color: var(--dark-slate);
    font-size: 12px;
    line-height: 1.3;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    .bar {
      animation: none;
    }
  }
`;

const Nav = ({ isHome }) => {
  const scrollDirection = useScrollDirection('down');
  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledToTop(window.pageYOffset < 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hidden = !menuOpen && !scrolledToTop && scrollDirection === 'down';
  const className = [hidden && 'is-hidden', !scrolledToTop && 'is-scrolled']
    .filter(Boolean)
    .join(' ');

  const brand = (
    <>
      <span className="avatar">
        <StaticImage
          src="../images/me.jpg"
          alt="Rajat Chaple"
          width={76}
          height={76}
          quality={90}
        />
      </span>
      <span>
        <div className="name">Rajat Chaple</div>
        <div className="role">Embedded Software</div>
      </span>
    </>
  );

  return (
    <StyledHeader className={className}>
      <div className="bar">
        {isHome ? (
          <a className="brand" href="#top" aria-label="Back to top">
            {brand}
          </a>
        ) : (
          <Link className="brand" to="/" aria-label="Home">
            {brand}
          </Link>
        )}
        <Menu isHome={isHome} onToggle={setMenuOpen} />
      </div>
    </StyledHeader>
  );
};

Nav.propTypes = {
  isHome: PropTypes.bool,
};

export default Nav;
