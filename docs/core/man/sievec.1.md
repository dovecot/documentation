---
layout: doc
title: sievec
dovecotComponent: pigeonhole
---

# sievec(1) - Pigeonhole's Sieve script compiler

## SYNOPSIS

**sievec** [*options*] *script-file* [*out-file*]

## DESCRIPTION

The **sievec** command is part of Pigeonhole ([[man,pigeonhole,,7]]),
which adds Sieve ([[rfc,5228]]) and ManageSieve ([[rfc,5804]]) support to
Dovecot ([[man,dovecot]]).

Using the **sievec** command, Sieve scripts can be compiled into a
binary representation. The resulting binary can be used directly to
process e-mail messages during the delivery process. The delivery of
mail messages and - by means of the LDA Sieve plugin - also the
execution of Sieve scripts is performed by Dovecot's local delivery
agent (LDA) called [[man,dovecot-lda]].

Usually, it is not necessary to
compile the Sieve script manually using **sievec**, because
[[man,dovecot-lda]] will do this automatically if the binary is missing.
However, in some cases [[man,dovecot-lda]] does not have permission to write
the compiled binary to disk, forcing it to recompile the script every
time it is executed. Using the **sievec** tool, this can be performed
manually by an authorized user to increase performance.

The Pigeonhole Sieve implementation recognizes files with a **.sieve**
extension as Sieve scripts and corresponding files with a **.svbin**
extension as the associated compiled binary. This means for example that
Dovecot's LDA process will first look for a binary file "dovecot.svbin"
when it needs to execute "dovecot.sieve". It will compile a new binary
when it is missing or outdated.

The **sievec** command is also useful to verify Sieve scripts before
using. Additionally, with the **-d** option it can output a textual (and
thus human-readable) dump of the generated Sieve code to the specified
file. The output is then identical to what the [[man,sieve-dumA]]p
command produces for a stored binary file. This output is mainly useful
to find bugs in the compiler that yield corrupt binaries.

## OPTIONS

**-c**\ *config-file*
:   Alternative Dovecot configuration file path.

**-d**
:   Don't write the binary to *out-file*, but write a textual dump of the
    binary instead. In this context, the *out-file* value '-' has special
    meaning: it causes the textual dump to be written to **stdout**.
    The *out-file* argument may also be omitted, which has the same
    effect as '-'. The output is identical to what the
    [[man,sieve-dump]] command produces for a compiled Sieve binary
    file. Note that this option is not allowed when the *out-file*
    argument is a directory.

**-D**
:   Enable Sieve debugging.

<!-- @include: include/option-o.inc -->

<!-- @include: include/option-u-user.inc -->

<!-- @include: include/option-x.inc -->

## ARGUMENTS

*script-file*
:   Specifies the script to be compiled. If the *script-file* argument is
    a directory, all files in that directory with a *.sieve* extension
    are compiled into a corresponding *.svbin* binary file. The
    compilation is not halted upon errors; it attempts to compile as many
    scripts in the directory as possible. Note that the **-d** option and
    the *out-file* argument are not allowed when the *script-file*
    argument is a directory.

*out-file*
:   Specifies where the (binary) output is to be written. This argument
    is optional. If this argument is omitted, a binary compiled from
    \<scriptname\>.sieve is saved as \<scriptname\>.svbin. If this argument
    is omitted and **-b** is specified, the binary dump is output to
    **stdout**.

## EXIT STATUS

**sievec** will exit with one of the following values:

**0**
:   Compile was successful. (EX_OK, EXIT_SUCCESS)

**1**
:   Operation failed. This is returned for almost all failures. (EXIT_FAILURE)

**64**
:   Invalid parameter given. (EX_USAGE)

**67**
:   User does not exist.

**68**
:   Input file, address or other resource does not exist.

**73**
:   Cannot create output file.

**77**
:   Permission error.

**78**
:   Configuration error.

**127**
:   Unknown error.


## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/90-sieve.conf*
:   Sieve interpreter settings (included from Dovecot's main
:   configuration file)

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,dovecot]], [[man,dovecot-lda]], [[man,sieve-dump]],
[[man,sieve-filter]], [[man,sieve-test]], [[man,pigeonhole,,7]]
