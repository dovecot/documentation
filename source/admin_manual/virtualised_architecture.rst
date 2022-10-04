.. _virtualised_architecture:

==============================
Virtualised Architecture
==============================

Dovecot can be run directly on physical hardware or virtualised using various virtualization technologies. 

We have customers using OpenStack, KVM, VMware and others. We are in the end
agnostic to the virtualization technology used, as long as there is no
overcommitment of resources (see below).

:ref:`Dovecot v3.0 cluster architecture <dovecot_cluster_architecture>`
contains 2 layers:

* Proxies
* Backends

In physical machine based hosting there are usually number of CPUs per each
instance type.

Sample configuration used in this article which is based on the needed
concurrent connections of a sample use case.

========================== ============= =============== ==================
   2 layer architecture      Instances       CPU Cores       Total cores
========================== ============= =============== ==================
 Proxy                          3             4                12
 Backend                        8             8                64
 Total                         11            12                76
========================== ============= =============== ==================

No over commitment of resources
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Dovecot does not benefit from over allocating of resources and that should be
avoided to avoid random errors in the system. This means if Dovecot is
configured to run on 4 cores, there should be 4 cores available for Dovecot.
The same applies to RAM: running out of RAM will happen and lead to random
errors if the visible RAM is over allocated on `host OS
<https://en.wikipedia.org/wiki/Virtual_machine>`_ and not available for Dovecot
running on `guest OS <https://en.wikipedia.org/wiki/Virtual_machine>`_.

Dovecot cares about the CPU cores, but the cores can be `hyper-threaded
<https://en.wikipedia.org/wiki/Hyper-threading>`_ cores, they don't have to be
physical cores if hyper threading is enabled and supported by the guest OS.

Overall in virtual environments more smaller virtual machines is recommended
over few larger machines. These smaller machines might not be economical in
physical servers, but are useful for virtualised hardware where several virtual
machines can be combined together to utilise a single physical host.

Proxy Virtualization
^^^^^^^^^^^^^^^^^^^^

Proxy layer sizing for physical servers: 2-4 cores per instance. As 2 core
physical machines are rare nowadays on servers, proxies are ideal targets for
virtualization. Typically on physical servers 4 cores are used if SSL is
offloaded from IMAPS to IMAP on the proxies. In most customer projects SSL is
offloaded on the physical Load Balancer, such as `F5
<https://www.f5.com/services/resources/glossary/load-balancer>`_, which leaves
the proxy infrastructure to Dovecot proxy use. Please see also `Virtualised
Proxy sizing` below.

Proxy layer can be expanded by adding CPUs and RAM therefore e.g. assigning
multiple login processes, one per CPU core, utilising the extra cores on the
system.

The proxy layer can also be expanded by adding more instances of proxy nodes
which is easy in virtualised environments.

Backend Virtualization
^^^^^^^^^^^^^^^^^^^^^^

Backend layer sizing for physical servers: 4-8 cores per instance. As the
backend is automatically spreading the load on all CPU resources available, it
will be more efficient to add more cores to backend instances than to other
nodes.

Backend layer can be expanded by adding CPUs and RAM therefore expanding the
throughput of the backend node. Please see also `Virtualised Backend sizing`
below.

The backend layer can also be expanded by adding more instances of backend
nodes which is easy in virtualised environments.

Sizing Virtual Machines
^^^^^^^^^^^^^^^^^^^^^^^

General rule of thumb is to have optimise for more smaller virtual instances
than aggregating less instances with more capacity per instance. This makes the
maintenance operations less disruptive and maintenance operations transparent
to end users as there are less users being affected in any eventual guest OS
maintenance.

As an example for VM sizing for node types is an use case where concurrent
sessions require 3 proxies and 8 backends.

Virtualised Proxy sizing
^^^^^^^^^^^^^^^^^^^^^^^^

As an example if the concurrent connections require 3 instances of 4 CPU
proxies it's better to have 12 single core proxy instances than 3 instances of
4 core proxies. Unless specifically configured the proxy does not utilise the
additional cores for login process which is one of the main processes on proxy.
If any of the proxy nodes needs to be taken offline from production for e.g. OS
upgrade, the effect is only 1/12 = 8,3% in the case of 12 single core proxy
instances and 1/3 = 33,3% if there are 3 instances of 4 core proxies.

Virtualised Backend sizing
^^^^^^^^^^^^^^^^^^^^^^^^^^

Backends are doing all the heavy lifting and in the case of using object
storage as the storage for emails and indexes, backends need fast IO capable
preferably local `ephemeral storage
<https://en.wikipedia.org/wiki/Persistent_data_structure>`_ which needs to be
existing for the duration of the virtual instance. No actual damage is done if
the local fscache or metacache is wiped. Fscache consists of temporary cache of
individual mail files which are cached as some clients are requesting larger
mails in parts. Caching the entire mail mean less IO to object storage.
Metacache in turn is the indexes and metadata which can be recovered from the
object storage in the case of new virtual machine or new user login - or a new
mail delivery - to a user whose data is not cached on the backend yet.

Same principle applies for backends as is true for proxies as
well: smaller instances are better than larger instances as the maintenance
operations are then less disruptive if there are more smaller nodes.

As an example if the concurrent connections sizing require 8 instances of 8
core backends, it's better to have 16 instances of 4 core backends. In the case
of 8 instances the hit of e.g. OS upgrade is 1/8 = 12,5 %, but in the case of
16 instances of 4 CPUs only 1/17 = 6.3% per node which needs to be upgraded.
There is not necessarily advantage to break the backends into small 2 core
instances as backends can utilise well the available CPU cores.

Allocating Virtual Instances on Physical Machines
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It is advisable to not collect the same role to same physical machine. In other
words not all proxies should be running on same physical node, but the physical
node should have different Dovecot roles assigned to it.

Recommendation is to collect Proxy and Backend to same physical
machine. If the space allows (in terms of CPUs and RAM) there could be multiple
times the same set per physical machine.

As an example using the same sizing of nodes as before, single physical machine
could be sharing:

========================== ============= =============== ==================
   2 layer architecture      Instances       CPU Cores       Total cores
========================== ============= =============== ==================
 Proxy                          2             3                6
 Backend                        4             4                16

                                                               22
========================== ============= =============== ==================

If the sample physical server has 24 cores, it leaves 2 cores for hypervisor.

Using 4 physical machines, equalling in total 88 needed cores to as in the
beginning, total of 96 cores are used as it's likely more economical sizing.
When using set of 4 equally configured physical hosts, loosing a single host
server means loosing 1/4 = 25% of the concurrent sessions which Dovecot will
balance to other existing machines. This 25% is quite a lot, but should not be
a likely scenario in any case with highly available modern server hardware.
