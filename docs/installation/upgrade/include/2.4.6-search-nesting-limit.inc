 * IMAP search queries (`SEARCH`, `UID SEARCH`, `SORT`, `THREAD` and the search
   arguments of `STORE` and `FETCH`) and [[doveadm,search]] queries are now
   rejected with `Too much nesting in search query` when the search keys are
   nested deeper than the process stack allows. The limit is derived from
   `RLIMIT_STACK` and is 1024 levels with the common 8 MB default stack, so
   normal clients are unaffected. See
   [[link,imap_search_nesting_limit]] for how to raise it.
