.. _fscache:

=============
fscache
=============

.. code-block:: none

  plugin {
    obox_fs = fscache:1G:/var/cache/mails:…
  }


All of the object storage Backends should be set up to use fscache with at
least some amount of disk space, otherwise some operations will be very
inefficient (such as IMAP client downloading a mail in small pieces).

The fscache is also ideally large enough that when a mail is delivered, any
IMAP and POP3 client that is actively downloading the mails should download it
from the cache. Ideally the mail objects would usually stay in the fscache for
several seconds during production load.

Other than that, the fscache doesn't usually need to be very large. It's more
useful to give the extra disk space to metacache (``obox_fs`` setting).

.. Note::

  If fscache sees cache write failures (e.g. out of disk space) those will
  cause ``client-visible`` errors. The disk space usage also isn't strictly
  enforced due to race conditions, so if you set fscache limit to 1 GB it may
  temporarily grow above it. So make sure that the fscache always has some
  extra disk space available for writing (e.g. a 1 GB fscache mounted on a 2 GB
  mount point).

If users access a lot of large mails, the fscache may become full too early.
Without any limits it's even possible for a single mail to exceed the total
fscache size. This has happened when a user has attempted to attach a huge
attachment and the email client stores it into Drafts or Sent folder. The
plugin ``{ quota_max_mail_size }`` setting can be used to reduce the effects of
this problem. In any case there are currently no guarantees that fscache
couldn't be overflowed if many clients are accessing many large mails at
exactly the same time. This is also why the fscache filesystem should be much
larger than the fscache size limit.

Many of our customers are running the doveadm fscache rescan command in a
cronjob every hour (or even more often). This makes sure that if fscache is
wrong for whatever reason, it will soon become fixed automatically.

Caching Efficiency
^^^^^^^^^^^^^^^^^^^

A series of tests were performed to compare performance with and without the
fscache, as well as with the metacache optimizations.

The results show that enabling the fscache results in a 14% reduction in
storage operations.

The metacache optimizations produce a further reduction of 11%, resulting in a
total savings of 25%.

With FTS enabled, the fts fscache reduces the storage operations by 35%.

In all of these tests, Cassandra was used because this was against a Scality
backend.  In a non-Scality environment, my expectation would be that the
fscache and metacache produce even larger gains due to the relative increase in
the volume of storage accesses.

Possible Optimization
^^^^^^^^^^^^^^^^^^^^^^

It may be a good idea to replace the single global fscache with multiple
fscaches.

For example: include a %16Nu in the fscache path, so you'll get 16 fscaches in
total. The main benefit would be in case there are a few users who are rapidly
reading through a lot of mails which would quickly replace all the mails in a
global fscache.

But with 16 fscaches they could be trashing only a small percentage of them.
This kind of splitting is especially useful if a huge fscache (>10 GB) is being
used.
