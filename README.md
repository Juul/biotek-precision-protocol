
In-progress reverse engineering attempt of BioTek Precision pipetting robot communication protocol.

# Re-calculate checksums

The `calc.js` script will parse the first command present in a log file and re-calculate the checksum.

```
./calc.js <capture.LOG>
```

This will output the filename, then the checksum from the packet header and then the calculated checksum.

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

