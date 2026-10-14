#### Snowball Stemmer Version Can Be Selected

Snowball 3.x changed the stems of some words compared to Snowball 2.2.0. After
upgrading the Snowball library, searches can't find some of the words in the
existing FTS indexes, unless the indexes are rebuilt.

Dovecot can now be built with `--with-stemmer-build`, which links statically
with Dovecot's Snowball fork. The fork contains both the Snowball 2.2.0 and
the Snowball 3.x stemmers. [[setting,language_filter_snowball_version]],
which exists only in such builds, selects which of them is used. The default `1` uses the Snowball 2.2.0 stems,
which are compatible with existing indexes built with Snowball 2.2.0.

| Setting | Notes |
| ------- | ----- |
| [[setting,language_filter_snowball_version]] | Setting was added. |
