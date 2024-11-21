### ACLs

#### Use ACL settings instead of Global ACL Directories or Global ACL File

With the following starting configuration:

::: code-group
```[dovecot.conf]
namespace {
  prefix = INBOX/
  separator = /
}

plugin {
  acl = vfile:/etc/dovecot/acls/
}
```

```[/etc/dovecot/acls/INBOX]
owner lrwstipekxa
anyone lr
user=kim l
```

```[/etc/dovecot/acls/INBOX/foo/.DEFAULT]
user=timo lr
user=kim lrw
```

```[/etc/dovecot/acls/INBOX/foo/bar]
user=kim lrw
```
:::

You have to create the new ACLs to `dovecot.conf`:

```[dovecot.conf]
namespace inbox {
  # previously from /etc/dovecot/acls/INBOX
  mailbox INBOX {
    acl owner {
      rights = lrwstipekxa
    }
    acl anyone {
      rights = lr
    }
    acl user=kim {
      rights = l
    }
  }
  # previously from /etc/dovecot/acls/foo/.DEFAULT
  mailbox INBOX/foo {
    acl user=timo {
      rights = lr
    }
    acl user=kim {
      rights = lrw
    }
  }
  # previously from /etc/dovecot/acls/foo/bar
  mailbox INBOX/foo/bar {
    acl user=kim {
      rights = lrw
    }
  }
```

Note that at this point you could simplify specific rules, e.g. use mailbox
name wildcards to replace lines for a specific user:

```[dovecot.conf]
mailbox INBOX/* {
  acl user=kim {
    rights = lrw
  }
}
```

And re-configure the ACL plugin:

```[dovecot.conf]
acl_driver = vfile
acl_globals_only = yes
```

Afterwards you can remove the old global ACL directory parent:

```sh
rm -rf /etc/dovecot/acls/
```
