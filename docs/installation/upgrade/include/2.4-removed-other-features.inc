| Dovecot director role | Replaced with the [Dovecot Pro Palomar architecture](https://doc.dovecotpro.com/). |
| Global ACL directory | Use [[setting,acl]] instead. See [below](#use-acl-settings-instead-of-global-acl-directories-or-global-acl-file) for details on migration. |
| IMAP SETQUOTA command | Quota limits can no longer be modified using the IMAP SETQUOTA command. The `set_quota` setting has been removed. |
| IPC process | Has been merged to anvil. |
| OpenSSL support for older than 1.0.2 | Older versions are not supported anymore. |
| Sieve extensions: `notify`, `imapflags`, `vnd.dovecot.duplicate` | These deprecated Sieve extensions have been removed. |
| `ssl-parameters.dat` | This file is no longer converted automatically by config process, you need to set [[setting,ssl_server_dh_file]] setting if you need non-ECC Diffie-Hellman. |
| TCP wrapper support | Use [[link,auth_lua]] instead. |
| Weak password schemes | Weak password schemes are disabled by default; you need to use [[setting,auth_allow_weak_schemes]] to enable them. |
| `local_name "multiple names" { ... }` | List each name as a separate `local_name { ... }` |

#### Cassandra Parameters

See [[link,sql_cassandra]].

| Parameter | Notes |
| --------- | ----- |
| Cassandra `ssl_verify=cert-dns` setting | Removed, as it was deprecated by Cassandra cpp-driver due to it being insecure against MITM attacks. |
