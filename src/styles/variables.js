import { css } from 'styled-components';

const variables = css`
  :root {
    /* Glassy theme, "Sand": near-neutral stone glass with a burnt-orange accent.
       The old token names (navy, slate, green) are kept so every existing
       component and page picks up the palette automatically. */
    color-scheme: light;
    --dark-navy: #efebe4;
    --navy: #ddd5c9;
    --light-navy: rgba(255, 255, 255, 0.35);
    --lightest-navy: rgba(60, 50, 40, 0.15);
    --navy-shadow: rgba(50, 40, 30, 0.18);
    --dark-slate: #857e75;
    --slate: #57514a;
    --light-slate: #37332e;
    --lightest-slate: #1c1a17;
    --white: #1c1a17;
    --ink: #161412;
    --on-ink: #fff;
    --ink-hover: #000;
    /* --green is the site-wide accent */
    --green: #a24a25;
    --green-tint: rgba(162, 74, 37, 0.1);
    --accent-border: rgba(162, 74, 37, 0.45);
    --pink: #f57dff;
    --blue: #57cbff;
    --grey: #c8dee9;

    --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.26));
    --glass-border: rgba(255, 255, 255, 0.6);
    --glass-border-hover: rgba(255, 255, 255, 0.9);
    --glass-highlight: rgba(255, 255, 255, 0.75);
    --glass-blur: blur(24px) saturate(140%);
    --glass-radius: 22px;
    --glow: 0 12px 28px -12px rgba(50, 40, 30, 0.35);

    /* Overlay strengths for chips, buttons, hovers (weak -> strong) */
    --surface-1: rgba(255, 255, 255, 0.32);
    --surface-2: rgba(255, 255, 255, 0.5);
    --surface-3: rgba(255, 255, 255, 0.82);

    /* Backdrop behind the glass */
    --bg-1: #efebe4;
    --bg-2: #ddd5c9;
    --bg-3: #bfb3a3;
    --bg-glow-1: #faf8f4;
    --bg-glow-2: #9d9080;
    --bg-glow-3: #e3d9cb;
    --drift-1: rgba(255, 253, 248, 0.7);
    --drift-2: rgba(200, 170, 130, 0.25);

    --nav-bg: rgba(248, 245, 240, 0.5);
    --nav-bg-scrolled: rgba(248, 245, 240, 0.75);
    --menu-bg: rgba(246, 243, 238, 0.95);

    --sidebar-width: 250px;
    --shell-gap: 20px;

    --font-sans: 'Calibre', 'Inter', 'San Francisco', 'SF Pro Text', -apple-system, system-ui,
      sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

    --fz-xxs: 16px;
    --fz-xs: 16px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 18px;
    --fz-xl: 20px;
    --fz-xxl: 22px;
    --fz-heading: 32px;

    --border-radius: 10px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;

    --tab-height: 42px;
    --tab-width: 120px;

    --easing: cubic-bezier(0.22, 1, 0.36, 1);
    /* Long, soft deceleration for reveals and hovers */
    --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
    --transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    --hamburger-width: 30px;

    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
  }

  /* "Night": near-black with neutral smoked glass and an amber accent,
     used automatically when the visitor's system is in dark mode.
     Not pure #000 everywhere: the glass needs a faint glow behind it to read. */
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --dark-navy: #000;
      --navy: #050505;
      --light-navy: rgba(255, 255, 255, 0.05);
      --lightest-navy: rgba(255, 255, 255, 0.1);
      --navy-shadow: rgba(0, 0, 0, 0.7);
      --dark-slate: #7c7b78;
      --slate: #a9a7a2;
      --light-slate: #d2d0cb;
      --lightest-slate: #f2f0ec;
      --white: #f5f3ef;
      --ink: #f2f0ec;
      --on-ink: #0a0a0a;
      --ink-hover: #fff;
      --green: #f0a35e;
      --green-tint: rgba(240, 163, 94, 0.13);
      --accent-border: rgba(240, 163, 94, 0.5);
      --glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
      --glass-border: rgba(255, 255, 255, 0.09);
      --glass-border-hover: rgba(255, 255, 255, 0.2);
      --glass-highlight: rgba(255, 255, 255, 0.08);
      --glow: 0 12px 28px -12px rgba(0, 0, 0, 0.8);
      --surface-1: rgba(255, 255, 255, 0.05);
      --surface-2: rgba(255, 255, 255, 0.08);
      --surface-3: rgba(255, 255, 255, 0.14);
      --bg-1: #0b0b0c;
      --bg-2: #050505;
      --bg-3: #000;
      --bg-glow-1: #1b1b1e;
      --bg-glow-2: #140d07;
      --bg-glow-3: #121214;
      --drift-1: rgba(255, 255, 255, 0.045);
      --drift-2: rgba(240, 163, 94, 0.07);
      --nav-bg: rgba(0, 0, 0, 0.55);
      --nav-bg-scrolled: rgba(0, 0, 0, 0.75);
      --menu-bg: rgba(8, 8, 8, 0.96);
    }
  }
`;

export default variables;
