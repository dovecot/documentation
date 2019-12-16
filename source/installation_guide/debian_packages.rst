.. _debian_packages:

===============
Debian packages 
===============

Jessie (8.0)
^^^^^^^^^^^^

Create ``/etc/apt/trusted.gpg.d/dovecot.gpg``

.. code-block:: none

   curl https://repo.dovecot.org/DOVECOT-REPO-GPG | gpg --import
   gpg --export ED409DA1 > /etc/apt/trusted.gpg.d/dovecot.gpg


Create ``/etc/apt/sources.list.d/dovecot.list``. If you want to use https, make sure you have installed ``apt-transport-https``.

.. code-block:: none

   deb https://repo.dovecot.org/ce-2.3-latest/debian/jessie jessie main

Stretch (9.0)
^^^^^^^^^^^^^

Create ``/etc/apt/trusted.gpg.d/dovecot.gpg``

.. code-block:: none

   curl https://repo.dovecot.org/DOVECOT-REPO-GPG | gpg --import
   gpg --export ED409DA1 > /etc/apt/trusted.gpg.d/dovecot.gpg


Create ``/etc/apt/sources.list.d/dovecot.list``. If you want to use https, make sure you have installed ``apt-transport-https``.

deb https://repo.dovecot.org/ce-2.3-latest/debian/stretch stretch main

Instructions
^^^^^^^^^^^^
If you are upgrading from existing installation, run

.. code-block:: none

   apt update
   apt upgrade


If you are installing new installation, you can use following package names

* dovecot-core
* dovecot-dbg
* dovecot-dev
* dovecot-gssapi
* dovecot-imapd
* dovecot-imaptest
* dovecot-ldap
* dovecot-lmtpd
* dovecot-lua
* dovecot-lucene
* dovecot-managesieved
* dovecot-mysql
* dovecot-pgsql
* dovecot-pigeonhole-dbg
* dovecot-pop3d
* dovecot-sieve-dev
* dovecot-sieve
* dovecot-solr
* dovecot-sqlite
* dovecot-submissiond