## Dovecot Core

### Configuration Changes

The first setting in `dovecot.conf` must now be
[[setting,dovecot_config_version]]. This helps to avoid unexpected
configuration changes in the future.

Another new required setting is [[setting,dovecot_storage_version]]. This helps
to avoid unexpected storage file format incompatibilities.

passdb and userdb sections now require a name, i.e.:

```
# This gives an error:
passdb {
  ...
}

# Use this instead:
passdb some_name {
}
```

### Added Features

| Feature | Notes |
| ------- | ----- |
| `%{ldap_multi}` variable | This variable was added to LDAP configuration file to allow for fetching a multi-valued attribute. See [[link,auth_ldap]]. |

### Removed Features

| Feature | Notes |
| ------- | ----- |
| Dict quota, Dirsize quota | These backends are removed. You should use [[link,quota_backend_count]] instead along with [[plugin,quota-clone]].<br /> Note that switching to quota count can cause all user's indexes to update, so reserve time for this. |
| XZ Compression | You need to perform migration using different plugin. With maildir, you can try uncompressing all your mail and compressing them with another algorithm while Dovecot is not running. |
| `auth_worker_max_count` | Use [[link,service_configuration,service-specific process limit]]. |
| Weak password schemes | Weak password schemes are disabled by default, you need to use [[setting,auth_allow_weak_schemes]] to enable them. |
| Global ACL directory | Use [[link,acl_global_file]] instead. See [below](#use-global-acl-files-instead-of-global-acl-directories) for details on migration. |
| `ssl-parameters.dat` | This file is no longer converted automatically by config process, you need to set [[setting,ssl_dh]] setting if you need non-ECC Diffie-Hellman. |
| shadow auth driver | Use [[link,auth_pam]] instead. |
| old-stats plugin | Use [[link,stats]] instead. `auth_stats` setting has been removed too. |
| Memcached dict driver | Use [[link,dict_redis]] instead. |
| `login_access_sockets` | Use [[link,auth_lua]] instead. Dovecot will fail to start if this setting is present in configuration. |
| TCP wrapper support | Use [[link,auth_lua]] instead. |
| checkpassword auth database | Use [[link,auth_lua]] instead. |
| IPC process | Has been merged to anvil. |
| `auth_debug` | Use [[setting,log_debug]] filter instead. Example: `log_debug=category=auth` |
| `auth_client_cache_flush_started`, `auth_client_cache_flush_finished` | These events were removed. |
| OpenSSL support for older than 1.0.2 | Older versions are not supported anymore. |
| imap-zlib plugin | The IMAP `COMPRESS` extension is now automatically enabled. |
| Renamed `zlib plugin` and relevant configuration items | Use [[plugin,mail-compress]], with the configuration items [[setting,mail_compress_save]] as well as [[setting,mail_compress_save_level]], instead. |
| Dict passdb & userdb driver | Use [[link,auth_lua]] instead. |
| mailbox-alias plugin | Depending on the use case, replacement may be the [[setting, namespace/mailbox/special_use]] mailbox setting and/or [[link,sieve]] filters. |
| `disable_plaintext_auth` | This has been replaced with [[setting,auth_allow_cleartext]] setting. |
| `ssl=required` | Connections from [[setting,login_trusted_networks]] are now also required to be SSL/TLS encrypted with this setting. See also [[link,secured_connections]]. |
| `dict_db_config` | Berkeley DB is not supported anymore. |
| `idle_msecs` | Deprecated dict proxy parameter. Use [[link,dict_idle_timeout]] setting instead. |
| `warn_slow_msecs` | Deprecated dict proxy parameter. Use [[link,dict_slow_warn]] setting instead. |
| Dovecot director role | This has been replaced with the Dovecot Pro Palomar architecture. |
| `imap_id_log` setting | Replaced by the [[event,imap_id_received]] event. |
| size.virtual | size.virtual field is no longer written to dovecot.index.cache file as it is duplicating vsize record in dovecot.index file. Reading of the field from old files is supported. |
| SETQUOTA / `quota_set` | Quota limits can no longer be modified using the IMAP SETQUOTA command. |
| Cassandra `ssl_verify=cert-dns` | Deprecated by Cassandra cpp-driver due to it being insecure against MITM attacks. |

### Changed Default Settings

| Key | Old | New | Notes |
| --- | --- | --- | ----- |
| `service/anvil/chroot` | empty | \<no value\> | Anvil is no longer chrooted |
| `service/anvil/user` | $default_internal_user | \<no value\> | Anvil runs as root |
| `service/auth-worker/process_limit` | 1 | 30 | Behaviour of process limit has changed for auth-worker,  it now behaves as it was supposed to. |
| [[setting,mail_location]] | empty | `NO-NOSELECT` | `NO-NOSELECT` is the new default behavior. To revert to the old default specify `KEEP-NOSELECT`. |
| [[setting,mail_cache_max_headers_count]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_cache_max_header_name_length]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_log_prefix]] | `%s(%u)<%{pid}><%{session}>:` | `%s(%u)<%{process:pid}><%{session}>:` | Uses new process key. |

### Doveadm Mailbox Commands

`USER` environment variable is no longer supported.

All mail commands require providing `-u`, `-F` or `-A` parameter.

This will always be subject to user database lookup and requires access to auth userdb socket.

### Use Global ACL Files instead of Global ACL Directories

To migrate the ACL directories into their respective files you have to do the
following:

1. create a new consolidated [[link,acl_global_file]],
2. for each subdirectory in the currently configured ACL directory add a line
   starting with the mailbox name followed by the appropriate content,
3. change the vfile parameter to the new ACL file, and finally
4. remove the old ACL directory parent.

#### Example

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

You have to create the new ACL file:

::: code-group
```[/etc/dovecot/dovecot-acl]
# previously from /etc/dovecot/acls/INBOX
INBOX owner lrwstipekxa
INBOX anyone lr
INBOX user=kim l
# previously from /etc/dovecot/acls/foo/.DEFAULT
INBOX/foo user=timo lr
INBOX/foo user=kim lrw
# previously from /etc/dovecot/acls/foo/bar
INBOX/foo/bar user=kim lrw
```
:::

Note that at this point you could simplify specific rules, e.g. use mailbox
name wildcards to replace lines for a specific user: `INBOX/* user=kim lrw`.

And re-configure the ACL plugin:

::: code-group
```[dovecot.conf]
plugin {
  acl = vfile:/etc/dovecot/dovecot-acl
}
```

Afterwards you can remove the old global ACL directory parent:

```console
$ rm -rf /etc/dovecot/acls/
```

### Event Changes

#### Core Events

| Event | Change |
| ----- | ------ |
| [[event,imap_id_received]] | This event was added. |
| [[event,login_aborted]] | This event was added. |
| [[event,mail_metadata_accessed]] | This event was added. |
| [[event,pop3_command_finished]] | This event was added. |

#### Event Fields

| Event | Field | Change |
| ----- | ----- | ------ |
| [[event,dns_worker_request_finished]] | `cached` | This field was added. |
| [[event,proxy_session_finished]] | `error_code` | This field was added. |
| [[event,proxy_session_finished]] | `idle_usecs` | This field was changed from `idle_secs`. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_host` | This field was added. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_ip` | This field was added. |
| [[event,sql_query_finished]] | `consistency` | This field was added. |
| [[event,sql_query_finished]] | `error_consistency` | This field was added. |
| Mail user events | `service` | This field was added.
| Various | `net_bytes_in` | This field was changed from `bytes_in`. |
| Various | `net_bytes_out` | This field was changed from `bytes_out`. |

