.. _pigeonhole_plugin_filter_sieve:

===================================
Pigeonhole IMAP FILTER=SIEVE Plugin
===================================

Normally, Sieve filters can either be applied at initial mail delivery
or triggered by certain events in the Internet Message Access Protocol
(``IMAPSIEVE``; :rfc:`6785`). The
user can configure which Sieve scripts to run at these instances, but it
is not possible to trigger the execution of Sieve scripts manually.
However, this could be very useful; e.g, to test new Sieve rules and to
re-filter messages that were erroneously handled by an earlier version
of the Sieve scripts involved.

Pigeonhole provides the ``imap_filter_sieve`` plugin, which provides a
vendor-defined IMAP extension called ``FILTER=SIEVE``. This adds a new
``FILTER`` command that allows applying a mail filter (a Sieve script)
on a set of messages that match the specified IMAP searching criteria.

The latest draft of the specification for this IMAP capability is
available
`here <https://github.com/dovecot/pigeonhole/blob/master/doc/rfc/draft-bosch-imap-filter-sieve-00.txt>`_.
This plugin is experimental and the specification is likely to change.
Use the specification included in your current release to obtain the
matching specification for your release.

This plugin is available for Pigeonhole v0.4.24 and higher (available for
Dovecot v2.2.36), and v0.5.2 and higher (available for Dovecot v2.3.2). The
plugins are included in the Pigeonhole package and are therefore implicitly
compiled and installed with Pigeonhole itself.

Settings
--------

See :ref:`imap-filter-sieve`.

Configuration
-------------

The IMAP FILTER Sieve plugin is activated by adding it to the
:dovecot_core:ref:`mail_plugins` setting for the imap protocol:

::

  protocol imap {
    mail_plugins = $mail_plugins imap_filter_sieve
  }

Note that enabling this plugin allows users to specify the Sieve script
content as a parameter to the ``FILTER`` command, not just run existing
stored scripts.

This plugin uses the normal configuration settings used by the
:ref:`LDA <lda>` Sieve plugin at delivery.

The :pigeonhole:ref:`sieve_before` and :pigeonhole:ref:`sieve_after` scripts
are currently ignored by this plugin.
