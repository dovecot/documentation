```doveconf[dovecot.conf]
  metric auth_successes {
    filter = event=auth_request_finished AND success=yes
  }
  metric auth_failures {
    filter = event=auth_request_finished AND NOT success=yes
  }
  metric login_aborted {
    filter = event=login_aborted
    group_by reason {
    }
  }
  metric proxy_session_established {
    filter = event=proxy_session_established
  }
```
