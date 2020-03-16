.. _coi:

====================
COI (Chat Over IMAP)
====================

Beta version disclaimer
=======================

The purpose of this BETA version of this Dovecot plugin is solely to test its features, to obtain defects, failures and malfunctions. By using the software, you acknowledge that all of the data that you are handling with the BETA version might be subject to such defects, failures and malfunctions, up to the point of total loss. You are aware to not rely on the functionality and that the use of  the software in a professional productive environment is not recommended. 

UNDER NO CIRCUMSTANCES SHALL OPEN-XCHANGE BE LIABLE TO YOU OR TO ANY OTHER PERSON FOR DAMAGES FROM LOST PROFITS, LOSS OF GOODWILL, OR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, OR DAMAGES FOR NEGLIGENCE OF ANY CHARACTER INCLUDING, WITHOUT LIMITATION, DAMAGES FOR WORK STOPPAGE, LOSS OF DATA, COMPUTER FAILURE OR MALFUNCTION, OR FOR ANY OTHER DAMAGE OR LOSS. IN NO EVENT SHALL OPEN-XCHANGE BE LIABLE FOR ANY DAMAGES EVEN IF OPEN-XCHANGE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.



Version requirements
====================

Dovecot version v2.3.8 or higher is required for Chat Over IMAP.



Enabling the plugins
====================

COI is only configured at backends, and needs no changes in proxies or
directors.

.. note:: For outgoing webpush connections, Dovecot backends need to have egress access to the Internet.

Webpush needs to be added to global ``mail_plugins`` and COI plugin needs to be
added to ``mail_plugins`` of imap and lmtp protocols separately as follows:

.. code-block:: none

   mail_plugins = $mail_plugins notify push_notification webpush

   protocol imap {
     mail_plugins = $mail_plugins imap_coi
   }
   protocol lmtp {
     mail_plugins = $mail_plugins lmtp_coi
   }

COI uses imap metadata for configuration, so ``mail_attribute_dict`` has to
be configured, for example:

.. code-block:: none

   mail_attribute_dict = file:%h/dovecot-attributes



Webpush configuration
=====================

Webpush imap capability needs to be enabled manually:

.. code-block:: none

   imap_capability = +WEBPUSH

Note that the '+' is added only once even if you have multiple capabilities added:

.. code-block:: none

   imap_capability = +IDLE WEBPUSH

Webpush plugin can be configured with the plugin settings:

- ``webpush_subscription_expire`` sets how fast subscriptions have to be
  validated
- ``webpush_subscription_limit``  sets how many subscriptions a user can have
  simultaneously
- ``webpush_vapid_curve`` sets which EC curve is used for VAPID keys. Supported
  values are ``prime256v1``, ``secp384r1`` and ``secp521r1``.

The defaults are:

.. code-block:: none

   plugin {
     push_notification_driver = webpush
     webpush_subscription_expire = 5 min
     webpush_subscription_limit = 10
     webpush_vapid_curve = prime256v1
   }

The webpush notification driver supports parameters:

- ``cache_lifetime`` (default: 1 min) sets how long the user's webpush
  subscriptions are internally cached in memory before they are again refreshed
  from the attributes dictionary.
- ``max_retries`` (default: 1) sets the number of retries for a webpush HTTP
  notification before giving up.
- ``timeout_msecs`` (default: 2000) sets how long to wait for webpush HTTP
  notification to finish before giving up.
- ``rawlog_dir`` (default: none) sets the directory where to write webpush HTTP
  traffic rawlog files. The directory must exist and be writable.
- ``padding`` (default: no) sets whether to pad webpush messages to the next
  1 kB boundary when encrypting it. This improves security, but it doesn't
  currently work with all client libraries.
- ``proxy_url`` (default: none) sets the url path for proxying webpush requests
  from dovecot server to webpush servers.
- ``proxy_username`` (default: none) sets the username which will be used to
  authenticate with the set proxy server.
- ``proxy_password`` (default: none) sets the password which will be used to
  authenticate with the set proxy server.

For example:

.. code-block:: none

   plugin {
     push_notification_driver = webpush:max_retries=0:rawlog_dir=/tmp/webpush-rawlog/%u
   }


For more details on Webpush please refer to:
`IMAP WebPush Extension v1.0 <https://github.com/coi-dev/coi-specs/blob/master/webpush-spec.md>`_


COI configuration
=================

The only COI plugin setting is ``coi_mailbox_root``. It configures where the
plugin creates Chat and Contacts folders. The default is:

.. code-block:: none

   plugin {
     coi_mailbox_root = COI
   }


