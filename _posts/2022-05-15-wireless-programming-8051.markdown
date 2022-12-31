---
layout: post
title: "Remotely prog 8051"
permalink: wireless-programming-8051
img: /assets/img/remote-8051-thumbnail.png
desc: Remotely program 8051 over Wifi using ESP32 and MSP432
---

# Remotely programming 8051

<!--
<h1 id="identifier" >
    Markdown h1 styles
</h1> -->

<p align="center"> <img src="/assets/img/8051_concept.png" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

The project aims to allow the user to flash and test their binaries on the flash memory of 8051. This is achieved by connecting the 8051 to a target microcontroller, MSP432P401R in this case and connect the user to the target controller via a Wi-Fi module, ESP32. The project also aims to design a PCB for the target system consisting of the MSP432 controller, ESP32 module, LCD module and the 8051 microcontroller. The project extends in providing the user with a utility to connect to network and to allow selection of hex files.

The system involves,

1. A power supply to meet the operating voltage and current consumption requirements cumulative of all the components
2. A target controller (AT89C51RC2) where binary would be flashed
3. A controlling unit which manages data transfers to and from the host PC and the target controller. This unit also capable of setting up control signals for managing configuration of target controller, setting up configuration for wireless communication and displaying current program status of the system to the user.
4. An application onto the host system to allow the user to communicate with the master system to transfer the hex file.

## Hardware

### Interfacing ESP32 (Wi-Fi module) with MSP432

<p align="center">  <img src="/assets/img/8051_esp32.png" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

The Wi-Fi module ESP32 is interfaced with MSP432 via serial interface. The ESP32 module operates at 5V logic level, hence a logic level shifter that converts 3.3V output from the MSP432 pins into 5V is used to connect the Tx and Rx pins. UART2 of the MSP432 is used for the above interfacing. UART0 of ESP32 (Program port) is used to program the firmware of AT commands. UART1 of the ESP32 is used as the communication port.

### Interfacing 8051 with MSP432

<p align="center">  <img src="/assets/img/8051_8051_msp.png" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

The AT89C51RC2 is interfaced with MSP432 via UART protocol. The AT89C51RC2 module operates at 5V, hence a logic level shifter that converts 3.3V output from the MSP432 pins into 5V is used connect the Rx and Tx pins. UART3 of the MSP432 is used as the communication port.

### Interfacing LCD with MSP432

<p align="center">  <img src="/assets/img/8051_lcd.png" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

The LCD module is interfaced with MSP432 via GPIO. The LCD module can operate at 3.3V, hence a direct connection of the GPIO pins to the data and control lines of the LCD module is implemented. LCD is made to operate in 4-bit mode. This reduced the pin requirements

### Assembly

<p align="center"> <img src="/assets/img/8051_zero_pcb_final.jpg" style="width:70%; height: auto; max-width: 600px; object-fit:cover; border-radius:15px;"/> </p>

## Software

<p align="center"> <img src="/assets/img/8051_soft_arch.jpg" style="width:70%; height: auto; max-width: 600px; object-fit:cover; border-radius:15px;"/> </p>

For the development of software, the application code was written in C to be flashed on MSP432P401R. The following modules were used,

1. UART0 to display the debug information of MSP432,
2. UART2 to communicate with ESP32
3. UART3 to communicate with 8051.
4. GPIO Pins were used to enter the bootloader state of the 8051 and show status information of the program on the LCD Module.

The Software Design was built on the principles of non-blocking approach with ISR used for the UART. A command processor was implemented to handle the input stream and output stream of ESP32. The command processor has a look table capable of addition and deletion of AT commands as per the user requirements. The command processor also handled the input of hex files and filtering of the input for additional characters inserted to maintain data control flow.

### Programming 8051

<p align="center">  <img src="/assets/img/8051_bootloader_and_flash.svg" style="width:100%; height: auto; max-width: 500px; border-radius:30px; object-fit:cover;"/> </p>
The AT89C51RD2 Bootloader facilitates In-System Programming and In-Application Programming. In-System Programming allows the user to program or reprogram a microcontroller on-chip Flash memory without removing it from the system and without the need of a pre-programmed application. The UART bootloader can manage a communication with a host through the serial network. It can also access and perform requested operations on the on-chip Flash Memory.

In-Application Programming (IAP) allows the reprogramming of a microcontroller on-chip Flash memory without removing it from the system and while the embedded application is running. The UART bootloader contains some Application Programming Interface routines named API routines allowing IAP by using the user’s firmware.

For our application we have used In-System Programming to program the flash memory by configuring the microcontroller in bootloader mode.

<!-- <p align="center">  <svg src="/assets/img/cubit_flowchart.svg" style="max-width:100%; height: auto; border-radius:30px; object-fit:cover;"></svg> </p> -->

# Working

The software was successful in configuring, programming, and rebooting 8051 in-order to perform In-System Programming. All stages were displayed on the :CD as below

<p align="center">  <img src="/assets/img/8051_work_1.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_2.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_3.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_4.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_5.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_6.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_7.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_8.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_9.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>
<p align="center">  <img src="/assets/img/8051_work_10.jpg" style="width:100%; height: auto; max-width: 500px; border-radius:10px; object-fit:cover;"/> </p>

## Authors

- Rajat Chaple
- Dheeraj Bennadi
