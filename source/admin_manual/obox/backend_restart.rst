.. _upgrading_backend_with_minimal_user_impact:

===========================================
Upgrading backend with minimal user impact
===========================================

This procedure is generic procedure to perform backend maintenance with minimal user impact

1. do this procedure 1 backend at a time 
- this is to minimize the user impact

2. in director set vhost count on that backend to 0
- this is to stop director process from mapping new user sessions to this backend and to notify dovemon that the backend is under maintenance

``doveadm director update <backend ip> 0``

3. wait 15mins for disconnected user session hashes to expire

4. in director check how many users still mapped to backend

``doveadm director status``

5. disable service lmtp on the selected backend
- this is to minimize metacache changes while doing metacache flush

``doveadm service stop lmtp``

6. shut down dovecot on the selected backend
- this will also flush metacache as long as dovecot-metacache-flush service is not disabled

``systemctl dovecot stop``

6. in director flush all user sessions in backend
- backend is now shut down, we need to tell director layer to rehash the sessions to remaining backends

``doveadm director down <backend ip>``
``doveadm director flush <backend ip>``

7. backend has now been removed from director ring and all user sessions are rehashed to remaining backends
- now all sessions are gone and backend is ready for upgrade or major config change

8. modify dovecot config file to match the proposed config
- as discussed previously in the config review workshop

9. remove old metacache database files
- as metacache service is now reduced to just one file the old 4 files need to be removed

``rm -f /var/lib/dovecot/metacache/metacache-users*``

10. clean up metacache as the tracking files are removed so that no data is left untracked

``rm -rf /var/dovecot/vmail/*``

11. start dovecot again

``systemctl start dovecot``

12. verify with test user that backend is useable

``doveadm mailbox list -u <uid>``
``doveadm mailbox status -u <uid> messages "*"``
``doveadm fetch -u <uid> text all > /dev/null``

- first command fetches mailbox list from metacache. this is fetched from storage now as metacache is reset
- second command fetches more info from metacache
- last command verifies that dovecot can fetch mail objects from storage

13. if all of the above commands succeed, backend can be put back to production

14. in director ring update backend status

``doveadm director update <backend ip> 100``

``doveadm director up <backend ip>``
