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
  - Embedded Systems
  - PCB Design
  - CAD Design
github: 'https://github.com/rajatchaple/cubit_3.0'
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
  width: 100vw !important;
  margin-left: calc(-50vw + 50%) !important;
  margin-right: 0;
  padding: 2rem 2rem 0 5rem;
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
  width: calc(100vw - 350px) !important;
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

@media (max-width: 768px) {
  .nav-list {
    grid-template-columns: 1fr;
  }
  
  .project-nav {
    padding: 1.5rem;
  }
  
  .nav-title {
    font-size: 0.9rem;
  }
  
  .project-layout {
    gap: 1.5rem;
    padding: 0 1rem 0 2rem;
  }
}

/* ULTIMATE NUCLEAR OPTION - COMPLETELY ELIMINATE ALL EXTERNAL LINK ICONS */
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

This project builds a compact instrument for **length, angle, and distance**. Readings show up on a **2.7″ Sharp Memory LCD** and can be sent over **BLE** when a record is needed. The flow stays familiar—roll a wheel, pull a string, or use ultrasonic for longer spans—while the numbers don’t get lost.

Most quick measurements are still manual and one-time. Once written down, they’re hard to reuse or share. This project keeps the tool simple but adds enough electronics so values can be **captured, displayed, and logged** without burning the battery.

<details>
<summary><strong>🔍 The Problem We’re Solving</strong></summary>

Tape measures work, but the readings usually vanish after the task. There’s no history, no easy way to combine multiple readings, and copying values by hand is error-prone. That’s fine for one-offs, not great when accuracy and traceability matter in construction, labs, or small shops.

This project keeps the normal workflow but turns those numbers into data. Measurements appear on the LCD and can be pushed over BLE, so the same reading can be reused later instead of re-measured.
</details>

<details>
<summary><strong>💡 Our Solution</strong></summary>

The device combines a **magnetic rotary encoder** (wheel + string modes), a **BNO055 IMU** for angles/orientation, and an **ultrasonic module** for longer ranges. An **EFR32BG13** (Cortex-M4 + BLE) runs the drivers and power states. The power path uses **BQ25570** to harvest solar, charge a **480 mAh Li-Po**, and regulate the ~**3.2 V** system rail. Four buttons drive a small menu on the Sharp LCD.

Most of the time the MCU waits in **EM2**. Only the sensor for the selected mode is powered. After a reading, the system drops back to sleep. This keeps the average current low while staying responsive on the screen.
</details>

</div>

<div id="features" class="content-section">

## Key Features

<details>
<summary><strong>📏 Triple Measurement System</strong></summary>

- **Wheel assembly** for flat/curved surfaces (design accuracy **±0.2 cm**).  
- **String–pulley** for flexible materials and longer pulls.  
- **IMU (BNO055)** for angle/orientation (target **±1°**).  
- **Ultrasonic** verified **6–254 in** on bench.  
- Final encoder setting **256 ppr** (direction preserved in firmware).
</details>

<details>
<summary><strong>🔋 Self-Sustaining Power</strong></summary>

- **BQ25570** PMIC with boost/MPPT + buck output; **VBAT_OV = 4.2 V**, **VBAT_OK ≈ 3.2 V**, **VOUT ≈ 3.2 V**.  
- **480 mAh Li-Po**; **USB** path available for faster charging/bring-up.  
- Solar panel board measured about **1.15 V** at the input during tests.  
- **Bulk capacitance:** 220 µF MLCC chosen for ~**100 µF effective** at 3.2 V (DC-bias accounted).
</details>

<details>
<summary><strong>📱 Wireless Integration</strong></summary>

- **BLE** characteristics for linear, angular, and distance data (EFR Connect used in tests).  
- Open-area link around **100 m** observed with the on-board antenna.
</details>

<details>
<summary><strong>🖥️ User Experience</strong></summary>

- **2.7″ Sharp Memory LCD**, ~**100 µA** measured delta from the dev setup.  
- **Navigation button** control menu pages and live readout.  
- Wheel/string readings stream as you move; angle and ultrasonic update on demand.
</details>

</div>

<div id="architecture" class="content-section">

## System Architecture

<details>
<summary><strong>🔧 Hardware Layer</strong></summary>

- **MCU/Radio:** Silicon Labs **EFR32BG13** (Cortex-M4 + BLE).  
- **PMIC:** **BQ25570** energy harvester/charger with regulated output.  
- **Linear:** **AS5147P** magnetic encoder (ABI used; SPI for config).  
- **Angular:** **BNO055** IMU over **I²C** (address **0x28** selected).  
- **Range:** UART ultrasonic module (6–254 in verified).  
- **Display:** **Sharp Memory LCD 2.7″** over **SPI**.  
- **Energy:** Monocrystalline panel → PMIC; **Li-Po 480 mAh** storage.
</details>

<details>
<summary><strong>💻 Firmware Layer</strong></summary>

- Event-driven state machine: **Idle → Measure → Report → Sleep**.  
- Drivers: **SPI** (encoder/LCD), **I²C** (IMU), **UART** (ultrasonic).  
- BLE GATT: separate characteristics for each measurement type.  
- Power policy: prefer **EM2**; sensors and LCD behind **load switches**.
</details>

<details>
<summary><strong>⏱️ Buses & Clocks (from bring-up)</strong></summary>

- **I²C** to BNO055 at ~**92 kHz** during early tests; read accel LSB at **reg 0x08**.  
- **SPI** to Sharp LCD around **1.1 MHz** (per display timing).  
- **Clocks:** HF crystal ~**38–40 MHz** for radio; **32.768 kHz** LF crystal for low-energy modes.  
- Initial LF part was an oscillator footprint; swapped to a crystal to restore EM2 behavior.
</details>

</div>

<div id="hardware" class="content-section">

## Hardware Design

<details>
<summary><strong>⚡ Power Management System</strong></summary>

This project uses **BQ25570** to harvest from solar, **charge the 480 mAh Li-Po**, and regulate a ~**3.2 V** rail for the MCU, sensors, and LCD. The PMIC thresholds were set around **VBAT_OV = 4.2 V**, **VBAT_OK ≈ 3.2 V**, with **VOUT ≈ 3.2 V** feeding the system.

A **220 µF** MLCC (Murata **GRM32ER60J227ME05L**) was placed at the bulk node. With DC-bias at ~3.2 V, its effective value is about **100 µF**, which kept VSTOR steady during LCD updates and BLE activity. The PMIC’s **cold-start** path was useful for first power-up when the battery was flat; USB input also powered and charged the board during bring-up.

Design choice: a regulated rail was preferred over running unregulated from the cell. Earlier calculations showed a **~11%** gain in effective battery life for the usage pattern by avoiding LDO losses and keeping light-load efficiency reasonable.
</details>

<details>
<summary><strong>🎯 Sensor Integration</strong></summary>

- **AS5147P (linear):** ABI pulses were counted for distance. A hardware divide-by-8 (**CD74HC4520**) reduced pulse rate but **lost A/B phase**, so direction became unreliable. Final setup **programmed 256 ppr** via SPI and handled direction in firmware.  
- **BNO055 (angular):** I²C address **0x28**. Early **NACKs** after mode changes were handled with short retries and mode checks.  
- **Ultrasonic (range):** UART RX originally overlapped VCOM; moving RX fixed serial contention.  
- **Placement:** the encoder’s magnet was kept away from the IMU’s magnetometer, and the RF antenna region stayed clear of magnetic parts.  
- **ESD:** **SP1003** on USB/battery (≈12 V clamp, low leakage); **SP1001-04** across the 4-button cluster.  
- **Test Points:** added on **I²C**, **SPI**, and **ABI**; these made logic-analyzer work and SPI config of the encoder straightforward.
</details>

<details>
<summary><strong>🔌 Programming & Test Access</strong></summary>

- **10-pin debug header** (Silabs pinout): **SWD**, **AEM**, **PTI**, **VCOM**, **Virtual UART**.  
- Tooling: **Simplicity Studio v5** + **Simplicity Commander** for erase/flash/verify/reset.  
- **Clocks:** HF/LF crystals per datasheets; after swapping the LF part, EM2 current matched expectations.  
- **Mode switch:** All-OFF / Partial-ON / All-ON selections during test.  
- **Extra points:** through-holes on PMIC VOUT and solar input for scope current/voltage checks.
</details>

</div>

<div id="firmware" class="content-section">

## 💾 Firmware Implementation

<details>
<summary><strong>⚡ Power Management</strong></summary>

The firmware targets **EM2** when idle. Sensors and LCD sit behind **load switches** and only power up inside a measurement mode. The core shifts down toward the LF domain for UI idle, then returns to HF for sampling or BLE work. A previous issue where **UART forced EM1** was resolved by gating the interface when not in use.
</details>

<details>
<summary><strong>📊 Sensor Management</strong></summary>

- **Encoder:** 256 ppr with direction from A/B phase; counts timestamped to avoid missed steps at higher speeds.  
- **IMU:** Euler angle readout; short retry on NACK after power-cycling or mode changes.  
- **Ultrasonic:** framed parsing; moved pins to keep debug serial separate from data serial.  
- **LCD:** small page buffers for menu vs. live display; partial refreshes keep updates quick.
</details>

<details>
<summary><strong>📡 Communication Stack (BLE)</strong></summary>

- On **boot:** start advertising (`sl_bt_advertiser_create_set`, timing, start).  
- On **connect:** stop advertising, set connection parameters.  
- On **disconnect:** restart advertising.  
- **Soft timer:** periodic LCD updates.  
- **Indications:** send when sensor data is ready (separate characteristics per type).  
- Stack used: **EFR Connect** app during tests; link stable in open area to ~**100 m**.
</details>

</div>

<div id="challenges" class="content-section">

## Engineering Challenges

<details>
<summary><strong>LF timing part selection</strong></summary>

An LF **oscillator** footprint went on the first board where a **32.768 kHz crystal** was intended. EM2 didn’t behave until the part was swapped. After that, sleep current and clocking matched the datasheets.
</details>

<details>
<summary><strong>Direction vs. frequency divider</strong></summary>

Dropping ABI pulse rate with a dual counter (**CD74HC4520**) looked good on paper but **lost phase** information. The fix was to **configure the encoder to 256 ppr** and keep direction in firmware.
</details>

<details>
<summary><strong>Power rail dips</strong></summary>

Radio + LCD bursts caused small dips on VSTOR. Accounting for **MLCC DC-bias** and sizing the bulk to ~**100 µF effective** at 3.2 V stabilized the rail.
</details>

<details>
<summary><strong>Interfaces fighting each other</strong></summary>

The ultrasonic UART shared pins with VCOM at first, which corrupted logs. Moving RX solved it. I²C to the BNO055 occasionally NACKed after mode switches; short retries fixed that without adding delays everywhere.
</details>

<details>
<summary><strong>Energy path bring-up</strong></summary>

With a flat battery, **BQ25570** needed the harvester cold-start to get going. The **USB** input was useful for initial flashing and verifying that **VOUT ≈ 3.2 V** and **VBAT_OV = 4.2 V** behaved as set.
</details>

</div>

<div id="learnings" class="content-section">

## Learnings

- **Phantom power is real:** peripherals can back-power through I/O even when VMCU is off—plan load switches early.  
- **Parts vs. packages:** a crystal vs. oscillator mistake cost time and current; footprints matter.  
- **Indicators help:** simple LEDs caught a part-number mismatch during early flashing.  
- **Datasheets first:** e.g., BQ25570 behavior on cold-start and VBAT_OK thresholds.  
- **Sleep takes planning:** too many or badly timed interrupts keep the MCU up; EM2 works when interfaces are gated.  
- **Layout details:** pick bulk caps by **effective capacitance** at the operating voltage, not just the label. Keep magnets away from RF and from the IMU’s magnetometer.  
- **Debug access:** test points on **I²C/SPI/ABI** and a proper **10-pin** header paid off every time something glitched.  
- **Have an escape hatch:** being able to bypass the frequency divider and re-configure the encoder let the project keep moving.

<p style="margin-top: 1rem; opacity: .8;">Average current for a typical use-case cycle measured ~<strong>6.2 mA</strong>; with the chosen duty cycle and the <strong>480 mAh</strong> cell, this project targets multi-day use between charges, with solar extending runtime.</p>

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
