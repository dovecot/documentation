.. _quota_configuration:

===================
Quota Configuration
===================

See :ref:`quota` for an overview of the Dovecot quota plugin.

Quota configuration is split into multiple settings: quota root and quota
rules.

Settings
========

See :ref:`plugin-quota` for all quota settings.

.. _quota_configuration_root:

Quota Root
^^^^^^^^^^

See :dovecot_plugin:ref:`quota` for the details on the syntax of the quota
root setting.

Quota root is a concept from `IMAP Quota specifications (RFC 2087)`_. Normally
you'll have only one quota root, but in theory there could be, e.g., "user
quota" and "domain quota" roots. It's unspecified how the quota roots interact
with each other (if at all). In some systems, for example, INBOX could have a
completely different quota root from the rest of the mailboxes (e.g. INBOX in
``/var/mail/`` partition and others in ``/home/`` partition).

.. _`IMAP Quota specifications (RFC 2087)`: https://tools.ietf.org/html/rfc2087

.. _quota_configuration_rules:

Quota Rules
^^^^^^^^^^^

See :dovecot_plugin:ref:`quota` for the details on the syntax of the quota
rule setting.

For `Maildir++ quota <maildir_quota>`_ if ``maildirsize`` file exists the
limits are taken from it but if it doesn't exist the ``?`` limits are used.

.. _`maildir_quota`: https://www.courier-mta.org/imap/README.maildirquota.html

Example
-------

.. code-block:: none

  quota_rule = *:storage=1G
  quota_rule2 = Trash:storage=+100M
  quota_rule3 = SPAM:ignore

This means that the user has 1GB quota, but when saving messages to Trash
mailbox it's possible to use up to 1.1GB of quota. The quota isn't
specifically assigned to Trash, so if you had 1GB of mails in Trash you could
still save 100MB of mails to Trash, but nothing to other mailboxes. The idea
of this is mostly to allow the clients' move-to-Trash feature work while user
is deleting messages to get under quota.  Additionally, any messages in the
SPAM folder are ignored per the ``ignore`` directive and would not count
against the quota.

The first quota rule muse be named ``quota_rule`` while the following
rules have an increasing digit in them. You can have as many quota rules as
you want.

.. _quota_configuration_per_user:

Per-User Quota
^^^^^^^^^^^^^^

You can override quota rules in your
:ref:`authentication-user_database_extra_fields`. Keep global settings in
configuration plugin section and override only those settings you need to in
your userdb.

If you're wondering why per-user quota isn't working:

* Check that :ref:`dovecot-lda <lda>` is called with ``-d`` parameter.
* Check that you're not using :ref:`authentication-static_user_database`.
* Check that ``quota_rule`` setting is properly returned by userdb. Enable
  ``auth_debug = yes`` and ``mail_debug = yes`` to see this.

For example:

.. code-block:: none

  plugin {
    quota = maildir:User quota
    quota_rule = *:storage=1G
    quota_rule2 = Trash:storage=+100M
  }

Next override the default 1GB quota for users:

LDAP
----

Quota limit is in ``quotaBytes`` field:

.. code-block:: none

  user_attrs = homeDirectory=home, quotaBytes=quota_rule=*:bytes=%$

Remember that ``user_attrs`` is used only if you use
:ref:`authentication-ldap_authentication`.

SQL
---

Example (for MySQL):

.. code-block:: none

  user_query = SELECT uid, gid, home, \
    concat('*:bytes=', quota_limit_bytes) AS quota_rule \
    FROM users WHERE userid = '%u'

  # MySQL with userdb prefetch: Remember to prefix quota_rule with userdb_
  # (just like all other userdb extra fields):
  password_query = SELECT userid AS user, password, \
    uid AS userdb_uid, gid AS userdb_gid, \
    concat('*:bytes=', quota_limit_bytes) AS userdb_quota_rule \
    FROM users WHERE userid = '%u'

Example (for PostgreSQL and SQLite):

Remember that ``user_query`` is used only if you use
:ref:`authentication-sql`.

.. code-block:: none

  user_query = SELECT uid, gid, home, \
    '*:bytes=' || quota_limit_bytes AS quota_rule \
    FROM users WHERE userid = '%u'

passwd-file
-----------

Example :ref:`authentication-passwd_file` entries:

.. code-block:: none

  user:{plain}pass:1000:1000::/home/user::userdb_quota_rule=*:bytes=100M
  user2:{plain}pass2:1001:1001::/home/user2::userdb_quota_rule=*:bytes=200M
  user3:{plain}pass3:1002:1002::/home/user3::userdb_mail=maildir:~/Maildir userdb_quota_rule=*:bytes=300M

passwd
------

The :ref:`authentication-passwd` userdb doesn't support extra fields. That's
why you can't directly set users' quota limits to passwd file. One
possibility would be to write a script that reads quota limits from another
file, merges them with passwd file and produces another passwd-file, which you
could then use with Dovecot's :ref:`authentication-passwd_file`.

Quota for Public Namespaces
^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can create a separate namespace-specific quota that's shared between all
users. This is done by adding ``:ns=<namespace prefix>`` parameter to quota
setting. For example:

.. code-block:: none

  namespace {
    type = public
    prefix = Public/
    #location = ..
  }

  plugin {
    quota = maildir:User quota
    quota2 = maildir:Shared quota:ns=Public/
    #quota_rules and quota2_rules..
  }

Quota for Private Namespaces
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can create a separate namespace-specific quota for a folder hierarchy.
This is done by adding another namespace and the ``:ns=<namespace prefix>``
parameter to quota setting. For example:

.. code-block:: none

  namespace {
    type = private
    prefix = Archive/
    #location = ..
  }

  plugin {
    # Maildir quota
    quota = maildir:User quota:ns=
    quota2 = maildir:Archive quota:ns=Archive/

    # Count quota
    #quota = count:User quota:%u.default:ns=
    #quota2 = count:Archive quota:%u.archive:ns=Archive/
    #quota_rules and quota2_rules..
  }

Note: If you're using dict quota, you need to make sure that the quota of the
``Archive`` namespace is calculated for another "user" than the default
namespace. Either track different namespaces in different backends or make
sure the users differs. ``%u.archive`` defines ``<username>.archive`` as key
to track quota for the ``Archive`` namespace; ``%u.default`` tracks the quota
of other folders. See :ref:`config_variables` for further help on variables.

Quota and Shared Namespaces
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Quota plugin considers shared namespaces against owner's quota, not the current user's.
There is a limitation that per-user quota configuration is ignored, and the
current user's configuration is used.

Public namespaces are ignored unless there is explicit quota specified for it.

Custom Quota Exceeded Message
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

See :dovecot_plugin:ref:`quota_exceeded_message`.

Example:

.. code-block:: none

  plugin {
    quota_exceeded_message = Quota exceeded, please go to http://www.example.com/over_quota_help for instructions on how to fix this.
  }

.. _quota_configuration_warning_scripts:

Quota Warning Scripts
^^^^^^^^^^^^^^^^^^^^^

See :dovecot_plugin:ref:`quota_warning`.

Example Configuration
---------------------

.. code-block:: none

  plugin {
    quota_warning = storage=95%% quota-warning 95 %u
    quota_warning2 = storage=80%% quota-warning 80 %u
    quota_warning3 = -storage=100%% quota-warning below %u # user is no longer over quota
  }

  service quota-warning {
    executable = script /usr/local/bin/quota-warning.sh
    # use some unprivileged user for executing the quota warnings
    user = vmail
    unix_listener quota-warning {
    }
  }

With the above example when user's quota exceeds 80%, ``quota-warning.sh`` is
executed with parameter 80. The same goes for when quota exceeds 95%. If user
suddenly receives a huge mail and the quota jumps from 70% to 99%, only the 95
script is executed.

You have to create the ``quota-warning.sh`` script yourself. Here is an
example that sends a mail to the user:

.. code-block:: shell

  #!/bin/sh
  PERCENT=$1
  USER=$2
  cat << EOF | /usr/local/libexec/dovecot/dovecot-lda -d $USER -o "plugin/quota=maildir:User quota:noenforcing"
  From: postmaster@domain.com
  Subject: quota warning

  Your mailbox is now $PERCENT% full.
  EOF

The quota enforcing is disabled to avoid looping. You'll of course need to
change the ``plugin/quota`` value to match the quota backend and other
configuration you use. Basically preserve your original "quota" setting and
just insert ":noenforcing" to proper location in it. For example with dict
quota, you can use something like:
``-o "plugin/quota=count:User quota::noenforcing"``

.. _quota_configuration_overquota_flag:

Overquota-flag
^^^^^^^^^^^^^^

.. versionadded:: v2.2.16

Quota warning scripts can be used to set an overquota-flag to userdb (e.g.
LDAP) when user goes over/under quota. This flag can be used by MTA to reject
mails to an user who is over quota already at SMTP RCPT TO stage.

A problem with this approach is there are race conditions that in some rare
situations cause the overquota-flag to be set even when user is already under
quota. This situation doesn't solve itself without manual admin intervention
or the new overquota-flag feature: This feature checks the flag's value every
time user logs in (or mail gets delivered or any other email access to user)
and compares it to the current actual quota usage. If the flag is wrong, a
script is executed that should fix up the situation.

The overquota-flag name in userdb must be ``quota_over_flag``.

These settings are available:

* :dovecot_plugin:ref:`quota_over_flag_lazy_check`
* :dovecot_plugin:ref:`quota_over_flag_value`
* :dovecot_plugin:ref:`quota_over_script`

Example::

  plugin {
    # If quota_over_flag=TRUE, the overquota-flag is enabled. Otherwise not.
    quota_over_flag_value = TRUE

    # Any non-empty value for quota_over_flag means user is over quota.
    # Wildcards can be used in a generic way, e.g. "*yes" or "*TRUE*"
    #quota_over_flag_value = *

    quota_over_flag_lazy_check = yes
    quota_over_script = quota-warning mismatch %u
  }

.. _quota_configuration_grace:

Quota Grace
^^^^^^^^^^^

See :dovecot_plugin:ref:`quota_grace`.

With v2.2+, by default the last mail can bring user over quota. This is
useful to allow user to actually unambiguously become over quota instead of
fail some of the last larger mails and pass through some smaller mails. Of
course the last mail shouldn't be allowed to bring the user hugely over quota,
so by default in v2.2+ this limit is 10% of the user's quota limit.
(In v2.1 this is disabled by default.)

To change the quota grace, use:

.. code-block:: none

  plugin {
    # allow user to become max 10% over quota
    quota_grace = 10%%
    # allow user to become max 50 MB over quota
    quota_grace = 50 M
  }

.. _quota_configuration_max_mail_size:

Maximum Saved Mail Size
^^^^^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.2.29

See :dovecot_plugin:ref:`quota_grace`.

Dovecot allows specifying the maximum message size that is allowed to be
saved (e.g. by LMTP, IMAP APPEND or doveadm save). The default is 0, which is
unlimited. Since outgoing mail sizes are also typically limited on the MTA
side, it can be beneficial to prevent user from saving too large mails, which
would later on fail on the MTA side anyway.

.. code-block:: none

  plugin {
    quota_max_mail_size = 100M
  }

Quota Virtual Sizes
^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.2.19
.. versionchanged:: v2.4;v3.0

See :dovecot_plugin:ref:`quota_vsizes`.

Indicates that the quota plugin should use virtual sizes rather than physical
sizes when calculating message sizes. Required for the ``count`` driver.

.. code-block:: none

  plugin {
    quota_vsizes = yes
  }

In v2.4;v3.0 this is now automatically determined by the quota plugin.

.. _quota_configuration_admin:

Quota Admin Commands
^^^^^^^^^^^^^^^^^^^^

The :ref:`imap_quota plugin <plugin-imap-quota>` implements the ``SETQUOTA``
command, which allows changing the logged in user's quota limit if the user is
admin. Normally this means that a master user must log in with
``userdb_admin = y`` set in the master passdb. The changing is done via
dict_set() command, so you must configure the ``quota_set`` setting to point
to some dictionary where your quota limit exists. Usually this is in SQL,
e.g.: 

dovecot.conf:

.. code-block:: none

  plugin {
    quota_set = dict:proxy::sqlquota
  }
  dict {
    sqlquota = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
  }

dovecot-dict-sql.conf.ext:

.. code-block:: none

  # Use "host= ... pass=foo#bar" with double-quotes if your password has '#'
  # character.
  connect = host=/var/run/mysqld/mysqld.sock dbname=mails user=admin \
    password=pass
  # Alternatively you can connect to localhost as well:
  #connect = host=localhost dbname=mails user=admin password=pass # port=3306

  map {
    pattern = priv/quota/limit/storage
    table = quota
    username_field = username
    value_field = bytes
  }
  map {
    pattern = priv/quota/limit/messages
    table = quota
    username_field = username
    value_field = messages
  }

Afterwards the quota can be changed with:

.. code-block:: none

  a SETQUOTA "User quota" (STORAGE 12345 MESSAGES 123)
