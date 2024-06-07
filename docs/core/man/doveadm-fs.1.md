---
layout: doc
title: doveadm-fs
---

# doveadm-fs

## NAME

doveadm-fs - Interact with the abstract mail storage filesystem

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **fs** *command* [*ARGUMENTS*]

## DESCRIPTION

The **doveadm fs** *commands* are used to abstractly interact with the
storage backend defined in the Dovecot configuration. It allows access
to the mailbox structure without needing to know details of how the
storage backend is designed.

<!-- @include: include/global-options-formatter.inc -->

This command uses by default the **table** output formatter.

If you have multiple fs drivers, you start by having the first driver in
*fs-driver* and the rest of the pipeline as-is in *fs-args*.

## COMMANDS

### fs copy

**doveadm** [*GLOBAL OPTIONS*] fs copy *fs-driver* *fs-args* *source-path* *dest-path*

Copy source path to the destination path.

### fs delete

**doveadm** [*GLOBAL OPTIONS*] fs delete [**-R**] [**-n** *count*] *fs-driver* *fs-args* *path* [*path* ...]

Delete all data associated with the path provided.

**-R**
:   Recursively delete files.

**-n** *count*
:   Maximum number of parallel operations to perform.

### fs get

**doveadm** [*GLOBAL OPTIONS*] fs get *fs-driver* *fs-args* *path*

Retrieve data associated with the path provided.

### fs iter

**doveadm** [*GLOBAL OPTIONS*] fs iter *fs-driver* *fs-args* *path*

Iterate through all data files in the path provided.

### fs iter-dirs

**doveadm** [*GLOBAL OPTIONS*] fs iter-dirs *fs-driver* *fs-args* *path*

Iterate through all directories in the path provided.

### fs put

**doveadm** [*GLOBAL OPTIONS*] fs put [**-h** *hash*] *fs-driver* *fs-args* *input_path* *path*

Store data at the path provided.

**-h** *hash*
:   Save provided hash as content hash. Must be either MD5 or SHA256 in
    hexdigits.

**-m** *key=value*
:   Assign a value to a metadata. Can be provided as many times as needed.
    Requires either metawrap as driver or metadata capable FS-driver.

### fs stat

**doveadm** [*GLOBAL OPTIONS*] fs stat *fs-driver* *fs-args* *path*

Retrieve files status for the path provided. Currently, only the total
size (in bytes) of the item is returned.

<!-- @include: include/reporting-bugs.inc -->

SEE ALSO

[[man,doveadm]]
