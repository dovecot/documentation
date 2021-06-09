.. _howto-chasquid_and_dovecot_sasl:

=========================
chasquid and Dovecot SASL
=========================

`chasquid <https://blitiri.com.ar/p/chasquid>`__ users can use Dovecot
SASL authenticating SMTP clients.

This is supported from version 0.04 and later, and uses the *PLAIN*
mechanism (only).

conf.d/10-master.conf
---------------------

The following needs to be added to the Dovecot configuration, usually in
*/etc/dovecot/conf.d/10-master.conf*:

::

   service auth {
     unix_listener auth-chasquid-userdb {
       mode = 0660
       user = chasquid
     }
     unix_listener auth-chasquid-client {
       mode = 0660
       user = chasquid
     }
   }

If chasquid is running under a different user, adjust the *user =* lines
accordingly.

chasquid.conf
-------------

Add the following line to */etc/chasquid/chasquid.conf*:

::

   dovecot_auth: true

That should be it, because chasquid will "autodetect" the full path to
the dovecot sockets, by looking in the usual places (tested in Debian,
Ubuntu, and CentOS).

If chasquid can't find them, the paths can be set with the
*dovecot_userdb_path* and *dovecot_client_path* options (see the
`chasquid.conf(5) manpage <https://manpages.debian.org/unstable/chasquid/chasquid.conf.5.en.html>`__
for some more details).

More information
----------------

For more information, you can check:

-  chasquid's `dovecot
   integration <https://blitiri.com.ar/p/chasquid/docs/dovecot/>`__
   documentation.

-  chasquid's
   `how-to <https://blitiri.com.ar/p/chasquid/docs/howto/>`__.

-  chasquid's `dovecot library source
   code <https://blitiri.com.ar/git/r/chasquid/b/master/t/internal/dovecot/f=dovecot.go.html>`__.
