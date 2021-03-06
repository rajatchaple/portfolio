---
layout: post
title: Telematics
permalink: jd-telematics
img: /assets/img/jd_telematics_thuumbnail.png

desc: Fleet management system using telematics and android app
---

# Cubit

<!--
<h1 id="identifier" >
    Markdown h1 styles
</h1> -->

<p align="center"> <img src="/assets/img/cubit_end_product.jpg" style="width:70%; height: auto; max-width: 600px;object-fit:cover; border-radius:15px;"/> </p>

This smart measuring instrument has capability to take precise linear and angular measurements and transmit the data over to a mobile application using Bluetooth. Primarily, this device has an encoder-wheel assembly which can be used to take measurements over a straight or curved surface very accurately. A high precision rotary encoder is helpful in giving high resolution results. Moreover, this also has an inertial measurement unit (IMU) sensor to take different angular and device orientation data. Both measurements can then be transmitted to a mobile app connected to the product using Bluetooth (BLE). This data is also displayed on an LCD. This device runs on a small battery, and it also contains an energy harvesting system using solar panel to recharge the battery. This device operates in low power mode by implementing load power management and utilizes minimum current for required peripherals.

<p align="center">  <img src="/assets/img/cubit_block_diagram.jpg" style="width:70%; height: auto;  max-width: 500px; object-fit:cover;"/> </p>

This project contains following implementations:

<!-- {:.gsd-table}
| Sr. No. | Features |
| --------- | ------------------------------------ |
| Feature 1 | Orientation detection and indication |
| Feature 2 | Low power operation | -->

These features required,

1. IMU interface over I2C
2. LCD interface over SPI
3. Mangetic encoder interface over ABI
4. Low energy mode software development
5. State machine's implementation

## Hardware

### Hardware block diagram

<p align="center">  <img src="/assets/img/cubit_hw_block_diagram.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

### Power supply

Critical element of this project was designing a power supply circuit. PMIC IC chosen for this purpose (BQ25570) was set to give output of 3.2v using configuration resistors. This power supply design supports battery charging over energy harvesting unit(solar panel) and USB.

### EFR32 microcontroller and RF Antenna

The microcontroller can work on two external crystals, HFXTAL and LFXTAL. Oscillators, power block, radio antenna were designed by referring to a datasheet. Multiplexed pins were assigned functionality in order to make routing easy. Pin assignment and hence routing was critical as this PCB was fabricated with only 2 layer board. Via stitching technique was used to reduce EMI of an RF antenna into the board.

### Sensors

Magnetic encoder, Ultrasonic sensor and LCD has load switches to reduce power consumption when these sensors are not in use. Decoupling capacitors were kept as close as possible to these sensors power pins to reduce noise on the power rail.

### Assembly

<p align="center"> <img src="/assets/img/cubit_board_assembled.jpg" style="width:70%; height: auto; max-width: 600px; object-fit:cover; border-radius:15px;"/> </p>
Following were the steps performed to get assmbled board ready:

1. Schematic design using altium designer
2. Board layout
3. Board sent out for fabrication
4. Applying solder pase on bare PCBs using stensil
5. Placing components on bare boards
6. Baking the boards

### Mechanical Assembly

Catia and Solidworks was used to design mechanical assembly. Thanks to Unmesh Khare for designing this assembly.

<p align="center"> <img src="/assets/img/cubit_assemly_cut.jpg" style="width:70%; height: auto; max-width: 600px;object-fit:cover; border-radius:15px;"/> </p>

### App

App was developed using react-native open source platform. Configured Services and characteristics were sent from EFR32 to mobile app. This data was then converted into human readable form.

## Software

Since this is a battery-operated device, software architecture was designed to keep microcontroller to a lowest energy mode possible. Sensors were interfaced using ABI, UART and I2C interface. Whereas, LCD was interfaced using SPI interface. Simplicity studio v5 IDE was used for the software development.

### Flowchart

<p align="center">  <img src="/assets/img/cubit_flowchart.svg" style="width:100%; height: auto; max-width: 500px; border-radius:30px; object-fit:cover;"/> </p>

<!-- <p align="center">  <svg src="/assets/img/cubit_flowchart.svg" style="max-width:100%; height: auto; border-radius:30px; object-fit:cover;"></svg> </p> -->

# Working

<p align="center" > <iframe style="width:100%; max-width: 550px; height: auto; min-height:315px; object-fit:cover;"
src="https://www.youtube.com/embed/g9_j63HUWLc">
</iframe> </p>
<!-- width="550" height="315"  -->

<!-- ## Energy profiling -->

1. Simplicity studio and Blue geckos AEM was used for energy measurement
2. Mini debugger port of Blue gecko main board was used for flashing firmware and also for Advanced energy monitoring.

Since on average this device uses current of 780uA when in idle state. Estimated battery life for device is around 10 days.

## Authors

- Rajat Chaple
- Saloni Shah
