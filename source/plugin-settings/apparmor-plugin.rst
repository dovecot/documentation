.. _apparmor:

=================
apparmor plugin
=================

Apparmor support plugin. A simple plugin which allows changing "hat" (apparmor context) when user is loaded. Context is changed back to default on user deinit. Multiple hats are supported, and passed to apparmor_change_hatv function. 

.. versionadded:: v2.2.32

Configuration
=============

.. code-block:: none

  mail_plugins = $mail_plugins apparmor

  plugin {
    apparmor_hat = hat_name
    apparamor_hat2 = another_hat

You can also specify hats from user or password database. If you provide from
passdb, use ``userdb_apparmor_hat=hat`` and subsequent hats as
``userdb_apparmor_hat2`` and so forth. From userdb, you can omit the
``userdb_`` prefix.

It's also possible to combine these, so that you can provide some of the hats
from config and some from passdb/userdb configuration. If you want to provide
``apparmor_hat2`` from config, make sure you provide ``apparmor_hat`` from
userdb or passdb always, otherwise ``apparmor_hat2`` won't be seen.

Debugging
=========

Set ``mail_debug=yes`` to see context changes.
