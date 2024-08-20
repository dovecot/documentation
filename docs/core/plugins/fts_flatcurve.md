---
layout: doc
title: fts-flatcurve
---

# Dovecot Flatcurve FTS Plugin (`fts-flatcurve`)

[[added,fts_flatcurve]]

This is a Dovecot FTS plugin to enable message indexing using the
[Xapian](https://xapian.org/) Open Source Search Engine Library.

::: warning
Requires Xapian 1.4+.
:::

The plugin relies on Dovecot to do the necessary stemming. It is intended
to act as a simple interface to the Xapian storage/search query
functionality.

This driver supports match scoring and substring matches (on by default),
which means it is [[rfc,3501]] (IMAP4rev1) compliant. This driver does not
support fuzzy searches.

The driver passes all of the
[ImapTest search tests](https://github.com/dovecot/imaptest/).

::: tip
This plugin requires the [[plugin,fts]] to be activated and configured
:::

Enabling flatcurve is designed to be as easy as adding this to configuration:

```[dovecot.conf]
mail_plugins = $mail_plugins fts fts_flatcurve

plugin {
  fts = flatcurve
}
```

## Settings

::: tip
The default settings should be fine in most scenarios.
:::

<SettingsComponent plugin="fts-flatcurve" />

## Configuration Example

```[dovecot.conf]
mail_plugins = $mail_plugins fts fts_flatcurve

plugin {
  fts = flatcurve

  # Maximum email-address token size (254) is larger than Xapian can handle,
  # so we will need to truncate at some level. It is doubtful that large
  # email-addresses are useful for search purposes, so this optional config
  # will prevent these large addresses (more than 100 bytes) from being
  # stored.
  #fts_tokenizers = generic email-address
  #fts_tokenizer_email_address = maxlen=100

  # All of these are optional, and indicate the default values.
  # They are listed here for documentation purposes; most people should
  # not need to define/override in their config.
  fts_flatcurve_commit_limit = 500
  fts_flatcurve_max_term_size = 30
  fts_flatcurve_min_term_size = 2
  fts_flatcurve_optimize_limit = 10
  fts_flatcurve_rotate_count = 5000
  fts_flatcurve_rotate_time = 5000
  fts_flatcurve_substring_search = no
}
```

## Data Storage

Xapian search data is stored separately for each mailbox.

The data is stored under a 'fts-flatcurve' directory in the Dovecot index
file location for the mailbox.  The Xapian library is responsible for all
data stored in that directory - no Dovecot code directly writes to any file.

## Logging/Events

::: info
This plugin emits with category `fts-flatcurve`, a child of the category `fts`
(see [[link,event_design]]).
:::

<EventsComponent root="fts-flatcurve" />
