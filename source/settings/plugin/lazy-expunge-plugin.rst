.. _plugin-lazy-expunge:

===================
lazy-expunge plugin
===================

.. seealso:: See :ref:`lazy_expunge_plugin` for general plugin information.

Settings
^^^^^^^^

.. dovecot_plugin:setting:: lazy_expunge
   :plugin: lazy-expunge
   :seealso: @lazy_expunge_plugin-storage_locations
   :values: @string

   The mailbox/namespace to move messages to when expunged. This setting MUST
   be defined or else lazy-expunge plugin will not be active.


.. dovecot_plugin:setting:: lazy_expunge_exclude
   :added: 2.3.17
   :plugin: lazy-expunge
   :values: @string

   Mailbox name/wildcard to exclude from lazy expunging.

   Use either mailbox names or refer to them using special-use flags (e.g.
   ``\Trash``).

   To exclude additional mailboxes, add sequential numbers to the end of the
   plugin name. For example:

   .. code-block:: none

     lazy_expunge_exclude = \Drafts
     lazy_expunge_exclude2 = External Accounts/*

   .. dovecotchanged:: 2.4.0,3.0.0 The  ``lazy_expunge_exclude`` setting
      matches also the namespace prefix in folder names. Previously the folder
      name was matched only without the namespace prefix.

      Namespaces match as follows:

      - The full folder name, including the namespace prefix.

        For example ``lazy_expunge_exclude = Public/incoming``
        would match the ``incoming`` folder in the ``Public/`` namespace.

      - For ``inbox=yes`` namespace, the folder name without the namespace prefix.

        For example ``lazy_expunge_exclude = incoming`` would match the ``incoming``
        folder in the INBOX namespace, but not in the ``Public/`` namespace.

      - The folder names support ``*`` and ``?`` wildcards.

      Namespace prefixes must NOT be specified and will not match for:

      - the ``INBOX`` folder
      - special-use flags (e.g. ``\Trash``)

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
