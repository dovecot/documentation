- It is still possible to do multiple auth lookups from the same IP in
  parallel.

- For IPv6 it currently blocks the entire /48 block, which may or may
  not be what is wanted.

  - `PENALTY_IPV6_MASK_BITS` in `auth-penalty.c`
