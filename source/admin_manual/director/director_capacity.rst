.. _director_capacity_sizing:

===============================
Director Capacity/Sizing
===============================

When architecting a Dovecot platform, it is a general rule that a Director ring should not be sized for more than ``10 million`` concurrent connections.

This limitation is used for the following reasons (non-inclusive list):

* New directors can take a long time to join the ring because the state is so large. During this time the ring isn't fully working. TODO: This may be optimized in future ( DOP-98 - director: New directors are added inefficiently to ring OPEN  )

* If a director fails and the two director ends need to join again, it is the same as if a new director was joining. But with large state that can take a long time. TODO: Future optimization (add support for faster joining when it's known that the states are supposed to be the same in both. They could perhaps still do some async background verification of users to make sure their states are the same.)

* The constant blabbering about what users are being accessed can use CPU and network bandwidth. All the state goes through a single process, so this doesn't scale great. There is no current plans to address this, as this is a limitation of a single process model.

Benchmarking
^^^^^^^^^^^^^

You can run a bunch of directors under a single dovecot instance with the config below. Load testing Perl script for it: http://dovecot.org/tools/director-test.pl

Configuration used for test: ``dovecot-director-test.conf``

``Benchmark results``: 4 node director. 60k requests/sec total and director_user_expire=30 secs -> 1,7 million active users which take 167 MB of memory and 2 MB input + 2 MB output network traffic between directors.



Real-World Usage Information
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
European Service Provider: There are total of 2.2M sessions and these are running on 10 directors. These are on physical HW.