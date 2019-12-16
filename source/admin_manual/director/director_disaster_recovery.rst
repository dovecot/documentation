.. _director_disaster_recovery:

================================
Director Disaster Recovery
================================

Director servers share the same global state. This means that if there are some bugs, the same bug probably ends up affecting the entire director cluster. Although director is nowadays pretty well tested, it's possible that something new unexpected happens. This chapter explains how to fix such situations if they ever happen. 

In case the director ring has become somehow confused and the ring's connections don't look exactly correct, you can restart some of the directors (service dovecot restart), which are connected to the wrong servers. Directors should always automatically retry connecting to their correct neighbors after failures, so this manual restarting isn't normally necessary.


Full Director State Reset
==========================

If the directors start crashing or logging errors and failing user logins, there are two ways the service could be restored:

* ``doveadm director flush -F`` resets all the users' state immediately. 

.. Note:: This command shouldn't be used unless absolutely necessary, because it immediately forgets all the existing user assignments and doesn't kill any existing connections. 

This means that for all the active users, the same user could be simultaneously accessed by different backends.

* A safer way would be to shutdown the entire director cluster and starting it back up from zero state. This may also be necessary if the forced director flush doesn't work for some reason. 

.. Note:: It's not enough to simply restart each director separately, because after the restart it'll receive the earlier state from the next running director. 

All the directors must be shut down first.
