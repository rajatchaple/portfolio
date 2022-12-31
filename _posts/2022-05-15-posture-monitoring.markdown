---
layout: post
title: "Posture monitoring"
permalink: posture-monitoring
img: /assets/img/posture-monitoring-thumbnail.jpg
desc: BLE client monitors posture of a person using data from BLE server
---

# Posture monitoring using BLE

<!--
<h1 id="identifier" >
    Markdown h1 styles
</h1> -->

## Overview

<p align="center"> <img src="/assets/img/iot_concept.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover; border-radius:15px;"/> </p>

1. Monitors user’s sitting posture and alerts if it’s inappropriate
2. Monitors user’s work time (inactivity time) and alerts to be active
3. The project had one custom GATT server and a custom GATT client
4. 2 external sensors were used to detect the posture and activity

## Requirements outlined

1. A server device regularly sends posture data to a client device over BLE radio. The server device radios the client when the user changes the settings - Bad Posture Timeout value.
2. The client device estimates and tells the user’s posture - either GOOD or BAD.
3. The client device has an inactivity meter – alerts if sitting for a prolonged period of time.
4. The client device recognizes hand gestures and resets the inactivity meter.
5. The system establishes an encrypted link for BLE communication via a method called bonding.
6. The server device maintains the lowest possible energy mode for this application.

## Hardware

### Hardware block diagram

<p align="center">  <img src="/assets/img/iot_block_diag.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

1. IMU sensor monitors sitting posture
2. Push button sets period of bad posture (user settable)
3. Proximity sensor detects gesture (indicates user returned after activity / exercise
4. LCD and LEDs indicate connection statuses, alerts and respective timers

### Hardware installation

<p align="center">  <img src="/assets/img/iot_hardware_installation.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/iot_hw_connections.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

## Software

Since this is a battery-operated device, software architecture was designed to keep microcontroller to a lowest energy mode possible. Sensors were interfaced using ABI, UART and I2C interface. Whereas, LCD was interfaced using SPI interface. Simplicity studio v5 IDE was used for the software development.

### Data Flow

<p align="center">  <img src="/assets/img/iot_data_flow.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

### Energy profiling

<p align="center">  <img src="/assets/img/cubit_flowchart.svg" style="width:100%; height: auto; max-width: 500px; border-radius:30px; object-fit:cover;"/> </p>

<!-- <p align="center">  <svg src="/assets/img/cubit_flowchart.svg" style="max-width:100%; height: auto; border-radius:30px; object-fit:cover;"></svg> </p> -->

# Working

## Authors

- Rajat Chaple
- Sundar Krishnakumar

## Learnings

**One** key thing I learned during this project is deciding the scope of the project and its timeline. This is quite

critical when you work in teams. Dividing tasks appropriately helps in smooth execution of the project. **Second**

thing I learned is debugging software when you do not have many resources. This is when I was debugging the

I2C protocol for communicating with the sensor. Logic analyzer would have been handy to debug this but

following the right debug approach resolved this issue quickly. The **third** learning for me was how you perform

documentation for the project and how you represent your project. I am sure this is a really important thing

when you are out in industry. There would be situations where the project needs to be transferred to your

peers. These documentations make this transfer easy. Also, how you represent your project would convince

your stakeholders.
