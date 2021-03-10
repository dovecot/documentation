.. _imap_preview:

============
IMAP PREVIEW
============

Dovecot supports the ability to access per-message preview text, retrieved
via the IMAP FETCH command.

Dovecot supports three different versions of PREVIEW retrieval, based on
the server version:

--------
RFC 8970
--------

Support for the RFC standard: `IMAP PREVIEW extension (RFC 8970)
<https://tools.ietf.org/html/rfc8970>`_.

.. versionadded:: v2.3.15

--------------------------------
PREVIEW w/algorithm (deprecated)
--------------------------------

This is support for a working draft of RFC 8970, where the preview algorithm
could be explicitly requested by the client.

See: `<https://datatracker.ietf.org/doc/draft-ietf-extra-imap-fetch-preview/06/>`_

This method of accessing the preview is deprecated, and should be replaced
by the standard RFC 8970 usage.

.. versionadded:: v2.3.7
.. deprecated:: v2.3.15

--------------------
SNIPPET (deprecated)
--------------------

This is support for a working draft of RFC 8970, when the extension was called
SNIPPET.

See: `<https://www.ietf.org/archive/id/draft-slusarz-imap-fetch-snippet-00.txt>`_

This method of accessing the preview is deprecated, and should be replaced
by the standard RFC 8970 usage.

.. versionadded:: v2.2.34
.. deprecated:: v2.3.15
