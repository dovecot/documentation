.. _authentication-auth_settings:

===================
 Auth Settings
===================

See :ref:`authentication-authentication` for more details.

.. code-block:: none

   auth_mechanisms = plain login

Enables the ``PLAIN`` and ``LOGIN`` authentication mechanisms. The ``LOGIN`` mechanism is obsolete, but still used by old Outlooks and some Microsoft phones.

.. code-block:: none

   auth_verbose = yes

Log a line for each authentication attempt failure.

.. code-block:: none

   auth_verbose_passwords = sha1:6

Log the password hashed and truncated for failed authentication attempts. For example the SHA1 hash for ``pass`` is ``9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684`` but because of ``:6`` we only log ``9d4e1e``. 

This can be useful for detecting brute force authentication attempts without logging the users' actual passwords.

.. code-block:: none
   
   service anvil {
   unix_listener anvil-auth-penalty {
   mode = 0
   }
   }

Disable authentication penalty. This is explained in
:ref:`authentication-authentication_penalty`

.. code-block:: none

   auth_cache_size = 100M

Specifies the amount of memory used for authentication caching (passdb and userdb lookups).

.. code-block:: none

   imap_id_retain = yes

.. dovecotadded:: 2.2.29.1

If ``imap_id_retain=yes``, ``imap-login`` will send the IMAP ID string to auth process. The variable ``%{client_id}`` will expand to the IMAP ID in the auth process. The ID string is also sent to the next hop when proxying.

This allows passing the ID string to ``auth-policy`` requests

