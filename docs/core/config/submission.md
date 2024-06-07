---
layout: doc
title: Submission
dovecotlinks:
  submission: submission server
  submission_server: submission server
---

# Submission Server

Dovecot provides an SMTP submission service, also known as a Mail
Submission Agent (MSA) ([[rfc,6409]]).

It is currently implemented as a proxy that acts as a front-end for any
[[link,mta]], adding the necessary functionality required for a submission
service: it adds the required AUTH ([[rfc,4954]]) support, avoiding
the need to configure the MTA for [[link,sasl]].

::: danger NOTE
Dovecot's submission server is NOT a full-featured SMTP server. It REQUIRES
proxying to an external relay SMTP submission server to deliver non-local
messages.
:::

More SMTP capabilities like CHUNKING ([[rfc,3030]]) and SIZE ([[rfc,1870]])
are supported, without requiring the backend MTA supporting these extensions.

Other capabilities like 8BITMIME ([[rfc,6152]]) and DSN ([[rfc,3461]])
currently require support from the backend/relay MTA.

The most notable feature that the proxy adds is the BURL capability
([[rfc,4468]]). The main application of that capability, together with
[[link,imap_server]] and URLAUTH ([[rfc,4467]]), is avoiding a duplicate
upload of submitted e-mail messages. Normally the message is both sent
through SMTP and uploaded to the `Sent` folder through IMAP. Using BURL,
the client can first upload the message to IMAP and then use BURL to make
the SMTP server fetch the message from IMAP for submission, thereby
avoiding a second upload. Few clients currently support the BURL
capability, but once it becomes available on the server side, client
developers will at least have some incentive to provide support for
this feature.

::: warning NOTE
Currently, the submission proxy is still pretty basic. However, it will
provide a basis for adding all kinds of functionality in the (not so distant)
future. For the first time, it will be possible to act upon message
submission, rather than only message retrieval; e.g. plugins can be devised
that process outgoing messages somehow. Examples of the things that could be
implemented are adding Sieve filtering support for outgoing messages, or
implicitly storing submitted messages to the Sent folder. Once a plugin API
is devised, you can create your own plugins.
:::

The submission service, when protocol submission is enabled, will listen to
587/tcp (STARTTLS) by default.

## Features

The following SMTP capabilities are supported by the Dovecot submission
service:

* **8BITMIME** ([[rfc,6152]]): Only if relay MTA provides support
* **AUTH** ([[rfc,4954]])
* **BURL** ([[rfc,4468]])
* **CHUNKING** ([[rfc,3030]])
* **DSN** ([[rfc,3461]]): Only if relay MTA provides support
* **ENHANCEDSTATUSCODES** ([[rfc,2034]])
* **PIPELINING** ([[rfc,2920]])
* **SIZE** ([[rfc,1870]])
* **STARTTLS** ([[rfc,3207]])
* **VRFY** ([[rfc,5321]])
* **XCLIENT**: See https://www.postfix.org/XCLIENT_README.html

## Configuration

### Submission Service

Just add `submission` to the `protocols=` setting and configure the relay
MTA server.

The submission service is a login service, just like IMAP, POP3 and
[[link,managesieve]], so clients are required to authenticate.

The same [[link,authentication,authentication configuration]] will apply to
the submission service, unless you're doing protocol-specific things,
in which case you may need to amend your configuration for the new protocol.

BURL support requires a working IMAP URLAUTH implementation. See
[[setting,imap_urlauth_host]].

#### Settings

<SettingsComponent tag="submission" />

### Relay MTA

The Dovecot SMTP submission service directly proxies the mail transaction to
the SMTP relay.

#### Settings

<SettingsComponent tag="submission_relay" />

### Login Proxy

Like IMAP and POP3, the Submission login service supports proxying to multiple
backend Dovecot servers. The proxy configuration wiki page for POP3 and IMAP
applies automatically to Submission as well.

::: warning IMPORTANT
Please note that the login proxy described here is configured between two
Dovecot servers (e.g. proxy frontend and mail storage backend). This is
not the way to configure the relay connection between the Dovecot submission
service and the MTA! That is configured using the relay settings described in
the previous section. If you get this wrong, things will seem to work (at
least to some extent), but the service provided by Dovecot will be
effectively bypassed.
:::

### SMTPS

To listen on SMTPS port (465/tcp), add this to `dovecot.conf`:

```
service submission-login {
  inet_listener submissions {
    port = 465
    ssl = yes
  }
}
```
