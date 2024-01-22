.. _pigeonhole_sieve_interpreter:

============================
Pigeonhole Sieve Interpreter
============================

The Pigeonhole project provides Sieve support as a plugin for Dovecot's :ref:`Local
Delivery Agent (LDA) <lda>` and also for its :ref:`LMTP
<lmtp_server>` service. The plugin implements a Sieve
interpreter, which filters incoming messages using a script specified in the
Sieve language (:rfc:`5228`). The Sieve
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

body :rfc:`5173`                                                                                    supported                       yes                        Allows evaluating the body of a message
copy :rfc:`3894`                                                                                    supported                       yes                        Allows storing and forwarding messages without canceling the implicit keep
date :rfc:`5260#section-4`                                                                          supported (v0.1.12+)            yes                        Adds the ability to test date and time values in various ways
duplicate :rfc:`7352`                                                                               supported (v0.4.3+)             yes                        Allows detecting duplicate message deliveries
editheader :rfc:`5293`                                                                              supported (v0.3.0+)             no                         Adds the ability to add and remove message header fields
encoded-character :rfc:`5228#section-2.4.2.4`                                                       supported                       yes                        Allows encoding special characters numerically
enotify :rfc:`5435`                                                                                 supported (v0.1.3+)             yes                        Provides the ability to send notifications by various means (currently only mailto)
envelope :rfc:`5228#section-5.4`                                                                    supported                       yes                        Allows evaluating envelope parts, i.e. sender and recipient
environment :rfc:`5183`                                                                             supported (v0.4.0+)             yes                        Allows testing against various labeled values from the execution environment
fileinto :rfc:`5228#section-4.1`                                                                    supported                       yes                        Allows storing messages in folders other than INBOX
foreverypart :rfc:`5703#section-3`                                                                  supported (v0.4.14+)            yes                        Allows iterating through the message's MIME parts
ihave :rfc:`5463`                                                                                   supported (v0.2.4+)             yes                        Adds the ability to test for support of Sieve extensions and dynamically invoke their use
imap4flags :rfc:`5232`                                                                              supported                       yes                        Allows adding IMAP flags to stored messages
imapsieve :rfc:`6785`                                                                               supported (v0.4.14+)            no (plugin)                Provides access to special environment items when executing at IMAP events
include :rfc:`6609`                                                                                 supported (v0.4.0+)             yes                        Allows including other Sieve scripts
index :rfc:`5260#section-6`                                                                         supported (v0.4.7+)             yes                        Allows matching specific header field instances by index
mailbox :rfc:`5490#section-3`                                                                       supported (v0.1.10+)            yes                        Provides a mailbox existence check and allows creating mailboxes upon fileinto
mboxmetadata :rfc:`5490`                                                                            supported (v0.4.7+)             no                         Provides access to mailbox METADATA entries
mime :rfc:`5703#section-4`                                                                          supported (v0.4.14+)            yes                        Allows testing parts of structured MIME header fields
extracttext :rfc:`5703#section-7`                                                                   supported (v0.4.14+)            yes                        Allows extracting text from individual message MIME parts
regex https://tools.ietf.org/html/draft-murchison-sieve-regex-08                                    supported                       yes                        Provides regular expression match support
reject :rfc:`5429#section-2.2`                                                                      supported                       yes                        Allows rejecting messages with a rejection bounce message
relational :rfc:`5231`                                                                              supported                       yes                        Provides relational match support
servermetadata :rfc:`5490`                                                                          supported (v0.4.7+)             no                         Provides access to server METADATA entries
spamtest :rfc:`5235`                                                                                supported (v0.1.16+)            no                         Implements a uniform way to test against headers added by spam filters
subaddress :rfc:`5233`                                                                              supported                       yes                        Allows testing against delimited elements of the local part of addresses
vacation :rfc:`5230`                                                                                supported                       yes                        Provides auto-responder functionality, e.g. for when the user is on vacation
vacation-seconds :rfc:`6131`                                                                        supported (0.2.3+)              no                         Extends vacation extension with the ability to send vacation responses with intervals of seconds rather than days
variables :rfc:`5229`                                                                               supported                       yes                        Adds variables support to the language
virustest :rfc:`5235`                                                                               supported (v0.1.16+)            no                         Implements a uniform way to test against headers added by virus scanners
imapflags(`obsolete draft <https://tools.ietf.org/html/draft-melnikov-sieve-imapflags-03>`_)        removed (v3.0.0)                no                         Old version of imap4flags (for backwards compatibility with CMU Sieve)
`notify <https://tools.ietf.org/html/draft-martin-sieve-notify-01>`_                                removed (v3.0.0)                no                         Old version of enotify (for backwards compatibility with CMU Sieve)
================================================================================================   =============================   =====================   =====================================================================================================================================


The following Dovecot-specific Sieve extensions are available for the
Pigeonhole Sieve interpreter:

============================================================================================================================================   ===================================================================================================================   =====================   ==================================================================================================================================================
Extension                                                                                                                                         Support Status                                                                                                        Default Enabled               Purpose
`vnd.dovecot.debug <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-debug.txt>`_                             supported (v0.3.0+)                                                                                                         no                    Allows logging debug messages
`vnd.dovecot.environment <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-dovecot-environment.txt>`_         supported (v0.4.14+)                                                                                                        no                    Extends the standard "environment" extension with extra items and a variables namespace for direct access
`vnd.dovecot.execute <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                     :ref:`Extprograms Plugin <pigeonhole_plugin_extprograms>` (v0.3+)                                                           no                    Implements executing a pre-defined set of external programs with the option to process string data through the external program
`vnd.dovecot.filter <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                      :ref:`Extprograms plugin <pigeonhole_plugin_extprograms>` (v0.3+)                                                           no                    Implements filtering messages through a pre-defined set of external programs
`vnd.dovecot.pipe <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt>`_                        See :ref:`Extprograms plugin <pigeonhole_plugin_extprograms>`                                                               no                    Implements piping messages to a pre-defined set of external programs
                                                                                                                                                :ref:`pigeonhole_plugin_extprograms` (v0.3+)
`vnd.dovecot.report <https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-report.txt>`_                            supported (v0.4.14+)                                                                                                        no                    Implements sending Messaging Abuse Reporting Format (MARF) reports (:rfc:`5965`)
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
