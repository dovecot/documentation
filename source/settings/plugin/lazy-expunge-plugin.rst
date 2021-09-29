.. _plugin-lazy-expunge:

===================
lazy-expunge plugin
===================

.. seealso:: See :ref:`lazy_expunge_plugin` for general plugin information.

Settings
^^^^^^^^

.. _plugin-lazy-expunge-setting-lazy_expunge:

``lazy_expunge``
----------------

- Default: <empty>
- Values:  :ref:`string`

The mailbox/namespace to move messages to when expunged. This setting MUST
be defined or else lazy-expunge plugin will not be active.

See :ref:`lazy_expunge_plugin-storage_locations` for configuration
information.


.. _plugin-lazy-expunge-setting-lazy_expunge_only_last_instance:

``lazy_expunge_only_last_instance``
-----------------------------------

- Default: ``false``
- Values:  :ref:`boolean`

If true, only move to expunged storage if this is the last copy of the message
in the user's account.

This setting works with the following mailbox formats:

* :ref:`Maildir <maildir_mbox_format>` (with
  :ref:`maildir_copy_with_hardlinks = yes <setting-maildir_copy_with_hardlinks>`,
  which is the default)
* :ref:`sdbox/mdbox <dbox_mbox_format>`
* :ref:`obox with fs-dictmap <dictmap_configuration>`

.. warning:: This setting does not work with obox without fs-dictmap (e.g.
             :ref:`S3-only <amazon_s3>` setup).

.. _plugin-lazy-expunge-setting-lazy_expunge_exclude:

``lazy_expunge_exclude``
------------------------

.. versionadded:: v2.3.17

- Default: <empty>
- Values:  :ref:`string`

Mailbox name/wildcard to exclude from lazy expunging.

Use either mailbox names or refer to them using special-use flags (e.g.
``\Trash``).

To exclude additional mailboxes, add sequential numbers to the end of the
plugin name. For example:

.. code-block:: none

  lazy_expunge_exclude = \Drafts
  lazy_expunge_exclude2 = External Accounts/*
