.. _repository_guide:

.. image:: ../../_static/dovecot.png

============================================
OX Dovecot Pro Repository Installation Guide
============================================

The repository access is available only by using a customer-specific username
and password. Open-Xchange reserves the right to suspend a user account if the
maximum number of servers accessing the repository (50) is exceeded. 

A warning email is sent to the account owner before this happens. If you need
more than the allowed number of connections, please contact
`Open-Xchange Support <support@open-xchange.com>`_.

For problems in a production environment, please contact Open-Xchange Support.
For non-production issues, please refer to your dedicated Open-Xchange account
manager or professional services contact.

Repository versions for OX Dovecot Pro
======================================

There are two versions of OX Dovecot Pro available: v2.3 and v2.2 (EOL).

OX Dovecot Pro v2.3
-------------------

Repository details can be found in release specific documentation in
:ref:`ox_dovecot_pro_releases`.

OX Dovecot Pro v2.2 (EOL)
-------------------------

See :ref:`ox_dovecot_pro_2_2_repository`.

Installation for RHEL/CentOS
============================

You can see all available OX Dovecot Pro packages with:

.. code-block:: none

  yum search dovecot-ee

Commonly you want to install at least:

.. code-block:: none

  yum install dovecot-ee dovecot-ee-pigeonhole dovecot-ee-managesieve

.. note:: CentOS 6 only: See also ``/etc/sysconfig/dovecot`` for additional
          startup settings.

Installation for Debian/Ubuntu
==============================

You can see all available OX Dovecot Pro packages with:

.. code-block:: none

  apt-cache search dovecot-ee

Commonly you want to install at least:

.. code-block:: none

  apt-get install dovecot-ee-core dovecot-ee-imapd dovecot-ee-pop3d \
          dovecot-ee-lmtpd dovecot-ee-sieve dovecot-ee-managesieved


.. Important:: You need to enable Dovecot startup by setting ``ENABLED=y`` in
               ``/etc/default/dovecot``. This file also contains additional
               startup settings.

Installation for Amazon Linux 2
===============================

.. versionadded:: v2.3.3

OX Dovecot Pro supports Amazon Linux 2. Earlier versions of Amazon Linux are
not supported.

Amazon Linux 2 offers some of the libraries packaged in the Dovecot 3rd party
repository. Only the versions distributed via OX repositories are routinely
tested with OX Dovecot Pro, so using them is advisable.

In case a newer version is available via the distribution, that can also be
considered, but an older version than the one distributed by OX should not be
used. If yum priorities plugin is enabled, make sure 3rd party priority is
lower than core repositories by adding ``priority=N``, where N is lower than
the priority for Amazon Linux 2 packages (``10`` at the time of writing).
