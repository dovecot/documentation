.. _howto-dovecot_lda_qmail:

Dovecot LDA with Qmail
======================

System users
------------

The delivery command you need is

::

   |/var/qmail/bin/preline -f /usr/local/libexec/dovecot/dovecot-lda

(You may need to adjust the paths to match your qmail and dovecot
installations.) The ``preline`` command will add the ``Return-Path:``
and ``Delivered-To:`` lines, because ``dovecot-lda`` doesn't recognize
qmail's environment variables.

For site-wide usage, put that in ``/var/qmail/control/defaultdelivery``
(assuming you installed qmail according to
`LWQ <http://www.lifewithqmail.org/lwq.html>`__). Or, save it as
``.qmail`` in selected users' home directories.

Virtual users
-------------

Add the ``-d`` parameter to specify the destination username:

::

   |/var/qmail/bin/preline -f /usr/local/libexec/dovecot/dovecot-lda -d $EXT@$USER
