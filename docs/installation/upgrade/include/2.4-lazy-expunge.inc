#### Lazy expunge plugin

[[plugin,lazy-expunge]] no longer supports a namespace as the expunge
destination, so the folder hierarchy is no longer preserved by default.
[[setting,lazy_expunge_mailbox]] names a single destination mailbox, which
v2.3 already supported as well.

The destination can still be varied, or disabled, per namespace or mailbox to
keep the hierarchy, see [[link,lazy_expunge_hierarchy]]. Mails already in the
old lazy-expunge namespace are not migrated; move them manually if they must
stay recoverable.
