import { css } from 'styled-components';

// Frosted glass button with a soft lift on hover
const glassButton = (padding, fontSize) => css`
  color: var(--green);
  background-color: var(--surface-1);
  border: 1px solid var(--accent-border);
  border-radius: var(--border-radius);
  padding: ${padding};
  font-size: ${fontSize};
  font-family: var(--font-mono);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);

  &:hover,
  &:focus,
  &:active {
    background-color: var(--green-tint);
    border-color: var(--green);
    box-shadow: var(--glow);
    outline: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-2px);
    }
  }
  &:after {
    display: none !important;
  }
`;

const button = glassButton('1.25rem 1.75rem', 'var(--fz-xs)');

// Glass panel. No backdrop-filter here: in-flow cards sit over a soft
// gradient where blur is invisible but costs a GPU pass every frame.
const glass = css`
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: inset 0 1px 0 var(--glass-highlight), 0 12px 40px -16px var(--navy-shadow);
`;

// Real frosted blur, only for floating UI that overlaps moving content
const frosted = css`
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
`;

const glassHover = css`
  transition: transform 0.5s var(--easing), box-shadow 0.5s var(--easing),
    border-color 0.5s var(--easing);
  &:hover,
  &:focus-within {
    border-color: var(--glass-border-hover);
    box-shadow: inset 0 1px 0 var(--glass-highlight), 0 24px 50px -18px var(--navy-shadow);
  }
`;

const mixins = {
  flexCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  flexBetween: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

  link: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: var(--transition);
    &:hover,
    &:active,
    &:focus {
      color: var(--green);
      outline: 0;
    }
  `,

  inlineLink: css`
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    position: relative;
    transition: var(--transition);
    color: var(--green);
    &:hover,
    &:focus,
    &:active {
      color: var(--green);
      outline: 0;
      &:after {
        width: 100%;
      }
      & > * {
        color: var(--green) !important;
        transition: var(--transition);
      }
    }
    &:after {
      content: '';
      display: block;
      width: 0;
      height: 1px;
      position: relative;
      bottom: 0.37em;
      background-color: var(--green);
      transition: var(--transition);
      opacity: 0.5;
    }
  `,

  button,

  smallButton: glassButton('0.75rem 1rem', 'var(--fz-xs)'),

  bigButton: glassButton('1.25rem 1.75rem', 'var(--fz-sm)'),

  glass,

  frosted,

  glassHover,

  boxShadow: css`
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
    transition: var(--transition);

    &:hover,
    &:focus {
      box-shadow: 0 20px 40px -15px var(--navy-shadow);
    }
  `,

  fancyList: css`
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
        color: var(--green);
      }
    }
  `,

  resetList: css`
    list-style: none;
    padding: 0;
    margin: 0;
  `,
};

export default mixins;
