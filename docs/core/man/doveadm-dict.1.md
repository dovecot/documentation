---
layout: doc
title: doveadm-dict
dovecotComponent: core
---

# doveadm-dict(1) - Commands related to dictionary manipulation

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **dict** *command*
  [**-u** *user*]
  *dict-uri*
  [*args*]

## DESCRIPTION

**doveadm dict** can be used to query and modify dictionary entries.

<!-- @include: global-options-formatter.inc -->

**-u** *user*
:   The user to use.

*dict-uri*
:   The uri to the dictionary being manipulated.

## COMMANDS

### doveadm dict get

**doveadm** [*GLOBAL OPTIONS*] dict get [**-u** *user*] *dict-uri* *key*

Fetch a key from a dictionary.

*key*
:   The key to fetch.

### doveadm dict iter

**doveadm** [*GLOBAL OPTIONS*] dict iter
  [**-u** *user*]
  [**-1RV**]
  *dict-uri* *prefix*

Find the keys matching the a prefix in a dictionary.

**-1**
:   Exact match.

**-R**
:   Recurse.

**-V**
:   Don't print values, just key names

*prefix*
:   The key prefix to look for.

List keys into the dictionary.

### doveadm dict inc

**doveadm** [*GLOBAL OPTIONS*] dict inc
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  *dict-uri* *key* *diff*

Increment the value of a numeric key in the keys into the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

*key*
:   The key to increment.

*diff*
:   The amount of the increment.

### doveadm dict set

**doveadm** [*GLOBAL OPTIONS*] dict set
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  [**-e** *expire-secs*]
  *dict-uri* *key* *value*

Set/create keys into the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

**-e** *expire-secs*
:   Set the key duration also.

*key*
:   The key to set.

*value*
:   The value to set.

### doveadm dict unset

**doveadm** [*GLOBAL OPTIONS*] dict unset
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  *dict-uri* *key*

Remove a key from the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

*key*
:   The key to unset.

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
