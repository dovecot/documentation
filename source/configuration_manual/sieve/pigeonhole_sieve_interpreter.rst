.. _pigeonhole_sieve_interpreter:

============================
Pigeonhole Sieve Interpreter
============================

The Pigeonhole project provides Sieve support as a plugin for Dovecot's :ref:`Local
Delivery Agent (LDA) <lda>` and also for its :ref:`LMTP
<lmtp_server>` service. The plugin implements a Sieve
interpreter, which filters incoming messages using a script specified in the
Sieve language (`RFC 5228 <https://tools.ietf.org/html/rfc5228>`_). The Sieve
script is provided by the user and, using that Sieve script, the user can
customize how incoming messages are handled. Messages can be delivered to
specific folders, forwarded, rejected, discarded, etc.

Configuration and Use
=====================

:doc:`Download and Installation <installation>`

:doc:`Sieve Interpreter Configuration
<configuration>`

:doc:`Sieve Usage Information <usage>`

:doc:`Sieve Script Examples <examples>`

:ref:`Sieve Interpreter Plugins
<sieve_plugins>`

:doc:`Sieve Troubleshooting
<troubleshooting>`

Supported Features
==================

Sieve language has various :ref:`extensions
<sieve_plugins>`. You can find more
information about the extensions from the Sieve Mail Filtering Language Charter
or the `Sieve.info wiki page <http://sieve.info/>`_.

.. Note:: Sieve doesn't support running external programs.

The Pigeonhole Sieve interpreter recognizes the following Sieve extensions:

================================================================================================   =============================   =====================   =====================================================================================================================================
Extension                                                                                             Support Status                  Default   Enabled               Purpose

`body <https://tools.ietf.org/html/rfc5173>`_                                                        supported                       yes                        Allows evaluating the body of a message
`copy <https://tools.ietf.org/html/rfc3894>`_                                                        supported                       yes                        Allows storing and forwarding messages without canceling the implicit keep
`date <https://tools.ietf.org/html/rfc5260#section-4>`_                                              supported (v0.1.12+)            yes                        Adds the ability to test date and time values in various ways
`duplicate <https://tools.ietf.org/html/rfc7352>`_                                                   supported (v0.4.3+)             yes                        Allows detecting duplicate message deliveries
`editheader <https://tools.ietf.org/html/rfc5293>`_                                                  supported (v0.3.0+)             no                         Adds the ability to add and remove message header fields
`encoded-character <https://tools.ietf.org/html/rfc5228#section-2.4.2.4>`_                           supported                       yes                        Allows encoding special characters numerically
`enotify <https://tools.ietf.org/html/rfc5435>`_                                                     supported (v0.1.3+)             yes                        Provides the ability to send notifications by various means (currently only mailto)
`envelope <https://tools.ietf.org/html/rfc5228#section-5.4>`_                                        supported                       yes                        Allows evaluating envelope parts, i.e. sender and recipient
`environment <https://tools.ietf.org/html/rfc5183>`_                                                 supported (v0.4.0+)             yes                        Allows testing against various labeled values from the execution environment
`fileinto <https://tools.ietf.org/html/rfc5228#section-4.1>`_                                        supported                       yes                        Allows storing messages in folders other than INBOX
`foreverypart <https://tools.ietf.org/html/rfc5703#section-3>`_                                      supported (v0.4.14+)            yes                        Allows iterating through the message's MIME parts
`ihave <https://tools.ietf.org/html/rfc5463>`_                                                       supported (v0.2.4+)             yes                        Adds the ability to test for support of Sieve extensions and dynamically invoke their use
`imap4flags <https://tools.ietf.org/html/rfc5232>`_                                                  supported                       yes                        Allows adding IMAP flags to stored messages
`imapsieve <https://tools.ietf.org/html/rfc6785>`_                                                   supported (v0.4.14+)            no (plugin)                Provides access to special environment items when executing at IMAP events
`include <https://tools.ietf.org/html/rfc6609>`_                                                     supported (v0.4.0+)             yes                        Allows including other Sieve scripts
`index <https://tools.ietf.org/html/rfc5260#section-6>`_                                             supported (v0.4.7+)             yes                        Allows matching specific header field instances by index
`mailbox <https://tools.ietf.org/html/rfc5490#section-3>`_                                           supported (v0.1.10+)            yes                        Provides a mailbox existence check and allows creating mailboxes upon fileinto
`mboxmetadata <https://tools.ietf.org/html/rfc5490>`_                                                supported (v0.4.7+)             no                         Provides access to mailbox METADATA entries
`mime <https://tools.ietf.org/html/rfc5703#section-4>`_                                              supported (v0.4.14+)            yes                        Allows testing parts of structured MIME header fields
`extracttext <https://tools.ietf.org/html/rfc5703#section-7>`_                                       supported (v0.4.14+)            yes                        Allows extracting text from individual message MIME parts
`regex <https://tools.ietf.org/html/draft-murchison-sieve-regex-08>`_                                supported                       yes                        Provides regular expression match support
`reject <https://tools.ietf.org/html/rfc5429#section-2.2>`_                                          supported                       yes                        Allows rejecting messages with a rejection bounce message
`relational <https://tools.ietf.org/html/rfc5231>`_                                                  supported                       yes                        Provides relational match support
`servermetadata <https://tools.ietf.org/html/rfc5490>`_                                              supported (v0.4.7+)             no                         Provides access to server METADATA entries
`spamtest <https://tools.ietf.org/html/rfc5235>`_                                                    supported (v0.1.16+)            no                         Implements a uniform way to test against headers added by spam filters
`subaddress <https://tools.ietf.org/html/rfc5233>`_                                                  supported                       yes                        Allows testing against delimited elements of the local part of addresses
`vacation <https://tools.ietf.org/html/rfc5230>`_                                                    supported                       yes                        Provides auto-responder functionality, e.g. for when the user is on vacation
`vacation-seconds <https://tools.ietf.org/html/rfc6131>`_                                            supported (0.2.3+)              no                         Extends vacation extension with the ability to send vacation responses with intervals of seconds rather than days
`variables <https://tools.ietf.org/html/rfc5229>`_                                                   supported                       yes                        Adds variables support to the language
`virustest <https://tools.ietf.org/html/rfc5235>`_                                                   supported (v0.1.16+)            no                         Implements a uniform way to test against headers added by virus scanners
imapflags(`obsolete draft <https://tools.ietf.org/html/draft-melnikov-sieve-imapflags-03>`_)         removed (v3.0.0)                no                         Old version of imap4flags (for backwards compatibility with CMU Sieve)
`notify <https://tools.ietf.org/html/draft-martin-sieve-notify-01>`_                                 removed (v3.0.0)                no                         Old version of enotify (for backwards compatibility with CMU Sieve)
================================================================================================   =============================   =====================   =====================================================================================================================================


The following Dovecot-specific Sieve extensions are available for the
Pigeonhole Sieve interpreter:

============================================================================================================================================   ===================================================================================================================   =====================   ==================================================================================================================================================
Extension                                                                                                                                         Support Status                                                                                                        Default Enabled               Purpose
`vnd.dovecot.debug <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-debug.txt>`_                             supported (v0.3.0+)                                                                                                         no                    Allows logging debug messages
`vnd.dovecot.environment <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-dovecot-environment.txt>`_         supported (v0.4.14+)                                                                                                        no                    Extends the standard "environment" extension with extra items and a variables namespace for direct access
`vnd.dovecot.execute <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                     :ref:`Extprograms Plugin <pigeonhole_plugin_extprograms>` (v0.3+)                                                           no                    Implements executing a pre-defined set of external programs with the option to process string data through the external program
`vnd.dovecot.filter <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                      :ref:`Extprograms plugin <pigeonhole_plugin_extprograms>` (v0.3+)                                                           no                    Implements filtering messages through a pre-defined set of external programs
`vnd.dovecot.pipe <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                        `Pipe Plugin <https://wiki.dovecot.org/Pigeonhole/Sieve/Plugins/Pipe>`_ (v0.2),                                             no                    Implements piping messages to a pre-defined set of external programs
                                                                                                                                                  :ref:`pigeonhole_plugin_extprograms` (v0.3+)
`vnd.dovecot.report <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-report.txt>`_                            supported (v0.4.14+)                                                                                                       no                    Implements sending Messaging Abuse Reporting Format (MARF) reports (`RFC 5965 <https://tools.ietf.org/html/rfc5965>`_
============================================================================================================================================   ===================================================================================================================   =====================   ==================================================================================================================================================


.. Note::

  Not all extensions are enabled by default, as shown in the table above.
  Deprecated extensions, extensions that add the ability to change messages,
  extensions that require explicit configuration and extensions that are still
  under development are not enabled without explicit :doc:`configuration
  <configuration>`. This means that
  the :pigeonhole:ref:`sieve_extensions` or
  :pigeonhole:ref:`sieve_global_extensions` settings need to be
  adjusted accordingly. Also, for :ref:`plugins
  <sieve_plugins>` it is not enough to add
  the plugin name to the :pigeonhole:ref:`sieve_plugins` setting;
  the extensions introduced by the plugin also need to be enabled explicitly.


ManageSieve server
==================

To give users the ability to upload their own Sieve scripts to your server,
i.e. without the need for shell or FTP access, you can use the ManageSieve
protocol. This is also provided by the :ref:`Pigeonhole
<sieve>` project. It is available as a separate
Dovecot service. Its configuration and use is explained on the :ref:`Pigeonhole
ManageSieve page <pigeonhole_managesieve_server>`.
