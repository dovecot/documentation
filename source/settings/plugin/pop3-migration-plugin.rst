.. _plugin-pop3-migration:

=============================
pop3-migration plugin
=============================

The pop3-migration plugin is used to preserve POP3 UIDLs. 

When dsync is handling IMAP INBOX and requests a POP3 UIDL, the plugin connects to the POP3 server and 

figures out which IMAP messages match which POP3 messages and then returns the appropriate POP3 UIDL.

See: `Migrating from any IMAP/POP3 server to Dovecot via dsync <https://wiki.dovecot.org/Migration/Dsync>`_
