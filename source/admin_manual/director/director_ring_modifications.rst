.. _director_ring_modification:

============================
Director Ring Modifications
============================

A new director server is added by:

* Add the server to ``director_servers`` setting so that the director is remembered even after a cluster restart.
* ``doveadm director ring add`` command can be used to add the director to an already running ring.

A director server can be removed with ``doveadm director ring remove``. You can see the current ring state with doveadm ``director ring status``.