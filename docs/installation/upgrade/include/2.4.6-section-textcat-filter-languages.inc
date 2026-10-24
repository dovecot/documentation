#### Language Detection Uses Only the Configured Languages

FTS language detection now uses only the textcat fingerprints of the
languages listed in [[setting,language]], instead of all the languages in the
textcat configuration file. This makes language detection much faster: e.g.
with two configured languages the detection is about 10 times faster than
with the 180 fingerprints in the default libexttextcat configuration. Creating
a minimal textcat configuration file with [[setting,textcat_config_path]] is
no longer necessary.

Text in a language that isn't configured is now detected as the closest
configured language. Previously such text was usually detected as an unknown
language, which used the default language (see [[setting,language_default]]).
Set [[setting,textcat_filter_languages,no]] to keep the old behavior. The
setting defaults to `no` as long as [[setting,dovecot_config_version]] is
older than this release.

| Setting | Notes |
| ------- | ----- |
| [[setting,textcat_filter_languages]] | Setting was added. |
