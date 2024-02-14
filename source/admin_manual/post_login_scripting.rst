.. _post_login_scripting:

====================
Post-login scripting
====================

If you want to do something special after authentication, but before beginning
the IMAP or POP3 session, you can do this by telling imap/pop3 executable to
use post-login service by editing ``conf.d/10-master.conf``:

.. code-block:: none

  service imap {
    # tell imap to do post-login lookup using a socket called "imap-postlogin"
    executable = imap imap-postlogin
  }

  # The service name below doesn't actually matter.
  service imap-postlogin {
    # all post-login scripts are executed via script-login binary
    executable = script-login /usr/local/bin/postlogin.sh

    # the script process runs as the user specified here (v2.0.14+):
    user = $default_internal_user
    # this UNIX socket listener must use the same name as given to imap executable
    unix_listener imap-postlogin {
    }
  }

You can run multiple post-login scripts by just giving multiple scripts as
parameters to ``script-login``, for example:

.. code-block:: none

  executable = script-login rawlog /usr/local/bin/postlogin.sh /usr/local/bin/postlogin2.sh

The scripts are run in the specified order. Remember that the post-login script
runs with the privileges of the ``user`` setting given to the service (root by
default). If you need the script to access user's mail files, change it to
whatever user owns the mails (e.g. vmail). If you're using multiple UNIX UIDs
(e.g. system users), use ``script-login -d`` to drop to the ``UID`` or ``GID``
specified by the userdb lookup (ignoring user/group/chroot service settings).

It's not currently possible to run post-login scripts in
:ref:`authentication-proxies`, because
they're not actually logging into the local Dovecot. An alternative method
could be implemented some day, maybe as a plugin.

Running environment
===================

Standard input and output file descriptors are redirected to the client's
network socket, so you can send data to client by simply writing to stdout.
Standard error fd is redirected to Dovecot's error log, you can write errors
there as well.

The script can use environment variables:

* USER: Username
* IP: Remote IP address
* LOCAL_IP: Local IP address
* Fields returned by userdb lookup with their keys uppercased (e.g. if userdb
  returned home, it's stored in HOME).

It's possible to add/modify userdb fields by adding them to environment and
adding the field to ``USERDB_KEYS``. For example to change user's mail
location:

.. code-block:: none

  #!/bin/sh

  export MAIL=maildir:/tmp/test
  export USERDB_KEYS="$USERDB_KEYS mail"
  exec "$@"

You can change any Dovecot settings using the above method.

Changing user's password after login
====================================

See :ref:`howto-convert_password_schemes`

Last-login tracking
===================

If you want to know when the user last logged in, you can do it like this:

.. code-block:: none

  #!/bin/sh
  # a) Filesystem based timestamp in user's home directory
  touch ~/.last_login
  # b) SQL based tracking. Beware of potential SQL injection holes if you allow
  # users to have ' characters in usernames. Following is just an example:
  #echo "UPDATE mailbox SET modified = now() WHERE username = '$USER'" | mysql postfixadmin
  exec "$@"

.. Note:: if creating a timestamp inside the Maildir itself, it's better to
          avoid filenames which begin with a dot. The IMAP `list` command will
          show such files as IMAP folders, unless you also set
          ``maildir_stat_dirs=yes`` which generates more I/O ops.

Custom mailbox location autodetection
=====================================

See :ref:`mail_location_settings` for an example.

Alerts
======

If you want to give the user's client some warning notification, you can do it
just by writing it to stdout. But note:

* Not all clients show the alerts, even though IMAP RFC requires it.
* IMAP protocol requires CRLF (\r\n) line feeds. Some clients will break if you
  only send LF.

.. code-block:: none

  #!/bin/sh
  if [ -f ~/.out-of-office ]; then
    printf "* OK [ALERT] You're still marked as being out of office.\r\n"
  fi
  exec "$@"

Use UNIX groups for ACL authorization
=====================================

.. code-block:: none

  #!/bin/sh
  ACL_GROUPS=`groups $USER | tr ' '  ','`
  export ACL_GROUPS
  export USERDB_KEYS="$USERDB_KEYS acl_groups"
  exec "$@"

Denying connection from some IP/User
====================================

You can use the IP and USER shell variables that are setup by dovecot in a bash
script in order to deny connection (after a successful login), like this:

.. code-block:: none

  if [ "$USER" = "myuser" ] ; then
    printf "* NO [ALERT] The user '$USER' cannot login\r\n"
    exit 0
  fi

  if [ ! "$IP" = "192.168.1.1" ] ; then
    printf "* NO [ALERT] Access not allowed from the Internet\r\n"
    exit 0
  fi
  exec "$@"

Dynamically adding shared mailboxes according to filesystem permissions
=======================================================================

Additional namespaces can be dynamically added via environment variables:

.. code-block:: none

  use strict;

  my $SHAREDDIR= '/var/spool/mail/Shared';

  if (! @ARGV) {
    exit 1;
  }

  # for testing...
  #if ($ENV{USER} eq 'lemur') {
  #  #  print "* OK [ALERT] Hello $ENV{'USER'}!\n";
  #  &set_namespaces();
  #  system("env >> /tmp/dovecot-env-$$");
  #}

  &set_namespaces();

  exec(@ARGV) or die "Unable to exec @ARGV: $!";

  sub set_namespaces {
    my $mailbox;
    local *D;
    if (opendir(D, $SHAREDDIR)) {
      my $dir;
      my @namespaces = ();
      while ($mailbox= readdir(D)) {
        next if ($mailbox =~ /^\./);
        if (-r "${SHAREDDIR}/${mailbox}") {
          my $nsname = 'S-'.uc($mailbox);
          push(@namespaces, lc($nsname));
          &log("adding NAMESPACE/${nsname}/PREFIX ${SHAREDDIR}/${mailbox}");
          $ENV{"NAMESPACE/${nsname}/LOCATION"} =
            "maildir:$SHAREDDIR/$mailbox:INDEX=~/Maildir/index/Shared/$mailbox";
          $ENV{"NAMESPACE/${nsname}/PREFIX"} = "Shared/$mailbox/";
          $ENV{"NAMESPACE/${nsname}/TYPE"}= "public";
          $ENV{"NAMESPACE/${nsname}/SEPARATOR"}= "/";
          $ENV{"NAMESPACE/${nsname}/LIST"}= "yes";
          # $ENV{"NAMESPACE/${nsname}/SUBSCRIPTIONS"} = "no"
        }
      }
      closedir D;
      if (@namespaces) {
        $ENV{"NAMESPACE"} = join(' ', @namespaces);
        my @userdb_keys;
        if ($ENV{'USERDB_KEYS'}) {
          push(@userdb_keys, $ENV{'USERDB_KEYS'});
        }
        push(@userdb_keys, grep(/^NAMESPACE/, keys(%ENV)));
        $ENV{'USERDB_KEYS'} = join(' ', @userdb_keys);
      }
    }
  }

  sub log {
    print STDERR "@_\n";
  }

This adds environment variables like that:

.. code-block:: none

  NAMESPACE/S-SPAMREP/LIST=yes
  NAMESPACE/S-SPAMREP/LOCATION=maildir:/var/spool/mail/Shared/spamrep:INDEX=~/Maildir/index/Shared/spamrep
  NAMESPACE/S-SPAMREP/PREFIX=Shared/spamrep/
  NAMESPACE/S-SPAMREP/SEPARATOR=/
  NAMESPACE/S-SPAMREP/TYPE=public
  NAMESPACE/S-TESTSHARED/LIST=yes
  NAMESPACE/S-TESTSHARED/LOCATION=maildir:/var/spool/mail/Shared/testshared:INDEX=~/Maildir/index/Shared/testshared
  NAMESPACE/S-TESTSHARED/PREFIX=Shared/testshared/
  NAMESPACE/S-TESTSHARED/SEPARATOR=/
  NAMESPACE/S-TESTSHARED/TYPE=public
  NAMESPACE=s-testshared s-spamrep
  USERDB_KEYS=SYSTEM_GROUPS_USER UID GID HOME  NAMESPACE/S-SPAMREP/LIST NAMESPACE NAMESPACE/S-TESTSHARED/SEPARATOR NAMESPACE/S-TESTSHARED/TYPE NAMESPACE/S-TESTSHARED/PREFIX NAMESPACE/S-TESTSHARED/LIST NAMESPACE/S-TESTSHARED/LOCATION NAMESPACE/S-SPAMREP/SEPARATOR NAMESPACE/S-SPAMREP/TYPE NAMESPACE/S-SPAMREP/PREFIX NAMESPACE/S-SPAMREP/LOCATION
