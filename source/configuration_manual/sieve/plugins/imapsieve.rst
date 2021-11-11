.. _pigeonhole_plugin_imapsieve:

============================
Pigeonhole: IMAPSieve Plugin
============================

As defined in the base specification (`RFC
5228 <http://tools.ietf.org/html/rfc5228>`_), the Sieve language is
used only during delivery. However, in principle, it can be used at any
point in the processing of an email message. `RFC
6785 <http://tools.ietf.org/html/rfc6785>`_ defines the use of Sieve
filtering in IMAP, operating when messages are created or their
attributes are changed. This feature extends both Sieve and IMAP.
Therefore, Pigeonhole provides both an IMAP plugin and a Sieve plugin.

The ``sieve_imapsieve`` plugin implements the ``imapsieve`` extension
for the Sieve filtering language, adding functionality for using Sieve
scripts from within IMAP. The ``imap_sieve`` plugin for IMAP adds the
``IMAPSIEVE`` capability to the ``imap`` service. The basic
``IMAPSIEVE`` capability allows attaching a Sieve script to a mailbox
for any mailbox by setting a special IMAP METADATA entry. This way,
users can configure Sieve scripts that are run for IMAP events in their
mailboxes.

Beyond the standard, the Pigeonhole implementation also adds the ability
for administrators to configure Sieve scripts outside the user's
control, that are run either before or after a user's script if there is
one.

This plugin is available for Pigeonhole
v0.4.14 and higher (available for Dovecot v2.2.24). The plugins are
included in the Pigeonhole package and are therefore implicitly compiled
and installed with Pigeonhole itself.

Configuration
-------------

The IMAP plugin is activated by adding it to the
:dovecot_core:ref:`mail_plugins` setting for the imap protocol:

.. code-block:: none

  protocol imap {
    mail_plugins = $mail_plugins imap_sieve
  }

This will only enable support for administrator scripts. User scripts
are only supported when additionally a Sieve URL is configured using the
:pigeonhole:ref:`imapsieve_url` plugin setting. This URL points to the
:ref:`ManageSieve <pigeonhole_managesieve_server>`
server that users need to use to upload their Sieve scripts. This URL
will be shown to the client in the IMAP CAPABILITY response as
``IMAPSIEVE=<URL>``.

The Sieve plugin is activated by adding it to the
:pigeonhole:ref:`sieve_plugins` setting:

.. code-block:: none

  sieve_plugins = sieve_imapsieve

This plugin registers the ``imapsieve`` extension with the Sieve
interpreter. This extension is enabled implicitly, which means that it
does not need to be added to the :pigeonhole:ref:`sieve_extensions` setting.

Note that the ``imapsieve`` extension can only be used in a Sieve script
that is invoked from IMAP. When it is used in the active delivery
script, it will cause runtime errors. To make a Sieve script suitable
for both delivery and IMAP, the availability of the extension can be
tested using the ``ihave`` test (`RFC
5463 <http://tools.ietf.org/html/rfc5463>`_) as usual.

The following settings are recognized the "imap_sieve" plugin:

:pigeonhole:ref:`imapsieve_url` =
   If configured, this setting enables support for user Sieve scripts in
   IMAP. So, leave this unconfigured if you don't want users to have the
   ability to associate Sieve scripts with mailboxes. This has no effect
   on the administrator-controlled Sieve scripts explained below. The
   value is an URL pointing to the
   :ref:`ManageSieve <pigeonhole_managesieve_server>`
   server that users must use to upload their Sieve scripts; e.g.,
   ``sieve://sieve.example.com``.

:pigeonhole:ref:`imapsieve_mailboxxxx_name` =
   This setting configures the name of a mailbox for which administrator
   scripts are configured. The \`XXX' in this setting is a sequence
   number, which allows configuring multiple associations between Sieve
   scripts and mailboxes. The settings defined hereafter with matching
   sequence numbers apply to the mailbox named by this setting. The
   sequence of configured mailboxes ends at the first missing
   ``imapsieve_mailboxXXX_name`` setting. This setting supports
   wildcards with a syntax compatible with the IMAP LIST command,
   meaning that this setting can apply to multiple or even all ("*")
   mailboxes.

:pigeonhole:ref:`imapsieve_mailboxxxx_before` =

:pigeonhole:ref:`imapsieve_mailboxxxx_after` =
   When an IMAP event of interest occurs, these sieve scripts are
   executed before and after any user script respectively. These
   settings each specify the location of a single sieve script. The
   semantics of these settings are very similar to the
   :pigeonhole:ref:`sieve_before` and :pigeonhole:ref:`sieve_after` settings:
   the specified scripts form a sequence
   together with the user script in which the next script is only
   executed when an (implicit) keep action is executed.

:pigeonhole:ref:`imapsieve_mailboxxxx_causes` =
   Only execute the administrator Sieve scripts for the mailbox
   configured with ``imapsieve_mailboxXXX_name`` when one of the listed
   ``IMAPSIEVE``
   `causes <https://tools.ietf.org/html/rfc6785#section-4.3>`_ apply
   (currently either ``APPEND``, ``COPY``, or ``FLAG``. This has no
   effect on the user script, which is always executed no matter the
   cause.

:pigeonhole:ref:`imapsieve_mailboxxxx_from` =
   Only execute the administrator Sieve scripts for the mailbox
   configured with ``imapsieve_mailboxXXX_name`` when the message
   originates from the indicated mailbox. This setting supports
   wildcards with a syntax compatible with the IMAP LIST command

See :ref:`Replacing antispam plugin with
IMAPSieve <howto-antispam_with_imapsieve>`
as example on how to use this.
