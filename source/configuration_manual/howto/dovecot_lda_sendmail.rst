.. _howto-dovecot_lda_sendmail:

Dovecot LDA with Sendmail
=========================

The following describes how to configure Sendmail to use ``dovecot-lda``
where ``root`` permission is not granted and Dovecot runs under a single
user ID. It may need some adjustment for more typical setups. Other
assumptions are that Sendmail is configured for virtual hosting and that
local-system mail delivery is not handled by ``dovecot-lda``.

Allowing that ``sendmail.mc`` has ``MAILER(procmail)dnl`` included, edit
``sendmail.cf`` adding these lines after the ``Mprocmail`` definition:

::

   ######################*****##############
   ###   DOVECOT Mailer specification    ###
   ##################*****##################
   Mdovecot,   P=/usr/local/libexec/dovecot/dovecot-lda, F=DFMPhnu9,
               S=EnvFromSMTP/HdrFromSMTP, R=EnvToSMTP/HdrFromSMTP,
               T=DNS/RFC822/X-Unix,
               A=/usr/local/libexec/dovecot/dovecot-lda -d $u

If you're using ``sendmail.mc`` then put the lines above into a new file
``/usr/share/sendmail-cf/mailer/dovecot.m4`` and put ``MAILER(dovecot)``
into your ``sendmail.mc``

===================================

Another method of doing the above is by editing your ``hostname.mc``
with the following three lines:

::

   FEATURE(`local_procmail', `/usr/local/libexec/dovecot/dovecot-lda',`/usr/local/libexec/dovecot/dovecot-lda -d $u')
   MODIFY_MAILER_FLAGS(`LOCAL', `-f')
   MAILER(procmail)

After editing ``hostname.mc`` with the above, be sure to remake your
``hostname.cf`` file. This is confirmed to work with:

-  dovecot-1.0.7

-  FreeBSD 6.3-RELEASE-p3 i386

-  sendmail Version 8.14.2

-  Compiled with: DNSMAP LOG MAP_REGEX MATCHGECOS MILTER MIME7TO8
   MIME8TO7 NAMED_BIND NETINET NETINET6 NETUNIX NEWDB NIS PIPELINING
   SASLv2 SCANF STARTTLS TCPWRAPPERS USERDB XDEBUG

===================================

If ``sendmail`` runs under a different non-``root`` UID via

-  :literal:`define(`confRUN_AS_USER', `sendmail')dnl`

in ``sendmail.mc``, then the ``env_put(t_strconcat("RESTRICT\_`` lines in
``deliver.c`` must be commented-out.

Now add a

::

   virtualdomain.example.com vmail:vmail

line for each virtual domain to ``mailertable.cf`` and run
``makemap hash mailertable.db < mailertable.cf``. The ``dovecot`` (or
some other random text) after the colon character is required, else
``sendmail`` will fail to pass command arguments to ``dovecot-lda``
correctly. Make sure all the virtual domains are in the
``virtuserdomains`` file.

===========================================

(Fedora 14: dovecot 2.0.8 & sendmail 8.14.4)

Summing up all previous experience, one may keep all virtual user
accounts under one system account.

The sendmail's "U=" mailer option with changing the owner of lda (to
"keeper" here for instance):

::

   -rwxr-xr-x. 1 keeper mail 14536 Dec  7 16:43 /usr/libexec/dovecot/dovecot-lda

allows to run virtual users under one system account without applying
SUID.

Sendmail can pass a user account to LDA with or without the domain.
Passing a user name without the domain can be achieved with S=/R=
rewriting rules of the local mailer. Finally, into
``/usr/share/sendmail-cf/mailer/dovecot.m4`` goes the block of lines:

::

   Mdovecot,      P=/usr/libexec/dovecot/dovecot-lda,
                  F=l59DFMPhnuS,
                  S=EnvFromL/HdrFromL, R=EnvToL/HdrToL,
                  M=51200000,
                  U=keeper:mail,
                  T=DNS/RFC822/X-Unix,
                  A=/usr/libexec/dovecot/dovecot-lda -d $u

Sendmail's dovecot.m4 can be a bit more complex.
