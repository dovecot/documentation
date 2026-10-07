 * `shutdown_clients` was replaced by [[setting,service_shutdown_clients_timeout]],
   which also allows everything in between its two endpoints:
   `shutdown_clients=yes` becomes `service_shutdown_clients_timeout=0` and
   `shutdown_clients=no` becomes `service_shutdown_clients_timeout=infinite`.
   The conversion is done automatically as long as
   [[setting,dovecot_config_version]] is older than this release. A reload
   keeps the existing client sessions running for that long, e.g. to take new
   SSL certificates into use without disconnecting anyone.
 * When the timeout expires - or right away, with the default `0` - the
   processes disconnect all their remaining clients, also the ones that are
   in the middle of a command, and the login processes abort the logins that
   are still in progress. Previously `shutdown_clients=yes` kept an IMAP
   session running until the client had been idle for 10 seconds, or for 30
   seconds if it never was, and the other services waited for up to 30
   seconds for the clients to disconnect by themselves.
 * Only the processes of [[setting,service_type,client]] and
   [[setting,service_type,login]] services keep serving their clients across a
   reload. The internal services are always replaced by it, so their old
   processes are stopped regardless of the timeout - otherwise they would pile
   up with every reload.
 * The services whose processes serve externally visible client connections
   have [[setting,service_type]] `client` now: `imap`, `pop3`, `submission`,
   `imap-hibernate`, `imap-urlauth`, `imap-urlauth-worker`, `managesieve` and
   `doveadm`. `lmtp` is left out on purpose, because an MTA can keep an idling
   LMTP connection open for a long time, which would then keep the old
   generation's processes running. The previous default isn't preserved for
   older [[setting,dovecot_config_version]] values, because the type only
   tells the master process how the service's processes are to be treated.
 * A custom `service { .. }` block that relied on `shutdown_clients=no` needs
   `type = client` added to it. Without it the reload stops the service's old
   processes in spite of the converted timeout.
