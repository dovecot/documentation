.. _fscache:

=======
fscache
=======

.. code-block:: none

  obox {
    fs_driver = fscache
    fs_fscache_size = 2G
    fs_fscache_path = /var/cache/mails
    fs_parent {
      # ...
    }
  }
  # Or split users to multiple directories (4 x 512MB = 2 GB total):
  obox {
    fs_driver = fscache
    fs_fscache_size = 512M
    fs_fscache_path = /var/cache/mails/%4Nu
    fs_parent {
      # ...
    }
  }

All of the object storage Backends should be set up to use fscache with at
least some amount of disk space, otherwise some operations will be very
inefficient (such as IMAP client downloading a mail in small pieces).

The fscache is also ideally large enough that when a mail is delivered, any
IMAP and POP3 client that is actively downloading the mails should download it
from the cache. Ideally the mail objects would usually stay in the fscache for
several seconds during production load.

Other than that, the fscache doesn't usually need to be very large. It's more
useful to give the extra disk space to metacache
(:dovecot_core:ref:`mail_index_path` setting).

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

It is recommended to run ``doveadm fscache rescan`` command automatically
once in a while (e.g. hourly cronjob). This makes sure that if fscache's size
tracking is wrong for whatever reason, it will soon become fixed automatically.
The rescan is a fast operation and works correctly even if fscache is being
modified simultaneously.

Multiple fscache directories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It's possible to split fscaches over multiple independent directories by
including %variables in the path. This is typically done based on username
hashing, e.g. ``/var/fscache/%8Nu`` would use 8 fscache directories. This is
especially recommended with larger fscaches (>10 GB). The main benefit of
split fscaches is that any cache trashing caused by a few users will be
limited only to those users' fscaches.

For example if Dovecot is internally rebuilding caches for a single user, the
1 GB fscache could quickly be filled only with that one user's emails. But if
the fscache is slit over multiple directories, the other directories won't be
affected and may still contain useful cache for other users.

.. _fs-fscache:

fscache Settings
----------------

.. dovecot_plugin:setting:: fs_fscache_size
   :plugin: obox
   :values: @size
   :default: 0

   Size of the fscache.

.. dovecot_plugin:setting:: fs_fscache_path
   :plugin: obox
   :values: @string

   Path to the fscache.


Limitations
^^^^^^^^^^^

The fscache plugin relies on filesystem usage information to be consistent.
For example ZFS provides different information on block usage depending on
when the information is queried, making fscache not work.

.. dovecotchanged:: 2.3.20 ZFS support has been currently explicitly disabled.
