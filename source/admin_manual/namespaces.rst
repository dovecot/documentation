.. _admin_namespaces:

==========
Namespaces
==========

Dovecot supports fully hierarchical namespaces, which can use different storage drivers.
These different locations and drivers are presented to the client as a single tree.

Each namespace has prefix, which can be empty, namespace separator and 0 more folders.
A special case is INBOX namespace, which contains a case-insensitive folder called INBOX.

All visible namespaces must have same separator.

Inside each namespace there is a list of folders, which form a sub-hierarchy.

------------
Folder name
------------

Each folder has a name.
The fully qualified name of a folder is folder name and hierarchy prefix.
This allows folder to move from one namespace to another, and only the prefix changes.

In dovecot, the maximum length of a folder name is 256 bytes, and the maximum path length is 4096 characters.
Before v2.3.0 the maximum hierarchy depth was 16 levels.
This was changed so that the maximum depth is unlimited, provided it fits into 4096 bytes.

Folder names use UTF-8 character set.
If the folder name contains UTF-8 characters, these are presented using mUTF7 encoding, unless UTF-8 mode has been enabled.
On filesystem, these folders are mUTF7 by default with fs and ``Maildir++`` layouts.

--------------
Parent folders
--------------

A folder can have one or more parent folders that do not exist.
These are presented with ``\NoSelect`` attribute.
