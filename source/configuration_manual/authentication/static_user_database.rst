.. _authentication-static_user_database:

====================
Static User Database
====================

Static user database can be used when you want to use only single UID and GID values for all users, and their home directories can be specified with a simple template. The syntax is:

.. code-block:: none

 userdb static {
  fields {
    uid = <uid>
    gid = <gid>
    home = <dir template>
  }
 }

The home is optional. You can also return other :ref:`authentication-user_database_extra_fields`. You can use the standard :ref:`config_variables` everywhere.

LDA and passdb lookup for user verification
===========================================

Unless your MTA already verifies that the user exists before calling dovecot-lda, you'll most likely want dovecot-lda itself to verify the user's existence. Since dovecot-lda looks up the user only from the userdb, it of course doesn't work with static userdb because there is no list of users. Normally static userdb handles this by doing a passdb lookup instead. This works with most passdbs, with :ref:`authentication-pam` being the most notable exception. If you want to avoid this user verification, you can add :dovecot_core:ref:`userdb_static_allow_all_users = yes <userdb_static_allow_all_users>` to the settings of the userdb in which case the passdb lookup is skipped.

Example
=======

.. code-block:: none

 userdb static {
  fields {
    uid = 500
    gid = 500
    home = /home/%u
  }
 }
