.. _mail_debugging:

==================
 Mail Debugging
==================

Setting :dovecot_core:ref:`log_debug` will make Dovecot log all kinds of things about mailbox initialization. Note that it won't increase error logging at all, so if you're having some random problems it's unlikely to provide any help.

If there are any problems with a mailbox, Dovecot should automatically fix it. If that doesn't work for any reason, you can manually also request fixing a mailbox by running: ``doveadm force-resync -u user@domain INBOX``

Where the ``INBOX`` should be replaced with the folder that is having problems. Or ``*`` if all folders should be fixed.

Users may sometimes complain that they have lost emails. The problem is almost always that this was done by one of the user's email clients accidentally. Especially accidentally configuring a "POP3 client" to a new device that deletes the mails after downloading them. 

For this reason it's very useful to enable the ``mail_log`` plugin and enable logging for all the events that may cause mails to be lost. This way it's always possible to find out from the logs what exactly caused messages to be deleted.

If you're familiar enough with Dovecot's index files, you can use ``doveadm dump`` command to look at their contents in human readable format and possibly determine if there is something wrong in them.
