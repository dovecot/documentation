.. _dovecot_auth_process:

=============================
Authentication process design
=============================

See :ref:`Design/Processes <dovecot_processes>`
for an overview of how the Dovecot processes work.

There are four major classes in the code:

-  ``struct mech_module``: Authentication (SASL) mechanism

-  ``struct password_scheme``: Password scheme

-  ``struct passdb_module``: Password database

-  ``struct userdb_module``: User database

There are many implementations for each of these, and it's simple to add
more of them. They can also be added as plugins.

The code flow usually goes like:

-  The auth process listens for new authentication client connections.
-  A new authentication client (e.g. login process) connects to the ``login``
   or ``auth-client`` UNIX socket.
-  Authentication client sends a request to begin a SASL authentication.
-  Authentication mechanism backend handles it (``mech->auth_initial()``
   and ``mech->auth_continue()`` in ``mech-*.c``)
-  The mechanism either asks the passdbs to verify a username/password pair
   (``auth_request_verify_plain()``), or it looks up the credentials itself
   (``auth_request_lookup_credentials()``) and verifies that they are valid.
-  Success reply is sent to the authentication client.
-  If this is a login from login process, it creates a mail process by
   connects to the process type-specific socket (e.g. ``imap`` or ``pop3``)
   and sending the authentication reply information to it.
-  The mail process connects to the ``auth-master`` UNIX socket and finishes
   the authentication request. This includes doing a userdb lookup, which is
   returned back to the mail process.

The authentication is fully asynchronous and it supports handling
multiple requests in parallel.

It's also possible to do passdb and userdb lookups directly without full
authentication.

The login socket is mostly treated as untrusted. It's not possible for it
to authenticate users without actually providing the proper credentials.
However, there are some fields that need to be trusted:

 * Client IP address and port
 * Local server IP address and port
 * Connecting proxy's IP address and port
 * Client TLS certificate's username and trust status. This means that if
   authentication is done via client TLS certificates, the auth process simply
   trusts the login process to verify the certificate. This breaks the trust
   model and should be fixed some day.


Authentication (SASL) mechanisms
--------------------------------

These are :ref:`SASL <sasl>` authentication mechanism implementations. See
:ref:`authentication-authentication_mechanisms`
for a list of mechanisms supported by Dovecot.

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

``auth_initial()`` and ``auth_continue()`` can send SASL continuation
requests. For success and failure replies, use one of these functions:

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
   ``auth_request_handler_reply()``.

   -  If the authentication failed, it's placed into
      ``auth_failures`` array unless ``request->no_failure_delay=TRUE``.
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

4. If the authentication succeeded, the client connects to the post-login
   mail process, which in turn connects to auth and does the final auth
   verification.

   -  Besides verifying the authentication, auth process also does a
      userdb lookup to return the userdb information to the mail process.

   -  If the verification fails (normally because userdb lookup fails),
      the client gets "internal authentication failure"

   -  If the verification succeeds, the user is now logged in

   -  In either case, ``mechanism->auth_free()`` is called now.

Credentials
~~~~~~~~~~~

Most of the non-plaintext mechanisms need to verify the authentication
by using a special hash of the user's password. So either the passdb
credentials lookup returns a plaintext password from which the hash can
be created, or the hash directly. Both of these cases can be handled simply
by calling ``auth_request_lookup_credentials()`` with the wanted password
scheme.

Password schemes
----------------

``struct password_scheme`` has fields:

``name``
   Name of the scheme. This only shows up in configuration files and
   maybe in the passwords stored in passdb
   ("{scheme_name}password_hash").

``password_verify(plaintext, params, raw_password, raw_password_size, error)``
   Returns 1 if ``raw_password`` hash matches the plaintext password
   given in ``plaintext`` parameter. The ``raw_password`` is in binary, i.e.
   not hex or base64-encoded.

``password_generate(plaintext, params, raw_password_r, raw_password_size_r)``
   Returns the password hash for given plaintext password.

The ``params`` can be used to specify some extra parameters:

 * ``user``: Used if the password hash depends on the username (eg. with DIGEST-MD5).
 * ``rounds``: Some schemes support a configurable number of hash rounds.

A new password scheme can be created simply by creating a
``struct password_scheme`` named ``<module_name>_scheme``, compiling a
shared object and placing it to ``$moduledir/auth/`` directory.

Password databases
------------------

See :ref:`authentication-password_databases`
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
   If TRUE, the lookup is done in auth-worker process. This
   should be used if the lookup may block.

``iface.preinit(pool, args)``
   Allocate ``struct passdb_module`` from the ``pool`` and return it. This function is
   called before chrooting and before privileges are dropped from
   the auth process, so if should do things like read the
   configuration file. ``args`` contains the args
   parameter in the configuration file.

``iface.init(module)``
   The privileges have been dropped before calling this. ``module``
   contains the structure returned by ``preinit()``. Typically this function
   will do things like connect to the database.

``iface.deinit(module)``
   Close the connection to the password database and free all the used memory.

``iface.verify_plain(auth_request, password, callback)``
   Check if the given plaintext password matches.
   ``auth_request->wanted_credentials_scheme == NULL`` always. When the
   verification is done, call the given callback with the result in ``result``
   parameter.

``iface.lookup_credentials(auth_request, callback)``
   Look up the password credentials. ``auth_request->wanted_credentials_scheme``
   contains the credentials that the mechanism wants. Afterwards call
   ``passdb_handle_credentials()`` to finish the request.

Plaintext authentication mechanisms typically call ``verify_plain()``,
which is possible to implement with all the passdbs. Non-plaintext
mechanisms typically call ``lookup_credentials()``, which isn't possible
to implement always (eg. PAM). If it's not possible to implement
``lookup_credentials()``, the pointer can be left NULL.

If the passdb uses connections to external services, it's preferred that
they use non-blocking connections. Dovecot does this whenever possible
(PostgreSQL and LDAP for example). If it's not possible, set
``blocking = TRUE``.

With both functions ``auth_request->passdb->passdb`` contains the
passdb_module returned by your ``preinit()`` function.
``auth_request->user`` contains the username whose password is being
verified. There's no need to worry about
:ref:`master users <authentication-master_users>` here. It's also possible to use
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

``PASSDB_RESULT_NEXT``
   Internal use only: The "noauthenticate" field is set.

``PASSDB_RESULT_PASSWORD_MISMATCH``
   The password given in ``verify_plain()`` wasn't valid.

``PASSDB_RESULT_OK``
   Success.

User databases
--------------

See :ref:`authentication-user_database`
for a description of userdbs and a list of already implemented ones.

``struct userdb_module`` is very similar to ``struct passdb_module``.
The lookup callback is a bit different though:

.. code-block:: C

   typedef void userdb_callback_t(enum userdb_result result,
                                  struct auth_request *request);

``result`` contains one of:

``USERDB_RESULT_INTERNAL_FAILURE``
   The lookup failed. For example SQL server is down.

``USERDB_RESULT_USER_UNKNOWN``
   The user doesn't exist in the database.

``USERDB_RESULT_OK``
   Success.

There is no equivalent for PASSDB_RESULT_USER_DISABLED currently.
When logging in with IMAP or POP3, the user's existence was already
checked in passdb lookup, so only in rare conditions when a user is
logging in at the same time as it's being deleted, the userdb result
is USER_UNKNOWN.

The results are added to the auth_request using ``auth_request_set_field()``
and ``auth_request_set_userdb_field()``.
