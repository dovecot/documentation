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

        passdb db1 {
          driver = static
          master = yes
          default_fields = proxy=y
          args = password=imapcpass
        }

        passdb db2 {
          driver = static
          args = proxy=y password=masterpass
        }

Dovecot Backend configuration snippet
--------------------------------------

.. code-block::

        mail_plugins {
	  acl = yes
	}

        imapc_host = <proxy-load-balancer>
        imapc_password = imapcpass
        imapc_user = # empty defaults to shared user
        # With v2.4.0;v3.0.0 the following features are enabled by default,
        # prior to this version the following must be uncommented:
        #imapc_features = fetch-bodystructure fetch-headers rfc822.size search modseq acl delay-login

        namespace shared {
          type = shared
          prefix = shared/%%u/
          separator = /
          list = children
          subscriptions = no
          mail_driver = imapc
	  mail_path = ~/shared/%{owner_user}
	  mail_index_private_path = ~/shared-pvt/%{owner_user}
        }

        namespace inbox {
          inbox = yes
        }

        passdb db1 {
          # masterpass is the normal users master password
          args = password=masterpass userdb_imapc_master_user=%{user}
          driver = static
        }

        passdb db2 {
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
          mail_plugins {
	    imap_acl = yes
	  }
        }

        # If quota is used make sure to disable counting for shared namespace
        #mail_plugins {
	#  quota = yes
	#}
        #plugin {
        #  quota = count:User storage:ns=
        #  quota_rule = *:storage=1G
        #}
