.. _authentication-authentication_via_remote_imap_server:

=====================================
Authentication via remote IMAP server
=====================================

This method is a separate IMAP server that authenticates the requested user
against its internal database.

Configuration
=============

.. dovecot_core:setting_link:: imapc_host


.. dovecot_core:setting_link:: imapc_port


.. dovecot_core:setting_link:: imapc_user


.. dovecot_core:setting_link:: imapc_rawlog_dir


.. dovecot_core:setting_link:: imapc_ssl


.. dovecotremoved:: 2.4.0,3.0.0 Arg-based driver settings have been removed
                    in favor of using the standard imapc_* settings.


.. dovecotremoved:: 2.4.0,3.0.0 ssl_ca_file, ssl_ca_dir and allow_invalid_cert
                    settings have been removed. The standard ssl_* settings can
		    be used instead (also inside passdb { .. } if wanted).

See also :ref:`howto-imapc_proxy` for how to combine this with imapc storage.

Example
=======

Authenticates users against remote IMAP server in IP address 192.168.1.123:

.. code-block:: none

  passdb imap {
    imapc_host = 192.168.1.123
    imapc_port = 143
    imapc_user = %{owner_user}
    imapc_rawlog_dir = /tmp/imapc_rawlogs/
    imapc_ssl = starttls

    ssl_client_require_valid_cert = no
  }
