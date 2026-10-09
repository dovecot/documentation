 * The [[link,fts_filter_configuration,`normalizer-icu` filter]] no longer uses
   libicu for the default [[setting,language_filter_normalizer_icu_id]] or its
   variants without `NFC` and/or `[\x20] Remove`. Other IDs now require the
   `lang_filter_normalizer_icu` module (`liblang_filter_normalizer_icu.so` in
   the Dovecot module directory), which links with libicu. Dovecot processes no
   longer load libicu and libstdc++ unless such an ID is used, which saves
   about 220 kB of memory per process. Packages may ship the module
   separately. With [[setting,mail_chroot]], such an ID requires loading the
   module via [[setting,mail_plugins]]:
   `mail_plugins { lang_filter_normalizer_icu = yes }`
