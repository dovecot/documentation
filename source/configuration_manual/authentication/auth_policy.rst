.. _authentication-auth_policy:

Authentication policy support
=============================

.. versionadded:: v2.2.27

Dovecot supports external authentication policy server. This
server can be used to decide whether the connecting user is permitted,
tarpitted or outright rejected. While dovecot can do tarpitting and
refusal on its own, this adds support for making cluster-wide decisions
to make it easier to deter and defeat brute force attacks.

Known issues
------------

Prior v2.2.34, the request attributes contained ``orig_username`` which
was not correct in all cases, especially with master login.

Prior v2.3.5.2 / 2.2.36.3, invalid UTF-8 would crash auth server if auth
policy is used.

Configuration
-------------

The auth-policy server is a core feature and does not require plugin(s)
to work. To activate this feature, you need to configure it.

-  :dovecot_core:ref:`auth_policy_server_url`: URL of the policy server, url
   is appended with ``?command=allow/report`` unless it ends with ``&``, at
   which just ``command=allow/report`` is added.

   -  *Default*: None (**REQUIRED** configuration)

   -  Example: ``auth_policy_server_url = http://example.com:4001/``

-  :dovecot_core:ref:`auth_policy_server_api_header`: Header and value to add
   to request (for API authentication)

   -  *Default*: None (No authentication is done)

   -  See https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side

   -  Example: ``Authorization: Basic <base64-encoded value>``

-  :dovecot_core:ref:`auth_policy_server_timeout_msecs`: Request timeout in
    milliseconds

   -  *Default*: ``auth_policy_server_timeout_msecs = 2000``

-  :dovecot_core:ref:`auth_policy_hash_mech`: Hash mechanism to use for
   password, you can use any hash mechanism supported by Dovecot
   (md4,md5,sha1,sha256,sha512)

   -  *Default*: ``auth_policy_hash_mech = sha256``

-  :dovecot_core:ref:`auth_policy_hash_nonce`: Cluster-wide nonce to add to
   hash.  This should contain a secret randomly generated string, which is the
   same for each Dovecot server within the cluster.

   -  *Default*: None (**REQUIRED** configuration)

-  :dovecot_core:ref:`auth_policy_request_attributes`: Request attributes
   specification (see attributes section below)

   -  *Default*: ``auth_policy_request_attributes = login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s``
   -  .. versionadded:: v2.3.11

     - *Default* : ``auth_policy_request_attributes = login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s session_id=%{session}``

-  :dovecot_core:ref:`auth_policy_reject_on_fail`: If policy request fails for
   some reason should users be rejected

   -  *Default*: ``auth_policy_reject_on_fail = no``

-  :dovecot_core:ref:`auth_policy_hash_truncate`: How many **bits** to use
   from password hash.

   -  *Default*: ``auth_policy_hash_truncate = 12``

-  :dovecot_core:ref:`auth_policy_check_before_auth`: Whether to do policy
   lookup before authentication is started

   -  *Default*: ``auth_policy_check_before_auth = yes``

-  :dovecot_core:ref:`auth_policy_check_after_auth`: Whether to do policy
   lookup after authentication is completed

   -  *Default*: ``auth_policy_check_after_auth = yes``

-  :dovecot_core:ref:`auth_policy_report_after_auth`: Whether to report
   authentication result

   -  *Default*: ``auth_policy_report_after_auth = yes``

Required Minimum Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

   auth_policy_server_url = http://example.com:4001/
   auth_policy_hash_nonce = localized_random_string
   #auth_policy_server_api_header = Authorization: Basic <base64-encoded value>
   #auth_policy_server_timeout_msecs = 2000
   #auth_policy_hash_mech = sha256
   #auth_policy_request_attributes = login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s
   #auth_policy_reject_on_fail = no
   #auth_policy_hash_truncate = 12
   #auth_policy_check_before_auth = yes
   #auth_policy_check_after_auth = yes
   #auth_policy_report_after_auth = yes

Password hash algorithm
=======================

To generate the hash, you concatenate nonce, login name, nil byte,
password and run it through the hash algorithm once. The hash is
truncated when truncation is set to non-zero. The hash is truncated by
first choosing bits from MSB to byte boundary (rounding up), then
right-shifting the remaining bits.

.. code-block:: none

   hash = H(nonce||user||'\x00'||password)
   bytes = round8(bits*8)
   hash = HEX(hash[0:bytes] >> (bytes-bits*8))

Request attributes
==================

Auth policy server requests are JSON requests. The JSON format can be
specified with auth_policy_request_attributes. The syntax is key=value
pairs, and key can contain one or more / to designate that a JSON object
should be made. For example:

.. code-block:: none

   login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip}

produces

.. code-block:: none

   {"login":"john.doe","pwhash":"1234","remote":"127.0.0.1"}

And

.. code-block:: none

   login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip} attrs/cos=%{userdb:cos}

produces

.. code-block:: none

   {"login":"john.doe","pwhash":"1234","remote":"127.0.0.1", "attrs":{"cos":"premium"}}


.. versionadded:: v2.2.29/v2.3

        You can include IMAP ID command result in auth policy
        requests, this is achieved with using ``%{client_id}``, which will expand to
        IMAP ID command arglist. You must set

.. parsed-literal::

   :dovecot_core:ref:`imap_id_retain` = yes

for this to work.

Default values for auth_policy_request_attributes
-------------------------------------------------

.. versionadded:: v2.2.25

.. code-block:: none

   login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip}

.. versionadded:: v2.2.30

.. code-block:: none

   login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip} device_id=%{client_id} protocol=%s

.. versionadded:: v2.2.34

.. code-block:: none

   login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s

.. versionadded:: v2.3.0 (note that 2.2 and 2.3 branches have been developed in parallel for a while)

.. code-block:: none

   login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip} device_id=%{client_id} protocol=%s

.. versionadded:: v2.3.1

.. code-block:: none

   login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s

.. versionadded:: v2.3.2

        The request contains 'tls' attribute when TLS has been
        used. TLS is also detected if it's offloaded by a load balancer that can
        provide this information using HAProxy v2 protocol to dovecot.

.. versionadded:: v2.3.11

.. code-block:: none

   login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s session_id=%{session}

.. versionadded:: v3.0.0;v2.4.0

.. code-block:: none

   login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s session_id=%{session} fail_type=%{fail_type}


Response
========

.. code-block:: none

   {"status":-1,"msg":"go away"}

``status`` values: see below

Mode of operation
=================

Auth policy check: Authentication ''before'' userdb/passdb
----------------------------------------------------------

First query is done **before** password and user databases are
consulted. This means that any userdb/passdb attributes are left empty.

The command used here is 'allow' and will appear on the URL as
command=allow.

``status`` result values:

-  ``-1``: Reject

-  ``0``: Accept

-  ``(Any other positive value)``: Tarpit for this number of seconds.

Auth policy check: Authentication ''after'' successful userdb/passdb lookup
---------------------------------------------------------------------------

Second lookup is done **after** authentication succeeds.

The command used here is 'allow' and will appear on the URL as
command=allow.

``status`` result values:

-  ``-1``: Authentication fail

-  ``>= 0``: Authentication succeed

Auth policy check: Reporting after authentication succeeds
----------------------------------------------------------

A report request is sent at end of authentication.

The command used here is 'report' and will appear on the URL as
command=report.

The JSON request is sent with two additional attributes:

-  ``success``: boolean true/false depending on whether the overall
   authentication succeeded

-  ``policy_reject``: boolean true/false whether the failure was due to
   policy server

``status`` result value is ignored.

External Auth Policy Servers
============================

- `OXpedia AppSuite:OX Abuse Shield <https://oxpedia.org/wiki/index.php?title=AppSuite:OX_Abuse_Shield>`_
