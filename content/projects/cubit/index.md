---
title: 'Cubit: Smart Measuring Instrument'
slug: '/projects/cubit'
date: '2022-05-15'
cover: './cubit.jpg'
showInProjects: false
tags: ['Hardware', 'IoT', 'BLE', 'Energy Harvesting']
tech:
  - BLE
  - Energy Harvesting
  - ARM Cortex-M4
  - Sensor Fusion
  - Embedded Systems
  - PCB Design
  - CAD Design
  - React Native
github: 'https://github.com/rajatchaple/ecen5833_s22_lpedt_project'
---

<style>
/* HIDE ONLY SPECIFIC TEMPLATE ELEMENTS */
.breadcrumb,
.project-links {
  display: none !important;
}

/* Hide the default template header that appears at the top */
.layout > main > header,
.layout header:not(.project-header),
main > header:not(.project-header),
.layout > main > div:first-child:not(.project-header) {
  display: none !important;
}

/* Hide default title and meta info that template renders */
.layout > main > h1:first-child,
.layout > main > p:first-child,
.layout > main > .subtitle {
  display: none !important;
}

/* Project Header Styling - Full Viewport Hero */
.project-header {
  min-height: 100vh;
  height: 100vh;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 0;
  padding: 2rem 1rem;
  visibility: visible !important;
  opacity: 1 !important;
  box-sizing: border-box;
}

.project-overline {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: #D60545;
  font-weight: 400;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block !important;
  visibility: visible !important;
}

.project-main-title {
  font-size: 3.5rem;
  font-weight: 600;
  background: linear-gradient(90deg, #ffffff 0%, #ffffff 30%, #ff6b9d 70%, #e91e63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  display: block !important;
  visibility: visible !important;
}

.project-title-underline {
  width: 100px;
  height: 2px;
  background: #D60545;
  margin: 0 auto 1.5rem auto;
  display: block !important;
  visibility: visible !important;
}

.project-tech-tags {
  display: flex !important;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin: 0 0 2rem 0;
  visibility: visible !important;
}

.project-image {
  margin: 2rem auto 3rem auto;
  max-width: 800px;
  display: block !important;
  visibility: visible !important;
  text-align: center;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

.project-image img {
  width: 100%;
  height: auto;
  border-radius: 24px;
  display: block;
  margin: 0 auto;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}

/* Remove the extra pseudo-element and z-index complications */

.tech-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-family: var(--font-mono);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: inline-block !important;
  visibility: visible !important;
}

.tech-tag:hover {
  background: rgba(214, 5, 69, 0.2);
  border-color: #D60545;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(214, 5, 69, 0.3);
}

/* Override any parent container constraints */
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
  padding-top: 4rem;
}

<style>
/* NUCLEAR APPROACH - Hide entire project links section */
.project-links,
header .project-links,
.layout > main > header .project-links {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  position: absolute !important;
  left: -9999px !important;
}

/* COMPLETELY HIDE EXTERNAL LINK - Multiple approaches */
/* Hide by frontmatter - remove external from rendering */
.project-links a[href*="hackster"],
.project-links a[href*="hackster.io"],
.project-links a[aria-label*="External"],
.project-links a[aria-label="External Link"],
.project-links a:last-child,
.project-links a:nth-child(2) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* Hide all external link icons */
a[href*="http"]:after, 
a[target="_blank"]:after,
.project-links a:after,
a[rel*="noopener"]:after,
a[rel*="noreferrer"]:after {
  content: none !important;
  display: none !important;
}

/* Hide SVG icons in project links */
.project-links svg,
.project-links a svg {
  display: none !important;
}

/* Override any fixed header positioning that might interfere */
.layout > main > header {
  display: none !important;
}

/* Override parent containers that might constrain the hero */
.detailed-project__StyledprojectContainer-sc-1KVHi,
.layout,
.layout > main,
main {
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  width: 100% !important;
}

/* Hero section - full viewport, but not fixed so content can scroll */
.project-header {
  width: 100vw !important;
  height: 100vh !important;
  position: relative !important;
  z-index: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: var(--navy) !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
}
    /* Scroll indicator styling */
    .scroll-indicator {
      position: absolute;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 1.2rem;
      opacity: 0.7;
      text-align: center;
      animation: bounce 1.5s infinite;
      pointer-events: none;
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(12px); }
    }

/* Ensure content sections appear after the hero */
.project-layout {
  position: relative !important;
  z-index: 2 !important;
  background: var(--navy) !important;
}

/* Add top padding to main content to account for fixed header */
.layout > main {
  padding-top: 0 !important;
}

/* Fix blank space issues - reduce margins and padding */
.featured-image {
  margin-bottom: 2rem !important;
  margin-top: 0 !important;
}

/* Reduce spacing between header and content */
.project-content,
.layout > main > div {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Improve project content layout */
.project-content {
  max-width: 90% !important;
  margin-top: 0 !important;
}

/* Better sidebar and content layout - starts after hero */
.project-layout {
  display: flex;
  gap: 2rem;
  margin-top: 0;
  align-items: flex-start;
  max-width: none !important;
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  padding: 2rem 2rem 0 2rem;
  box-sizing: border-box;
  min-height: 100vh;
}

.project-nav {
  width: 280px;
  min-width: 280px;
  flex-shrink: 0;
  position: sticky;
  position: -webkit-sticky;
  top: 2rem;
  height: fit-content;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  background: rgba(16, 24, 40, 0.98);
  border-radius: 4px;
  padding: 1.8rem 1.5rem;
  border: 1px solid rgba(100, 255, 218, 0.15);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
  margin-left: 2rem;
  backdrop-filter: blur(8px);
}

.nav-title {
  font-family: var(--font-mono);
  color: #D60545 !important;
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: left;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(214, 5, 69, 0.2);
}

.project-nav .nav-title {
  color: #D60545 !important;
}

nav .nav-title {
  color: #D60545 !important;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 0.2rem;
  position: relative;
}

.nav-arrow {
  color: #D60545 !important;
  font-size: 0.6rem !important;
  margin-right: 0.5rem !important;
  transition: all 0.3s ease !important;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  font-weight: bold !important;
  line-height: 1 !important;
  background: rgba(214, 5, 69, 0.1) !important;
  padding: 2px !important;
  border: 1px solid #D60545 !important;
}

.nav-link {
  color: var(--light-slate) !important;
  text-decoration: none !important;
  font-size: 0.85rem;
  padding: 0.7rem 0.9rem;
  border-radius: 3px;
  display: block;
  transition: color 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  border-left: none !important;
  font-weight: 500;
  line-height: 1.3;
  position: relative;
  margin-bottom: 0.1rem;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.nav-link::after {
  display: none !important;
  content: none !important;
}

.nav-link::before {
  content: "▶";
  color: #D60545;
  font-size: 0.6rem;
  margin-right: 0.5rem;
  opacity: 1;
  transition: color 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform: none;
  display: inline-block;
}

.nav-link:hover::before {
  color: #D60545 !important;
}

.nav-link:hover {
  color: #D60545 !important;
  background: transparent !important;
  border-left: none !important;
  transform: none !important;
  text-decoration: none !important;
  border: none !important;
  outline: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.nav-link:hover::after {
  display: none !important;
  content: none !important;
}

.project-nav .nav-link:hover {
  color: #D60545 !important;
  background: transparent !important;
  text-decoration: none !important;
  border-bottom: none !important;
}

nav .nav-link:hover {
  color: #D60545 !important;
  background: transparent !important;
  text-decoration: none !important;
  border-bottom: none !important;
}

.nav-link.active {
  color: #D60545;
  background: transparent;
  border-left: none;
  font-weight: 600;
}

.nav-link.active::before {
  color: #D60545;
}

.nav-link.active .nav-arrow {
  color: #D60545 !important;
  transform: translateX(3px);
}

.nav-footer {
  margin-top: 1.8rem;
  padding-top: 1.2rem;
  text-align: left;
  border-top: 1px solid rgba(100, 255, 218, 0.15);
}

.nav-footer small {
  color: var(--light-slate);
  font-style: italic;
  font-size: 0.7rem;
  opacity: 0.7;
}

.project-content {
  flex: 1;
  min-width: 0;
  max-width: none !important;
  width: auto;
  overflow-x: auto;
  padding-left: 2rem;
}

.content-section {
  margin-bottom: 3rem;
  scroll-margin-top: 30vh;
  width: 100%;
  max-width: none !important;
}

.content-section h2 {
  position: relative;
  margin-bottom: 2rem;
}

.content-section h2::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, #D60545 0%, #D60545 20%, transparent 70%);
  width: 100%;
}

.content-section h2 {
  color: var(--lightest-slate);
  margin-bottom: 2rem;
  padding-bottom: 0.8rem;
  font-size: 2rem;
  position: relative;
}

details {
  margin: 1.5rem 0;
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: none !important;
}

summary {
  padding: 1.2rem;
  background: rgba(100, 255, 218, 0.08);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1.05rem;
}

summary:hover {
  background: rgba(100, 255, 218, 0.15);
  color: var(--green);
}

details[open] summary {
  background: rgba(100, 255, 218, 0.15);
  color: var(--green);
}

details > *:not(summary) {
  padding: 1.5rem;
  margin: 0;
}

details ul, details ol {
  margin: 0.8rem 0;
  padding-left: 2rem;
}

details li {
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Global mobile overflow prevention */
@media (max-width: 768px) {
  html {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* MOBILE RESPONSIVENESS - Template overrides handled, clean up debug borders */
@media (max-width: 768px) {
  /* Force body and html to not overflow */
  html, body {
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Additional safety overrides */
  .layout,
  .layout > main,
  main {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }
}

@media (max-width: 1200px) {
  .project-layout {
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
    width: 100% !important;
    margin-left: 0 !important;
  }
  
  .project-nav {
    width: 100%;
    min-width: auto;
    position: relative;
    top: 0;
    max-height: none;
    margin-bottom: 2rem;
    margin-left: 0;
  }
  
  .project-content {
    width: 100% !important;
    padding-left: 0 !important;
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

@media (max-width: 768px) {
  /* Force overall layout to stay within viewport */
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  
  .project-header {
    padding: 1rem !important;
  }
  
  .project-main-title {
    font-size: 2.5rem !important;
  }
  
  .project-tech-tags {
    gap: 0.5rem;
  }
  
  .tech-tag {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
  
  .nav-list {
    grid-template-columns: 1fr;
  }
  
  .project-nav {
    padding: 1rem !important;
    width: 100% !important;
    min-width: auto !important;
    max-width: 100% !important;
    margin: 0 !important;
    position: relative !important;
    top: auto !important;
    box-sizing: border-box !important;
    margin-left: 0 !important;
    left: 0 !important;
    right: 0 !important;
    overflow: hidden !important;
  }
  
  .nav-title {
    font-size: 0.9rem;
  }
  
  .project-layout {
    flex-direction: column !important;
    gap: 1.5rem;
    padding: 1rem !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
    position: relative !important;
    left: 0 !important;
    right: 0 !important;
  }
  
  .project-content {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
  }
  
  .content-section {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  /* Force all child elements to respect container bounds */
  .project-layout *,
  .project-nav *,
  .project-content * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* ULTIMATE NUCLEAR OPTION - COMPLETELY ELIMINATE ALL EXTERNAL LINK ICONS */
/* Target every possible external link icon combination */
a[href*="://"]::after,
a[href*="://"]::before,
a[target="_blank"]::after,
a[target="_blank"]::before,
a[rel*="noopener"]::after,
a[rel*="noopener"]::before,
a[rel*="noreferrer"]::after,
a[rel*="noreferrer"]::before,
.external::after,
.external::before,
.external-link::after,
.external-link::before,
.feather-external-link,
.feather.feather-external-link,
svg.feather-external-link,
.icon-external,
.external-icon {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  content: "" !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  z-index: -9999 !important;
}

/* Hide any SVG with external link content */
svg[class*="external"],
svg[aria-label*="external"],
svg[title*="external"],
svg title:contains("External"),
svg use[href*="external"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Clear browser cache induced icons */
a[href*="hackster"]::after,
a[href*="hackster.io"]::after,
a[href*="http"]::after {
  content: "" !important;
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Force override any computed styles */
* {
  --external-icon: none !important;
}
</style>

<!-- Project Header -->
<div class="project-header">
  <h1 class="project-main-title">Cubit: Smart Measuring Instrument</h1>
  <div class="project-title-underline"></div>
  <div class="project-tech-tags">
    <span class="tech-tag">BLE</span>
    <span class="tech-tag">Energy Harvesting</span>
    <span class="tech-tag">ARM Cortex-M4</span>
    <span class="tech-tag">Sensor Fusion</span>
    <span class="tech-tag">Embedded Systems</span>
    <span class="tech-tag">PCB Design</span>
    <span class="tech-tag">CAD Design</span>
    <span class="tech-tag">React Native</span>
  </div>
  <div class="scroll-indicator">
    <span>&#8595;</span><br />
    <small>Scroll to explore</small>
  </div>
  
  <!-- Project Image - Temporarily Hidden
  <div class="project-image">
    <img src="../../featured/Cubit/cubit.jpg" alt="Cubit Smart Measuring Instrument" />
  </div>
  -->
</div>

<div class="project-layout">
  <nav class="project-nav">
    <div class="nav-title" style="color: #D60545 !important;">📋 PROJECT SECTIONS</div>
    <ul class="nav-list">
      <li><a href="#overview" class="nav-link" data-section="overview">🎯 Overview</a></li>
      <li><a href="#features" class="nav-link" data-section="features">⭐ Key Features</a></li>
      <li><a href="#architecture" class="nav-link" data-section="architecture">🏗️ System Architecture</a></li>
      <li><a href="#hardware" class="nav-link" data-section="hardware">🔧 Hardware Design</a></li>
      <li><a href="#firmware" class="nav-link" data-section="firmware">💻 Firmware</a></li>
      <li><a href="#challenges" class="nav-link" data-section="challenges">⚡ Engineering Challenges</a></li>
      <li><a href="#learnings" class="nav-link" data-section="learnings">📚 Learnings</a></li>
    </ul>
    <div class="nav-footer">
      <small>Click any section to jump there instantly</small>
    </div>
  </nav>

  <main class="project-content">

<div id="overview" class="content-section">

## <span id="overview">🎯 Overview</span>

> **Reimagining the measuring tape with low power and Bluetooth.**

This project builds a small instrument that measures **length, angle, and distance**, shows the value on a **Sharp Memory LCD**, and can send it over **BLE** when needed. The idea is simple: keep the familiar actions (roll a wheel, pull a string, point an ultrasonic sensor) but make the readings repeatable and easy to save.

Conventional tapes work, but the numbers usually end up on paper and vanish. This project tries to keep the workflow lightweight while adding just enough electronics to store, share, and reuse measurements—without burning through a battery.

<details>
<summary><strong>🔍 The Problem We’re Solving</strong></summary>

Most quick measurements are still manual and disposable. Data isn’t logged, there’s no history, and it’s hard to combine readings later. That’s fine for one-off tasks, but not great when accuracy and traceability matter.

This project turns those “one-time” numbers into usable data: capture on device, view on the LCD, and push over BLE when a record is needed. The goal is to keep the tool small and quiet on power so it actually gets used in the field.
</details>

<details>
<summary><strong>💡 Our Solution</strong></summary>

The device combines a **magnetic rotary encoder** (wheel and string modes), a **BNO055 IMU** (angles/orientation), and an **ultrasonic module** (longer ranges). An **EFR32BG13** handles the drivers, low-power states, and BLE. The **BQ25570** PMIC manages a **480 mAh Li-Po**, **solar input**, and a regulated rail around **3.2 V**. The UI is a **1.3″ Sharp Memory LCD** with four buttons for a simple menu.

Most of the time the system sits in **EM2**. Sensors power up only for the selected mode, report quickly, and drop back to sleep. That keeps average current low while still giving immediate feedback on the screen.
</details>

</div>

<div id="features" class="content-section">

## Key Features

<details>
<summary><strong>📏 Triple Measurement System</strong></summary>

- **Wheel assembly** for flat/curved surfaces (size accuracy **±0.2 cm** as scoped).  
- **String–pulley** option for flexible materials and longer spans.  
- **IMU (BNO055)** for angle/orientation (target **±1°** in this setup).  
- **Ultrasonic sensor** verified **6–254 in** on bench.
</details>

<details>
<summary><strong>🔋 Self-Sustaining Power</strong></summary>

- **Solar harvesting** through **BQ25570** (MPPT + cold start).  
- **USB** input available for faster charging and bring-up.  
- **480 mAh Li-Po**, regulated system rail ~**3.2 V**.
</details>

<details>
<summary><strong>📱 Wireless Integration</strong></summary>

- **BLE** characteristics for linear, angular, and distance values.  
- Open-area link around **100 m** using the on-board antenna in tests.
</details>

<details>
<summary><strong>🖥️ User Experience</strong></summary>

- **1.3″ Sharp Memory LCD** (very low current) with clear menu pages.  
- **Four navigation buttons**; live readout while moving the wheel/string.
</details>

</div>

<div id="architecture" class="content-section">

## System Architecture

<details>
<summary><strong>🔧 Hardware Layer</strong></summary>

- **MCU/Radio:** EFR32BG13 (ARM Cortex-M4 + BLE).  
- **PMIC:** BQ25570 energy harvester/charger with buck output to system rail.  
- **Linear:** AS5147P magnetic encoder (SPI; ABI used during early tests).  
- **Angular:** BNO055 IMU (I²C; on-chip fusion).  
- **Range:** UART ultrasonic module.  
- **Display:** 1.3″ Sharp Memory LCD.  
- **Energy:** Monocrystalline panel (measured ~**1.15 V** at the test board) + **480 mAh** Li-Po.
</details>

<details>
<summary><strong>💻 Firmware Layer</strong></summary>

- Event-driven state machine (Idle → Measure → Report → Sleep).  
- Drivers for **SPI** (encoder/LCD), **I²C** (IMU), **UART** (ultrasonic).  
- BLE GATT with separate characteristics per measurement type.  
- Power policy prefers **EM2**; sensors behind load switches.
</details>

</div>

<div id="hardware" class="content-section">

## Hardware Design

<details>
<summary><strong>⚡ Power Management System</strong></summary>

This project uses **BQ25570** to harvest from solar and charge a **480 mAh** Li-Po, then regulates a stable system rail near **3.2 V** for the MCU, sensors, and LCD. A **220 µF** MLCC (Murata GRM32ER60J227ME05L) sits at the bulk node; under **DC bias** at ~3.2 V its effective value is about **100 µF**, which was enough to keep the rail steady during radio bursts and LCD updates.

**Notes from bring-up:**
- **Cold start** off harvester was required for first power-up if the battery was empty.  
- The regulated rail simplified brown-out behavior across sensors with different input limits.  
- Measured panel output around **1.15 V** on the prototype board matched the harvester path.
</details>

<details>
<summary><strong>🎯 Sensor Integration</strong></summary>

- **AS5147P** provided pulses for linear distance. A divide-by-8 counter was tried to lower the pulse rate but it **broke direction** (phase lost). Final choice was to **configure the encoder to 256 PPR** and handle counts in firmware.  
- **BNO055** ran on I²C for angles. Early **NACK** events were fixed with short retries and checking mode bits after power-cycle.  
- **Ultrasonic** data landed over UART. Changing RX off the VCOM pin avoided port contention during logging.  
- **Placement:** the encoder’s magnet was kept away from the IMU’s magnetometer, and the RF section stayed clear of the magnetic assembly.  
- **ESD:** **SP1003** on USB/battery and **SP1001-04** on the button cluster kept leakage low in sleep.  
- **Test points** on I²C, SPI, and ABI lines made logic-analyzer work straightforward.
</details>

</div>

<div id="firmware" class="content-section">

## 💾 Firmware Implementation

<details>
<summary><strong>⚡ Power Management</strong></summary>

The firmware leans on **EM2** whenever possible. Sensors and the LCD sit behind load switches and only power up for an active mode. Core clock pulls down toward the LF domain when the UI is idle, then returns to HF for sampling or BLE activity.
</details>

<details>
<summary><strong>📊 Sensor Management</strong></summary>

- **Encoder:** configurable PPR; simple debounce and timestamping to avoid missed steps.  
- **IMU:** Euler angle readout with recovery from occasional NACKs after mode changes.  
- **Ultrasonic:** framed parse with sanity checks so serial debug doesn’t corrupt packets.  
- **LCD:** small page buffers for menu vs. live readout; quick partial refreshes.
</details>

<details>
<summary><strong>📡 Communication Stack</strong></summary>

A compact GATT exposes length, angle, and range. Advertising starts on boot; on connection the device sends indications on change or at a slow heartbeat to keep radio duty cycle down.
</details>

</div>

<div id="challenges" class="content-section">

## Engineering Challenges

<details>
<summary><strong>Clock Parts & Low Power</strong></summary>

An early board used an LF **oscillator** footprint instead of a **32.768 kHz crystal**, which blocked proper low-power modes. Swapping to the crystal fixed EM2 behavior and the sleep current.
</details>

<details>
<summary><strong>Direction vs. Divider</strong></summary>

A hardware frequency divider reduced ABI pulse rate but **lost the A/B phase**, so direction couldn’t be trusted. Moving to **256 PPR** via encoder config kept counts manageable and preserved direction in firmware.
</details>

<details>
<summary><strong>Magnet & RF Spacing</strong></summary>

The encoder magnet disturbed the IMU’s magnetometer when placed too close. Spacing the parts and orienting the magnet path away from the IMU resolved it without shields.
</details>

<details>
<summary><strong>Rail Dips on Activity</strong></summary>

Radio activity plus LCD updates caused small dips on VSTOR. Accounting for **MLCC DC-bias** and sizing bulk to about **100 µF effective** stabilized the rail.
</details>

</div>

<div id="learnings" class="content-section">

## Learnings

This project showed how easy it is for peripherals to sip power through I/O even when “off”—load switches should be part of the plan from the first schematic. Footprint choices matter more than they seem (a crystal vs. oscillator mistake cost real time and current), and **test points** on I²C/SPI/ABI paid back every minute spent placing them.

On the layout side, **DC-bias** derates big MLCCs a lot; picking by effective capacitance at the actual rail voltage is safer than reading the label. Keeping magnets away from RF and sensors solved interference more cleanly than filters. Finally, a small, event-driven state machine (Idle → Measure → Report → Sleep) was enough to keep the UI responsive while staying in **EM2** most of the time.

</div>

  </main>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  
  // FORCEFULLY REMOVE EXTERNAL LINK ELEMENTS
  function removeExternalLinks() {
    // Remove all external link buttons
    const externalLinks = document.querySelectorAll('.project-links a[href*="hackster"]');
    externalLinks.forEach(link => link.remove());
    
    // Remove external link icons
    const externalIcons = document.querySelectorAll('.project-links svg');
    externalIcons.forEach(icon => icon.remove());
    
    // Remove any remaining external link elements
    const allExternalLinks = document.querySelectorAll('a[href*="hackster.io"], a[aria-label="External Link"]');
    allExternalLinks.forEach(link => link.remove());
    
    // Hide entire project-links div if it only contains external links
    const projectLinksDiv = document.querySelector('.project-links');
    if (projectLinksDiv && projectLinksDiv.children.length <= 1) {
      projectLinksDiv.style.display = 'none';
    }
  }
  
  // Run immediately and also after a delay to catch dynamically loaded content
  removeExternalLinks();
  setTimeout(removeExternalLinks, 100);
  setTimeout(removeExternalLinks, 500);
  setTimeout(removeExternalLinks, 1000);
  
  // Add click handlers for smooth scrolling
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Account for fixed header height
        const headerHeight = 140;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add scroll spy functionality
  const observerOptions = {
    root: null,
    rootMargin: '-140px 0px -60% 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        
        // Update active navigation link
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href').substring(1) === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Add scroll behavior for better UX
  let ticking = false;
  
  function updateScrollBehavior() {
    const header = document.querySelector('.layout > main > header');
    const scrollY = window.pageYOffset;
    
    if (header) {
      if (scrollY > 100) {
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.4)';
        header.style.backdropFilter = 'blur(25px)';
      } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        header.style.backdropFilter = 'blur(20px)';
      }
    }
    
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateScrollBehavior);
      ticking = true;
    }
  });
});
</script>
