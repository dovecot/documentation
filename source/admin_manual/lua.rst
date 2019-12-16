.. _lua:

=========================
Dovecot Lua support
=========================

Since v2.3.0 dovecot supports Lua scripting. Dovecot supports lua 5.0 or newer.

See also:

* :ref:`authentication-lua_based_authentication`
* :ref:`Lua push notifications <lua_push_notifications>`


lib-lua
^^^^^^^

Dovecot provides a lib-lua internal helper as part of libdovecot.so. It has
facilities for loading scripts from various sources, and also helps with
reusing scripts by keeping track of which scripts are loaded. Each script has
it's own memory pool, which is guaranteed to be released when script is
unloaded.

When script is loaded, :func:`script_load` function is called if found. This can
return non-zero to indicate that the script has a problem.

C API
^^^^^^

.. c:function:: dlua_register_dovecot(script)

Register dovecot variable. This item can also be extended by context specific
tables, like authentication database adds dovecot.auth.

.. c:function:: dlua_push_event(event)

Pushes an Dovecot Event to stack.

Lua API
^^^^^^^^

.. function:: i_debug(text)

   Log debug level message

   :param str text: Message to log

.. function:: i_info(text)

   Log info level message

   :param str text: Message to log

.. function::  i_warning(text)

   Log warning level message

   :param str text: Message to log

.. function::  i_error(text)

   Log error level message

   :param str text: Message to log

Event functions are available from

.. versionadded:: v2.3.4

.. function:: dovecot.event()

   Generate new event with lua script as parent.

.. function:: dovecot.event(parent)

   Generate new event with given parent event.

object event
^^^^^^^^^^^^^

.. Note::

   object event_passthrough has same API, except the passthrough_event method
   is not present.

Functions:
------------

.. function::  append_log_prefix(prefix)

   set prefix to append into log messages

   :param str prefix: Prefix to append

.. function::  replace_log_prefix(prefix)

   replace append prefix for messages

   :param str prefix: Prefix to append

.. function::  set_name(name)

   set name for event

   :param str name: Event name

.. function::  add_str(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param str value: A value

.. function::  add_int(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param int value: Integer value

.. function::  add_timeval(key,seconds)

   add a key-value pair to event

   :param str key: Key name
   :param int value: Unix timestamp

.. function::  inc_int(key,diff)

   increment key-value pair

   :param str key: Key name
   :param int diff: Difference to add, can be negative

.. function::  log_debug(message)

   Emit debug message

   :param str message: Message to log

.. function::  log_info(message)

   Emit info message

   :param str message: Message to log

.. function::  log_warning(message)

   Emit warning message

   :param str message: Message to log

.. function::  log_error("message")

   Emit error message

   :param str message: Message to log

.. function::  passthrough_event()

   Returns an passthrough event. A log message *must be* logged or else a panic will occur.

mail-lua
^^^^^^^^^

.. versionadded:: v2.3.4

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins. Mail-lua provides a common script to be used in mail storage instead
of per-plugin scripts.

C API
^^^^^^

.. c:function:: dlua_register_mail_storage(script)

   Register storage Lua interface to script context

   :param script: :c:type:`dlua_script` to add mail storage

.. c:function:: bool mail_lua_plugin_get_script(user, script_r)

   Returns script context if available. If FALSE is returned, no Lua script has
   been loaded, and you should optionally deal this yourself.

   :param user: :c:type:`mail_user`
   :param script: :c:type:`dlua_script`

.. c:function:: dlua_push_mail_user(script, user)

   Pushes a mail user on top of stack.

   :param script: :c:type:`dlua_script`
   :param user: :c:type:`mail_user`

.. c:function:: dlua_push_mailbox(script, box)

   Pushes a mailbox on top of stack.

   :param script: :c:type:`dlua_script`
   :param box: :c:type:`mailbox`

.. c:function:: dlua_push_mail(script, mail)

   Pushes a mail on top of stack.

   :param script: :c:type:`dlua_script`
   :param box: :c:type:`mail`

Lua API
^^^^^^^^

When mail user is created, a script is loaded if present as :func:`mail_lua_script`
and :c:func:`mail_user_created` is called if present in script.

On deinitialization, :func:`mail_user_deinit_pre` is called first, if present,
followed by :func:`mail_user_deinit`.

.. _dovecot.storage:

dovecot.storage
^^^^^^^^^^^^^^^^

Following constants are specified:

.. c:member::  STATUS_MESSAGES
.. c:member::  STATUS_RECENT
.. c:member::  STATUS_UIDNEXT
.. c:member::  STATUS_UIDVALIDITY
.. c:member::  STATUS_UNSEEN
.. c:member::  STATUS_FIRST_UNSEEN_SEQ
.. c:member::  STATUS_KEYWORDS
.. c:member::  STATUS_HIGHESTMODSEQ
.. c:member::  STATUS_PERMANENT_FLAGS
.. c:member::  STATUS_FIRST_RECENT_UID
.. c:member::  STATUS_HIGHESTPVTMODSEQ
.. c:member::  MAILBOX_FLAG_READONLY
.. c:member::  MAILBOX_FLAG_SAVEONLY
.. c:member::  MAILBOX_FLAG_DROP_RECENT
.. c:member::  MAILBOX_FLAG_NO_INDEX_FILES
.. c:member::  MAILBOX_FLAG_KEEP_LOCKED
.. c:member::  MAILBOX_FLAG_IGNORE_ACLS
.. c:member::  MAILBOX_FLAG_AUTO_CREATE
.. c:member::  MAILBOX_FLAG_AUTO_SUBSCRIBE
.. c:member::  MAILBOX_SYNC_FLAG_FULL_READ
.. c:member::  MAILBOX_SYNC_FLAG_FULL_WRITE
.. c:member::  MAILBOX_SYNC_FLAG_FAST
.. c:member::  MAILBOX_SYNC_FLAG_NO_EXPUNGES
.. c:member::  MAILBOX_SYNC_FLAG_FIX_INCONSISTENT
.. c:member::  MAILBOX_SYNC_FLAG_EXPUNGE
.. c:member::  MAILBOX_SYNC_FLAG_FORCE_RESYNC
.. c:member::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT

   String constant ``vendor/vendor.dovecot/``

.. versionadded:: 2.3.7

.. c:member::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT

    String constant ``vendor/vendor.dovecot/pvt/``

.. versionadded:: 2.3.7

.. c:member::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT_SERVER

    String constant ``vendor/vendor.dovecot/pvt/server/``

.. versionadded:: 2.3.7


object mail_user
^^^^^^^^^^^^^^^^^

Meta
----

* has tostring
* is comparable (by username)

Functions
---------

.. function::  plugin_getenv(key)

   Returns key from user plugin settings or userdb environment

   :param str key: Setting name

.. function::  var_expand(template)

   Expands mail user variables (see `Variables <https://wiki.dovecot.org/Variables>`_ )

   :param str template: Variable template string

.. function::  mailbox(name, flags)

   Allocates a mailbox, flags optional

   :param str name: Mailbox name
   :param flags int: Flags, see :ref:`dovecot.storage`

.. function:: metadata_get(key)

   Returns given metadata key for the user.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. function:: metadata_set(key, value)

   Sets user metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

.. versionadded:: 2.3.7

.. function:: metadata_unset(key)

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. function:: metadata_list(prefix, prefix, prefix...)

   Lists all keys for the user metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

Variables
---------

.. c:var:: home

   home directory (if available)

.. c:var:: username

   user's name

.. c:var:: uid

   system uid

.. c:var:: gid

   system gid

.. c:var:: service

   IMAP/POP3/LMTP/LDA/...

.. c:var:: session_id

   Current session ID

.. c:var:: session_create_time

   When session was created

.. c:var:: nonexistent

   If user does not really exist

.. c:var:: anonymous

   If user is anonymous

.. c:var:: autocreated

   If user was automatically created internally for some operation

.. c:var:: mail_debug

   If debugging is turned on

.. c:var:: fuzzy_search

   .. todo:: undocumented

.. c:var:: dsyncing

   If user is being dsync'd

.. c:var:: session_restored

   If this is a restored session

object mailbox
^^^^^^^^^^^^^^^

Meta
----

* has tostring
* is comparable (by full mailbox name)

Functions
---------

.. function:: open()

   Opens the mailbox

.. function:: close()

   Closes the mailbox

.. function:: free()

   Releases mailbox (must be done)

.. function:: sync(flags)

   Synchronizes the mailbox (should usually be done, flags optional)

   :param int flags: See :ref:`dovecot.storage`

.. function:: status(item,item,item...)

   Returns requested mailbox status items as table

   :param str item: Item name

.. function:: metadata_get(key)

   Returns given metadata key for the mailbox.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. function:: metadata_set(key, value)

   Sets mailbox metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

.. versionadded:: 2.3.7

.. function:: metadata_unset(key)

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. function:: metadata_list(prefix, prefix, prefix...)

   Lists all keys for the mailbox metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

Variables
---------

.. c:var:: vname

   Full mailbox name

.. c:var:: Mailbox name

    Mailbox name

table mailbox status
^^^^^^^^^^^^^^^^^^^^^

Variables
---------

.. c:var:: mailbox

   full name of mailbox

.. c:var:: messages

   number of messages

.. c:var:: recent

   number of \Recent messages

.. c:var:: unseen

   number of \Unseen messages

.. c:var:: uidvalidity

   current UID validity

.. c:var:: uidnext

   next UID

.. c:var:: first_unseen_seq

   first seqno of unseen mail

.. c:var:: first_recent_uid

   first UID of unseen mail

.. c:var:: highest_modseq

   highest modification sequence

.. c:var:: highest_pvt_modseq

   highest private modification sequence

.. c:var:: permanent_flags

   supported permanent flags as a bitmask

.. c:var:: flags

   supported flags as a bitmask

.. c:var:: permanent_keywords

   if permanent keywords are supported

.. c:var:: allow_new_keywords

   if new keywords can be added

.. c:var:: nonpermanent_modseqs

   whether non-permanent keywords are allowed

.. c:var:: no_modseq_tracking

   no modification sequence tracking

.. c:var:: have_guids

   whether GUIDs exist

.. c:var:: have_save_guids

   whether GUIDs can be saved

.. c:var:: have_only_guid128

   whether GUIDs are 128 bit always

.. c:var:: keywords

   table of current keywords

object mail
^^^^^^^^^^^

Meta
----

* has tostring
* is comparable (within same mailbox, by UID)

Functions
---------

None yet

Variables
---------

.. c:var:: mailbox

   mailbox object

.. c:var:: seq

   Sequence number (can change)

.. c:var:: uid

   UID number (immutable)

