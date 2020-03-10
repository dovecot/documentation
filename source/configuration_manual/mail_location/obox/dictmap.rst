.. _dictmap:

=============
Dictmap
=============

The “dictmap” fs driver implements the main part of this mapping functionality. Its syntax is:

  .. code-block:: none

    dictmap:<dict uri> ; <parent fs uri>[ ; <dictmap settings>]

 For <dict uri> you can use any of the Dovecot dict drivers as specified by http://wiki.dovecot.org/Dictionary.

.. Note:: The delimiter between the dictmap configuration components is ‘ ; ‘ (<SPACE><SEMICOLON><SPACE>). The spaces before and after the semicolon are necessary; otherwise Dovecot will emit a syntax error and exit.

.. Note:: Cassandra support is done via SQL dict, because Cassandra CQL is implemented as a lib-sql driver.

Obox should work with Cassandra v2.x or v3.x.  Obox is internally tested with v2.1 and v2.2, so those are the recommended version(s) to use.

The dictmap settings are:

+---------------------------------+------------------------------------------------------------------------------+
| Setting                         | Description                                                                  |
+---------------------------------+------------------------------------------------------------------------------+
| refcounting-table	          | Enable reference counted objects. Reference counting allows a single mail    |
|                                 | object to be stored in multiple mailboxes, without the need to create a new  |
|                                 | copy of the message data in object storage.                                  |
+---------------------------------+------------------------------------------------------------------------------+
| lockdir=<path>                  | If refcounting is enabled, use this directory for creating lock files to     |
|                                 | objects while they're being copied or deleted. This attempts to prevent race |
|                                 | conditions where an object copy and delete runs simultaneously and both      |
|                                 | succeed, but the copied object no longer exists. This can't be fully         |
|                                 | prevented if different servers do this concurrently. If lazy_expunge is used,|
|                                 | this setting isn't really needed, because such race conditions are           |
|                                 | practically nonexistent. Not using the setting will improve performance by   |
|                                 | avoiding a Cassandra SELECT when copying mails.                              |
+---------------------------------+------------------------------------------------------------------------------+
| diff-table	                  | Store diff & self index bundle objects to a separate table. This is a        |
|                                 | Cassandra-backend optimization.                                              |
+---------------------------------+------------------------------------------------------------------------------+
| delete-dangling-links	          | If an object exists in dict, but not in storage, delete it automatically from|
|                                 | dict when it's noticed. This setting isn't safe to use by default, because   |
|                                 | storage may return "object doesn't exist" errors only temporarily during     |
|                                 | split brain.                                                                 |
+---------------------------------+------------------------------------------------------------------------------+
| bucket-size=<n>	          | Separate email objects into buckets, where each bucket can have a maximum of |
|                                 | <n> emails. This should be set to 10000 with Cassandra to avoid the partition|
|                                 | becoming too large when there are a lot of emails.                           |
+---------------------------------+------------------------------------------------------------------------------+
| bucket-deleted-days=<days>      | Track Cassandra's tombstones in buckets.cache file to avoid creating         |
|                                 | excessively large buckets when a lot of mails are saved and deleted in a     |
|                                 | folder. The <days> should be one day longer than gc_grace_seconds for the    |
|                                 | user_mailbox_objects table.By default this is 10 days, so in that case       |
|                                 | bucket-deleted-days=11 should be used.When determining whether bucket-size is|
|                                 | reached and a new one needs to be created, with this setting the tombstones  |
|                                 | are also taken into account. This tracking is preserved only as long as the  |
|                                 | buckets.cache exists. It's also not attempted to be preserved when moving    |
|                                 | users between backends. This means that it doesn't work perfectly in all     |
|                                 | situations, but it should still be good enough to prevent the worst offenses.|
+---------------------------------+------------------------------------------------------------------------------+
| bucket-cache=<path>	          | Required when bucket-size is set. Bucket counters are cached in this file.   |
|                                 | This path should be located under the obox indexes directory (on the SSD     |
|                                 | backed cache mount point; e.g. %h/buckets.cache)                             |
+---------------------------------+------------------------------------------------------------------------------+
| nlinks-limit=<n>                | Defines the maximum number of results returned from a dictionary iteration   |
|                                 | lookup (i.e. Cassandra CQL query) when checking the number of links to an    |
|                                 | object. Limiting this may improve performance. Currently Dovecot only cares  |
|                                 | whether the link count is 0, 1 or "more than 1" so for a bit of extra safety |
|                                 | we recommend nlinks-limit=3.                                                 |
+---------------------------------+------------------------------------------------------------------------------+
| delete-timestamp=+<:ref:`time`> | Increase Cassandra's DELETE timestamp by this much. This is useful to        |
|                                 | make sure the DELETE isn't ignored because Dovecot backends' times are       |
|                                 | slightly different. Recommendation is to use delete-timestamp=+10s           |
+---------------------------------+------------------------------------------------------------------------------+
| max-parallel-iter=<n>           | Describes how many parallel dict iterations can be created internally. The   |
|                                 | default value is 1. Parallel iterations can especially help speed up reading |
|                                 | huge folders.                                                                |
|                                 |                                                                              |
|                                 | .. versionadded:: v2.3.10                                                    |
+---------------------------------+------------------------------------------------------------------------------+

The fs-dictmap uses the following dict paths:

shared/dictmap/<path>: This is the main access

If refcounting-table is used:

* shared/dictrevmap/<user>/mailboxes/<folder guid>/<object id>: For adding new references.

* shared/dictrevmap/<object id>/<object name>: For deleting

* shared/dictrevmap/<object id>: For lookups if any object references exist after deletion.

If diff-table is used:

* shared/dictdiffmap/<user>/idx/<host>: Latest self/diff bundle for the user created by the <host>

* shared/dictdiffmap/<user>/mailboxes/<folder guid>/idx/<host>: Latest self/diff bundle for the folder created by the <host>

.. toctree::
   :maxdepth: 1

   replication_factor

   simple_mapping
