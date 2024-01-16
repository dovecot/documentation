.. _welcome_plugin:

==============
Welcome plugin
==============

.. dovecotadded:: 2.2.25

Call a script when the user logs in for the first time. This is specifically
done when the INBOX is (auto)created. The scripts are called similarly to
:ref:`quota_configuration_warning_scripts`.

Settings
========

See :ref:`plugin-welcome`.

Example Configuration
=====================

.. code-block:: none

  mail_plugins {
    welcome = yes
  }

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
