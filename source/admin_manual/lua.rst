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

.. c:function:: void dlua_register_dovecot(struct dlua_script *script)

Register dovecot variable. This item can also be extended by context specific
tables, like authentication database adds dovecot.auth.

.. c:function:: void dlua_push_event(struct event *event)

Pushes an Dovecot Event to stack.

Lua API
^^^^^^^^

.. py:function i_debug(text)

   Log debug level message

   :param str text: Message to log

.. py:function i_info(text)

   Log info level message

   :param str text: Message to log

.. py:function  i_warning(text)

   Log warning level message

   :param str text: Message to log

.. py:function  i_error(text)

   Log error level message

   :param str text: Message to log

Event functions are available from

.. versionadded:: v2.3.4

.. py:function dovecot.event()

   Generate new event with lua script as parent.

.. py:function dovecot.event(parent)

   Generate new event with given parent event.

object event
^^^^^^^^^^^^^

.. Note::

   object event_passthrough has same API, except the passthrough_event method
   is not present.

Functions:
------------

.. py:function  append_log_prefix(prefix)

   set prefix to append into log messages

   :param str prefix: Prefix to append

.. py:function  replace_log_prefix(prefix)

   replace append prefix for messages

   :param str prefix: Prefix to append

.. py:function  set_name(name)

   set name for event

   :param str name: Event name

.. py:function  add_str(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param str value: A value

.. py:function  add_int(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param int value: Integer value

.. py:function  add_timeval(key,seconds)

   add a key-value pair to event

   :param str key: Key name
   :param int value: Unix timestamp

.. py:function  inc_int(key,diff)

   increment key-value pair

   :param str key: Key name
   :param int diff: Difference to add, can be negative

.. py:function  log_debug(message)

   Emit debug message

   :param str message: Message to log

.. py:function  log_info(message)

   Emit info message

   :param str message: Message to log

.. py:function  log_warning(message)

   Emit warning message

   :param str message: Message to log

.. py:function  log_error("message")

   Emit error message

   :param str message: Message to log

.. py:function  passthrough_event()

   Returns an passthrough event. A log message *must be* logged or else a panic will occur.

mail-lua
^^^^^^^^^

.. versionadded:: v2.3.4

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins. Mail-lua provides a common script to be used in mail storage instead
of per-plugin scripts.

C API
^^^^^^

.. c:function:: void dlua_register_mail_storage(struct dlua_script *script)

   Register storage Lua interface to script context

   :param script: :c:type:`dlua_script` to add mail storage

.. c:function:: bool mail_lua_plugin_get_script(struct mail_user *user, struct dlua_script **script_r)

   Returns script context if available. If FALSE is returned, no Lua script has
   been loaded, and you should optionally deal this yourself.

   :param user: :c:type:`mail_user`
   :param script: :c:type:`dlua_script`

.. c:function:: void dlua_push_mail_user(struct dlua_script *script, struct mail_user *user)

   Pushes a mail user on top of stack.

   :param script: :c:type:`dlua_script`
   :param user: :c:type:`mail_user`

.. c:function:: void dlua_push_mailbox(struct dlua_script *script, struct mailbox *box)

   Pushes a mailbox on top of stack.

   :param script: :c:type:`dlua_script`
   :param box: :c:type:`mailbox`

.. c:function:: void dlua_push_mail(struct dlua_script *script, struct mail* mail)

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

.. c:enum::  STATUS_MESSAGES
.. c:enum::  STATUS_RECENT
.. c:enum::  STATUS_UIDNEXT
.. c:enum::  STATUS_UIDVALIDITY
.. c:enum::  STATUS_UNSEEN
.. c:enum::  STATUS_FIRST_UNSEEN_SEQ
.. c:enum::  STATUS_KEYWORDS
.. c:enum::  STATUS_HIGHESTMODSEQ
.. c:enum::  STATUS_PERMANENT_FLAGS
.. c:enum::  STATUS_FIRST_RECENT_UID
.. c:enum::  STATUS_HIGHESTPVTMODSEQ
.. c:enum::  MAILBOX_FLAG_READONLY
.. c:enum::  MAILBOX_FLAG_SAVEONLY
.. c:enum::  MAILBOX_FLAG_DROP_RECENT
.. c:enum::  MAILBOX_FLAG_NO_INDEX_FILES
.. c:enum::  MAILBOX_FLAG_KEEP_LOCKED
.. c:enum::  MAILBOX_FLAG_IGNORE_ACLS
.. c:enum::  MAILBOX_FLAG_AUTO_CREATE
.. c:enum::  MAILBOX_FLAG_AUTO_SUBSCRIBE
.. c:enum::  MAILBOX_SYNC_FLAG_FULL_READ
.. c:enum::  MAILBOX_SYNC_FLAG_FULL_WRITE
.. c:enum::  MAILBOX_SYNC_FLAG_FAST
.. c:enum::  MAILBOX_SYNC_FLAG_NO_EXPUNGES
.. c:enum::  MAILBOX_SYNC_FLAG_FIX_INCONSISTENT
.. c:enum::  MAILBOX_SYNC_FLAG_EXPUNGE
.. c:enum::  MAILBOX_SYNC_FLAG_FORCE_RESYNC
.. c:enum::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT

   String constant ``vendor/vendor.dovecot/``

.. versionadded:: 2.3.7

.. c:enum::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT

    String constant ``vendor/vendor.dovecot/pvt/``

.. versionadded:: 2.3.7

.. c:enum::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT_SERVER

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

.. py:function  plugin_getenv(key)

   Returns key from user plugin settings or userdb environment

   :param str key: Setting name

.. py:function  var_expand(template)

   Expands mail user variables (see `Variables <https://wiki.dovecot.org/Variables>`_ )

   :param str template: Variable template string

.. py:function  mailbox(name, flags)

   Allocates a mailbox, flags optional

   :param str name: Mailbox name
   :param flags int: Flags, see :ref:`dovecot.storage`

.. py:function metadata_get(key)

   Returns given metadata key for the user.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. py:function metadata_set(key, value)

   Sets user metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

.. versionadded:: 2.3.7

.. py:function metadata_unset(key)

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. py:function metadata_list(prefix, prefix, prefix...)

   Lists all keys for the user metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

Variables
---------

.. py:attribute:: home

   home directory (if available)

.. py:attribute:: username

   user's name

.. py:attribute:: uid

   system uid

.. py:attribute:: gid

   system gid

.. py:attribute:: service

   IMAP/POP3/LMTP/LDA/...

.. py:attribute:: session_id

   Current session ID

.. py:attribute:: session_create_time

   When session was created

.. py:attribute:: nonexistent

   If user does not really exist

.. py:attribute:: anonymous

   If user is anonymous

.. py:attribute:: autocreated

   If user was automatically created internally for some operation

.. py:attribute:: mail_debug

   If debugging is turned on

.. py:attribute:: fuzzy_search

   .. todo:: undocumented

.. py:attribute:: dsyncing

   If user is being dsync'd

.. py:attribute:: session_restored

   If this is a restored session

object mailbox
^^^^^^^^^^^^^^^

Meta
----

* has tostring
* is comparable (by full mailbox name)

Functions
---------

.. py:function open()

   Opens the mailbox

.. py:function close()

   Closes the mailbox

.. py:function free()

   Releases mailbox (must be done)

.. py:function sync(flags)

   Synchronizes the mailbox (should usually be done, flags optional)

   :param int flags: See :ref:`dovecot.storage`

.. py:function status(item,item,item...)

   Returns requested mailbox status items as table

   :param str item: Item name

.. py:function metadata_get(key)

   Returns given metadata key for the mailbox.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. py:function metadata_set(key, value)

   Sets mailbox metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

.. versionadded:: 2.3.7

.. py:function metadata_unset(key)

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

.. py:function metadata_list(prefix, prefix, prefix...)

   Lists all keys for the mailbox metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

.. versionadded:: 2.3.7

Variables
---------

.. py:attribute:: vname

   Full mailbox name

.. py:attribute:: Mailbox name

    Mailbox name

table mailbox status
^^^^^^^^^^^^^^^^^^^^^

Variables
---------

.. py:attribute:: mailbox

   full name of mailbox

.. py:attribute:: messages

   number of messages

.. py:attribute:: recent

   number of \Recent messages

.. py:attribute:: unseen

   number of \Unseen messages

.. py:attribute:: uidvalidity

   current UID validity

.. py:attribute:: uidnext

   next UID

.. py:attribute:: first_unseen_seq

   first seqno of unseen mail

.. py:attribute:: first_recent_uid

   first UID of unseen mail

.. py:attribute:: highest_modseq

   highest modification sequence

.. py:attribute:: highest_pvt_modseq

   highest private modification sequence

.. py:attribute:: permanent_flags

   supported permanent flags as a bitmask

.. py:attribute:: flags

   supported flags as a bitmask

.. py:attribute:: permanent_keywords

   if permanent keywords are supported

.. py:attribute:: allow_new_keywords

   if new keywords can be added

.. py:attribute:: nonpermanent_modseqs

   whether non-permanent keywords are allowed

.. py:attribute:: no_modseq_tracking

   no modification sequence tracking

.. py:attribute:: have_guids

   whether GUIDs exist

.. py:attribute:: have_save_guids

   whether GUIDs can be saved

.. py:attribute:: have_only_guid128

   whether GUIDs are 128 bit always

.. py:attribute:: keywords

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

.. py:attribute:: mailbox
   :noindex:

   mailbox object

.. py:attribute:: seq

   Sequence number (can change)

.. py:attribute:: uid
   :noindex:

   UID number (immutable)

