---
layout: doc
title: Time Synchronization
dovecotlinks:
  time_synchronization: Time Synchronization
---

# Time Synchronization

Dovecot relies on accurate time on synchronization the local system.

There are two choices for synchronizing your clock:

1. Use [ntpd](https://www.ntp.org/). It periodically checks the
   current time from NTP server and slows down or speeds up the clock if
   necessary. Unlike ntpdate, it doesn't just move the time forwards or
   backwards (unless the difference is large).

   - If the time difference is too large for ntpd and it "steps", then
     use "-x" as a command line option for ntpd or use "tinker step 0"
     in `/etc/ntp.conf`.

     - This shows up in logs as: `ntpd[17697]: time reset -2.075483 s`

2. If ntpd doesn't work well (e.g. a bad network connection), you can
   use [clockspeed](https://cr.yp.to/clockspeed.html) or
   [chrony](https://chrony.tuxfamily.org/) as well.

In some systems ntpd/ntpdate is run at boot, but only after Dovecot has
started. That can cause Dovecot to die immediately. If you have this
problem, fix your init scripts to run ntpd/ntpdate first, before
starting Dovecot. Also, seriously consider running ntp-wait before
starting Dovecot.

## Server Startup Time Synchronization

With systemd add `time-sync.target` to the `After` setting. This isn't
enough though, because it only waits for time-sync to start, not finish.
To do that, enable also `systemd-time-wait-sync.service`.

## What about Daylight Saving/Summer Time?

On Unix-like systems, time is stored internally as the number of seconds
since January 1, 1970, 00:00:00 UTC
(see [UNIX time](https://en.wikipedia.org/wiki/Unix_time)); concepts
such as time zones and daylight saving time are applied in user space by the C
library, and will normally not have an impact on Dovecot's behavior.

## "But Dovecot Shouldn't Just Die!"

Dovecot's behavior when time moves backwards is:

- Existing imap and pop3 processes either sleep or die

- Master process stops creating new processes until either the original
  time is reached, or after a maximum wait of 3 minutes.

- Other processes log a warning, but do nothing else.

- Timeouts are updated so that the timeout is executed approximately at
  the original intended time.

Dovecot also notices when time unexpectedly jumps forwards. In that
situation it logs a warning and also updates timeouts.

The reason why imap/pop3 processes get killed and new ones can't be
created for a while is to avoid problems related to timestamps. Some
issues are:

- Uniqueness of Maildir filenames and dbox global unique identifiers
  relies on a growing timestamp.

- Dotlock files' staleness is detected by looking at its mtime.

- Timestamps are stored internally all around in memory (as well as in
  index files) and compared to current time. Those checks may or may
  not be buggy if current time shrinks.

While killing mail processes doesn't fully solve any of those issues,
they're at least less likely to happen then.
