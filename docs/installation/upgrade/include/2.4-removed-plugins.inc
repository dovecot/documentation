#### Backends and Plugins

| Backend | Notes |
| ------- | ----- |
| checkpassword auth database | Use [[link,auth_lua]] instead. |
| Dict passdb & userdb driver | Use [[link,auth_lua]] instead. |
| Dict quota; Dirsize quota | These drivers are removed. You should use [[link,quota_driver_count]] instead along with [[plugin,quota-clone]].<br /> Note that switching to quota count can cause all users' indexes to update, so reserve time for this. |
| imap-zlib plugin | The IMAP `COMPRESS` extension is now automatically enabled. |
| listescape plugin | Use [[setting,mailbox_list_storage_escape_char]] instead. |
| mailbox-alias plugin | Depending on the use case, replacement may be the [[setting,mailbox_special_use]] mailbox setting and/or [[link,sieve]] filters. |
| Memcached dict driver | Use [[link,dict_redis]] instead. |
| old-stats plugin | Use [[link,stats]] instead. `auth_stats` setting has been removed too. |
| shadow auth driver | Use [[link,auth_pam]] instead. |
| XZ Compression | You need to perform migration using a different compression format. With [[link,maildir]], you can try uncompressing all your mail and compressing them with another algorithm while Dovecot is not running. |
| zlib plugin | Use [[plugin,mail-compress]] with the [[setting,mail_compress_write_method]] setting instead. |
