#### Doveadm `-A` Parameter Removed

The `-A` (all users) parameter and wildcard support in the `-u` parameter
were removed from doveadm mail commands. They made destructive mistakes too
easy, e.g. `doveadm mailbox delete -A Junk` or an unquoted shell glob in `-u`.
The `-u` parameter now always uses the given username as-is, so `*` and `?`
are treated as literal characters.

Running a mail command for multiple users is now done only with `-F <file>`,
which reads one username per line. `-F -` reads the usernames from stdin.
Use [[doveadm,user]] with a user mask to list the users:

```sh
# Previously: doveadm expunge -A mailbox Trash savedbefore 30d
doveadm user '*' | doveadm expunge -F - mailbox Trash savedbefore 30d

# Previously: doveadm mailbox list -u '*@example.com'
doveadm user '*@example.com' | doveadm mailbox list -F -
```

The list can also be written to a file first, which allows checking it before
running the command:

```sh
doveadm user '*' >users.txt
doveadm expunge -F users.txt mailbox Trash savedbefore 30d
```

Note the following differences:

 * With `-A` a userdb iteration failure caused the command to log
   `Failed to iterate through some users` and exit with code 75. With a pipe
   [[doveadm,user]] fails with `user listing failed`, but the mail command
   only sees the end of the user list and exits successfully after processing
   the users listed so far. Scripts (e.g. cron jobs) should use
   `set -o pipefail` or the two-step file approach to detect the failure.
 * `-F -` can't be used with commands that read their own input from stdin,
   i.e. [[doveadm,save]] and [[doveadm,sieve put]] without a file parameter.
   Use `-F <file>` with them instead.
 * `-F -` fails if stdin is a terminal, instead of waiting for input.
 * The [[link,doveadm_http_api]] `allUsers` parameter was removed. Use the
   `userFile` parameter instead. Its value contains the usernames directly,
   separated by newlines, e.g. `"userFile": "user1\nuser2\n"`.
 * [[doveadm,user]] with multiple user masks no longer prints each matching
   user multiple times.
