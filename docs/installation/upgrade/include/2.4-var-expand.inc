#### Variable expansion

A new [[link,settings_variables]] syntax has been introduced.
All old one-letter %variables have been removed,
and some old variable aliases have been dropped too.

The new syntax uses `|` character for "filters" which can be chained.
This is why some of the old variables have been replaced by filters.
For example the old `%d` variable is now `%{user | domain}`, which gets
the "user" variable and applies the "domain" filter for it.

##### List of common short variables and their replacements.

| Old variable | New syntax |
| -------- | ---------- |
| `%a` | `%{local_port}` |
| `%b` | `%{remote_port}` |
| `%c` | `%{secured}` |
| `%d` | `%{user \| domain }` |
| `%h` | `%{home}` |
| `%l` | `%{local_ip }` |
| `%m` | `%{mechanism}` |
| `%n` | `%{user \| username }` |
| `%p` | `%{client_pid }` |
| `%r` | `%{remote_ip }` |
| `%s` | `%{protocol}` |
| `%u` | `%{user}` |
| `%w` | `%{password}` |

##### Common modifier syntaxes and their replacements.

| Old syntax | New syntax |
| ---------- | ---------- |
| `%1Mu` | `%{user \| md5 \| hexlify(1)}` |
| `%2.1Mu` | `%{user \| md5 \| hexlify \| substr(2,1)}` |
| `%2.256N` | `%{ user \| md5 \| substr(0, 8) % 256 \| hex(2)}` |
| `%256Nu` | `%{ user \| md5 \| substr(0, 8) % 256 \| hex}` |
| `%Hu` | No conversion available, use one of the syntaxes. |
| `%Ln` | `%{user \| username \| lower }` |
| `%Lu` | `%{user \| lower }` |
| `%Mu` | `%{user \| md5}` |

##### Common long variables and their replacements.

| Old variable | New syntax |
| ------------ | ------------ |
| `%{auth_domain}` | `%{auth_user \| domain}` |
| `%{auth_username}` | `%{auth_user \| username}` |
| `%{lip}` | `%{local_ip}` |
| `%{lport}` | `%{local_port}` |
| `%{mech}` | `%{mechanism}` |
| `%{orig_domain }` | `%{original_user \| domain }` |
| `%{orig_username}` | `%{original_user \| username }` |
| `%{orig_user}` | `%{original_user}` |
| `%{real_lip}` | `%{real_local_ip}` |
| `%{real_lport}` | `%{real_local_port }` |
| `%{real_rip}` | `%{real_remote_ip }` |
| `%{real_rport}` | `%{real_remote_port}` |
| `%{rip}` | `%{remote_ip}` |
| `%{rport}` | `%{remote_port }` |
| `%{service}` | `%{protocol}` |

##### Shared namespace variables

Previously `%%u`, `%%n` and `%%d` could be used in shared namespace
configuration.

These were changed for the [[setting,namespace_prefix]]:

| Old variable | New syntax |
| ------------ | ---------- |
| `%%u` | `$user` |
| `%%n` | `$username` |
| `%%d` | `$domain` |

For other settings, such as [[setting,mail_path]]:

| Old variable | New syntax |
| ------------ | ---------- |
| `%%u` | `%{owner_user}` |
| `%%n` | `%{owner_user \| username}` |
| `%%d` | `%{owner_user \| domain}` |
| `%%h` | `%{owner_home}` |
