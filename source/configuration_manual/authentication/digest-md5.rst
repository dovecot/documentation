.. _authentication-digestmd5:

==========
Digest-MD5
==========

Digest-MD5 has two things that make it special and which can cause
problems:

-  Instead of using user@domain usernames, it supports **realms**.
-  User name and realm are part of the MD5 hash that's used for
   authentication.

For these and other reasons `Digest-MD5 has been
obsoleted <https://www.ietf.org/rfc/rfc6331.html>`_ by
`SCRAM <https://www.ietf.org/rfc/rfc5802.html>`_.

Realms
^^^^^^

Realms are an integral part of Digest-MD5. You will need to specify
realms you want to advertise to the client in the config file:

.. code-block:: none

   auth_realms = example.com another.example.com foo

The realms don't have to be domains. All listed realms are presented to
the client and it can select to use one of them. Some clients always use
the first realm. Some clients use your domain name, whenever given more
than one realm to choose from. Even if this was NOT one of the choices
you provided (KMail, others?). In both cases the user never sees the
advertised realms.

.. warning:: Any settings that modify the username before the passdb lookup (e.g.
             :dovecot_core:ref:`auth_default_domain`) will not work with Digest-MD5
             password scheme, because the password hash was calculated using the
             unmodified username. Any username modification will result in hash
             mismatch.

DIGEST-MD5 scheme
^^^^^^^^^^^^^^^^^

Password must be stored in either plaintext or with DIGEST-MD5 scheme.
See :ref:`authentication-password_schemes`.

The Digest is the MD5 sum of the string "user:realm:password". So for
example if you want to log in as ``user`` with password ``pass`` and the
realm should be ``example.com`` (usually not provided by the user, see
above), create the digest with:

.. code-block:: none

   % echo -n "user:example.com:pass" | md5sum c19c4c6e32f9d8026b26ba77c21fb8eb  -

And save it as

.. code-block:: none

   user@example.com:c19c4c6e32f9d8026b26ba77c21fb8eb

Note that if you're using DIGEST-MD5 scheme to store the passwords, you
can't change the users' names or realms in any way or the authentication
will fail because the MD5 sums don't match. Also not that this is
different from what Apache does with HTTP AUTH Digest. There it would be
``user:example.com:c19c4c6e32f9d8026b26ba77c21fb8eb`` and is created
with ``htdigest``.

Testing
^^^^^^^

You can use ``imtest`` from `Cyrus SASL <https://www.cyrusimap.org/sasl/>`_
library to test an IMAP connection:

.. code-block:: none

   # With realm:
   imtest -a user -r example.com
   # Without realm:
   imtest -a user@example.com
