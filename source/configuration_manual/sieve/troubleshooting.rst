.. _sieve_troubleshooting:

================================
Pigeonhole Sieve Troubleshooting
================================

This page explains how to approach problems with the :doc:`Sieve
interpreter <index>`.

.. todo::
   Troubleshooting Approach

   *This section should contain a step-wise approach to troubleshooting.*


Common Problems
---------------

Common configuration problems and their solutions are described here.

Sieve Scripts are not Executed
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When Sieve scripts are not being executed, there are several
possibilities:

Your MTA is not using Dovecot LDA or LMTP
   Sieve scripts are executed by the Dovecot :ref:`LDA (Local Delivery
   Agent) <lda>`
   and/or the Dovecot
   :ref:`LMTP <lmtp_server>`
   service. That is why you first need to check whether LDA or LMTP are
   actually being used. At least one of these is supposed to be
   called/accessed from your
   :ref:`MTA <mta>`,
   e.g. Exim or Postfix, for local message delivery. Most MTAs have
   their own local delivery agent, and without explicit configuration
   this is what is used. In that case, your Sieve scripts are simply
   ignored. When you set :ref:`mail_debug=yes <setting-mail_debug>` in your configuration, your
   logs will show details of LDA and/or LMTP execution. The following is
   an example of the first few log lines of an LDA delivery:

   .. code-block:: none

      dovecot: lda: Debug: Loading modules from directory: /usr/lib/dovecot/modules
      dovecot: lda: Debug: Module loaded: /usr/lib/dovecot/modules/lib90_sieve_plugin.so
      dovecot: lda(hendrik): Debug: Effective uid=1000, gid=1000, home=/home/hendrik
      dovecot: lda(hendrik): Debug: Namespace inbox: type=private, prefix=, sep=, inbox=yes, hidden=no, list=yes, subscriptions=yes location=

   The first lines show that LDA has found and loaded the Sieve plugin
   module. Then it shows for what user it is delivering and where his
   INBOX is located. LMTP produces similar log lines. If you don't see
   lines such as the above, your MTA is probably not using Dovecot for
   local delivery. You can verify whether Dovecot is working correctly
   by executing ``dovecot-lda`` manually.

The Sieve plugin is not enabled
   The Dovecot :ref:`LDA <lda>` and :ref:`LMTP <lmtp_server>`
   services do not provide Sieve support by default. Sieve support is
   provided as a separate plugin that needs to be enabled by adding it
   to the :ref:`setting-mail_plugins` setting in the ``protocol lda {...}`` section
   for the LDA and the ``protocol lmtp {...}`` section for LMTP. If this
   is omitted, Sieve scripts are ignored. Check the :doc:`configuration
   page <configuration>`

   Without actually running LDA, you can also check if
   ``doveconf -f service=lda mail_plugins`` includes "sieve".

The Sieve plugin is misconfigured or the involved Sieve scripts contain errors
   If there is a configuration error or when a Sieve script cannot be
   compiled and executed, an error is always logged.

Mailbox Names with non-ASCII Characters Cause Problems
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This problem most often manifests with the following error message:

.. code-block:: none

   error: msgid=<234234.234234@example.com>: failed to store into mailbox 'INBOX/Co&APY-rdineren' (INBOX/Co&-APY-rdineren): Mailbox doesn't exist: INBOX.Co&-APY-rdineren. 

The Sieve script causing this error contained the following command:

.. code-block:: none

   fileinto "INBOX/Co&APY-rdineren";

The specified mailbox contains the non-ASCII character 'ö'.
Unfortunately, the author of this script used the wrong encoding. This
is modified UTF-7 such as used by IMAP. However, Sieve expects UTF-8 for
mailbox names. Depending on version and configuration, Dovecot uses
modified UTF-7 internally. The Sieve interpreter expects UTF-8 and
converts that to UTF-7 when necessary. When the mailbox is encoded in
UTF-7 by the user, the '&' will just be escaped into '&-' during the
UTF-7 conversion, yielding an erroneous mailbox name for Dovecot. That
is what causes the error message presented above. Instead, the
``fileinto`` command should have looked as follows:

.. code-block:: none

   fileinto "INBOX/Coördineren";

The old CMUSieve plugin did use UTF-7 for folder names. Therefore, this
problem could have emerged after migrating from CMUSieve to Pigeonhole.
In that case you should carefully read the :ref:`migration
instructions <sieve_configuration_from_cmusieve>` again.

Often the 'author' of such scripts is an older or misconfigured Sieve
GUI editor. For example, the
`SieveRules <https://github.com/JohnDoh/Roundcube-Plugin-SieveRules-Managesieve#readme>`_
plugin for the `RoundCube webmail IMAP client <http://roundcube.net/>`_
has a configuration option to enable the correct behavior:

::

   $sieverules_config['folder_encoding'] = 'UTF-8';
