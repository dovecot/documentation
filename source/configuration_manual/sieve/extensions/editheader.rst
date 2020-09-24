.. _pigeonhole_extension_editheader:

======================================
Pigeonhole Sieve: Editheader Extension
======================================

The **editheader** extension
(`RFC5293 <http://tools.ietf.org/html/rfc5293/>`__) enables Sieve
scripts to delete and add message header fields, thereby allowing
interaction with other components that consume or produce header fields.

Configuration
-------------

The **editheader** extension is not available by default and needs to be
enabled explicitly by adding it to the :ref:`plugin-sieve-setting-sieve_extensions`  setting.

The following settings can be configured for the **editheader**
extension (default values are indicated):

:ref:`plugin-sieve-setting-sieve_editheader_max_header_size` = 2048
   The maximum size in bytes of a header field value passed to the
   ``addheader`` command. The minimum value for this setting is 1024
   bytes. The value is in bytes, unless followed by a k(ilo).

:ref:`plugin-sieve-setting-sieve_editheader_forbid_add` =
   A space-separated list of headers that cannot be added to the message
   header. Addition of the ``Subject:`` header cannot be prohibited, as
   required by the RFC specification. Therefore, adding this header to
   this setting has no effect.

:ref:`plugin-sieve-setting-sieve_editheader_forbid_delete` =
   A space-separated list of headers that cannot be deleted from the
   message header. Deleting the ``Received:`` and ``Auto-Submitted:``
   fields is always forbidden, while removing the ``Subject:`` header
   cannot be prohibited, as required by the RFC specification.
   Therefore, adding one of these headers to this setting has no effect.

:ref:`plugin-sieve-setting-sieve_editheader_protected` =
   A space-separated list of headers that cannot be added to or deleted
   from the message header. This setting is provided for backwards
   compatibility. It is a combination of the
   :ref:`plugin-sieve-setting-sieve_editheader_forbid_add` and
   :ref:`plugin-sieve-setting-sieve_editheader_forbid_delete` settings. The same limitations
   apply.

Invalid values for the settings above will make the Sieve interpreter
log a warning and revert to the default values.

Example
-------

::

   plugin {
     # Use editheader
     sieve_extensions = +editheader

     # Header fiels must not exceed one kilobyte
     sieve_editheader_max_header_size = 1k

     # Protected special headers
     sieve_editheader_forbid_add = X-Verified
     sieve_editheader_forbid_delete = X-Verified X-Seen
   }
