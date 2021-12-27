======================================
Pigeonhole Sieve: Editheader Extension
======================================

.. seealso:: :ref:`pigeonhole_extension_editheader`

Settings
--------

.. pigeonhole:setting:: sieve_editheader_forbid_add
   :plugin: yes
   :values: @string

   A space-separated list of headers that cannot be added to the message
   header.

   Addition of the ``Subject:`` header cannot be prohibited, as required by
   the RFC specification. Therefore, adding this header to this setting has no
   effect.


.. pigeonhole:setting:: sieve_editheader_forbid_delete
   :plugin: yes
   :values: @string

   A space-separated list of headers that cannot be deleted from the message
   header.

   Deleting the ``Received:`` and ``Auto-Submitted:`` fields is always
   forbidden, while removing the ``Subject:`` header cannot be prohibited, as
   required by the RFC specification. Therefore, adding one of these headers
   to this setting has no effect.


.. pigeonhole:setting:: sieve_editheader_max_header_size
   :default: 2048
   :plugin: yes
   :values: @uint

   The maximum size in bytes of a header field value passed to the addheader
   command.

.. note:: The minimum value for this setting is 1024 bytes.


.. pigeonhole:setting:: sieve_editheader_protected
   :plugin: yes
   :values: @string

   A space-separated list of headers that cannot be added to or deleted from
   the message header.

   This setting is provided for backwards compatibility.

   It is a combination of the :pigeonhole:ref:`sieve_editheader_forbid_add`
   and :pigeonhole:ref:`sieve_editheader_forbid_delete` settings. The same
   limitations apply.
