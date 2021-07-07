.. _nfs:

###
NFS
###

Dovecot is commonly used with NFS. However, Dovecot does **not** support
accessing the same user simultaneously by different servers. That will
result in more or less severe mailbox corruption. Note that this applies
to all mailbox access, including mail delivery.

* Use :ref:`Dovecot director <dovecot_director>` for clustering.
* Use :ref:`lmtp_server` for mail deliveries.
* Set :ref:`setting-mmap_disable` = ``yes``
* Set :ref:`setting-mail_fsync` = ``always``
* Do **not** set :ref:`setting-mail_nfs_index` or
  :ref:`setting-mail_nfs_storage` (i.e. keep them as ``no``)
* Do **not** use the ``quota-status`` service.
* Unmounted NFS mount point directory should not be writable to Dovecot
  mail processes (i.e. often the ``vmail`` user). Otherwise if the NFS
  isn't mounted for some reason and user access mails, a new empty user
  mail directory is created, which breaks things.

NFS mount options
=================

* ``nordirplus``: Disable readdirplus operations, which aren't needed by
  Dovecot. They can also slow down some NFS servers.

* ``root_squash``: Dovecot doesn't care about this. Typically Dovecot doesn't
  store any root-owned files in NFS.

* ``nolock``: This is possible to use either if ``lock_method=dotlock`` is
  used, or as a slightly unsafe optimization (see below).

Optimizations
=============

Potential optimizations to use:

* mdbox format is likely more efficient to use than the sdbox format. The
  downside is that it requires running periodic ``doveadm purge`` for each
  user. This commands should be run via the doveadm directors so they are run
  in the proper backends.
* Use ``mail_location = ...:VOLATILEDIR=/dev/shm/dovecot/%2.256Nu/%u`` to
  store some temporary files (e.g. lock files) in tmpfs rather than NFS.
* Use ``mail_location = ...:LISTINDEX=/dev/shm/dovecot/%2.256Nu/%u/dovecot.list.index``
  to store mailbox list indexes in tmpfs rather than NFS. This makes moving
  the users between backends more expensive though. It also needs a way to
  delete the list indexes for users that have already moved to different
  backends.
* Use ``mail_location = ...:INDEX=/fast/%2.256Nu/%u:ITERINDEX`` to use
  "smaller fast storage" for index files and "larger slow storage" for mail
  files. The ``ITERINDEX`` is used to list mailboxes via the fast index
  storage rather than the slow mail storage.
* Use ``mail_location = ...:ALT=/slow/%2.256Nu/%u:NOALTCHECK`` to use
  "smaller fast storage" for new mails and "larger slow storage" for old
  mails. The ``doveadm altmove`` command needs to be run periodically. The
  ``NOALTCHECK`` disables a sanity check to make sure alt storage path doesn't
  unexpectedly change.
* Slightly unsafe: Use ``nolock`` mount option to keep all locking within the
  server. Assuming director works perfectly, there is no need to use locking
  across NFS. Each user only locks their own files, and the user should only
  be accessed by a single server at a time. Unfortunately, this doesn't work
  100% of the time so in some rare situations the same user can become
  accessed by multiple servers simultaneously. In those situations the mails
  are more likely to become corrupted if ``nolock`` is used.

Clock synchronization
=====================

Run ntpd in the NFS server and all the NFS clients to make sure their
clocks are synchronized. If the clocks are more than one second apart
from each others and multiple computers access the same mailbox
simultaneously, you may get errors.

Clustering without director
===========================

Some people are using Dovecot in a cluster without the director service.
Below are some suggestions for improving the reliability of this
configuration.

.. warning:: This method is almost guaranteed to give random errors and can
             potentially lose emails.

* Configure load balancer so that connections from the same source IP are
  redirected to the same Dovecot server. This way a single client using
  multiple IMAP connections doesn't immediately cause problems.

* Set :ref:`setting-mail_nfs_index` = ``yes`` and
  :ref:`setting-mail_nfs_storage` = ``yes``. These will attempt to flush the NFS
  caches at appropriate times. However, it doesn't work perfectly.

    * Disabling NFS attribute cache helps a lot in getting rid of caching
      related errors, but this makes performance MUCH worse and increases
      the load on NFS server. This can usually be done by giving ``actimeo=0``
      or ``noac`` mount option.

* Make sure NFS lockd works properly. If it doesn't, use
  :ref:`setting-lock_method` = ``dotlock``. However, this degrades performance.

* Use Maildir mailbox format instead of sdbox/mdbox. Maildir is much more
  resistant to corruption.

    * Deliver mails in a way that it doesn't update Dovecot index files.
      Either don't use Dovecot LDA/LMTP, or configure it to use in-memory
      index files::

          protocol lda {
            mail_location = maildir:~/Maildir:INDEX=MEMORY
          }

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
`LDA <https://wiki2.dovecot.org/LDA#>`_ (i.e. dovecot-uidlist file
or index files shouldn't get updated). It shouldn't be a problem with
mboxes either as long as you're using fcntl locking. This problem can be
fully solved by using LMTP protocol to deliver the mails to the correct
server (possibly using Dovecot's LMTP proxy).

NFS clients
===========

Here's a list of kernels that have been tried as NFS clients:

-  `FreeBSD has a caching
   bug <http://www.freebsd.org/cgi/query-pr.cgi?pr=123755>`_ which
   causes problems when mailbox is being accessed from different
   computers at the same time

-  Linux 2.6.16: ``utime()`` is buggy, `fix in
   here <http://client.linux-nfs.org/Linux-2.6.x/2.6.16/linux-2.6.16-007-fix_setattr_clobber.dif>`_.
   With the fix applied, utime() seems to work perfectly. High-volume
   systems may experience VFS lock sync issues and for these the
   complete patchset at
   http://www.linux-nfs.org/Linux-2.6.x/2.6.16/linux-2.6.16-NFS_ALL.dif
   is suggested and appears to work well in production.

-  Linux 2.6.18: Seems to have intermittent caching issues. The same
   .config with 2.6.20.1 has been tested and appears to work well.

-  Linux 2.4.8: Has caching problems, don't know if they can be solved

-  Solaris: If it's completely broken, see
   http://dovecot.org/list/dovecot/2006-December/018145.html

-  The Connectathon test suite is very useful to verify a healthy NFS
   setup, see http://www.connectathon.org/nfstests.html

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
   HOWTO <http://iki.fi/tss/nfs-coding-howto.html>`_

-  Use such permissions for the unmounted mount point root directory
   that Dovecot can't create files under it. Otherwise if the NFS server
   isn't mounted for any reason and user access mails, a new empty user
   mail directory is created, which breaks things.
