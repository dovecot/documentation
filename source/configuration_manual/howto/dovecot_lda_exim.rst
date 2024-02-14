.. _howto-dovecot_lda_exim:

Dovecot LDA with Exim
=====================

System users
------------

Change the localuser router to use dovecot_delivery transport:

::

   localuser:
     driver = accept
     check_local_user
   # local_part_suffix = +* : -*
   # local_part_suffix_optional
     transport = dovecot_delivery

``check_local_user`` is required. It makes Exim execute the transport
with the user's UID and GID and it also sets HOME environment.

Next create a new transport for dovecot-lda:

::

   dovecot_delivery:
     driver = pipe

     # Use /usr/lib/dovecot/dovecot-lda  if using Debian's package.
     # You may or may not want to add -d $local_part@$domain depending on if you need a userdb lookup done.
     command = /usr/local/libexec/dovecot/dovecot-lda -f $sender_address

     message_prefix =
     message_suffix =
     log_output
     delivery_date_add
     envelope_to_add
     return_path_add
     #group = mail
     #mode = 0660
     temp_errors = 64 : 69 : 70: 71 : 72 : 73 : 74 : 75 : 78

LDA is now running using the local user's UID and GID. The mail is
delivered to the location specified by
:dovecot_core:ref:`mail_location`
setting. Note that the above configuration doesn't do any
:ref:`userdb <authentication-user_database>` lookups, so
you can't have any per-user configuration. If you want that, see the
virtual user setup below.

Virtual users
-------------

Make sure that ``check_local_user`` isn't set in the router.

Single UID
~~~~~~~~~~

Configure the transport to run as the user you want, for example vmail:

::

   dovecot_virtual_delivery:
     driver = pipe
     command = /usr/local/libexec/dovecot/dovecot-lda -d $local_part@$domain  -f $sender_address
     # v1.1+: command = /usr/local/libexec/dovecot/dovecot-lda -d $local_part@$domain  -f $sender_address -a $original_local_part@$original_domain
     message_prefix =
     message_suffix =
     delivery_date_add
     envelope_to_add
     return_path_add
     log_output
     user = vmail
     temp_errors = 64 : 69 : 70: 71 : 72 : 73 : 74 : 75 : 78

You'll also need to have a master authentication socket and give vmail
user access to it. See :ref:`LDA <lda>` for more information.

List of temp_errors can be found in ``/usr/include/sysexits.h``.

Multiple UIDs
~~~~~~~~~~~~~

If you need multiple uids/gids you'll need to set dovecot-lda setuid
root. See :ref:`LDA <lda>` for how to do this securely.

You could alternatively set ``user = root``, but this requires that you
built Exim without root being in FIXED_NEVER_USERS list.

Multiple UIDs, without running dovecot-lda as root
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In this mode, dovecot-lda won't be querying Dovecot's master socket,
instead trusting Exim to setup its execution environment. This means you
must set up Exim to get the UID, GID, Home directory from
LDAP/SQL/whatever. Here, we're setting them in the router and the
transport automatically inherits them.

Router configuration
^^^^^^^^^^^^^^^^^^^^

Insert the following router after your external delivery routers and
before your local system delivery routers.

This assumes you're using macros set elsewhere to handle your external
queries, as they can quickly become unwieldy to manage. Make sure you
adjust it to suit your installation first!

::

   ldap_local_user:
     debug_print = "R: ldap_local_user for $local_part@$domain"
     driver = accept
     domains = +ldap_local_domains
     condition = LDAP_VIRT_COND
     router_home_directory = LDAP_VIRT_HOME
     user = LDAP_VIRT_UID
     group = LDAP_VIRT_GID
     #local_part_suffix = +* : -*
     #local_part_suffix_optional
     transport = dovecot_lda

Transport configuration
^^^^^^^^^^^^^^^^^^^^^^^

This transport has been tested with Exim 4.69-9 and Dovecot 1:1.2.5-2
(backported) on Debian Lenny. You also have to set

::

   dovecot_lda:
     debug_print = "T: dovecot_lda for $local_part@$domain"
     driver = pipe
     # Uncomment the following line and comment the one after it if you want dovecot-lda to try
     # to deliver subaddresses into INBOX.{subaddress}. If you do this, uncomment the
     # local_part_suffix* lines in the router as well. Make sure you also change the separator
     # to suit your local setup.
     #command = /usr/lib/dovecot/dovecot-lda -e -k -m "INBOX|${substr_1:$local_part_suffix}" \
     command = /usr/lib/dovecot/dovecot-lda -e -k \
         -f "$sender_address" -a "$original_local_part@$original_domain"
     environment = USER=$local_part@$domain
     home_directory = /var/mail/home/$domain/$local_part
     umask = 002
     message_prefix =
     message_suffix =
     delivery_date_add
     envelope_to_add
     return_path_add
     log_output
     log_defer_output
     return_fail_output
     freeze_exec_fail
     #temp_errors = *
     temp_errors = 64 : 69 : 70 : 71 : 72 : 73 : 74 : 75 : 78

You need to have :ref:`home directory <virtual_users-homedir>` set
to have duplicate database enabled, among other reasons.
