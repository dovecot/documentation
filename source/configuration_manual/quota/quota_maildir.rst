.. _quota_backend_maildir:

======================
Quota Backend: maildir
======================

Maildir++ is the most commonly used quota backend with Maildir format.
Note that **Maildir++ quota works only with Maildir format**. With other
mailbox formats you should use :ref:`quota_backend_count`.

The ``maildir`` quota backend implements Maildir++ quota in Dovecot. Dovecot
implements the `Maildir++ specification`_, so Dovecot remains compatible with
`Courier`_, `maildrop`_, `Exim`_, etc.

.. _`Maildir++ specification`: https://www.courier-mta.org/imap/README.maildirquota.html
.. _`Courier`: https://www.courier-mta.org/
.. _`maildrop`: https://www.courier-mta.org/maildrop/
.. _`Exim`: https://www.exim.org/

There are two ways to configure Maildir++ quota limits:

1. Configure the limits in Dovecot. You most likely want to do this. See
   :ref:`quota_configuration`.
2. Make Dovecot get the limits from existing ``maildirsize`` files.

Only Maildir++-specific settings are described below. See
:ref:`quota_configuration` for more generic configuration.

Maildir++ quota relies on ``maildirsize`` file having correct information, so
if your users can modify the file in some way (e.g. shell access), you're
relying on the goodwill of your users for the quota to work.

You can't rely on Dovecot noticing external changes to Maildir and updating
maildirsize accordingly. This happens eventually when quota is being
recalculated, but it may take a while. Quota recalculation also currently
doesn't trigger quota warning executions.

Maildirsize File
^^^^^^^^^^^^^^^^

The ``maildirsize`` file in the Maildir root directory contains both the quota
limit information and the current quota status. It contains a header in
format:

.. code-block:: none

  <storage limit in bytes>S,<messages limit>C

If you don't configure any quota limits in Dovecot (``quota=maildir`` with no
other settings), Dovecot takes the limits from the header. If the file does
not exist, quota isn't enforced.

If you configure quota limits in Dovecot, Dovecot makes sure that this header
is kept up to date. If the file does not exist, it's simply rebuilt.

Once the ``maildirsize`` reaches 5120 bytes, the quota is recalculated and
the file is recreated. This makes sure that if quota happens to be broken
(e.g. externally deleted files) it won't stay that way forever.
