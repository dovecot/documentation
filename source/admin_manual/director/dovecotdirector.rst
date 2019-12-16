.. _dovecot_director:

==================
Dovecot Director
==================

Director can be used by Dovecot's ``IMAP``/``POP3``/``LMTP`` proxy to keep a temporary `user -> mail server mapping`. As long as user has simultaneous connections, the user is always redirected to the same server. Each proxy server is running its own director process, and the directors are communicating the state to each others. Directors are mainly useful for setups where all of the mail storage is seen by all servers, such as with NFS or a cluster filesystem.

The ``IMAP/POP3/LMTP`` proxies do load balancing and high-availability for the Dovecot Backends. They perform a job similar to a stateful load balancer. The main difference between a regular load balancer and Dovecot Director is that the director makes sure that a single user is never accessed by different backends at the same time. This is needed to keep the performance good and to avoid potential problems. In front of Dovecot directors there needs to be a load balancer to provide high availability for them.

Dovecot Directors connect to each others with TCP in a ring formation (each director connects to the next one, while the last one connects to the first one). This ring is used to distribute the current global state of the cluster, so any of the directors can die without losing state.

Normally the directors determine the backend server for users based on the MD5 hash of the username. This usually gives a good distribution of users to backends and it's very efficient for the directors: usually a director can determine the correct backend for a user without talking to any other directors. Only in some special situations, like when a backend has recently been removed, the director cluster will temporarily perform worse with slightly higher latency, because they need to talk to each others to determine the current state. This usually takes less than a second to get back to normal.

When a user logs in, the user will be assigned to a specific backend if it's not already done. This assignment will last for 15 minutes after the user's last session has closed. Afterwards it's possible that the user may end up in a different backend. It's also possible to explicitly move users around in the cluster (doveadm director move).

It's possible to assign different amount of work for different director servers by changing their ``vhost count``. By default each server has it set to 100. If you want one server to have double the number of users, you can set its vhost count to 200. Or if you want one server to have half the number of users, you can set its vhost count to 50. 

So for example if vhost counts for 3 backends are A=50, B=100, C=200, the probabilities of backends getting connections are:

====== ===================== ======
   A:   50/(50+100+200) =     14%
   B:   100/(50+100+200) =    29%
   C:   200/(50+100+200) =    57%
====== ===================== ======

Changing the vhost count affects only newly assigned users, so it doesn't have an immediate effect. Running doveadm director flush causes the existing connections to be moved immediately.

The doveadm director flush command works internally by individually moving all the users between backends. By default 100 users will be moved in parallel, but this can be overridden with the ``--max-parallel`` parameter. Using the ``-F`` parameter immediately reassigns the users to their new hosts without kicking any existing connections. The ``-F`` parameter shouldn't be normally used.

Interpreting user mappings
===========================

The command doveadm ``director status <username>`` shows diagnostic output of a users mappings in the director ring.

.. code-block:: none

   doveadm director status <username>

   Current: 10.12.90.17 (expires 2018-02-08 12:20:35)
   Hashed: 10.12.90.17
   Initial config: 10.12.90.17

**Current:** The backend host to which the user is currently mapped onto, or would be mapped onto, if they connected. The information is looked up in the shared director user directory. This accounts for e.g. director tags (https://wiki.dovecot.org/Director) and user moves. It shows actual, active mappings.

**Hashed:** The backend host which the user would be mapped onto, if they connected when the Current host mapping has expired from the user directory. This accounts for e.g. which backend hosts are currently known to be usable by the director ring. It also looks at tags. Does not account for moved users, as it does not do the lookup in the actual user directory.

**Initial config:** Same as the hashed mapping, but does not use currently known usable backends or vhost changes made to the running ring. Instead it maps using the mail backends defined in the Dovecot configuration file.