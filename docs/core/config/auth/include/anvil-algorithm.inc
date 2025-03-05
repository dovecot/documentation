- First auth failure reply will be delayed for 2 seconds (this happens
  even without auth penalty)

  - `AUTH_PENALTY_INIT_SECS` in `src/auth/auth-penalty.h`

- The delay will be doubled for 4 -> 8 seconds, and then the upper
  limit of 15 seconds is reached.

  - `AUTH_PENALTY_MAX_SECS` and `AUTH_PENALTY_MAX_PENALTY` in
    `src/auth/auth-penalty.h`

- If the IP is in [[setting,login_trusted_networks]] (e.g. webmail), skip any
  authentication penalties

- If the username+password combination is the same as one of the last
  10 login attempts, skip increasing authentication penalty.

  - `CHECKSUM_VALUE_PTR_COUNT` in `src/anvil/penalty.c`

  - The idea is that if a user has simply configured the password
    wrong, it shouldn't keep increasing the delay.

  - The username+password is tracked as the CRC32 of them, so there is
    a small possibility of hash collisions
