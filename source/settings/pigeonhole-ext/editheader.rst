======================================
Pigeonhole Sieve: Editheader Extension
======================================

.. seealso:: :ref:`pigeonhole_extension_editheader`

.. _plugin-sieve-setting-sieve_editheader_max_header_size:

``sieve_editheader_max_header_size``
------------------------------------

 - Default: ``2048``
 - Value: :ref:`uint`

The maximum size in bytes of a header field value passed to the addheader command.
The minimum value for this setting is 1024 bytes.
The value is in bytes, unless followed by a k(ilo).

.. _plugin-sieve-setting-sieve_editheader_forbid_add:

``sieve_editheader_forbid_add``
-------------------------------

 - Default: <empty>
 - Value: :ref:`string`

A space-separated list of headers that cannot be added to the message header.
Addition of the ``Subject:`` header cannot be prohibited, as required by the RFC specification.
Therefore, adding this header to this setting has no effect.

.. _plugin-sieve-setting-sieve_editheader_forbid_delete:

``sieve_editheader_forbid_delete``
----------------------------------

A space-separated list of headers that cannot be deleted from the message header.
Deleting the ``Received:`` and ``Auto-Submitted:`` fields is always forbidden,
while removing the ``Subject:`` header cannot be prohibited, as required by the RFC specification.
Therefore, adding one of these headers to this setting has no effect.

.. _plugin-sieve-setting-sieve_editheader_protected:

``sieve_editheader_protected``
------------------------------

A space-separated list of headers that cannot be added to or deleted from the message header.
This setting is provided for backwards compatibility.
It is a combination of the :ref:`plugin-sieve-setting-sieve_editheader_forbid_add` and
:ref:`plugin-sieve-setting-sieve_editheader_forbid_delete` settings.
The same limitations apply.
