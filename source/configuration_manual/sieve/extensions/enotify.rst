.. _pigeonhole_extension_enotify:

=============================================
Pigeonhole Sieve: Extension for Notifications
=============================================


The Sieve **enotify** extension
(`RFC5435 <http://tools.ietf.org/html/rfc5435/>`_) adds the notify action to the Sieve language.

Configuration
=============

:pigeonhole:ref:`sieve_notify_mailto_envelope_from setting`
   This allows configuring the source of the notification sender address for e-mail notifications.
   This is similar to the :pigeonhole:ref:`sieve_redirect_envelope_from` setting for redirect.

Examples
========

Send notifications with different importances
---------------------------------------------

.. code-block::

       require ["enotify", "fileinto", "variables"];

       if header :contains "from" "boss@example.org" {
           notify :importance "1"
               :message "This is probably very important"
                           "mailto:alm@example.com";
           # Don't send any further notifications
           stop;
       }

       if header :contains "to" "sievemailinglist@example.org" {
           # :matches is used to get the value of the Subject header
           if header :matches "Subject" "*" {
               set "subject" "${1}";
           }

           # :matches is used to get the value of the From header
           if header :matches "From" "*" {
               set "from" "${1}";
           }

           notify :importance "3"
               :message "[SIEVE] ${from}: ${subject}"
               "mailto:alm@example.com";
           fileinto "INBOX.sieve";
       }

Send notification if we receive mail from domain
------------------------------------------------

.. code-block::

       require ["enotify", "fileinto", "variables", "envelope"];

       if header :matches "from" "*@*.example.org" {
           # :matches is used to get the MAIL FROM address
           if envelope :all :matches "from" "*" {
               set "env_from" " [really: ${1}]";
           }

           # :matches is used to get the value of the Subject header
           if header :matches "Subject" "*" {
               set "subject" "${1}";
           }

           # :matches is used to get the address from the From header
           if address :matches :all "from" "*" {
               set "from_addr" "${1}";
           }

           notify :message "${from_addr}${env_from}: ${subject}"
                           "mailto:alm@example.com";
       }
