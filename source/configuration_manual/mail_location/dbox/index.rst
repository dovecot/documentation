.. _dbox_settings:

==================
Dbox Configuration
==================

See :ref:`dbox <dbox_mbox_format>` for a technical description of Dovecot's
dbox mailbox format.

NOTE: **You must not lose the dbox index files, as they can't be regenerated
without data loss**.

Mail Location
^^^^^^^^^^^^^

To use **single-dbox**, use the tag ``sdbox`` in the
:ref:`mail location <mail_location_settings>`:

.. code-block:: none

  # single-dbox
  mail_location = sdbox:~/dbox

For backwards compatibility, ``dbox`` is an alias to ``sdbox`` in the mail
location. (This usage is deprecated.)

To use **multi-dbox**, use the tag ``mdbox`` in the
:ref:`mail location <mail_location_settings>`:

.. code-block:: none

  # multi-dbox
  mail_location = mdbox:~/mdbox

Default ``mail_location`` Keys
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For dbox, the default :ref:`mail_location_settings-keys` are:

================ ===============
Key              Default Value
================ ===============
``MAILDIRBOX``   ``mailboxes/``
``FULLDIRNAME``  ``dbox-Mails/``
================ ===============

.. _dbox_settings_alt_storage:

Alternate Storage
^^^^^^^^^^^^^^^^^

See :ref:`dbox alternate storage <dbox_mbox_format_alt_storage>` for further
information.

To specify an alternate storage area, use the ``ALT`` parameter in the mail
location. For example:

.. code-block:: none

  mail_location = mdbox:/var/vmail/%d/%n:ALT=/altstorage/vmail/%d/%n

will make Dovecot look for message data first under ``/var/vmail/%d/%n``
("primary storage"), and if it is not found there it will look under
``/altstorage/vmail/%d/%n`` ("alternate storage") instead. There's no problem
having the same (identical) file in both storages.

Keep the unmounted ``/altstorage`` directory permissions such that Dovecot
mail processes can't create directories under it (e.g. ``root:root 0755``).
This way if the alt storage isn't mounted for some reason, Dovecot won't
think that all the messages in alt storage were deleted and lose their flags.




mdbox Configuration Settings
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _setting-mdbox_preallocate_space:

``mdbox_preallocate_space``
---------------------------

- Default: ``no``
- Values: :ref:`boolean`

mdbox only: If enabled, preallocate space for newly created files.

In creation of new mdbox files, their size is immediately
preallocated as :ref:`setting-mdbox_rotate_size`.

This setting currently works only in Linux with certain filesystems (ext4
and xfs).


.. _setting-mdbox_rotate_interval:

``mdbox_rotate_interval``
-------------------------

- Default: ``0``
- Values:  :ref:`size`

mdbox only: The maximum age the dbox file may reach before it's rotated.

``0`` means there is no age-based rotation.


.. _setting-mdbox_rotate_size:

``mdbox_rotate_size``
---------------------

- Default: ``10M``
- Values:  :ref:`size`

mdbox only: The maximum size the dbox file may reach before it is rotated.
