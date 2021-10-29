.. _howto-chasquid_and_dovecot_sasl:

#########################
Chasquid and Dovecot SASL
#########################

`chasquid <https://blitiri.com.ar/p/chasquid>`_ users can use Dovecot
:ref:`sasl` instead of Cyrus SASL for authenticating SMTP clients.

This is supported from version 0.04 and later, and uses the ``PLAIN``
mechanism only.

Configuration Example
---------------------

``dovecot.conf``:

.. code-block:: none

  auth_mechanisms = plain login

  service auth {
    ...
    # If chasquid is running under a different user, adjust the 'user ='
    # lines accordingly.
    unix_listener auth-chasquid-userdb {
      mode = 0660
      user = chasquid
    }
    unix_listener auth-chasquid-client {
      mode = 0660
      user = chasquid
    }
    ...
  }

Add to ``/etc/chasquid/chasquid.conf``:

.. code-block:: none

  dovecot_auth: true

That should be it, because chasquid will "autodetect" the full path to the
Dovecot sockets, by looking in the usual places (tested in Debian, Ubuntu, and
CentOS).

If chasquid can't find them, the paths can be set with the
``dovecot_userdb_path`` and ``dovecot_client_path`` options (see the
chasquid configuration manual page for details).

Additional Information
----------------------

* chasquid's `Dovecot integration documentation <https://blitiri.com.ar/p/chasquid/docs/dovecot/>`_
* chasquid's `How-to <https://blitiri.com.ar/p/chasquid/docs/howto/>`_
* chasquid's `Dovecot library source code <https://blitiri.com.ar/git/r/chasquid/b/master/t/internal/dovecot/f=dovecot.go.html>`_
