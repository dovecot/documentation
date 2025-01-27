### Generic authentication metrics

`@metric_defaults = backend` contains:

`auth_successes`
:  Number of successful authentications. See [[event,auth_request_finished]].

`auth_failures`
:  Number of unsuccessful authentications. See [[event,auth_request_finished]].
   These are not usually expected to happen in backends. It may be useful to
   export these events into log:
   ```[dovecot.conf]
   metric auth_failures {
     exporter = log-export
   }
   ```

### Basic mail access and delivery metrics

`@metric_defaults = backend` contains:

`imap_commands`
:  Number of IMAP commands, grouped by OK/NO/BAD tagged reply.
   See [[event,imap_command_finished]].

`mail_deliveries`
:  Number of mails delivered. See [[event,mail_delivery_finished]].

`mail_submissions`
:  Number of mails submitted for outside delivery (e.g. rejects, vacations).
   See [[event,smtp_submit_finished]].

`mail_user_session_finished`
:  Number of mail sessions, including their RSS memory usage and user space
   CPU usage at the time when the session was finished. See
   [[event,mail_user_session_finished]].
