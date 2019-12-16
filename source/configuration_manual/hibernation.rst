.. _hibernation:

===========
Hibernation
===========

.. Note::

  This is not supported on kqueue based systems currently, such as FreeBSD.

Dovecot supports moving connections that have issued IDLE to a special holding
process, called imap-hibernate. This process is responsible for holding the
idle processes until they need to be thawed.

Configuration
=============

``imap_hibernate_timeout`` specifies the delay before moving users to
``imap-hibernate`` process. This requires inter-process communication between
``imap`` and ``imap-hibernate`` process.

.. code-block:: none

  imap_hibernate_timeout = 5s

  service imap {
    # Note that this change will allow any process running as
    # $default_internal_user (dovecot) to access mails as any other user.
    # This may be insecure in some installations, which is why this isn't
    # done by default.
    unix_listener imap-master {
      user = $default_internal_user
    }
  }

  # The following is the default already in v2.3.1+:
  service imap {
    extra_groups = $default_internal_group
  }
  service imap-hibernate {
    unix_listener imap-hibernate {
      mode = 0660
      group = $default_internal_group
    }
  }

How it works
============

When client issues IDLE, the connection socket is moved to the hibernation
process. This process is responsible for keeping all connections that are
idling, until they issue some command that requires them to be thawed into a
imap process. This way, memory and CPU resources are saved, since there is only
one hibernation process.
