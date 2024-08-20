## Dovecot Core

### Configuration Changes

#### Required Settings

The first setting in `dovecot.conf` must now be
[[setting,dovecot_config_version]]. This helps to avoid unexpected
configuration changes in the future.

Another new required setting is [[setting,dovecot_storage_version]]. This helps
to avoid unexpected storage file format incompatibilities.

#### passdb/userdb Section Naming

[[link,passdb]] and [[link,userdb]] sections now require a name, i.e.:

```
# This gives an error:
passdb {
  ...
}

# Use this instead:
passdb some_name {
}
```

#### Empty userdb Variables

userdb fields can be set to empty value now. Previously they became changed
to `yes` value.

#### Unknown/Invalid Variables

Unknown/invalid `%{variables}` now cause Dovecot errors. This may cause,
e.g., authentication failures if the old (broken) behavior was relied on.

#### base64url Hash Modifier

Added base64url format to hash modifier in variable expansion. Example:
`%{sha1;format=base64url:username}`.

#### fs-crypt

[[link,mail_crypt_fs_crypt]] now requires encryption keys by default.

#### Event Filter Values

Size units are now allowed when specifying event filter values. For example,
`100kb` is now accepted as equivalent to `102400`.

Interval units are now allowed when specifying event filter values. For
example, `1min` instead of `60000000`.

Event filters now support escaping wildcard `*` and `?` characters by
prefixing them with `\`.

### Added Features

| Feature | Notes |
| ------- | ----- |
| `%{ldap_multi}` variable | This variable was added to LDAP configuration file to allow for fetching a multi-valued attribute. See [[link,auth_ldap]]. |
| [[setting,fts_autoindex_exclude]] | The setting now honors namespaces. |
| [[setting,submission_add_received_header]] | This setting was added. |
| [[setting,login_socket_path]] | This setting was added. |
| `fail_type` parameter to [[setting,auth_policy_request_attributes]] | This parameter was added. |
| ARGON2 password scheme | Support for the ARGON2 password scheme was added. |
| SCRAM-SHA-1, SCRAM-SHA-256 | Support SASL mechanisms for outgoing connections. |
| X25519, X448 | [[plugin,mail-crypt]] and [[link,mail_crypt_fs_crypt]] now support these curves. |
| [[setting,fts_message_max_size]] | This setting was added. |
| `log_retries` Cassandra parameter | This connection parameter was added. See [[link,sql_cassandra]]. |
| [[setting,quota_mailbox_count]] | This setting was added. |
| [[setting,quota_mailbox_message_count]] | This setting was added. |
| [[setting,auth_internal_failure_delay]] | This setting was added. |

### Removed Features

| Feature | Notes |
| ------- | ----- |
| Dict quota; Dirsize quota | These backends are removed. You should use [[link,quota_backend_count]] instead along with [[plugin,quota-clone]].<br /> Note that switching to quota count can cause all user's indexes to update, so reserve time for this. |
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
| OpenSSL support for older than 1.0.2 | Older versions are not supported anymore. |
| imap-zlib plugin | The IMAP `COMPRESS` extension is now automatically enabled. |
| zlib plugin | Use [[plugin,mail-compress]] with the [[setting,mail_compress_write_method]] setting instead. |
| Dict passdb & userdb driver | Use [[link,auth_lua]] instead. |
| mailbox-alias plugin | Depending on the use case, replacement may be the [[setting,mailbox_special_use]] mailbox setting and/or [[link,sieve]] filters. |
| `disable_plaintext_auth` | This has been replaced with [[setting,auth_allow_cleartext]] setting. |
| `ssl=required` | Connections from [[setting,login_trusted_networks]] are now also required to be SSL/TLS encrypted with this setting. |
| `SSLv3` option for [[setting,ssl_min_protocol]] | This option was removed, as it is no longer secure. |
| `dict_db_config` | Berkeley DB is not supported anymore. |
| `idle_msecs` | Deprecated dict proxy parameter. Use [[link,dict_idle_timeout]] setting instead. |
| `warn_slow_msecs` | Deprecated dict proxy parameter. Use [[link,dict_slow_warn]] setting instead. |
| Dovecot director role | This has been replaced with the Dovecot Pro Palomar architecture. |
| `imap_id_log` setting | Replaced by the [[event,imap_id_received]] event. |
| size.virtual | size.virtual field is no longer written to dovecot.index.cache file as it is duplicating vsize record in dovecot.index file. Reading of the field from old files is supported. |
| SETQUOTA / `quota_set` setting | Quota limits can no longer be modified using the IMAP SETQUOTA command. |
| Cassandra `ssl_verify=cert-dns` setting | Removed, as it was deprecated by Cassandra cpp-driver due to it being insecure against MITM attacks. |
| Sieve extensions: `notify`, `imapflags`, `vnd.dovecot.duplicate` | These deprecated Sieve extensions have been removed. |
| `auth_default_realm` setting | This has been replaced by [[setting,auth_default_domain]]. |
| `push_notification_backend` plugin setting | Use [[setting,push_notification_driver]] instead. |
| `sieve_dir`, `sieve_global_path`, `sieve_global_dir` settings | These settings have been removed. See [[link,sieve_file]] and [[link,sieve_location]]. |
| `sieve_vacation_max_subject_codepoints` | This setting has been removed. |
| `auth_policy_server_timeout_msecs` | See: [[link,auth_policy_configuration]]. |
| `mail_crypt_require_encrypted_user_key` | Replaced by [[setting,crypt_user_key_require_encrypted]], [[setting,crypt_user_key_password]] and [[setting,crypt_user_key_encryption_key]]. |
| `verbose_ssl` | Use [[setting,log_debug,category=ssl]] instead. |

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
| [[setting,mailbox_list_drop_noselect]] | `no` | `yes` | `\NoSelect` folders are now dropped by default. |
| [[setting,imapc_features]] | Features "delay-login", "search", "fetch-headers", "fetch-bodystructure", "fetch-size" by default. Enable "acl" and "modseq" by default, if the remote server supports it. |

### Changed Service Defaults

#### LMTP

Default LMTP proxy destination port is now `24`.

### Doveadm

#### batch

The `doveadm batch` command was removed.

#### dsync

The `dsync` command symlink was removed. Use [[doveadm,sync]] or
[[doveadm,backup]] commands directly instead.

#### fs

[[doveadm,fs put]] can now put metadata also.

#### indexer

Added [[doveadm,indexer]] command.

#### save

Added `-r received-date` parameter. See [[doveadm,save]].

#### Mailbox Commands

`USER` environment variable is no longer supported.

All mail commands require providing `-u`, `-F` or `-A` parameter.

This will always be subject to user database lookup and requires access to auth userdb socket.

#### --no-userdb-lookup parameter

Added the `--no-userdb-lookup` parameter to doveadm mail commands.

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

```sh
rm -rf /etc/dovecot/acls/
```

### Event Changes

#### Core Events

| Event | Change |
| ----- | ------ |
| `auth_client_cache_flush_started` |  This event was removed. |
| `auth_client_cache_flush_finished` | This event was removed. |
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
| Various | `transport` | `transport=trusted` was changed to `transport=secured`. See also [[link,secured_connections]]. |
| Mail user events | `service` | This field was added.
| Various | `net_bytes_in` | This field was changed from `bytes_in`. |
| Various | `net_bytes_out` | This field was changed from `bytes_out`. |

#### Exports

Events can now be exported to a local file or a unix socket. See
[[link,event_export_transports]].

### Doveadm HTTP API

#### Boolean Request Values

The doveadm HTTP API now requires valid boolean values. Providing invalid
boolean values will result in a 400 response.

### Lua Authentication

Lua passdb/userdb now passes all args key/values to an initialization function.
See [[link,auth_lua_initialization]].
