.. _mbox_locking:

===================
Mbox Locking
===================

The only standard way to lock an mbox is using a method called "dotlock". This means that a file named <mailbox-name>.lock is created in the same directory as the mailbox being locked. This works pretty well when the mbox is locked for writing, but for reading it's very inefficient. That's why other locking methods have been used.

It's important that all software that's reading or writing to mboxes use the same locking settings. If they use different methods, they might read/write to an mbox while another process is modifying it, and see corrupted mails. If they use the same methods but in a different order, they can both end up in a deadlock.

If you want to know more details about locking, see :ref:`mbox_mbox_format`.

For Dovecot you can configure locking using the mbox_read_locks and mbox_write_locks settings. The defaults are:

.. code-block:: none

   mbox_read_locks = fcntl
   mbox_write_locks = dotlock fcntl 

Here's a list of how to find out the locking settings for other software:

Procmail
^^^^^^^^^

.. code-block:: none

   # procmail -v 2>&1|grep Locking
   Locking strategies:     dotlocking, fcntl()

Postfix
^^^^^^^^

Postfix has two different ways to deliver to mboxes. One is the "mailbox" transport and another one is the "virtual" transport.

.. code-block:: none

   # postconf mailbox_delivery_lock
   mailbox_delivery_lock = fcntl, dotlock
   # postconf virtual_mailbox_lock 
   virtual_mailbox_lock = fcntl 

In the above case, if you used the mailbox transport, you'd have to change Dovecot's configuration to ``mbox_write_locks = fcntl`` dotlock or vice versa for Postfix.

If you used the virtual transport, it doesn't really matter if the dotlock is missing, since the fcntl is common with Dovecot and Postfix.

mutt
^^^^^

.. code-block:: none
   
   mutt -v|grep -i lock 

Debian
^^^^^^^
Debian's policy specifies that all software should use "fcntl and then dotlock" locking, but this probably applies only to most commonly used software.
