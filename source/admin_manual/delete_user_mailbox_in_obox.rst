.. _delete_user_mailbox_in_obox:

=============================
Delete user mailbox in obox
=============================

After end user has ended contract with the service provider providing mailbox service, the mail data needs to be removed from not only the (object) storage but also from Cassandra and cached information needs also be removed from the serving backend.

1. Before the actual doveadm commands the user should be disabled in the userdb (e.g. LDAP) not to allow IMAP/POP/LMTP connections but not removed from the userdb (If user doesn't exist in the userdb, doveadm commands for that user will fail.)

2. After user is disabled the user's existing connections should be kicked out. This is done in the director, as running the command in proxy would only kick the connections in that particular proxy. This can also be managed by a provisioning system issuing a doveadm http call (not covered here).

.. code-block:: none

   doveadm director kick john@example.com

3. In order to accomplish this sysadmin needs to run doveadm command on director (or provisioning system needs to issue doveadm http command to director, not covered here). This will remove user's entries in Cassandra, object storage (all mails and indexes) and the backend where the user was active at that moment when he was kicked (step 2 above). Also fscache and metacache on that backend are cleaned from that user's data. The backends where this users data was previously cached will overwrite the user's data over time (fscache and metacache). 

.. code-block:: none

   doveadm obox user delete -u john@example.com

4. After the user's data is deleted the user can be removed from userdb. Whether or not that is wanted right away depends on the policy and the provisioning system, whether provisioning system can keep that email address reserved for typical 6 months before it's assigned to another user or if the userdb needs to keep that information for that period of time.
