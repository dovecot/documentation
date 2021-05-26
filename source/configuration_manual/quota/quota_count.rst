.. _quota_backend_count:

====================
Quota Backend: count
====================

.. versionadded:: 2.2.19

The ``count`` quota backend tracks the quota internally within Dovecot's index
files. It is the **RECOMMENDED** way of calculating quota on recent Dovecot
installations.

Each mailbox's quota is tracked separately and when the current quota usage is
wanted to be known, the mailboxes' quotas are summed up together. To get the
best performance mailbox list indexes should be enabled.

.. warning::

  If you're switching from some other quota backend to ``count``, make
  sure that all the mails have their virtual sizes already indexed. Otherwise
  there may be a significant performance hit when Dovecot starts opening all
  the mails to get their sizes. You can help to avoid this by accessing the
  mailbox vsizes for all the users before doing the configuration change:
  ``doveadm mailbox status -u user@domain vsize '*'``.

Configuration
^^^^^^^^^^^^^

.. code-block:: none

  mailbox_list_index = yes

  # Avoid spending excessive time waiting for the quota calculation to finish
  # when mails' vsizes aren't already cached. If this many mails are opened,
  # finish the quota calculation on background in indexer-worker process. Mail
  # deliveries will be assumed to succeed, and explicit quota lookups will
  # return internal error. (v2.2.28+)
  mail_vsize_bg_after_count = 100

  plugin {
    # 10MB quota limit
    quota = count:User quota
    quota_rule = *:storage=10M

    # This is required - it uses "virtual sizes" rather than "physical sizes"
    # for quota counting:
    quota_vsizes = yes
  }
