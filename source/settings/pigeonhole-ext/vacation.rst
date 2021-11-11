====================================
Pigeonhole Sieve: Vacation Extension
====================================

.. seealso:: :ref:`pigeonhole_extension_vacation`

Settings
--------

.. pigeonhole:setting:: sieve_vacation_default_period
   :default: 7d
   :plugin: yes
   :values: @time

Specifies the default period that is used when no ``:days`` or ``:seconds``
tag is specified.

.. note:: The configured value must lie between
          :pigeonhole:ref:`sieve_vacation_min_period` and
          :pigeonhole:ref:`sieve_vacation_max_period`.


.. pigeonhole:setting:: sieve_vacation_dont_check_recipient
   :default: no
   :plugin: yes
   :values: @boolean

This disables the checks for implicit delivery entirely. This means that the
vacation command does not verify that the message is explicitly addressed at
the recipient.

Use this option with caution. Specifying ``yes`` will violate the Sieve
standards and can cause vacation replies to be sent for messages not directly
addressed at the recipient.


.. pigeonhole:setting:: sieve_vacation_max_period
   :default: 0
   :plugin: yes
   :values: @time

Specifies the maximum period that can be specified for the ``:days`` tag of
the vacation command.

The configured value must be larger than the
:pigeonhole:ref:`sieve_vacation_min_period` setting.

A value of ``0`` has a special meaning: it indicates that there is no upper
limit.


.. pigeonhole:setting:: sieve_vacation_min_period
   :default: 1d
   :plugin: yes
   :values: @time

Specifies the minimum period that can be specified for the ``:days`` and
``:seconds`` tags of the vacation command.

A minimum of ``0`` indicates that users are allowed to make the Sieve
interpreter send a vacation response message for every incoming message that
meets the other reply criteria (refer to
`RFC5230 <https://tools.ietf.org/html/rfc5230>`_). A value of zero is not
recommended.


.. pigeonhole:setting:: sieve_vacation_send_from_recipient
   :default: no
   :plugin: yes
   :values: @boolean

This setting determines whether vacation messages are sent with the SMTP
``MAIL FROM`` envelope address set to the recipient address of the Sieve
script owner.

Normally this is set to ``<>``, which is the default as recommended in the
specification. This is meant to prevent mail loops. However, there are
situations for which a valid sender address is required and this setting can
be used to accommodate for those.


.. pigeonhole:setting:: sieve_vacation_use_original_recipient
   :default: no
   :plugin: yes
   :values: @boolean

This specifies whether the original envelope recipient should be used in the
check for implicit delivery.

The vacation command checks headers of the incoming message, such as ``To:``
and ``Cc:`` for the address of the recipient, to verify that the message is
explicitly addressed at the recipient. If the recipient address is not found,
the vacation action will not trigger a response to prevent sending a reply
when it is not appropriate.

Normally only the final recipient address is used in this check. This setting
allows including the original recipient specified in the SMTP session if
available.

This is useful to handle mail accounts with aliases. Use this option with
caution: if you are using aliases that point to more than a single account, as
senders can get multiple vacation responses for a single message.

Use the :ref:`LDA <lda>` ``-a`` option or the LMTP/LDA
:dovecot_core:ref:`lda_original_recipient_header` setting to make the original
SMTP recipient available to Sieve.
