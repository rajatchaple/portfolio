---
layout: post
title: "Goods sense device"
permalink: goods-sense
img: /assets/img/goods-sense-thumbnail.jpg
desc: This battery operated device monitors goods under treansport
---

# Goods Sense device

<!--
<h1 id="identifier" >
    Markdown h1 styles
</h1> -->

There are losses due to mishandling of goods during transportation. In this project, the developed device is targeted to sense condition of goods while transporting, which is its orientation. Also, Since this device needs to be standalone product and portable, it is required to be battery operated. This requires low power operation of a device.
KL25z evaluaion module was used to develop above project. Bare metal coding was used for development of this project.

<p align="center">  <img src="/assets/img/project_overview.png" style="width:70%; height: auto;  max-width: 600px;object-fit:cover;"/> </p>

<table class="gsd-table">
    <tr>
        <th>Sr. No.</th>
        <th>Features</th>
    </tr>
    <tr>
        <td>Feature 1</td>
        <td>Orientation detection and indication</td>
    </tr>
    <tr>
        <td>Feature 2</td>
        <td>Low power operation</td>
    </tr>
</table>

These require,

1. Accelerometer interface over I2C
2. LPTIMER (low power timer)
3. Deep sleep into low leakage stop
4. Interrupt based switch input
5. State machine's implementation

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

For this project, you would require MCUXpresso installed on your PC. You can use Linux, Windows or Mac system to run this program. After installation SDK for KL25Z (relevant chip) needs to be installed. You would also require a KL25z evaluation board with hardware changes mentioned below.

### Installing

MCUXpresso 11.2 is used for this project. Import this project in MCUXpresso by clicking on File->Import->Existing Project.

### Hardware changes

<p align="center">  <img src="/assets/img/hardware_changes.png" style="width:70%; height: auto; max-width: 600px;border-radius:10px; object-fit:cover;"/> </p>

1. Connect switches and an LED to test.
2. R74, J3 and J12 changes are required for operation in low power mode.
   Note: This 2nd change is not required if device does not require low power operation

3. Additional change is required to operate this device using coin cell. It requires populating D7 and coin cell holder BT1.
   I removed D8 and populated D7 since I hardly use USB KL25Z port.

# Working

[Link to a Project demo: Goods Sense Device](https://drive.google.com/drive/u/1/folders/1d4eFzu7haaYxXG7Dq25bmqxyeXCQLaHN)

This device runs in two modes:

1. App mode (Low powered mode)
2. Test mode / Technician mode

# App mode:

<p align="center">  <img src="/assets/img/app_mode.gif" style="width:47%; height: auto; max-width: 500px; border:2px solid black; border-radius:5px; object-fit:cover;"/> </p>

Device operates in low power mode:

1. Indications in the form of LED blink are shown every 3 seconds.
2. Tilt measurement is done every 12th second
   - If there is no tilt GREEN LED blinks every 3 seconds.
   - If there is tilt up-to two tilt measurements YELLOW LED blinks.
   - In case of tilt more than 2 tilt measurements RED LED blinks.

When device is powered, it enters low power mode and remains there unless calibration switch is pressed. Once calibration switch is pressed, device wakes up and performs calibration and also indicates that calibration is done with blue-cyan color LED pattern.

# Test mode:

<p align="center">  <img src="/assets/img/test_mode.gif" style="width:70%; height: auto; max-width: 500px; border:2px solid black; border-radius:5px; object-fit:cover;"/> </p>

Tests are manual as almost every function call is someway or the other connected to external hardware.

## TEST 1 : Software integration and Hardware test

Testing sequence as below:

1. Press and hold TEST_SWITCH (pin details in gpio_pins.h) followed by reset
2. This will enter device into Test Mode also ensured by External LED 1. (pin details in gpio.h)
3. Firstly it checks all LEDs
   sequence : RED, GREEN, BLUE, EXTERNAL_OFF, EXTERNAL_ON
4. It then calibrates accelerometer into current device's pose
5. Device needs to be tilted for angle greater than ~40 degrees in any direction. Tilt is indicated by CYAN led. Perform for mulriple angles.
6. Device remains in test mode. TO returnd device into App mode, reset device without pressing TEST_SWITCH

## TEST 2 : Energy profiling for low power mode

1. Simplicity studio and Blue geckos AEM was used for energy measurement
2. KL25Z acted as a peripheral device

Since on average this device uses current of 49uA. Estimated battery life for device is 7 days for 2400mAh

details of the energy profiler are explained in proect video

## Built With

MCUXpresso 11.2
arm-none-eabi-gcc compiler

## Authors

- Rajat Chaple
