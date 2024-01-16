.. _sieve_and_smtp_submission:

=================================
 Sieve and SMTP submission
=================================

.. code-block:: none

  postmaster_address = postmaster@%d

Email address to use in the From: field for outgoing email rejections. The
``%d`` variable expands to the recipient domain.

See https://wiki.dovecot.org/DomainLost for details when this does not work.

.. code-block:: none

  submission_host = smtp-out.example.com:25

SMTP server which is used for sending email rejects, Sieve forwards, vacations,
etc.

Alternatively, ``sendmail_path`` setting can be used to send mails using the
sendmail binary.

.. code-block:: none

  protocol lmtp {
    mail_plugins {
      sieve = yes
    }
  }
