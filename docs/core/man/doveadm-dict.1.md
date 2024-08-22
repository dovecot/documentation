---
layout: doc
title: doveadm-dict
dovecotComponent: core
---

# doveadm-dict(1) - Commands related to dictionary manipulation

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **dict** *command*
  [**-u** *user*]
  [*OPTIONS*]
  *config-filter-name*
  [*args*]

## DESCRIPTION

**doveadm dict** can be used to query and modify dictionary entries.

*config-filter-name*
:   Filter name to use when looking up the dict settings. For example
    *mail_attribute*, *quota_clone*. It's also possible to use an empty filter
    name and specify the dict settings using the **-o** parameters.

<!-- @include: global-options-formatter.inc -->

## OPTIONS

**-u** *user*
:   The user to use.

## COMMANDS

### get

**doveadm** [*GLOBAL OPTIONS*] dict get [**-u** *user*]
  *config-filter-name* *key*

Fetch a key from a dictionary.

*key*
:   The key to fetch.

### iter

**doveadm** [*GLOBAL OPTIONS*] dict iter
  [**-u** *user*]
  [**-1RV**]
  *config-filter-name* *prefix*

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

### inc

**doveadm** [*GLOBAL OPTIONS*] dict inc
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  *config-filter-name* *key* *diff*

Increment the value of a numeric key in the keys into the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

*key*
:   The key to increment.

*diff*
:   The amount of the increment.

### set

**doveadm** [*GLOBAL OPTIONS*] dict set
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  [**-e** *expire-secs*]
  *config-filter-name* *key* *value*

Set/create keys into the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

**-e** *expire-secs*
:   Set the key duration also.

*key*
:   The key to set.

*value*
:   The value to set.

### unset

**doveadm** [*GLOBAL OPTIONS*] dict unset
  [**-u** *user*]
  [**-t** *timestamp-msecs*]
  *config-filter-name* *key*

Remove a key from the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

*key*
:   The key to unset.

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
