====================================
Pigeonhole Sieve: Vacation Extension
====================================

.. seealso:: :ref:`pigeonhole_extension_vacation`

.. _plugin-sieve-setting-sieve_vacation_min_period:

``sieve_vacation_min_period``
-----------------------------

 - Default: ``1d``
 - Value: :ref:`time`

Specifies the minimum period that can be specified for the ``:days`` and ``:seconds`` tags of the vacation command.
A minimum of 0 indicates that users are allowed to make the Sieve interpreter send a vacation response message for every incoming message that meets the other reply criteria
(refer to `RFC5230 <https://tools.ietf.org/html/rfc5230>`__). A value of zero is however not recommended.


.. _plugin-sieve-setting-sieve_vacation_max_period:

``sieve_vacation_max_period``
-----------------------------

 - Default: ``0``
 - Value: :ref:`time`

Specifies the maximum period that can be specified for the ``:days`` tag of the vacation command.
The configured value must be larger than the :ref:`plugin-sieve-setting-sieve_vacation_min_period` setting. A value of 0 has a special meaning: it indicates that there is no upper limit.


.. _plugin-sieve-setting-sieve_vacation_default_period:

``sieve_vacation_default_period``
---------------------------------

 - Default: ``7d``
 - Value: :ref:`time`

Specifies the default period that is used when no ``:days`` or ``:seconds`` tag is specified.
The configured value must lie between the :ref:`plugin-sieve-setting-sieve_vacation_min_period` and :ref:`plugin-sieve-setting-sieve_vacation_max_period`.


.. _plugin-sieve-setting-sieve_vacation_use_original_recipient:

``sieve_vacation_use_original_recipient``
-----------------------------------------

 - Default: ``no``
 - Value: :ref:`boolean`

This specifies whether the original envelope recipient should be used in the check for implicit delivery.
The vacation command checks headers of the incoming message, such as ``To:`` and ``Cc:`` for the address of the recipient,
to verify that the message is explicitly addressed at the recipient. If the recipient address is not found,
the vacation action will not trigger a response to prevent sending a reply when it is not appropriate.

Normally only the final recipient address is used in this check. This setting allows including the original recipient specified in the SMTP session if available.
This is useful to handle mail accounts with aliases. Use this option with caution: if you are using aliases that point to more than a single account,
senders can get multiple vacation responses for a single message. Use the :ref:`LDA <lda>` ``-a`` option or the LMTP/LDA :ref:`setting-lda_original_recipient_header` setting
to make the original SMTP recipient available to Sieve.


.. _plugin-sieve-setting-sieve_vacation_dont_check_recipient:

``sieve_vacation_dont_check_recipient``
---------------------------------------

 - Default: ``no``
 - Value: :ref:`boolean`

This disables the checks for implicit delivery entirely. This means that the vacation command does not verify that the message is explicitly addressed at the recipient.
Use this option with caution. Specifying ``yes`` will violate the Sieve standards and can cause vacation replies to be sent for messages not directly addressed at the recipient.


.. _plugin-sieve-setting-sieve_vacation_send_from_recipient:

``sieve_vacation_send_from_recipient``
--------------------------------------

 - Default: ``no``
 - Value: :ref:`boolean`

This setting determines whether vacation messages are sent with the SMTP ``MAIL FROM`` envelope address set to the recipient address of the Sieve script owner.
Normally this is set to ``<>``, which is the default as recommended in the specification. This is meant to prevent mail loops.
However, there are situations for which a valid sender address is required and this setting can be used to accommodate for those.
