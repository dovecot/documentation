---
layout: doc
title: pigeonhole
dovecotComponent: pigeonhole
---

# pigeonhole(7) - Overview of the Pigeonhole Sieve support for Dovecot

## DESCRIPTION

Pigeonhole adds support for the Sieve language ([[rfc,5228]]) and the
ManageSieve protocol ([[rfc,5804]]) to Dovecot ([[man,dovecot]]).

In the literal sense, a pigeonhole is a a hole or recess inside a dovecot for
pigeons to nest in. It is, however, also the name for one of a series of
small, open compartments in a cabinet used for filing or sorting mail.
As a verb, it describes the act of putting an item into one of those
pigeonholes. The name "Pigeonhole" therefore well describes an important
part of the functionality that it adds to Dovecot: sorting and filing
e-mail messages.

The Sieve language is used to specify how e-mail needs to be processed.
By writing Sieve scripts, users can customize how messages are
delivered, e.g. whether they are forwarded or stored in special folders.
Unwanted messages can be discarded or rejected, and, when the user is
not available, the Sieve interpreter can send an automated reply. Above
all, the Sieve language is meant to be simple, extensible and system
independent. And, unlike most other mail filtering script languages, it
does not allow users to execute arbitrary programs. This is particularly
useful to prevent virtual users from having full access to the mail
store. The intention of the language is to make it impossible for users
to do anything more complex (and dangerous) than write simple mail
filters.

Using the ManageSieve protocol, users can upload their Sieve scripts
remotely, without needing direct filesystem access through FTP or SCP.
Additionally, a ManageSieve server always makes sure that uploaded
scripts are valid, preventing compile failures at mail delivery.

Pigeonhole provides the following items:

- The LDA Sieve plugin for Dovecot's Local Delivery Agent (LDA)
  ([[man,dovecot-lda]]) that facilitates the actual Sieve filtering
  upon delivery.

- The ManageSieve service that implements the ManageSieve protocol
  through which users can remotely manage Sieve scripts on the server.

- A plugin for Dovecot's [[man,doveadm]] command line tool that adds
  new [[man,doveadm-sieve]] commands for management of Sieve
  filtering.

- The [[plugin,imap-sieve]] plugin, which provides the ability to attach Sieve
  scripts that are run for IMAP events in their mailboxes.

- The [[plugin,imap-filter-sieve,FILTER=SIEVE IMAP capability]] that
  allows refiltering mails in a mailbox using Sieve scripts.

The functionality and configuration of the LDA Sieve plugin and the
ManageSieve service is described in detail in the README and INSTALL
files contained in the Pigeonhole package and in [[link,sieve]].

The following command line tools are available outside of **doveadm**:

[[man,sievec]]
:   Compiles Sieve scripts into a binary representation for later execution.

[[man,sieve-test]]
:   The universal Sieve test tool for testing the effect of a Sieve
    script on a particular message.

[[man,sieve-filter]]
:   Filters all messages in a particular source mailbox through a Sieve
    script.

[[man,sieve-dump]]
:   Dumps the content of a Sieve binary file for (development) debugging
    purposes.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,dovecot]], [[man,dovecot-lda]], [[man,doveadm]],
[[man,doveadm-sieve]], [[man,sieve-dump]], [[man,sieve-test]],
[[man,sieve-filter]], [[man,sievec]]

Additional resources:

- [[link,sieve]]
