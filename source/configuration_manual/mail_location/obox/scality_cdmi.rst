.. _scality_cdmi:

============
Scality CDMI
============

Scality-specific CDMI driver.

.. code-block:: none

   # Basic configuration:
   fs_driver = scality
   fs_scality_url = http://scality.example.com/

CDMI paths should have two levels of hash directories:

.. code-block:: none

   mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/

We'll use 2 + 3 chars of the MD5 of the username at the beginning of each
object path to improve performance. These directories should be pre-created to
CDMI.

.. _fs-scality:

Scality Settings
----------------

See also :ref:`fs-http`.

.. dovecot_plugin:setting_filter:: fs_scality
   :filter: fs_scality
   :plugin: obox
   :values: @named_filter

   Filter for Scality CDMI-specific settings.


.. dovecot_plugin:setting:: fs_scality_url
   :plugin: obox
   :values: @string

   URL for accessing the Scality CDMI storage.


.. dovecot_plugin:setting:: fs_scality_preserve_objectid_prefix
   :plugin: obox
   :values: @string

   Specifies the URL prefix, which is preserved before the cdmi_objectid/ in
   paths.


.. dovecot_plugin:setting:: fs_scality_bulk_delete_limit
   :plugin: obox
   :values: @uint
   :default: 1000

   Number of delete operations supported within the same bulk delete request.
   0 disables bulk delete requests.


.. dovecot_plugin:setting:: fs_scality_bulk_link_limit
   :plugin: obox
   :values: @uint
   :default: 1000

   Number of link operations supported within the same bulk link request.
   0 disables bulk link requests.


.. dovecot_plugin:setting:: fs_scality_use_listing
   :plugin: obox
   :values: @boolean
   :default: no

   Use the Scality "listing" API rather than "readdir" API.
   This improves listing performance.


.. _scality_http_settings:

Default HTTP Settings
---------------------

fs-scality overrides some of the default HTTP client settings:

 * :dovecot_core:ref:`http_client_max_idle_time` = 1s
 * :dovecot_core:ref:`http_client_max_parallel_connections` = 10
 * :dovecot_core:ref:`http_client_max_connect_attempts` = 3
 * :dovecot_core:ref:`http_client_request_max_redirects` = 2
 * :dovecot_core:ref:`http_client_request_max_attempts` = 5
 * :dovecot_core:ref:`http_client_connect_backoff_max_time` = 1s
 * :dovecot_core:ref:`http_client_user_agent` = Dovecot/VERSION
 * :dovecot_core:ref:`http_client_connect_timeout` = 5s
 * :dovecot_core:ref:`http_client_request_timeout` = 65s -
   Use a slightly higher timeout for requests than Scality's internal 60 second timeout.
 * :obox:ref:`fs_http_add_headers`/``X-Dovecot-Hash`` = ``%2Mu/%2.3Mu`` -
   This is important for CDMI load balancer stickiness.

You can override these and any other HTTP client or SSL settings by placing
them inside :dovecot_plugin:ref:`fs_scality` named filter.

Example configuration
---------------------

.. code-block:: none

   mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
   fs_scality_url = http://scality.example.com/
   fs_scality_use_listing = yes
   fs_compress_write_method = zstd
   obox {
     fs_driver = fscache
     fs_fscache_size = 512M
     fs_fscache_path = /var/cache/mails/%4Nu
     fs_parent {
       fs_driver = compress
       fs_parent {
         fs_driver = scality
       }
     }
   }
   metacache {
     fs_driver = compress
     fs_parent {
       fs_driver = scality
     }
   }
   fts_dovecot {
     fs_driver = fts-cache
     fs_scality_url = http://scality.example.com/%8Mu/%u/fts/
     fs_parent {
       fs_driver = fscache
       fs_fscache_size = 512M
       fs_fscache_path = /var/cache/fts/%4Nu
       fs_driver = compress
       fs_parent {
         fs_driver = scality
       }
     }
   }
   
   plugin {
     # With bulk-delete and bulk-link enabled, parallel operations can be large.
     # They should not be larger than fs_scality_bulk_delete_limit and
     # fs_scality_bulk_link_limit.
     obox_max_parallel_copies = 1000
     obox_max_parallel_deletes = 1000
   }
