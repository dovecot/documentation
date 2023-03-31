.. _list_of_events:

######
Events
######

List of all events emitted by Dovecot for statistics, exporting and filtering.

See also:

 * :ref:`statistics`
 * :ref:`event_reasons`
 * :ref:`event_export`
 * :ref:`event_filter`
 * :ref:`event_design` for technical implementation details

Page options:

.. raw:: html

   <script>
   function toggleTables(expand) {
     $('details.sd-dropdown').each(function() {
       $(this).attr('open', expand);
     });
   }
   </script>

   <button type="button" class="sd-btn sd-btn-secondary" onclick="toggleTables(true)">Expand All Tables</button>
   <button type="button" class="sd-btn sd-btn-secondary" onclick="toggleTables(false)">Collapse All Tables</button>


**********
Categories
**********

.. dropdown:: Root Categories

   .. list-table::
      :widths: 25 75
      :header-rows: 1

      * - Category
        - Description
      * - ``auth``
        - Authentication (server mainly)
      * - ``auth-client``
        - Authentication client library
      * - ``dict``
        - Dictionary library and drivers
      * - ``dict-server``
        - Dictionary server/proxy (dict process)
      * - ``dns``
        - DNS client library
      * - ``dns-worker``
        - dns-client process
      * - ``fs``
        - FS library
      * - ``fs-dictmap``
        - :ref:`fs-dictmap <dictmap_configuration>`
      * - ``fts``
        - Full text search plugin
      * - ``fts-dovecot``
        - :ref:`fts_backend_dovecot`
      * - ``http-client``
        - HTTP client library

          .. versionadded:: v2.3.16
      * - ``http-server``
        - HTTP server library
      * - ``imap``
        - imap process
      * - ``imap-urlauth``
        - imap-urlauth process
      * - ``imap-hibernate``
        - imap-hibernate process
      * - ``lda``
        - dovecot-lda process
      * - ``local-delivery``
        - LDA/LMTP local delivery
      * - ``lmtp``
        - LMTP process
      * - ``lua``
        - Lua script
      * - ``mail-cache``
        - ``dovecot.index.cache`` file handling
      * - ``mail-index``
        - ``dovecot.index*`` file handling
      * - ``managesieve``
        - Managesieve
      * - ``metacache``
        - obox metacache
      * - ``pop3``
        - POP3 process
      * - ``push-notification``
        - push-notification plugin

          .. versionchanged:: v2.3.11 This was previously named ``push_notification``.
      * - ``quota-status``
        - quota-status process
      * - ``service:<name>``
        - Named service, e.g. service:imap or service:auth
      * - ``smtp-client``
        - SMTP/LMTP client
      * - ``smtp-server``
        - SMTP/LMTP server
      * - ``smtp-submit``
        - SMTP submission client
      * - ``ssl``
        - SSL/TLS connections
      * - ``ssl-client``
        - Incoming SSL/TLS connections
      * - ``ssl-server``
        - Outgoing SSL/TLS connections
      * - ``submission``
        - Submission process

.. dropdown:: Storage Categories

   .. list-table::
      :widths: 25 75
      :header-rows: 1

      * - Category
        - Description
      * - ``storage``
        - Mail storage parent category
      * - :ref:`imapc <imapc_mbox_format>`
        - imapc storage
      * - ``mailbox``
        - Mailbox (folder)
      * - :ref:`maildir <maildir_mbox_format>`
        - Maildir storage
      * - :ref:`mbox <mbox_mbox_format>`
        - mbox storage
      * - :ref:`mdbox <dbox_mbox_format>`
        - mdbox storage
      * - :ref:`obox <obox_settings>`
        - obox storage
      * - :ref:`sdbox <dbox_mbox_format>`
        - sdbox storage
      * - :ref:`pop3c <pop3c_mbox_format>`
        - pop3c storage

.. dropdown:: Mailbox Categories

   .. list-table::
      :widths: 25 75
      :header-rows: 1

      * - Category
        - Description
      * - ``storage``
        - Mailbox (folder) parent category
      * - ``mail``
        - Mail

.. dropdown:: Sieve Categories

   .. versionadded:: v2.3.11 makes the ``sieve`` category parent for the other
                     ``sieve-*`` categories.

   .. list-table::
      :widths: 25 75
      :header-rows: 1

      * - Category
        - Description
      * - ``sieve``
        - Sieve parent category
      * - ``sieve-action``
        - Individual Sieve actions executed.
      * - ``sieve-execute``
        - Sieve script(s) being executed for a particular message. This envelops
          all of Sieve execution; both runtime and action execution.
      * - ``sieve-runtime``
        - Evaluation of individual Sieve scripts
      * - ``sieve-storage``
        - Sieve storage

.. dropdown:: SQL Categories

   .. list-table::
      :widths: 25 75
      :header-rows: 1

      * - Category
        - Description
      * - ``sql``
        - SQL parent category
      * - ``cassandra``
        - Cassandra CQL events
      * - ``mysql``
        - MySQL events
      * - ``pgsql``
        - PostgreSQL events
      * - ``sqlite``
        - SQLite events
      * - ``sqlpool``
        - SQL is used internally via "SQL connection pools"


******
Events
******

.. dovecot_event:field_global::

   :field duration: Duration of the event (in microseconds)
   :field reason_code: List of reason code strings why the event happened. See
                       :ref:`event_reasons` for possible values.

Authentication Client
=====================

These events are generated by authentication clients (lib-auth).

.. dovecot_core:event:: auth_client_cache_flush_started
   :added: v2.3.7
   :removed: v2.4.0,v3.0.0

   Deprecated; do not use.


.. dovecot_core:event:: auth_client_cache_flush_finished
   :added: v2.3.7
   :removed: v2.4.0,v3.0.0

   :field error: Error string if error occurred.

   Deprecated; do not use.


.. dovecot_event:field_group:: auth_client_common

   :field mechanism: Name of used SASL mechanism (e.g. PLAIN).
   :field service: Name of service. Examples: ``imap``, ``pop3``, ``lmtp``, ...
   :field transport:
     Transport security indicator. Values:
       * ``insecure``
       * ``secured``

         .. versionchanged:: v2.4.0;v3.0.0 Secure non-TLS connections (e.g. from
            localhost) are now ``secured`` rather than ``trusted``.
       * ``TLS``
   :field session: Session identifier.
   :field certificate_user: Username from certificate.
   :field client_id: Expands to client ID request as IMAP arglist. Needs
     :dovecot_core:ref:`imap_id_retain=yes <imap_id_retain>`.
   :field local_name: TLS SNI.
   :field local_ip: Local IP client connected to.
   :field remote_ip: Remote IP of client.
   :field local_port: Local port client connected to.
   :field remote_port: Remote port of client.
   :field real_local_ip: Real local IP as seen by the server.
   :field real_remote_ip: Real remote IP as seen by the server.
   :field real_local_port: Real local port as seen by the server.
   :field real_remote_port: Real remote port as seen by the server.
   :field tls_cipher:  Cipher name used, e.g. ``TLS_AES_256_GCM_SHA384``.
   :field tls_cipher_bits: Cipher bits, e.g. ``256``.
   :field tls_pfs: Perfect forward-security mechanism, e.g. ``KxANY``,
     ``KxECDHE``.
   :field tls_protocol: TLS protocol name, e.g. ``TLSv1.3``.

.. dovecot_event:field_group:: auth_client_lookup
   :inherit: auth_client_common

   :field user: Full username to lookup.
   :field error: Error string, if error occurred.

.. dovecot_event:field_group:: auth_client_request
   :inherit: auth_client_common

   :field user: Username, if present
   :field original_user: Original username, if present.
   :field auth_user: Auth username, if present.
   :field error: Error string, if error occurred.


.. dovecot_core:event:: auth_client_passdb_lookup_started
   :added: v2.3.7
   :inherit: auth_client_lookup

   Authentication client starts a passdb lookup.


.. dovecot_core:event:: auth_client_passdb_lookup_finished
   :added: v2.3.7
   :inherit: auth_client_lookup

   Authentication client finishes a passdb lookup.


.. dovecot_core:event:: auth_client_request_started
   :added: v2.3.7
   :inherit: auth_client_request

   Authentication client starts authentication request.


.. dovecot_core:event:: auth_client_request_challenged
   :added: v2.3.7
   :inherit: auth_client_request

   Authentication client receives a request from server to continue SASL
   authentication.


.. dovecot_core:event:: auth_client_request_continued
   :added: v2.3.7
   :inherit: auth_client_request

   Authentication client continues SASL authentication by sending a response
   to server request.


.. dovecot_core:event:: auth_client_request_finished
   :added: v2.3.7
   :inherit: auth_client_request

   Authentication client receives response from server that authentication is
   finished, either success or failure.


.. dovecot_core:event:: auth_client_userdb_list_started
   :added: v2.3.7
   :inherit: auth_client_common

   :field user_mask: User mask to list.

   Authentication client starts userdb iteration.


.. dovecot_core:event:: auth_client_userdb_list_finished
   :added: v2.3.7
   :inherit: auth_client_common

   :field user_mask: User mask to list.
   :field error: Error string, if error occurred.

   Authentication client finishes userdb iteration.


.. dovecot_core:event:: auth_client_userdb_lookup_started
   :added: v2.3.7
   :inherit: auth_client_lookup

   Authentication client starts a userdb lookup.


.. dovecot_core:event:: auth_client_userdb_lookup_finished
   :added: v2.3.7
   :inherit: auth_client_lookup

   Authentication client finishes a userdb lookup.


.. dovecot_event:field_group:: auth_server_common

   :field user: Full username. This can change during authentication, for
     example due to passdb lookups.
   :field original_user: Original username exactly as provided by the client.
   :field translated_user: Similar to ``original_user``, except after
     :dovecot_core:ref:`auth_username_translation` translations are applied.
   :field login_user: When doing a master user login, the user we are logging
     in as. Otherwise not set.
   :field master_user: When doing a master user login, the master username.
     Otherwise not set.
   :field mechanism @added;v2.3.12: Name of used SASL mechanism (e.g. PLAIN).
   :field service @added;v2.3.12: Service doing the lookup (e.g. ``imap``,
     ``pop3``, ...).
   :field session @added;v2.3.12: Session ID.
   :field client_id @added;v2.3.12: Expands to client ID request as IMAP
     arglist. Needs ``imap_id_retain=yes``.
   :field remote_ip @added;v2.3.12: Remote IP address of the client connection.
   :field local_ip @added;v2.3.12: Local IP address where client connected to.
   :field remote_port @added;v2.3.12: Remote port of the client connection.
   :field local_port @added;v2.3.12: Local port where the client connected to.
   :field real_remote_ip @added;v2.3.12: Same as ``remote_ip``, except if the
     connection was proxied this is the proxy's IP address.
   :field real_local_ip @added;v2.3.12: Same as ``local_ip``, except if the
     connection was proxied this is the proxy's IP where proxy connected to.
   :field real_remote_port @added;v2.3.12: Same as ``remote_port``, except if
     the connection was proxied this is the proxy connection's port.
   :field real_local_port @added;v2.3.12: Same as ``local_port``, except if
     the connection was proxied this is the local port where the proxy
     connected to.
   :field local_name @added;v2.3.12: TLS SNI hostname, if given.
   :field transport @added;v2.3.12:
     Client connection's transport security. Values:
       * ``insecure``
       * ``secured``

         .. versionchanged:: v2.4.0;v3.0.0 Secure non-TLS connections (e.g.
            from localhost) are now ``secured`` rather than ``trusted``.
       * ``TLS``

.. dovecot_event:field_group:: auth_server_passdb

   :field passdb: Driver name.
   :field passdb_name: ``passdb { name }``, if it is configured. Otherwise,
     same as ``passdb { driver }``.
   :field passdb_id @added;v2.3.9: Internal ID number of the passdb.
     May be useful to identify the passdb if it has no name.

.. dovecot_event:field_group:: auth_server_userdb

   :field userdb: Driver name.
   :field userdb_name: ``userdb { name }``, if it is configured. Otherwise,
     same as ``userdb { driver }``.
   :field userdb_id @added;v2.3.9: Internal ID number of the userdb.
     May be useful to identify the userdb if it has no name.


.. dovecot_core:event:: auth_request_finished
   :added: v2.3.7
   :inherit: auth_server_common

   :field error: Set when error happens.
   :field success: ``yes``, when authentication succeeded.
   :field policy_penalty: Time of penalty added by policy server.
   :field policy_result: ``ok``, ``delayed``, or ``refused``.

   Authentication request finished.

   Most useful for tracking status of authentication/login attempts.


.. dovecot_core:event:: auth_passdb_request_started
   :added: v2.3.7
   :inherit: auth_server_common, auth_server_passdb

   Processing has begun for a passdb block.

   Most useful for debugging authentication flow.


.. dovecot_core:event:: auth_passdb_request_finished
   :added: v2.3.7
   :inherit: auth_server_common, auth_server_passdb

   :field result: * ``ok``
                  * ``password_mismatch``
                  * ``user_unknown``
                  * ``pass_expired``
                  * ``user_disabled``
                  * ``scheme_not_available``
                  * ``internal_failure``
                  * ``next``
   :field cache @added;v2.3.19: * ``miss``: Was not cached
                                * ``hit``: Found from cache

   Processing has ended for a passdb block.

   Most useful for debugging authentication flow.


.. dovecot_core:event:: auth_userdb_request_started
   :added: v2.3.7
   :inherit: auth_server_common, auth_server_userdb

   Processing has begun for a userdb block.

   Most useful for debugging authentication flow.


.. dovecot_core:event:: auth_userdb_request_finished
   :added: v2.3.7
   :inherit: auth_server_common, auth_server_userdb

   :field result: * ``ok``
                  * ``user_unknown``
                  * ``internal_failure``
   :field cache @added;v2.3.19: * ``miss``: Was not cached
                                * ``hit``: Found from cache

   Processing has ended for a userdb block.

   Most useful for debugging authentication flow.


.. dovecot_core:event:: auth_policy_request_finished
   :added: v2.3.7
   :inherit: auth_server_common

   :field mode: Either ``allow`` or ``report``.
   :field policy_result: Value returned from policy server (number).

   Processing has ended for an auth policy request.

   Most useful for debugging authentication flow.


Authentication Master Client
============================

These events are generated by master authentication clients (lib-master).
This happens when e.g. IMAP finishes the login by doing a userdb lookup.

.. dovecot_event:field_group:: auth_master_common

   :field id: Login request ID.
   :field local_ip: Client connection's local (server) IP.
   :field local_port: Client connection's local (server) port.
   :field remote_ip: Client connection's remote (client) IP.
   :field remote_port: Client connection's remote (client) port.


.. dovecot_core:event:: auth_master_client_login_started
   :inherit: auth_master_common

   Authentication master login request started.


.. dovecot_core:event:: auth_master_client_login_finished
   :inherit: auth_master_common

   :field user: Username of the user.
   :field error: Error message if the request failed.

   Authentication master login request finished.


Connection
==========

These events apply only for connections using the ``connection API``.

.. Note:: Not all connections currently use this API, so these events work for
          some types of connections, but not for others.

.. dovecot_event:field_group:: client_connection_common

   :field local_ip: Local server IP address where TCP client connected to.
   :field remote_ip: Remote TCP client's IP address.
   :field remote_port: Remote TCP client's source port.
   :field remote_pid: Remote UNIX socket client's process ID.
   :field remote_uid: Remote UNIX socket client's system user ID.

.. dovecot_event:field_group:: server_connection_common

   :field source_ip: Source IP address used for the outgoing TCP connection.
     This is set only if a specific source IP was explicitly requested.
   :field dest_ip: TCP connection's destination IP address.
   :field dest_port: TCP connection's destination port.
   :field dest_host: TCP connection's destination hostname, if known.
   :field socket_path: UNIX socket connection's path.
   :field remote_pid: Remote UNIX socket server's process ID.
   :field remote_uid: Remote UNIX socket server's system user ID.


.. dovecot_core:event:: client_connection_connected
   :inherit: client_connection_common

   Server accepted an incoming client connection.


.. dovecot_core:event:: client_connection_disconnected
   :inherit: client_connection_common

   :field net_in_bytes @changed;v2.4.0,v3.0.0: Amount of data read, in bytes.
   :field net_out_bytes @changed;v2.4.0,v3.0.0: Amount of data written, in bytes.
   :field reason: Disconnection reason.

   Client connection is terminated.


.. dovecot_core:event:: server_connection_connected
   :inherit: server_connection_common

   Outgoing server connection was either successfully established or failed.

   .. note:: Currently it is not possible to know which one happened.


.. dovecot_core:event:: server_connection_disconnected
   :inherit: server_connection_common

   :field reason: Disconnection reason.

   Server connection is terminated.


FS
==

.. dovecot_core:event:: fs

   May be inherited from various different parents (e.g. "Mail User" event)
   or even from no parent.


.. dovecot_core:event:: fs_file

   Inherits from fs or any other specified event (e.g. mail).


.. dovecot_core:event:: fs_iter

   :field file_type:
     (This field only exists for files accessed via :ref:`obox <obox_settings>`.)
       * ``mail``: Email file
       * ``index``: Index bundle
       * ``box``: Mailbox directory (for creating/deleting it, if used by the storage driver)
       * ``fts``: FTS file
   :field reason: Reason for accessing the file. (This field only exists
                  for files accessed via :ref:`obox <obox_settings>`.)

   Inherits from fs or any other specified event (e.g. mailbox).


Storage
=======

.. dovecot_event:field_group:: mail_storage_service_user

   :field session: Session ID for the storage session

.. todo:: +---------------------+------------------------------------------------------+
          | Field               | Description                                          |
          +=====================+======================================================+
          | Inherits from environment (e.g. IMAP/LMTP client)                          |
          +---------------------+------------------------------------------------------+
          | session             | Session ID for the storage session                   |
          +---------------------+------------------------------------------------------+
          | user                | Username of the user                                 |
          +---------------------+------------------------------------------------------+
          | service             | Name of the service. Examples: ``imap``, ``pop3``,   |
          |                     | ``lmtp``, ...                                        |
          |                     |                                                      |
          |                     | .. versionadded:: v2.4.0;v3.0.0                      |
          +---------------------+------------------------------------------------------+

.. dovecot_event:field_group:: mail_user
   :inherit: mail_storage_service_user

   :field user: Username of the user.

.. dovecot_event:field_group:: mailbox
   :inherit: mail_user

   :field mailbox @added;v2.3.9: Full mailbox name in UTF-8.
   :field mailbox_guid @added;v2.3.10: Mailbox GUID with obox storage.

Mail User
=========

.. dovecot_core:event:: mail_user_session_finished
   :added: v2.3.19
   :inherit: mail_user

   :field utime: User CPU time used in microseconds
   :field stime: System CPU time used in microseconds
   :field minor_faults: Page reclaims (soft page faults)
   :field major_faults: Page faults (hard page faults)
   :field vol_cs: Voluntary context switches
   :field invol_cs: Involuntary context switches
   :field rss: Resident set size in bytes.
               (Skipped in non-Linux environments.)
   :field vsz: Virtual memory size in bytes.
               (Skipped in non-Linux environments.)
   :field rchar: I/O counter: chars (bytes) read from storage
                 (Skipped in non-Linux environments.)
   :field wchar: I/O counter: chars (bytes) written to storage
                 (Skipped in non-Linux environments.)
   :field syscr: Number of read syscalls
                 (Skipped in non-Linux environments.)
   :field syscw: Number of write syscalls
                 (Skipped in non-Linux environments.)
   :field net_in_bytes @added;v2.4.0,v3.0.0: Bytes received during this session (for applicable processes.)
   :field net_out_bytes @added;v2.4.0,v3.0.0: Bytes sent during this session (for applicable processes.)


Mailbox
-------

.. dovecot_core:event:: mail_expunged
   :added: v2.3.15
   :inherit: mailbox

   :field uid: UID of the expunged mail.

   A mail was expunged from the mailbox. Note that this event inherits from
   mailbox, not mail.


Mail
----

.. dovecot_event:field_group:: mail

   :field seq: Mail sequence number.
   :field uid: Mail IMAP UID number.


.. dovecot_core:event:: mail_opened
   :added: v2.3.15
   :inherit: mail, mailbox

   :field reason: Reason why the mail was opened. (optional)

   A mail was opened e.g. for reading its body. Note that this event is not
   sent when mails' metadata is accessed, even if it causes opening the mail
   file.


.. dovecot_core:event:: mail_expunge_requested
   :added: v2.3.15
   :inherit: mail, mailbox

   A mail is set to be expunged. (Note that expunges can be rolled back later
   on, this event is emitted when an expunge is requested).


Mail Index
==========

Index
-----

Index file handling for ``dovecot.index*``, ``dovecot.map.index*``,
``dovecot.list.index*`` and similar indexes.

.. todo:: mail index "Inherits from event_mailbox, event_storage or
          event_mail_user depending on what the index is used for."

.. dovecot_core:event:: mail_index_recreated
   :added: v2.3.12

   :field filepath: Path to the index file being recreated.
   :field reason: Human-readable reason why the mail index was recreated.

   A mail index file was recreated.


.. dovecot_core:event:: indexer_worker_indexing_finished
   :added: v2.3.15
   :inherit: mailbox

   :field message_count: Number of messages indexed.
   :field first_uid: UID of the first indexed message.
   :field last_uid: UID of the last indexed message.
   :field user_cpu_usecs: Total user CPU spent on the indexing transaction in
     microseconds.

   Indexer worker process completed an indexing transaction.


Cache
-----

.. dovecot_event:field_group:: mail_index_common

   .. todo:: (Placeholder content or else generation will error out.)


.. dovecot_core:event:: mail_cache_decision_changed
   :added: v2.3.11
   :inherit: mail_index_common

   :field field: Cache field name (e.g. ``imap.body`` or ``hdr.from``).
   :field last_used: UNIX timestamp of when the field was accessed the last
     time. This is updated only once per 24 hours.
   :field reason:
     Reason why the caching decision changed:
       * ``add``: no -> temp decision change, because a new field was added to
         cache.
       * ``old_mail``: temp -> yes decision change, because a mail older than
         1 week was accessed.
       * ``unordered_access``: temp -> yes decision change, because mails
         weren't accessed in ascending order.
       * Other values indicate a reason for cache purging, which changes the
         caching decision yes -> temp.
   :field uid: IMAP UID number that caused the decision change. This is set
     only for some reasons, not all.
   :field old_decision: Old cache decision: ``no``, ``temp``, or ``yes``.
   :field new_decision: New cache decision: ``no``, ``temp``, or ``yes``.

   A field's caching decision changed. The decisions are:

   ========= ================================================================
   Decision  Description
   ========= ================================================================
   ``no``    The field is not cached.
   ``temp``  The field is cached for 1 week and dropped on the next purge.
   ``yes``   The field is cached permanently. If the field isn't accessed for
             30 days it's dropped.
   ========= ================================================================


.. dovecot_event:field_group:: mail_cache_purge

   :field file_seq: Sequence of the new cache file that is created.
   :field prev_file_seq: Sequence of the cache file that is to be purged.
   :field prev_file_size: Size of the cache file that is to be purged.
   :field prev_deleted_records: Number of records (mails) marked as deleted in
     the cache file that is to be purged.
   :field reason:
     Reason string for purging the cache file:
       * doveadm mailbox cache purge
       * copy cache decisions
       * creating cache
       * cache is too large
       * syncing
       * rebuilding index

.. dovecot_core:event:: mail_cache_decision_rejected

   :field field: Cache field name (e.g. ``hdr.from``).
   :field reason:
     Reason why the caching decision changed:
       * ``too_many_headers``
         - This can happen when the count of headers in the cache exceeds the maximum configured with :dovecot_core:ref:`mail_cache_max_headers_count`.

   The decision to promote a field (from ``no`` to ``temp``) was rejected.

.. dovecot_core:event:: mail_cache_purge_started
   :added: v2.3.11
   :inherit: mail_cache_purge, mail_index_common

   Cache file purging is started.


.. dovecot_core:event:: mail_cache_purge_drop_field
   :added: v2.3.11
   :inherit: mail_cache_purge, mail_index_common

   :field field: Cache field name (e.g. ``imap.body`` or ``hdr.from``).
   :field decision: Old caching decision: ``temp``, or ``yes``.
   :field last_used: UNIX timestamp of when the field was accessed the last
     time. This is updated only once per 24 hours.

   Existing field is dropped from the cache file because it hadn't been accessed
   for 30 days.


.. dovecot_core:event:: mail_cache_purge_finished
   :added: v2.3.11
   :inherit: mail_cache_purge, mail_index_common

   :field file_size: Size of the new cache file.
   :field max_uid: IMAP UID of the last mail in the cache file.

   TODO


.. dovecot_core:event:: mail_cache_corrupted
   :added: v2.3.11
   :inherit: mail_index_common

   :field reason: Reason string why cache was found to be corrupted.

   Cache file was found to be corrupted and the whole file is deleted.


.. dovecot_core:event:: mail_cache_record_corrupted
   :added: v2.3.11
   :inherit: mail_index_common

   :field uid: IMAP UID of the mail whose cache record is corrupted.
   :field reason: Reason string why cache was found to be corrupted.

   Cache record for a specific mail was found to be corrupted and the record
   is deleted.


.. dovecot_core:event:: mail_cache_lookup_finished
   :added: v2.3.15
   :removed: v2.3.18 Removed for performance reasons

   :field field: Cache field name (e.g. ``imap.body`` or ``hdr.from``).

   A mail field was looked up from cache.


HTTP Client
===========

These events are emitted by Dovecot's internal HTTP library when acting as
a client to an external service.

.. dovecot_event:field_group:: http_client

   :field attempts: Amount of individual HTTP request attempts (number of
     retries after failures + 1).
   :field net_in_bytes @changed;v2.4.0,v3.0.0: Amount of data read, in bytes.
   :field net_out_bytes @changed;v2.4.0,v3.0.0: Amount of data written, in bytes.
   :field dest_host: Destination host.
   :field dest_ip: Destination IP address.
   :field dest_port: Destination port.
   :field method: HTTP verb used uppercased, e.g. ``GET``.
   :field redirects: Number of redirects done while processing request.
   :field status_code: HTTP result status code (integer).
   :field target: Request path with parameters, e.g.
     ``/path/?delimiter=%2F&prefix=test%2F``.


.. dovecot_core:event:: http_request_finished
   :inherit: http_client

   HTTP request is complete.

   This event is useful to track and monitor external services.


.. dovecot_core:event:: http_request_redirected
   :inherit: http_client

   Intermediate event emitted when an HTTP request is being redirected.

   The :dovecot_core:ref:`http_request_finished` event is still sent at the
   end of the request.


.. dovecot_core:event:: http_request_retried
   :inherit: http_client

   Intermediate event emitted when an HTTP request is being retried.

   The :dovecot_core:ref:`http_request_finished` event is still sent at the
   end of the request.


HTTP Server
===========

These events are emitted by Dovecot's internal HTTP library when serving
requests (e.g. doveadm HTTP API).

.. dovecot_event:field_group:: http_server
   :inherit: client_connection_common

   :field request_id: Assigned ID of the received request.
   :field method: HTTP verb used uppercased, e.g. ``GET``.
   :field target: Request path with parameters, e.g.
     ``/path/?delimiter=%2F&prefix=test%2F``.


.. dovecot_core:event:: http_server_request_started
   :added: v2.3.18
   :inherit: http_server

   A new HTTP request has been received and the request headers (but not body
   payload) are parsed.


.. dovecot_core:event:: http_server_request_finished
   :added: v2.3.18
   :inherit: http_server

   :field net_in_bytes @changed;v2.4.0,v3.0.0: Amount of request data read, in bytes.
   :field net_out_bytes @changed;v2.4.0,v3.0.0: Amount of response data written, in bytes.
   :field status_code: HTTP result status code (integer).

   HTTP request is fully completed, i.e. the incoming request body is read and
   the full response to the request has been sent to the client.


..
   Uncomment if there is an actual POP3 event.

   POP3
   ====

.. dovecot_event:field_group:: pop3_client

   :field user @added;v2.4.0,v3.0.0: Username of the user.
   :field session @added;v2.4.0,v3.0.0: Session ID of the POP3 connection.
   :field local_ip @added;v2.4.0,v3.0.0: POP3 connection's local (server) IP.
   :field local_port @added;v2.4.0,v3.0.0: POP3 connection's local (server) port.
   :field remote_ip @added;v2.4.0,v3.0.0: POP3 connection's remote (client) IP.
   :field remote_port @added;v2.4.0,v3.0.0: POP3 connection's remote (client) port.


.. dovecot_event:field_group:: pop3_command
   :inherit: pop3_client

   :field cmd_name @added;v2.4.0,v3.0.0: POP3 command name uppercased (e.g. ``UIDL``).
   :field cmd_args @added;v2.4.0,v3.0.0: POP3 command's full parameters (e.g. ``1 1``).


.. dovecot_core:event:: pop3_command_finished
   :inherit: pop3_command
   :added: v2.4.0;v3.0.0

   :field reply: POP3 reply: Values:
                                * ``OK``
                                * ``FAIL``
   :field net_in_bytes: Amount of data read for this command, in bytes.
   :field net_out_bytes: Amount of data written for this command, in bytes.

   POP3 command is completed.

   This event is useful to track individual command usage, debug specific
   sessions, and/or detect broken clients.

   .. Note:: This event is currently not sent for pre-login POP3 commands.


IMAP
====

IMAP Client
-----------

.. dovecot_event:field_group:: imap_client

   :field user: Username of the user.
   :field session: Session ID of the IMAP connection.
   :field local_ip @added;v2.3.9: IMAP connection's local (server) IP.
   :field local_port @added;v2.3.9: IMAP connection's local (server) port.
   :field remote_ip @added;v2.3.9: IMAP connection's remote (client) IP.
   :field remote_port @added;v2.3.9: IMAP connection's remote (client) port.


.. dovecot_core:event:: imap_client_hibernated
   :added: v2.3.13
   :inherit: imap_client

   :field mailbox: Mailbox name where hibernation was started in.
   :field error: Reason why hibernation attempt failed.

   IMAP client is hibernated or the hibernation attempt failed.

   .. note:: For failures, this event can be logged by either imap or
             imap-hibernate process depending on which side the error was
             detected in.


.. dovecot_core:event:: imap_client_unhibernated
   :added: v2.3.13
   :inherit: imap_client

   :field reason:
     Reason why client was unhibernated:
       * ``idle_done``: IDLE command was stopped with DONE.
       * ``idle_bad_reply``: IDLE command was stopped with some other command
         than DONE.
       * ``mailbox_changes``: Mailbox change notifications need to be sent to
         the client.
   :field hibernation_usecs: Number of microseconds how long the client was
     hibernated.
   :field mailbox: Mailbox name where hibernation was started in.

   IMAP client is unhibernated or the unhibernation attempt failed.

   .. note:: For failures, this event can be logged by either imap or
             imap-hibernate process depending on which side the error was
             detected in.

   See also imap process's :dovecot_core:ref:`imap_client_unhibernated` event.


.. dovecot_core:event:: imap_client_unhibernate_retried
   :added: v2.3.13
   :inherit: imap_client

   :field error: Reason why unhibernation failed.

   An IMAP client is attempted to be unhibernated, but imap processes are busy
   and the unhibernation attempt is retried.

   This event is sent each time when retrying is done.

   The :dovecot_core:ref:`imap_client_unhibernated` event is still sent when
   unhibernation either succeeds or fails permanently.


IMAP Command
------------

.. dovecot_event:field_group:: imap_command
   :inherit: imap_client

   :field cmd_tag @added;v2.3.9: IMAP command tag.
   :field cmd_name @added;v2.3.9:
     IMAP command name uppercased (e.g. ``FETCH``).

     .. versionchanged:: v2.3.11 Contains ``unknown`` for unknown command names.
   :field cmd_input_name @added;v2.3.11: IMAP command name exactly as sent
     (e.g. ``fetcH``) regardless of whether or not it is valid.
   :field cmd_args @added;v2.3.9: IMAP command's full parameters (e.g.
     ``1:* FLAGS``).
   :field cmd_human_args @added;v2.3.9: IMAP command's full parameters, as
     human-readable output. Often it's the same as ``cmd_args``, but it is
     guaranteed to contain only valid UTF-8 characters and no control
     characters. Multi-line parameters are written only as
     ``<N byte multi-line literal>``.


.. dovecot_core:event:: imap_command_finished
   :inherit: imap_command

   :field tagged_reply_state: Values:
                                * ``OK``
                                * ``NO``
                                * ``BAD``
   :field tagged_reply: Full tagged reply (e.g. ``OK SELECT finished.``).
   :field last_run_time: Timestamp when the command was running last time.
     (Command may be followed by internal "mailbox sync" that can take some
     time to complete)
   :field running_usecs: How many usecs this command has spent running.
   :field lock_wait_usecs: How many usecs this command has spent waiting for
     locks.
   :field net_in_bytes @changed;v2.4.0,v3.0.0: Amount of data read for this command, in bytes.
   :field net_out_bytes @changed;v2.4.0,v3.0.0: Amount of data written for this command, in bytes.

   IMAP command is completed.

   This event is useful to track individual command usage, debug specific
   sessions, and/or detect broken clients.

   .. Note:: This event is currently not sent for pre-login IMAP commands.


.. dovecot_core:event:: imap_id_received
   :added: v2.4.0;v3.0.0
   :inherit: imap_client

   :field id_param_<param>: Received parameters. The event name is the lowercase
                            parameter key prefixed with ``id_param_``, the value
                            is the parameter value.
   :field id_invalid<num>: Each key that contains invalid characters are
                           enumerated starting with 1. Valid characters are
                           latin alphabetic characters (= ``a`` .. ``z``),
                           numerals (= ``0`` .. ``9``), the dash (= ``-``) and
                           the underscore (= ``_``), every other character is
                           considered invalid. The value of this field is the
                           original parameter key including invalid characters,
                           followed by a space character, and finally the
                           original value concatenated into a single string.

   This event is emitted when the IMAP ID command was received, both for pre-
   as well as post-login. The parameters slightly differ for an unauthenticated
   client, e.g. there is no user id.


Mail Delivery
=============

Events emitted on mail delivery.

.. dovecot_event:field_group:: mail_delivery
   :inherit: smtp_recipient

   :field message_id: Message-ID header value (truncated to 200 bytes).
   :field message_subject: Subject header value, in UTF-8 (truncated to 80
     bytes).
   :field message_from: Email address in the From header (e.g.
     ``user@example.com``).
   :field message_size: Size of the message, in bytes.
   :field message_vsize: Size of the message with CRLF linefeeds, in bytes.
   :field rcpt_to: The envelope recipient for the message.


.. dovecot_core:event:: mail_delivery_started
   :added: v2.3.8
   :inherit: mail_delivery

   Message delivery has started.

   This event is useful for debugging mail delivery flow.


.. dovecot_core:event:: mail_delivery_finished
   :added: v2.3.8
   :inherit: mail_delivery

   :field error: Error message if the delivery failed.

   Message delivery is completed.

   This event is useful for logging and tracking mail deliveries.


DNS
===

Events emitted from Dovecot's internal DNS client.

.. dovecot_event:field_group:: dns

   :field error: Human readable error.
   :field error_code: Error code usable with net_gethosterror().


.. dovecot_core:event:: dns_worker_request_started

   DNS request started being processed by DNS worker process.


.. dovecot_core:event:: dns_request_started

   DNS request sent by DNS client library to DNS worker process.


.. dovecot_core:event:: dns_worker_request_finished
   :inherit: dns

   :field cached @added;v2.4.0,v3.0.0: Set to ``yes`` or ``no``
     depending if it was a cached reply or not.

   DNS request finished being processed by DNS worker process.


.. dovecot_core:event:: dns_request_finished
   :inherit: dns

   DNS request sent by DNS client library to DNS worker process has been
   finished.


SQL
===

Events emitted by Dovecot's internal SQL library.

.. Note:: This includes queries sent to Cassandra.

.. dovecot_core:event:: sql_query_finished

   :field error: Human readable error.
   :field error_code: Error code (if available).
   :field query_first_word: First word of the query (e.g. ``SELECT``).

   Response was received to SQL query.


.. dovecot_core:event:: sql_transaction_finished

   :field error: Human readable error.
   :field error_code: Error code (if available).

   SQL transaction was committed or rolled back.


.. dovecot_core:event:: sql_connection_finished

   Connection to SQL server is closed.


SMTP Server
===========

These events are emitted by Dovecot's internal lib-smtp library.

.. dovecot_event:field_group:: smtp_connection

   :field connection_id @added;v2.3.18: The session ID for this connection.
     The connection ID is forwarded through proxies, allowing correlation
     between sessions on frontend and backend systems.
   :field protocol: The protocol used by the connection; i.e., either ``smtp``
     or ``lmtp``.
   :field session: The session ID for this connection (same as
     ``connection_id``).

   .. todo:: Inherits from environment (LDA, LMTP or IMAP)

.. dovecot_event:field_group:: smtp_server
   :inherit: smtp_connection

   :field cmd_name @added;v2.3.9: Name of the command.
   :field cmd_input_name @added;v2.3.9: SMTP command name exactly as sent
     (e.g. ``MaIL``) regardless of whether or not it is valid.
   :field cmd_args @added;v2.3.18: SMTP command's full parameters (e.g.
     ``<from@example.com>``).
   :field cmd_human_args @added;v2.3.18: SMTP command's full parameters, as
     human-readable output. For SMTP, this is currently identical to
     ``cmd_args``.

.. dovecot_core:event:: smtp_server_command_started
   :inherit: smtp_server

   The command is received from the client.


.. dovecot_core:event:: smtp_server_command_finished
   :inherit: smtp_server

   :field status_code: SMTP status code for the (first) reply. This is = 9000
     for aborted commands (e.g., when the connection is closed prematurely).
   :field enhanced_code: SMTP enhanced status code for the (first) reply. This
     is "9.0.0" for aborted commands (e.g., when the connection is closed
     prematurely).
   :field error: Error message for the reply. There is no field for a success
     message.

   The command is finished. Either a success reply was sent for it or it
   failed somehow.


Transaction
-----------

.. dovecot_event:field_group:: smtp_transaction
   :inherit: smtp_connection

   :field transaction_id: Transaction ID used by the server for this
     transaction (this ID is logged, mentioned in the DATA reply and part of
     the "Received:" header). It is based on the connection_id with a ":<seq>"
     sequence number suffix.
   :field session @added;v2.3.18: Session ID for this transaction (same as
     ``transaction_id``).
   :field mail_from: Sender address.
   :field mail_param_auth: The value of the AUTH parameter for the MAIL
     command.
   :field mail_param_body: The value of the BODY parameter for the MAIL
     command.
   :field mail_param_envid: The value of the ENVID parameter for the MAIL
     command.
   :field mail_param_ret: The value of the RET parameter for the MAIL command.
   :field mail_param_size: The value of the SIZE parameter for the MAIL
     command.
   :field data_size: The number data of bytes received from the client. This
     field is only present when the transaction finished receiving the DATA
     command.


.. dovecot_core:event:: smtp_server_transaction_started
   :inherit: smtp_transaction

   The transaction is started.


.. dovecot_core:event:: smtp_server_transaction_finished
   :inherit: smtp_transaction

   :field status_code: SMTP status code for the (first failure) reply. This
     is = 9000 for aborted transactions (e.g., when the connection is closed
     prematurely).
   :field enhanced_code: SMTP enhanced status code for the (first failure)
     reply. This is "9.0.0" for aborted transactions (e.g., when the
     connection is closed prematurely).
   :field error: Error message for the first failure reply. There is no field
     for a success message.
   :field recipients: Total number of recipients.
   :field recipients_aborted: The number of recipients that got aborted before
     these could either finish or fail. This means that the transaction failed
     early somehow while these recipients were still being processed by the
     server.
   :field recipients_denied: The number of recipients denied by the server
     using a negative reply to the RCPT command.
   :field recipients_failed: The number of recipients that failed somehow
     (includes denied recipients, but not aborted recipients).
   :field recipients_succeeded: The number of recipients for which the
     transaction finally succeeded.
   :field is_reset: The transaction was reset (RSET) rather than finishing
     with a DATA/BDAT command as it normally would. This happens when client
     side issues the RSET command. Note that a reset event is a success (no
     error field is present).

   Transaction is finished or failed.


Recipient
---------

.. dovecot_event:field_group:: smtp_recipient
   :inherit: smtp_transaction

   :field rcpt_to: Recipient address.
   :field rcpt_param_notify: The value of the NOTIFY parameter for the RCPT
     command.
   :field rcpt_param_orcpt: The address value of the ORCPT parameter for the
     RCPT command.
   :field rcpt_param_orcpt_type: The address type (typically "rfc822") of the
     ORCPT parameter for the RCPT command.
   :field session: Session ID for this transaction and recipient. It is based
     on the ``transaction_id`` with a ":<seq>" recipient sequence number
     suffix. Only available for LMTP currently.


.. dovecot_core:event:: smtp_server_transaction_rcpt_finished
   :inherit: smtp_recipient

   :field status_code: SMTP status code for the reply. This is = 9000 for
     aborted transactions (e.g., when the connection is closed prematurely).
   :field enhanced_code: SMTP enhanced status code for the reply. This is
     "9.0.0" for aborted transactions (e.g., when the connection is closed
     prematurely).
   :field error: Error message for the reply if it is a failure. There is no
     field for a success message.
   :field dest_host @added;v2.4.0,v3.0.0: LMTP proxying only: Proxy destination
     hostname
   :field dest_ip @added;v2.4.0,v3.0.0: LMTP proxying only: Proxy destination IP
     address

   The transaction is finished or failed for this particular recipient. When
   successful, this means the DATA command for the transaction yielded success
   for that recipient (even for SMTP this event is generated for each
   recipient separately). Recipients can fail at various stages, particularly
   at the actual RCPT command where the server can deny the recipient.


SMTP Submit
===========

These events are emitted by Dovecot's internal lib-smtp library when sending
mails.

.. dovecot_event:field_group:: smtp_submit

   :field mail_from: The envelope sender for the outgoing message.
   :field recipients: The number of recipients for the outgoing message.
   :field data_size: The size of the outgoing message.

   .. todo:: Inherits from provided parent event


.. dovecot_core:event:: smtp_submit_started

   Started message submission.


.. dovecot_core:event:: smtp_submit_finished
   :inherit: smtp_submit

   :field error: Error message for submission failure.

   Finished the message submission.


Push Notifications
==================

.. dovecot_core:event:: push_notification_finished
   :inherit: mail_user

   :field mailbox @added;v2.3.10: Mailbox for event.

   Push notification event was sent. See :ref:`stats_push_notifications`


**********
Pigeonhole
**********

.. dovecot_event:field_group:: sieve

   :field user: Username of the user.

   .. todo:: Inherits from environment (LDA, LMTP or IMAP)

.. dovecot_event:field_group:: sieve_execute
   :inherit: sieve

   :field message_id: The message-id of the message being filtered.
   :field mail_from: Envelope sender address if available.
   :field rcpt_to: Envelope recipient address if available.

Sieve Runtime
=============

.. dovecot_event:field_group:: sieve_runtime
   :inherit: sieve_execute

   :field script_name: The name of the Sieve script as it is visible to the
     user.
   :field script_location: The full location string of the Sieve script.
   :field binary_path: The path of the Sieve binary being executed (if it is
     not only in memory).
   :field error: If present, this field indicates that the script execution
     has failed. The error message itself is very simple.


.. dovecot_core:event:: sieve_runtime_script_started
   :added: v2.3.9
   :inherit: sieve_runtime

   Started evaluating a Sieve script.


.. dovecot_core:event:: sieve_runtime_script_finished
   :added: v2.3.9
   :inherit: sieve_runtime

   Finished evaluating a Sieve script.


Sieve Action
============

.. dovecot_core:event:: sieve_action_finished
   :added: v2.3.9
   :inherit: sieve_execute

   :field action_name:
     .. list-table::
        :widths: 20 50
        :header-rows: 1

        * - Action
          - Description
        * - ``discard``
          - The discard action was executed successfully (only has an effect when
            no explicit keep is executed).
        * - ``fileinto``
          - The fileinto action was executed successfully.
        * - ``keep``
          - The keep action was executed successfully (maps to fileinto internally,
            so the fields are identical).
        * - ``notify``
          - The notify action was executed successfully (either from the notify or
            the enotify extension).
        * - ``pipe``
          - The pipe action (from vnd.dovecot.pipe extension) was executed
            successfully.
        * - ``redirect``
          - The redirect action was executed successfully.
        * - ``reject``
          - The reject action was executed successfully.
        * - ``report``
          - The report action (from vnd.dovecot.report extension) was executed
            successfully.
        * - ``vacation``
          - The vacation action was executed successfully.
   :field action_script_location: The location string for this Sieve action (a
     combination of "<script-name>: line <number>".
   :field redirect_target: The target address for the redirect action.
   :field notify_target: The list of target addresses for the notify action.
   :field report_target: The target address for the report action.
   :field report_type: The feedback type for the report action.
   :field fileinto_mailbox: The target mailbox for the fileinto/keep action.
   :field pipe_program: The name of the program being executed by the pipe
     action.

   Emitted when sieve action is completed successfully.


Sieve Storage
=============

Events emitted by sieve storage.

.. dovecot_event:field_group:: sieve_storage
   :inherit: sieve

   :field storage_driver: The driver name of the Sieve storage (``file``,
     ``ldap``, or ``dict``).
   :field script_location: The location string for the Sieve script.
   :field error: Error message for when storage operation has failed.


.. dovecot_core:event:: sieve_script_opened
   :added: v2.3.9
   :inherit: sieve_storage

   Opened a Sieve script for reading (e.g. for ManageSieve GETSCRIPT or
   compiling it at delivery).


.. dovecot_core:event:: sieve_script_closed
   :added: v2.3.9
   :inherit: sieve_storage

   Closed a Sieve script (after reading it).


.. dovecot_core:event:: sieve_script_deleted
   :added: v2.3.9
   :inherit: sieve_storage

   Deleted a Sieve script.


.. dovecot_core:event:: sieve_script_activated
   :added: v2.3.9
   :inherit: sieve_storage

   Activated a Sieve script.


.. dovecot_core:event:: sieve_script_renamed
   :added: v2.3.9
   :inherit: sieve_storage

   :field old_script_name: Old name of the Sieve script.
   :field new_script_name: New name for the Sieve script.

   Renamed a Sieve script.


.. dovecot_core:event:: sieve_storage_save_started
   :added: v2.3.9
   :inherit: sieve_storage

   :field script_name: Name of the Sieve script.

   Started saving a Sieve script.


.. dovecot_core:event:: sieve_storage_save_finished
   :added: v2.3.9
   :inherit: sieve_storage

   :field script_name: Name of the Sieve script.

   Finished saving a Sieve script.


ManageSieve
===========

Events emitted by the ManageSieve process.

.. dovecot_event:field_group:: managesieve

   :field cmd_name: Name of the ManageSieve command.
   :field cmd_name: Arguments for the ManageSieve command.
   :field error: Error message for when the command failed.

   .. todo:: Inherits from client event


.. dovecot_core:event:: managesieve_command_finished
   :inherit: managesieve

   :field script_name: Name for the Sieve script this command operated on
     (if any).
   :field old_script_name: Old name of the Sieve script (only set for
     RENAMESCRIPT).
   :field new_script_name: New name for the Sieve script (only set for
     RENAMESCRIPT).
   :field compile_errors: The number of compile errors that occurred (only set
     for PUTSCRIPT, CHECKSCRIPT and SETACTIVE when compile fails).
   :field compile_warnings: The number of compile warnings that occurred
     (only set for PUTSCRIPT, CHECKSCRIPT and SETACTIVE when script is
     compiled).

   Finished the ManageSieve command.


****
obox
****

obox plugin
===========

Index merging
-------------

Events emitted by the new index merging (
:dovecot_plugin:ref:`metacache_index_merging` = ``v2``).


.. dovecot_core:event:: obox_index_merge_started
   :inherit: mailbox

   Mailbox index merging was started.


.. dovecot_core:event:: obox_index_merge_finished
   :inherit: mailbox

   Mailbox index merging was finished.


.. dovecot_core:event:: obox_index_merge_uidvalidity_changed
   :inherit: mailbox

   Index merging required changing the mailbox's IMAP UIDVALIDITY.


.. dovecot_core:event:: obox_index_merge_uids_renumbered
   :inherit: mailbox

   :field renumber_count: Number of UIDs that were renumbered.

   Index merging required changing some mails' IMAP UIDs because they
   conflicted between the two indexes.


.. dovecot_core:event:: obox_index_merge_skip_uid_renumbering
   :inherit: mailbox

   :field renumber_count: Number of UIDs that should have been renumbered.

   Index merging should have renumbered UIDs due to conflicts, but there were
   too many of them (more than
   :dovecot_plugin:ref:`metacache_merge_max_uid_renumbers`), so no renumbering
   was done after all.


lib-metacache
-------------

Events emitted by the metacache library.

.. dovecot_event:field_group:: metacache_refresh

   :field metacache_status:
     Status of the refresh operation:
       * refresh_changed: Bundles were listed in storage. New bundles were
         found and downloaded.
       * refresh_unchanged: Bundles were listed in storage, but no new changes
         were found.
       * kept: Local metacache was used without any storage operations.
       * created: A new user or mailbox is being created.
   :field rescan: ``yes``, if mailbox is going to be rescanned.
   :field error: Error message if the refresh failed.


.. dovecot_core:event:: metacache_user_refresh_started
   :added: v2.3.11
   :inherit: mail_user, metacache_refresh

   Metacache is being refreshed when user is being accessed. Sent only when a
   storage operation is done to perform the refresh; the event isn't sent if
   the metacache is used without refreshing.


.. dovecot_core:event:: metacache_user_refresh_finished
   :added: v2.3.11
   :inherit: mail_user, metacache_refresh

   Metacache was refreshed when user is being accessed. Sent only when a
   storage operation is done to perform the refresh; the event isn't sent if
   the metacache is used without refreshing.


.. dovecot_core:event:: metacache_mailbox_refresh_started
   :added: v2.3.11
   :inherit: mailbox, metacache_refresh

   Metacache is being refreshed when mailbox is being accessed. Sent only when
   a storage operation is done to perform the refresh; the event isn't sent if
   the metacache is used without refreshing.


.. dovecot_core:event:: metacache_mailbox_refresh_finished
   :added: v2.3.11
   :inherit: mailbox, metacache_refresh

   Metacache was refreshed when mailbox is being accessed. Sent only when
   a storage operation is done to perform the refresh; the event isn't sent if
   the metacache is used without refreshing.


.. dovecot_event:field_group:: metacache_bundle_download

   :field filename: Bundle filename.
   :field bundle_type: Bundle type: ``diff``, ``base``, or ``self``.
   :field bundle_size: Size of the bundle file in bytes (uncompressed).
   :field error: Error message if the download failed.


.. dovecot_core:event:: metacache_user_bundle_download_started
   :added: v2.3.11
   :inherit: mail_user, metacache_bundle_download

   User index bundle file is being downloaded (can happen while the user is
   being refreshed).


.. dovecot_core:event:: metacache_user_bundle_download_finished
   :added: v2.3.11
   :inherit: mail_user, metacache_bundle_download

   User index bundle file was downloaded (can happen while the user is being
   refreshed).


.. dovecot_core:event:: metacache_mailbox_bundle_download_started
   :added: v2.3.11
   :inherit: mailbox, metacache_bundle_download

   Mailbox index bundle file is being downloaded (can happen while the mailbox
   is being refreshed).


.. dovecot_core:event:: metacache_mailbox_bundle_download_finished
   :added: v2.3.11
   :inherit: mailbox, metacache_bundle_download

   Mailbox index bundle file was downloaded (can happen while the mailbox is
   being refreshed).


.. dovecot_event:field_group:: metacache_upload

   :field error: Error message if the upload failed.


.. dovecot_core:event:: metacache_upload_started
   :added: v2.3.11
   :inherit: metacache_upload, mail_user, mailbox

   Changes in metacache are being uploaded to storage.


.. dovecot_core:event:: metacache_upload_finished
   :added: v2.3.11
   :inherit: metacache_upload, mail_user, mailbox

   Changes in metacache were uploaded to storage.


.. dovecot_event:field_group:: metacache_bundle_upload

   :field filename: Bundle filename.
   :field bundle_type: Bundle type: ``diff``, ``base``, or ``self``.
   :field bundle_size: Size of the bundle file in bytes (uncompressed).
   :field mailbox_guid: GUID of the mailbox being uploaded. Note that the
     mailbox name field may or may not exist in this event depending on
     whether a single mailbox or the whole user is being uploaded.
   :field reason: Reason for what changed in the indexes to cause this bundle
     to be created and uploaded.
   :field error: Error message if the upload failed.


.. dovecot_core:event:: metacache_user_bundle_upload_started
   :added: v2.3.11
   :inherit: mail_user, mailbox, metacache_bundle_upload

   User index bundle file is being uploaded. Can happen while the user is
   being uploaded.

   .. note:: This event can be inherited from a mailbox event, and include the
             mailbox fields, if the user upload was triggered by a mailbox
             upload.


.. dovecot_core:event:: metacache_user_bundle_upload_finished
   :added: v2.3.11
   :inherit: metacache_bundle_upload

   User index bundle file was uploaded. Can happen while the user is being
   uploaded.

   .. note:: This event can be inherited from a mailbox event, and include the
             mailbox fields, if the user upload was triggered by a mailbox
             upload.


.. dovecot_core:event:: metacache_mailbox_bundle_upload_started
   :added: v2.3.11
   :inherit: metacache_bundle_upload

   Mailbox index bundle file is being uploaded. Can happen while the mailbox
   is being uploaded.


.. dovecot_core:event:: metacache_mailbox_bundle_upload_finished
   :added: v2.3.11
   :inherit: metacache_bundle_upload

   Mailbox index bundle file was uploaded. Can happen while the mailbox is
   being uploaded.


.. dovecot_event:field_group:: metacache_clean

   :field min_priority: Which priority indexes are being cleaned.
   :field error: Error message if the upload failed.


.. dovecot_core:event:: metacache_user_clean_started
   :added: v2.3.11
   :inherit: mail_user, metacache_clean

   User is started to be cleaned from metacache, either entirely or only
   partially (only low priority files).


.. dovecot_core:event:: metacache_user_clean_finished
   :added: v2.3.11
   :inherit: mail_user, metacache_clean

   User is finished being cleaned from metacache.


.. dovecot_event:field_group:: metacache_pull_common

   :field source_host: Which host metacache is being pulled from.
   :field type: * ``server``: the event is emitted by the host that
                  metacache is being pulled from. (This host is
                  ``source_host``.)
                * ``client``: the event is emitted by the host that
                  is pulling metacache from ``source_host``.
   :field exit_code: Exit code for finished metacache pull commands. If
                     the command finished successfully it is ``0``.
                     The exit codes are the same as doveadm exit codes.
                     See :ref:`doveadm_error_codes` fore more details on
                     the exit codes.
   :field error: Error message if metacache pull failed.


.. dovecot_core:event:: metacache_pull_started
   :inherit: metacache_pull_common

.. dovecot_core:event:: metacache_pull_finished
   :inherit: metacache_pull_common


.. dovecot_event:field_group:: obox_rebuild

   :field mails_new: Number of new mails found.
   :field mails_temp_lost: Number of mails temporarily lost due to "Object
     exists in dict, but not in storage".
   :field mails_lost: Number of mails that existed in index, but no longer
     exists in storage.
   :field mails_lost_during_resync: Number of new mails found, but when doing
     GUID the mail no longer existed.
   :field mails_kept: Number of mails found in both the index and in storage.
   :field mails_total: Number of mails that exists in the mailbox now.
   :field guid_lookups: Number of mails whose GUIDs were looked up from the
     email metadata.
   :field guid_lookups_skipped: Number of mails whose GUIDs were not looked up
     due to reaching the GUID lookup limit.
   :field error: Error message if the rescan/rebuild failed.


.. dovecot_core:event:: obox_mailbox_rescan_started
   :added: v2.3.11
   :inherit: obox_rebuild

   Mailbox is being rescanned. A rescan happens when a mailbox is opened for
   the first time in this backend (or after it was cleaned away). All mails
   in the storage are listed and synced against the local indexes in
   metacache.


.. dovecot_core:event:: obox_mailbox_rescan_finished
   :added: v2.3.11
   :inherit: obox_rebuild

   Mailbox was rescanned. A rescan happens when a mailbox is opened for
   the first time in this backend (or after it was cleaned away). All mails
   in the storage are listed and synced against the local indexes in
   metacache.


.. dovecot_core:event:: obox_mailbox_rebuild_started
   :added: v2.3.11
   :inherit: obox_rebuild

   Mailbox is being rebuilt. A rebuild happens after some kind of corruption
   had been detected. All mails in the storage are listed and synced against
   the local indexes in metacache.


.. dovecot_core:event:: obox_mailbox_rebuild_finished
   :added: v2.3.11
   :inherit: obox_rebuild

   Mailbox was rebuilt. A rebuild happens after some kind of corruption
   had been detected. All mails in the storage are listed and synced against
   the local indexes in metacache.


.. dovecot_core:event:: obox_save_throttling
   :added: v2.4.0;v3.0.0

   :field pending_save: Number of message saves pending completion.
   :field pending_copy: Number of message copies pending completion.

   Obox is throttling the number of concurrent saves/copies.

   This event is used to expose externally the status of the internal parallelism,
   i.e. to let tests asses if we can actually reach the degree of parallelism
   expected through :dovecot_plugin:ref:`obox_max_parallel_writes` and
   :dovecot_plugin:ref:`obox_max_parallel_copies` or instead anything chokes the
   performance to less optimal levels.


fs-dictmap
----------

.. dovecot_core:event:: fs_dictmap_dict_write_uncertain
   :added: v2.3.13
   :inherit: fs_file

   :field path: Virtual FS path to the object (based on dict).
   :field object_id: Object ID in the storage.
   :field cleanup: ``success``, ``failed`` or ``disabled``. Indicates if
     uncertain write was attempted to be cleaned (deleted) and whether it was
     successful. See :ref:`dictmap_configuration_parameters`.
   :field error: Error message why the write initially failed.

   A dictionary write is uncertain (e.g., writes to Cassandra may
   eventually succeed even if the write initially appeared to fail).

   See also :dovecot_core:ref:`fs_object_write_uncertain` event.


.. dovecot_core:event:: fs_dictmap_object_lost
   :added: v2.3.10
   :inherit: fs_file

   :field path: Virtual FS path to the object (based on dict).
   :field object_id: Object ID in the storage.
   :field deleted @added;v2.3.15: Set to ``yes``, if the corresponding entry
     in dict has been deleted as the ``delete-dangling-links`` option was set
     (:ref:`dictmap_configuration_parameters`).

   "Object exists in dict, but not in storage" error happened.

   Normally this shouldn't happen, because the writes and deletes are
   done in such an order that Dovecot prefers to rather leak objects in storage
   than cause this error. A likely source of this error can be resurrected
   deleted data (see :ref:`cassandra` for more details).


.. dovecot_core:event:: fs_dictmap_max_bucket_changed
   :added: v2.3.13
   :inherit: fs_file, fs_iter

   :field reason: Either ``file`` or ``iter`` depending on the source of the
     event.
   :field old_max_bucket: The ``max_bucket`` value for the current mailbox,
     before the event was emitted.
   :field max_bucket: The newly set ``max_bucket`` value.
   :field error: Error string if error occurred. Only set if setting the new
     ``max_bucket`` value failed.

   This event is sent whenever the ``max_bucket`` value for a mailbox changes.
   There can be three situations when this happens.

     * A new mail is added to a mailbox, where the current bucket is found to
       be filled and the next bucket is started to be filled
       (``reason = file``).

     * Besides the expected situation, Dovecot emits this event if it
       encounters a bucket with a higher index then the current ``max_bucket``
       while iterating a mailbox (``reason = iter``).

     * .. versionchanged:: 2.3.14 In addition ``max_bucket`` can be shrunk in
                           case an iteration discovers empty buckets before
                           the current ``max_bucket`` value
                           (``reason = iter``).


.. dovecot_core:event:: fs_dictmap_empty_bucket_iterated
   :added: v2.3.14
   :inherit: fs_iter

   :field empty_bucket: Index of the empty bucket that was just discovered.
   :field max_bucket: The current ``max_bucket`` value.
   :field deleted_count: The count of deleted keys for the empty bucket.

   Nn empty bucket is found while iterating which is not the last bucket.

.. dovecot_core:event:: fs_object_write_uncertain
   :added: v2.4.0;v3.0.0
   :inherit: fs_file

   :field cleanup: ``success`` or ``failed``. Indicates if uncertain write
     was cleaned (deleted) successfully             |
   :field error: Error message why the write initially failed.

   Sent whenever an object write is uncertain.

   When a write HTTP operation times out actual outcome is uncertain.

   See also :dovecot_core:ref:`fs_dictmap_dict_write_uncertain` event.


Dictionaries
============

Events emitted by dictionary library and dictionary server.

.. dovecot_event:field_group:: dict_common

   :field driver: Name of the dictionary driver, e.g. ``sql`` or ``proxy``.
   :field error: Error, if one occurred.

.. dovecot_event:field_group:: dict_init
   :inherit: dict_common

   :field dict_name: Name of the dict as set in configurations.

.. dovecot_event:field_group:: dict_lookup
   :inherit: dict_common

   :field user: Username, if it's not empty.
   :field key: Key name, starts with ``priv/`` or ``shared/``.
   :field key_not_found: Set to ``yes`` if key not found.

.. dovecot_event:field_group:: dict_iteration
   :inherit: dict_lookup

   :field rows: Number of rows returned.

.. dovecot_event:field_group:: dict_transaction
   :inherit: dict_common

   :field user: Username, if it's not empty.
   :field rollback: Set to ``yes`` when transaction was rolled back.
   :field write_uncertain: Set to ``yes`` if write was not confirmed.


.. dovecot_core:event:: dict_created
   :added: v2.3.17
   :inherit: dict_init

   Dictionary is initialized.


.. dovecot_core:event:: dict_destroyed
   :added: v2.3.17
   :inherit: dict_init

   Dictionary is destroyed.


.. dovecot_core:event:: dict_lookup_finished
   :added: v2.3.11
   :inherit: dict_lookup

   Dictionary lookup finishes.


.. dovecot_core:event:: dict_iteration_finished
   :added: v2.3.11
   :inherit: dict_iteration

   Dictionary iteration finished.


.. dovecot_core:event:: dict_transaction_finished
   :added: v2.3.11
   :inherit: dict_transaction

   Dictionary transaction has been committed or rolled back.


.. dovecot_core:event:: dict_server_lookup_finished
   :added: v2.3.11
   :inherit: dict_lookup

   Dictionary server finishes lookup.


.. dovecot_core:event:: dict_server_iteration_finished
   :added: v2.3.11
   :inherit: dict_iteration

   Dictionary server finishes iteration.


.. dovecot_core:event:: dict_server_transaction_finished
   :added: v2.3.11
   :inherit: dict_transaction

   Dictionary server finishes transaction.


Login
=====

.. dovecot_event:field_group:: pre_login_client

   :field local_ip: Local IP address.
   :field local_port: Local port.
   :field remote_ip: Remote IP address.
   :field remote_port: Remote port.
   :field user: Full username.
   :field service: Name of service e.g. ``submission``, ``imap``.

.. dovecot_core:event:: login_aborted
   :added: v2.4.0;v3.0.0
   :inherit: pre_login_client

   :field reason: Short reason, see the short to long reason mapping in the table below.
   :field auth_successes: Number of successful authentications, which eventually failed due to other reasons.
   :field auth_attempts: Total number of authentication attempts, both successful and failed.
   :field auth_usecs: How long ago the first authentication attempt was started.
   :field connected_usecs: How long ago the client connection was created.

.. list-table::
   :widths: 25 75
   :header-rows: 1

   * - Reason
     - Description
   * - ``anonymous_auth_disabled``
     - Anonymous authentication is not allowed.
   * - ``authorization_failed``
     - Master user authentication succeeded, but authorization to access the requested login user wasn't allowed.
   * - ``auth_aborted_by_client``
     - Client started SASL authentication, but returned "*" reply to abort it.
   * - ``auth_failed``
     - Generic authentication failure. Possibly due to invalid username/password, but could have been some other unspecified reason also.
   * - ``auth_nologin_referral``
     - Authentication returned auth referral to redirect the client to another server. This is normally configured to be sent only when the client is a Dovecot proxy, which handles the redirection.
   * - ``auth_process_comm_fail``
     - Internal error communicating with the auth process.
   * - ``auth_process_not_ready``
     - Client disconnected before auth process was ready. This may indicate a hanging auth process if ``connected_usecs`` is large.
   * - ``auth_waiting_client``
     - Client started SASL authentication, but disconnected instead of sending the next SASL continuation reply.
   * - ``cleartext_auth_disabled``
     - Authentication using cleartext mechanism is not allowed at this point. It would be allowed if SSL/TLS was enabled.
   * - ``client_ssl_cert_untrusted``
     - Client sent an SSL certificate that is untrusted with :dovecot_core:ref:`auth_ssl_require_client_cert` set to ``yes``
   * - ``client_ssl_cert_missing``
     - Client didn't send SSL certificate, but :dovecot_core:ref:`auth_ssl_require_client_cert` is set to ``yes``
   * - ``client_ssl_not_started``
     - Client didn't even start SSL with :dovecot_core:ref:`auth_ssl_require_client_cert` set to ``yes``
   * - ``internal_failure``
     - Internal failure. The error log has more details.
   * - ``invalid_base64``
     - Client sent invalid base64 in SASL response.
   * - ``invalid_mech``
     - Unknown SASL authentication mechanism requested.
   * - ``login_disabled``
     - The user has the :ref:`nologin<authentication-nologin>` field set in passdb and is thereby not able to login.
   * - ``no_auth_attempts``
     - Client didn't send any authentication attempts.
   * - ``password_expired``
     - The user's password is expired.
   * - ``process_full``
     - :ref:`service_configuration-client_limit` and :ref:`service_configuration-process_limit` was hit and this login session was killed.
   * - ``proxy_dest_auth_failed``
     - Local authentication succeeded, but proxying failed to authenticate to the destination hop.
   * - ``shutting_down``
     - The process is shutting down so the login is aborted.
   * - ``user_disabled``
     - User is in deny passdb, or in some other way disabled passdb.


Login Proxy
===========

Events emitted when login process proxies a connection to a backend.

.. dovecot_event:field_group:: login_proxy
   :inherit: pre_login_client

   :field dest_host: Host name of the proxy destination (if proxying is
     configured with IP address, will have the same value as ``dest_ip``).
   :field dest_ip: Proxy destination IP.
   :field dest_port: Proxy destination port.
   :field source_ip: Source IP where proxy connection originated from.
   :field master_user: If proxying is done with a master user authentication,
     contains the full username of master user.

.. dovecot_event:field_group:: login_proxy_session
   :inherit: login_proxy

   :field source_port: Source port where proxy connection originated from.
   :field reconnect_attempts: Number of times connection failed and
     reconnection was attempted.


.. dovecot_core:event:: proxy_session_started
   :added: v2.3.18
   :inherit: login_proxy

   Connection to proxy destination has started.


.. dovecot_core:event:: proxy_session_established
   :added: v2.3.18
   :inherit: login_proxy_session

   Connection to proxy destination is established and user is successfully
   logged into the backend.


.. dovecot_core:event:: proxy_session_finished
   :added: v2.3.18
   :inherit: login_proxy_session

   :field error: If login to destination failed, contains the error.
   :field disconnect_side: Which side disconnected: ``client``, ``server``,
     ``proxy``.
   :field disconnect_reason: Reason for disconnection (empty = clean
     disconnect).
   :field idle_usecs: Number of seconds the connection was idling before
     getting disconnected.
     .. versionchanged:: v2.4.0;v3.0.0 This was previously named idle_secs.
   :field net_in_bytes @changed;v2.4.0,v3.0.0: Amount of data read from client, in bytes.
   :field net_out_bytes @changed;v2.4.0,v3.0.0: Amount of data written to client, in bytes.

   Connection to proxy destination has ended, either successfully or with
   error.


***********
FTS-Dovecot
***********

lib-fts-index
=============

.. dovecot_core:event:: fts_dovecot_too_many_triplets
   :added: v2.3.15
   :inherit: mail_user

   :field triplet_count: Number of triplets found.

   Emitted when number of triplets exceeds the limit defined by
   :dovecot_plugin:ref:`fts_dovecot_max_triplets`.


*******
Cluster
*******

cluster
=======

.. dovecot_core:event:: cluster_user_group_move_started
   :added: v3.0.0

   :field group: User group name.

.. dovecot_core:event:: cluster_user_group_move_finished
   :added: v3.0.0

.. dovecot_core:event:: cluster_user_move_started
   :added: v3.0.0

   :field group: User group name.
   :field moved_users: Number of users moved successfully within this
     group.
   :field failed_users: Number of users whose moving failed.
   :field error: Reason why group moving (partially) failed.


.. dovecot_core:event:: cluster_user_move_finished
   :added: v3.0.0

   :field user: Username being moved.
   :field dest_host: Destination host where user is being moved to.
   :field error: Reason why user moving failed.
