.. _plugin-imap-sieve:

===========================
imap-sieve plugin
===========================

``imap-sieve-plugin``
^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-imap-sieve-setting_imapsieve_url:

``imapsieve_url``
-----------------

If configured, this setting enables support for user Sieve scripts in IMAP. So, leave this unconfigured if you don't want users to have the ability to associate Sieve scripts with mailboxes. 
This has no effect on the administrator-controlled Sieve scripts explained below. The value is an URL pointing to the ManageSieve server that users must use to upload their Sieve scripts.

.. code-block:: none

   sieve://sieve.example.com

