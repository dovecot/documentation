.. _mailbox_sharing_in_cluster_simple_example:

===============================================================
Example config snippets for shared mailboxes in Dovecot Cluster
===============================================================

The following snippets show important configuration parts for configuring
cluster wide sharing of mailboxes. The following snippets are not complete
configuration. For more details please refer to
:ref:`mailbox_sharing_in_cluster`.


Dovecot Proxy configuration snippet
-----------------------------------

.. code-block::

        passdb {
          args = proxy=y password=masterpass host=<director-ip>
          driver = static
        }

Dovecot Backend configuration snippet
--------------------------------------

.. code-block::

        mail_plugins = $mail_plugins acl

        imapc_host = <director-ip>
        imapc_password = imapcpass
        imapc_user = # empty defaults to shared user
        imapc_features = fetch-bodystructure fetch-headers rfc822.size search modseq acl delay-login

        namespace shared {
          type = shared
          prefix = shared/%%u/
          separator = /
          list = children
          subscriptions = no
          location = imapc:~/shared/%%u:INDEXPVT=~/shared-pvt/%%u
        }

        namespace inbox {
          inbox = yes
          location =
        }

        passdb {
          # masterpass is the normal users master password
          args = password=masterpass userdb_imapc_master_user=%{user}
          driver = static
        }

        passdb {
          driver = static
          master = yes
          # imapcpass is the master password used for master logins (via imapc)
          args = password=imapcpass userdb_namespace/shared/disabled=yes userdb_acl_user=%{auth_user}
        }

        dict {
          # Any shared dictionary is suitable this is just an example using mysql
          acl-mysql = mysql:/etc/dovecot/dovecot-acl-dict-sql.conf.ext
        }

        plugin {
          acl = vfile
          acl_ignore_namespace = shared/*
          acl_shared_dict = proxy:dict:acl-mysql
        }

        protocol imap {
          mail_plugins = $mail_plugins imap_acl
        }

        # If quota is used make sure to disable counting for shared namespace
        #mail_plugins = $mail_plugins quota
        #plugin {
        #  quota = count:User storage:ns=
        #  quota_rule = *:storage=1G
        #}
