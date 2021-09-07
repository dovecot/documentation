.. _dict-proxy_process:

========================
Dictionary Proxy Process
========================

Dict server is used for providing :ref:`dictionary <dict>` access via server
processes instead of doing it directly from whichever process wants to access
the dictionary. This is useful for some backends with relatively high
connection cost (e.g. :ref:`dict-sql`), but not necessarily for others (e.g.
:ref:`dict-redis`).

When a mail process uses the dict proxy, it needs to have access the dict
UNIX socket. By default only the ``dovecot`` user has access to the dict
socket, which doesn't typically work in any installation. However, giving too
wide permissions by default might allow untrusted users to access the dict and
cause problems.

If all users share a single UNIX UID (e.g. ``vmail``), you could make the dict
socket accessible only to it:

.. code-block:: none

  service dict {
    unix_listener dict {
      mode = 0600
      user = vmail
    }
  }

If you use multiple UNIX UIDs, you can add an extra group for all Dovecot mail
processes. This works even if you have untrusted system users who have shell
access to the server:

.. code-block:: none

  mail_access_groups = dovecot

  service dict {
    unix_listener dict {
      mode = 0660
      group = dovecot
    }
  }

However, it works with :ref:`lda` only if it's started as root. If this isn't
possible, use :ref:`lmtp_server` instead.
