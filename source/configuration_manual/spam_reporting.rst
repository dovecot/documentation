.. _spam_reporting:

====================
Spam Reporting
====================

Spam/not-spam reporting within Dovecot (IMAP) is handled by the user action of moving a message into (or out of) a defined Spam mailbox.

The Spam mailbox is defined and reported to the MUA via a Special-Use flag:

.. code-block:: none

   namespace inbox {
     mailbox Spam {
       auto = create
       special_use = \Junk
     }
   }

Spam reporting messages are handled via :ref:`imapsieve plugin <pigeonhole_plugin_imapsieve>`.  A global configuration script is used to capture the event of moving messages in/out of the Spam mailbox; the script sends the message using :rfc:`5965` compliant spam reporting format to an external reporting e-mail address, using the `report extension <https://raw.githubusercontent.com/dovecot/pigeonhole/master/doc/rfc/spec-bosch-sieve-report.txt>`_.

.. code-block:: none

   protocol imap {
     mail_plugins = $mail_plugins imap_sieve
   }
   
   plugin {
     sieve_plugins = sieve_imapsieve
     sieve_implicit_extensions = +vnd.dovecot.report
   
     # From elsewhere to Spam folder
     imapsieve_mailbox1_name = Spam
     imapsieve_mailbox1_causes = COPY
     imapsieve_mailbox1_before = file:/etc/dovecot/report-spam.sieve
     # From Spam folder to elsewhere
     imapsieve_mailbox2_name = *
     imapsieve_mailbox2_from = Spam
     imapsieve_mailbox2_causes = COPY
     imapsieve_mailbox2_before = file:/etc/dovecot/report-ham.sieve
   }
   
   # Needed to send message to external mail server
   submission_host = 127.0.0.1:587

report-spam.sieve:

.. code-block:: none

   require "vnd.dovecot.report";
   
   report "abuse" "User added this message to the Spam folder." "spam-report@example.com";

report-ham.sieve:

.. code-block:: none

   require "vnd.dovecot.report";
   require "environment";
   require "imapsieve";
   
   if environment "imap.mailbox" "Trash" {
      # Putting spam in Trash mailbox is not significant
      stop;
   }
   
   if environment "imap.mailbox" "Spam" {
      # Copying mail inside Spam mailbox is not significant
      stop;
   }
   
   report "not-spam" "User removed this message from the Spam folder." "ham-report@example.com";

.. seealso:: :ref:`howto-antispam_with_imapsieve`
