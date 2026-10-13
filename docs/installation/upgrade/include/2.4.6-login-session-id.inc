#### Forwarded Session IDs Are Validated

[[changed,login_session_id_validated]] A session ID that a trusted proxy
forwards with the IMAP `ID` fields `x-session-id` / `x-session-ext-id`, or
with the `XCLIENT` field `SESSION=` (POP3, ManageSieve, Submission, LMTP),
is now validated: it must be printable ASCII and must not contain space,
`"` or `\`. Except for LMTP, it must also be 1 to 64 bytes: LMTP appends
`:P<n>` per proxy hop, so it accepts any length. See
[[link,forwarding_parameters]].

Previously only the length was checked, so a control character or an IMAP
quoted-special in the value reached the auth process, every log prefix of
the session and the next proxy hop. An invalid session ID now fails the
whole command, like the other invalid parameters: `BAD Invalid ID
parameters` (IMAP), `NO Error in MANAGESIEVE command received by server.`
(ManageSieve), `-ERR Invalid parameters` (POP3) or `501 5.5.4 Invalid
SESSION parameter` (Submission, LMTP). Two cases that previously succeeded
now fail as well:

 * POP3 and ManageSieve silently ignored a `SESSION=` value longer than 64
   bytes and accepted the rest of the `XCLIENT` command.
 * POP3 and ManageSieve accepted an empty `SESSION=` and used an empty
   session ID.

Dovecot proxies always forward valid session IDs, so only third-party
proxies that generate their own session IDs are affected.
