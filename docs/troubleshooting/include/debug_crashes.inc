Dovecot has been designed to crash rather than continue in a potentially
unsafe manner that could cause data loss. Most crashes usually happen just
once and retrying the operation will succeed, so usually even if you see
them it's not a big problem.

Of course, all crashes are bugs that should eventually be fixed, so feel
free to report them always even if they're not causing any visible problems.

Crashes appear in the logs like:

```
dovecot: Apr 23 11:16:05 Error: child 86116 (imap) killed with signal 11
```

Instead of crashing, there have been some rare bugs in Dovecot when some
process could go into infinite loop, which causes the process to use 100%
CPU.

If you detect such processes, it would be helpful to get a gdb backtrace
of the running process:

```sh
gdb -p pid-of-process
bt full
```

After getting the backtrace, you can `kill -9` the process.
