.. _imapc_settings:

===================
Imapc Configuration
===================

See :ref:`Imapc <imapc_mbox_format>` for a technical description of Dovecot's
imapc mailbox format.

Mail Location Configuration Examples
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  # In-memory index files:
  mail_location = imapc:

  # Store index files locally:
  mail_location = imapc:~/imapc

Connection Settings
^^^^^^^^^^^^^^^^^^^

.. dovecot_core:setting:: imapc_cmd_timeout
   :default: 5 mins
   :values: @time

   How long to wait for a reply to an IMAP command sent to the remote IMAP
   server before disconnecting and retrying.


.. dovecot_core:setting:: imapc_connection_retry_count
   :default: 1
   :values: @uint

   How many times to retry connection against a remote IMAP server?


.. dovecot_core:setting:: imapc_connection_retry_interval
   :default: 1 secs
   :values: @time_msecs

   How long to wait between retries against a remote IMAP server?


.. dovecot_core:setting:: imapc_features
   :values: @string

   A space-separated list of features, optimizations, and workarounds that can
   be enabled.

   **Features**

   ``acl``

     When this feature is enabled and the imap-acl plugin is loaded, using a
     remote location via imapc will make IMAP ACL commands (MYRIGHTS, GETACL,
     SETACL, DELETEACL) proxied to the remote.

     .. versionadded:: 2.3.15

   ``delay-login``

     Don't connect to the remote server until some command requires it. By
     default the server is connected to immediately on login.

    .. versionadded:: v2.2.29

   ``gmail-migration``

     Enable GMail-specific migration. Use IMAP ``X-GM-MSGID`` as POP3 UIDL.
     Add ``$GMailHaveLabels`` keyword to mails that have ``X-GM-LABELS``
     except for ``\Muted`` keyword (to be used for migrating only archived
     emails in ``All Mails``). Add :dovecot_core:ref:`pop3_deleted_flag` to
     mails that don't exist in POP3 server.

   ``modseq``

     Access ``MODSEQ`` and ``HIGHESTMODSEQ``

     .. versionadded:: 2.2.24

   ``proxyauth``

     Use Sun/Oracle IMAP-server specific ``PROXYAUTH`` command to do master
     user authentication. Normally this would be done using the SASL PLAIN
     authentication.

   ``throttle:<INIT>:<MAX>:<SHRINK>``

     When receiving [THROTTLED] response (from GMail), throttling is applied.

     **INIT** = initial throttling msecs (default: 50 ms), afterwards each
     subsequent [THROTTLED] doubles the throttling until **MAX** is reached
     (default: 16000 ms). When [THROTTLED] is not received for a while, it's
     shrank again. The initial shrinking is done after **SHRINK** (default:
     500 ms). If [THROTTLED] is received again within this timeout, it's
     doubled, otherwise both throttling and the next shrinking timeout is
     shrank to 3/4 the previous value.

   **Optimizations**

   ``fetch-bodystructure``

     Allow fetching ``BODY`` and ``BODYSTRUCTURE``
     ``FETCH BODY.PEEK[HEADER.FIELDS (..)]``.

   ``fetch-headers``

     Allow fetching specific message headers from remote server.

     .. versionadded:: 2.2.30

   ``rfc822.size``

     Allow passing through message sizes using ``FETCH RFC822.SIZE``.

   ``search``

     Allow using ``SEARCH`` command.

   **Workarounds**

   ``fetch-fix-broken-mails``

     If a ``FETCH`` returns ``NO`` (but not ``NO [LIMIT]`` or ``NO
     [SERVERBUG]``), assume the mail is broken in server and just treat it as
     if it were an empty email.

     .. warning:: This is often a dangerous option! It's not safe to assume
                  that ``NO`` means a permanent error rather than a temporary
                  error. This feature should be enabled only for specific
                  users who have been determined to be broken.

   ``fetch-msn-workarounds``

     Try to ignore wrong message sequence numbers in ``FETCH`` replies
     whenever possible, preferring to use the returned UID number instead.

   ``no-examine``

     Use ``SELECT`` instead of ``EXAMINE`` even when we don't want to modify
     anything in the mailbox. This is a Courier-workaround where it didn't
     permanently assign ``UIDVALIDITY`` to an ``EXAMINEd`` mailbox, but assigned
     it for ``SELECTed`` mailbox.

   ``zimbra-workarounds``

     Fetch full message using ``BODY.PEEK[HEADER] BODY.PEEK[TEXT]`` instead of
     just ``BODY.PEEK[]`` because the header differs between these two when
     there are illegal control chars or 8bit chars. This mainly caused
     problems with dsync, but as of v2.2.22+ this should no longer be a
     problem and there's probably no need to enable this workaround.


.. dovecot_core:setting:: imapc_host
   :values: @string

   The remote IMAP host to connect to.


.. dovecot_core:setting:: imapc_list_prefix
   :values: @string

   Access only mailboxes under this prefix.

   Example, for a source IMAP server that uses an INBOX namespace prefix:

   .. code-block:: none

     imapc_list_prefix = INBOX/


.. dovecot_core:setting:: imapc_master_user
   :seealso: @imapc_password;dovecot_core, @imapc_user;dovecot_core
   :values: @string

   The master username to authenticate as on the remote IMAP host.

   To authenticate as a master user but use a separate login user, the
   following configuration should be employed, where the credentials are
   represented by masteruser and masteruser-secret:

   .. code-block:: none

     imapc_user = %u
     imapc_master_user = masteruser
     imapc_password = masteruser-secret

   :ref:`Mail user variables <variables-mail_user>` can be used.


.. dovecot_core:setting:: imapc_max_idle_time
   :default: 29 mins
   :values: @time

   Send a command to the source IMAP server as a keepalive after no other
   command has been sent for this amount of time.

   Dovecot will send either ``NOOP`` or ``DONE`` to the source IMAP server.


.. dovecot_core:setting:: imapc_max_line_length
   :default: 0
   :values: @size

   The maximum line length to accept from the remote IMAP server.

   This setting is used to limit maximum memory usage.

   A value of ``0`` indicates no maximum.


.. dovecot_core:setting:: imapc_password
   :seealso: @imapc_master_user;dovecot_core, @imapc_user;dovecot_core
   :values: @string

   The authentication password for the remote IMAP server.

   If using master users, this setting will be the password of the master user.


.. dovecot_core:setting:: imapc_port
   :default: 143
   :values: @uint

   The port on the remote IMAP host to connect to.


.. dovecot_core:setting:: imapc_rawlog_dir
   :seealso: @debugging_rawlog
   :values: @string

   Log all IMAP traffic input/output to this directory.


.. dovecot_core:setting:: imapc_sasl_mechanisms
   :default: plain
   :values: @string

   The :ref:`sasl` mechanisms to use for authentication when connection to a
   remote IMAP server.

   The first one advertised by the remote IMAP sever is used.

   Example:

   .. code-block:: none

     imapc_sasl_mechanisms = external plain login


.. dovecot_core:setting:: imapc_ssl
   :default: no
   :values: no, imaps, starttls

   Use TLS to connect to the remote IMAP server.

   ============= =====================================================
   Value         Description
   ============= =====================================================
   ``no``        No TLS
   ``imaps``     Explicitly connect to remote IMAP port using TLS
   ``starttls``  Use IMAP STARTTLS command to switch to TLS connection
   ============= =====================================================


.. dovecot_core:setting:: imapc_ssl_verify
   :default: yes
   :seealso: @imapc_ssl;dovecot_core
   :values: @boolean

   Verify remote IMAP TLS certificate?

   Verification may be disabled during testing, but should be enabled during
   production use.

   Only used if :dovecot_core:ref:`imapc_ssl` is enabled.


.. dovecot_core:setting:: imapc_user
   :seealso: @imapc_master_user;dovecot_core, @imapc_password;dovecot_core
   :values: @string

   The user identity to be used for performing a regular IMAP LOGIN to the
   source IMAP server.

   :ref:`Mail user variables <variables-mail_user>` can be used.


Usage Examples
^^^^^^^^^^^^^^

Do a regular IMAP LOGIN, using STARTTLS, to imap.example.com:

.. code-block:: none

  imapc_host = imap.example.com
  imapc_password = secret
  imapc_port = 143
  imapc_ssl = starttls
  imapc_user = user@example.com


Quota
^^^^^

Using the ``imapc`` quota backend allows asking for the quota from remote
IMAP server (v2.2.30+). By default it uses ``GETQUOTAROOT INBOX`` to
retrieve the quota.

There are two parameters that can be used to control how the quota is looked
up:

* ``box = <mailbox>``: Use ``GETQUOTAROOT <mailbox>``
* ``root = <name>``: Use ``GETQUOTA <name>``

Example:

.. code-block:: none

  plugin {
    quota = imapc:root=User Quota
  }
