.. _plugin-imap-injection:

===========================
imap-injection plugin
===========================

``imap-injection-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-imap-injection-setting_display_name:

``display_name``
----------------

STRING - String to generate TO-Header in emails (optional but has to default to "" / empty string).


.. _plugin-imap-injection-setting_email:

``email``
-----------

STRING - the hashed version of the users email (mandatory).


.. _plugin-imap-injection-setting_promo_fs:

``promo_fs``
-------------

Storage location for promotional mail templates (required, an fs-api string).


.. _plugin-imap-injection-setting_imap_injection_delay_new_mails:

``imap_injection_delay_new_mails``
------------------------------------

How long to delay between new promo mail injections (required, a time format). 

The minimum interval is 1 minute.


.. _plugin-imap-injection-setting_imap_injection_max_visible_mails:

``imap_injection_max_visible_mails``
---------------------------------------

Maximum number of unseen injected mails to show at a time (required, an integer). 

.. Note::
 
   Setting this to 0 will remove all injected promotions and stop querying the API endpoint.


