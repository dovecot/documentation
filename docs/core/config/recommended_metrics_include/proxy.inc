`@metric_defaults = proxy` contains:

`auth_successes`
:  Number of successful authentications. See [[event,auth_request_finished]].

`auth_failures`
:  Number of unsuccessful authentications. See [[event,auth_request_finished]].
   It may be useful to export these events into log:
   ```[dovecot.conf]
   metric auth_failures {
     exporter = log-export
   }
   ```

`login_aborted`
:  Number of aborted logins, grouped by reason. See [[event,login_aborted]].
