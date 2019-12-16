.. _authentication-nodelay:

===================
Nodelay extra field
===================

If the authentication fails, Dovecot typically waits 0-2 seconds before sending
back the ``authentication failed`` reply. If this field is set, no such delay
is done. This is commonly used with :ref:`authentication-proxies` and :ref:`authentication-host`.

.. Note:: If :ref:`PAM <authentication-pam>` is used as the passdb, it adds an extra delay which can't be
          removed.
