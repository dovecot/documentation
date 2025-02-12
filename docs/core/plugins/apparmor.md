---
layout: doc
title: apparmor
---

# AppArmor Plugin (`apparmor`)

[AppArmor](https://www.wikipedia.org/wiki/AppArmor) plugin, which
allows changing "hat" (apparmor context) when user is loaded. Context is
changed back to default on user deinit.

Multiple hats are supported and passed to
[`aa_change_hatv()`](https://gitlab.com/apparmor/apparmor/-/wikis/manpage_aa_change_hat.2)
function.

## Settings

<SettingsComponent plugin="apparmor" />

## Settings: Extra Fields

You can also specify hats from user or password database extra fields.

### Password Database
If you provide from [[link,passdb]], use `userdb_apparmor_hats=hat`.

### User Database
If you provide from [[link,userdb]], use `apparmor_hats=hat`.

## Sample Configuration

```[dovecot.conf]
mail_plugins {
  apparmor = yes
}

apparmor_hats = hat_name
```

## Debugging

Enable [[setting,log_debug]] to see context changes.
