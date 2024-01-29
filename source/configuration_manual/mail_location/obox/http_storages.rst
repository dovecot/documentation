.. _http_storages:

==========================
HTTP-Based Object Storages
==========================

The HTTP-based object storages use an HTTP URL to specify how the object
storage is accessed.

Similarly the URL uses URL escaping, so for example if password is ``foo/bar``
the URL is ``http://user:foo%2fbar@example.com/``.

Additionally, because Dovecot expands :ref:`%variables <config_variables>`, the
``%`` needs to be escaped. So the final string would be e.g.:

.. code-block:: none

   fs_s3_url = https://user:foo%%2fbar@example.com/ # password is foo/bar

See :ref:`fs-http` for settings common to all object storages.

Dovecot sends the following HTTP headers towards storage. They should be
logged for troubleshooting purposes:

* ``X-Dovecot-Username``
* ``X-Dovecot-Session-Id``
* ``X-Dovecot-Reason``

.. _fs-http:

HTTP-based Object Storage Settings
----------------------------------

.. dovecot_plugin:setting:: fs_http_add_headers
   :plugin: obox
   :values: @strlist

   Headers to add to HTTP requests.


.. dovecot_plugin:setting:: fs_http_log_headers
   :plugin: obox
   :values: @boollist

   Headers with the given name in HTTP responses are logged as part of any
   error, debug or warning messages related to the HTTP request. These headers
   are also included in the ``http_request_finished`` event as fields prefixed
   with ``http_hdr_``.


.. dovecot_plugin:setting:: fs_http_reason_header_max_length
   :plugin: obox
   :values: @uint
   :default: 0

   If non-zero, add ``X-Dovecot-Reason:`` header to the HTTP request. The value
   contains a human-readable string why the request is being sent.


.. dovecot_plugin:setting:: fs_http_slow_warning
   :plugin: obox
   :values: @time_msecs
   :default: 5s

   Log a warning about any HTTP request that takes longer than this time.


.. dovecot_plugin:setting:: fs_http_log_trace_headers
   :plugin: obox
   :values: @boolean
   :default: yes

   If yes, add ``X-Dovecot-User:`` and ``X-Dovecot-Session`` headers to HTTP
   request. The session header is useful to correlate object storage requests
   to AppSuite/Dovecot sessions.
