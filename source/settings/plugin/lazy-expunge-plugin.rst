.. _plugin-lazy-expunge:

===================
lazy-expunge plugin
===================

.. seealso:: See :ref:`lazy_expunge_plugin` for general plugin information.

Settings
^^^^^^^^

.. dovecot_plugin:setting:: lazy_expunge_mailbox
   :plugin: lazy-expunge
   :seealso: @lazy_expunge_plugin-storage_locations
   :values: @string

   The mailbox to move messages to when expunged. This setting MUST
   be defined or else lazy-expunge plugin will not be active.

   Specific mailboxes can be excluded by clearing this setting for those
   mailboxes or namespaces, e.g.:

   .. code-block:: none

      lazy_expunge_mailbox = .EXPUNGED
      namespace inbox {
	mailbox Drafts {
	  lazy_expunge_mailbox =
	}
      }
      namespace "External accounts" {
	lazy_expunge_mailbox =
      }

.. dovecot_plugin:setting:: lazy_expunge_only_last_instance
   :default: no
   :plugin: lazy-expunge
   :values: @boolean

   If yes, only move to expunged storage if this is the last copy of the
   message in the user's account. This prevents the same mail from being
   duplicated in the lazy-expunge folder as the mail becomes expunged from
   all the folders it existed in.

   This setting prevents copying mail to the lazy-expunge folder when using
   the IMAP MOVE command. When using COPY/EXPUNGE, this setting prevents
   duplicates only with the following mailbox formats:

   * :ref:`Maildir <maildir_mbox_format>` (with
     :dovecot_core:ref:`maildir_copy_with_hardlinks = yes <maildir_copy_with_hardlinks>`,
     which is the default)
   * :ref:`sdbox/mdbox <dbox_mbox_format>`
   * :ref:`obox with fs-dictmap <dictmap_configuration>`

   .. warning:: This setting does not fully work with obox without fs-dictmap (e.g.
                :ref:`S3-only <amazon_s3>` setup).
