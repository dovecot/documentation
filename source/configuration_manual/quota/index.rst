.. _quota:

===========
Quota
===========

See http://wiki.dovecot.org/Quota/Configuration for more details.

.. code-block:: none

  mail_plugins = $mail_plugins quota

Enable quota plugin for tracking and enforcing the quota.

.. code-block:: none

  protocol imap {
    mail_plugins = $mail_plugins imap_quota
  }

Enable the IMAP QUOTA extension, allowing IMAP clients to ask for the current
quota usage.

.. code-block:: none

  plugin {
    quota = count:User quota
  }

Track the current quota usage in Dovecot's index files.

.. code-block:: none

  plugin {
    quota_vsizes = yes
  }

Required by ``quota=count`` backend. Indicates that the quota plugin should use
virtual sizes rather than physical sizes when calculating message sizes.

.. code-block:: none

  plugin{
    quota_max_mail_size = 100M
  }

Controls the maximum message size that is allowed to be saved (e.g. by LMTP,
IMAP APPEND or doveadm save).

The default is ``0``, which is unlimited. Setting this is especially useful
with obox, because a single huge mail could eat all of the fscache causing
problems in the server globally.

This setting should usually be set to about the same size as the maximum
allowed incoming and/or outgoing mail size on on the MTA.

.. code-block:: none

  plugin{
    quota_warning = storage=100%% quota-warning 100 %u
    quota_warning2 = storage=95%% quota-warning 95 %u
    quota_warning3 = -storage=100%% quota-warning below %u
  }

Configure quota warning scripts to be triggered at specific sizes. Note that %%
needs to be written twice to avoid ``%variable`` expansion. For example, at 95%
usage a warning email could be sent to user. At 100% an external SMTP database
could be updated to reject mails directly.

At -100% user again has more quota available and the SMTP database can be
updated to allow mails again. The ``quota-warning`` means to connect to the
quota-warning UNIX socket, which is a Dovecot script service described below.

.. IMPORTANT::

  obox installations using quota_over_script must currently also have
  quota_over_flag_lazy_check=yes enabled. Otherwise the quota_over_flag
  checking may cause a race condition with metacache cleaning, which may end up
  losing folder names or mail flags within folders.

.. code-block:: none

  service quota-warning {
    executable = script /usr/local/bin/quota-warning.sh
    user = vmail
    unix_listener quota-warning {
    }
  }

Example ``quota-warning`` service which executes ``quota-warning.sh`` script.

You may also want to use quota_clone plugin to keep track of all the users'
quotas in an efficient database. (It's very slow to query every user's quota
from the index files directly.) See http://wiki.dovecot.org/Plugins/QuotaClone

Debugging Quota
================

User's current quota usage can be looked up with: ``doveadm quota get -u
user@domain``

User's current quota may sometimes be wrong for various reasons (typically only
after some other problems). The quota can be recalculated with:

``doveadm quota recalc -u user@domain``

See also
********

.. toctree::
  :maxdepth: 1

  unified_quota_configuration
