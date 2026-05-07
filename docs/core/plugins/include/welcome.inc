```doveconf[dovecot.conf]
mail_plugins {
  welcome = yes
}
welcome {
  execute welcome {
    args = %{user}
  }
  wait = yes
}

service welcome {
  executable = script /usr/local/bin/welcome.sh
  user = dovecot
  unix_listener welcome {
    user = vmail
  }
}
```
