.. _listescape_plugin:

=================
Listescape Plugin
=================

The listescape plugin allows users to use characters in mailboxes names that
would otherwise be illegal (due to the underlying mailbox storage).

For example:

* Maildir++ layout disallows using the ``.`` character, since it's used
  internally as the folder hierarchy separator.
* The ``~`` character at the beginning of the mailbox name is disallowed,
  because of the possibility that it gets expanded to user's home directory.
* The ``/`` character is disallowed on POSIX systems.

This plugin allows you to use all of these characters, as long as the virtual
separator (i.e. what is set by the ``separator`` setting and used as such by
the IMAP protocol) is changed to something else, which means that the plugin
does **not** make it possible to use the virtual separator in folder names.

The characters are escaped to the mailbox name as ``\NN`` hex codes.

So what is a good hierarchy separator to use?

* ``.`` and ``/`` are very commonly used and should work everywhere
* ``\`` is used by Exchange, and should also work everywhere (when specifying
  this in the ``separator=`` setting it must be quoted, so one sets
  ``separator = "\\"``)
* ``^`` is used internally by Thunderbird and causes some trouble with it

Settings
========

See :ref:`plugin-listescape`.

Sample Configuration
^^^^^^^^^^^^^^^^^^^^

Allow ``.`` characters with Maildir++ layout when virtual hierarchy separator
is changed to ``/`` (it could be anything else except ``.`` itself)::

  mail_plugins = $mail_plugins listescape

  namespace private {
    separator = /
    inbox = yes
  }

  plugin {
    listescape_char = "\\"
  }
