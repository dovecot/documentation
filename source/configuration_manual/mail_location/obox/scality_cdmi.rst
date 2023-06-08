.. _scality_cdmi:

======================
Scality CDMI
======================

Scality-specific CDMI driver.

.. code-block:: none

   plugin {
     # Basic configuration:
     obox_fs = scality:http://scality.example.com/?parameters
   }

The parameters are:

+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| Parameter                         |Description                                                                       | Default      |
+===================================+==================================================================================+==============+
| See :ref:`http_storages` for common parameters                                                                                      |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| preserve_objectid_prefix=<prefix> |Specifies the URL prefix, which is preserved before the cdmi_objectid/ in paths.  | none         |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| bulk_link_limit                   |Number of link operations supported within the same bulk link request.            | 1000         |
|                                   |                                                                                  |              |
|                                   |.. dovecotadded:: 2.2.36                                                          |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| bulk_link                         |Set to 1 to enable using bulk link requests                                       | v2.2: 0      |
|                                   |                                                                                  |              |
|                                   |.. deprecated:: 2.2.36                                                            |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| use_listing                       |Use the Scality "listing" API rather than "readdir" API.                          | none         |
|                                   |This improves listing performance.                                                |              |
|                                   |                                                                                  |              |
|                                   |.. dovecotadded:: 2.3.8                                                           |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+

CDMI paths should have two levels of hash directories:

.. code-block:: none

   mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/

We'll use 2 + 3 chars of the MD5 of the username at the beginning of each
object path to improve performance. These directories should be pre-created to
CDMI.

Example configuration
---------------------

.. code-block:: none

   mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
   plugin {
     obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:zstd:3:scality:http://scality.example.com/?addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&use_listing&timeout_msecs=65000
     obox_index_fs = compress:zstd:3:scality:http://scality.example.com/?addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&use_listing&timeout_msecs=65000
     fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:zstd:3:scality:http://scality.example.com/%2Mu/%2.3Mu/%u/fts/?addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&use_listing&timeout_msecs=65000

     # With bulk-delete and bulk-link enabled, parallel operations can be large.
     # They should not be larger than bulk_delete_limit and bulk_link_limit.
     obox_max_parallel_copies = 1000
     obox_max_parallel_deletes = 1000
   }

The X-Dovecot-Hash header is important for CDMI load balancer stickiness.

Use a slightly higher timeout for requests than Scality's internal 60 second
timeout.
