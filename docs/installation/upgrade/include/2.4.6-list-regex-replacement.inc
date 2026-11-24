 * The replacement of the var-expand
   [[link,settings_variables_filters,`regexp` filter]] now takes only `\0`
   for the whole match and `\1` to `\9` for the first nine capture groups. A
   `$` is a literal dollar, and `\0` to `\9` followed by a digit is that group
   followed by the digit. Previously the replacement also accepted `$1`,
   `${1}`, `$0`, `$&`, `$name` and `${name}`. They now stay in the output as
   text: `%{user | regexp('(.*)@.*', '$1')}` returned `john` for
   `john@example.com` and now returns `$1`. Likewise `$$` gave one dollar and
   now gives two, and `\10` was group 10 and is now group 1 followed by `0`.
   None of this gives an error, except that `\10` fails the expansion when
   group 1 did not take part in the match. The change shows when the setting
   is expanded, so `doveconf` does not report it. Groups above 9 and named
   groups have no `\N` equivalent: make the wanted group one of the first
   nine by changing the groups before it into non-capturing groups: `(?:...)`.
   Write the references as `\0` to `\9`, with the backslash doubled inside a
   string: `\\1`.
