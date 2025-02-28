The main purpose of login processes is to handle the [[link,imap_server]],
[[link,pop3_server]], [[link,submission_server]], and
[[link,managesieve_server]] connections before the user
has logged in.

The login processes don't need to be able to do anything else
than let the user log in, so they can run in highly restricted environment. By
default they are run as a non-privileged `dovenull` user chrooted into a
non-writable directory containing only authentication UNIX sockets.

Login processes also handle proxying the SSL and TLS connections even after the
user has logged in. This way all the SSL code runs in the same restricted
environment, which means that a security hole in the SSL library gives the
attacker access only to the restricted chroot, rather than possibly all the
users' mails.
