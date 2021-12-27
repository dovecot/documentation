.. _rebalancing_director_backends:

====================
Rebalancing Backends
====================

Sometimes with long lasting IMAP connections you might end up in situation where you need to increase the amount of backends due to increased load. 

Here's a list of operations which should manually ease the situation and balance the load on the backend.

Start situation
^^^^^^^^^^^^^^^

 doveadm director status

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     80
  backend-02    100     70
  backend-03    100     60
  backend-04    100     10
  backend-05    100     10
  ============ ====== =======
  
  (total users = 230, 230/5 = 46 per backend)

Update vhost count on node 1 and 2 to have vhost count = 0
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# disable moving users to any backend that has too many of the users already:

doveadm director update backend-02 0

doveadm director update backend-03 0

Start flushing backends
^^^^^^^^^^^^^^^^^^^^^^^
doveadm director flush backend-01

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     34
  backend-02     0      70
  backend-03     0      60
  backend-04    100     33
  backend-05    100     33
  ============ ====== =======

Adjust vhost count back and flush next backend
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
doveadm director update backend-02 100

doveadm director flush backend-02

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     38
  backend-02    100     55
  backend-03     0      60
  backend-04    100     38
  backend-05    100     39
  ============ ====== =======

Adjust vhost count back and flush next backend
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
doveadm director update backend-03 100

doveadm director flush backend-03

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     42
  backend-02    100     58
  backend-03    100     43
  backend-04    100     43
  backend-05    100     44
  ============ ====== =======

Flush next backend
^^^^^^^^^^^^^^^^^^
doveadm director flush backend-04

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     43
  backend-02    100     59
  backend-03    100     43
  backend-04    100     40
  backend-05    100     45
  ============ ====== =======

Flush next backend
^^^^^^^^^^^^^^^^^^
doveadm director flush backend-05

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     44
  backend-02    100     60
  backend-03    100     44
  backend-04    100     41
  backend-05    100     41
  ============ ====== =======

Flush next backend
^^^^^^^^^^^^^^^^^^
# due to vhost changes, 02 still wasn't fully balanced, so flush it again:

doveadm director flush backend-02

.. code-block:: none

  =========== ======= =======
  backend     vhosts   users
  =========== ======= =======
  backend-01    100     46
  backend-02    100     48
  backend-03    100     46
  backend-04    100     45
  backend-05    100     45
  ============ ====== =======

Flush next backend
^^^^^^^^^^^^^^^^^^
# still not entirely perfect. could flush all the other backends again to make sure they're as balanced as hashing allows:

doveadm director flush backend-01

doveadm director flush backend-03

doveadm director flush backend-04

doveadm director flush backend-05
