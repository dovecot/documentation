 * Boolean settings no longer accept `y` or `1` as a value in the
   configuration. They were never documented, and only their true side ever
   worked - the matching `n` and `0` have always been errors. Use `yes` and
   `no` instead. Values that don't come from the configuration still accept
   them, so e.g. a [[link,userdb]] lookup can keep returning `mail_debug=y`.
