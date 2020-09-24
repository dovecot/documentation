.. _lmtp_server:

===========
LMTP Server
===========

LMTP uses the same settings as LDA ( See :ref:`common_configuration`), as specified in ``conf.d/15-lda.conf`` in example configuration. There is also a bit of extra configuration in ``conf.d/20-lmtp.conf``. The main difference is that the LDA is a short-running process, started as a binary from command line, while LMTP is a long-running process started by Dovecot's master process.

Envelope Addresses
==================

Compared to dovecot-lda parameters, the addresses are taken from:

* ``-f /`` Envelope sender address: This is the MAIL FROM: value from LMTP session.
* ``-r /`` Final envelope recipient address: This is the RCPT TO: value from LMTP session.
* ``-a /`` Original envelope recipient address: This defaults to same as RCPT TO: value, but may be overridden by reading it from a header specified by ``lda_original_recipient_header`` setting.
* ``-d /`` Destination username: This is the same as RCPT TO: value, but with the ``+extension`` part removed when ``recipient_delimiter`` setting is set. If usernames differ from recipient email addresses, the userdb must handle the translation.

Listeners
=========

You can configure LMTP to be listening on TCP or UNIX sockets:

.. code-block:: none

   # add lmtp to protocols, otherwise its listeners are ignored
   protocols = imap pop3 lmtp

   service lmtp {
      inet_listener lmtp {
         address = 192.168.0.24 127.0.0.1 ::1
         port = 24
      }

      unix_listener lmtp {
         #mode = 0666
      }
   }

The UNIX listener on ``$base_dir/lmtp`` is enabled by default when protocols setting contains lmtp.

Security
========
Unfortunately LMTP process currently needs to run as root, and only temporarily drop privileges to users. Otherwise it couldn't handle mail deliveries to more than a single user with different UID. If you're using only a single global UID/GID, you can improve security by running lmtp processes as that user:

.. code-block:: none

   service lmtp {
      user = vmail
   }

LMTP Proxying
=============

It's possible to use Dovecot LMTP server as a proxy to remote LMTP or SMTP servers. The configuration is similar to :ref:`IMAP/POP3 proxying <authentication-proxies>` , but you'll need to tell Dovecot LMTP to issue passdb lookups:

.. parsed-literal::

   :ref:`lmtp_proxy <setting-lmtp_proxy>` = yes

Performance
===========

For higher volume sites, it may be desirable to increase the number of active listener processes. A range of 5 to 20 is probably good for most sites:

.. code-block:: none

   service lmtp {
      process_min_avail = 5
   }

Logging
=======

If you want to store LMTP delivery logs to a different file, you can do it with:

.. code-block:: none

   service lmtp {
      executable = lmtp -L
   }
   protocol lmtp {
      info_log_path = /var/log/dovecot-lmtp.log
   }

For rawlogs, please see :ref:`debugging_rawlog`

Plugins
=======

* Most of the `Dovecot plugins <https://wiki.dovecot.org/Plugins>`_ work with LMTP.

* Virtual quota can be enforced using :ref:`Quota plugin <quota>`.

   * :ref:`lmtp_rcpt_check_quota <setting-lmtp_rcpt_check_quota>` ``= yes`` enables quota checking already at RCPT TO stage. This check isn't done for proxied connections.

* Sieve language support can be added with the :ref:`Pigeonhole Sieve plugin <sieve>`.

Address extension delivery
==========================

To make address extension work with LMTP you must check these variables are set

* :ref:`lmtp_save_to_detail_mailbox <setting-lmtp_save_to_detail_mailbox>` ``= yes``
* :ref:`recipient_delimiter <setting-recipient_delimiter>` ``= +``

Using LMTP with different MTAs
==============================

* `Postfix <https://wiki.dovecot.org/HowTo/PostfixDovecotLMTP>`_

* `Exim <https://wiki.dovecot.org/LMTP/Exim>`_

* `HALON <https://wiki.halon.io/LMTP>`_


.. seealso:: :ref:`common_configuration`
