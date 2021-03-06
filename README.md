
In-progress reverse engineering attempt of BioTek Precision pipetting robot communication protocol.

# Setup

```
npm install serialport
```

# Control pipetter

Currently only moving the three axes is implemented. Try:

```
./move.js <serial port device>
```

Note that `moveX` takes an absolute position while `moveY` and `moveZ` takes relative positions.


# Parse log files

The directory `captures/` contains a bunch of captured serial data. You can parse this and display the output using:

```
./parse.js <capture.LOG>
```

# Header line

The third byte of the first line is probably the command, where:

* CF: Test comms / ping
* E4: move axis
* E7: home axis
* E2: move pipette plunger

The four last bytes of the first line are probably two bytes for length of following message (little endian), then two bytes for checksum of following message.

Unknown:

* E2: Move pipette axis? used as second part of "remove tips" 
* DF: move Z axis fully down? used as first part of "remove tips" and "home all axes"
* CE: Used as second part of "home all axes". Has no data part
* E7: Specifies the axis. Used once for each axis in "move to center" 


## Checksum

It seems like the last byte of the checksum is the sum of all the header and data bytes (except for the checksum) divided by 256.

It seems like the first byte of the checksum is the remainder after the division.

# Data line

## move and home commands

First byte of second line is axis number.

* 01 for X
* 02 for Y
* 03 for Z

## move

The fourth and fifth bytes of the second line are little endian signed integer.

For Z axis the number is a relative position. Positive means go down. Negative means go up

For X axis the number is an absolute position. Positive means go right.

For Y axis the number is also a relative position. Positive means go forward (toward the user).


Move axis:

```
[axis 00 pos pos 00 8c 12 00 ed 8c 77 6b b9 37 ba 07 fe ff ff ff 58]
```

The question marks change depending on axis.

For all commands the following is static:

```
[?? ?? ?? ?? ?? ?? 12 00]
```
# Disclaimer

I have no affiliation with BioTek. _Precision_ is probably a trademark of BioTek but the USPTO trademark search gives 4303 results for that word and I didn't feel like looking through them all to check.

# Notes

[sent] <Buffer 01 02 e7 0b 01 01 00 14 00 f9 03>
[header] 0x01, 0x02, 0xe7, 0x0b, 0x01, 0x01, 0x00, 0x14, 0x00, 0xf9, 0x03
[sent] <Buffer 02 00 01 00 10 27 00 00 00 00 00 00 e8 03 00 00 25 dd c5 02>
               02 00 01 00 10 27 00 00 00 00 00 00 e8 03 00 00 25 dd c5 02

[ data ] 

[header] 0x01, 0x02, 0xe7, 0x0b, 0x01, 0x01, 0x00, 0x14, 0x00, 0xf8, 0x03
[ data ] 0x01, 0x00, 0x01, 0x00, 0x10, 0x27, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xe8, 0x03, 0x00, 0x00, 0x25, 0xdd, 0xc5, 0x02


Notes on 0xe2 aka moveToOrigin:

# byte 1

## 0x00

* X at origin (a bit right of leftmost detector)
* Y all the way up

## 0x01

* X at second detector
* Y all the way up

## 0x02

* X 2/3 to the right
* Y all the way up

## 0x03

* X at origin
* Y all the way down

## 0x04

* X at second detector
* Y all the way down

## 0x05

* X 2/3 to the right
* Y all the way down

## 0x06 and higher

* Crashes one or more axes by going too far

# byte 4: pipetter

* 0x01: up
* 0x02: down (and get rid of tips