---
layout: doc
title: sieve-dump
dovecotComponent: pigeonhole
---

# sieve-dump(1) - Pigeonhole's Sieve script binary dump tool

## SYNOPSIS

**sieve-dump** [*options*] *sieve-binary* [*out-file*]

## DESCRIPTION

The **sieve-dump** command is part of Pigeonhole ([[man,pigeonhole,,7]]),
which adds Sieve ([[rfc,5228]]) and ManageSieve ([[rfc,5804]]) support to
Dovecot ([[man,dovecot]]).

Using the **sieve-dump** command, Sieve binaries, which are produced for
instance by [[man,sievec]], can be transformed into a human-readable
textual representation. This can provide valuable insight in how the
Sieve script is executed. This is also particularly useful to view
corrupt binaries that can result from bugs in the Sieve implementation.
This tool is intended mainly for development purposes, so normally
system administrators and users will not need to use this tool.

The format of the output is not explained here in detail, but it should
be relatively easy to understand. The Sieve binaries comprise a set of
data blocks, each of which can contain arbitrary data. For the base
language implementation two blocks are used: the first containing a
specification of all required language extensions and the second
containing the main Sieve program. Compiled Sieve programs are
represented as flat byte code and therefore the dump of the main program
is a disassembly listing of the interpreter operations. Extensions can
define new operations and use additional blocks. Therefore, the output
of **sieve-dump** depends greatly on the language extensions used when
compiling the binary.

## OPTIONS

**-c** *config-file*
:   Alternative Dovecot configuration file path.

**-D**
:   Enable Sieve debugging.

**-h**
:   Produce per-block hexdump output of the whole binary instead of the
    normal human-readable output.

<!-- @include: option-o.inc -->

<!-- @include: option-u-user.inc -->

<!-- @include: option-x.inc -->

## ARGUMENTS

*sieve-binary*
:   Specifies the Sieve binary file that needs to be dumped.

*out-file*
:   Specifies where the output must be written. This argument is
    optional. If omitted, the output is written to **stdout**.

## EXIT STATUS

**sieve-dump** will exit with one of the following values:

**0**
:   Dump was successful. (EX_OK, EXIT_SUCCESS)

**1**
:   Operation failed. This is returned for almost all failures.
    (EXIT_FAILURE)

**64**
:   Invalid parameter given. (EX_USAGE)

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/90-sieve.conf*
:   Sieve interpreter settings (included from Dovecot's main
:   configuration file)

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,dovecot]], [[man,dovecot-lda]], [[man,sieve-filter]],
[[man,sieve-test]], [[man,sievec]], [[man,pigeonhole,,7]]
