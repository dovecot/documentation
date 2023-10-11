.. _sieve_managesieve-client_issues:

ManageSieve Client Issues
=========================

Although this ManageSieve server should comply with the :rfc:`5804`
specification of the ManageSieve protocol, quite a few clients don't.
This page lists the known client problems.

The TLS problem
---------------

The core of the TLS problem is that a ManageSieve server is required
to send an unsolicited CAPABILITY response right after successful TLS
negotiation. Older Cyrus servers did not do this and many clients
incorporated this protocol error as the standard, meaning that these
do not expect the CAPABILITY response and thus fail with subsequent
commands. However, now that Cyrus' Timsieved has changed its
behaviour towards protocol compliance, all those clients will follow
eventually. The following clients are known to have this TLS issue:

Thunderbird Sieve add-on
   TLS broken for old versions. Starting with version 0.1.5 the
   Thunderbird Sieve add-on properly supports TLS.

KMail + kio_sieve
   TLS broken for old versions. This issue is fixed at least in kmail
   1.9.9 / kde 3.5.9.

SquirrelMail/AvelSieve
   For some users the Avelsieve client stores scripts but fails to
   retrieve them later. This problem is directly caused by
   AvelSieve's TLS support. A quick way to fix this is not to enable
   TLS for ManageSieve. AvelSieve stable (v1.0.1) does not have TLS
   support at all, so you will see this happen only with the
   development or SVN versions. Another issue is that (at least with
   avelsieve-1.9.7) it is impossible to delete the last rule of a
   script. For avelsieve-1.9.7 you find a patch that fixes these two
   issues `here <http://pigeonhole.dovecot.org/client-patches/avelsieve-1.9.7-dovecot.patch>`__.

Smartsieve, Websieve
--------------------

These clients are specifically written for Cyrus timsieved and fail
on multiple stages of the protocol when connected to Pigeonhole
ManageSieve. See:

 - https://sourceforge.net/projects/websieve/
 - https://github.com/secnextechnologies/WebSieve
 - https://smartsieve.sourceforge.net/


Ruby/Managesieve
----------------

Ruby command line client and library to managesieve works fine.
See https://rubygems.org/gems/ruby-managesieve/versions/0.4.0

Ruby/Sieve-Parser
-----------------

Ruby library for sieve parsing, see https://rubygems.org/gems/sieve-parser/versions/0.0.4

.. note::

   If you add new issues to this list, notify the author or send
   an e-mail to the `Dovecot mailing
   list <https://www.dovecot.org/mailing-lists/>`__. In any case, you must
   make sure that the issue is properly explained and that the author can
   contact you for more information.
