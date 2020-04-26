
In-progress reverse engineering attempt of BioTek Precision pipetting robot communication protocol.

# Usage

```
node ./script.js <capture.LOG>
```

This will output the filename, then the checksum from the packet header and then the calculated checksum.

# Header line

The third byte of the first line is probably the command, where:

* E4: move axis
* E7: home axis
* DF: move Z axis fully down? used as first part of "remove tips" command
* E2: move pipette plunger

The four last bytes of the first line are probably two bytes for length of following message (little endian), then two bytes for checksum of following message.

## Checksum

It seems like the last byte of the checksum is the sum of all the header and data bytes (except for the checksum) divided by 255.

It seems like the first byte of the checksum is the remainder after the division with the second byte of the checksum subtracted.

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


# Disclaimer

I have no affiliation with BioTek. _Precision_ is probably a trademark of BioTek but the USPTO trademark search gives 4303 results for that word and I didn't feel like looking through them all to check.
