.. _admin_namespaces:

==========
Namespaces
==========

Dovecot supports fully hierarchical namespaces, which can use different storage drivers.
These different locations and drivers are presented to the client as a single tree.

Each namespace has:

 * prefix (usually empty or "INBOX.")
 * namespace separator (usually '/' or '.')
 * 0 or more folders

There must be one namespace where the case-insensitive folder named INBOX
exists.

All visible namespaces must have the same separator.

Inside each namespace there is a list of folders, which form a sub-hierarchy.

------------
Folder names
------------

Each folder has a name. In configuration files and log files Dovecot almost
always uses the "virtual name", which uses the configured namespace's hierarchy
separator as well as the namespace prefix. Depending on the used LAYOUT in
:dovecot_core:ref:`mail_location` the internal folder name may be different. The
internal name is stored in databases (e.g. mailbox subscriptions), which allows
changing the namespace prefix or separator without having to change the
databases.

The folder names use UTF-8 character set internally. All folder names must be
valid UTF-8. With ``LAYOUT=fs`` and ``LAYOUT=Maildir++`` the folder names are
stored in filesystem paths as mUTF-7 (see IMAP RFC 3501) mainly for legacy
reasons. This can be changed by specifying the UTF8 parameter in
:dovecot_core:ref:`mail_location`.

-------------------
Folder name lengths
-------------------

Folder name length restrictions:

 * Maximum length of an individual folder name within a hierarchy is 255 bytes.
   For example with "a/b/c" hierarchy each of the a, b and c can be a maximum
   of 255 bytes.
 * The maximum folder path length is 4096 bytes.
 * v2.2.25 and older versions had an additional restriction of limiting the
   number of hierarchies to 16.

The maximum folder name lengths work correctly when folder names aren't stored
in filesystem, i.e. ``LAYOUT=index`` is used. Otherwise the OS adds its own
limitations to path name lengths and the full 4096 bytes can't be used.
With ``LAYOUT=Maildir++`` the path must fit to 254 bytes (due to OS
limitations).

--------------
Parent folders
--------------

A folder can have one or more parent folders that do not physically exist.
These are presented with ``\NoSelect`` or ``\Nonexistent`` attribute.
It's possible to try to avoid creating these by using the ``NO-NOSELECT``
option in :dovecot_core:ref:`mail_location`.
