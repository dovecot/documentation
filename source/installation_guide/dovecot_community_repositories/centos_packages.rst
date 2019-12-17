.. _centos_packages:

===============
CentOS packages
===============

CentOS 6 & 7
^^^^^^^^^^^^
Create ``/etc/yum.repos.d/dovecot.repo``

.. code-block:: none

   [dovecot-2.3-latest]
   name=Dovecot 2.3 CentOS $releasever - $basearch
   baseurl=http://repo.dovecot.org/ce-2.3-latest/centos/$releasever/RPMS/$basearch
   gpgkey=https://repo.dovecot.org/DOVECOT-REPO-GPG
   gpgcheck=1
   enabled=1

If you are upgrading an existing installation

.. code-block:: none

   yum makecache
   yum update

If you are installing new installation, you can use following package names

* dovecot
* dovecot-debuginfo
* dovecot-devel
* dovecot-imaptest
* dovecot-imaptest-debuginfo
* dovecot-lua
* dovecot-mysql
* dovecot-pgsql
* dovecot-pigeonhole
* dovecot-pigeonhole-debuginfo
* dovecot-pigeonhole-devel
