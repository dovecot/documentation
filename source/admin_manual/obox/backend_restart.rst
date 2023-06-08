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

#. Use ``doveadm cluster backend update --load-factor 0 <backend host>`` so
   no more user groups will be assigned to the backend.

#. Use ``doveadm cluster backend evacuate <backend host>`` command to move
   all the user groups out of the backend.

#. Wait for the evacuation to complete.

#. Optionally use ``doveadm cluster backend update --status standby --load-factor 100 <backend host>``
   command to clarify the current state.

#. Shut down dovecot on the backend

Now all sessions are gone and backend is ready for upgrade or major config
change.

Starting up backend
-------------------

#. Synchronize metacache

   Metacache database may not be fully synchronized with the index files that
   actually exist on filesystem. It's recommended at this stage to either
   delete the metacache or rescan it.

   * Rescan metacache:

     .. dovecotadded:: 2.3.7

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

#. Add the backend to the cluster

   .. code-block:: none

      doveadm cluster backend update --status online <backend host>
