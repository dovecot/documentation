.. _proxy_settings:

====================
Proxy Settings
====================

See :ref:`authentication-proxies` for more details.

.. code-block:: none
   
   login_trusted_networks = 10.0.0.0/8

Include Dovecot Proxy's IP addresses/network so they can pass through the
session ID and the client's original IP address. If OX AppSuite is used, it's
also useful to provide AppSuite's IPs/network here for passing through its
session ID and the web browser's original IP address.

.. code-block:: none

   lmtp_proxy = yes

Enable LMTP to do proxying by doing passdb lookups (instead of only userdb lookups).

.. code-block:: none
   
   login_proxy_max_disconnect_delay = 30 secs

.. dovecotadded:: 2.2.19

This setting is used to avoid load spikes caused by reconnecting clients after a backend server has died or been restarted. Instead of disconnecting all the clients at the same time, the disconnections are spread over longer time period.

.. code-block:: none
   
   #doveadm_password =

.. dovecotadded:: 2.3.9

:dovecot_core:ref:`doveadm_ssl`: setting can be used to specify SSL mode to use when doing doveadm proxying.
Can be overridden with ssl and starttls :ref:`proxy flags <authentication-proxies>`.
When using starttls, do not add ``ssl=yes`` to doveadm service's ``inet_listener`` block.

.. code-block:: none

   #doveadm_ssl = no

This configures the doveadm server's password. It can be used to access users' mailboxes and do various other things, so it should be kept secret.

.. code-block:: none

   doveadm_port = 24245
   service doveadm {
    inet_listener {
        port = 24245
    }
   }

These settings configure the doveadm port when acting as doveadm client and doveadm server.

.. code-block:: none

   service lmtp {
    inet_listener lmtp {
        port = 24
    }
   }

This setting configures the LMTP port to use.

.. code-block:: none

   service imap-login {
    restart_request_count = 0
    client_limit = 10000
    process_min_avail = 4
    process_limit = 4
   }

These 3 settings configure the imap-login process to be in "high performance mode" as explained in :ref:`login_processes`. The 4 should be changed to the number of CPU cores on the server.

The ``client_limit`` setting should be increased to be as high as needed. The max number of connections per server is ``client_limit * process_limit``, so 40k connections in the above configuration.

.. code-block:: none

   service pop3-login {
    restart_request_count = 0
    client_limit = 10000
    process_min_avail = 4
    process_limit = 4
   }

Enable high performance mode for POP3 as well (as explained above).
