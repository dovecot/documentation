.. _welcome_plugin:

==============
Welcome plugin
==============

.. versionadded:: v2.2.25

Call a script when the user logs in for the first time. This is specifically
done when the INBOX is (auto)created. The scripts are called similarly to
:ref:`quota_configuration_warning_scripts`.

.. versionchanged:: v2.4;v3.0 The welcome plugin relies on creation or autocreation
                  of INBOX. If the mail_location is maildir and the INBOX location
                  is left default, there can be situations where the welcome script
                  is not triggered. That is the case when the user home dir is
                  created by an IMAP command that does not interact with INBOX
                  directly for example GETMETADATA.

                  Use ``maildir:~/Maildir:INBOX=~/Maildir/.INBOX`` to prevent this
                  issue from happening. See :ref:`maildir_settings` for more
                  details.

Settings
========

See :ref:`plugin-welcome`.

Example Configuration
=====================

.. code-block:: none

  mail_plugins = $mail_plugins welcome

  plugin {
    welcome_script = welcome %u
    welcome_wait = no
  }

  service welcome {
    executable = script /usr/local/bin/welcome.sh
    user = dovecot
    unix_listener welcome {
      user = vmail
    }
  }
