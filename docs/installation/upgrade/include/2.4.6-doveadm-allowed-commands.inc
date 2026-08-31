#### Removed Settings

| Setting | Notes |
| ------- | ----- |
| `doveadm_allowed_commands` | The setting only matched the command name, while the commands it was typically used to allow already gave full access to any user's mails. Dovecot fails to start if this setting is present in the configuration. Give doveadm server access only to trusted clients. |

The [[link,doveadm_http_api]] no longer returns the `403` HTTP response code,
which was used only for commands rejected by this setting.
