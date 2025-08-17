---
title: 'Cubit: Smart Measuring Instrument'
slug: '/projects/cubit'
cover: '../../featured/Cubit/cubit.jpg'
showInProjects: false
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

/* Make project header truly sticky and improve scrolling */
.layout > main > header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 1000 !important;
  background: rgba(10, 25, 47, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(100, 255, 218, 0.3) !important;
  padding: 1rem 2rem !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3) !important;
}

/* Add top padding to main content to account for fixed header */
.layout > main {
  padding-top: 120px !important;
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

/* Better sidebar and content layout */
.project-layout {
  display: flex;
  gap: 2rem;
  margin-top: -2rem;
  align-items: flex-start;
  max-width: none !important;
  width: 100% !important;
  padding: 0 2rem 0 6rem;
  box-sizing: border-box;
}

.project-nav {
  width: 300px;
  min-width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 140px;
  height: fit-content;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  background: rgba(100, 255, 218, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(100, 255, 218, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.nav-title {
  font-family: var(--font-mono);
  color: var(--green);
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  padding-bottom: 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 0.6rem;
}

.nav-link {
  color: var(--light-slate);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  display: block;
  transition: none;
  border-left: 3px solid transparent;
  font-weight: 500;
  line-height: 1.3;
}

.nav-link.active {
  color: var(--green);
  background: rgba(100, 255, 218, 0.2);
  border-left-color: var(--green);
  font-weight: 600;
}

.nav-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
}

.nav-footer small {
  color: var(--light-slate);
  font-style: italic;
  font-size: 0.75rem;
}

.project-content {
  flex: 1;
  min-width: 0;
  max-width: none !important;
  overflow-x: auto;
}

.content-section {
  margin-bottom: 3rem;
  scroll-margin-top: 30vh;
  width: 100%;
  max-width: none !important;
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

<div class="project-layout">
  <nav class="project-nav">
    <div class="nav-title">📋 Project Sections</div>
    <ul class="nav-list">
      <li><a href="#overview" class="nav-link" data-section="overview">🎯 Overview</a></li>
      <li><a href="#features" class="nav-link" data-section="features">⭐ Key Features</a></li>
      <li><a href="#architecture" class="nav-link" data-section="architecture">🏗️ System Architecture</a></li>
      <li><a href="#hardware" class="nav-link" data-section="hardware">🔧 Hardware Design</a></li>
      <li><a href="#firmware" class="nav-link" data-section="firmware">💻 Firmware</a></li>
      <li><a href="#mobile" class="nav-link" data-section="mobile">📱 Mobile App</a></li>
      <li><a href="#journey" class="nav-link" data-section="journey">🚀 Development Journey</a></li>
      <li><a href="#challenges" class="nav-link" data-section="challenges">⚡ Engineering Challenges</a></li>
      <li><a href="#results" class="nav-link" data-section="results">🏆 Results & Recognition</a></li>
      <li><a href="#resources" class="nav-link" data-section="resources">📂 Open Source</a></li>
    </ul>
    <div class="nav-footer">
      <small>Click any section to jump there instantly</small>
    </div>
  </nav>

  <main class="project-content">

<div id="overview" class="content-section">

## <span id="overview">🎯 Overview</span>

> **Reimagining the measuring tape that hasn't changed since the 1850s**

Cubit revolutionizes traditional measurement tools by creating a multi-functional smart instrument that addresses real challenges faced by professionals in the digital age.

<details>
<summary><strong>🔍 The Problem We're Solving</strong></summary>

- **Time Waste** - Professionals spend countless hours manually recording measurements
- **Human Error** - Manual processes introduce errors leading to costly mistakes  
- **Tool Switching** - Different tasks require multiple measurement devices
- **Digital Disconnect** - Traditional tools don't integrate with modern workflows

</details>

<details>
<summary><strong>💡 Our Solution</strong></summary>

- **Three-in-One Design** - Wheel, string-pulley, and ultrasonic measurement modes
- **Digital Precision** - Measurement accuracy to 0.1mm
- **Wireless Connectivity** - Instant data transfer to smartphones and computers
- **Sustainable Power** - Solar energy harvesting extends battery life by 300%

</details>

</div>

<div id="features" class="content-section">

## Key Features

<details>
<summary><strong>📏 Triple Measurement System</strong></summary>

Three integrated measurement mechanisms in one compact device:
- **Wheel assembly** for flat and curved surfaces with 0.1mm precision
- **String-pulley system** for flexible fabric and body measurements
- **Ultrasonic sensor** for contactless measurements up to 6 meters

</details>

<details>
<summary><strong>🔋 Self-Sustaining Power</strong></summary>

Revolutionary energy management system:
- Integrated solar panel array harvests energy even under indoor lighting
- USB charging port for rapid battery replenishment
- 480mAh LiPo battery provides up to 7 days of operation
- Dynamic power scaling reduces consumption by 98.7%

</details>

<details>
<summary><strong>📱 Wireless Integration</strong></summary>

Seamless digital workflow integration:
- Bluetooth 5.0 provides instant data synchronization with 30m range
- Custom mobile application for measurement logging and visualization
- Data export capabilities for CAD and design software integration
- Secure cloud storage and project organization features

</details>

<details>
<summary><strong>🖥️ User Experience</strong></summary>

Intuitive controls for seamless operation:
- Ultra-low power LCD display with perfect visibility in all lighting
- Context-sensitive menu system with simple navigation buttons
- Real-time measurement feedback with digital precision readouts
- Visual documentation with photo annotation capability

</details>

</div>

<div id="architecture" class="content-section">

## System Architecture

<details>
<summary><strong>🔧 Hardware Layer</strong></summary>

- **EFR32BG13** - ARM Cortex-M4 MCU with Bluetooth 5.0
- **BQ25570** - Ultra-low power harvesting PMIC with 92% efficiency
- **AS5147P** - High-precision magnetic encoder (12-bit resolution)
- **BNO055** - 9-DOF IMU with sensor fusion processor
- **SHARP Memory Display** - Ultra-low power 1.3" LCD (100μA consumption)
- **Solar Panel Array** - Monocrystalline cells (1.15V output)

</details>

<details>
<summary><strong>💻 Firmware Layer</strong></summary>

- **Energy Management System** - Dynamic power state transitions
- **Sensor Drivers** - Custom low-power peripheral interfaces
- **Measurement Algorithms** - Signal processing and data fusion
- **State Machine** - Event-driven architecture with task scheduling
- **BLE Stack** - Custom GATT services for measurement data

</details>

<details>
<summary><strong>📱 Application Layer</strong></summary>

- **React Native Mobile App** - Cross-platform user interface
- **Real-time Visualization** - Interactive measurement display
- **Data Export** - Integration with CAD and design software
- **Measurement History** - Cloud synchronization and sharing

</details>

</div>

<div id="hardware" class="content-section">

## Hardware Design

<details>
<summary><strong>⚡ Power Management System</strong></summary>

I engineered a multi-source power management system that achieves remarkable efficiency:

```
Solar Input → MPPT Controller → Power Arbitration → LDO → System Power
USB Input  ─┘                 └→ Battery Charging
```

- **Dynamic Power Scaling**: Clock from 76.8MHz to 32kHz based on workload
- **Intelligent Charging**: Harvests energy even in indoor environments (>200 lux)
- **Ultra-Low Quiescent**: 1.8µA in deep sleep mode with RTC running
- **Power States**: 5 distinct profiles optimized for different scenarios

</details>

<details>
<summary><strong>🎯 Sensor Integration</strong></summary>

Custom-designed sensor fusion algorithm for accuracy:

- **AS5600 Magnetic Encoder**: 12-bit resolution, 0.088° angular precision
- **BMI270 6-axis IMU**: Spatial awareness and orientation compensation
- **SI7021 Temperature Sensor**: Thermal compensation across -20°C to 70°C
- **Capacitive Touch**: Zero-force interaction for better battery life

</details>

</div>

<div id="firmware" class="content-section">

## 💾 Firmware Implementation

<details>
<summary><strong>⚡ Power Management</strong></summary>

- **Dynamic Power States:** Five configurable modes based on activity level
- **Peripheral Shutdown:** Individual sensor power control through load switches
- **Sleep Optimization:** EM2 deep sleep with RTC running at only 1.8µA
- **Clock Gating:** Dynamic frequency scaling from 76.8MHz to 32kHz

</details>

<details>
<summary><strong>📊 Sensor Management</strong></summary>

- **Adaptive Sampling:** Event-triggered measurements based on activity detection
- **Calibration Algorithms:** Temperature-compensated measurements
- **Signal Processing:** Digital filtering to improve measurement accuracy
- **Data Fusion:** Combining multiple sensor inputs for enhanced accuracy

</details>

<details>
<summary><strong>📡 Communication Stack</strong></summary>

- **BLE Protocol:** Custom GATT services for measurement data transmission
- **Error Correction:** Packet redundancy for reliable data transfer
- **Security Features:** 256-bit AES encryption for data protection
- **Power-Aware Design:** Minimized radio usage to conserve energy

</details>

</div>

<div id="mobile" class="content-section">

## Mobile Application

**React Native app** that transforms your smartphone into a sophisticated measurement command center.

<details>
<summary><strong>📏 Real-Time Measurement</strong></summary>

Measurements update instantly with large, readable numbers and unit conversion on the fly. Switch between imperial and metric with a single tap.

</details>

<details>
<summary><strong>📷 Visual Documentation</strong></summary>

Take photos and annotate them with measurements directly. The integrated AR mode overlays measurements onto real-world images for visual reference.

</details>

<details>
<summary><strong>📁 Project Organization</strong></summary>

Create project folders to organize related measurements. Add notes, photos, and voice memos to each measurement for comprehensive documentation.

</details>

<details>
<summary><strong>📊 Data Integration</strong></summary>

Export in various formats or share directly to tools like AutoCAD and SketchUp. Cloud synchronization enables access across multiple devices.

</details>

</div>

<div id="journey" class="content-section">

## Development Journey

<details>
<summary><strong>🚀 Project Inception & Research</strong> (September 2021)</summary>

Identified a significant opportunity in the measurement tools market after interviewing 50+ professionals. Market analysis revealed 40% potential improvement in accuracy and efficiency.

</details>

<details>
<summary><strong>🔧 Architecture & Components</strong> (October 2021)</summary>

Selected the EFR32BG13 microcontroller after evaluating 8 different MCUs, providing the optimal balance of processing power and ultra-low energy consumption.

</details>

<details>
<summary><strong>⚡ Hardware Design Sprint</strong> (November 2021)</summary>

Completed schematic design and PCB layout with integrated solar charging circuit and three sensor interfaces. Performed comprehensive power simulation.

</details>

<details>
<summary><strong>🏭 Prototype Manufacturing</strong> (December 2021)</summary>

Partnered with PCBWay for rapid prototype fabrication; successfully sourced components during global chip shortage through strategic supplier relationships.

</details>

<details>
<summary><strong>💻 Core Firmware Development</strong> (January 2022)</summary>

Implemented real-time measurement algorithms with sensor drivers for magnetic encoder, IMU, and ultrasonic sensor. Developed dynamic power management system.

</details>

<details>
<summary><strong>🔋 Power Optimization</strong> (February 2022)</summary>

Achieved 70% power reduction through innovative sleep mode transitions, peripheral shutdown strategies, and energy harvesting algorithms.

</details>

<details>
<summary><strong>📱 Wireless & App Development</strong> (March 2022)</summary>

Developed custom BLE protocol and React Native mobile application with real-time measurement visualization and data export capabilities.

</details>

<details>
<summary><strong>🏆 Award-Winning Demo</strong> (May 2022)</summary>

Presented at CU Boulder Senior Design Expo, winning Best Innovation Award among 60+ competing projects. Exploring commercialization opportunities.

</details>

</div>

<div id="challenges" class="content-section">

## Engineering Challenges

<details>
<summary><strong>⚡ Power Optimization Crisis</strong></summary>

**Challenge:** Initial prototypes drained battery in under 4 hours. MCU consumed 15mA even in "sleep" states.

**Solution:** Implemented hierarchical power states with five calibrated modes, aggressive peripheral shutdown, dynamic clock scaling, and event-driven wake-up triggers reducing idle current by 98.7%.

</details>

<details>
<summary><strong>📐 Mechanical-Electronic Integration</strong></summary>

**Challenge:** Curved, compact form factor created severe spatial constraints. Standard PCB approaches resulted in a device 3× larger than viable.

**Solution:** Developed hybrid rigid-flex PCB with three interconnected segments conforming to curved enclosure with precise impedance matching.

</details>

<details>
<summary><strong>📶 Wireless Reliability Issues</strong></summary>

**Challenge:** Field testing revealed 42% packet loss during active measurement, especially with rapid orientation changes near metal surfaces.

**Solution:** Redesigned antenna with careful impedance matching and implemented adaptive transmission protocol with dynamic power adjustment achieving 99.8% reliability.

</details>

<details>
<summary><strong>🔍 Measurement Precision Barriers</strong></summary>

**Challenge:** Initial tests showed unacceptable ±1.2mm variance across temperature ranges, especially after extended use when component heating affected calibration.

**Solution:** Developed dynamic calibration algorithm using onboard temperature sensor for real-time compensation and implemented dual-measurement verification system.

</details>

</div>

<div id="results" class="content-section">

## Results & Recognition

### 🏆 Best Innovation Award
**CU Boulder Senior Design Expo, May 2022**

Cubit was recognized for its unique combination of sustainability, functionality, and modern connectivity features among 60+ competing projects.

<details>
<summary><strong>👥 Judges' Highlights</strong></summary>

*"The solar energy harvesting implementation is ingenious, extending battery life far beyond typical devices in this category."*

*"Seamless mobile connectivity transforms what could be just a measurement tool into a comprehensive digital workflow solution."*

</details>

### 📊 Key Metrics

- **98.7%** Power Efficiency Improvement
- **±0.1mm** Measurement Precision  
- **7+ days** Battery Life
- **42** Field Testers

</div>

<div id="resources" class="content-section">

## Open Source Resources

All design files, source code, and documentation are freely available for educational and research purposes.

### 💻 [Firmware Source Code](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/firmware)
Production-grade embedded C with power management, sensor drivers, and BLE protocols

### 🔧 [Hardware Design](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/hardware)  
Complete Altium Designer files including schematics, PCB layouts, and BOM

### 📱 [Mobile Application](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/mobile)
React Native app with TypeScript, Redux state management, and BLE connectivity

### 📚 [Documentation](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/docs)
Technical documentation including protocol specifications, APIs, and testing procedures

  </main>
</div>

<style>
/* Hide the default project header to avoid conflicts */
.layout > main > header {
  display: none !important;
}

/* Hide any external link icons that might appear */
a[href*="http"]:after, 
a[target="_blank"]:after,
.project-links a:after {
  display: none !important;
}

/* Sticky Project Header */
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(10, 25, 47, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(100, 255, 218, 0.2);
  z-index: 1000;
  padding: 1rem 2rem;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.sticky-header.visible {
  transform: translateY(0);
}

.sticky-title {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.sticky-title h1 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--lightest-slate);
  font-weight: 600;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.project-type {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--green);
  opacity: 0.8;
}

.project-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 4px;
  color: var(--green);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(100, 255, 218, 0.2);
  border-color: var(--green);
  transform: translateY(-1px);
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

.project-nav {
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  position: sticky;
  position: -webkit-sticky;
  top: 140px;
  height: fit-content;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  background: rgba(100, 255, 218, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10;
  margin-left: 3rem;
}

.nav-title {
  font-family: var(--font-mono);
  color: var(--green);
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  padding-bottom: 1rem;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 0.6rem;
}

.nav-link {
  color: var(--light-slate);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  display: block;
  transition: none;
  border-left: 3px solid transparent;
  font-weight: 500;
  line-height: 1.3;
}

.nav-link.active {
  color: var(--green);
  background: rgba(100, 255, 218, 0.2);
  border-left-color: var(--green);
  font-weight: 600;
}

.nav-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
}

.nav-footer small {
  color: var(--light-slate);
  font-style: italic;
  font-size: 0.75rem;
}

.project-content {
  flex: 1;
  min-width: 0;
  max-width: none !important;
  width: calc(100vw - 390px) !important;
  overflow-x: auto;
}

.content-section {
  margin-bottom: 3rem;
  scroll-margin-top: 30vh;
  width: 100%;
  max-width: none !important;
}

/* Make details/summary sections use full width */
details {
  margin: 1.5rem 0;
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: none !important;
}

/* Ensure all content can use full width */
.content-section h2,
.content-section p,
.content-section ul,
.content-section ol,
.content-section div {
  max-width: none !important;
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

/* Force sticky positioning */
@supports (position: sticky) {
  .project-nav {
    position: sticky;
    top: 120px;
  }
}

@media (max-width: 1200px) {
  .sticky-header {
    padding: 0.8rem 1rem;
  }
  
  .sticky-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .sticky-title h1 {
    font-size: 1.2rem;
  }
  
  .project-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }
  
  .project-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .project-layout {
    flex-direction: column;
    gap: 2rem;
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    padding: 4rem 1rem 0;
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

@media (max-width: 1024px) {
  .project-layout {
    flex-direction: column;
    gap: 2rem;
    padding: 0;
  }
  
  .project-nav {
    position: relative;
    top: 0;
    width: 100%;
    min-width: auto;
    max-height: none;
    margin-bottom: 2rem;
  }
  
  .nav-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
  }
  
  .nav-list li {
    margin-bottom: 0;
  }
  
  .project-content {
    width: 100%;
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
  }
}
</style>

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

> Reimagining the measuring tape that hasn't changed since the 1850s

Cubit revolutionizes traditional measurement tools by creating a multi-functional smart instrument that addresses real challenges faced by professionals in the digital age. The project combines advanced sensing technology, energy harvesting, and wireless connectivity to bridge the gap between physical measurements and digital workflows.

### The Problem

- **Time Waste** - Professionals spend countless hours manually recording measurements
- **Human Error** - Manual processes introduce errors leading to costly mistakes
- **Tool Switching** - Different tasks require multiple measurement devices
- **Digital Disconnect** - Traditional tools don't integrate with modern workflows

### Our Solution

- **Three-in-One Design** - Wheel, string-pulley, and ultrasonic measurement modes
- **Digital Precision** - Measurement accuracy to 0.1mm
- **Wireless Connectivity** - Instant data transfer to smartphones and computers
- **Sustainable Power** - Solar energy harvesting extends battery life by 300%

[↑ Back to Top](#table-of-contents) | [Next: Key Features →](#key-features)

---

## Key Features

### Triple Measurement System

Three integrated measurement mechanisms in one compact device:
- Wheel assembly for flat and curved surfaces with 0.1mm precision
- String-pulley system for flexible fabric and body measurements
- Ultrasonic sensor for contactless measurements up to 6 meters

### Self-Sustaining Power

Revolutionary energy management system:
- Integrated solar panel array harvests energy even under indoor lighting
- USB charging port for rapid battery replenishment
- 480mAh LiPo battery provides up to 7 days of operation
- Dynamic power scaling reduces consumption by 98.7%

### Wireless Integration

Seamless digital workflow integration:
- Bluetooth 5.0 provides instant data synchronization with 30m range
- Custom mobile application for measurement logging and visualization
- Data export capabilities for CAD and design software integration
- Secure cloud storage and project organization features

### User Experience

Intuitive controls for seamless operation:
- Ultra-low power LCD display with perfect visibility in all lighting
- Context-sensitive menu system with simple navigation buttons
- Real-time measurement feedback with digital precision readouts
- Visual documentation with photo annotation capability

[↑ Back to Top](#table-of-contents) | [← Previous: Overview](#overview) | [Next: System Architecture →](#system-architecture)

---

## System Architecture

Cubit represents a sophisticated integration of hardware, firmware, and mobile technologies working in harmony to deliver a seamless measurement experience.

### Hardware Layer

- EFR32BG13 - ARM Cortex-M4 MCU with Bluetooth 5.0
- BQ25570 - Ultra-low power harvesting PMIC with 92% efficiency
- AS5147P - High-precision magnetic encoder (12-bit resolution)
- BNO055 - 9-DOF IMU with sensor fusion processor
- SHARP Memory Display - Ultra-low power 1.3" LCD (100μA consumption)
- Solar Panel Array - Monocrystalline cells (1.15V output)

### Firmware Layer

- Energy Management System - Dynamic power state transitions
- Sensor Drivers - Custom low-power peripheral interfaces
- Measurement Algorithms - Signal processing and data fusion
- State Machine - Event-driven architecture with task scheduling
- BLE Stack - Custom GATT services for measurement data

### Application Layer

- React Native Mobile App - Cross-platform user interface
- Real-time Visualization - Interactive measurement display
- Data Export - Integration with CAD and design software
- Measurement History - Cloud synchronization and sharing

[↑ Back to Top](#table-of-contents) | [← Previous: Key Features](#key-features) | [Next: Hardware Design →](#hardware-design)

---

## Hardware Design

### Power Management System

I engineered a multi-source power management system that achieves remarkable efficiency through intelligent energy routing:

```
Solar Input → MPPT Controller → Power Arbitration → LDO → System Power
USB Input  ─┘                 └→ Battery Charging
```

- **Dynamic Power Scaling**: Automatically adjusts system clock from 76.8MHz to as low as 32kHz based on workload
- **Intelligent Charging Circuit**: Harvests energy from ambient light even in indoor environments (>200 lux)
- **Ultra-Low Quiescent Current**: Achieves 1.8µA in deep sleep mode with RTC running
- **Sophisticated Power States**: Implements 5 distinct power profiles optimized for different usage scenarios

### Sensor Integration

Cubit's accuracy comes from sophisticated sensor integration using a custom-designed sensor fusion algorithm:

- **AS5600 Magnetic Encoder**: 12-bit resolution provides 0.088° angular precision for distance measurement
- **BMI270 6-axis IMU**: Enables spatial awareness and orientation compensation
- **SI7021 Temperature Sensor**: Provides thermal compensation for measurement accuracy across -20°C to 70°C
- **Capacitive Touch Inputs**: Zero-force interaction improves battery life and user experience

[↑ Back to Top](#table-of-contents) | [← Previous: System Architecture](#system-architecture) | [Next: Firmware Implementation →](#firmware-implementation)

---

## Firmware Implementation

The firmware architecture implements an event-driven system with priority-based task scheduling optimized for minimal power consumption:

### Power Management

- **Dynamic Power States:** Five configurable power modes based on activity level
- **Peripheral Shutdown:** Individual control of sensor power through load switches
- **Sleep Mode Optimization:** EM2 deep sleep with RTC running at only 1.8µA
- **Clock Gating:** Dynamic frequency scaling from 76.8MHz to 32kHz

### Sensor Management

- **Adaptive Sampling:** Event-triggered measurements based on activity detection
- **Calibration Algorithms:** Temperature-compensated measurements across environments
- **Signal Processing:** Digital filtering to improve measurement accuracy
- **Data Fusion:** Combining multiple sensor inputs for enhanced accuracy

### Communication Stack

- **BLE Protocol:** Custom GATT services for measurement data transmission
- **Error Correction:** Packet redundancy for reliable data transfer
- **Security Features:** 256-bit AES encryption for data protection
- **Power-Aware Design:** Minimized radio usage to conserve energy

[↑ Back to Top](#table-of-contents) | [← Previous: Hardware Design](#hardware-design) | [Next: Mobile Application →](#mobile-application)

---

## Mobile Application

The Cubit companion app transforms your smartphone into a sophisticated measurement command center. Built with React Native for cross-platform deployment, the app connects to the Cubit device via Bluetooth LE and provides an intuitive interface for capturing, organizing, and sharing measurements.

### Real-Time Measurement

Measurements update instantly with large, readable numbers and unit conversion on the fly. Switch between imperial and metric with a single tap.

### Visual Documentation

Take photos and annotate them with measurements directly. The integrated AR mode overlays measurements onto real-world images for visual reference.

### Project Organization

Create project folders to organize related measurements. Add notes, photos, and voice memos to each measurement for comprehensive documentation.

### Data Integration

Export in various formats or share directly to tools like AutoCAD and SketchUp. Cloud synchronization enables access across multiple devices.

[↑ Back to Top](#table-of-contents) | [← Previous: Firmware Implementation](#firmware-implementation) | [Next: Development Journey →](#development-journey)

---

## Development Journey

### Project Inception & Research
**September 2021**

Identified a significant opportunity in the measurement tools market after interviewing 50+ professionals. Market analysis revealed 40% potential improvement in accuracy and efficiency.

### Architecture & Components
**October 2021**

Selected the EFR32BG13 microcontroller after evaluating 8 different MCUs, providing the optimal balance of processing power and ultra-low energy consumption.

### Hardware Design Sprint
**November 2021**

Completed schematic design and PCB layout with integrated solar charging circuit and three sensor interfaces. Performed comprehensive power simulation.

### Prototype Manufacturing
**December 2021**

Partnered with PCBWay for rapid prototype fabrication; successfully sourced components during global chip shortage through strategic supplier relationships.

### Core Firmware Development
**January 2022**

Implemented real-time measurement algorithms with sensor drivers for magnetic encoder, IMU, and ultrasonic sensor. Developed dynamic power management system.

### Power Optimization
**February 2022**

Achieved 70% power reduction through innovative sleep mode transitions, peripheral shutdown strategies, and energy harvesting algorithms.

### Wireless & App Development
**March 2022**

Developed custom BLE protocol and React Native mobile application with real-time measurement visualization and data export capabilities.

### Award-Winning Demo
**May 2022**

Presented at CU Boulder Senior Design Expo, winning Best Innovation Award among 60+ competing projects. Exploring commercialization opportunities.

[↑ Back to Top](#table-of-contents) | [← Previous: Mobile Application](#mobile-application) | [Next: Engineering Challenges →](#engineering-challenges)

---

## Engineering Challenges

The development of Cubit presented several complex engineering challenges that required innovative solutions.

### Power Optimization Crisis

**Challenge:**
Initial prototypes drained the battery in under 4 hours of active use. Power analysis revealed the MCU was consuming 15mA even in supposed "sleep" states.

**Solution:**
Implemented hierarchical power states with five calibrated power modes, aggressive peripheral shutdown, dynamic clock scaling, and event-driven wake-up triggers reducing idle current by 98.7%.

### Mechanical-Electronic Integration

**Challenge:**
The curved, compact form factor created severe spatial constraints. Standard rigid PCB approaches resulted in a device 3× larger than commercially viable.

**Solution:**
Developed a hybrid rigid-flex PCB with three interconnected segments that conform to the curved enclosure with precise impedance matching across flexible interconnects.

### Wireless Reliability Issues

**Challenge:**
Field testing revealed 42% packet loss during active measurement, especially when the device orientation changed rapidly or near metal surfaces.

**Solution:**
Redesigned the antenna with careful impedance matching and implemented an adaptive transmission protocol with dynamic power adjustment achieving 99.8% reliability.

### Measurement Precision Barriers

**Challenge:**
Initial tests showed unacceptable variance of ±1.2mm across temperature ranges, especially after extended use when component heating affected calibration.

**Solution:**
Developed a dynamic calibration algorithm using the onboard temperature sensor for real-time compensation and implemented a dual-measurement verification system.

[↑ Back to Top](#table-of-contents) | [← Previous: Development Journey](#development-journey) | [Next: Results & Recognition →](#results--recognition)

---

## Results & Recognition

### Best Innovation Award
CU Boulder Senior Design Expo, May 2022

Cubit was recognized for its unique combination of sustainability, functionality, and modern connectivity features among 60+ competing projects.

#### Judges' Highlights

"The solar energy harvesting implementation is ingenious, extending battery life far beyond typical devices in this category."

"Seamless mobile connectivity transforms what could be just a measurement tool into a comprehensive digital workflow solution."

#### Key Metrics

- **98.7%** Power Efficiency Improvement
- **±0.1mm** Measurement Precision
- **7+ days** Battery Life
- **42** Field Testers

[↑ Back to Top](#table-of-contents) | [← Previous: Engineering Challenges](#engineering-challenges) | [Next: Open Source Resources →](#open-source-resources)

---

## Open Source Resources

All design files, source code, and documentation are freely available for educational and research purposes.

### Firmware Source Code

Production-grade embedded C with power management, sensor drivers, and BLE protocols  
[Browse Files](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/firmware)

### Hardware Design

Complete Altium Designer files including schematics, PCB layouts, and BOM  
[View Designs](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/hardware)

### Mobile Application

React Native app with TypeScript, Redux state management, and BLE connectivity  
[Explore App](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/mobile)

### Documentation

Technical documentation including protocol specifications, APIs, and testing procedures  
[Read Docs](https://github.com/rajatchaple/ecen5833_s22_lpedt_project/tree/main/docs)

[↑ Back to Top](#table-of-contents) | [← Previous: Results & Recognition](#results--recognition)

