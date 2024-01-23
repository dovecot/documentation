.. _apparmor_plugin:

===============
apparmor plugin
===============

`AppArmor <https://www.wikipedia.org/wiki/AppArmor>`_ support plugin, which
allows changing "hat" (apparmor context) when user is loaded. Context is
changed back to default on user deinit. Multiple hats are supported and passed
to `aa_change_hatv() <https://gitlab.com/apparmor/apparmor/-/wikis/manpage_aa_change_hat.2>`_
function.

Settings
========

See :ref:`plugin-apparmor`.

You can also specify hats from user or password database extra fields. If you
provide from :ref:`passdb <authentication-password_database_extra_fields>`,
use ``userdb_apparmor_hat=hat``. From
:ref:`userdb <authentication-user_database_extra_fields>`, you can omit the
``userdb_`` prefix.

Sample Configuration
^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  mail_plugins = $mail_plugins apparmor

  plugin {
    apparmor_hat = hat_name
  }

Debugging
=========

Enable :dovecot_core:ref:`log_debug` to see context changes.
