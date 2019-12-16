.. _authentication-dict:

=================================
Key-value authentication database
=================================

Key-value databases can be used as auth backends. They probably should be used
only for caching in front of e.g. SQL auth backends. Iteration is supported if
the underlying dict provider supports iteration. See `Dictionary
<https://wiki.dovecot.org/Dictionary>`_ for list of supported databases.

Auth configuration
==================

``dovecot.conf``:

.. code-block:: none

  passdb {
    driver = dict
    args = /etc/dovecot/dovecot-dict-auth.conf
  }
  userdb {
    driver = dict
    args = /etc/dovecot/dovecot-dict-auth.conf
  }

Dict configuration
==================

.. code-block:: none

  uri = redis:host=127.0.0.1:port=6379

  # Dictionary URI
  #uri =

  # Default password scheme
  default_pass_scheme = MD5

  # Username iteration prefix. Keys under this are assumed to contain usernames.
  iterate_prefix = userdb/

  # Should iteration be disabled for this userdb? If this userdb acts only as a
  # cache there's no reason to try to iterate the (partial & duplicate) users.
  #iterate_disable = no

  # The example here shows how to do multiple dict lookups and merge the replies.
  # The "passdb" and "userdb" keys are JSON objects containing key/value pairs,
  # for example: { "uid": 1000, "gid": 1000, "home": "/home/user" }

  key passdb {
    key = passdb/%u
    format = json
  }
  key userdb {
    key = userdb/%u
    format = json
  }
  key quota {
    key = userdb/%u/quota # or e.g. quota/%{userdb:quota_class}
    #format = value
    # The default_value is used if the key isn't found. If default_value
    # setting isn't specified at all (even as empty), the passdb/userdb
    # lookup fails with "user doesn't exist".
    default_value = 100M
  }

  # Space separated list of keys whose values contain key/value paired objects.
  # All the key/value pairs inside the object are added as passdb fields.
  # This can only be used for JSON formatted values.
  passdb_objects = passdb

  #passdb_fields {
  #}

  # Userdb key/value object list.
  userdb_objects = userdb

  userdb_fields {
    # dict:<key> refers to key names
    quota_rule = *:storage=%{dict:quota}

    # dict:<key>.<objkey> refers to the objkey inside (JSON) object
    mail = maildir:%{dict:userdb.home}/Maildir
  }

Example values
==============

The value formats are either ``value`` that contains a direct value, or
``json``. For example userdb lookup should return something like:

.. code-block:: none

  { "uid": 123, "gid": 123, "home": "/home/username" }

dict proxying
=============

It may be useful to do the lookups via the ``dict`` or ``dict-async`` service.
For example:

``dovecot.conf``:

.. code-block:: none

  dict {
    cassandra-userdb = cassandra:/etc/dovecot/dovecot-dict-userdb-cql.conf.ext
  }

``dovecot-dict-auth.conf.ext``:

.. code-block:: none

  uri = proxy:dict-async:cassandra-userdb
  iterate_disable = yes
  # The _key and _path suffixes are not necessary, they're just here to help
  # understand how to match them between different parts of the configuration.
  key email_key {
    key = userdb/email_path/%u
  }
  key displayname_key {
    key = userdb/displayname_path/%u
  }
  userdb_fields {
    # these fields will be visible as %{userdb:u_email} and %{userdb:u_displayname}
    u_email = %{dict:email_key}
    u_displayname = %{dict:displayname_key}
  }

``dovecot-dict-userdb-cql.conf.ext``:

.. code-block:: none

  driver = cassandra
  connect = host=127.0.0.1 dbname=email_users

  # SELECT displayname FROM user_profile WHERE id = %u
  map {
    # pattern must match the "key" path, except with added shared/ prefix. %u
    # gets caught into $username
    pattern = shared/userdb/displayname_path/$username
    table = user_profile
    value_field = displayname
    value_type = string
    fields {
      id = $username
    }
  }

  # SELECT email FROM user_profile WHERE id = %u
  map {
    pattern = shared/userdb/email_path/$username
    table = user_profile
    value_field = email
    value_type = string
    fields {
      id = $username
    }
  }

Complete example for authenticating via the CDB dictionary
==========================================================

This example uses the CDB dictionary to store the userdb and passdb.

Auth configuration
^^^^^^^^^^^^^^^^^^

``dovecot.conf``:

.. code-block:: none

  # Access to the CDB has to go through a dict process.
  dict {
    auth = cdb:/etc/dovecot/auth.cdb
  }

  passdb {
    driver = dict
    args = /etc/dovecot/dovecot-cdb.conf
  }

  userdb {
    driver = dict
    args = /etc/dovecot/dovecot-cdb.conf
  }

Dict configuration
^^^^^^^^^^^^^^^^^^

The CDB dictionary doesn't support iteration yet.

``dovecot-cdb.conf``:

.. code-block:: none

  uri = proxy::auth

  key passdb {
     key = passdb/%u
     format = json
  }
  key userdb {
     key = userdb/%u
     format = json
  }
  # iterate_prefix = userdb/ # no yet supported
  iterate_disable = yes

  default_pass_scheme = BLF-CRYPT

Complete example for authenticating via a UNIX socket
=====================================================

The Dict auth backend can be used to query a local UNIX socket for users. This
can be handy for accessing user databases which would otherwise only be
accessible via the `CheckPassword
<https://wiki.dovecot.org/AuthDatabase/CheckPassword>`_ backend and a scripting
language.

When given a `proxy <https://wiki.dovecot.org/Quota/Dict>`_: URL the Dict
backend speaks a simple protocol over a UNIX socket. The protocol is defined in
``src/lib-dict/dict-client.h`` (`GitHub
<https://github.com/dovecot/core/blob/master/src/lib-dict/dict-client.h>`_).

Auth configuration
^^^^^^^^^^^^^^^^^^

``dovecot.conf``:

.. code-block:: none

  passdb {
    driver = dict
    args = /etc/dovecot/dovecot-dict-auth.conf
  }
  userdb {
    # optional
    driver = prefetch
  }
  userdb {
    driver = dict
    args = /etc/dovecot/dovecot-dict-auth.conf
  }

Dict configuration
^^^^^^^^^^^^^^^^^^

The ``last dictionary name`` (``somewhere``) argument is redundant here.

``/etc/dovecot/dovecot-dict-auth.conf.ext``:

.. code-block:: none

  uri = proxy:/var/run/auth_proxy_dovecot/socket:somewhere

  # FIXME: obsolete configuration - should use the key { .. } instead
  password_key = passdb/%u
  user_key = userdb/%u
  iterate_disable = yes
  #default_pass_scheme = plain

Server process for answering Dict lookups
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The server process listening on ``/var/run/auth_proxy_dovecot/socket`` can be
written in any language. Here's an example in Perl:

.. code-block:: none

  package AuthProxyDovecot;
  use base qw( Net::Server::PreFork );

  use strict;
  use warnings;

  use JSON::XS;

  AuthProxyDovecot->run() or die "Could not initialize";

  sub default_values
  {
    return {
      port              => '/var/run/auth_proxy_dovecot/socket|unix',

      log_level         => 2,
      log_file          => 'Sys::Syslog',
      syslog_logsock    => 'unix',
      syslog_ident      => 'auth_proxy_dovecot',
      syslog_facility   => 'daemon',

      background        => 1,
      setsid            => 1,
      pid_file          => '/var/run/auth_proxy_dovecot.pid',

      user              => 'root',
      group             => 'root',

      max_spare_servers => 2,
      min_spare_servers => 1,
      min_servers       => 2,
      max_servers       => 10,
    };
  } ## end sub default_values

  ##################################################

  sub process_request {
    my $self   = shift;

    my %L_handler = (
        passdb => sub {
            my ($arg) = @_;
            my $ret = {
                password        => '$1$JrTuEHAY$gZA1y4ElkLHtnsrWNHT/e.',
                userdb_home     => "/home/username/",
                userdb_uid      => 1000,
                userdb_gid      => 1000,
            };
            return $ret;
        },
        userdb => sub {
            my ($arg) = @_;
            my $ret = {
                home    => "/home/username/",
                uid     => 1000,
                gid     => 1000,
            };
            return $ret;
        },
    );


   # protocol from src/lib-dict/dict-client.h
   my $json = JSON::XS->new;

   eval {
       my $ret;
       # Dict protocol is multiline... go through the lines.
       while (<STDIN>) {
           $self->log(2, "Got request: $_");
           chomp;
           my $cmd = substr($_,0,1);
           next if $cmd eq 'H'; # "hello", skip this line, assume it's ok
           die "Protocol error: Bad command $cmd" unless ($cmd eq 'L');
           # Process request

               my ($namespace,$type,$arg) = split ('/',substr($_,1),3);

               if ($namespace eq 'shared') {
                   my $f = $L_handler{$type};

                   if (defined $f && defined $arg) {
                       $ret = $f->($arg);
                   }
               } else {
                   die 'Protocol error: Bad arg';
               }
           else {
               die 'Protocol error: Bad namespace'
           }
           last; # Got an "L" , now respond.
       }
       if ($ret) {
           my $json = JSON::XS->new->indent(0)->utf8->encode($ret);
           $self->log(3,"O:$json");
           print "O".$json."\n";
       }
       else {
           $self->log(3,"NOUSER");
           print "N\n";
       }
       1;
    } or do {
       $self->log(2, "Error: $@");
       print "F\n";
    };
  }

  sub pre_loop_hook {
    my $self = shift;

    $self->log(1, 'Starting server');
  }

  sub pre_server_close_hook {
    my $self = shift;

    $self->log(1, 'Server is shut down');
  }

  1;

  __END__
