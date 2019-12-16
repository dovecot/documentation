.. _size:

======
Size
======

The size value type is used in Dovecot configuration to define the amount of
space taken by something, such as a file, cache or memory limit. The size value
type is case insensitive. The following suffixes can be used to define size:

- B = bytes
- K = kilobytes
- M = megabytes
- G = gigabytes
- T = terabytes

The values can optionally be followed by "I" or "IB". For example K = KI = KIB.
The size value type is base 2, meaning a kilobyte equals 1024 bytes.