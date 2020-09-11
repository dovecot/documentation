.. _nfs:

###
NFS
###

NFS is commonly used in one of these ways:

1. Dovecot is run in a single computer.

2. Dovecot is run in multiple computers, users are redirected more or
   less randomly to different computers.

3. Dovecot is run in multiple computers, each user is assigned a
   specific computer which is used whenever possible.


.. note::

   The only way to reliably implement the 2nd setup is with :ref:`director <dovecot_director>` service.

Dovecot configuration
=====================

Single Dovecot server setup or :ref:`Dovecot director <dovecot_director>` cluster setup:

::

   mmap_disable = yes
   #dotlock_use_excl = no # only needed with NFSv2, NFSv3+ supports O_EXCL and it's faster
   mail_fsync = always
   mail_nfs_storage = no
   mail_nfs_index = no

Multi-server setup that **tries** to flush NFS caches (increases NFS
operations, and **isn't fully reliable**), try not to use this:

::

   mmap_disable = yes
   #dotlock_use_excl = no # only needed with NFSv2, NFSv3+ supports O_EXCL and it's faster
   mail_fsync = always
   # These settings slow things down and don't fully work, use director proxy instead:
   mail_nfs_storage = yes
   mail_nfs_index = yes

Common issues
=============

Clock synchronization
~~~~~~~~~~~~~~~~~~~~~

Run ntpd in the NFS server and all the NFS clients to make sure their
clocks are synchronized. If the clocks are more than one second apart
from each others and multiple computers access the same mailbox
simultaneously, you may get errors.

NFS caching problems
~~~~~~~~~~~~~~~~~~~~

NFS caching is a big problem when multiple computers are accessing the
same mailbox simultaneously. The best fix for this is to prevent it from
happening. Configure your setup so that a user always gets redirected to
the same server (unless it's down). This also means that mail deliveries
must be done by the same server, or alternatively it shouldn't update
index files.

Dovecot flushes NFS caches when needed if you set
:ref:`mail_nfs_storage=yes <setting-mail_nfs_storage>`, but unfortunately this doesn't work 100%, so
you can get random errors.

Disabling NFS attribute cache helps a lot in getting rid of caching
related errors, but this makes the performance MUCH worse and increases
the load on NFS server. This can usually be done by giving ``actimeo=0``
or ``noac`` mount option.

Index files
~~~~~~~~~~~

If you keep the index files stored on NFS, you'll need to set
:ref:`mmap_disable=yes <setting-mmap_disable>`. If you're not running lockd you'll have to set
:ref:`lock_method=dotlock <setting-lock_method>`, but this degrades performance. Note that some
NFS installations have problems with lockd. If you're beginning to get
all kinds of locking related errors, try if the problems go away with
dotlocking.

With mbox/Maildir formats (but not dbox!) it's also possible to store
index files on local disk instead of on NFS. If the user gets redirected
to different servers, the local indexes are automatically
created/updated. If the user is (nearly) always redirected to the same
server this should be fine and you would likely get higher performance
than indexes stored on NFS, but if the server changes it can be slow to
recreate the index/cache files.

Single computer setup
---------------------

This doesn't really differ from keeping mails stored locally. For better
performance you should keep index files stored in a local disk.

Random redirects to multiple servers
------------------------------------

You should avoid this setup whenever possible. Besides the NFS cache
problems described above, mailbox contents can't be cached as well in
the memory either. This is more problematic with mbox than with maildir,
but in both cases if a client is redirected to a different server when
reconnecting, the new server will have to read some data via the NFS
into memory, while the original server might have had the data already
cached.

If you choose to use this setup, at the very least try to make
connections from a single IP redirected into the same server. This
avoids the biggest problems with clients that use multiple connections.

Per-user redirects to multiple servers
--------------------------------------

This method performs a lot better than random redirects. It maximizes
the caching possibilities and prevents the problems caused by
simultaneous mailbox access.

New mail deliveries are often still handled by different computers. This
isn't a problem with maildir as long as you're not using
`LDA <https://wiki2.dovecot.org/LDA#>`__ (i.e. dovecot-uidlist file
or index files shouldn't get updated). It shouldn't be a problem with
mboxes either as long as you're using fcntl locking. This problem can be
fully solved by using LMTP protocol to deliver the mails to the correct
server (possibly using Dovecot's LMTP proxy).

NFS clients
===========

Here's a list of kernels that have been tried as NFS clients:

-  `FreeBSD has a caching
   bug <http://www.freebsd.org/cgi/query-pr.cgi?pr=123755>`__ which
   causes problems when mailbox is being accessed from different
   computers at the same time

-  Linux 2.6.16: ``utime()`` is buggy, `fix in
   here <http://client.linux-nfs.org/Linux-2.6.x/2.6.16/linux-2.6.16-007-fix_setattr_clobber.dif>`__.
   With the fix applied, utime() seems to work perfectly. High-volume
   systems may experience VFS lock sync issues and for these the
   complete patchset at
   ` <http://www.linux-nfs.org/Linux-2.6.x/2.6.16/linux-2.6.16-NFS_ALL.dif>`__
   is suggested and appears to work well in production.

-  Linux 2.6.18: Seems to have intermittent caching issues. The same
   .config with 2.6.20.1 has been tested and appears to work well.

-  Linux 2.4.8: Has caching problems, don't know if they can be solved

-  Solaris: If it's completely broken, see
   ` <http://dovecot.org/list/dovecot/2006-December/018145.html>`__

-  The Connectathon test suite is very useful to verify a healthy NFS
   setup, see ` <http://www.connectathon.org/nfstests.html>`__

Misc notes
==========

-  readdirplus isn't really needed by Dovecot and it can slow down some
   NFS servers. Use "nordirplus" mount option to disable it.

-  Dovecot doesn't care about root_squash setting, all the root-owned
   files are in /var/run typically which is not in NFS

-  In an environment using Debian (2.6.18) clients with Isilon NFS
   cluster nodes - the following mount options were found to be the most
   successful:
   ``rsize=32768,wsize=32768,hard,fg,lock,nfsvers=3,tcp,retrans=0,nordirplus  0 0``

-  To learn more about NFS caching and other issues, mostly from a
   programmer's point of view, see `NFS Coding
   HOWTO <http://iki.fi/tss/nfs-coding-howto.html>`__

-  Use such permissions for the unmounted mount point root directory
   that Dovecot can't create files under it. Otherwise if the NFS server
   isn't mounted for any reason and user access mails, a new empty user
   mail directory is created, which breaks things.
