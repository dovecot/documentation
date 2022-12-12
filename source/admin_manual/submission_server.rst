.. _submission_server:

=================
Submission Server
=================

As of version 2.3.0, Dovecot provides an SMTP submission service, also known as
a Mail Submission Agent (MSA) :rfc:`6409`. It is
currently implemented as a proxy that acts as a front-end for any :ref:`mta`,
adding the necessary functionality required for a submission service: it adds
the required AUTH :rfc:`4954` support, avoiding
the need to configure the MTA for :ref:`SASL authentication <sasl>`. More SMTP
capabilities like CHUNKING :rfc:`3030` and SIZE :rfc:`1870` are supported, without requiring the
backend MTA supporting these extensions. Other capabilities like 8BITMIME :rfc:`6152` and
DS :rfc:`3461` currently require support from the
backend/relay MTA.

The most notable feature that the proxy adds is the BURL capability :rfc:`4468`.
The main application of that capability — together with :ref:`IMAP <imap_server>`
and URLAUTH :rfc:`4467` — is avoiding a duplicate upload of submitted e-mail
messages; normally the message is both sent through SMTP and uploaded to the
``Sent`` folder through IMAP. Using BURL, the client can first upload the message
to IMAP and then use BURL to make the SMTP server fetch the message from IMAP for
submission, thereby avoiding a second upload. Few clients currently support the
BURL capability, but once it becomes available on the server side, client developers
will at least have some incentive to provide support for this feature.

.. NOTE::

  Currently, the submission proxy is still pretty basic. However, it will
  provide a basis for adding all kinds of functionality in the (not so distant)
  future. For the first time, it will be possible to act upon message
  submission, rather than only message retrieval; e.g. plugins can be devised
  that process outgoing messages somehow. Examples of the things that could be
  implemented are adding Sieve filtering support for outgoing messages, or
  implicitly storing submitted messages to the Sent folder. Once a plugin API
  is devised, you can create your own plugins.

The submission service, when protocol submission is enabled, will listen to
587/tcp (STARTTLS) by default.

To listen on 465/tcp (SMTPS), use following configuration::

  service submission-login {
    inet_listener submissions {
      port = 465
      ssl = yes
    }
  }


Features
========

The following SMTP capabilities are supported by the Dovecot submission
service:

 * 8BITMIME :rfc:`6152` - Only if relay MTA provides
   support
 * AUTH :rfc:`4954`
 * BURL :rfc:`4468`
 * CHUNKING :rfc:`3030`
 * DSN :rfc:`3461` - Only if relay MTA provides
   support
 * ENHANCEDSTATUSCODES :rfc:`2034`
 * PIPELINING :rfc:`2920`
 * SIZE :rfc:`1870`
 * STARTTLS :rfc:`3207`
 * VRFY :rfc:`5321`
 * XCLIENT - See https://www.postfix.org/XCLIENT_README.html

Configuration
=============

Submission Service
^^^^^^^^^^^^^^^^^^

Just add ``submission`` to the ``protocols=`` setting and configure the relay
MTA server. The submission service is a login service, just like IMAP, POP3 and :ref:`pigeonhole_managesieve_server`, so clients
are required to authenticate. The same :ref:`authentication configuration
<authentication-authentication>` shall also apply to submission,
unless you're doing protocol-specific things, in which case you may need to
amend your configuration for the new protocol.

BURL support requires a working IMAP URLAUTH implementation. Details on
configuring Dovecot's URLAUTH support can be found at
:dovecot_core:ref:`imap_urlauth_host`.

The following settings apply to the Submission service:

**submission_logout_format = in=%i out=%o**

The SMTP Submission logout format string. The following variable substitutions
are supported:

   **%i**
      Total number of bytes read from client
   **%o**
      Total number of bytes sent to client
   **%{command_count}**
      Number of commands received from client
   **%{reply_count}**
      Number of replies sent to client
   **%{session}**
      Session ID of the login session
   **%{transaction_id}**
      ID of the current transaction, if any

**hostname**
      The host name reported by the SMTP service (and other parts of Dovecot),
      for example to the client in the initial greeting and to the relay server
      in the HELO/EHLO command. Default is the system's real hostname@domain.
**submission_client_workarounds**
   Configures the list of active workarounds for Submission client bugs. The 
   list is space-separated. Supported workaround identifiers are:
   
   **implicit-auth-external**
      Implicitly login using the EXTERNAL SASL mechanism upon the first MAIL
      command, provided that the client provides a valid TLS client certificate.
      This is helpful for clients that omit explicit SASL authentication when
      configured for authentication using a TLS certificate (Thunderbird for
      example).

      .. versionadded:: v2.3.18

   **mailbox-for-path**
      Allow using bare Mailbox syntax (i.e., without ``<...>``) instead of full path
      syntax.
   **whitespace-before-path**
      Allow one or more spaces or tabs between ``MAIL FROM:`` and path and between
      ``RCPT TO:`` and path.
**submission_max_mail_size**
      The maximum size of messages accepted for relay. This announced in the
      SMTP SIZE capability. If not configured, this is either determined from
      the relay server or left unlimited if no limit is known (the relay MTA
      will reply with error if some unknown limit exists there, which is duly
      passed to Dovecot's client).
**submission_max_recipients**
      Maximum number of recipients accepted per connection (default:
      unlimited).

Relay MTA
^^^^^^^^^

The Dovecot SMTP submission service directly proxies the mail transaction to
the SMTP relay configured with the following settings:

**submission_relay_host**
      Host name for the relay server (required).
**submission_relay_port = 25**
      Port for the relay server.
**submission_relay_trusted = no**
      Is the relay server trusted? This determines whether we try to send
      (Postfix-specific) XCLIENT data to the relay server.
**submission_relay_user =**
      User name for authentication to the relay MTA if authentication is
      required there (authorization ID).
**submission_relay_master_user =**
      Master user name for authentication to the relay MTA if authentication is
      required there (authentication ID).
**submission_relay_password =**
      Password for authentication to the relay MTA if authentication is
      required there.
**submission_relay_ssl = no**
   Indicates whether TLS is used for the connection to the relay server. The
   following values are defined for this setting:

   **no**
      No SSL is used.
   **smtps**
      An SMTPS connection (immediate SSL) is used.
   **starttls**
      The STARTTLS command is used to establish the TLS layer.
**submission_relay_ssl_verify = yes**
      Configures whether the TLS certificate of the relay server is to be
      verified.
**submission_relay_rawlog_dir**
      Write protocol logs for relay connection to this directory for debugging.

See :ref:`debugging_rawlog` for more details on rawlogs.

Login Proxy
^^^^^^^^^^^

Like IMAP and POP3, the Submission login service supports proxying to multiple
backend Dovecot servers. The proxy configuration wiki page for POP3 and IMAP
applies automatically to Submission as well.

.. IMPORTANT::

  Please note that the login proxy described here is configured between two
  Dovecot servers (e.g. proxy frontend and mail storage backend). This is
  not the way to configure the relay connection between the Dovecot submission
  service and the MTA! That is configured using the relay settings described in
  the previous section. If you get this wrong, things will seem to work (at
  least to some extent), but the service provided by Dovecot will be
  effectively bypassed.

Client Support
**************

As of April 2019 there aren't many clients that support the BURL extension.

=========== ============== ====================================================================================================================================================
Client      Supports BURL? Notes
Trojita     Yes            Mentioned `on the dovecot discussion list <https://dovecot.org/pipermail/dovecot/2017-December/110282.html>`_
Thunderbird No             `Vote on bugzilla <https://bugzilla.mozilla.org/show_bug.cgi?id=421779>`_
=========== ============== ====================================================================================================================================================

See also
********

.. toctree::
   :maxdepth: 1

   mta
