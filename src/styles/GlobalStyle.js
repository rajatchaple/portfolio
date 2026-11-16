import { createGlobalStyle } from 'styled-components';
import fonts from './fonts';
import variables from './variables';
import TransitionStyles from './TransitionStyles';
import PrismStyles from './PrismStyles';

const GlobalStyle = createGlobalStyle`
  ${fonts};
  ${variables};

  html {
    box-sizing: border-box;
    width: 100%;
    scroll-behavior: smooth;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  ::selection {
    background-color: var(--lightest-navy);
    color: var(--lightest-slate);
  }

  /* Provide basic, default focus styles.*/
  :focus {
    outline: 2px dashed var(--green);
    outline-offset: 3px;
  }

  /*
    Remove default focus styles for mouse users ONLY if
    :focus-visible is supported on this platform.
  */
  :focus:not(:focus-visible) {
    outline: none;
    outline-offset: 0px;
  }

  /*
    Optionally: If :focus-visible is supported on this
    platform, provide enhanced focus styles for keyboard
    focus.
  */
  :focus-visible {
    outline: 2px dashed var(--green);
    outline-offset: 3px;
  }

  /* Scrollbar Styles */
  html {
    scrollbar-width: thin;
    scrollbar-color: var(--dark-slate) var(--navy);
  }
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    background: var(--navy);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--dark-slate);
    border: 3px solid var(--navy);
    border-radius: 10px;
  }

  body {
    margin: 0;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: var(--navy);
    color: var(--slate);
    font-family: var(--font-sans);
    font-size: var(--fz-xl);
    line-height: 1.3;

    @media (max-width: 480px) {
      font-size: var(--fz-lg);
    }

    /* Warm "blurred room" backdrop behind the glass.
       :before is the static base; :after is a slowly drifting light layer.
       Only transform animates, so it stays on the compositor. */
    &:before,
    &:after {
      content: '';
      position: fixed;
      pointer-events: none;
    }
    &:before {
      inset: 0;
      z-index: -2;
      background:
        radial-gradient(60% 50% at 8% 6%, var(--bg-glow-1) 0%, transparent 70%),
        radial-gradient(50% 60% at 100% 100%, var(--bg-glow-2) 0%, transparent 70%),
        radial-gradient(40% 40% at 85% 15%, var(--bg-glow-3) 0%, transparent 70%),
        linear-gradient(140deg, var(--bg-1) 0%, var(--bg-2) 55%, var(--bg-3) 100%);
    }
    &:after {
      top: -20vmax;
      left: -20vmax;
      z-index: -1;
      width: 140vmax;
      height: 140vmax;
      will-change: transform;
      background:
        radial-gradient(22vmax 22vmax at 30% 35%, var(--drift-1), transparent 70%),
        radial-gradient(26vmax 26vmax at 70% 65%, var(--drift-2), transparent 70%);
    }

    @media (prefers-reduced-motion: no-preference) and (min-width: 769px) {
      &:after {
        animation: glassDrift 30s ease-in-out infinite alternate;
      }
    }

    &.hidden {
      overflow: hidden;
    }

    &.blur {
      overflow: hidden;

      #content > * {
        filter: blur(5px) brightness(0.7);
        transition: var(--transition);
        pointer-events: none;
        user-select: none;
      }
    }
  }

  @keyframes glassDrift {
    0% { transform: translate3d(0, 0, 0) rotate(0deg); }
    50% { transform: translate3d(6vw, 4vh, 0) rotate(8deg); }
    100% { transform: translate3d(-4vw, 8vh, 0) rotate(-6deg); }
  }

  /* Quiet staggered entrance: set --i on each element */
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translate3d(0, 14px, 0);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* Shared section heading: small eyebrow + title */
  .section-head {
    margin-bottom: 28px;

    .eyebrow {
      display: block;
      margin-bottom: 8px;
      color: var(--green);
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      font-size: clamp(26px, 3vw, 34px);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
  }

  /* Quiet tag pills (tech, skills) */
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      padding: 5px 11px;
      border-radius: 999px;
      color: var(--light-slate);
      background: var(--surface-2);
      border: 1px solid var(--glass-border);
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.4;
    }
  }

  /* Calm glass card used by every home-page section */
  .glass-card {
    ${({ theme }) => theme.mixins.glass};
    position: relative;
    isolation: isolate;
    transition: transform 0.7s var(--ease-soft), border-color 0.5s var(--ease-soft);
  }
  a.glass-card,
  .glass-card.is-interactive {
    /* Hover shadow is drawn once and faded in: opacity is GPU-cheap */
    &:after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      box-shadow: 0 26px 50px -26px var(--navy-shadow);
      opacity: 0;
      transition: opacity 0.7s var(--ease-soft);
      pointer-events: none;
    }
    &:hover,
    &:focus-within {
      transform: translate3d(0, -3px, 0);
      border-color: var(--glass-border-hover);
      &:after {
        opacity: 1;
      }
    }
  }

  /* Scroll reveal: elements with data-reveal fade/rise in once visible.
     Only hidden after JS marks the page ready, so content never stays invisible. */
  .reveal-ready [data-reveal] {
    opacity: 0;
    transform: translate3d(0, 28px, 0);
    transition: opacity 1s var(--ease-soft), transform 1.2s var(--ease-soft);
    transition-delay: var(--reveal-delay, 0ms);
  }
  .reveal-ready [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
  }

  .pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    padding: 0 20px;
    border-radius: 999px;
    border: 1px solid var(--glass-border);
    color: var(--lightest-slate);
    background: var(--surface-2);
    font-size: var(--fz-sm);
    font-weight: 500;
    transition: transform 0.6s var(--ease-soft), background-color 0.4s var(--ease-soft),
      box-shadow 0.6s var(--ease-soft);

    &:hover,
    &:focus-visible {
      color: var(--lightest-slate);
      background: var(--surface-3);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px -14px var(--navy-shadow);
    }

    &.dark {
      color: var(--on-ink);
      background: var(--ink);
      border-color: var(--ink);

      &:hover,
      &:focus-visible {
        color: var(--on-ink);
        background: var(--ink-hover);
      }
    }
  }

  @keyframes sidebarIn {
    from { opacity: 0; transform: translate3d(-24px, 0, 0); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *:before,
    *:after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      animation-delay: 0ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Leave room for the fixed glass sidebar on wide screens */
  @media (min-width: 1081px) {
    #content {
      margin-left: calc(var(--sidebar-width) + var(--shell-gap) * 2);
    }
  }

  #root {
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
  }

  main {
    margin: 0 auto;
    width: 100%;
    max-width: 1600px;
    min-height: 100vh;
    padding: 200px 150px;

    @media (max-width: 1080px) {
      padding: 200px 100px;
    }
    @media (max-width: 768px) {
      padding: 150px 50px;
    }
    @media (max-width: 480px) {
      padding: 125px 25px;
    }

    &.fillHeight {
      padding: 0 150px;

      @media (max-width: 1080px) {
        padding: 0 100px;
      }
      @media (max-width: 768px) {
        padding: 0 50px;
      }
      @media (max-width: 480px) {
        padding: 0 25px;
      }
    }
  }

  section {
    margin: 0 auto;
    padding: 100px 0;
    max-width: 1000px;

    @media (max-width: 768px) {
      padding: 80px 0;
    }

    @media (max-width: 480px) {
      padding: 60px 0;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 10px 0;
    font-weight: 600;
    color: var(--lightest-slate);
    line-height: 1.1;
  }

  .big-heading {
    margin: 0;
    font-size: clamp(40px, 8vw, 80px);
  }

  .medium-heading {
    margin: 0;
    font-size: clamp(40px, 8vw, 60px);
  }

  .numbered-heading {
    display: flex;
    align-items: center;
    position: relative;
    margin: 10px 0 40px;
    width: 100%;
    font-size: clamp(26px, 5vw, var(--fz-heading));
    white-space: nowrap;

    &:before {
      position: relative;
      bottom: 4px;
      counter-increment: section;
      content: '0' counter(section) '.';
      margin-right: 10px;
      color: var(--green);
      font-family: var(--font-mono);
      font-size: clamp(var(--fz-md), 3vw, var(--fz-xl));
      font-weight: 400;

      @media (max-width: 480px) {
        margin-bottom: -3px;
        margin-right: 5px;
      }
    }

    &:after {
      content: '';
      display: block;
      position: relative;
      top: -5px;
      width: 300px;
      height: 1px;
      margin-left: 20px;
      background-color: var(--lightest-navy);

      @media (max-width: 1080px) {
        width: 200px;
      }
      @media (max-width: 768px) {
        width: 100%;
      }
      @media (max-width: 600px) {
        margin-left: 10px;
      }
    }
  }

  img,
  svg,
  .gatsby-image-wrapper {
    width: 100%;
    max-width: 100%;
    vertical-align: middle;
  }

  img[alt=""],
  img:not([alt]) {
    filter: blur(5px);
  }

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    vertical-align: middle;

    &.feather {
      fill: none;
    }
  }

  a {
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: var(--transition);

    &:hover,
    &:focus {
      color: var(--green);
    }

    &.inline-link {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  button {
    cursor: pointer;
    border: 0;
    border-radius: 0;
  }

  input, textarea {
    border-radius: 0;
    outline: 0;

    &:focus {
      outline: 0;
    }
    &:focus,
    &:active {
      &::placeholder {
        opacity: 0.5;
      }
    }
  }

  p {
    margin: 0 0 15px 0;

    &:last-child,
    &:last-of-type {
      margin: 0;
    }

    & > a {
      ${({ theme }) => theme.mixins.inlineLink};
    }

    & > code {
      background-color: var(--light-navy);
      color: var(--white);
      font-size: var(--fz-sm);
      border-radius: var(--border-radius);
      padding: 0.3em 0.5em;
    }
  }

  ul {
    &.fancy-list {
      padding: 0;
      margin: 0;
      list-style: none;
      font-size: var(--fz-lg);
      li {
        position: relative;
        padding-left: 30px;
        margin-bottom: 10px;
        &:before {
          content: '▹';
          position: absolute;
          left: 0;
          color:var(--green);
        }
      }
    }
  }

  blockquote {
    border-left-color: var(--green);
    border-left-style: solid;
    border-left-width: 1px;
    margin-left: 0px;
    margin-right: 0px;
    padding-left: 1.5rem;

    p {
      font-style: italic;
      font-size: 24px;
    }
  }

  hr {
    background-color: var(--lightest-navy);
    height: 1px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    margin: 1rem;
  }

  code {
    font-family: var(--font-mono);
    font-size: var(--fz-md);
  }

  .skip-to-content {
    ${({ theme }) => theme.mixins.button};
    position: absolute;
    top: auto;
    left: -999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    z-index: -99;

    &:focus,
    &:active {
      background-color: var(--green);
      color: var(--navy);
      top: 0;
      left: 0;
      width: auto;
      height: auto;
      overflow: auto;
      z-index: 99;
    }
  }

  #logo {
    color: var(--green);
  }

  .overline {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;
  }

  .subtitle {
    color: var(--green);
    margin: 0 0 20px 0;
    font-size: var(--fz-md);
    font-family: var(--font-mono);
    font-weight: 400;
    line-height: 1.5;
    @media (max-width: 1080px) {
      font-size: var(--fz-sm);
    }
    @media (max-width: 768px) {
      font-size: var(--fz-xs);
    }

    a {
      ${({ theme }) => theme.mixins.inlineLink};
      line-height: 1.5;
    }
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    margin-bottom: 50px;
    color: var(--green);

    .arrow {
      display: block;
      margin-right: 10px;
      padding-top: 4px;
    }

    a {
      ${({ theme }) => theme.mixins.inlineLink};
      font-family: var(--font-mono);
      font-size: var(--fz-sm);
      font-weight: 600;
      line-height: 1.5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }

  .gatsby-image-outer-wrapper {
    height: 100%;
  }

  ${TransitionStyles};

  ${PrismStyles};
`;

export default GlobalStyle;
