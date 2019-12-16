.. _director_settings:

========================
Director Settings
========================

See http://wiki.dovecot.org/Director for more details.

.. code-block:: none

   director_mail_servers = dovecot-backends.example.com

This setting contains a space-separated list of Dovecot backends' IP addresses or DNS names. One DNS entry may contain multiple IP addresses (which is maybe the simplest way to configure them).

.. code-block:: none

   director_servers = dovecot-directors.example.com

This setting contains a space-separated list of Dovecot directors' IP addresses or DNS names. One DNS entry may contain multiple IP addresses (which is maybe the simplest way to configure them).

.. code-block:: none

   director_consistent_hashing = yes

This setting enables consistent hashing to director. This reduces users being moved around when doing backend changes. This will be the default setting in v2.3. 

.. code-block:: none

   shutdown_clients = yes

By default all active sessions will be shut down when director is reloaded or restarted. Setting this to ``no`` is dangerous on director as existing sessions are then not killed when director restarts and are then effectively unmanaged by director until they disconnect and users can end up on multiple backends at the same time.

.. code-block:: none

   auth_socket_path = director-userdb
   service director {
    fifo_listener login/proxy-notify {
        mode = 0600
        user = $default_login_user
    }
    inet_listener {
        port = 9090
    }
    unix_listener director-userdb {
        mode = 0600
    }
    unix_listener login/director {
        mode = 0666
    }
    unix_listener director-admin {
        mode = 0600
    }
   }
   service ipc {
    unix_listener ipc {
        user = dovecot
    }
   }
   service imap-login {
    executable = imap-login director
   }
   service pop3-login {
    executable = pop3-login director
   }
   service managesieve-login {
    executable = managesieve-login director
   }

All these settings configure the Dovecot director. They don't usually need to be modified, except the TCP port 9090 may be changed. It is used for the directors' internal communication. 

You'll also need to install dovemon monitor script.  This package is maintained by OX/Dovecot and is available in Dovecot Pro repository.

.. code-block:: none

   **dovecot director ring status**

   # doveadm director ring status

   director ip     port type   last failed     status

   "last failed" field value: it's either "never" or "date-time"
   Restarting director will set "last failed" field to "never".
   Network and protocol failures can cause "last failed" field value to change to "date-time".

   "status" values can be "handshaking", "syncing", and "synced". Under normal operations the value should be "synced", other values indicate that some operation ("handshaking" / "syncing") is currently going on.
   "handshaking" can include number of users received, or users sent.

doveadm director ring status command return values.

.. seealso:: :ref:`director_capacity_sizing`
