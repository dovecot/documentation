.. _dovecot_auth_protocol:

====================================
Dovecot Authentication Protocol v1.1
====================================

General
-------

This is a line based protocol. Each line is a command which ends with an
LF character. The maximum line length isn't defined, but it's currently
expected to fit into 8192 bytes. Authentication mechanism specific data
transfers are the largest single parameters.

Each command is in format:

::

   <command name> TAB <parameters separated with TAB>

Parameters are split into required and optional parameters. Required
parameters aren't in any specific format, but optional parameters are
either booleans without a value, or a name=value pair. If optional
parameter name is unknown, the parameter should just be ignored.

Typical command looks like (without spaces):

::

   command TAB param1 TAB param2 TAB optname=value TAB optboolean

There is no way to have TABs or LFs in parameters.

Client <-> Server
-----------------

Client is an untrusted authentication client process. It can serve one
or more users, so from user's point of view it's usually eg. IMAP or
SMTP server process.

Server is an authentication server process.

The connection starts by both client and server sending handshakes:

::

   C: "VERSION" TAB <major> TAB <minor>
   C: "CPID" TAB <pid>
   S: "VERSION" TAB <major> TAB <minor>
   S: "SPID" TAB <pid> 
   S: "CUID" TAB <pid>
   S: "COOKIE" TAB <cookie>
   S: "MECH" TAB <name> [TAB <parameters>] (multiple times)
   S: "DONE"

Both client and server should check that they support the same major
version number. If they don't, the other side isn't expected to be
talking the same protocol and should be disconnected. Minor version can
be ignored. This document is version number 1.1.

-  CPID and SPID specify client and server Process Identifiers (PIDs).
   They should be unique identifiers for the specific process. UNIX
   process IDs are good choices.

-  CUID is a server process-specific unique connection identifier. It's
   different each time a connection is established for the server.

-  CPID is used by master's REQUEST command.

-  SPID can be used by authentication client to tell master which server
   process handled the authentication.

-  CUID is currently useful only for APOP authentication.

-  COOKIE returns connection-specific 128 bit cookie in hex. It must be
   given to REQUEST command. (Protocol v1.1+ / Dovecot v2.0+)

-  DONE finishes the handshake from server. CPID finishes the handshake
   from client.

Authentication Mechanisms
~~~~~~~~~~~~~~~~~~~~~~~~~

MECH command announces an available authentication SASL mechanism.
Mechanisms may have parameters giving some details about them:

anonymous
   Anonymous authentication

plaintext
   Transfers plaintext passwords

dictionary
   Subject to passive (dictionary) attack

active
   Subject to active (non-dictionary) attack

forward-secrecy
   Provides forward secrecy between sessions

mutual-auth
   Provides mutual authentication

private
   Don't advertise this as available SASL mechanism (eg. APOP)

Authentication Request
~~~~~~~~~~~~~~~~~~~~~~

::

   C: "AUTH" TAB <id> TAB <mechanism> TAB service=<service> [TAB <parameters>]
   S1: "FAIL" TAB <id> [TAB <parameters>]
   S2: "CONT" TAB <id> TAB <base64 data>
   S3: "OK" TAB <id> [TAB <parameters>]

ID is a connection-specific unique request identifier. It must be a
32bit number, so typically you'd just increment it by one.

Service is the service requesting authentication, eg. POP3, IMAP, SMTP.

AUTH and USER (see below) common parameters are:

lip=<ip>
   Local IP - in standard string format,

rip=<ip>
   Remote IP - ie. for IPv4 127.0.0.1 and for IPv6 ::1

lport=<port>
   Local port

rport=<port>
   Remote port

AUTH-only parameters are:

secured
   Remote user has secured transport to auth client] (e.g. localhost,
   SSL, TLS)

valid-client-cert
   Remote user has presented a valid SSL certificate.

no-penalty
   Ignore auth penalty tracking for this request

cert_username
   Username taken from client's SSL certificate.

resp=<base64>
   Initial response for authentication mechanism. NOTE: This must be the
   last parameter. Everything after it is ignored. This is to avoid
   accidental security holes if user-given data is directly put to
   base64 string without filtering out tabs.

FAIL parameters may contain:

reason=<str>
   <str> should be sent to remote user instead of the standard
   "Authentication failed" messages. For example "invalid base64 data".
   It must NOT be used to give exact reason for authentication failure
   (i.e. "user not found" vs. "password mismatch").

code=temp_fail (v2.3+), temp (<v2.2)
   This is a temporary internal failure, e.g. connection was lost to SQL
   database.

code=authz_fail (v2.3+), authz (v1.2..v2.2)
   Authentication succeeded, but authorization failed (master user's
   password was ok, but destination user was not ok).

code=user_disabled (v2.3+), user_disabled (v2.2)
   User is disabled (password may or may not have been correct)

code=pass_expired (v2.3+), pass_expired (v2.2)
   User's password has expired.

A CONT response means that the authentication continues, and more data
is expected from client to finish the authentication. Given base64 data
should be sent to client. The client may continue the process issuing

::

   C: "CONT" TAB <id> TAB <base64 data>

The <id> must match the <id> of the AUTH command.

FAIL and OK may contain multiple unspecified parameters which
authentication client may handle specially. The only one specified here
is "user=<userid>" parameter, which should always be sent if the userid
is known.

Server <-> Master
-----------------

Master is a trusted process which may query results of previous client
authentication or information about a specific user. Master is optional
and in SMTP AUTH case it's not needed.

The connection starts by both server and master sending handshakes:

::

   S: "VERSION" TAB <major> TAB <minor>
   S: "SPID" TAB <pid>
   M: "VERSION" TAB <major> TAB <minor>

Auth with client <-> server, both should check that the version numbers
are valid.

SPID can be used to let master identify the server process.

Master Requests
~~~~~~~~~~~~~~~

::

   M: "REQUEST" TAB <id> TAB <client-pid> TAB <client-id> TAB <cookie>
   M: "USER" TAB <id> TAB <userid> TAB service=<service> [TAB <parameters>]
   S: "NOTFOUND" TAB <id>
   S: "FAIL" TAB <id> TAB <error message>
   S: "USER" TAB <id> TAB <userid> [TAB <parameters>]

Master commands can request information about existing authentication
request, or about a specified user.

USER command's service and parameters are the same as with AUTH client
request.

ID is a connection-specific unique request identifier. It must be a
32bit number, so typically you'd just increment it by one.

NOTFOUND reply means that the user wasn't found. (v1.x also reported
unknown request IDs with NOTFOUND.)

FAIL reply means an internal error occurred. Usually either a
configuration mistake or temporary error caused by lost resource (eg.
database down). Also unknown request IDs are reported as FAILs (since
v2.0).

USER reply is sent if request succeeded. It can return parameters:

uid=<uid>
   System user ID.

gid=<gid>
   System group ID.

home=<dir>
   Home directory.

chroot=<dir>
   Chroot directory.

mail=<data>
   Mail location.

system_user=<user>
   System user name which can be used to get extra groups. This will
   probably be replaced later by giving just multiple gid fields.
