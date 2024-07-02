---
layout: doc
title: MTA
dovecotlinks:
  mta: MTA
---

# MTA

MTA is an acronym for Mail Transport Agent. It is the software that works
behind the scenes to transport E-Mail messages from one computer to another.

MUAs (such as Thunderbird, Outlook, Apple Mail, etc.) hand off newly
sent messages to an MTA. MTAs talk to other MTAs, and either deliver mail
locally or hand it off for delivery to a [[link,mda]].

MTA is a generic term and usually refers to one of these popular software
packages:

* [Postfix](https://www.postfix.org/)
  flexible mailer.
* [Exim](https://www.exim.org/)
* [Sendmail](https://www.proofpoint.com/us/products/email-protection/open-source-email-solution), the original BSD mailer.
* [Courier](https://www.courier-mta.org/)
* [qmail](https://cr.yp.to/qmail.html) is an obsolete and unmaintained server.
  If you really intend to continue using it, read
  [Dave Sill's Life with qmail](http://www.lifewithqmail.org/) which contains
  instructions to work around some of qmail's security issues.
* [HALON](https://halon.io/) is a commercial MTA, which supports Dovecot Auth
  and LMTP.

Some people also subsume mail fetching utilities under the MTA category, among
them:

* [fetchmail](https://www.fetchmail.info/), a fast mail retriever.
* [getmail](https://pyropus.ca/software/getmail/),a mail retrieval utility
  written in Python.

These mail fetching utilities can be used to store mail for later retrieval by
Dovecot.
