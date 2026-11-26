#### FTS Direct Autoindexing

[[setting,fts_autoindex]] was changed from a boolean to `no`, `yes` or
`direct`. The existing `yes` and `no` values work as before. The new `direct`
value indexes the newly added mails directly in the same process, instead of
asynchronously via the `indexer` service. This is mainly useful when migrating
mails with [[doveadm,sync]] or [[doveadm,backup]].

| Setting | Notes |
| ------- | ----- |
| [[setting,fts_autoindex]] | Setting value `direct` was added. |
