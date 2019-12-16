.. _mta:

====
MTA
====

MTA is an acronym for Mail Transport Agent. It is the software that works
behind the scenes to transport E-Mail messages from one computer to another.
MUAs (such as mutt, thunderbird, sylpheed, evolution, kmail) hand off newly
sent messages to an MTA. MTAs talk to other MTAs, and either deliver mail
locally or hand it off for delivery to an MDA/LDA if it was destined to the
local system.

MTA is a generic term and usually refers to one of these popular software
packages:

* `Postfix <http://www.postfix.org/>`_ is Wietse Venema's secure, fast and
  flexible mailer. Default on SUSE Linux and NetBSD.
* `Exim <http://www.exim.org/>`_ is Philip Hazel's flexible mailer. Default on
  Debian GNU/Linux.
* `Sendmail <https://www.proofpoint.com/us/open-source-email-solution>`_ the
  original BSD mailer. Default on FreeBSD; a Sun spinoff is used on Solaris.
* `Courier <http://www.courier-mta.org/>`_ was inspired by qmail, but intends
  to do things right.
* `qmail <http://cr.yp.to/qmail.html>`_ is an obsolete and unmaintained server.
  Its POP3 part can be taken over by Dovecot. Qmail started off boasting about
  speed and security in the mid-1990s, but has lots of unfixed bugs (this
  document includes patches where known), among them security bugs that remain
  unfixed, and the security guarantee (500 USD) denied. If you really intend to
  continue using it, read `Dave Sill's Life with qmail
  <http://www.lifewithqmail.org/>`_ which contains instructions to work around
  some of qmail's security issues.
* `HALON <https://halon.io/>`_ is a commercial MTA, which supports Dovecot Auth
  and LMTP. It's based on FreeBSD with anti-spam/virus, DKIM, DMARC, DANE, etc.

Some people also subsume mail fetching utilities under the MTA category, among
them:

* `fetchmail <http://www.fetchmail.info/>`_ a fast mail retriever for the POP2,
  POP3/KPOP/SDPS, IMAP2/IMAP4, ODMR and ETRN protocols, SSL and Kerberos
  capable. It forwards the retrieved messages to SMTP/ESMTP, LMTP servers or
  into an LDA. Developed out of Carl Harris's popclient by Eric S. Raymond.
* `getmail <http://pyropus.ca/software/getmail/>`_ a POP3/SDPS and IMAP4 (with
  SSL) enabled mail retrieval utility written in Python. Developed by Chales
  Cazabon.

These mail fetching utilities can be used to store mail for later retrieval by
dovecot.

Contrast this to the `message delivery agent (MDA)
<https://wiki.dovecot.org/MDA>`_, sometimes called local delivery agent (LDA).
