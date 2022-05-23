---
layout: post
title: "Posture monitoring"
permalink: posture-monitoring
img: /assets/img/posture-monitoring-thumbnail.jpg
desc: BLE client monitors posture of a person using data from BLE server
---

Spring 2021 ECEN 5823

Course Project Report

**TABLE OF CONTENTS**

**1**

**Project Proposal**

Project Overview

3

1.1

1.2

1.3

3

High Level Requirements

High Level Design

3

5

1.3.1 Design Overview

5

1.3.2 Description of data types

1.3.3 Wireless communication details

1.3.4 Functional hardware block diagram

1.3.5 Functional software block diagram

1.3.6 Data flow

5

6

9

10

13

14

15

16

16

17

19

19

21

24

25

28

30

31

31

32

32

34

37

37

38

38

1.3.7 Division of Labor

1.3.8 User interface

1.4

1.5

1.6

**2**

Subsystem Summary

Test Plan

Proposed Schedule

**Update 1**

2.1

2.2

2.3

2.4

2.5

2.6

**3**

Status

Design changes

Challenges

Updates

Test Plan

Incorporate feedback from Project Proposal

**Update 2**

3.1

3.2

Status

Design changes

3.2.1 Part 1

3.2.2 Part 2

3.3

3.4

3.5

3.6

Challenges

Updates

Test Plan

Incorporate feedback from Update 1

1

**4**

**Section 4 - Final Report**

**39**

39

39

40

41

42

44

46

46

4.1

Status

4.1.1 Final Updated schedule

4.1.2 Requirements completion

4.1.3 Low Power performance

4.2

4.3

4.4

4.5

Updates

Test plan

Distribution of Work

What Was Learned

2

**Section 1 - Project Proposal**

**Student Names**

Rajat Chaple <Rajat.Chaple@colorado.edu>

Sundar Krishnakumar <Sundar.Krishnakumar@colorado.edu>

**1.1 Project Overview**

Section Author: Sundar Krishnakumar

For ECEN 5823 Course Project, we have chosen to implement Option 2 model where we propose to develop a

Posture detection and warning system. We plan to use Bluetooth LE (Bluetooth Smart) and the system

comprises a pair - a server and a client. The key element of the server will be the accelerometer + gyroscope

(IMU) sensor that will sense the axis and angular orientation periodically. The server also will allow the user to

set the period of bad posture (POBP) i.e. how long the user can be in a bad posture.

The client will receive via the BLE Radio the periodically sensed value and estimates the user’s posture. The

client will also monitor the time for which the user has been continuously sitting. This period will be

considered as an inactive period.

Overall, the system would detect if a person is hunching or slouching while sitting at work and alerts the user

after a user-defined period of bad posture (POBP). Prolonged hunching can cause human’s back, core, and

abdominal muscles to become strained and painful, reducing their blood supply. The user has to maintain a

healthy posture (like sitting upright). The system will also alert the user when he/she is inactive for a long

period of time. Sitting for prolonged periods of time can trigger undesirable metabolic state changes. The alert

reminds the user to do some physical movements like walking that will increase the level of physical activity.

**1.2 High Level Requirements**

Section Author: Sundar Krishnakumar

Major requirements:

\1. The system shall comprise a pair - a BLE server and a BLE client and both shall run on Blue Gecko

Board.

\2. The Blue Gecko acting as server shall host one IMU module - accelerometer + gyroscope (IMU) sensor

2.1. The accelerometer shall sense the axis orientation. At stationary condition it is expected to

measure the gravitational acceleration (9.8 m/s2 or 1000milliGs)

2.2. The gyroscope shall sense the angular orientation.

\3. The Blue Gecko server shall implement and advertise a custom GATT service.

3.1. The service shall have 2 characteristics - one for axis orientation and one for angular

orientation.

3.2. When measurement is complete, the server shall periodically send orientation values to the

client.

3

\4. The Blue Gecko server shall implement and advertise a second custom GATT service. - User controls.

4.1. The characteristic - Time Until Trigger (TUT) shall represent the threshold or limiting factor for

the period of bad posture (POBP) i.e. how long the user can be in a bad posture until receiving

an alert.

4.2. When a new value is set, the server shall send an update to the client.

\5. The server shall establish an encrypted link with the client gecko board via bonding.

\6. The server shall perform its operations and disconnect from the client and go to sleep until the start of

the next measurement cycle.

\7. The server code shall maintain the lowest possible energy mode(s) for this application.

\8. The client shall receive periodic orientation values from the server over the BLE radio.

8.1. Based on received values, the client shall estimate the user’s posture and decide if it is good or

a bad posture e.g. sitting upright or hunching.

\9. The client shall monitor the time of inactivity i.e. how long the user is continuously sitting without any

physical activity being carried out.

\10. After exceeding the inactivity period time limit, the client shall wait for a gesture from the user i.e. a

hand-waving gesture to reset the counter and to start monitoring again.

10.1. So, the period between two consecutive hand-waves shall be considered as the period of

inactivity.

10.2. This user-gesture shall be recorded and notified by a proximity sensor hosted by the client.

\11. The client shall display notification/alerts to the user

11.1. The client shall notify the user when sitting in a bad posture longer than allowed user-set

period of time i.e. when POBP exceeds the TUT threshold.

11.2. The client shall notify the user when inactive for a period which exceeds the inactivity period

time limit.

\12. Both server and client shall incorporate LCD display.

12.1. The server shall display the current connection status - Advertising/Connected/Bonded.

12.2. The server shall display the latest POBP time limit i.e. the Time Until Trigger (TUT) user setting.

12.3. The client shall display the current connection status - Discovering/ Connected/ Bonded/

Handling Indications.

12.4. The client shall display the user’s current posture status - Bad/healthy posture.

12.5. The client shall display the user's physical activity status - inactive or active.

Non-implemented requirements:

In the final finished product:

● The server and client shall operate as battery powered devices.

● A phone app shall be created and added part of the system for better user experience.

4

**1.3 High Level Design**

**1.3.1 Design Overview**

Section Author: Sundar Krishnakumar

The design consists of a pair of Blue Gecko Boards, one that hosts the server code and the other that hosts the

client code. The server will measure both axis orientation and angular orientation while also providing an

interface to the user that will let him/her set the Time until trigger (TUT). There will be corresponding GATT

characteristics with indication properties to indicate the client of these key values. The indications when

enabled are sent on a periodic basis.

The client will enable the server indications and receive periodic indications from the server over the BLE

radio. On receipt, the client will manipulate the data to estimate the amount of tilt from the Z-axis. This will

tell whether the user is slouching. The client will also be running timers to monitor the POBP and inactivity

level - POBP timer and inactivity timer. The POBP timer will reset when the user changes to a healthy sitting

posture. The inactivity timer resets on every hand-wave. The client uses the timer to notify prolonged periods

of inactivity to the user. A proximity sensor hosted by the client will sense the proximity at medium-high

frequency intervals while client records the user-gesture.

**1.3.2 Description of data types**

Section Author: Sundar Krishnakumar

**Measurement**

**Units**

**Data Type**

**Valid/Allowed Values**

**(Range)**

**Update Rate**

Axis orientation

milliG

uint16_t

uint16_t

uint16_t

+/-4000milliG

12.5 Hz (25 bytes/sec)

12.5 Hz (25 bytes/sec)

128 Hz (256 bytes/sec)

Angular orientation

Proximity/Distance

millirad/s

unitless

+/-35000 millirad/s

0-65535

**Table 1-1: Data Types**

The above table shows the units and data types that will be the final representation of the measured

quantities. While measurement these values will be raw readings and unitless.

Note: The proximity readings are unitless even in the final representation.

The accelerometer and gyroscope sample at a lower rate as the server will need a new value every 5s. But the

proximity sensor is sampled at a higher rate client that hosts it will need a new value every 200-500ms.

5

**1.3.3 Wireless communication details**

Section Author: Sundar Krishnakumar

**Figure 1-1: New GATT services**

The GATT server or the Server Gecko Board implements and advertises the 2 custom GATT services. Each

GATT service has 1 or more GATT characteristics. The above figure captures them. The server will be able to

send characteristic indications to the GATT client for the IMU service and user control service, provided the

client enables the indications for the advertised services. The indication interval is fixed and remains

unchanged throughout.

The tables 1-2a and 1-2b show the ID and UUID parameters and their lengths in bytes.

Inertial Measurement Unit Service_UUID

**Characteristic_ID**

accelerometer_state

gyroscope_state

**Length (Bytes)**

**Characteristic_UUID**

2 Axis orientation UUID

2 Angular orientation UUID

**Table 1-2a: Details of the new GATT services**

6

User control service UUID

**Characteristic_ID**

minutes

**Length (Bytes)**

**Characteristic_UUID**

1 Time until trigger UUID

**Table 1-2b: Details of the new GATT services**

**Figure1-2a: Client functionality**

7

**Figure1-2b: Client functionality**

The client functionality is a new feature and is shown in Figure1-2a,b. It runs an inactivity timer when the

board starts and it constantly looks for the gesture sensed by the proximity sensor to reset and start the timer

again. The client one receipt of periodic indications from the server, obtains new values: axis, angular

orientation and user controls. The client uses the axis orientation to estimate a sitting position. The angular

orientation value tells about the tilt. It does a sort of aggregation step to finally estimate the posture. The

Period of Bad Posture (POBP) timer functionality is unique. It runs only when the tilt is greater than the

allowed threshold. If the tilt is below the threshold it stops running. This is shown in Figure1-2c.

8

**Figure1-2c: Client functionality**

**1.3.4 Functional hardware block diagram**

Section Author: Sundar Krishnakumar

**Figure1-3: Hardware Block diagram**

The Figure1-3 shows the hardware block diagram of the two subsystems present namely: GATT server and

GATT client. A GPIO pin will be used to turn on/off the IMU sensor on the GATT server . Since the sampling

interval is every 5 seconds, this should be feasible. The I2C bus on the Blue Gecko Board will help write and

read to the IMU sensor. Push buttons based on interrupts will allow user control settings. The LCDs found on

both sides are part of the Blue Gecko Board.

The proximity sensor on the GATT client subsystem also works on I2C protocol. I2C messages are written and

read at a higher frequency than IMU sensors. Due to this, power control using a GPIO pin could be infeasible.

A timer - one of the MCU’s inbuilt peripheral timers (interrupt based) /software timer will be used to monitor

9

the period of bad posture. One of these timers will be used to monitor inactivity period as well. For alerts/

notifications, apart from LCD display, the on board LEDs are also put to use which would draw more attention

in case of an alert.

The hardware needed for major requirements are listed below:

**NO.**

**PART**

**QTY**

**LINK**

1

Adafruit Precision NXP 9-DOF Breakout Board - FXOS8700 +

FXAS21002

1

[Link](https://www.digikey.com/en/products/detail/adafruit-industries-llc/3463/7064490?s=N4IgjCBcoLQBxVAYygMwIYBsDOBTANCAPZQDa4ArAEwIC6AvvYVWSAMwAsAbGyA0A)

2

3

VCNL 4010 Proximity/Ambient light

1

1

[Link](https://www.adafruit.com/product/466)

[Link](https://www.sparkfun.com/products/14923)

Blue gecko board

**Table 1-4: List of Hardware**

**1.3.5 Functional software block diagram**

Section Author: Sundar Krishnakumar

One of the subsystems is GATT server. It involves the baseboard and the radio board and the sensors that are

added to it. The other subsystem - GATT client also relies on similar set of entities. Both will require the BLE

software stack and its APIs to establish the Bluetooth communication. Both will require drivers to sense the

state of the sensors. There will be software implementations for the user interface on both the server and the

client. The client will deal with estimations based on sensor data and a little advanced user interface involving

hand gestures. It also has to handle the timer logic for monitoring the period of bad posture and the inactivity

period.

Figures1-4a,b captures the software blocks of these subsystems. And Figures1-5a-c show the control flow in

these subsystems. That flow is not continuous but shown in pieces just to depict what all software

functionalities the subsystems have to perform.

10

**Figure1-4a: GATT server software block diagram**

**Figure1-4b: GATT client software block diagram**

11

**Figure1-5a: Software flow chart**

**Figure1-5b: Software flow chart**

12

**Figure1-5c: Software flow chart**

**1.3.6 Data flow**

Section Author: Rajat Chaple

Below is the data flow through the entire product. Sections are highlighted in order to explain data flow

through the sections.

13

**Figure1-6: Data flow diagram**

**1.3.7 Division of Labour**

Section Author: Rajat Chaple

Hardware components viz. Blue Gecko boards, Proximity Sensor, Accelerometer and Gyroscope are bought off

the shelf, hence design of these hardware components is limited just to interconnections. Development

related to functionality of this roughly contributes to 10 % of the project.

14

Majority (~90%) of efforts are in the software functionality. Right from functionality of connections, bonding

to sensor data analysis and alerts based on those are to be implemented in software. LCD updates and LED

indications also require software functionality.

**1.3.8 User interface**

Section Author: Sundar Krishnakumar

The GATT server will have limited UI functionality like LCD display and button press. The GATT client will

feature an advanced UI that will use the LCD display, LEDs and gesture based input with the aid of proximity

sensor. Their usage is individually discussed below.

GATT server:

LCD display: To display connection status, user control settings - The Time Until Trigger (TUT) in minutes.

Button PB0: To modify the TUT threshold.

Button PB1: TBD.

GATT client:

LCD Display: To display connection status, posture and inactivity alert.

LEDs: To display bad posture alert when POBP exceeds the TUT threshold, to display inactivity alert.

Button PB0-1: TBD.

Proximity sensor: Distance measure. So when the user waves the hand, the client senses the distance change

as a gesture.

The LCD display UI layout is shown in Figure1-7a,b below.

**Figure 1-7: LCD display UI layout**

DISPLAY_ROW_NAME: GATT server/GATT client

DISPLAY_ROW_CONNECTION (GATT server): Advertising/Connected/Bonded

DISPLAY_ROW_CONNECTION (GATT client): Discovering/Connected/Bonded

15

DISPLAY_ROW_TUT: Latest Time until trigger user setting in minutes.

DISPLAY_ROW_POSTURE: Good Posture/Bad Posture.

DISPLAY_ROW_INACTIVITY: Inactive or blank.

**1.4 Subsystem Summary**

Section Author: Sundar Krishnakumar

The project will consist of two subsystems in total and their names go by the role each subsystem is meant for

i.e. GATT server and GATT client. Both these subsystems are a combination of hardware and software. The

GATT server will implement low energy concepts. The GATT server will collect samples at a very low frequency

and report them to the GATT client. The GATT client will require these samples for posture estimation and

warning. The GATT client has a need for a more enhanced user interface. Hence a proximity sensor is put to

use and sampled for distance measurements at a high frequency. User gesture like hand-waving will serve as a

valid user input to the GATT client and the subsystem will perform an associated action. To recall these

subsystems in more depth and detail revisit subsection 1.3 High Level Design.

**1.5 Test Plan**

Section Author: Sundar Krishnakumar

We plan to test the individual components such as the driver, BLE connectivity, indications, and algorithms.

And after full integration we plan to run low power tests and full system functionality tests. At full

functionality level the system will be capable of performing all the major requirements thus satisfying the

project’s use cases. Shown below is that test plan for our course project.

**Test Plan Table**

**Test**

**Test Description**

**Planned**

**Actual**

**Test Result Notes**

**Number**

**complete complete (Pass/Fail/To**

**date**

**date**

**do)**

1

2

3

A test to check that the periodic 04/15/2021

accelerometer and gyroscope

sensor measurements are

TBD

To do

returning valid readings

A test to check that the high

frequency proximity sensor

measurements are returning

valid readings

04/15/2021

TBD

TBD

To do

To do

A test to check that the periodic 04/16/2021

accelerometer and gyroscope

characteristic indications are

sent to the client.

16

4

Button press test - A test to

check that the TUT

characteristics indications sent

to the client when the user sets a

new value.

A test to check that client's tilt

estimation is correct according

to the samples received from the

server.

04/16/2021

04/17/2021

TBD

To do

5

6

TBD

TBD

To do

To do

Proximity sensor test - A test to 07/18/2021

check that the client is able to

record gestures based on

samples measured.

7

8

A test to check that inactivity

timer is functional

07/18/2021

07/19/2021

TBD

TBD

To do

To do

LED and LCD display test - A

test to check that required

alerts/warnings are displayed for

corresponding events.

9

Low power energy management 07/25/2021

tests - To test power

consumptions using the energy

profiler.

TBD

TBD

To do

To do

10

Full system test - At full

functionality level that

07/25/2021

subsystems should be able to

perform posture detection,

inactivity level detection and

should send out appropriate

alerts to the user.

**Table 1-5: Test plan**

**1.6 Proposed Schedule**

Section Author: Rajat Chaple

**Task**

**Student(s) Responsible Target Completion Date**

**Expected Completion Date**

Subsystem Gatt server design

Sundar Krishnakumar

Sundar Krishnakumar

Apr 14, 2021

Apr 20, 2021

Subsystem Gatt server code

implementation

Subsystem Gatt client design

Rajat Chaple

Apr 14, 2021

17

Subsystem Gatt client code

implementation

Rajat Chaple

Apr 20, 2021

Apr 23, 2021

Subsystem Gatt server and Gatt Sundar and Rajat

client integrated into main system

Main system testing

Sundar and Rajat

Apr 25, 2021

Apr 25, 2021

Low power requirements testing Sundar and Rajat

**Table 1-6: Proposed schedule**

GitHub repository URL(s) = https://github.com/CU-ECEN-5823/ecen5823-courseproject-rajatchaple.git

18

**Section 2 - Update 1**

**2.1 Status**

Section Author: Rajat Chaple

We have procured all parts required for the project as on dates mentioned below. Interfacing these sensors

electrically with Blue Gecko board was easy as all the sensor modules have breakout boards and have circuitry

compatible with Blue Gecko board.

**NO.**

**PART**

**QTY**

**LINK**

**Delivery date**

1

Adafruit Precision NXP 9-DOF Breakout

Board - FXOS8700 + FXAS21002

1

[Link](https://www.digikey.com/en/products/detail/adafruit-industries-llc/3463/7064490?s=N4IgjCBcoLQBxVAYygMwIYBsDOBTANCAPZQDa4ArAEwIC6AvvYVWSAMwAsAbGyA0A)

Apr 9, 2021 to Sundar

2

3

VCNL 4010 Proximity/Ambient light

1

[Link](https://www.adafruit.com/product/466)

Apr 9, 2021 to Sundar

Apr 14, 2021 to Rajat

Blue gecko board (already available)

1

[Link](https://www.sparkfun.com/products/14923)

**Table 2-1: Hardware procurement**

Tasks for this week were designing a Gatt server and Gatt client prior to jumping on code implementation. We

are pretty much on schedule and have preliminary design ready for both clients and server implementation

(please refer to the update section for designs). In fact, we have started with sensors’ integration with Blue

Gecko boards both on the client and server side.

We also have significant progress on test designs and have completed designs for around 50% of the tests

listed in the test suite. These designs would help us write testing procedures for validating each module. While

going through the design phase, we came to know about certain changes required against what was proposed

earlier. These changes are explained below in the section Design changes.

19

Following is the updated schedule table.

**Task**

**Student(s)**

**Responsible**

**Target Completion Date**

**Expected**

**Completion Date**

Subsystem Gatt server design

Sundar Krishnakumar Apr 14, 2021

Apr 14, 2021

Subsystem Gatt server code

implementation

Sundar Krishnakumar Apr 20, 2021

Apr 20, 2021

Subsystem Gatt client design

Rajat Chaple

Apr 14, 2021

Apr 20, 2021

Apr 23, 2021

Apr 14, 2021

Apr 20, 2021

Subsystem Gatt client code

implementation

Rajat Chaple

Subsystem Gatt server and Gatt

client integrated into main system

Sundar and Rajat

Apr 23, 2021

Main system testing

Sundar and Rajat

Sundar and Rajat

Apr 25, 2021

Apr 25, 2021

Apr 25, 2021

Apr 25, 2021

Low power requirements testing

**Table 2-2: Updated schedule**

The plan for upcoming week is to translate these designs into software to achieve desired functionalities. We

will also be integrating server and client functionality into the main system by the end of next week.

We came across certain challenges while interfacing sensors considering both design and code

implementation (detailed in the Issues section of git repo linked below). We have identified solutions to these

problems and are nowhere impacting our project timeline.

With the progress so far, we see completion of this project adhering to the timeline.

20

**2.2 Design changes**

Section Author: Sundar Krishnakumar

One of the design changes we made was to the server’s GATT services - Inertial Measurement Unit Service,

User control service UUID. See table 2-3a,b.

Inertial Measurement Unit Service_UUID

**Characteristic_ID**

**Length (Bytes)**

**Characteristic_UUID**

y_axis_value

2 Axis orientation UUID

**Table 2-3a: Updated GATT services**

User control service UUID

**Characteristic_ID**

seconds

**Length (Bytes)**

**Characteristic_UUID**

1 Time until trigger UUID

**Table 2-3b: Updated GATT services**

The tilt calculation algorithms that we surveyed were complex, power consuming and CPU intensive

operations. So we plan to use accelerometers y-axis values as a measure of tilt. The first characteristic

indication sent to the client will be the “y_axis_value”, but the client will consider it as a reference value (say

tilt threshold) and use it for future comparisons to estimate the posture. During this calibration phase, the

user has to be in a healthy/upright sitting posture and show no movements. If the user moves, the gyroscope

sensor will detect it and the calibration phase will restart.

The conversion from raw values to milliG (accelerometer) and millirad/s (gyroscope) is also done on the server

side in this updated design. The updates concerning GATT services and the tilt measurement are graphically

shown below.

21

**Figure 2-1: Updated GATT services**

**Figure2-2: Updated client functionality. Original - Figure 1-2a**

22

**Figure2-3: Updated software flow chart. Original - Figure 1-5a**

One of the features of this project is detecting a user’s bad posture (like hunching) and alert him/her. Time

duration for which user is in bad posture is a criterion for generating an alert. There is a change in the way this

duration is measured

In the earlier proposal, POBP (Period of Bad Posture) was measured cumulatively. i.e., even if the user returns

to good posture, earlier value for POBP was retained and would be incremented if the user reenters bad

posture.

This method is now changed and POBP is now to be measured on that particular cycle. Whenever user gets

back to a good posture, POBP timer is reset.

23

**Figure2-4: Updated design for POBP functionality. Original 1-2c**

**2.3 Challenges**

Section Author: Sundar Krishnakumar

In this sprint, we came across a couple of issues while creating the driver library for the sensors - The initial

phase of code implementation following the design. While developing the library for FXOS + FXAS IMU sensor,

during the initialization procedure, the code got stuck in the middle of the state machine due to an issue that

was found by stepping through the state machine and by reading the I2C registers in the debug window by

placing breakpoints at appropriate points in the I2C interrupt handler. The issue was that when the reset

signal following the standby mode signal was sent to the FXAS gyroscope sensor, the slave sensor responded

with a NACK and not the expected ACK. It was actually the nature of the sensor to NACK the reset signal and

the developer has to handle it. One way to release the I2C bus would to clear way for the subsequent

transactions is to clear the NACK flag and emit a stop signal from the I2C master side (The Blue Gecko Board).

This method worked and is used in our library code.

24

**2.4 Updates**

Section Author: Rajat Chaple

Following are the state diagrams of the GATT client and the server.

Server:

**Figure2-5: GATT server state diagram**

25

Client:

**Figure2-6a: GATT client state diagram**

26

**Figure2-6b: GATT client state diagram**

27

**2.5 Test plan**

Section Author: Rajat Chaple

As mentioned in the status section following test designs contribute around 50% of the test suite. Testing

includes manual test procedures. Testing a sensor module requires manual intervention as sensor’s readings

are dependent upon external conditions.

In the following Test flowchart for proximity sensor, testing gestures is manual testing. Hand position (close to

center or away) would indicate gesture status on LED1. Ten iterations of this LED blink will conclude that

sensor is tested ok.

Remaining tests are automatic as shown in flowchart (Green and Orange sections below)

28

**Figure2-7a: Tests flow chart**

The validity of IMU sensor values was tested by adopting a manual testing scheme. The flow for this test is

shown below. The gyroscope is difficult to test as it records angular velocity. But as expected allowing the

board to lie stationary close to zero readings on the X,Y,Z axes. And it showed noticeable changes in values

during fast and slow rotations of the board. A similar manual testing scheme was adopted for PB0 button

29

press and TUT value indications were received on EFR connect app. (The app was used since client integration

is not fully complete.)

**Figure2-7b: Tests flow chart**

**2.6 Incorporate feedback from Project Proposal**

Section Author: Rajat Chaple

In Section 1 Proposal, the requirement 8 was missing the key term “indications”. We have added that and

updated it here.

\8. The client shall receive periodic characteristic indications - orientation values, from the server over the BLE

radio.

8.1 Based on received values, the client shall estimate the user’s posture and decide if it is good or a

bad posture e.g. sitting upright or hunching.

The Figures1-2a,b were missing labels on the arrow from and towards the BLE stack. Those arrows represent

characteristic indications. Figure 2-8a,b captures that below.

30

**Figure2-8a: Client functionality**

**Figure2-8b: Client functionality**

GitHub repository URL(s) = https://github.com/CU-ECEN-5823/ecen5823-courseproject-rajatchaple.git

31

**Section 3 - Update 2**

**3.1 Status**

Section Author: Sundar Krishnakumar

The goal for this week was to complete all the code implementation elements on both the GATT server and

client side and integration elements. We fell behind by one day, but we progressed and completed the GATT

server and client integration into the main system element, on time. Our project is on schedule.

We plan to finish remaining tasks as early as possible and get ready for the project demo. We expect some

amount of buffer time that will allow us to handle any potential issues that might show up during main system

testing and low power requirements testing.

**Task**

**Student(s)**

**Target Completion Date**

**Expected**

**Responsible**

**Completion Date**

Subsystem Gatt server design

Sundar Krishnakumar Apr 14, 2021

Apr 14, 2021

Subsystem Gatt server code

implementation

Sundar Krishnakumar Apr 20, 2021

Apr 21, 2021

Subsystem Gatt client design

Rajat Chaple

Apr 14, 2021

Apr 20, 2021

Apr 23, 2021

Apr 14, 2021

Apr 21, 2021

Subsystem Gatt client code

implementation

Rajat Chaple

Subsystem Gatt server and Gatt

client integrated into main system

Sundar and Rajat

Apr 23, 2021

Main system testing

Sundar and Rajat

Sundar and Rajat

Apr 25, 2021

Apr 25, 2021

Apr 25, 2021

Apr 25, 2021

Low power requirements testing

**Table 3-1: Updated schedule**

**3.2 Design changes**

**3.2.1 Part 1**

Section Author: Sundar Krishnakumar

**Bond disconnect power management technique:**

Figure 2-5 shows a state machine where the GATT server bonds and then disconnects after indications are

sent. We were able to achieve this power management technique; however, time taken from the start of

advertising & discovery till the point when client enables indications is around 3-4s for our system. Our current

32

LETIMER0 underflow interrupt is set at 3s i.e. Y-axis value indications are sent to the GATT client every 3s -

indication interval. For this setting the bond disconnect feature does not work well due to the bound timing

requirements but works fine for an indication interval of 10-15s.

The 3s indication interval is a good choice for our system so we cannot employ bond disconnect feature. But

we plan to characterize the performance in terms of power management for both 3s without bond disconnect

and 10-15s with bond disconnect technique later during our low power requirements testing.

With the bond and disconnect feature we were able to make the GATT server subsystem sleep in EM3 energy

mode. But without it, the GATT server can sleep only in EM2 mode as BLE radio will not work in EM3 energy

mode.

The modified GATT server state machine is shown below. The bond disconnect feature will be still in our

system but will be shown as an optional component by running at 10-15s indication interval.

**Figure 3-1: Updated GATT server state diagram**

33

We did a very minor change in the LCD display on the GATT client side. In the row where it displays the

connection status - DISPLAY_ROW_CONNECTION, it will transition from Discovering-> Connected-> Bonded->

Handling Indications (added). We also did some minor updates in the display UI layout.

**Figure 3-2: Updated LCD display UI layout**

**3.2.2 Part 2**

Section Author: Rajat Chaple

**Interrupt based proximity sensor:**

There is a change in how proximity sensor is to be utilized. With the earlier design client had to poll proximity

sensor every 200-500 milliseconds to detect a gesture. However, it was identified that this VCNL4010 can

interrupt when its value goes above (high) or below (low) the preset threshold. Here, High Threshold is used

to detect a gesture.

This changed a dataflow of the system as below

34

**Figure 3-3: Updated data flow diagram**

35

State diagram of BLE client is changed to incorporate changes made in usage of proximity sensor (from polling

to interrupt based).

**Figure 3-4: Updated GATT client state diagram**

36

**3.3 Challenges**

Section Author: Rajat Chaple

We did not face any major challenges during this sprint.

**3.4 Updates**

Section Author: Rajat Chaple

**Connection Diagram:**

For this project we are using Blue Geckos EFR32BG, Proximity sensor VCNL4010, Adafruit Precision NXP 9 DOF

(FXOS8700 + FXAS21002). Following is the connection diagram for hardware setup. USB is for powering the

boards and for debugging purposes.

**Figure 3-5a: Connection diagram**

Proximity sensor communicates over I2C. I2C0 of Blue gecko is used for this purpose and accordingly PC10 and

PC11 pins are configured. PF4 and PF5 pins are configured to control LED0 and LED1 respectively. PD10 is

configured for GPIO interrupt connected to INT pin of proximity sensor.

37

**Figure 3-5b: Connection diagram**

IMU sensor communicates over I2C. I2C0 of Blue gecko is used for this purpose and accordingly PC10 and

PC11 pins are configured. PF4 and PF5 pins are configured to control LED0 and LED1 respectively. PF6 is

configured as GPIO input to use PB0 as a switch.

**3.5 Test plan**

Section Author: Sundar Krishnakumar

Measured cumulatively, 80% of the total test plan was completed at the end of this sprint. We majorly

employed manual testing with human intervention this time as well to test the functionality and to make sure

it aligns with the requirements.

We will be left with 2 more tests - Full system test, Low power energy management tests. Full system test will

require test and verification of all the major requirements. In Low power energy requirements testing, we will

enable all the power management techniques that we employed and document the characteristics based on

results from Simplicity Studio Energy Profiler application and AEM hardware on the Blue gecko board.

**3.6 Incorporate feedback from Update 1**

Section Author: Sundar Krishnakumar

For code management #ifdef based code separation for GATT client and server was done. This change for code

management was incorporated after the feedback given by the TA during stand-ups.

GitHub repository URL(s) = https://github.com/CU-ECEN-5823/ecen5823-courseproject-rajatchaple.git

38

**Section 4 - Final Report**

**4.1 Status**

**4.1.1 Final Updated schedule**

Section Author: Rajat Chaple

For this week, tasks were to carry out main system testing and low power requirement testing. Though we did

not meet target completion date planned at the project start, we adhered to the timeline with anticipated

completion date. We had our project almost functional a week prior to this i.e., by April 23rd.

Following is the updated and the final schedule which represents project planning and execution timeline

throughout the project.

**Task**

**Student(s)**

**Responsible**

**Target Completion Date**

**Expected Completion**

**Date**

Subsystem Gatt server design

Sundar

Krishnakumar

Apr 14, 2021

Apr 20, 2021

Apr 14, 2021

Subsystem Gatt server code

implementation

Sundar

Krishnakumar

Apr 21, 2021

Subsystem Gatt client design

Rajat Chaple

Apr 14, 2021

Apr 20, 2021

Apr 23, 2021

Apr 14, 2021

Apr 21, 2021

Apr 23, 2021

Subsystem Gatt client code

implementation

Rajat Chaple

Subsystem Gatt server and Gatt

client integrated into main system

Sundar and Rajat

Main system testing

Sundar and Rajat

Sundar and Rajat

Apr 25, 2021

Apr 25, 2021

Apr 27, 2021

Apr 28, 2021

Low power requirements testing

**Table 4-1: Updated schedule**

39

**4.1.2 Requirements completion**

Section Author: Rajat Chaple

Requirements: We had proposed following requirements at the time of the project proposal. Only one of the

following 12 requirements was not met as the system did not allow it to fulfill this requirement. Details about

the same are mentioned below this table:

**S.N.**

**Requirements proposed**

**Status**

✔

1

The system shall comprise a pair - a BLE server and a BLE client (Blue Gecko STKs)

✔

✔

✔

2

3

4

The Blue Gecko acting as server shall host one IMU module.

The Blue Gecko server shall implement and advertise a custom GATT service .

The Blue Gecko server shall implement and advertise a second custom GATT service. -

User controls.

✔

5

6

The server shall establish an encrypted link with the client gecko board via bonding.

The server shall perform its operations and disconnect from the client and go to sleep until

the start of the next measurement cycle.

❌

✔

✔

✔

✔

7

8

The server code shall maintain the lowest possible energy mode(s) for this application.

The client shall receive periodic orientation values from the server over the BLE radio.

The client shall monitor the time of inactivity.

9

10

After exceeding the inactivity period time limit, the client shall wait for a gesture from the

user

✔

✔

11

12

The client shall display Bad Posture and Inactivity alerts to the user

Both server and client shall incorporate LCD display to show connections, timers and alerts.

**Table 4-2: Requirements checklist**

40

Requirement 6 - The server first connects, bonds, finishes its works, disconnects and goes to sleep until the

start of next cycle - Ultra low power mode. This mode needs the indication interval to be set at 10 to 15s as

bonding and enabling characteristic indications steps take significant time . For a quicker response to all the

events, our system prefers an interval equal 3-5s. In the current system, the server device does not disconnect

unless there is a connection failure but it does sleep in the lowest energy mode possible - EM2. Reason: In

higher energy mode numbers (i.e. EM3 or EM4) the BLE radio does not work.

Note: In order for the I2C subsystem to work, EM1 is required. So the server sleeps in EM1 when I2C is in use.

Still 3s interval is a good choice. But after low power energy mgmt. tests we found 5s to be the best setting.

**4.1.3 Low Power performance**

Section Author: Sundar Krishnakumar

We used the Silicon Lab’s Energy Profiler to characterize the low power performance of the GATT server sub-

system. A BLE server device is similar to a low power node in BT mesh and must be energy efficient.

The following energy management technique are employed in the server code -

\1. GPIO based power management (sensor enable, disable). That is done on the IMU sensor to send it to

standby mode.

\2. TX power management based on measured RSSI value.

\3. The server also sleeps in the lowest energy mode possible (EM2) when idle.

At 3s indication interval we achieved an average current per period of 692uA. But at 5s indication interval it

was 496uA.

**Figure 4-1: Average current per period**

41

For this current consumption, an operation time of 8 hrs 21 mins is possible on a 3000 mAh battery. But if we

had worked little more on finding the optimal connection timing parameters we would have achieved a better

average current value.

**4.2 Updates**

Section Author: Rajat Chaple

Two major features of this project were Posture detection and Inactivity monitoring with appropriate timeouts

and alerts. It required following implementations to be completed to achieve this functionality.

•

•

•

•

•

•

•

•

Establishing an encrypted link between client and the server.

Sending posture data(IMU readings) from server to client on a regular interval

Sending timeout setting of bad posture from server to client

Estimating a posture status Good/Bad on client side

Implementing Inactivity Timeout functionality

Implementing hand gesture sensing functionality at client using proximity sensor

Configuring LEDs, switch and LCDs for user interface.

Server maintains lowest possible energy mode to enable its battery powered operability.

All of the listed implementation led us through working prototype of this Work-life Health Assist project

For client’s unique implementation

The above implementation list indicates that it is the client's job to gather sensor’s data and monitor the

current status of the user. Client then extracts meaning out of this data and displays alerts when certain

conditions are met. Flowcharts for the features are as shown below…

42

**Figure 4-2: Features of the client**

Apart from this, the client also controls LCD and LEDs to show current status of the system.

43

**4.3 Test Plan**

Section Author: Sundar Krishnakumar

We completed 100% of the tests by this sprint. Following table shows the tests, their statues and description.

**Test Plan Table**

**Test**

**Number**

**Test Description**

**Planned**

**complete**

**date**

**Actual**

**complete**

**date**

**Test Result**

**(Pass/Fail/To**

**do)**

**Notes**

1

A test to check that the

periodic accelerometer and

gyroscope sensor

measurements are returning

valid readings

04/15/2021 4/16/2021

Pass

In all orientations, the

milliG value was matching

the data sheet values and

was consistent too. To be

consistent and be less

noisy we figured how to

set the low noise mode in

FXOS accelerometer

sensor.

2

3

4

A test to check that the high

frequency proximity sensor

measurements are returning

valid readings

A test to check that the

periodic accelerometer

characteristic indications are

sent to the client.

Button press test - A test to

check that the TUT

characteristics indications sent

to the client when user sets a

new value.

04/15/2021 4/16/2021

04/16/2021 4/16/2021

04/16/2021 4/16/2021

Pass

Pass

Pass

Manual testing was

performed to check

validity of range of values.

Accelerometer indications

were checked on the EFR

connect phone app.

This test was also carried

out by connecting GATT

server to the EFR connect

app.

5

5

A test to check that client's tilt

~~estimation is correct according~~

~~to the samples received from~~

the server.

A test to check if client is able

to finish the calibration phase

and start accepting

subsequent readings. Client

should compare the readings

with the reference tilt threshold

value and estimate posture

correctly.

04/17/2021

Added

Removed

04/23/2021

Pass

For manual testing

performed, Client

correctly set the reference

value and also accepted

readings after that. These

new readings were

correctly compared with

reference readings to give

posture estimation.

6

Proximity sensor test - A test

to check that client is able to

record gesture based on

samples measured.

07/18/2021 4/16/2021

Pass

Manual testing was

carried by to detect hand

gesture. It showed values

between different ranges

according to presence or

44

absence of hand near

proximity sensor.

7

8

9

A test to check that inactivity

timer is functional

07/18/2021 04/22/2021

07/19/2021 04/22/2021

07/25/2021 04/28/2021

Pass

Pass

Pass

With the preset inactivity

timer, timer counted down

to 0 and changed its state

to INACTIVE. It correctly

changed its state to

ACTIVE along with

resetting a timer whenever

it detected a hand gesture

The test verified that

appropriate connection

states, alerts/warnings

and timers were shown on

the LCD. LEDs also

showed Alert/Warning

status for respective

features.

Once code refining for low

power performance was

done we were able to

verify that the server was

working in uA magnitude

of average current-496uA.

One key learning from this

test - BLE connection

timing parameters

LED and LCD display test - A

test to check that required

alerts/warnings are displayed

for corresponding events.

Low power energy

management tests - To test

power consumptions using the

energy profiler.

significantly affects the

energy consumption of

the device. But this timing

configuration has to be

done properly in order to

avoid supervision

timeouts.

10

Full system test - At full

functionality level that

07/25/2021 04/27/2021

Pass

Full system was tested

with multiple trials by

setting up the entire

subsystems should be able to

perform posture detection,

inactivity level detection and

should send out appropriate

alerts to the user.

system. System

successfully performed

posture detection and

also monitored

inactivity/activity with the

help of hand gestures

over proximity sensor

**Table 4-3: Updated test plan**

45

**4.4 Distribution of Work**

Section Author: Sundar Krishnakumar

Right from the first week, both of us had a very detailed understanding of the requirements of this project.

These requirements acted as good guidelines and gave us a measure of work done and work to be done at

every sprint. We were equally involved in troubleshooting the bugs and handling challenges and this made

sure that both of us got the experience of working through the problems we dealt with. We couldn’t make out

a clear work-split percentage based on the number of sections written by each of us, but the overall per

person contribution was equal.

The table below shows file ownership details. Note that even though one team member worked on the GATT

server code and other worked on the GATT client code, the amount of work and complexity was the same for

each team member.

**File name**

**Code section**

**Owner**

GATT client code

GATT server code

GATT client code

GATT server code

GATT client code

GATT server code

GATT client code

GATT server code

GATT client code

GATT server code

GATT client code

GATT server code

GATT client code

GATT client code

GATT server code

GATT client code

Rajat Chaple

ble.c/.h

Sundar Krishakumar

Rajat Chaple

gpio.c/.h

Sundar Krishakumar

Rajat Chaple

i2c.c/.h

imu.c/.h

Sundar Krishakumar

Rajat Chaple

irq.c/.h

Sundar Krishakumar

Rajat Chaple

main.c/.h

Sundar Krishakumar

Rajat Chaple

oscillator.c/.h

proximity.c/.h

scheduler.c/.h

Sundar Krishakumar

Rajat Chaple

Rajat Chaple

Sundar Krishakumar

Rajat Chaple

timers.c/.h

GATT server code

Sundar Krishakumar

**Table 4-4: File ownership details**

**4.5 What Was Learned**

Section Author: Rajat Chaple and Sundar Krishnakumar

**Rajat Chaple:**

**One** key thing I learned during this project is deciding the scope of the project and its timeline. This is quite

critical when you work in teams. Dividing tasks appropriately helps in smooth execution of the project. **Second**

thing I learned is debugging software when you do not have many resources. This is when I was debugging the

46

I2C protocol for communicating with the sensor. Logic analyzer would have been handy to debug this but

following the right debug approach resolved this issue quickly. The **third** learning for me was how you perform

documentation for the project and how you represent your project. I am sure this is a really important thing

when you are out in industry. There would be situations where the project needs to be transferred to your

peers. These documentations make this transfer easy. Also, how you represent your project would convince

your stakeholders.

**Sundar Krishnakumar:**

**One** key learning is that I must be finding out what should go into the system as regards to algorithms, data

types, test plans, etc at an early phase of the project instead of doing changes at every sprint. Changes are

expensive especially when done at a later part of the project development. I also learnt how to manage Github

in a multi-person team. **Secondly** I learnt the rule of writing a proper project schedule and test plan. This made

me more clearly about what I have to do and how I have to do it. Moreover writing a definition of done made

me understand when I must stop and call a section done. **Thirdly,** I learned how writing initial requirements

would help me stay within the plan and scope of the project. In industry the input for requirements would

come from the clients, shareholders, etc and in order to satisfy the customer we got to meet those

requirements. But primarily they should be written down without any ambiguity in the language. Debugging

the issues we came across in this project was a challenge. Another challenge was setting up and running the

IMU sensor on the server device. It was a long procedure and involved a lot of configurations.

GitHub repository URL(s) = https://github.com/CU-ECEN-5823/ecen5823-courseproject-rajatchaple.git

47
