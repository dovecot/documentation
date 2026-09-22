[[added,imap_search_nesting_limit_added]]

The IMAP search key grammar is recursive: parenthesized key lists and the
operators that take a key (`NOT`, `OR`, `FUZZY`, `INTHREAD`,
`MIMEPART PARENT/CHILD`, ...) nest other keys inside them. Dovecot builds and
walks the resulting search argument tree with one C stack frame per nesting
level, so a query nested deeply enough would overflow the stack of the `imap`
process.

Queries nested deeper than the allowed limit are rejected with:

```
a BAD Error in IMAP command SEARCH: Too much nesting in search query
```

This affects every command that takes search arguments: `SEARCH`,
`UID SEARCH`, `SORT`, `THREAD`, and the search arguments of `STORE` and
`FETCH`. [[doveadm,search]] and the other `doveadm` mailbox commands use the
same search query parser and the same limit.

The limit is not a fixed constant and it is not configured in `dovecot.conf`.
It is derived from the stack size limit (`RLIMIT_STACK`) of the process, so
that a larger stack allows deeper nesting:

```
maximum nesting depth = max(32, RLIMIT_STACK / 2 / 4096)
```

With the common 8 MB default stack this allows 1024 levels of nesting, which
is far more than any normal client uses.

The other built-in and configurable resource limits are listed in
[[link,limits]].

### Raising the Limit

Legitimate queries should never come close to the limit. If a client does
need deeper nesting, raise the stack size limit of the Dovecot processes.
Dovecot itself has no setting for this - the limit is inherited from the
process that starts the master process.

With systemd, override it for the Dovecot service:

```[/etc/systemd/system/dovecot.service.d/stack.conf]
[Service]
LimitSTACK=16M
```

Then run `systemctl daemon-reload` and restart Dovecot.

With a SysV style init script, raise it before starting Dovecot:

```sh
ulimit -s 16384
```

Note that the stack size applies to every Dovecot process, so raising it
increases the memory each process may use. Lowering it below the default has
the opposite effect and lowers the nesting limit as well.
