.. _errors_time_moved_backwards:

==========================
Time moved backwards error
==========================

Dovecot isn't very forgiving if your system's time moves backwards.
There are usually two possibilities why it's moving backwards:

1. You're running ``ntpdate`` periodically. This isn't a good idea.

2. You're using some kind of a virtual server and you haven't configured
   it right (or it's buggy).

Moving time backwards might cause various problems (see below), so
Dovecot versions older than v2.0 don't even try to handle the situation.

Time synchronization
^^^^^^^^^^^^^^^^^^^^

There are two choices for synchronizing your clock:

1. Use `ntpd <http://www.ntp.org/>`_. It periodically checks the
   current time from NTP server and slows down or speeds up the clock if
   necessary. Unlike ntpdate, it doesn't just move the time forwards or
   backwards (unless the difference is large).

   -  If the time difference is too large for ntpd and it "steps", then
      use "-x" as a command line option for ntpd or use "tinker step 0"
      in ``/etc/ntp.conf``.

      -  This shows up in logs as:
         ``ntpd[17697]: time reset -2.075483 s``

2. If ntpd doesn't work well (e.g. a bad network connection), you can
   use `clockspeed <http://cr.yp.to/clockspeed.html>`_ or
   `chrony <https://chrony.tuxfamily.org/>`_ as well.

In some systems ntpd/ntpdate is run at boot, but only after Dovecot has
started. That can cause Dovecot to die immediately. If you have this
problem, fix your init scripts to run ntpd/ntpdate first, before
starting Dovecot. Also, seriously consider running ntp-wait before
starting Dovecot.

Bugs/Issues
^^^^^^^^^^^

-  With Xen you should run ntpd only in dom0. Other domains should
   synchronize time automatically (see `this Xen
   FAQ <https://wiki.xenproject.org/wiki/Xen_Common_Problems>`_ and `this
   thread <http://dovecot.org/list/dovecot/2009-October/043301.html>`_).

-  With VMware you follow the guidelines at the `VMware knowledge
   base <http://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1006427>`_.

-  `Time moved backwards by 4398
   seconds <http://www.dovecot.org/list/dovecot/2008-June/031548.html>`_?
   Buggy kernel/hardware.

What about Daylight Saving/Summer time?
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

On Unix-like systems, time is stored internally as the number of seconds
since January 1, 1970, 00:00:00 UTC (see `Unix_time on
Wikipedia <http://www.wikipedia.com/wiki.phtml?title=Unix_time#>`_); concepts
such as time zones and daylight saving time are applied in user space by the C
library, and will normally not have an impact on Dovecot's behavior.

Dovecot shouldn't just die!
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Dovecot v2.0 finally tries to handle this a bit more gracefully. Its
behavior when time moves backwards is:

-  Existing imap and pop3 processes either sleep or die, just like with
   older versions

-  Master process stops creating new processes until either the original
   time is reached, or after a maximum wait of 3 minutes.

-  Other processes log a warning, but do nothing else.

-  Timeouts are updated so that the timeout is executed approximately at
   the original intended time.

Dovecot v2.0 also notices when time unexpectedly jumps forwards. In that
situation it logs a warning and also updates timeouts.

The reason why imap/pop3 processes get killed and new ones can't be
created for a while is to avoid problems related to timestamps. Some
issues are:

-  Uniqueness of Maildir filenames and dbox global unique identifiers
   relies on a growing timestamp.

-  Dotlock files' staleness is detected by looking at its mtime.

-  Timestamps are stored internally all around in memory (as well as in
   index files) and compared to current time. Those checks may or may
   not be buggy if current time shrinks.

While killing mail processes doesn't fully solve any of those issues,
they're at least less likely to happen then.
