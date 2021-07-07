================================
Simple Virtual User Installation
================================

-  Virtual users configured in :ref:`/etc/dovecot/passwd <authentication-passwd_file>` file

-  Assuming an unmodified Dovecot v2.x installation

-  Assuming you're not using NFS. See :ref:`NFS <nfs>` for problems related to it.

System configuration
====================

-  Create **dovecot** and **dovenull** users and groups if they don't exist yet. These are unprivileged users for Dovecot's internal use.
   They don't need a home directory or a shell.

-  Create **vmail** user and **vmail** group. This is the user/group that's used to access the mails.

-  Create ``/home/vmail`` directory owned by vmail:vmail. The mails for all users are stored under this directory.

-  Create ``/var/log/dovecot.log`` and ``/var/log/dovecot-info.log`` files owned by vmail:vmail, so that `dovecot-lda <https://wiki.dovecot.org/LDA>`__ can write to them.

dovecot.conf
============

Below is a fully working ``dovecot.conf`` file. You can use it directly,
but it might be better to instead use the included example-config as the
base and make the same modifications to it.

If you want to configure SSL, see :ref:`SSL <ssl>`.

::

   protocols = imap pop3

   # It's nice to have separate log files for Dovecot. You could do this
   # by changing syslog configuration also, but this is easier.
   log_path = /var/log/dovecot.log
   info_log_path = /var/log/dovecot-info.log

   # Disable SSL for now.
   ssl = no
   disable_plaintext_auth = no

   # We're using Maildir format
   mail_location = maildir:~/Maildir

   # If you're using POP3, you'll need this:
   pop3_uidl_format = %g

   # Authentication configuration:
   auth_verbose = yes
   auth_mechanisms = plain
   passdb {
     driver = passwd-file
     args = /etc/dovecot/passwd
   }
   userdb {
     driver = static
     args = uid=vmail gid=vmail home=/home/vmail/%u
   }

/etc/dovecot/passwd
===================

See :ref:`AuthDatabase/PasswdFile <authentication-passwd_file>` for the full file format.
Here we're interested only having usernames and passwords in it.
Below's an example file:

::

   test:{PLAIN}pass::::::
   bill:{PLAIN}secret::::::
   timo@example.com:{PLAIN}hello123::::::
   dave@example.com:{PLAIN}world234::::::
   joe@elsewhere.org:{PLAIN}whee::::::
   jane@elsewhere.org:{PLAIN}mypass::::::

As you can see, you can use multiple domains in the file, or no domains at all.
Dovecot doesn't care about domains.
The extra colons are needed for :ref:`userdb <authentication-user_database>` passwd-file format, and can be omitted if you are using the static user database in the example above.

Users can be added by editing this file.
Dovecot automatically notices the new users immediately after they're added.
It also creates their home directories when the user logs in.

Passwords
---------

The passwords in the example passwd file are listed using plaintext scheme.
It's possible to use other :ref:`password schemes <authentication-password_schemes>` as well.
For example sha256-crypt would be a pretty strong scheme.
You can create them using ``doveadm pw`` utility, for example:

::

   doveadm pw -s sha256-crypt
   Enter new password: foo
   Retype new password: foo
   {SHA256-CRYPT}$5$88T/Emz.AbSmbz5C$D3GLxhvDffdN1ldpKkulh2fHyUNzvojIjiVbTovPdyC

Note that you won't get the same output after {SSHA256} as above, because Dovecot uses random salts when creating the SSHA256 hash.
This means that even if multiple users have the same password, you won't know that because their hashes are different.

The passwd file entry would be:

::

   {SHA256-CRYPT}$5$88T/Emz.AbSmbz5C$D3GLxhvDffdN1ldpKkulh2fHyUNzvojIjiVbTovPdyC

Joe would now have "foo" as his password.

SMTP server configuration
=========================

Delivering mails
----------------

You can configure the SMTP server to deliver mails internally, or you can use `dovecot-lda <https://wiki.dovecot.org/LDA>`__.
Using dovecot-lda gives you better performance because it updates Dovecot's index files while saving the mails.
See `LDA <https://wiki.dovecot.org/LDA>`__ for how to configure this.
Alternatively you can also use :ref:`LMTP <lmtp_server>`.
In config you should have:

::

   protocol lda {
     postmaster_address = postmaster@example.com
   }

.. _simple_virtual_install_smtp_auth:

SMTP AUTH
---------

If you're using one of these MTAs, you can use Dovecot :ref:`sasl` to
authenticate SMTP.

- :ref:`Postfix (v2.3+) configuration <howto-postfix_and_dovecot_sasl>`
- :ref:`Exim (v4.64+) configuration <howto-exim_and_dovecot_sasl>`
- :ref:`chasquid (v0.04+) configuration <howto-chasquid_and_dovecot_sasl>`

Quota
=====

If you need to have :ref:`quota <quota>`, add this to ``dovecot.conf``:

::

   mail_plugins = $mail_plugins quota
   protocol imap {
     mail_plugins = $mail_plugins imap_quota
   }
   plugin {
     quota = maildir
   }

Then configure quota by adding ``userdb_quota_rule`` :ref:`extra field <authentication-user_database_extra_fields>` to ``/etc/dovecot/passwd``, for example:

::

   joe:{PLAIN}pass::::::userdb_quota_rule=*:storage=100M
   jane:{PLAIN}pass::::::userdb_quota_rule=*:storage=200M

Joe has now 100MB quota and Jane has 200MB quota. See `Quota <quota>` for more information about quota settings.
