.. _dovecot_auth_process:

=============================
Authentication process design
=============================

See :ref:`Design/Processes <dovecot_processes>`
for an overview of how the authentication process works.

There are four major classes in the code:

-  ``struct mech_module``: Authentication mechanism

-  ``struct password_scheme``: Password scheme

-  ``struct passdb_module``: Password database

-  ``struct userdb_module``: User database

There are many implementations for each of these, and it's simple to add
more of them. They can also be added as plugins, although the current
plugin loading code doesn't allow loading authentication mechanisms
cleanly, and it's not possible to add new credentials (see below).

The code flow usually goes like:

-  Dovecot-auth listens for new authentication client connections (the
   listener socket is created by master process and passed in
   MASTER_SOCKET_FD -> ``main.c:main_init()`` ->
   ``auth-master-connection.c:auth_master_listener_add()``)

-  A new authentication client connects via UNIX socket
   (``auth-master-connection.c:auth_master_listener_accept()`` ->
   ``auth-client-connection.c:auth_client_connection_create()``)

-  Authentication client begins an authentication
   (``auth-client-connection.c:auth_client_input()`` ->
   ``auth_client_handle_line()`` ->
   ``auth-request-handler.c:auth_request_handler_auth_begin()`` [ ->
   ``auth-request.c:auth_request_new()``])

-  Authentication mechanism backend handles it (``mech->auth_initial()``
   and ``mech->auth_continue()`` in ``mech-*.c``)

-  The mechanism looks up the password from passdb
   (``auth-request.c:auth_request_verify_plain()`` and
   ``auth_request_lookup_credentials()``) and the password scheme code
   to verifies it (``password-scheme.c:password_verify()`` and
   ``password_generate()``)

-  If user is logging in, the user information is looked up from the
   userdb (``auth-master-connection.c:master_input()`` ->
   ``master_input_request()`` ->
   ``auth-request-handler.c:auth_request_handler_master_request()`` ->
   ``auth-request.c:auth_request_lookup_user()``)

-  The authentication may begin new authentication requests even before
   the existing ones are finished.

It's also possible to request a userdb lookup directly, for example
Dovecot's :ref:`deliver <lda>` needs that. The code path for that goes
``auth-master-connection.c:master_input()`` -> ``master_input_user()``
-> ``auth-request.c:auth_request_lookup_user()``.

Authentication mechanisms
-------------------------

These are :ref:`SASL <sasl>` authentication mechanism implementations. See
:ref:`Authentication/Mechanisms <authentication-authentication_mechanisms>`
or a list of mechanisms supported by Dovecot.

A new mechanism is created by filling a ``struct mech_module`` (in
``mech.h``) and passing it to ``mech_register_module()``. The struct
fields are:

``mech_name``
   The public name of the mechanism. This is shown to clients in the
   IMAP, POP3 and SMTP capability lists. If you create a new
   non-standard mechanism, please prefix it with "X-".

``flags``
   Describes how secure the mechanism is. Also ``MECH_SEC_PRIVATE`` flag
   specifies that the mechanism shouldn't be advertised in the
   capability list. This is currently used only for APOP mechanism,
   which is defined by the POP3 protocol itself.

``passdb_need_plain``
   This mechanism uses passdb's ``verify_plain()`` function to verify
   the password's validity. This means that the mechanism has access to
   the plaintext password. This is true only for plaintext mechanisms
   such as PLAIN and LOGIN. The main purpose of this flag is to make
   dovecot-auth complain at startup if there are no passdbs defined in
   the configuration file. Note that a configuration without any passdbs
   is valid with eg. GSSAPI mechanism which doesn't need a passdb at
   all.

``passdb_need_credentials``
   This mechanism uses passdb's ``lookup_credentials()`` function. See
   below for description of the credentials.

``auth_new()``
   Allocates a new ``struct auth_request``. Typically with more complex
   mechanisms it really allocates a ``struct <mech>_auth_request`` which
   contains ``struct auth_request`` as the first field, followed by
   mechanism-specific fields.

``auth_initial(request, data, data_size)``
   This begins the authentication, data and data_size containing the
   initial response sent by the client (decoded, not in base64). Call
   ``request->callback()`` once you're done (see below).

``auth_continue(request, data, data_size)``
   Continues the authentication. Works the same as ``auth_initial()``.

``auth_free()``
   Free the request. Usually all the memory allocations for the request
   should be allocated from ``request->pool``, so you can use
   ``mech_generic_auth_free()`` which simply frees the pool.

``auth_initial()`` and ``auth_continue()`` continue or finish the
authentication by calling ``request->callback()``:

.. code-block:: C

   typedef void mech_callback_t(struct auth_request *request,
                                enum auth_client_result result,
                                const void *reply, size_t reply_size);

The ``reply`` and ``reply_size`` contain the server's mechanism-specific
reply to the client. If there is no need to return anything (which is
usually the case with the "success" reply), the ``reply_size`` can be 0.
The ``result`` parameter is one of:

-  ``AUTH_CLIENT_RESULT_CONTINUE``: Client can continue the authentication.
   The reply contains the mechanism-specific reply sent to the client.

-  ``AUTH_CLIENT_RESULT_SUCCESS``: Authentication successful. The reply is
   usually empty.

-  ``AUTH_CLIENT_RESULT_FAILURE``: Authentication failed. The reply is
   always ignored.

The ``request->callback()`` should actually be called directly only for
continuation requests (a new function should probably be added for this
as well). For success and failure replies, you should instead use one of
these functions:

-  ``auth_request_success()``

-  ``auth_request_fail()``

-  ``auth_request_internal_failure()``: Use this if you couldn't figure
   out if the authentication succeeded or failed, for example because
   passdb lookup returned internal failure.

SASL authentication in general works like:

1. Client begins the authentication, optionally sending an "initial
   response", meaning some data that the mechanism sees in
   ``auth_initial()``.

   -  Note that not all protocols support the initial response. For
      example IMAP supports it only if the server implements SASL-IR
      extension. Because of this mechanisms, such as PLAIN, support
      doing the authentication either in ``auth_initial()`` or in
      ``auth_continue()``.

   -  If the client initiates the authentication (ie. server's initial
      reply is empty, such as with PLAIN mechanism) you can use
      ``mech_generic_auth_initial()`` instead of implementing your own.

2. Server processes the authentication request and replies back with
   ``request->callback()``.

   -  If the authentication failed, it's placed into
      ``auth_failures_buf`` unless ``request->no_failure_delay=TRUE``.
      The failures are flushed from the buffer once every 2 seconds to
      clients and ``mechanism->auth_free()`` is called.

   -  If the authentication succeeded and

      -  there is a master connection associated with the request
         (IMAP/POP3 login), the authentication now waits for master
         connection to do a verification request. If this for some
         reason doesn't happen in ``AUTH_REQUEST_TIMEOUT`` seconds (3,5
         mins), it's freed.

      -  there isn't a master connection (SMTP AUTH), the authentication
         is freed immediately.

3. Client processes the reply:

   -  If the authentication continues, it sends back more data which is
      processed in ``auth_continue()``. Goto 2.

   -  If the authentication failed, it's done.

4. If the authentication succeeded, the client requests a login from the
   master process, which in turn requests verification from the auth
   process.

   -  Besides verifying the authentication, dovecot-auth also does a
      userdb lookup to return the userdb information to master.

   -  If the verification fails (normally because userdb lookup fails),
      the client gets "internal authentication failure"

   -  If the verification succeeds, the user is now logged in

   -  In either case, ``mechanism->auth_free()`` is called now.

Credentials
~~~~~~~~~~~

Most of the non-plaintext mechanisms need to verify the authentication
by using a special hash of the user's password. So either the passdb
credentials lookup returns a plaintext password from which the hash can
be created, or the hash directly. The plaintext to hash conversion is
done by calling ``password_generate`` function of the password scheme.

Unfortunately the list of allowed credentials is currently hardcoded in
``enum passdb_credentials``. The enum values are mapped to password
scheme strings in ``passdb_credentials_to_str()``. Some day the enum
will be removed so plugins can add new mechanisms. Besides the
mechanism-specific credentials, the enum contains:

``_PASSDB_CREDENTIALS_INTERNAL``
   I don't remember why this really exists. It should probably be called
   ``_PASSDB_CREDENTIALS_INVALID`` or something and used only by some
   asserts..

``PASSDB_CREDENTIALS_PLAINTEXT``
   Request a plaintext password.

``PASSDB_CREDENTIALS_CRYPT``
   Request the password in any scheme. This is especially useful if you
   only want to verify a user's existence in a passdb. Used by :ref:`static
   userdb <authentication-static_user_database>`
   in userdb lookups.

Password schemes
----------------

``struct password_scheme`` has fields:

``name``
   Name of the scheme. This only shows up in configuration files and
   maybe in the passwords stored in passdb
   ("{scheme_name}password_hash").

``password_verify(plaintext, password, user)``
   Returns TRUE if ``password`` hash matches the plaintext password
   given in ``plaintext`` parameter. If the password hash depends on the
   username (eg. with DIGEST-MD5), the ``user`` parameter can also be
   used.

``password_generate(plaintext, user)``
   Returns the password hash for given plaintext password and username.

You can create a new password scheme by simply creating a
``struct password_scheme`` named ``<module_name>_scheme``, compiling a
shared object and placing it to ``$moduledir/auth/`` directory.

Password databases
------------------

See
:ref:`Password Database <authentication-password_databases>`
for a description of passdbs and a list of already implemented ones.

``struct passdb_module`` contains fields:

``cache_key``
   A string containing  :ref:`variables <config_variables>`.
   When expanded, it uniquely identifies a passdb lookup. This is ``%u``
   when the passdb lookup validity depends only on the username. With
   more complex databases such as SQL and LDAP this is created
   dynamically based on the password query in the configuration file. If
   there are multiple variables, they should be separated so that their
   contents don't get mixed, for example ``%u<TAB>%r<TAB>%l``.
   ``auth_cache_parse_key()`` can be used to easily create a cache key
   from a query string.

``default_pass_scheme``
   The default scheme to use when it's not explicitly specified with a
   "{scheme}" prefix.

``blocking``
   If TRUE, the lookup is done in dovecot-auth worker process. This
   should be used if the lookup may block.

``iface.preinit(auth_passdb, args)``
   Allocate ``struct passdb_module`` and return it. This function is
   called before chrooting and before privileges are dropped from
   dovecot-auth process, so if should do things like read the
   configuration file. ``auth_passdb`` is typically used for getting a
   memory pool and looking up some global settings such as
   ``auth_passdb->auth->verbose_debug``. ``args`` contains the args
   parameter in configuration file.

``iface.init(module, args)``
   The privileges have been dropped before calling this. ``module``
   contains the structure returned by ``preinit()``. ``args`` is the
   same as in ``preinit()``. Typically this function will do things like
   connect to the database.

``iface.deinit(module)``
   Close the connection to the password database and free all the memory
   you used.

``iface.verify_plain(auth_request, password, callback)``
   Check if the given plaintext password matches.
   ``auth_request->credentials = -1`` always. When the verification is
   done, call the given callback with the result in ``result``
   parameter.

``iface.lookup_credentials(auth_request, callback)``
   Look up the password credentials. ``auth_request->credentials``
   contains the credentials that the mechanism wants. When the lookup is
   finished, call the given callback with the result in ``result``
   parameter, and if the lookup was successful the credentials in
   ``password`` parameter.

Plaintext authentication mechanisms typically call ``verify_plain()``,
which is possible to implement with all the passdbs. Non-plaintext
mechanisms typically call ``lookup_credentials()``, which isn't possible
to implement always (eg. PAM). If it's not possible to implement
``lookup_credentials()``, you can leave the pointer to it NULL.

If the passdb uses connections to external services, it's preferred that
they use non-blocking connections. Dovecot does this whenever possible
(PostgreSQL and LDAP for example). If it's not possible, set
``blocking = TRUE``.

With both functions ``auth_request->passdb->passdb`` contains the
passdb_module returned by your ``preinit()`` function.
``auth_request->user`` contains the username whose password we're
verifying. You don't need to worry about :ref:`master
users <authentication-master_users>` here. It's also possible to use
any other fields in ``auth_request`` to do the lookup, such as
``service``, ``local_ip`` or ``remote_ip`` if they exist. Often you
want to let user to configure the lookup with
:ref:`variables <config_variables>` (eg. SQL query). In that case you can
use ``auth_request_get_var_expand_table()`` to retrieve the variable table
for ``var_expand()``.

The passdb lookup can return one of the following results:

``PASSDB_RESULT_INTERNAL_FAILURE``
   The lookup failed. For example SQL server is down.

``PASSDB_RESULT_SCHEME_NOT_AVAILABLE``
   ``lookup_credentials()`` requested a scheme which isn't in the passdb

``PASSDB_RESULT_USER_UNKNOWN``
   The user doesn't exist in the database.

``PASSDB_RESULT_USER_DISABLED``
   The user is disabled either entirely, or for this specific login (eg.
   only POP3 logins allowed). This isn't commonly implemented in
   passdbs.

``PASSDB_RESULT_PASS_EXPIRED``
   The user's password had expired. This isn't commonly implemented in
   passdbs.

``PASSDB_RESULT_PASSWORD_MISMATCH``
   The password given in ``verify_plain()`` wasn't valid.

``PASSDB_RESULT_OK``
   Success.

User databases
--------------

See :ref:`UserDatabase <authentication-user_database>`
for a description of userdbs and a list of already implemented ones.

``struct userdb_module`` is very similar to ``struct passdb_module``.
The lookup callback is a bit different though:

.. code-block:: C

   typedef void userdb_callback_t(enum userdb_result result,
                                  struct auth_stream_reply *reply,
                                  struct auth_request *request);

``result`` contains one of:

``USERDB_RESULT_INTERNAL_FAILURE``
   The lookup failed. For example SQL server is down.

``USERDB_RESULT_USER_UNKNOWN``
   The user doesn't exist in the database.

``USERDB_RESULT_OK``
   Success.

There is no equivalent for PASSDB_RESULT_USER_DISABLED currently.
Practically the userdb result is used only by Dovecot's
:ref:`deliver <lda>` to figure out if the user exists or not.
When logging in with IMAP or POP3, the user's existence was already
checked in passdb lookup, so only in rare conditions when a user is
logging in at the same time as it's being deleted, the userdb result
is USER_UNKNOWN.

The ``reply`` parameter contains the username (it's allowed to be
different from the looked up username) and a list of key=value pairs
that were found from the userdb. The userdb should make sure that at
least "uid" and "gid" keys were returned. Here's an example code based
on passwd userdb:

.. code-block:: C

   reply = auth_stream_reply_init(auth_request);
   auth_stream_reply_add(reply, NULL, pw->pw_name);
   auth_stream_reply_add(reply, "uid", dec2str(pw->pw_uid));
   auth_stream_reply_add(reply, "gid", dec2str(pw->pw_gid));
   auth_stream_reply_add(reply, "home", pw->pw_dir);
   callback(USERDB_RESULT_OK, reply, auth_request);
