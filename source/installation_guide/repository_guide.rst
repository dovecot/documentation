.. _repository_guide:

.. image:: ../_static/dovecot.png


=============================================
OX Dovecot Pro Repository Installation Manual
=============================================

Copyright (C) 2019 OX Software GmbH

The repository access is available only by using a customer-specific username and password. We preserve the right to suspend a user account if the maximum number of servers accessing the repository (50) is
exceeded. 

A warning email is sent to the account owner before this happens. If you need more than the allowed number of connections, don't hesitate to contact Open-Xchange Support (at support@openxchange.com).

In case you have any problems in a production environment, please contact Open-Xchange Support. For non-production issues please refer to your dedicated Open-Xchange account manager or professional services contact.

Repository configuration for RedHat and CentOS
==============================================

There are two versions of OX Dovecot Pro available: v2.2 and v2.3.

OX Dovecot Pro v2.2 repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``/etc/yum.repos.d/dovecot.repo``:

.. code-block:: none

   [dovecot]
   name=RHEL $releasever - $basearch – OX Dovecot Pro
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/stable-
   2.2/rhel/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1
   [dovecot-3rdparty]
   name=RHEL $releasever - $basearch – OX Dovecot Pro 3rd party Packages
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/3rdparty/rhel/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1

The stable-2.2 alias points to the latest stable v2.2 OX Dovecot Pro version. Only the latest patch releases are stored in this repository. 

If you want to install older releases you need to explicitly refer to the minor version number. 

For example: if v2.2.20.2 is the latest version, you can still install v2.2.20.1 from the stable- 2.2 repository, but to be able to install v2.2.19.2 (or v2.2.19.1) you need to change stable-2.2 to 2.2.19:

.. code-block:: none

   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/2.2.19/rhel/$releasever/RPMS/$basearch


OX Dovecot Pro v2.3 repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``/etc/yum.repos.d/dovecot.repo``:

.. code-block:: none

   [dovecot]
   name=RHEL $releasever - $basearch - OX Dovecot Pro
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/stable-
   2.3/rhel/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1
   [dovecot-3rdparty]
   name=RHEL $releasever - $basearch – OX Dovecot Pro 3rd party Packages
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/3rdparty/rhel/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1
   enabled=1

The stable-2.3 alias points to the latest stable v2.3 OX Dovecot Pro version. Only the latest patch releases are stored in this repository. 

If you want to install older releases you need to explicitly refer to the minor version number. 

For example: if v2.3.3.2 is the latest version, you can still install v2.3.3.1 from the stable- 2.3 repository, but to be able to install v2.3.2 you need to change stable-2.3 to 2.3.2:

.. code-block:: none

   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/2.3.2/rhel/$releasever/RPMS/$basearch

Installation
^^^^^^^^^^^^

You can see all available OX Dovecot Pro packages with:

.. code-block:: none

   yum search dovecot-ee

Commonly you want to install at least:

.. code-block:: none

   yum install dovecot-ee dovecot-ee-pigeonhole dovecot-ee-managesieve

* CentOS 6 only: See also ``/etc/sysconfig/dovecot`` for additional startup settings.

Repository configuration for Debian and Ubuntu
==============================================

There are two versions of OX Dovecot Pro available: v2.2 and v2.3.

Install the apt repository gpg key:

.. code-block:: none

   wget -O - https://apt.dovecot.fi/dovecot-gpg.key | sudo apt-key add -

OX Dovecot Pro v2.2 repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Add your distribution-specific line to /etc/apt/sources.list.d/dovecot.list:

* Debian 8.0 Jessie:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.2/debian/jessie jessie main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/debian/jessie jessie main

* Debian 9.0 Stretch:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.2/debian/stretch stretch main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/debian/stretch stretch main

* Ubuntu 14.04 Trusty:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.2/ubuntu/trusty trusty main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/ubuntu/trusty trusty main

* Ubuntu 16.04 Xenial:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.2/ubuntu/xenial xenial main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/ubuntu/xenial xenial main

The stable-2.2 alias points to the latest stable v2.2 OX Dovecot Pro version. Only the latest patch releases are stored in this repository. 

If you want to install older releases you need to explicitly refer to the minor version number. 

For example: if 2.2.20.2 is the latest version, you can still install v2.2.20.1 from the stable- 2.2 repository, but to be able to install v2.2.19.2 (or v2.2.19.1) on e.g. Ubuntu Trusty you need to change stable-2.2 to 2.2.19:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/2.2.19/ubuntu/trusty trusty main

OX Dovecot Pro v2.3 repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Add your distribution-specific line to ``/etc/apt/sources.list.d/dovecot.list``:

* Debian 8.0 Jessie:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.3/debian/jessie jessie main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/debian/jessie jessie main

* Debian 9.0 Stretch:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.3/debian/stretch stretch main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/debian/stretch stretch main

* Ubuntu 14.04 Trusty:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.3/ubuntu/trusty trusty main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/ubuntu/trusty trusty main

* Ubuntu 16.04 Xenial:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/stable-2.3/ubuntu/xenial xenial main
   deb https://USERNAME:PASSWORD@apt.dovecot.fi/3rdparty/ubuntu/xenial xenial main

The stable-2.3 alias points to the latest stable v2.3 OX Dovecot Pro version. Only the latest patch releases are stored in this repository. 

If you want to install older releases you need to explicitly refer to the minor version number. 

For example: if v2.3.3.2 is the latest version, you can still install v2.3.3.1 from the stable- 2.3 repository, but to be able to install v2.3.2 on e.g. Ubuntu Trusty you need to change stable-2.3 to 2.3.2:

.. code-block:: none

   deb https://USERNAME:PASSWORD@apt.dovecot.fi/2.3.2/ubuntu/trusty trusty main

Installation
^^^^^^^^^^^^
You can see all the available OX Dovecot Pro packages with:

.. code-block:: none

   apt-cache search dovecot-ee

Commonly you want to install at least:

.. code-block:: none

   apt-get install dovecot-ee-core dovecot-ee-imapd dovecot-ee-pop3d dovecot-ee-lmtpd dovecot-ee-sieve dovecot-ee-managesieved


.. Important:: You need to enable Dovecot startup by setting ``ENABLED=y in /etc/default/dovecot``. This file also contains additional startup settings.

Repository configuration for Amazon Linux 2
===========================================
OX Dovecot Pro supports Amazon Linux 2. Support was added with the v2.3.3 release of OXDovecot Pro. Earlier versions of Amazon Linux are not supported.

Amazon Linux 2 offers some of the libraries packaged in the Dovecot 3rd party repository. Only the versions distributed via OX repositories are routinely tested with OX Dovecot Pro, so using them is advisable. 

In case a newer version is available via the distribution, that can also be considered, but an older version than the one distributed by OX, should not be used. If yum priorities plugin is enabled make sure 3rd party priority is lower than core repositories by adding ``priority=N``, where N is lower than the priority for Amazon Linux 2 packages (10 at the time of writing).

OX Dovecot Pro v2.3 repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``/etc/yum.repos.d/dovecot.repo``:

.. code-block:: none

   [dovecot]
   name=AMZN $releasever - $basearch – OX Dovecot Pro
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/stable-
   2.3/amzn/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1

   [dovecot-3rdparty]
   name=AMZN $releasever - $basearch – OX Dovecot Pro 3rd party Packages
   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/3rdparty/amzn/$releasever/RPMS/$basearch
   gpgkey=https://yum.dovecot.fi/RPM-GPG-KEY.dovecot
   gpgcheck=1
   enabled=1
   # Uncomment this if you have the yum priorities plugin enabled.
   #priority=1

The stable-2.3 alias points to the latest stable v2.3 OX Dovecot Pro version. Only the latest patch releases are stored in this repository. 

If you want to install older releases you need to explicitly refer to the minor version number. 

For example: if v2.3.3.2 is the latest version, you can still install v2.3.3.1 from the stable- 2.3 repository, but to be able to install v2.3.2 you need to change stable-2.3 to 2.3.2:

.. code-block:: none

   baseurl=https://USERNAME:PASSWORD@yum.dovecot.fi/2.3.2/amzn/$releasever/RPMS/$basearch

Installation
^^^^^^^^^^^^

You can see all available OX Dovecot Pro packages with:

.. code-block:: none

   yum search dovecot-ee

Commonly you want to install at least:

.. code-block:: none

   yum install dovecot-ee dovecot-ee-pigeonhole dovecot-ee-managesieve

OX Dovecot Pro License
======================

A license file, containing a customer-specific encrypted license key, is mandatory to operate OX Dovecot Pro if using the Object Storage plugin (dovecot-ee-obox2 package) or the Dovecot Full Text Search Plugin
(dovecot-ee-fts package).

The license file should be placed at ``/var/lib/dovecot/dovecot-license.txt``.

OX Dovecot Pro automatically updates this license file if it can contact the OX licensing server, via secure connection over the public internet. If access is blocked because of network restrictions, the license file will need to be manually updated before it expires. 

If you are using a configuration management system to manage this license file, please note that the license file may change during operation of OX Dovecot Pro.

Please contact support@open-xchange.com for questions related to the license.
