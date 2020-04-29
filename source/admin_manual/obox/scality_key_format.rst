.. _scality_key_format:

===================
Scality Key Format
===================

Scality key format (160 bits):

.. code-block:: none

   152 bits     Entropy
   4 bits       Class
   4 bits       Replica

Dovecot generated key:

.. code-block:: none

   120 bits         MD5 part prefix 
                    md5(timestamp + process id + hostname)

   8 bits           Scality Service ID (= 0x83)

   8 bits           MD5 part suffix

   8 bits           Object Type: 
                     0x00 = Unknown 
                     0x01 = Message 
                     0x02 = FTS index 
                     0x03 = FTS index (as of 2.2.27.2) 
                     0x08-0x0e = Indexes

   8 bits           Unused (0x00)

   4 bits           Class ID (configurable)

   4 bits           Replica ID (0x00)
