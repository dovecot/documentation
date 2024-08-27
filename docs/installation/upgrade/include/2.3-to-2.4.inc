## Dovecot Core

### Configuration Changes

::: warning
Dovecot 2.3.x settings will NOT work unless the configuration is changed
as described in this section.
:::

#### Required Settings

The first setting in `dovecot.conf` **MUST** now be
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

userdb fields can be set to empty value. Previously they became changed
to `yes` value.

#### Unknown/Invalid Variables

Unknown/invalid `%{variables}` cause Dovecot errors. This may cause,
e.g., authentication failures if the old (broken) behavior was relied on.

#### base64url Hash Modifier

Added base64url format to hash modifier in variable expansion. Example:
`%{sha1;format=base64url:username}`. See [[link,settings_variables_modifiers]].

#### fs-crypt

[[link,mail_crypt_fs_crypt]] now requires encryption keys by default.

#### Event Filters

Size units are allowed when specifying event filter values. For example,
`100kb` is accepted as equivalent to `102400`.

Interval units are allowed when specifying event filter values. For
example, `1min` is accepted as equivalent to `60000000`.

Event filters support escaping wildcard `*` and `?` characters by prefixing
them with `\`.

#### Changed types for FTS header settings

| Setting Name | Update |
| --- | --- |
| [[setting,fts_header_excludes]] | Changed to [[link,settings_types_boollist]]. |
| [[setting,fts_header_includes]] | Changed to [[link,settings_types_boollist]]. |

### Added Features

#### Settings

* [[setting,auth_internal_failure_delay]]
* [[setting,fts_message_max_size]]
* [[setting,login_socket_path]]
* [[setting,quota_mailbox_count]]
* [[setting,quota_mailbox_message_count]]
* [[setting,submission_add_received_header]]

#### Auth Policy Parameters

See [[link,auth_policy]].

| Parameter | Notes |
| --------- | ----- |
| `fail_type` parameter to [[setting,auth_policy_request_attributes]] | Parameter was added. |

#### Cassandra Parameters

See [[link,sql_cassandra]].

| Parameter | Notes |
| --------- | ----- |
| `log_retries` | Parameter was added. |

#### Cryptographic Features

| Feature | Notes |
| ------- | ----- |
| ARGON2 password scheme | Support for the ARGON2 password scheme was added. |
| SCRAM-SHA-1, SCRAM-SHA-256 | Support SASL mechanisms for outgoing connections. |
| X25519, X448 | [[plugin,mail-crypt]] and [[link,mail_crypt_fs_crypt]] now support these curves. |

#### LDAP Parameters

See [[link,auth_ldap]].

| Feature | Notes |
| ------- | ----- |
| `%{ldap_multi}` variable | Variable was added to LDAP configuration file to allow for fetching a multi-valued attribute. |

#### imapc_features Parameters

See [[setting,imapc_features]].

| Feature | Notes |
| ------- | ----- |
| `no-qresync` | Parameter was added. |

### Removed Features

#### Backends and Plugins

| Backend | Notes |
| ------- | ----- |
| checkpassword auth database | Use [[link,auth_lua]] instead. |
| Dict passdb & userdb driver | Use [[link,auth_lua]] instead. |
| Dict quota; Dirsize quota | These backends are removed. You should use [[link,quota_backend_count]] instead along with [[plugin,quota-clone]].<br /> Note that switching to quota count can cause all user's indexes to update, so reserve time for this. |
| imap-zlib plugin | The IMAP `COMPRESS` extension is now automatically enabled. |
| mailbox-alias plugin | Depending on the use case, replacement may be the [[setting,mailbox_special_use]] mailbox setting and/or [[link,sieve]] filters. |
| Memcached dict driver | Use [[link,dict_redis]] instead. |
| old-stats plugin | Use [[link,stats]] instead. `auth_stats` setting has been removed too. |
| shadow auth driver | Use [[link,auth_pam]] instead. |
| XZ Compression | You need to perform migration using a different compression format. With [[link,maildir]], you can try uncompressing all your mail and compressing them with another algorithm while Dovecot is not running. |
| zlib plugin | Use [[plugin,mail-compress]] with the [[setting,mail_compress_write_method]] setting instead. |

#### Settings

| Setting | Notes |
| ------- | ----- |
| `auth_debug` | Use [[setting,log_debug]] filter instead. Example: `log_debug=category=auth`. |
| `auth_default_realm` | Replaced by [[setting,auth_default_domain]]. |
| `auth_stats` | |
| `auth_worker_max_count` | Use [[link,service_configuration,service-specific process limit]]. |
| `dict_db_config` | Berkeley DB is not supported anymore. |
| `disable_plaintext_auth` | Replaced by [[setting,auth_allow_cleartext]]. |
| `imap_id_log` | Replaced by the [[event,imap_id_received]] event. |
| `login_access_sockets` | Use [[link,auth_lua]] instead. Dovecot will fail to start if this setting is present in configuration. |
| `push_notification_backend` | Use [[setting,push_notification_driver]] instead. |
| `quota_set` | |
| `sieve_dir` | See [[link,sieve_file]] and [[link,sieve_location]]. |
| `sieve_global_dir` | See [[link,sieve_file]] and [[link,sieve_location]]. |
| `sieve_global_path` | See [[link,sieve_file]] and [[link,sieve_location]]. |
| `sieve_vacation_max_subject_codepoints` | |
| `auth_policy_server_timeout_msecs` | See: [[link,auth_policy_configuration]]. |
| `mail_crypt_require_encrypted_user_key` | Replaced by [[setting,crypt_user_key_require_encrypted]], [[setting,crypt_user_key_password]] and [[setting,crypt_user_key_encryption_key]]. |
| `verbose_ssl` | Use [[setting,log_debug,category=ssl]] instead. |
| `mail_location` setting & `mail` userdb field | Split into multiple [[link,mail_location,mail_*]] settings. |
| `listescape` plugin | [[setting,mailbox_list_storage_escape_char]] setting. |
| `fts` | Replaced by [[setting,fts]] named filter. |
| `fts_autoindex_exclude` | Replaced by boolean property [[setting,fts_autoindex]], nested inside [[setting,mailbox]] blocks. Note that the values are inverted as compared to those in the old `fts_autoindex_exclude`. |
| `fts_decoder` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_script_socket_path]]. |
| `fts_solr` | Replaced by [[setting,fts_solr_url]], [[setting,fts_solr_batch_size]], [[setting,fts_solr_soft_commit]], and [[setting,http_client_rawlog_dir]] settings. |
| `fts_tika` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_tika_url]]. |
| `fts_language_config` | Renamed to [[setting,textcat_config_path]]. |
| `fts_languages` | Converted into [[setting,language]] blocks. |
| `fts_filters` | Split into [[setting,language_filters]], [[setting,language_filter_normalizer_icu_id]], [[setting,language_filter_stopwords_dir]]. |
| `fts_tokenizers` | Split into [[setting,language_tokenizers]], [[setting,language_tokenizer_address_token_maxlen]], [[setting,language_tokenizer_generic_algorithm]], [[setting,language_tokenizer_generic_token_maxlen]], [[setting,language_tokenizer_generic_wb5a]], [[setting,language_tokenizer_kuromoji_icu_id]], [[setting,language_tokenizer_kuromoji_split_compounds]], [[setting,language_tokenizer_kuromoji_token_maxlen]]. |
| `service_count` | Renamed to [[setting,service_restart_request_count]]. The default value is set to `unlimited`. Value `0` is now a configuration error. |

#### Other Features

| Feature | Notes |
| ------- | ----- |
| Dovecot director role | Replaced with the [Dovecot Pro Palomar architecture](https://doc.dovecotpro.com/). |
| Global ACL directory | Use [[link,acl_global_file]] instead. See [below](#use-global-acl-files-instead-of-global-acl-directories) for details on migration. |
| IMAP SETQUOTA command | Quota limits can no longer be modified using the IMAP SETQUOTA command. The `set_quota` setting has been removed. |
| IPC process | Has been merged to anvil. |
| OpenSSL support for older than 1.0.2 | Older versions are not supported anymore. |
| Sieve extensions: `notify`, `imapflags`, `vnd.dovecot.duplicate` | These deprecated Sieve extensions have been removed. |
| "size.virtual" index record | size.virtual field is no longer written to dovecot.index.cache file as it is duplicating vsize record in dovecot.index file. Reading of the field from old files is supported. |
| `ssl-parameters.dat` | This file is no longer converted automatically by config process, you need to set [[setting,ssl_dh_file]] setting if you need non-ECC Diffie-Hellman. |
| TCP wrapper support | Use [[link,auth_lua]] instead. |
| Weak password schemes | Weak password schemes are disabled by default; you need to use [[setting,auth_allow_weak_schemes]] to enable them. |
| Global ACL directory | See [ACLs](#acls) below. |

#### dict Proxy Parameters

See [[link,dict_proxy]].

| Parameter | Notes |
| --------- | ----- |
| `idle_msecs` | Deprecated dict proxy parameter. Use [[link,dict_idle_timeout]] setting instead. |
| `warn_slow_msecs` | Deprecated dict proxy parameter. Use [[link,dict_slow_warn]] setting instead. |

#### Cassandra Parameters

See [[link,sql_cassandra]].

| Parameter | Notes |
| --------- | ----- |
| Cassandra `ssl_verify=cert-dns` setting | Removed, as it was deprecated by Cassandra cpp-driver due to it being insecure against MITM attacks. |

### Changed Features

#### Settings

| Setting | Notes |
| ------- | ------- |
| [[setting,ssl]] | Connections from [[setting,login_trusted_networks]] are now also required to be SSL/TLS encrypted with the setting `ssl=required`. |
| [[setting,ssl_min_protocol]] | The `SSLv3` option was removed, as it is no longer secure. |

#### Default Settings

| Setting | Old Default | New Default | Notes |
| ------- | ----------- | ----------- | ----- |
| [[setting,imapc_features]] | Features "delay-login", "search", "fetch-headers", "fetch-bodystructure", "fetch-size" by default. Enable "acl" and "modseq" by default, if the remote server supports it. |
| [[setting,mail_cache_max_headers_count]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_cache_max_header_name_length]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_log_prefix]] | `%s(%u)<%{pid}><%{session}>:` | `%s(%u)<%{process:pid}><%{session}>:` | Uses new process key. |
| [[setting,mailbox_list_drop_noselect]] | `no` | `yes` | `\NoSelect` folders are now dropped by default. |
| `service/anvil/chroot` | empty | \<no value\> | Anvil is no longer chrooted. |
| `service/anvil/user` | $default_internal_user | \<no value\> | Anvil runs as root. |
| `service/auth-worker/process_limit` | 1 | 30 | |

#### Service Defaults

##### LMTP

Default LMTP proxy destination port is now `24`.

### Doveadm

#### doveadm batch

The `doveadm batch` command was removed.

#### doveadm fs

[[doveadm,fs put]] can now put metadata also.

#### doveadm indexer

Added [[doveadm,indexer]] command.

#### doveadm save

Added `-r received-date` parameter. See [[doveadm,save]].

#### dsync

The `dsync` command symlink was removed. Use [[doveadm,sync]] or
[[doveadm,backup]] commands directly instead.

#### Mailbox Commands

`USER` environment variable is no longer supported.

All mail commands require providing `-u`, `-F` or `-A` parameter.
This will always be subject to user database lookup and requires access to
auth userdb socket.

#### --no-userdb-lookup parameter

Added the `--no-userdb-lookup` parameter to doveadm mail commands.

### ACLs

#### Use Global ACL Files instead of Global ACL Directories

To migrate the ACL directories into their respective files you have to do the
following:

1. Create a new consolidated [[link,acl_global_file]].
2. For each subdirectory in the currently configured ACL directory, add a line
   starting with the mailbox name followed by the appropriate content.
3. Change the `vfile` parameter to the new ACL file.
4. Remove the old ACL directory parent.

##### Example

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

### Event Changes

#### Core Events

| Event | Change |
| ----- | ------ |
| `auth_client_cache_flush_started` | Event was removed. |
| `auth_client_cache_flush_finished` | Event was removed. |
| [[event,imap_id_received]] | Event was added. |
| [[event,login_aborted]] | Event was added. |
| [[event,mail_metadata_accessed]] | Event was added. |
| [[event,pop3_command_finished]] | Event was added. |

#### Event Fields

| Event | Field | Change |
| ----- | ----- | ------ |
| [[event,dns_worker_request_finished]] | `cached` | Field was added. |
| Mail user events | `service` | Field was added. |
| [[event,proxy_session_finished]] | `error_code` | Field was added. |
| [[event,proxy_session_finished]] | `idle_usecs` | Field was changed from `idle_secs`. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_host` | Field was added. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_ip` | Field was added. |
| [[event,sql_query_finished]] | `consistency` | Field was added. |
| [[event,sql_query_finished]] | `error_consistency` | Field was added. |
| Various | `net_bytes_in` | Field was changed from `bytes_in`. |
| Various | `net_bytes_out` | Field was changed from `bytes_out`. |
| Various | `transport` | `transport=trusted` was changed to `transport=secured`. See also [[link,secured_connections]]. |

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
