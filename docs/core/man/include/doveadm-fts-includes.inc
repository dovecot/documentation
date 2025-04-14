### fts flatcurve check

**doveadm** [*GLOBAL OPTIONS*] fts flatcurve check
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [*mailbox* ...]

Run a simple check on Dovecot Xapian databases, and attempt to fix basic
errors (it is the same checking done by the xapian-check command with the
`-F` command-line option).

*mailbox* is the list of mailboxes to process. It is possible to use
wildcards (* and ?) in this value.

For each mailbox that has FTS data, it outputs the following key/value fields:

| Key | Value |
| --- | ----- |
| mailbox | The human-readable mailbox name. (key is hidden) |
| guid | The GUID of the mailbox. |
| errors | The number of errors reported by the Xapian library. |
| shards | The number of index shards processed. |

### fts flatcurve remove

**doveadm** [*GLOBAL OPTIONS*] fts flatcurve remove
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [*mailbox* ...]

Removes all FTS data for a mailbox.

*mailbox* is the list of mailboxes to process. It is possible to use
wildcards (* and ?) in this value.

For each mailbox removed, it outputs the following key/value fields:

| Key | Value |
| --- | ----- |
| mailbox | The human-readable mailbox name. (key is hidden) |
| guid | The GUID of the mailbox. |

### fts flatcurve rotate

**doveadm** [*GLOBAL OPTIONS*] fts flatcurve rotate
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [*mailbox* ...]

Triggers an index rotation for a mailbox.

*mailbox* is the list of mailboxes to process. It is possible to use
wildcards (* and ?) in this value.

For each mailbox rotated, it outputs the following key/value fields:

| Key | Value |
| --- | ----- |
| mailbox | The human-readable mailbox name. (key is hidden) |
| guid | The GUID of the mailbox. |

### fts flatcurve stats

**doveadm** [*GLOBAL OPTIONS*] fts flatcurve stats
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [*mailbox* ...]

Returns FTS data for a mailbox.

*mailbox* is the list of mailboxes to process. It is possible to use
wildcards (* and ?) in this value.

For each mailbox that has FTS data, it outputs the following key/value fields:

| Key | Value |
| --- | ----- |
| mailbox | The human-readable mailbox name. (key is hidden) |
| guid | The GUID of the mailbox. |
| last_uid | The last UID indexed in the mailbox. |
| messages | The number of messages indexed in the mailbox. |
| shards | The number of index shards. |
| version | The (Dovecot internal) version of the FTS data. |
