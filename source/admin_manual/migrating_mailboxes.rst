.. _migrating_mailboxes:

===================
Migrating mailboxes
===================

.. contents::
   :depth: 1
   :local:

General
=======

.. warning::

  Badly done migration will cause your IMAP and/or POP3 clients to re-download all mails. Read this page carefully.

This guide assumes that the target host has a v2.3 or newer version of Dovecot.

You should use migration when you are changing aspects, such as compression, encryption or mail location driver; or want to restructure your mails in some way.

Things that you should consider in your config:

 * :ref:`Mail user, home and location settings <mail_location_settings>`
 * IMAP client settings (when needed)
 * :ref:`Namespace definitions, including public and shared namespaces <namespaces>`
 * :ref:`ACL settings <acl>`
 * :ref:`Quota <quota>` without rules (to make sure quota gets calculated, but not enforced)
 * :ref:`Mail caching settings <mail_cache_settings>`
 * :dovecot_core:ref:`Attachment detection settings <mail_attachment_detection_options>`
 * :dovecot_core:ref:`Mailbox attribute settings <mail_attribute>`
 * :ref:`Compression <mail_compress_plugin>` and :ref:`encryption <mail_crypt_plugin>` settings
 * :ref:`NFS related settings <nfs>`

Sometimes, if your production configuration file has complex authentication flows, push notifications or other settings that might cause unwanted effects during migration,
you can make a separate migration configuration file. To use this configuration file, you can store it for example as ``/etc/dovecot/dovecot-migration.conf``,
and use it with ``doveadm -c /etc/dovecot/dovecot-migration.conf sync``.

Other settings to use::

  # this is sometimes needed with some broken servers
  #dsync_features = empty-header-workaround

  # Read multiple mails in parallel, improves performance
  mail_prefetch_count = 20

  # If you have very large mailboxes, you might want to tune this
  #dsync_commit_msgs_interval = 100 # default in v2.2.30+

  # If you need to hash other headers for whatever reason, you can change this
  #dsync_hashed_headers = Date Message-ID

  # Avoid useless IO
  mail_fsync = never

Testing
=======

It is a very good idea to do some test migrations first using test accounts to ensure everything works.

When migrating mails from another server, you should make sure that these are preserved:

 #. Message flags

    * Lost flags can be really annoying, you most likely want to avoid it.

 #. Message UIDs and UIDVALIDITY value

    *  If UIDs are lost, at the minimum clients' message cache gets cleaned and messages are re-downloaded as new.
    *  Some IMAP clients store metadata by assigning it to specific UID, if UIDs are changed these will be lost.

 #. Mailbox subscription list

.. _migrating_mailboxes_dovecot:

Migrating mailboxes from another Dovecot
========================================

Preparations
------------

If the old system is running v2.1.14+ , you can use doveadm protocol to migrate your mails. If the old system is older, see :ref:`migrating_mailboxes_imapc`.

First, setup doveadm service on old server::

  service doveadm {
     inet_listener {
       port = 12354
     }
  }

  doveadm_password = supersecret

Then put doveadm password to new server::

  doveadm_password = supersecret

Now you are ready to migrate.

Executing migration
-------------------

If you want to avoid any changes to your source system, unidirectional synchronization is recommended.

To migrate users, use::

  doveadm backup -Ru username tcp:host:port

If you are experiencing problems, run::

  doveadm -D backup -Ru username tcp:host:port

This will enable debug logging.

The doveadm backup command forces the destination to look exactly like the source, deleting mails and mailboxes if necessary.
If it's possible that the destination already has new mails (or other changes), use ``doveadm sync -1`` instead::

  doveadm -o imapc_password=bar sync -1Ru user imapc:

You can run the command again to perform incremental updates.

Note that Public and Shared namespaces are synchronized automatically (see caveats).

It is also possible to do two-way migration if you want to::

  doveadm backup -Ru username tcp:host:port
  doveadm sync -u username tcp:host:port

This allows you to do more seamless switchover. Test first!

Caveats
-------

 * Migrating shared namespaces is difficult prior v2.3.15+. To migrate Shared namespaces, you need to use -n Shared -n Shared/Mailbox.
 * If you are using ACLs, some ACL types can cause problems. Especially if you have ACLs that only permit writing to folder, but not reading it. This applies to shared folders only.
 * Migration can cause unexpectedly high loads on the source system, beware. There is no way to throttle the synchronization.
 * Avoid accessing the target mailboxes before the first sync. At best this causes warnings about GUID or UIDVALIDITY changes, and at worst it fails the sync entirely.

.. _migrating_mailboxes_imapc:

Migrating mailboxes over IMAP
=============================

When migrating mails over IMAP, you need to have valid credentials to the source system. You can either use master password, master user or individual user authentication.
This depends entirely on the source system. See :ref:`authentication-master_users` for more details.

Preparations
------------

Configure authentication on the source system to match your preference. Ensure both source and target system agree on usernames.

Configure IMAP client on the target system.

.. dovecotchanged:: 2.4.0,3.0.0 Some selected IMAPC features are auto-enabled
                    by default. Please refer to :dovecot_core:ref:`imapc_features`
                    for description on individual flags.

Common settings::

  # these are supported by standard adhering servers
  # With v2.4.0;v3.0.0 the following features are enabled by default, prior to
  # this version the following must be uncommented:
  #imapc_features = rfc822.size fetch-headers

  # If the old IMAP server uses INBOX. namespace prefix, set:
  #imapc_list_prefix = INBOX

  # Remote hostname
  imapc_host = remotehost

  ## if you are using TLS
  imapc_ssl = imaps
  imapc_port = 993

  # if you are using StartTLS
  imapc_ssl = starttls
  imapc_port = 143

  ## these default to system
  ssl_client_ca_dir = /etc/ssl/certs
  # or
  ssl_client_ca_file = /etc/ssl/ca-certificates.pem

Master password::

  imapc_user = %u
  imapc_password = supersecret

Master user::

  imapc_user = %u
  imapc_master_user = master-user
  imapc_password = master-password

Individual password::

  imapc_user = %u

  doveadm -o imapc_password=password backup -Ru user imapc:

You can verify that the settings are done correctly with::

  doveadm -o imapc_password=password -o mail_driver=imapc -o mail_path= mailbox list -u user

POP3 notes
----------

If you need to retain POP3 support on your new system, you should use :ref:`plugin-pop3-migration`.

::

  pop3c_host = hostname

  # Authenticate as masteruser / masteruser-secret, but use a separate login user.
  # If you don't have a master user, remove the pop3c_master_user setting.
  pop3c_user = %u
  pop3c_master_user = masteruser
  pop3c_password = masteruser-secret

  # if you are using TLS
  pop3c_ssl = pop3s
  pop3c_port = 995

  # if you are using StartTLS
  pop3c_ssl = starttls
  pop3c_port = 110

  # see imapc migration for

  namespace {
    prefix = POP3-MIGRATION-NS/
    mail_driver = pop3c
    mail_path = 
    list = no
    hidden = yes
  }

  protocol doveadm {
    mail_plugins = $mail_plugins pop3_migration
  }

  plugin {
    pop3_migration_mailbox = POP3-MIGRATION-NS/INBOX
  }

You can alternatively configure compatible UIDL format in Dovecot. See
:dovecot_core:ref:`pop3_uidl_format`.

Executing migration
-------------------

To migrate users, use::

   doveadm -o imapc_password=bar -o pop3c_password=bar backup -Ru user imapc:

If you are experiencing problems, enable debugging with the -D parameter::

  doveadm -D -o imapc_password=bar -o pop3c_password=bar backup -Ru username imapc:

The doveadm backup command forces the destination to look exactly like the source, deleting mails and mailboxes if necessary.
If it's possible that the destination already has new mails (or other changes), use ``doveadm sync -1`` instead::

  doveadm -o imapc_password=bar -o pop3c_password=bar sync -1Ru user imapc:

Note that Public and Shared namespaces are synchronized automatically (see caveats).

See :ref:`doveadm_error_codes` for details on how to handle errors.

Caveats
-------

  * You cannot migrate **to** imap, only from.

POP3 caveats
------------
  * POP3 message order (when it's different from IMAP message order) is not preserved with mbox format.
  * If source POP3 server merges multiple IMAP mailboxes into one POP3 INBOX, the migration won't be transparent.
  * If source IMAP and POP3 servers return messages somehow differently, pop3-migration plugin might not be able to match the messages
  * Don't trust the migration tools blindly. Verify manually that the UIDLs are correct before exposing real clients to Dovecot.
    You can do this by logging in using your old POP3 server, issuing UIDL command and saving the output.
    Then log in using Dovecot and save its UIDL output as well. Use e.g. ``diff`` command to verify that the lists are identical. Note that:

     *  If a client already saw changed UIDLs and decided to start re-downloading mails, it's unlikely there is anything you can do to stop it. Even going back to your old server is unlikely to help at that point.
     *  Some (many?) POP3 clients also require that the message ordering is preserved.
     *  Some clients re-download all mails if you change the hostname in the client configuration. Be aware of this when testing.


Migration from Gmail to Dovecot
===============================

You can use dsync migration via IMAP protocol, but there are a few things different with Gmail compared to other IMAP servers.
With Gmail when you delete a mail from POP3, the mail is only hidden from future POP3 sessions, but it's still available via IMAP. If you wish to preserve this functionality, there's a :dovecot_core:ref:`pop3_deleted_flag` setting.

Gmail has labels. If a message has multiple labels, it shows up in multiple IMAP folders, but it's still the same message and uses quota only once for that message.
Dovecot currently doesn't have such support, so the migration will copy the message to multiple folders and each instance will use up quota.
There's currently no easy fix for this, although there are some future plans to optionally not count message copies towards quota.

Even though the quota is duplicated, it doesn't mean that the storage usage has
to be duplicated. Use the doveadm sync's ``-a`` parameter to attempt to copy
mails with the same GUIDs.

A virtual ``All Mails`` mailbox needs to be configured using the virtual plugin. Then you need to give this mailbox as ``-a`` parameter, e.g.::

  doveadm sync -a "Virtual/All Mails" ...

Currently this is implemented by reading through all the GUIDs in the virtual mailbox. This of course isn't very efficient for things like incremental replication.
An upcoming conversation plugin will keep track of all the mails' GUIDs, so in future replication should be able to have this functionality efficiently as well.

Gmail has virtual folders: ``All Mail``, ``Starred`` and ``Important``. From migration point of view this means that the migration should skip most of these folders,
since their mails are in other folders anyway.
You can tell dsync to skip these folders::

  doveadm sync -x '\Flagged' -x '\Important'

by using the ``\flag`` parameters dsync finds the folders by their ``SPECIAL-USE`` flag rather than their name (which may be different for different user depending on their language).

The "All Mail" folder actually contains also "archived mails" that don't exist in any other folder. These mails need to be migrated. See below.

Google requires that SSL/TLS be enabled to connect through IMAP. Make sure that the following are enabled in your Dovecot configuration and set to appropriate values based on your distribution (usually either one is enough). See :ref:`migrating_mailboxes_imapc`.

Google has very limited support for username/password authentication, so you might have to use OAUTH2 or some other mechanism for logging in.

GMail Migration Feature
-----------------------

There is a :dovecot_core:ref:`imapc_features` = ``gmail-migration`` setting that helps with this migration. It will:

 * Set the :dovecot_core:ref:`pop3_deleted_flag` to mails that no longer exist in POP3
 * Return POP3 UIDL in GMail format so dsync can preserve it.
 * Add a new ``$GmailHaveLabels`` keyword to archived mails in the ``\All`` mailbox, which means those mails are not archived. You probably don't want to migrate these mails.

   * Note that mails in the ``\Important`` and ``\Flagged`` mailboxes are marked with ``\Important`` and ``\Starred`` labels. If you don't migrate mails that have ``$GmailHaveLabels`` then you must not exclude the ``\Flagged`` and ``\Important`` mailboxes or some of the mails won't be migrated.

For example use a command line::

  doveadm backup -a 'virtual/All' -O '-$GmailHaveLabels' -R -u user@domain imapc:
