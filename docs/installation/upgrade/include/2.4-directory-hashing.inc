
#### Directory hashing

If you have been using `/home/%2.256N/%u` or similar constructs:

* How to replace `%N` in new format:

  * `%2.256Nu` becomes `%{ user | md5 | substr(0, 8) % 256 | hex(2)}` to return maximum 256 different hashes in range `00..ff`.

  * `%256Nu` becomes `%{ user | md5 | substr(0, 8) % 256 | hex}` to return maximum 256 different hashes in range `0..ff` (without 0-padding in the front).

* How to replace '%M' in new format:

  * `%1Mu/%2.1Mu/%u` becomes `%{user | md5 | hexlify(1)}/%{user | md5 | hexlify | substr(2,1)}/%{user}` to returns directories from `0/0/user` to
    `f/f/user`.

* There is no way to use '%H' anymore.
