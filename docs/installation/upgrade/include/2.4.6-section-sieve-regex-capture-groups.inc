#### Sieve :regex Capture Groups

A Sieve `:regex` key can now have at most 100 capture groups. A key with more
groups fails with `invalid regular expression '<pattern>' for regex match:
too many capture groups (maximum 100)`. Without the `variables` extension only
named groups count towards the limit.

 * Whenever a script with such a key is compiled, the whole script is
   rejected. Uploading it and `sievec` fail. At delivery a script is compiled
   whenever its binary is missing or stale, which is the normal case for a
   global script that was never pre-compiled with `sievec`. The rest of the
   script sequence is then not run and the mail gets the implicit keep.
 * A valid binary compiled before the upgrade is not recompiled. The key is
   then checked on every delivery: the error is logged, the test does not
   match and the delivery proceeds. With `body :regex` the key used to match,
   so the test can now take the other branch.
 * Only keys written as string literals are checked when compiling. A key
   built from a variable is checked on delivery.

To get under the limit, change the groups that do not need to be captured
into non-capturing groups: `(?:...)`.

Other changes:

 * A `:regex` match that sets no capture group, because the pattern has none
   or none of them took part, now sets `${0}` to the whole match and replaces
   the match values of an earlier match. Previously the earlier values stayed
   in place, so `${1}` could still return a group of a previous match.
 * With the `variables` extension, the group limit no longer rejects a key with
   exactly 100 capture groups. Previously it reported no match. Matching 100
   consecutive capture groups can still exceed the matching depth limit. The
   test then does not match, and nothing is logged.
 * With `variables`, a key that needs capture groups, such as the
   back-reference in `"(a)\\1"`, now compiles. Previously uploading it failed
   and `body :regex` never matched it. Without `variables` it still fails.
