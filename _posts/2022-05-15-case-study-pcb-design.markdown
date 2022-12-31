---
layout: post
title: "PCB design practices"
permalink: case-study-pcb-design
img: /assets/img/pcb-design-practices.jpg
desc: PCB design techniques to eliminate noises such as crosstalk, ground bounce
---

<p align="center"> <img src="/assets/img/design_practices.jpg" style="width:70%; height: auto; max-width: 600px;object-fit:cover; border-radius:15px;"/> </p>

The purpose of this experiment was to study good and bad layout practices.

This project contains following implementations:

<!-- {:.gsd-table}
| Sr. No. | Features |
| --------- | ------------------------------------ |
| Feature 1 | Orientation detection and indication |
| Feature 2 | Low power operation | -->

1. Converting 5 V in to 3.3 V using LDO
2. Creating a clock signal of about 500 Hz and about 66% duty cycle
3. Driving four of the inputs of two hex inverters and use it to demonstrate good layout and bad layout
4. Adding a switch to selectively connect the 555 output to the various inputs of the good and bad layout hex inverters. When not connected, all the switching inputs to be tied HIGH so they do not switch.
5. Using red LEDs and about 50 ohm resistors as the load to three of the switching outputs of each hex inverter
6. Estimating the current expected to be drawn from the inverter for the LED and 50 ohm resistor load.
7. Connecting the output of the fourth switching inverter to a test point to act as a trigger for the scope
8. Setting up one output of each hex inverter as a quiet HIGH and one output as a quiet LOW
9. Engineering the layout on one side of the board with best design practices and the other side of the board with bad layout practices. In the bad layout, Decoupling capacitor to be moved away, remaining circuit would be identical to good layout.
10. There would be test points for:

- The scope trigger output
- The quiet high
- The quiet low
- The 555 output signal
- The 3.3. V rail on the board
- The 5 V rail on the board

## What it means to work:

### Power supply:

1. Check visually if LED for power is turned on
2. Measure the voltage of power rail on oscilloscope using 5V test point. Voltage should be around 5V.
3. Measure the voltage of power rail on oscilloscope using 3V3 test point. Voltage should be around 3.3V.

### 555 timer circuit:

1. Square wave should be visible on the oscilloscope when probed at 555 output test point.
2. Duty cycle of the square wave should be around 67%

### Hex Inverter:

1. Inverted signal should be seen on one of the hex inverter outputs

## Schematic

- Schematic was divided into functional sections: power conditioning, Timer circuit and Inverter Bad and Good Layouts.
- PowerTrace class was used to set 20 mils of power lines in layout
- Appropriate isolation switches, LEDs and test points were used at required locations.

<p align="center">  <img src="/assets/img/design_practices_sch.svg" style="width:80%; height: auto; max-width: 1000px;object-fit:cover;"/> </p>

## Board layout

- Appropriate design rules were set before starting the layout. E.g. via diameter, Thermal relief.
- Name, board ID was used as board identification

<p align="center">  <img src="/assets/img/design__practices_layout.svg" style="width:70%; height: auto; max-width: 800px;object-fit:cover;"/> </p>

## Assembled board

- Board was powered ON using 5v adapter
- In bad design layout, longer trace was used for the decoupling capacitor to keep it away from the IC. Also, continuous return plane was not used for bad layout.

<p align="center">  <img src="/assets/img/design_practices_assembled.svg" style="width:70%; height: auto; max-width: 800px;object-fit:cover;"/> </p>

## What you actually measured to verify your board “worked”

In order to verify that board is working, following tests were considered.

1. Q_hi outputs on good and bad layouts

<p align="center">  <img src="/assets/img/design_practices_good_bad.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

- Noise on Q-Hi pin on good layout is around 80mV. Whereas, it is around 1V on bad layout

* The measure contributing factor for this difference is
* Proximity of decoupling capacitor
* Continuous return plane
* Ideally the position of decoupling capacitor should be closest to the IC.

2. Switching noise on power rail

<p align="center">  <img src="/assets/img/design_practices_sw_noise_pwr_rail.svg" style="width:70%; height: auto; max-width: 600px;object-fit:cover;"/> </p>

- Synchronous switching noise on 5v power rail is about 20mV and that about 3.3v power rail is 13mV.
- Power rail noise can be reduced by using decoupling capacitor in the close proximity of the IC.

## This board was built to understand Good and Bad design practices. Following things were done right during this process,

- Continuous return plane for Good layout
- Decoupling capacitor in the close proximity of the IC in the good layout
- 6 mil trace for signals and 20 mil trace for powerlines
- Isolation switches used to isolate the power supply and 555 timer.
- Labels for the test points, components and board ID (name and description) text would be included in future designs as well
- Test points at appropriate points to measure important signals.

## Authors

- Rajat Chaple
