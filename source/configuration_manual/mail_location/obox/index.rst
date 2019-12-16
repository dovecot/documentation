.. _mail_location_obox_settings:

=============
Obox Settings
=============

.. Note:: 

   These settings are assuming that message data is being stored in object storage (obox mailbox). These settings should not be used if a block storage driver (e.g. mdbox) is being used. 

.. code-block:: none

   mail_home = /var/vmail/%2Mu/%u

Specifies the location for the local mail cache directory. This will contain Dovecot index files and it needs to be high performance (e.g. SSD storage). Alternatively, if there is enough memory available to hold all concurrent users' data at once, a tmpfs would work as well. The "%2Mu" takes the first 2 chars of the MD5 hash of the username so everything isn't in one directory. 

.. code-block:: none

   mail_uid = vmail
   mail_gid = vmail

UNIX UID & GID which are used to access the local cache mail files. 

.. code-block:: none

   mail_fsync = never

We can disable fsync()ing for better performance. It's not a problem if locally cached index file modifications are lost. 

.. code-block:: none

   mail_temp_dir = /tmp

Directory where downloaded/uploaded mails are temporarily stored to. Ideally all of these would stay in memory and never hit the disk, but in some situations the mails may have to be kept for a somewhat longer time and it ends up in disk. So there should be enough disk space available in the temporary filesystem. 

.. NOTE::

   /tmp should be a good choice on any recent OS, as it normally points to /dev/shm, so this temporary data is stored in memory and will never be written to disk. However, this should be checked on a per installation basis to ensure that it is true.

.. code-block:: none

   mailbox_list_index = yes

Enable mailbox list indexes. This is required with obox format.

.. code-block:: none

   mailbox_list_index_include_inbox = yes

If LISTINDEX resides in tmpfs, INBOX status should be included in list index.

.. toctree::
   :maxdepth: 1
   :glob:

   *
