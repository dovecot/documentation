.. _howto-dovecot_lda_zmailer:

Dovecot LDA as local delivery agent for ZMailer
===============================================

1. Add to ``zmailer/sm.conf``:

::

   # dovecot LDA
   dovecot SPfne  /usr/local/libexec/dovecot/dovecot-lda  dovecot-lda -e -d $u

2. Change ``zmailer/scheduler.conf``:

Set **local/file\*** and **local/pipe\*** to use "mailbox" delivery
agent:

::

   local/file*
   local/pipe*
           ...
           # ZMailer local delivery transport agent
           command="mailbox -8HS -l ${LOGDIR}/mailbox"

and all the other **local/\*** to use Dovecot LDA:

::

   local/*
           ...
           # Dovecot as the local delivery agent:
           command="sm -8Hc $channel dovecot"

This makes all deliveries to local users go via Dovecot LDA, but users
can also run pipes or store to files in their ``.forward`` files. (This
is why there are tag-matchers for "local/file\*" and "local/pipe\*" before
"local/\*" in the ``scheduler.conf`` file; those are for the cases that
must not go via Dovecot LDA.)

If you're going to use dovecot-lda's ``-e`` parameter you'll need to
patch either Dovecot or ZMailer sources. When dovecot-lda wants to
reject mails, it exits with EX_NOPERM code, but ZMailer thinks this
isn't normal and logs "(this is abnormal, investigate!)".

ZMailer fix in ``zmailer/transports/libta/diagnostic.c``:

.. code:: diff

   -      case EX_NOPERM:
          case EX_PROTOCOL:
          case EX_USAGE:
                  strcat(message,
                         " (this is abnormal, investigate!)");
                  s += strlen(s);
                  /* fall through */
   +      case EX_NOPERM:
          case EX_NOUSER:
          case EX_NOHOST:
          case EX_UNAVAILABLE:

Or Dovecot fix in ``dovecot-2.0/src/lda/main.c``:

.. code:: diff

                   if (stderr_rejection)
   -                       return EX_NOPERM;
   +                       return EX_UNAVAILABLE;
