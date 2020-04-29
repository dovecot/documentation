.. _login_proxy:

======================
Login process proxying
======================

Proxying using login processes is done for IMAP, POP3, Submission and
ManageSieve protocols. LMTP and doveadm protocols implement their own
proxying, but they try to be mostly compatible.

Proxying states
===============

If login fails, the error message shows the connection state when the
disconnection or timeout happened. For example ``timed out in
state=login/banner`` with IMAP means that connection timed out while waiting
for LOGIN command reply.

IMAP states
-----------

IMAP states are a bit more complicated. They describe both what commands
the proxy has sent towards the backend and also what was the last received
reply from the backend. The proxy can also send multiple commands pipelined,
which are listed in the state. For example the state could be
``capability+login/banner`` to mean that CAPABILITY and LOGIN commands have been
sent, but only the IMAP banner reply has been received so far.

The list of sending states (left side of ``/``):

 * id: ID command used to send session ID and original IMAP client IP/port
 * starttls: STARTTLS command
 * capability: CAPABILITY command. Only used if backend doesn't send it automatically
 * login: LOGIN command.
 * authenticate: AUTHENTICATE command. Sent if LOGIN command couldn't be used, e.g. because using master user login or non-plaintext authentication.
 * auth-continue: SASL continuation sent for AUTHENTICATE command

The list of received states (right side of ``/``):

 * none: Nothing has been received so far
 * banner: IMAP banner received (``* OK Dovecot ready``)
 * id: ID command reply received
 * starttls: STARTTLS command reply received
 * capability: CAPABILITY command reply received
 * auth-continue: AUTHENTICATE command asked for continuation (``+`` reply)
 * login: LOGIN or AUTHENTICATE command reply received

.. versionchanged:: v2.3.8 Earlier versions had a bug and could have added
                    multiple ``+`` characters to the state, for example
		    ``authenticate++/capability``. The extra ``+`` characters
		    should be just ignored.

POP3 states
-----------

POP3 states work a bit differently than IMAP states:

 * banner: Nothing has been received so far (banner has NOT been received)
 * starttls: STLS command has been sent.
 * xclient: XCLIENT command has been sent.
 * login1: USER command has been sent.
 * login2: PASS or AUTH command has been sent.
   
Submission states
-----------------

Submission states are similar to POP3:

 * banner: Nothing has been received so far (banner has NOT been received)
 * ehlo: EHLO command has been sent.
 * starttls: STLS command has been sent.
 * tls-ehlo: EHLO command after STLS has been sent.
 * xclient: XCLIENT command has been sent.
 * authenticate: AUTH command has been sent.

ManageSieve states
------------------

 * none: Nothing has been received so far
 * tls-start: STARTTLS command has been sent.
 * tls-ready: STARTTLS command was accepted. TLS handshake was started.
 * xclient: XCLIENT command has been sent.
 * auth: AUTHENTICATE command has been sent.
