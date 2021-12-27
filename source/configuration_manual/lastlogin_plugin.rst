.. _lastlogin_plugin:

=================
Last Login Plugin
=================

.. versionadded:: 2.2.14

This plugin can be used to update user's last-login timestamp in a configured
dictionary.

Settings
========

See :ref:`plugin-last-login`.

Example Configuration
=====================

.. code-block:: none

  protocol imap {
    mail_plugins = $mail_plugins last_login
  }
  protocol pop3 {
    mail_plugins = $mail_plugins last_login
  }

  plugin {
    last_login_dict = redis:host=127.0.0.1:port=6379
    #last_login_key = last-login/%u # default
  }

.. Note::

  We enable last_login plugin explicitly only for imap & pop3 protocols. If
  enabled globally, it'll also update the timestamp whenever new mails are
  delivered via lda/lmtp or when doveadm is run for the user. This can also be
  thought of as a feature, so if you want to update a different timestamp for
  user when new mails are delivered, you can do that by enabling the last_login
  plugin also for lda/lmtp and changing the last_login_key setting.

Example dict config with schema:

.. code-block:: none

  CREATE TABLE `users` (
    `userid` varchar(255) NOT NULL,
    ...
    `last_login` int(11) DEFAULT NULL,
    PRIMARY KEY (`userid`)
  )

  map {
    pattern = shared/last-login/$user
    table = users
    value_field = last_login
    value_type = uint

    fields {
      userid = $user
    }
  }
