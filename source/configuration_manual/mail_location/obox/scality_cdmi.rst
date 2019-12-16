.. _scality_cdmi:

======================
Scality CDMI
======================

.. code-block:: none

   mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=/:CONTROL=/

We'll use 2 + 3 chars of the MD5 of the username at the beginning of each object path to improve performance. These directories should be pre-created to CDMI. The index and control dirs have to point to the user's home directory.

The parameters specific to Scality CDMI are:

+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| Parameter                         |Description                                                                       | Default      |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| preserve_objectid_prefix=<prefix> |Specifies the URL prefix, which is preserved before the cdmi_objectid/ in paths.  | none         |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| bulk_link_limit                   |Number of link operations supported within the same bulk link request.            | 1000         |
|                                   |                                                                                  |              |
|                                   |.. versionadded:: 2.2.36                                                          |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| bulk_link                         |Set to 1 to enable using bulk link requests                                       | v2.2: 0      |
|                                   |                                                                                  |              |
|                                   |.. deprecated:: 2.2.36                                                            |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+
| use_listing                       |Use the Scality "listing" API rather than "readdir" API.                          | none         |
|                                   |This improves listing performance.                                                |              |
|                                   |                                                                                  |              |
|                                   |.. versionadded:: 2.3.8                                                           |              |
+-----------------------------------+----------------------------------------------------------------------------------+--------------+


.. code-block:: none

   plugin {
    obox_fs = fscache:1G:/var/cache/mails:compress:gz:6:scality:http://scality-url/mails/?addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&use_listing
    obox_index_fs = compress:gz:6:scality:http://scality-url/mails/?addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&use_listing

    # With bulk-delete and bulk-link enabled, parallel operations can be large.
    # They should not be larger than bulk_delete_limit and bulk_link_limit.
    obox_max_parallel_copies = 1000
    obox_max_parallel_deletes = 1000
   }

The X-Dovecot-Hash header is important for CDMI load balancer stickiness.
