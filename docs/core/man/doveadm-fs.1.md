---
layout: doc
title: doveadm-fs
dovecotComponent: core
---

# doveadm-fs(1) - Interact with the abstract mail storage filesystem

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **fs** *command* *config-filter-name*
  [*ARGUMENTS*]

## DESCRIPTION

The **doveadm fs** *commands* are used to abstractly interact with the
storage backend defined in the Dovecot configuration. It allows access
to the mailbox structure without needing to know details of how the
storage backend is designed.

*config-filter-name*
:   Filter name to use when looking up the fs settings. For example
    *mail_attachments*, *obox*, *metacache*, *fts_dovecot*. It's also possible
    to use an empty filter name and specify the fs settings using the **-o**
    parameter.

<!-- @include: include/global-options-formatter.inc -->

## COMMANDS

### copy

**doveadm** [*GLOBAL OPTIONS*] fs copy
  *config-filter-name* *source-path* *dest-path*

Copy source path to the destination path.

### delete

**doveadm** [*GLOBAL OPTIONS*] fs delete
  [**-R**]
  [**-n** *count*]
  *config-filter-name* *path* [*path* ...]

Delete all data associated with the path provided.

**-R**
:   Recursively delete files.

**-n** *count*
:   Maximum number of parallel operations to perform.

### get

**doveadm** [*GLOBAL OPTIONS*] fs get *config-filter-name* *path*

Retrieve data associated with the path provided.

### iter

**doveadm** [*GLOBAL OPTIONS*] fs iter *config-filter-name* *path*

Iterate through all data files in the path provided.

### iter-dirs

**doveadm** [*GLOBAL OPTIONS*] fs iter-dirs *config-filter-name* *path*

Iterate through all directories in the path provided.

### put

**doveadm** [*GLOBAL OPTIONS*] fs put
  [**-h** *hash*]
  [**-m** *key*=*value*]
  *config-filter-name* *input_path* *path*

Store data at the path provided.

**-h** *hash*
:   Save provided hash as content hash. Must be either MD5 or SHA256 in
    hexdigits.

**-m** *key=value*
:   Assign a value to a metadata. Can be provided as many times as needed.
    Requires either metawrap as driver or metadata capable FS-driver.

### stat

**doveadm** [*GLOBAL OPTIONS*] fs stat *config-filter-name* *path*

Retrieve files status for the path provided. Currently, only the total
size (in bytes) of the item is returned.

<!-- @include: include/reporting-bugs.inc -->

SEE ALSO

[[man,doveadm]]
