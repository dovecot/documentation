.. _ip_addresses:

==============
IP Addresses
==============

The IP can be IPv4 address like ``127.0.0.1``, IPv6 address without brackets
like ``::1``, or with brackets like ``[::1]``. The DNS name is looked up once
during config parsing, e.g. ``host.example.com``. If a /block is specified,
then it's a CIDR address like ``1.2.3.0/24``. If a /block isn't specified, then
it defaults to all bits, i.e. /32 for IPv4 addresses and /128 for IPv6
addresses.
