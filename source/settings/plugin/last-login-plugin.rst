.. _plugin-last-login:

=================
last-login plugin
=================

.. seealso:: See :ref:`lastlogin_plugin` for configuration information.

Settings
========

.. dovecot_plugin:setting:: last_login_dict
   :added: v2.2.14
   :plugin: last-login
   :values: @string

   The dictionary where last login information is updated.

   Example:

   .. code-block:: none

     plugin {
       last_login_dict = redis:host=127.0.0.1:port=6379
     }


.. dovecot_plugin:setting:: last_login_key
   :added: v2.2.14
   :default: last-login/%u
   :plugin: last-login
   :values: @string

   The key that is updated in the dictionary (defined by
   :dovecot_plugin:ref:`last_login_dict`) with the last login information.


.. dovecot_plugin:setting:: last_login_precision
   :added: v2.2.14
   :default: s
   :plugin: last-login
   :values: s, ms, us, ns

   Precision for last login timestamp.
