.. _os_configuration:

======================
OS Configuration
======================

The default Linux configurations are usually quite good. The only things needed
to check are:

* ``/proc/sys/fs/inotify/max_user_watches``and ``max_user_instances`` need to
  be large enough to handle all the IDLEing IMAP processes.

  The default Dovecot-EE init script already attempts to set these values
  automatically.

.. code-block:: none

  fs.inotify.max_user_instances = 65535
  fs.inotify.max_user_watches = 65535

* In order to reduce I/O on the backends, it is recommended to disable the ext4
  journal:

.. code-block:: none

  tune2fs -O ^has_journal /dev/vdb
  e2fsck -f /dev/vdb

* Dovecot doesn't require atimes, so you can mount the filesystem with noatime

.. code-block:: none

  mount -o defaults,discard,noatime /dev/vdb /metacache

* Disable journaling on ext4 volume ssd drive including setting discard,
  noatime, nodiratime (centos 7)

.. code-block:: none

  [oxuser@vmback2 ~]$ sudo umount /metacache
  [sudo] password for oxuser:

  [oxuser@vmback2 ~]$ sudo tune2fs -O ^has_journal /dev/sdc1
  tune2fs 1.42.9 (28-Dec-2013)

  [oxuser@vmback2 ~]$ sudo fsck.ext4 -f /dev/sdc1
  e2fsck 1.42.9 (28-Dec-2013)
  Pass 1: Checking inodes, blocks, and sizes
  Pass 2: Checking directory structure
  Pass 3: Checking directory connectivity
  Pass 4: Checking reference counts
  Pass 5: Checking group summary information
  /dev/sdc1: 11/16777216 files (0.0% non-contiguous), 1068533/67108608 blocks

  [oxuser@vmback2 ~]$ sudo tune2fs -o discard /dev/sdc1
  tune2fs 1.42.9 (28-Dec-2013)

  [oxuser@vmback2 ~]$ sudo dumpe2fs /dev/sdc1 | grep discard
  dumpe2fs 1.42.9 (28-Dec-2013)
  Default mount options:    user_xattr acl discard

  [oxuser@vmback2 ~]$ sudo blkid /dev/sdc1
  /dev/sdc1: UUID="5d20d432-3152-4ccf-98e3-94e7500cfd40" TYPE="ext4"

  [oxuser@vmback2 ~]$ sudo vi /etc/fstab
  UUID=5d20d432-3152-4ccf-98e3-94e7500cfd40   /metacache      ext4    defaults,noatime,nodiratime     0 0
  [oxuser@vmback2 ~]$ sudo mount /metacache

  [oxuser@vmback2 ~]$ sudo mount | grep metacache
  /dev/sdc1 on /metacache type ext4 (rw,noatime,nodiratime,seclabel)

* To further reduce iops on the metacache volume when using ``zlib`` or
  ``mail_crypt``; point the dovecot temp directory to a tmpfs volume: 

.. code-block:: none

  mail_temp_dir = /dev/shm/

* All the servers' hostnames must be unique. This is relied on in many
  different places.
* Make sure the servers are running ntpd or some other method of synchronizing
  clocks. The clocks shouldn't differ more than 1 second. 

The time must never go backwards - this is especially important in Dovecot
backends when using Cassandra, because otherwise ``DELETEs`` or ``UPDATEs`` may
be ignored when the query timestamp is older than the previous
``INSERT/UPDATE``.

* With busy servers Dovecot might run out of TCP ports. It may be useful to
  increase ``net.ipv4.ip_local_port_range``.

.. code-block:: none

   net.ipv4.ip_local_port_range = 1024 65500

TIME-WAIT Connections
^^^^^^^^^^^^^^^^^^^^^^

https://vincent.bernat.ch/en/blog/2014-tcp-time-wait-state-linux explains these pretty well. Summary:

* ``net.ipv4.tcp_tw_reuse=1`` can help to avoid "Cannot assign requested address" errors for outgoing connections and is rather safe to set. It only affects outgoing connections.

* ``net.ipv4.tcp_tw_recycle=1`` can help with incoming connections also inside a private network (not in public-facing proxies), but it's still not recommended. 
   In ``Linux 4.10`` and later it's broken, and in ``Linux 4.12`` it's been removed entirely.


.. _os_configuration_dns_lookups:

Domain Name System lookups
^^^^^^^^^^^^^^^^^^^^^^^^^^^

In some configurations, in particular with :ref:`obox_settings`, Dovecot nodes need to do frequent Domain Name System (DNS) lookups. It is recommended that the underlying platform provides either a performant DNS service or deploys a local DNS cache on the Dovecot nodes.

Software that is known to work in this regard is `PowerDNS <https://www.powerdns.com/>`_  for a performant service and `nscd <https://www.gnu.org/software/libc/libc.html>`_  for local caching.

In environments where reaching a particular packets per second (PPS) rate for DNS or all packets combined, can lead to harsh throttling, it is recommended to select a locally caching option, such as nscd. The same applies to certain virtualized environments, where the layer between virtual machine and hypervizor can drop packets under high load, leading to DNS timeouts. Additionally, at the time of writing Amazon AWS instances are known to react adversely when an undocumented PPS rate is reached.

Not recommended
^^^^^^^^^^^^^^^^

Adjusting TCP buffer sizes is also usually a bad idea, unless your kernel is very
old and you have good knowledge of the types of TCP traffic (number of connections,
bandwidth consumed, activity patterns etc) you will have.

