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

`proxy_session_established`
:  [[added,metric_defaults_proxy_session_established_added]] Number of
   successful proxy sessions. This can be used to see post-authentication
   latency until session is logged into a backend. See
   [[event,proxy_session_established]].
