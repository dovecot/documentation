.. _lua:

===================
Dovecot Lua Support
===================

Since v2.3.0 dovecot supports Lua scripting. Dovecot supports Lua 5.1 and
Lua 5.3.

.. dovecotremoved:: 2.3.15

   Lua 5.2 support.

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

When script is loaded, :func:`script_init` function is called if found.

.. dovecotchanged:: 2.4.0,3.0.0 ``script_init`` return value is no longer checked. Use error() instead if necessary.

When script is being unloaded, :func:`script_deinit` function is called if found.

C API
^^^^^^

.. c:function:: void dlua_dovecot_register(struct dlua_script *script)

Register dovecot variable. This item can also be extended by context specific
tables, like authentication database adds dovecot.auth.

.. c:function:: void dlua_push_event(struct event *event)

Pushes an Dovecot Event to stack.

Lua API
^^^^^^^^

.. warning:: Never use ``os.exit()`` from a Lua script. This will cause the
	     whole process to exit instead of just the script.

.. py:currentmodule:: dovecot

.. py:function:: i_debug(text)

   Log debug level message

   :param str text: Message to log

.. py:function:: i_info(text)

   Log info level message

   :param str text: Message to log

.. py:function::  i_warning(text)

   Log warning level message

   :param str text: Message to log

.. py:function::  i_error(text)

   Log error level message

   :param str text: Message to log

.. py:function:: event()

   Generate new event with lua script as parent.

   .. dovecotadded:: 2.3.4

.. py:function:: event(parent)
   :noindex:

   Generate new event with given parent event.

   .. dovecotadded:: 2.3.4

.. py:function:: restrict_global_variables(toggle)

   Enable or disable restricting new global variables. If enabled, the rest
   of the script won't be allowed to declare global non-function variables but
   they can declare local variables and use already defined global variables.
   If a script needs to define a variable, they must declare them as local i.e.
   instead of ``my_var = "some value"``, do ``local my_var = "some value"``.
   Restrictions will remain in place until the end of the execution of the
   script or until they are lifted by calling
   ``dovecot.restrict_global_variables(false)``.

   Default is permissive mode i.e. same as lua's default, global variables
   are not restricted.

   :param boolean toggle: Enable or disable defining new global variables

   .. dovecotadded:: 2.3.17

.. py:currentmodule:: dovecot.http

.. py:function:: client({timeout=milliseconds, max_attempts=number, debug=boolean})

   Create a new http client object that can be used to submit requests to
   remote servers.

   :param bool debug: Enable debug logging.
   :param bool no_auto_redirect: Don't automatically act upon redirect responses.
   :param bool no_auto_retry: Never automatically retry requests.
   :param int connect_backoff_time_msecs: Initial backoff time; doubled at each connection failure. (Default: 100 msec)
   :param int connect_backoff_max_time_msecs: Maximum backoff time. (Default: 60 000 msec)
   :param int connect_timeout_msecs: Max time to wait for connect() (and SSL handshake) to finish before retrying (Default: request_timeout_msecs)
   :param event event_parent: Parent event to use.
   :param int max_attempts: Maximum number of attempts for a request (Default: 1)
   :param int max_auto_retry_delay_secs: Maximum acceptable delay in seconds for automatically retrying/redirecting requests.
       If a server sends a response with a Retry-After header that causes a delay longer than this, the request is not automatically retried and the response is returned.
   :param int max_connect_attempts: Maximum number of connection attempts to a host before all associated requests fail.
       If > 1, the maximum will be enforced across all IPs for that host, meaning that IPs may be tried more than once eventually if the number
       of IPs is smaller than the specified maximum attempts. If the number of IPs is higher than the maximum attempts, not all IPs are tried. If <= 1, all
       IPs are tried at most once.
   :param int max_idle_time_msecs: Maximum time a connection will idle before disconnecting.
       If parallel connections are idle, the duplicates will end earlier based on how many idle connections exist
       to that same service
   :param int max_redirects: Maximum number of redirects for a request (Default: 0; redirects refused)
   :param string proxy_url: Proxy URL to use, can include username and password.
   :param int request_absolute_timeout_msecs: Max total time to wait for HTTP request to finish, including retries and everything else. (Default: 0; no timeout)
   :param int request_timeout_msecs: Max time to wait for HTTP response before retrying (Default: 60 000 msec).
   :param int soft_connect_timeout_msecs: Time to wait for connect() (and SSL handshake) to finish for the first connection before trying the next IP in parallel (Default: 0; wait until current connection attempt finishes)
   :param string rawlog_dir: Directory for writing raw log data for debugging purposes. Must be writable by the process creating this log.
   :param string user_agent: User-Agent: header. (Default: none)
   :return: An http_client object.

   .. dovecotadded:: 2.3.19

object http_client
^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.19

.. py:currentmodule:: http_client

.. py:function:: request({url=string, method=string})

   Create a new request object. By default, the request has ``Host``, and
   ``Date`` headers with relevant values, as well as ``Connection: Keep-Alive``.

   :param string url: Full url address. Parameters will be parsed from the
     string. TLS encryption is implied with use of ``https``.
   :param string method: HTTP method to use.
   :return: An http_request object.

object http_request
^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.19

.. py:currentmodule:: http_request

.. py:function:: add_header(name, value)

   Add a header to the request.

   :param string name: Name of the HTTP header.
   :param string value: Value of the header.

.. py:function:: remove_header(name)

   Do a lookup of the header in the request and remove it if found.

   :param string name: Name of the HTTP header.

.. py:function:: set_payload(value)

   Set payload data to the request.

   :param string value: Payload of the request as string data.

.. py:function:: submit()

   Connect to the remote server and submit the request. This function blocks
   until the HTTP response is fully received.

   :return: An http_response object.

object http_response
^^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.19

.. py:currentmodule:: http_response

.. py:function:: status()

   Get the status code of the HTTP response. The codes contain error codes as
   well as HTTP codes e.g. 200 HTTP_OK and error code that denote connection
   to remote server failed. A human-readable string of the error can then
   be read using ``reason()`` function.

   :return: Status code of the http response.

.. py:function:: reason()

   Returns a human-readable string of HTTP status codes e.g. "OK", "Bad Request",
   "Service Unavailable", as well as connection errors e.g.
   "connect(...) failed: Connection refused"

   :return: String representation of the status.

.. py:function:: header(name)

   Get value of a header in the HTTP request. If header is not found from the
   response, an empty string is returned.

   :return: Value of the HTTP response header.

.. py:function:: payload()

   Get the payload of the HTTP response.

   :return: Payload of the HTTP response as string.


Example HTTP client code
------------------------

.. code:: lua
  
  local json = require "json"
  local http_client = dovecot.http.client {
      timeout = 10000;
      max_attempts = 3;
      debug = true;
  }
  
  function auth_password_verify(request, password)
    local auth_request = http_client:request {
      url = "https://endpoint/";
      method = "POST";
    }
    local req = {user=request.user, password=password}
    auth_request:set_payload(json.encode(req))
    local auth_response = auth_request:submit()
    local resp_status = auth_response:status()
  
    if resp_status == 200
    then
      return dovecot.auth.PASSDB_RESULT_OK, ""
    else
      return dovecot.auth.PASSDB_RESULT_PASSWORD_MISMATCH, ""
    end
  end


object event
^^^^^^^^^^^^^

.. py:currentmodule:: event

.. Note::

   object event_passthrough has same API, except the passthrough_event method
   is not present.

Functions:
------------

.. py:function::  append_log_prefix(prefix)

   set prefix to append into log messages

   :param str prefix: Prefix to append

.. py:function::  replace_log_prefix(prefix)

   replace append prefix for messages

   :param str prefix: Prefix to append

.. py:function::  set_name(name)

   set name for event

   :param str name: Event name

.. py:function::  add_str(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param str value: A value

.. py:function::  add_int(key,value)

   Add a key-value pair to event

   :param str key: Key name
   :param int value: Integer value

.. py:function::  add_timeval(key,seconds)

   add a key-value pair to event

   :param str key: Key name
   :param int value: Unix timestamp

.. py:function::  inc_int(key,diff)

   increment key-value pair

   :param str key: Key name
   :param int diff: Difference to add, can be negative

.. py:function::  log_debug(message)

   Emit debug message

   :param str message: Message to log

.. py:function::  log_info(message)

   Emit info message

   :param str message: Message to log

.. py:function::  log_warning(message)

   Emit warning message

   :param str message: Message to log

.. py:function::  log_error("message")

   Emit error message

   :param str message: Message to log

.. py:function::  passthrough_event()

   Returns an passthrough event. A log message *must be* logged or else a panic will occur.

object dict
^^^^^^^^^^^

.. py:currentmodule:: dict

.. note:: Currently this object cannot be created within the Lua code itself.

Functions:
----------

.. py:function::  lookup(key[, username])

   Lookup key from dict. If key is found, returns a table with values.
   If key is not found, returns nil.

   :param str key: Key to lookup
   :param str username: Username for private dict keys

.. py:function::  iterate(path, flags[, username])

   Returns an iteration step function and dict iter userdata. For example:

   .. code-block:: lua

	for key, values in dict:iterate(key_prefix, 0) do
	  dovecot.i_debug('key='..key..', first value='..values[1])
	end

   :param str path: Path prefix to iterate
   :param int flags: Iteration flags. Currently raw numbers must be used for these. See ``enum dict_iterate_flags`` in the C code.
   :param str username: Username for private dict paths

.. py:function::  transaction_begin([username])

   Returns a new transaction object.

   :param str username: Username for private dict keys

object dict.transaction
^^^^^^^^^^^^^^^^^^^^^^^

.. py:currentmodule:: dict.transaction

Functions:
----------

.. py:function::  set(key, value)

   Set key=value in the dict transaction.

   :param str key: Key to set
   :param str value: Value to set

.. py:function::  unset(key, value)

   Unset key in the dict transaction.

   :param str key: Key to unset

   .. dovecotadded:: 2.3.17

.. py:function::  set_timestamp({tv_sec=seconds, tv_nsec=nanoseconds})

   Set timestamp to the dict transaction. This is currently used only with
   Cassandra.

   :param int seconds: UNIX timestamp
   :param int nanoseconds: Nanoseconds part of the timestamp

   .. dovecotadded:: 2.3.17

.. py:function::  commit()

   Commit the transaction.

.. py:function::  rollback()

   Rollback the transaction.

object dns_client
^^^^^^^^^^^^^^^^^

.. py:currentmodule:: dns_client

.. dovecotadded:: 2.4.0,3.0.0

.. note:: Currently this object cannot be created within the Lua code itself.

Functions:
----------

.. py:function::  lookup(hostname[, event])

   Lookup hostname asynchronously via dns-client process.

   :param str hostname: Hostname to lookup
   :param event event: Event to use for logging

   :return: On succesful DNS lookup, returns a table with IP addresses (which
            has at least one IP).

	    On failure, returns nil, error string, net_gethosterror()
	    compatible error code (similar to e.g. Lua io.* calls).

mail-lua
^^^^^^^^

.. dovecotadded:: 2.3.4

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins. Mail-lua provides a common script to be used in mail storage instead
of per-plugin scripts.

See: :ref:`plugin-mail-lua`.

C API
^^^^^

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

   .. dovecotadded:: 2.3.7

.. c:enum::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT

    String constant ``vendor/vendor.dovecot/pvt/``

    .. dovecotadded:: 2.3.7

.. c:enum::  MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT_SERVER

    String constant ``vendor/vendor.dovecot/pvt/server/``

    .. dovecotadded:: 2.3.7


object mail_user
^^^^^^^^^^^^^^^^^

.. py:currentmodule:: mail_user

Meta
----

* has tostring
* is comparable (by username)

Functions
---------

.. py:function::  plugin_getenv(key)

   Returns key from user plugin settings or userdb environment

   :param str key: Setting name

.. py:function::  var_expand(template)

   Expands mail user variables (see :ref:`config_variables`)

   :param str template: Variable template string

.. py:function::  mailbox(name, flags)

   Allocates a mailbox, flags optional

   :param str name: Mailbox name
   :param flags int: Flags, see :ref:`dovecot.storage`

.. py:function:: metadata_get(key)

   Returns given metadata key for the user.

   :param str key: Metadata key, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_set(key, value)

   Sets user metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_unset(key)

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_list(prefix, prefix, prefix...)

   Lists all keys for the user metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

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

.. py:currentmodule:: mailbox

Meta
----

* has tostring
* is comparable (by full mailbox name)

Functions
---------

.. py:function:: open()

   Opens the mailbox

.. py:function:: close()

   Closes the mailbox

.. py:function:: free()

   Releases mailbox (must be done)

.. py:function:: sync(flags)

   Synchronizes the mailbox (should usually be done, flags optional)

   :param int flags: See :ref:`dovecot.storage`

.. py:function:: status(item,item,item...)

   Returns requested mailbox status items as table

   :param str item: Item name

.. py:function:: metadata_get(key)
   :noindex:

   Returns given metadata key for the mailbox.

   :param str key: Metadata key, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_set(key, value)
   :noindex:

   Sets mailbox metadata key to value. Setting value to nil unsets value.

   :param str key: Metadata key, must begin with /private/ or /shared/
   :param str value: Value to set, nil unsets value

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_unset(key)
   :noindex:

   Unsets value, same as calling :c:func:`metadata_set` with nil.

   :param str key: Metadata key, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

.. py:function:: metadata_list(prefix, prefix, prefix...)
   :noindex:

   Lists all keys for the mailbox metadata under prefix.

   :param str prefix: Metadata prefix, must begin with /private/ or /shared/

   .. dovecotadded:: 2.3.7

Variables
---------

.. py:attribute:: vname

   Full mailbox name

.. py:attribute:: name

    Mailbox name

table mailbox status
^^^^^^^^^^^^^^^^^^^^^

.. py:currentmodule:: mailbox_status

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

