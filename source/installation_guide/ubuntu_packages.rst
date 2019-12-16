.. _ubuntu_packages:

===============
Ubuntu packages 
===============

Trusty (14.04 LTS)
^^^^^^^^^^^^^^^^^^

Create ``/etc/apt/trusted.gpg.d/dovecot.gpg```

.. code-block:: none

   curl https://repo.dovecot.org/DOVECOT-REPO-GPG | gpg --import
   gpg --export ED409DA1 > /etc/apt/trusted.gpg.d/dovecot.gpg

Create ``/etc/apt/sources.list.d/dovecot.list``. If you want to use

https, make sure you have installed ``apt-transport-https``.

.. code-block:: none

   deb https://repo.dovecot.org/ce-2.3-latest/ubuntu/trusty trusty main


Xenial (16.04 LTS)
^^^^^^^^^^^^^^^^^^

Create ``/etc/apt/trusted.gpg.d/dovecot.gpg``

.. code-block:: none

   curl https://repo.dovecot.org/DOVECOT-REPO-GPG | gpg --import
   gpg --export ED409DA1 > /etc/apt/trusted.gpg.d/dovecot.gpg

Create ``/etc/apt/sources.list.d/dovecot.list``. If you want to use

https, make sure you have installed ``apt-transport-https``.

.. code-block:: none

   deb https://repo.dovecot.org/ce-2.3-latest/ubuntu/xenial xenial main

Bionic (18.04 LTS)
^^^^^^^^^^^^^^^^^^

Create ``/etc/apt/trusted.gpg.d/dovecot.gpg``

.. code-block:: none

   curl https://repo.dovecot.org/DOVECOT-REPO-GPG | gpg --import
   gpg --export ED409DA1 > /etc/apt/trusted.gpg.d/dovecot.gpg

Create ``/etc/apt/sources.list.d/dovecot.list``. If you want to use

https, make sure you have installed ``apt-transport-https``.

.. code-block:: none

   deb https://repo.dovecot.org/ce-2.3-latest/ubuntu/bionic bionic main

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