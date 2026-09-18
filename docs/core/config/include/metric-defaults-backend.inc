```doveconf[dovecot.conf]
  metric auth_successes {
    filter = event=auth_request_finished AND success=yes
  }
  metric auth_failures {
    filter = event=auth_request_finished AND NOT success=yes
  }
  metric imap_commands {
    filter = event=imap_command_finished
    group_by tagged_reply_state {
    }
  }
  metric mail_deliveries {
    filter = event=mail_delivery_finished
  }
  metric mail_submissions {
    filter = event=smtp_submit_finished
  }
  metric mail_user_session_finished {
    filter = event=mail_user_session_finished
    fields = rss utime
  }
```
