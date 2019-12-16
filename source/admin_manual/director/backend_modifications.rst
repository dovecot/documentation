.. _backend_modification:

=======================
Backend Modifications
=======================

The backends can be changed with:

.. code-block:: none
   
   doveadm director add

Add a new backend or change an existing one's vhost count.


New servers should also be added to the ``director_mail_servers`` setting in dovecot.conf so a cluster restart will know about it.

.. code-block:: none

   doveadm director update


Update vhost count of an existing backend. There only difference to ``doveadm director add`` is that it's not possible to accidentally add a new backend.

.. code-block:: none

   doveadm director up

Mark a director as being ``up``. This is the default state. This is usually updated automatically by dovemon.

.. code-block:: none

   doveadm director down


Mark a director as being ``down``. This is effectively the same as changing vhost count to ``0``. This is usually updated automatically by dovemon.


.. code-block:: none

   doveadm director remove


Remove a backend entirely. This should be used only if you permanently remove a server.

.. code-block:: none

   doveadm director flush


Move users in one specific backend or all backends to the backend according to the user's current hash. This is needed after ``down`` command or when setting vhost count to ``0`` to actually remove all the existing user assignments to the host.


The backend health checking is usually done by the Dovemon script (Dovecot Pro only), which automatically scans the backends and determines if they are up or down and uses these doveadm commands to update the backend states.


.. code-block:: none

   doveadm director status


Running this command without parameters will show you the current state.


.. code-block:: none

   doveadm director status user@domain


This will allow you to see which backend a user is currently assigned to and where it may end up being in future.


Cleanly Removing Backend
=========================

The cleanest way to take down a working backend server is to:

.. code-block:: none

   doveadm director update ip-addr 0


Flush all pending metacache changes to object storage.


On the director:

.. code-block:: none
   
   doveadm director flush ip-addr


Forget about the last users assigned to the backend and move them elsewhere.


On the backend server:

.. code-block:: none
   
   doveadm metacache flushall


Final flush to make sure there are no more metacache changes.


If the server is permanently removed:


.. code-block:: none
   
   doveadm director remove ip-addr


Remove the server from ``director_mail_servers`` setting in dovecot.conf.


Stop all traffic to all Backends
=================================

.. Note:: To be used only in case of emergency.


The cleanest way to take down all working backend servers is to run:


.. code-block:: none
   
   for dir in `director ring status | grep | awk '{ print $<correct index>}'`; do doveadm director update $dir 0; done


This might be needed to avoid total long lasting storage outage which will give storage time to recover and balance. Naturally all users are left without service until the backends are brought back up. 


Recover all traffic to all Backends
====================================

.. Note:: To be used to recover from storage emergency (above).

.. code-block:: none
   
   for dir in `director ring status | grep | awk '{ print $<correct index>}'`; do doveadm director update $dir 100; done
