.. _dovecot_cluster_architecture:

============================
Dovecot Cluster Architecture
============================

.. Note:: This is a Dovecot Pro v3.0 feature.

.. dovecotadded:: 3.0.0

The Dovecot Cluster Architecture in v3.0 replaces the director component in
older Dovecot versions with a new cluster service. The cluster service provides:

 * Load balancer between Dovecot Proxies and Backends
 * User-stickiness to backends
 * High availability for backends and other sites
 * Load redistribution / user moving
 * Multi-site support

Users are always attempted to be accessed only via a single backend at a time.
This allows caching to work efficiently. When using object storage and multiple
sites, it's possible that the user is accessed simultaneously by multiple sites
when the sites' networks don't see each others (split brain). The obox format
handles this by eventually merging the changes and moving the user handling
back to a single site soon after the split brain is over.

.. image:: ../../_static/dovecot_cluster_architecture.png
