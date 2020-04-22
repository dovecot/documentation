.. _obox_backend_restart:

================================================
Restarting obox backend with minimal user impact
================================================

This procedure is generic procedure to perform backend maintenance with
minimal user impact.

.. note:: The best way to avoid any user impact is to avoid having to use this
          procedure in the first place:

	  * Upgrading can be simply done with installing new Dovecot deb/rpm
	    packages.
	  * Configuration changes can be done by modifying the config file and
	    running ``doveadm reload``. If there are configuration mistakes,
	    the reload will fail and preserve the original configuration.
	    Although this only happens for syntax mistakes and other mistakes
	    that can ``doveconf`` can catch - not mistakes that are detected
	    only at runtime.

Shutting down backend
---------------------

#. Do this procedure 1 backend at a time.

   This is to minimize the user impact.

#. In director set vhost count on that backend to 0.

   This is to stop director process from mapping new user sessions to this
   backend and to notify dovemon that the backend is under maintenance.

   .. code-block:: none

      doveadm director update <backend ip> 0

#. Wait 15mins for disconnected user session hashes to expire.

#. In director check how many users still mapped to backend.

   .. code-block:: none

      doveadm director status

#. Disable service lmtp on the selected backend.

   This is to minimize metacache changes while doing metacache flush.

   .. code-block:: none

      doveadm service stop lmtp

#. Shut down dovecot on the selected backend

   This will also flush metacache as long as dovecot-metacache-flush service
   is not disabled.

   .. code-block:: none

      systemctl dovecot stop

#. In director flush all user sessions in backend.

   Backend is now shut down, we need to tell director layer to rehash the
   sessions to remaining backends.

   .. code-block:: none

      doveadm director down <backend ip>
      doveadm director flush <backend ip>

#. Backend has now been removed from director ring and all user sessions are
   rehashed to remaining backends.

Now all sessions are gone and backend is ready for upgrade or major config
change.

Starting up backend
-------------------

#. Synchronize metacache

   Metacache database may not be fully synchronized with the index files that
   actually exist on filesystem. It's recommended at this stage to either
   delete the metacache or rescan it.

   * Rescan metacache:

     .. versionadded:: v2.3.7

     .. code-block:: none

        doveadm metacache rescan

   * Delete metacache:

     #. Remove old metacache database files.

	As metacache service is now reduced to just one file the old 4 files
	need to be removed.

        .. code-block:: none

           rm -f /var/lib/dovecot/metacache/metacache-users*

     #. Remove metacache from filesystem:

        .. code-block:: none

           rm -rf /var/dovecot/vmail/*

#. Start dovecot again.

   .. code-block:: none

      systemctl start dovecot

#. Verify with test user that backend is usable.

   .. code-block:: none

      doveadm mailbox list -u <uid>
      doveadm mailbox status -u <uid> messages "*"
      doveadm fetch -u <uid> text all > /dev/null

   * The first command fetches mailbox list from metacache. This is fetched
     from storage now as metacache is reset.
   * The second command fetches more info from metacache.
   * The last command verifies that dovecot can fetch mail objects from
     storage.

#. If all of the above commands succeed, backend can be put back to production.

#. In director ring update backend status

   .. code-block:: none

      doveadm director update <backend ip> 100
      doveadm director up <backend ip>
