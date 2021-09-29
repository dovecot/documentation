.. _plugin-acl:

==========
acl plugin
==========

.. seealso:: See :ref:`acl` for a plugin overview.

Settings
^^^^^^^^

.. _plugin-acl-setting_acl:

``acl``
-------

- Default: <empty>
- Values:  :ref:`string`

The ACL driver to use. This setting is **REQUIRED** - if empty, the acl plugin
is disabled.

The format is:

.. code-block:: none

  backend[:option[:option...]]

Currently, there is a single backend available: ``vfile``. This backend
supports two ways of defining the ACL configuration:

  * *global*: ACL rules are applied to all users.
  * *per-mailbox*: Each mailbox has separate ACL rules. They are stored in a
    ``dovecot-acl`` file in each mailbox (or ``CONTROL``) directory.
    This is the default.

This backend has the following options:

============== ============================================================
Name           Description
============== ============================================================
<global_path>  If a path is defined, this is the location of the global ACL
               configuration file.
cache_secs     The interval, in seconds, for running stat() on the ACL file
               to check for changes. DEFAULT: 30 seconds
============== ============================================================

Example:

.. code-block:: none

  plugin {
    # Per-user ACL:
    acl = vfile

    # Global ACL; check for changes every minute
    #acl = vfile:/etc/dovecot/dovecot-acl:cache_secs=60
  }


.. _plugin-acl-setting_acl_defaults_from_inbox:

``acl_defaults_from_inbox``
---------------------------

.. versionadded:: 2.2.2

- Default: ``no``
- Values:  :ref:`boolean`

If yes, the default ACLs for private and shared namespaces (but not public
namespaces) are taken from the INBOX. This means that giving somebody access
to your INBOX will give them access to all your other mailboxes as well,
unless the specific mailboxes' ACLs override the INBOX's.


.. _plugin-acl-setting_acl_globals_only:

``acl_globals_only``
--------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. versionadded:: 2.2.31

If enabled, don't try to find ``dovecot-acl`` files from mailbox directories.
This reduces unnecessary disk I/O when only global ACLs are used.


.. _plugin-acl-setting_acl_groups:

``acl_groups``
--------------

- Default: <empty>
- Values:  :ref:`string`

A comma-separated string which contains all the groups the user belongs to.

A user's UNIX groups have no effect on ACLs (you can enable them by using a
special :ref:`post_login_scripting`).

The default ACL for mailboxes is to give the mailbox owner all permissions and
other users none. Mailboxes in public namespaces don't have owners, so by
default no one can access them.


.. _plugin-acl-setting-acl_ignore_namespace:

``acl_ignore_namespace``
------------------------

.. versionadded:: 2.3.15

- Default: <empty>
- Values:  :ref:`string`

Ignore ACLs entirely for the given namespace.

You can define muiltiple namespaces by appending an increasing number to the
setting name.

Example:

.. code-block:: none

  plugin {
    acl_ignore_namespace = virtual/
    # Ignore shared/ and all its (autocreated) child namespaces
    acl_ignore_namespace2 = shared/*
  }


.. _plugin-acl-setting-acl_shared_dict:

``acl_shared_dict``
-------------------

- Default: <empty>
- Values:  :ref:`string`

A shared mailbox dictionary that defines which users may LIST mailboxes shared
by other users.

See :ref:`user_shared_mailboxes_shared_mailbox_listing` for further details on
the contents of the dictionary entries.

Example:

.. code-block:: none

  plugin {
    acl_shared_dict = file:/var/lib/dovecot/shared-mailboxes
  }

.. seealso:: :ref:`dict`


.. _plugin-acl-setting_acl_user:

``acl_user``
------------

- Default: <empty>
- Values:  :ref:`string`

See :ref:`authentication-master_users_acls`.

See :ref:`setting-auth_master_user_separator` for the format of this setting. 


.. _plugin-acl-setting_master_user:

``master_user``
---------------

See :ref:`plugin-acl-setting_acl_user`.
