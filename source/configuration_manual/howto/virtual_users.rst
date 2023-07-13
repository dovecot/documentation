.. _howto_virtual_users:

==============================
How to implement virtual users
==============================

:ref:`Virtual users <virtual_users>` with :ref:`passwd-files <authentication-passwd_file>`
------------------------------------------------------------------------------------------

-  :doc:`A simple virtual passwd file installation <simple_virtual_install>`

-  :doc:`Virtual passwd file and Exim <virtual_hosting_with_exim>`

-  :doc:`Virtual passwd file and Postfix <virtual_user_flat_files_postfix>`

:ref:`Virtual users <virtual_users>` with :ref:`LDAP <authentication-ldap>`
---------------------------------------------------------------------------

-  :doc:`OpenLDAP <dovecot_open_ldap>` (:doc:`Cheat sheet <dovecot_ldap_cheat_sheet>`)

-  `Postfix and Active Directory <https://www.howtoforge.com/postfix-dovecot-authentication-against-active-directory-on-centos-5.x>`__

:ref:`System users <system_users>` and/or :ref:`Virtual users <virtual_users>` with :ref:`LDAP <authentication-ldap>`
---------------------------------------------------------------------------------------------------------------------

-  `Dovecot, ManageSieve, Exim, OpenLDAP and
   getmail <http://www.effinger.org/blog/2009/03/22/dovecot-exim-openldap-und-getmail-unter-ubuntu-1-openldap/>`__
   (Instructions in German) - LDAP users can be both :ref:`system_users` and :ref:`virtual_users`
   depending on how you use :ref:`LDAP <authentication-ldap>` with
   the possibility to add subaccounts for each user. For example if you
   have a LDAP user named peter, you can add a separate subordinate
   mailbox to retrieve mail from an external mail account like
   peter[at]gmail.com

:ref:`Virtual users <virtual_users>` with :ref:`SQL <authentication-sql>`
-------------------------------------------------------------------------

-  MySQL

   -  :doc:`Dovecot, Postfix with Dovecot LDA transport and Dovecot SASL
      Auth, Postfix Admin, MySQL and
      SquirrelMail <dovecot_lda_postfix_admin_mysql>`

   -  `ISP-style Email Server with Debian-Etch and Postfix (MySQL,
      Dovecot, Postfix etc.) <http://workaround.org/ispmail>`__

-  PostgreSQL

   -  :doc:`PostgreSQL and Postfix <dovecot_postgresql>`

   -  `PostgreSQL, Postfix (Dovecot LMTP and Dovecot SASL), Dovecot and
      vmm (command line tool) <http://vmm.localdomain.org/>`__

-  SQLite

   -  `Postfix+Dovecot with SQLite3
      backend <http://rob0.nodns4.us/howto/>`__ (also implements system
      users)
