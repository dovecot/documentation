---
layout: doc
title: mail-compress
---

# Mail Compression (mail-compress) Plugin

This plugin can be used to read compressed mbox, maildir or dbox files. It
can also be used to write (via IMAP, [[link,lda]] and/or [[link,lmtp]])
compressed messages to [[link,dbox]] or [[link,maildir]] mailboxes.

## Settings and Supported Algorithms

<SettingsComponent plugin="mail-compress" />

## Example Configuration

```[dovecot.conf]
# Enable compression plugin globally for reading/writing:
mail_plugins = $mail_plugins mail_compress

# Enable these only if you want compression while saving:
plugin {
  mail_compress_save = zstd
  mail_compress_save_level = 3
}
```

## Interaction with Mailbox Formats

### mbox

Compressed mbox files can be accessed only as read-only. The compression is
detected based on the file name, so your compressed mboxes should end with .gz
or .bz2 extension. There is no support for compression during saving.

### dbox

Mails can be stored as compressed. Existing uncompressed mails can't currently
be directly compressed (or vice versa).

You could, however, use [[man,doveadm-sync]] to copy all mails to another
location (which saves them compressed) and then replace the original
location with the new compressed location. You can do this
by treating the operation the same as if you were migrating from one mailbox
format to another (see the dsync page examples).

### Maildir

When this plugin is loaded Dovecot can read both compressed and uncompressed
files from Maildir. The files within a Maildir can use any supported
compression algorithm (e.g., some can be compressed using gzip, while others
are compressed using zstd). The algorithm is detected by reading the first
few bytes from the file and figuring out if it's a valid compressed header.
The file name doesn't matter.

To avoid IMAP clients attempting to exploit security holes in the compression
algorithm libraries (e.g., bzlib) by writing specially crafted mails using
IMAP's APPEND command, Dovecot will not allow clients to save mails that are
detected as compressed.

All mails must have `,S=<size>` in their filename where \<size\> contains the
original uncompressed mail size, otherwise there will be problems with quota
calculation as well as other potential random failures. Note that if the
filename doesn't contain the `,S=<size>` before compression, adding it
afterwards changes the base filename and thus the message UID. The safest thing
to do is simply to not compress such files.

You should also preserve the file's mtime so INTERNALDATE doesn't change.

If you want to use dsync to convert to a compressed Maildir you may need `-o`
`maildir_copy_with_hardlinks=no` (this is set to yes by default and will
prevent compression).

## Compress Existing Mails

To compress existing mails, the supported way is to use local dsync migration.
See [[link,migrating_mailboxes]].

You'll probably want to use some cronjob to compress old mails. However note
that to avoid seeing duplicate mails in rare race conditions you'll have to use
the [maildirlock utility](https://github.com/dovecot/tools/blob/main/README.maildirlock). The idea is to:

1. Find the mails you want to compress in a single maildir.

   * Skip files that don't have `,S=<size>` in the filename.

2. Compress the mails to `tmp/`

   * Update the compressed files' mtimes to be the same as they were in the
     original files (e.g. touch command)

3. Run `maildirlock <path> <timeout>`. It writes PID to stdout, save it.

   * `<path>` is path to the directory containing Maildir's dovecot-uidlist
     (the control directory, if it's separate)
   * `<timeout>` specifies how long to wait for the lock before failing.

4. If maildirlock grabbed the lock successfully (exit code 0) you can continue.

5. For each mail you compressed:

   1. Verify that it still exists where you last saw it.
   2. If it doesn't exist, delete the compressed file. Its flags may have been
      changed or it may have been expunged. This happens rarely, so just let
	  the next run handle it.
   3. If the file does exist, `rename() (mv)` the compressed file over the
      original file.

Dovecot can now read the file, but to avoid compressing it again on the next
run, you'll probably want to rename it again to include e.g. a `Z` flag in the
file name to mark that it was compressed (e.g.
`1223212411.M907959P17184.host,S=3271:2,SZ`).

Remember that the [Maildir specifications](https://cr.yp.to/proto/maildir.html)
require that the flags are sorted by their ASCII value, although Dovecot
itself doesn't care about that.

Unlock the maildir by sending a TERM signal to the maildirlock process (killing
the PID it wrote to stdout).
