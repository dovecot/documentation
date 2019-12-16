.. _welcome_plugin:

==============
Welcome plugin
==============

.. versionadded:: v2.2.25

Call a script when the user logs in for the first time. This is specifically
done when the INBOX is (auto)created. The scripts are called similarly to
`quota warning scripts
<https://wiki.dovecot.org/Quota/Configuration#Quota_warnings>`_.

.. code-block:: none

  plugin {
    welcome_script = welcome %u
    # By default we run the script asynchronously, but with this option we
    # wait for the script to finish.
    #welcome_wait = yes
  }

  service welcome {
    executable = script /usr/local/bin/welcome.sh
    user = dovecot
    unix_listener welcome {
      user = vmail
    }
  }

  mail_plugins = $mail_plugins welcome
