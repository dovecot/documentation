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

.. _setting-imapc_cmd_timeout:

``imapc_cmd_timeout``
---------------------

- Default: ``5 mins``
- Values: :ref:`time`

How long to wait for a reply to an IMAP command sent to the remote IMAP
server before disconnecting and retrying.


.. _setting-imapc_connection_retry_count:

``imapc_connection_retry_count``
--------------------------------

- Default: ``1``
- Values: :ref:`uint`

How many times to retry connection against a remote IMAP server?


.. _setting-imapc_connection_retry_interval:

``imapc_connection_retry_interval``
-----------------------------------

- Default: ``1 secs``
- Values:  :ref:`time_msecs`

How long to wait between retries against a remote IMAP server?


.. _setting-imapc_features:

``imapc_features``
------------------

- Default: <empty>
- Values: :ref:`string`

A space-separated list of features, optimizations, and workarounds that can
be enabled.

Features
########

* ``delay-login``: Don't connect to the remote server until some command
  requires it. By default the server is connected to immediately on login.
  (v2.2.29+)
* ``gmail-migration``: Enable GMail-specific migration. Use IMAP
  ``X-GM-MSGID`` as POP3 UIDL. Add ``$GMailHaveLabels`` keyword to mails that
  have ``X-GM-LABELS`` except for ``\Muted`` keyword (to be used for
  migrating only archived emails in ``All Mails``). Add ``pop3_deleted_flag``
  to mails that don't exist in POP3 server.
* ``modseq``: Access ``MODSEQ`` and ``HIGHESTMODSEQ`` (v2.2.24+).
* ``proxyauth``: Use Sun/Oracle IMAP-server specific ``PROXYAUTH`` command to
  do master user authentication. Normally this would be done using the SASL
  PLAIN authentication.
* ``throttle:<INIT>:<MAX>:<SHRINK>``: When receiving [THROTTLED] response
  (from GMail), throttling is applied. **INIT** = initial throttling msecs
  (default: 50 ms), afterwards each subsequent [THROTTLED] doubles the
  throttling until **MAX** is reached (default: 16000 ms). When [THROTTLED] is
  not received for a while, it's shrank again. The initial shrinking is done
  after **SHRINK** (default: 500 ms). If [THROTTLED] is received again within
  this timeout, it's doubled, otherwise both throttling and the next
  shrinking timeout is shrank to 3/4 the previous value.

.. versionadded:: 2.3.15

* ``acl``: When this feature is enabled and the imap-acl plugin is loaded, using a remote location via imapc will make IMAP ACL commands (MYRIGHTS, GETACL, SETACL, DELETEACL) proxied to the remote.

Optimizations
#############

* ``fetch-bodystructure``: Allow fetching ``BODY`` and ``BODYSTRUCTURE``
  ``FETCH BODY.PEEK[HEADER.FIELDS (..)]``.
* ``fetch-headers``: Allow fetching specific message headers using
  from remote server. (v2.2.30+)
* ``rfc822.size``: Allow passing through message sizes using
  ``FETCH RFC822.SIZE``.
* ``search``: Allow using ``SEARCH`` command.

Workarounds
###########

* ``fetch-fix-broken-mails``: If a ``FETCH`` returns ``NO`` (but not
  ``NO [LIMIT]`` or ``NO [SERVERBUG]``), assume the mail is broken in server
  and just treat it as if it were an empty email. NOTE: This is often a
  dangerous option! It's not safe to assume that ``NO`` means a permanent
  error rather than a temporary error. This feature should be enabled only
  for specific users who have been determined to be broken.
* ``fetch-msn-workarounds``: Try to ignore wrong message sequence numbers in
  ``FETCH`` replies whenever possible, preferring to use the returned UID
  number instead.
* ``no-examine``: Use ``SELECT`` instead of ``EXAMINE`` even when we don't
  want to modify anything in the mailbox. This is a Courier-workaround where
  it didn't permanently assign ``UIDVALIDITY`` to an ``EXAMINEd`` mailbox,
  but assigned it for ``SELECTed`` mailbox.
* ``zimbra-workarounds``: Fetch full message using
  ``BODY.PEEK[HEADER] BODY.PEEK[TEXT]`` instead of just ``BODY.PEEK[]``
  because the header differs between these two when there are illegal control
  chars or 8bit chars. This mainly caused problems with dsync, but as of
  v2.2.22+ this should no longer be a problem and there's probably no need to
  enable this workaround.


.. _setting-imapc_host:

``imapc_host``
--------------

- Default: <empty>
- Values: :ref:`string`

The remote IMAP host to connect to.


.. _setting-imapc_list_prefix:

``imapc_list_prefix``
---------------------

- Default: <empty>
- Values: :ref:`string`

Access only mailboxes under this prefix.

Example, for a source IMAP server that uses an INBOX namespace prefix:

.. code-block:: none

  imapc_list_prefix = INBOX/


.. _setting-imapc_master_user:

``imapc_master_user``
---------------------

- Default: <empty>
- Values: :ref:`string`

The master username to authenticate as on the remote IMAP host.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

.. code-block:: none

  imapc_user = %u
  imapc_master_user = masteruser
  imapc_password = masteruser-secret

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-imapc_password`.
See also :ref:`setting-imapc_user`.


.. _setting-imapc_max_idle_time:

``imapc_max_idle_time``
-----------------------

- Default: ``29 mins``
- Values: :ref:`time`

Send a command to the source IMAP server as a keepalive after no other command
has been sent for this amount of time.

Dovecot will send either ``NOOP`` or ``DONE`` to the source IMAP server.


.. _setting-imapc_max_line_length:

``imapc_max_line_length``
-------------------------

- Default: ``0``
- Values:  :ref:`size`

The maximum line length to accept from the remote IMAP server.

This setting is used to limit maximum memory usage.

A value of ``0`` indicates no maximum.


.. _setting-imapc_password:

``imapc_password``
------------------

- Default: <empty>
- Values: :ref:`string`

The authentication password for the remote IMAP server.

If using master users, this setting will be the password of the master user.

See also :ref:`setting-imapc_master_user`.
See also :ref:`setting-imapc_user`.


.. _setting-imapc_port:

``imapc_port``
--------------

- Default: <empty>
- Values: :ref:`uint`

The port on the remote IMAP host to connect to.


.. _setting-imapc_rawlog_dir:

``imapc_rawlog_dir``
--------------------

- Default: <empty>
- Values: :ref:`string`

Log all IMAP traffic input/output to this directory.

See: https://wiki.dovecot.org/Debugging/Rawlog


.. _setting-imapc_sasl_mechanisms:

``imapc_sasl_mechanisms``
-------------------------

- Default: <empty>
- Values: :ref:`string`

The :ref:`sasl` mechanisms to use for authentication when connection to a
remote IMAP server.

The first one advertised by the remote IMAP sever is used.

PLAIN authentication will be used by default.

.. code-block:: none

  imapc_sasl_mechanisms = external plain login


.. _setting-imapc_ssl:

``imapc_ssl``
-------------

- Default: <empty>
- Values: <empty>, ``no``, ``imaps``, ``starttls``

Use TLS to connect to the remote IMAP server.

Settings:
* ``<empty>`` or ``no``: No TLS
* ``imaps``: Explicitly connect to remote IMAP port using TLS
* ``starttls``: Use IMAP STARTTLS command to switch to TLS connection


.. _setting-imapc_ssl_verify:

``imapc_ssl_verify``
--------------------

- Default: ``yes`` 
- Values: :ref:`boolean`

Verify remote IMAP TLS certificate?

Verification may be disabled during testing, but should be enabled during
production use.

Only used if :ref:`setting-imapc_ssl` is enabled.


.. _setting-imapc_user:

``imapc_user``
--------------

- Default: <empty>
- Values: :ref:`string`

The user identity to be used for performing a regular IMAP LOGIN to the
source IMAP server in dsync-based migration of mail.

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-imapc_master_user`.
See also :ref:`setting-imapc_password`.


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
