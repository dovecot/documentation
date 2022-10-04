.. _delete_user_mailbox_in_obox:

=============================
Delete user mailbox in obox
=============================

After end user has ended contract with the service provider providing mailbox service, the mail data needs to be removed from not only the (object) storage but also from Cassandra and cached information needs also be removed from the serving backend.

#. Before the actual doveadm commands the user should be disabled in the userdb
   (e.g. LDAP) not to allow IMAP/POP/LMTP connections but not removed from the
   userdb (If user doesn't exist in the userdb, doveadm commands for that user
   will fail.)

#. After user is disabled the user's existing connections should be kicked out.
   This is most easily done in the proxy, which forwards the kick command to the
   user's current backend. This can also be managed by a provisioning system
   issuing a doveadm http call (not covered here).

   .. code-block:: none

      doveadm cluster kick john@example.com

#. Delete the user from the storage running the "doveadm obox user delete"
   command in the proxy (or provisioning system needs to issue doveadm http
   command to proxy, not covered here):

   .. code-block:: none

      doveadm obox user delete -u john@example.com

   This command removes:

   * All mail data in object storage (mails, index bundles, FTS indexes)
   * All :ref:`fs-dictmap <dictmap_configuration>` data in Cassandra
   * User's metacache in the user's currently active backend (same backend as
     where the user was kicked in step 2)

   Note that this command does NOT remove:

   * User's objects from fscaches (which is usually rather short-lived, so it
     doesn't take long for the objects to drop out of the cache anyway)
   * User's metacache in backends where the user was accessed earlier, but
     which wasn't cleaned. These metacaches should become cleaned when disk
     space pressure pushes them out.
   * Any other dict data that is not deleted automatically while folders or
     mails are deleted (e.g. :dovecot_plugin:ref:`quota_clone_dict`,
     :dovecot_plugin:ref:`last_login_dict`)

#. After the user's data is deleted the user can be removed from userdb.
   Whether or not that is wanted right away depends on the policy and the
   provisioning system, whether provisioning system can keep that email
   address reserved for typical 6 months before it's assigned to another user
   or if the userdb needs to keep that information for that period of time.
