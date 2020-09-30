.. _pigeonhole_extension_vacation:

====================================
Pigeonhole Sieve: Vacation Extension
====================================

The Sieve vacation extension
(`RFC5230 <http://tools.ietf.org/html/rfc5230/>`__) defines a mechanism
to generate automatic replies to incoming email messages. It takes
various precautions to make sure replies are only sent when appropriate.
Script authors can specify how often replies can be sent to a particular
contact. In the original vacation extension, this interval is specified
in days with a minimum of one day. When more granularity is necessary
and particularly when replies must be sent more frequently than one day,
the vacation-seconds extension
(`RFC6131 <http://tools.ietf.org/html/rfc5230/>`__) can be used. This
allows specifying the minimum reply interval in seconds with a minimum
of zero (a reply is then always sent), depending on administrator
configuration.

Configuration
=============

The **vacation** extension is available by default. In contrast, the
**vacation-seconds** extension - which implies the vacation extension
when used - is not available by default and needs to be enabled
explicitly by adding it to the :ref:`plugin-sieve-setting-sieve_extensions`  setting. The
configuration also needs to be adjusted accordingly to allow a non-reply
period of less than a day.

The **vacation** and **vacation-seconds** extensions have their own
specific settings. The settings that specify a period (currently all of
them) are specified in **s**\ (econds), unless followed by a
**d**\ (ay), **h**\ (our) or **m**\ (inute) specifier character.

The following settings can be configured for the vacation extension in
the ``plugin`` section (default values are indicated):

:ref:`plugin-sieve-setting-sieve_vacation_min_period` = 1d
   This specifies the minimum period that can be specified for the :days
   and :seconds tags of the vacation command. A minimum of 0 indicates
   that users are allowed to make the Sieve interpreter send a vacation
   response message for every incoming message that meets the other
   reply criteria (refer to RFC5230). A value of zero is however not
   recommended.

:ref:`plugin-sieve-setting-sieve_vacation_max_period` = 0
   This specifies the maximum period that can be specified for the :days
   tag of the vacation command. The configured value must be larger than
   the sieve_vacation_min_period setting. A value of 0 has a special
   meaning: it indicates that there is no upper limit.

:ref:`plugin-sieve-setting-sieve_vacation_default_period` = 7d
   This specifies the default period that is used when no :days or
   :seconds tag is specified. The configured value must lie between the
   sieve_vacation_min_period and sieve_vacation_max_period.

:ref:`plugin-sieve-setting-sieve_vacation_use_original_recipient` = no
   This specifies whether the original envelope recipient should be used
   in the check for implicit delivery. The vacation command checks
   headers of the incoming message, such as To: and Cc: for the address
   of the recipient, to verify that the message is explicitly addressed
   at the recipient. If the recipient address is not found, the vacation
   action will not trigger a response to prevent sending a reply when it
   is not appropriate. Normally only the final recipient address is used
   in this check. This setting allows including the original recipient
   specified in the SMTP session if available. This is useful to handle
   mail accounts with aliases. Use this option with caution: if you are
   using aliases that point to more than a single account, senders can
   get multiple vacation responses for a single message. Use the
   :ref:`LDA <lda>`
   ``-a`` option or the
   :ref:`LMTP <lmtp_server>`
   :ref:`setting-lda_original_recipient_header` setting to make the original SMTP
   recipient available to Sieve.

:ref:`plugin-sieve-setting-sieve_vacation_dont_check_recipient` = no
   This disables the checks for implicit delivery entirely. This means
   that the vacation command does not verify that the message is
   explicitly addressed at the recipient. Use this option with caution.
   Specifying 'yes' will violate the Sieve standards and can cause
   vacation replies to be sent for messages not directly addressed at
   the recipient.

:ref:`plugin-sieve-setting-sieve_vacation_send_from_recipient` = no
   This setting determines whether vacation messages are sent with the
   SMTP MAIL FROM envelope address set to the recipient address of the
   Sieve script owner. Normally this is set to <>, which is the default
   as recommended in the specification. This is meant to prevent mail
   loops. However, there are situations for which a valid sender address
   is required and this setting can be used to accommodate for those.

Invalid values for the settings above will make the Sieve interpreter
log a warning and revert to the default values.

See also :ref:`how vacation auto-reply uses
addresses <sieve_usage-vacation_auto_reply>`.

Example
-------

::

   plugin {
     # Use vacation-seconds
     sieve_extensions = +vacation-seconds

     # One hour at minimum
     sieve_vacation_min_period = 1h

     # Ten days default
     sieve_vacation_default_period = 10d

     # Thirty days at maximum
     sieve_vacation_max_period = 30d
   }
