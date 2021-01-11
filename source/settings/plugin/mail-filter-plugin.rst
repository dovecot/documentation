.. _plugin-mail-filter:

========================
mail-filter plugin
========================

.. versionremoved:: 2.3.14

Mail filter plugin can be used to filter written and/or read mails via a script, for example to encrypt/decrypt mails. Currently the filtering must not modify the message in any way: mail -> write filter -> read filter -> must produce exactly the original mail back. 

.. todo:: Modifying the mail during writing would be possible with some code changes.

.. Note:: IMAP protocol requires that emails never change, so the read filter must always produce the same output for the message. If the output changes you'll probably see some errors about Dovecot's cache file being corrupted and the IMAP client may also become confused if it has already cached some of the mail data.

See: `Mail filter plugin <https://wiki.dovecot.org/Plugins/MailFilter>`_
