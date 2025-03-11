Dovecot supports many [IMAP extensions](https://imapwiki.org/Specs).

### COMPRESS

Dovecot supports the IMAP COMPRESS ([[rfc,4978]]) extension.

It allows an IMAP client to dynamically enable stream compression for an
IMAP session.

The extension is enabled by default and configured with the default
compression level for the available mechanism.

### SEARCH=FUZZY

IMAP provides SEARCH as part of the core protocol, so it is useful to activate
a Full Text Search indexing driver to handle these searches.

See [[plugin,fts]].

### METADATA

Dovecot supports the IMAP METADATA extension ([[rfc,5464]]), which allows
per-mailbox, per-user data to be stored and accessed via IMAP commands.

See [[setting,imap_metadata]] for configuration instructions.

#### Storing Metadata in SQL Dictionary

You can store metadata into a database. This works best with a dedicated table
for storing the entires.

::: code-group
```sql [SQL Schema]
-- Since username is a primary key, it is required to have some value.
-- When empty, it means that the value applies to keys with 'shared/' prefix.
-- Keys with 'priv/' prefix are expected to have a non-empty username.

CREATE TABLE metadata (
  username VARCHAR(255) NOT NULL DEFAULT '',
  attr_name VARCHAR(255) NOT NULL,
  attr_value VARCHAR(65535),
  PRIMARY KEY(username, attr_name)
);
```

```[/etc/dovecot/dovecot.conf]
dict_server {
  dict metadata {
    driver = sql
    sql_driver = mysql

    dict_map $key {
      sql_table = attr_priv
      username_field = username

      key_field attr_name {
	value = $key
      }
      value_field attr_value {
      }
    }
  }
}

mail_attribute {
 dict proxy {
   name = metadata
  }
}
```
:::

### SPECIAL-USE

No special-use mailboxes are configured by default. However, you can use
[[setting,@mailbox_defaults]] group to include the recommended default
mailboxes with special-use flags configured. Alternatively, you can configure
the [[setting,mailbox]] settings explicitly with
[[setting,mailbox_special_use]].

### PREVIEW

Dovecot supports the PREVIEW extension ([[rfc,8970]]), retrieved
via the IMAP FETCH command.

The extension is enabled by default. Preview text is generated during
message delivery and is stored in the Dovecot index files.

### NOTIFY

Set [[setting,mailbox_list_index,yes]].

### URLAUTH:

Set [[setting,imap_urlauth_host]] and [[setting,mail_attribute]].
