.. _openstack_swift:

======================
OpenStack SWIFT
======================

.. code-block:: none

   plugin {
     # Basic configuration:
     obox_fs = swift:https://USER:APIKEY@AUTH-HOST.example.com/AUTHPATH?parameters
   }

The parameters are:

+-------------------------+----------------------------------------------------+
| Parameter               | Description                                        |
+=========================+====================================================+
| See :ref:`http_storages` for common parameters                               |
+-------------------------+----------------------------------------------------+
| container               | Swift container to use                             |
+-------------------------+----------------------------------------------------+
| key_prefix              | Object path prefix to use for storage requests     |
+-------------------------+----------------------------------------------------+
| auth_protocol           | Authentication protocol to use: swift-tempauth,    |
|                         | swift-keystone2 or swift-keystone3                 |
+-------------------------+----------------------------------------------------+
| region                  | Region sent for authentication                     |
+-------------------------+----------------------------------------------------+
| tenant                  | Tenant sent for authentication. Required for       |
|                         | swift-keystone3.                                   |
+-------------------------+----------------------------------------------------+
| project                 | Project sent for authentication. Only supported by |
|                         | swift-keystone3.                                   |
+-------------------------+----------------------------------------------------+
| internal_url            | "yes" (default) to use internal URL from Keystone. |
|                         | "no" to use public URL.                            |
+-------------------------+----------------------------------------------------+

Example configuration
---------------------

.. code-block:: none

   mail_location = obox:%u:INDEX=~/:CONTROL=~/
   plugin {
     obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:gz:6:swift:https://USER:APIKEY@swift.example.com:5000/v3/auth/?auth_protocol=swift-keystone3&container=mails&project=dovecot&region=RegionOne
     obox_index_fs = compress:gz:6:swift:https://USER:APIKEY@swift.example.com:5000/v3/auth/?auth_protocol=swift-keystone3&container=mails&project=dovecot&region=RegionOne
     fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:gz:6:swift:https://USER:APIKEY@swift.example.com:5000/v3/auth/?auth_protocol=swift-keystone3&container=mails&project=dovecot&region=RegionOne&key_prefix=%u/fts/
     obox_max_parallel_deletes = 10000
   }
