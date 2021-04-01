.. _replication:

======================
Replication with dsync
======================

.. note::

  This is not supported with Dovecot Pro.

It is possible to do master/master replication using dsync. It's recommended
that the same user always gets redirected to the same replica, but no
changes get lost even if the same user modifies mails simultaneously on
both replicas, some mails just might have to be redownloaded. The
replication is done asynchronously, so high latency between the replicas
isn't a problem. The replication is done by looking at Dovecot index
files (not what exists in filesystem), so no mails get lost due to
filesystem corruption or an accidental ``rm -rf``, they will simply be
replicated back.

Replication works only between server pairs. If you have a large
cluster, you need multiple independently functioning Dovecot backend
pairs. This means that :ref:`director <dovecot_director>` isn't
supported with replication. The replication in general is a
bit resource intensive, so it's not recommended to be used in
multi-million user installations.

.. warning::

  Shared folder replication doesn't work correctly.
  Mainly it can generate a lot of duplicate emails. This is because
  there's currently a per-user lock that prevents multiple dsyncs from
  working simultaneously on the same user. But with shared folders
  multiple users can be syncing the same folder. So this would need
  additional locks (e.g. shared folders would likely need to lock the
  owner user, and public folders would likely need a per-folder lock or a
  aybe a global public folder lock). There are no plans to fix this.

Configuration
-------------

Since v2.3.1 you can disable replication for a user by providing
``noreplicate`` :ref:`user database field <authentication-user_database_extra_fields>`.
Another way to disable replication for some users is to return
:ref:`plugin-replication-setting_mail_replica` field from userdb for users you want to replicate.

Make sure that user listing is configured for your :ref:`userdb <authentication-user_database>`. This is
required by replication to find the list of users that are periodically
replicated:

::

   doveadm user '*'

Enable the replication plugin globally (most likely you'll need to do
this in 10-mail.conf):

::

   mail_plugins = $mail_plugins notify replication

Replicator process should be started at startup, so it can start
replicating users immediately:

::

   service replicator {
     process_min_avail = 1
   }

You need to configure how and where to replicate. Using SSH for example:

::

   dsync_remote_cmd = ssh -l%{login} %{host} doveadm dsync-server -u%u
   plugin {
     mail_replica = remote:vmail@anotherhost.example.com
   }

The mail processes need to have access to the replication-notify fifo
and socket. If you have a single vmail UID, you can do:

::

   service aggregator {
     fifo_listener replication-notify-fifo {
       user = vmail
     }
     unix_listener replication-notify {
       user = vmail
     }
   }

The replication-notify only notifies the replicator processes that there
is work to be done, so it's not terribly insecure either to just set
``mode=0666``.

Enable doveadm replicator commands by setting:

::

   service replicator {
     unix_listener replicator-doveadm {
       mode = 0600
       user = vmail
     }
   }

You can configure how many dsyncs can be run in parallel (10 by
default):

::

   replication_max_conns = 10

Normally all replication is asynchronous. You can also optionally
configure new mail saving to be synchronous, with a timeout to avoid
waiting too long. This can be configured with:

::

   plugin {
     # When saving a new mail via IMAP or delivering a mail via LDA/LMTP,
     # wait for the mail to be synced to the remote site. If it doesn't finish
     # in 2 seconds, return success anyway.
     replication_sync_timeout = 2
   }

dsync over TCP connections
--------------------------

Create a listener for doveadm-server:

::

   service doveadm {
     inet_listener {
       port = 12345
     }
   }

And tell doveadm client to use this port by default:

::

   doveadm_port = 12345

Both the client and the server also need to have a shared secret:

::

   doveadm_password = secret

Now you can use ``tcp:hostname`` as the dsync target. You can also
override the port with ``tcp:hostname:port``.

::

   plugin {
     mail_replica = tcp:anotherhost.example.com # use doveadm_port
     #mail_replica = tcp:anotherhost.example.com:12345 # use port 12345 explicitly
   }

SSL
~~~

You can also use SSL for the connection:

::

   service doveadm {
     inet_listener {
       port = 12345
       ssl = yes
     }
   }

The doveadm listener will use the SSL certificate that is configured
globally for all SSL listeners, i.e. via the following settings at the
top level of the configuration file:

::

   ssl_cert = </etc/ssl/dovecot.pem
   ssl_key = </etc/ssl/dovecot.pem

:ref:`setting-ssl_cert` is not a valid setting inside ``service`` or
``inet_listener`` blocks, so you can't use a separate SSL certificate
for the doveadm listener. You can, however, use separate SSL
certificates for the *other* protocols, like so:

::

   protocol imap {
     ssl_cert = </etc/ssl/certs/imap.pem
     ssl_key = </etc/ssl/private/imap.pem
   }
   protocol pop3 {
     ssl_cert = </etc/ssl/certs/pop3.pem
     ssl_key = </etc/ssl/private/pop3.pem
   }

When one Dovecot instance connects to the other one in the replication
pair, it has to verify that the partner's SSL certificate is valid, so
you need to specify a directory or file containing valid SSL CA roots:

::

   ssl_client_ca_dir = /etc/ssl/certs # Debian/Ubuntu
   ssl_client_ca_file = /etc/pki/tls/cert.pem # RedHat

Now you can use ``tcps:hostname`` or ``tcps:hostname:port`` as the dsync
target.

Note that the SSL certificate must be signed by one of the CAs in the
:ref:`setting-ssl_client_ca_dir` or :ref:`setting-ssl_client_ca_file`.
You can't use a self-signed certificate or a private CA, unless you correctly
set them up into the CA file/directory (see openssl documentation for details).

You could point :ref:`setting-ssl_client_ca_file` to your private CA, but keep in
mind that :ref:`setting-ssl_client_ca_file` and :ref:`setting-ssl_client_ca_dir`
also affect other services where Dovecot acts as an SSL client (e.g. the imapc
feature), so be careful not to break SSL for those services.

dsync wrapper script for root SSH login
---------------------------------------

If you're using multiple UIDs, dsync needs to be started as root, which
means you need to log in as root with ssh (or use sudo). Another
possibility is to allow root to run only a wrapper script.

dovecot.conf:

::

   dsync_remote_cmd = /usr/bin/ssh -i /root/.ssh/id_dsa.dsync %{host} /usr/local/bin/dsync-in-wrapper.sh
   plugin {
     mail_replica = remoteprefix:vmail@anotherhost.example.com
   }

/root/.ssh/authorized_keys:

::

   command="/usr/local/bin/dsync-in-wrapper.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty <ssh key>

/usr/local/bin/dsync-in-wrapper.sh:

::

   read username
   ulimit -c unlimited # for debugging any crashes
   /usr/local/bin/doveadm dsync-server -u $username

dsync parameters
----------------

.. versionadded:: v2.2.9

You can configure what parameters replicator uses for the
``doveadm sync`` command:

::

   replication_dsync_parameters = -d -N -l 30 -U

The ``-f`` and ``-s`` parameters are added automatically when needed.

Usually the only change you may want to do is replace ``-N`` (= sync all
namespaces) with ``-n <namespace>`` or maybe just add ``-x <exclude>``
parameter(s).

Administration
--------------

``doveadm replicator status`` provides a summary. For example:

::

   Queued 'sync' requests        0
   Queued 'high' requests        0
   Queued 'low' requests         0
   Queued 'failed' requests      0
   Queued 'full resync' requests 90
   Waiting 'failed' requests     10
   Total number of known users   100

The first 3 fields describe users who have a replication pending with a
specific priority. The same user can only be in one (or none) of these
queues:

-  Queued 'sync' requests: This priority is used only for mail saves if
   :ref:`plugin-replication-setting_replication_sync_timeout` setting is used.

-  Queued 'high' requests: This priority is used only for mail saves if
   :ref:`plugin-replication-setting_replication_sync_timeout` setting is not
   used, or if the sync request timed out.

-  Queued 'low' requests: This priority is used for everything else
   except mail saves.

The following fields are:

-  Queued 'failed' requests: Number of users who have a replication
   pending and where the last sync attempt failed. These users are
   retried as soon as higher priority users' replication has finished.

-  Queued 'full resync' requests: Number of users who don't specifically
   have any replication pending, but who are currently waiting for a
   periodic "full sync". This is controlled by the
   :ref:`setting-replication_full_sync_interval` setting.

-  Waiting 'failed' requests: Number of users whose last replication
   attempt failed, and we're now waiting for the retry interval (5 mins)
   to pass before another attempt.

-  Total number of known users: Number of users that replicator knows
   about. The users can be listed with:
   ``doveadm replicator status '*'``

The per-user replication status can be shown with
``doveadm replicator status <username pattern>``. The username pattern
can contain '*' and '?' wildcards. The response contains for example:

::

   username           priority fast sync  full sync  success sync failed
   test100            none     02:03:52   02:08:52   02:03:52     -
   test1              none     00:00:01   00:43:33   03:20:46     y
   test2              none     02:03:51   02:03:51   02:03:51     -

These fields mean:

-  priority: none, low, high, sync

-  fast sync: How long time ago the last "fast sync" (non-full sync)
   attempt was performed. Ideally this is close to the time when the
   user was last modified. This doesn't mean that the sync succeeded
   necessarily.

-  full sync: How long time ago the last "full sync" attempt was
   performed. This should happen once per
   :ref:`setting-replication_full_sync_interval`.
   This doesn't mean that the sync succeeded necessarily.

-  success sync: Time when the last successful sync was performed. If
   the last sync succeeded, this is the same as the "fast sync" or the
   "full sync" timestap.

-  failed: "y" if the last sync failed, "-" if not.

The current dsync replication status can be looked up with
``doveadm replicator dsync-status``. This shows the dsync replicator
status for each potential dsync connection, as configured by
:ref:`setting-replication_max_conns`. An example output is:

::

   username                   type   status
   test100                    full   Waiting for dsync to finish
   test1                      normal Waiting for handshake
                              -      Not connected
                              -      Not connected

Here there are 4 lines, meaning ``replication_max_conns=4``. Only two of
the dsync-connections are being used currently.

The fields mean:

-  username: User currently being replicated.

-  type: incremental, normal or full. Most of the replications are
   "incremental", while full syncs are "full". A "normal" sync is done
   when incremental syncing state isn't available currently. The
   "incremental" matches doveadm sync's -s parameter, "full" is -f
   parameter and "normal" is the default.

-  status: Human-readable status of the connection. These are the
   current values:

   -  Not connected

   -  Failed to connect to '%s' - last attempt %ld secs ago

   -  Idle

   -  Waiting for handshake

   -  Waiting for dsync to finish

Failed replication attempts are always automatically retried, so any
temporary problems should get fixed automatically. In case of bugs it
may be necessary to fix something manually. These should be visible in
the error logs. So if a user is marked as failed, try to find any errors
logged for the user and see if the same error keeps repeating in the
logs. If you want to debug the dsync, you can manually trigger it with:
``doveadm -D sync -u user@domain -d -N -l 30 -U`` (the parameters after
"sync" should be the same as in :ref:`setting-replication_dsync_parameters`
setting).

Notes
-----

Random things to remember:

-  The replicas can't share the same quota database, since both will
   always update it

-  With mdbox format ``doveadm purge`` won't be replicated

-  ``doveadm force-resync``, ``doveadm quota recalc`` and other similar
   fixing commands don't get replicated

-  The servers must have different hostnames or the locking doesn't work
   and can cause replication problems.
