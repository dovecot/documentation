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

Support for the standard: IMAP PREVIEW extension  :rfc:`8970`.

.. dovecotadded:: 2.3.15

--------------------------------
PREVIEW w/algorithm (deprecated)
--------------------------------

This is support for a working draft of :rfc:`8970`, where the preview algorithm
could be explicitly requested by the client.

See: `<https://datatracker.ietf.org/doc/draft-ietf-extra-imap-fetch-preview/06/>`_

This method of accessing the preview is deprecated, and should be replaced
by the standard :rfc:`8970` usage.

.. dovecotadded:: 2.3.7
.. dovecotdeprecated:: 2.3.15

--------------------
SNIPPET (deprecated)
--------------------

This is support for a working draft of :rfc:`8970`, when the extension was called
SNIPPET.

See: `<https://www.ietf.org/archive/id/draft-slusarz-imap-fetch-snippet-00.txt>`_

This method of accessing the preview is deprecated, and should be replaced
by the standard :rfc:`8970` usage.

.. dovecotadded:: 2.2.34
.. dovecotdeprecated:: 2.3.15
