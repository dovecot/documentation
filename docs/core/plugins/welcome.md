---
layout: doc
title: welcome
---

# Welcome (welcome) Plugin

Call a script when the user logs in for the first time. This is specifically
done when the INBOX is (auto)created. The scripts are called similarly to
[[link,quota_warning_scripts]].

## Settings

<SettingsComponent plugin="welcome" />

## Example Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins welcome

plugin {
  welcome_script = welcome %u
  welcome_wait = no
}

service welcome {
  executable = script /usr/local/bin/welcome.sh
  user = dovecot
  unix_listener welcome {
    user = vmail
  }
}
```
