##########################
CentOS/RHEL8 mail location
##########################

When installing dovecot on CentOS8 or RHEL8, you might experience problems with writing into mail location.
This is due to several restrictions that need to be disabled.

SystemD restrictions
====================

The packages distributed with CentOS8 come with restrictive systemd unit files.
These restrictions are good from security perspective, yet the errors do not guide into the correct changes.

If you see log messages such as

.. code::

   dovecot: imap(test): Namespace '': mkdir(/home/mail/domain/test/Maildir) failed: Permission denied (euid=1005(vmail) egid=1005(vmail) missing +w perm: /home/mail/domain, UNIX perms appear ok (ACL/MAC wrong?))

You need to use ``systemctl edit dovecot`` to add following stanza

.. code::

  [Service]
  ReadWritePaths=/home/mail

And run ``systemctl daemon-reload``.

SELinux
=======

You can check ``/var/log/audit/audit.log`` for message such as

.. code::

  type=AVC msg=audit(1586604621.637:6736): avc:  denied  { write } for
  pid=12750 comm="imap" name="Maildir" dev="dm-3" ino=438370738 scontext=system_u:system_r:dovecot_t:s0 tcontext=unconfined_u:object_r:etc_runtime_t:s0 tclass=dir permissive=0 type=SYSCALL msg=audit(1586604621.637:6736): arch=c000003e syscall=83 success=no exit=-13 a0=55b493a7f338 a1=1ed a2=ffffffff a3=fffffffffffffcd8  items=0 ppid=12735 pid=12750 auid=4294967295 uid=1005 gid=1005 euid=1005 suid=1005 fsuid=1005 egid=1005 sgid=1005 fsgid=1005 tty=(none) ses=4294967295 comm="imap" exe="/usr/libexec/dovecot/imap"subj=system_u:system_r:dovecot_t:s0 key=(null)

If you see this, you need to relabel your mail location to ``mail_home_rw_t``.

.. code::

  chcon -R -t mail_home_rw_t /home/mail

To make this change permanent, you need to add new fcontext rule.

.. code::

   semanage fcontext --add --type mail_home_rw_t --range s0 /home/mail(/.*)?

After this, dovecot should be able to write into your mail location again.
