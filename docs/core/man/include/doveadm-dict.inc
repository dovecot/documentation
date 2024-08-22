## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **dict** *command*
  [**-u** *user*]
  [*OPTIONS*]
  *config-filter-name*
  [*args*]

**doveadm** [*GLOBAL OPTIONS*] **mail dict** *command*
  [*OPTIONS*]
  *config-filter-name*
  [*args*]

## DESCRIPTION

**doveadm dict** and **doveadm mail dict** can be used to query and modify
dictionary entries.

The **doveadm mail dict** command can be used within a specific user context.
This may be useful if e.g. userdb lookup returns user-specific dict settings.
Otherwise the commands behave identically.

*config-filter-name*
:   Filter name to use when looking up the dict settings. For example
    *mail_attribute*, *quota_clone*. It's also possible to use an empty filter
    name and specify the dict settings using the **-o** parameters.

<!-- @include: ./global-options-formatter.inc -->

## OPTIONS

**doveadm dict** command-specific *options*:

**-u** *user*
:   The user to use.

**doveadm mail dict** command-specific *options*:

<!-- @include: ./option-A.inc -->

<!-- @include: ./option-F-file.inc -->

<!-- @include: ./option-S-socket.inc -->

<!-- @include: ./option-u-user.inc -->

## COMMANDS

### get

**doveadm** [*GLOBAL OPTIONS*] dict get [**-u** *user*]
  *config-filter-name* *key*

**doveadm** [*GLOBAL OPTIONS*] mail dict get
  [**-A** | **-u** *user* | **-F** *file*]
  [**-S** *socket_path*]
  *config-filter-name* *key*

Fetch a key from a dictionary.

*key*
:   The key to fetch.

### iter

**doveadm** [*GLOBAL OPTIONS*] dict iter
  [**-u** *user*]
  [**-1RV**]
  *config-filter-name* *prefix*

**doveadm** [*GLOBAL OPTIONS*] mail dict iter
  [**-A** | **-u** *user* | **-F** *file*]
  [**-S** *socket_path*]
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

**doveadm** [*GLOBAL OPTIONS*] mail dict inc
  [**-A** | **-u** *user* | **-F** *file*]
  [**-S** *socket_path*]
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

**doveadm** [*GLOBAL OPTIONS*] mail dict set
  [**-A** | **-u** *user* | **-F** *file*]
  [**-S** *socket_path*]
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

**doveadm** [*GLOBAL OPTIONS*] mail dict unset
  [**-A** | **-u** *user* | **-F** *file*]
  [**-S** *socket_path*]
  [**-t** *timestamp-msecs*]
  *config-filter-name* *key*

Remove a key from the dictionary.

**-t** *timestamp-msecs*
:   Set the timestamp also.

*key*
:   The key to unset.

<!-- @include: ./reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]

