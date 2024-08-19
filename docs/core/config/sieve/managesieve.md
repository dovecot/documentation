---
layout: doc
title: ManageSieve
dovecotlinks:
  managesieve: ManageSieve
  managesieve_server: ManageSieve server
---

# ManageSieve Server

The ManageSieve ([[rfc,5804]]) service is used to manage a user's
[[link,sieve]] script collection.

It has the following advantages over doing it directly via filesystem:

* No need to let users log in via FTP/SFTP/etc, which could be difficult
  especially with virtual users.
* ManageSieve is a standard protocol ([[rfc,5804]]), so users can manage
  their scripts using (hopefully) user-friendly ManageSieve
  clients. Many webmails already include a ManageSieve client.
* Scripts are compiled before they are installed, which guarantees that the
  uploaded script is valid. This prevents a user from inadvertently installing
  a broken Sieve script.

## Configuration

::: warning
If you have used the Sieve plugin before and you have
`.dovecot.sieve` files in user directories, you are advised to **make
a backup first**. Although the ManageSieve daemon takes care to move
these files to the Sieve storage before it is substituted with a
symbolic link, this is not a very well tested operation, meaning that
there is a possibility that existing Sieve scripts get lost.
:::

The ManageSieve configuration consists of ManageSieve protocol settings
and [[link,sieve]]-related settings.

The Sieve interpreter settings are shared with settings of the [[link,sieve]],
for Dovecot's [[link,lda]] and [[link,lmtp]].

First, the ManageSieve protocol settings are outlined and then the
relevant Sieve settings are described.

### Protocol Configuration

Along with all other binaries that Dovecot uses, the `managesieve` and
`managesieve-login` binaries are installed during `make install` of 
[[link,sieve_installation]]. The only thing you need to do to activate the
ManageSieve protocol support in Dovecot is to add `sieve` to the
[[link,service_protocol]].

The managesieve daemon will listen on port 4190 by default.

### Settings

As the implementation of the managesieve daemon is largely based on the
original IMAP implementation, it is very similar in terms of configuration.
In addition to most mail daemon config settings, the managesieve daemon
accepts a few more. The following settings can be configured in the
`protocol sieve` section:

<SettingsComponent tag="managesieve" level="3" />

### Sieve Interpreter Configuration

The part of the [[link,sieve]] configuration that is relevant
for ManageSieve mainly consists of the settings that specify where the
user's scripts are stored and where the active script is located.

The ManageSieve service primarily uses the following Sieve interpreter
setting in the `plugin` section of the Dovecot configuration:

[[setting,sieve,file:~/sieve;active=~/.dovecot.sieve]]

This specifies the [[link,sieve_location]] where the scripts that are
uploaded through ManageSieve are stored.

### Quota Support

By default, users can manage an unlimited number of Sieve scripts on the
server through ManageSieve. However, ManageSieve can be configured to
enforce limits on the number of personal Sieve scripts per user and/or
the amount of disk storage used by these scripts.

The maximum size of individual uploaded scripts is dictated by the
configuration of the [[link,sieve]].

The limits are configured in the `plugin` section of the Dovecot
configuration:

<SettingsComponent tag="managesieve_quota" level="3" />

### Examples

The following provides example configurations for ManageSieve in
`dovecot.conf`. Only sections relevant to ManageSieve and the Sieve plugin
are shown.

```
...
service managesieve-login {
  #inet_listener sieve {
  #  port = 4190
  #}

  #inet_listener sieve_deprecated {
  #  port = 2000
  #}

  # Number of connections to handle before starting a new process. Typically
  # the only useful values are 0 (unlimited) or 1. 1 is more secure, but 0
  # is faster.
  #service_count = 1

  # Number of processes to always keep waiting for more connections.
  #process_min_avail = 0

  # If you set service_count=0, you probably need to grow this.
  #vsz_limit = 64M
}

service managesieve {
  # Max. number of ManageSieve processes (connections)
  #process_limit = 1024
}

# Service configuration

protocol sieve {
  # Maximum ManageSieve command line length in bytes. ManageSieve usually does
  # not involve overly long command lines, so this setting will not normally
  # need adjustment
  #managesieve_max_line_length = 65536

  # Maximum number of ManageSieve connections allowed for a user from each
  # IP address.
  # NOTE: The username is compared case-sensitively.
  #mail_max_userip_connections = 10

  # Space separated list of plugins to load (none known to be useful so far).
  # Do NOT try to load IMAP plugins here.
  #mail_plugins =

  # MANAGESIEVE logout format string:
  #  %i - total number of bytes read from client
  #  %o - total number of bytes sent to client
  #managesieve_logout_format = bytes=%i/%o

  # To fool ManageSieve clients that are focused on CMU's timesieved you can
  # specify the IMPLEMENTATION capability that the dovecot reports to clients.
  # For example: 'Cyrus timsieved v2.2.13'
  #managesieve_implementation_string = Dovecot Pigeonhole

  # Explicitly specify the SIEVE and NOTIFY capability reported by the server
  # before login. If left unassigned these will be reported dynamically
  # according to what the Sieve interpreter supports by default (after login
  # this may differ depending on the user).
  #managesieve_sieve_capability =
  #managesieve_notify_capability =

  # The maximum number of compile errors that are returned to the client
  # upon script upload or script verification.
  #managesieve_max_compile_errors = 5
}


plugin {
  # Used by both the Sieve plugin and the ManageSieve protocol
  sieve = file:~/sieve;active=~/.dovecot.sieve
}
```

### Proxy

Like Dovecot's imap server, the ManageSieve login daemon supports proxying to
multiple backend servers. The [[link,authentication_proxies]] page
for POP3 and IMAP applies automatically to ManageSieve as well.

## Troubleshooting

Like Dovecot itself, **the ManageSieve service always logs a detailed
error message** if something goes wrong at the server (refer to
[[link,logging]] for more details): the logs are the first place to look if
you suspect something is wrong.

To get additional debug messages in your log file, you should set
[[setting,log_debug,category=sieve]] in `dovecot.conf` (inside
`protocol sieve {...}` if you want to enable this for ManageSieve
only).

If the client commits protocol violations or sends invalid scripts, an
error response is provided to the client which is not necessarily logged
on the server. A good ManageSieve client presents such error messages to
the user.

Keep in mind that the ManageSieve service only provides the Sieve
*protocol*, which may be somewhat confusing. This protocol can only be
used to *upload* Sieve scripts and *activate* them for execution.
Performing the steps below therefore only verifies that this
functionality is working and **not** whether Sieve scripts are correctly
being executed upon delivery.

The execution of Sieve scripts is performed by the [[link,lda]] or
[[link,lmtp]] using the [[plugin,sieve]].

If you have problems with Sieve script execution upon delivery, see
[[link,sieve_troubleshooting]].

### Manual Login and Script Upload

If you fail to login or upload scripts to the server, it is not
necessarily caused by Dovecot or your configuration. It is often best to
test your ManageSieve server manually first. This also provides you with
the direct error messages from the server without intermission of your
client.

If you do not use TLS, you can connect using a simple `telnet`
or `netcat` connection to the configured port (typically 4190 or 2000
for older setups). Otherwise you must use a TLS-capable text protocol
client like `gnutls-cli` as described below.

Upon connection, the server presents the initial greeting with its
capabilities:

```
"IMPLEMENTATION" "dovecot"
"SASL" "PLAIN"
"SIEVE" "comparator-i;ascii-numeric fileinto reject vacation imapflags notify include envelope body relational regex subaddress copy"
"STARTTLS"
OK "Dovecot ready."
```

Note that the reported `STARTTLS` capability means that the server
accepts TLS, but, since you are using telnet/netcat, you cannot use this
(refer to Manual TLS Login below). The `SASL` capability lists the
available SASL authentication mechanisms. If this list is empty and
`STARTTLS` is available, it probably means that the server forces you
to initiate TLS first (as dictated by [[setting,auth_allow_cleartext,yes]]
in `dovecot.conf`).

Now you need to log in. Although potentially multiple SASL mechanisms
are available, only `PLAIN` is described here. Authentication is
performed using the ManageSieve `AUTHENTICATE` command. This command
typically looks as follows when the `PLAIN` mechanism is used:

```
AUTHENTICATE "PLAIN" "<base64-encoded credentials>"
```

The credentials are the base64-encoded version of the string
`"\0<username>\0<password"` (in which `\0` represents the ASCII NUL
character). Generating this is cumbersome and a bit daunting for the
novice user, so for convenience a
[simple Perl script](http://pigeonhole.dovecot.org/utilities/sieve-auth-command.pl)
is provided to generate the `AUTHENTICATE` command for you. It is used
as follows:

```sh
sieve-auth-command.pl <username> <password>
```

The command is written to stdout and you can paste this to your protocol
session, e.g.:

```
AUTHENTICATE "PLAIN" "<base64-encoded credentials>"
OK "Logged in."
```

Now that you are logged in, you can upload a script. This is done using
the `PUTSCRIPT` command. Its first argument is the name for the script
and its second argument is a string literal. A string literal starts
with a length specification `'{<bytes>+}'` followed by a newline.
Thereafter the server expects `<bytes>` bytes of script data. The
following uploads a trivial 6 byte long sieve script that keeps every
message (6th byte is the newline character):

```
PUTSCRIPT "example" {6+}
keep;
OK "Putscript completed."
```

Upon successful upload, you should find a file called
`example.sieve` in your sieve directory. The script should
also be listed by the server as follows when the `LISTSCRIPTS` command
is issued:

```
LISTSCRIPTS
"example"
OK "Listscripts completed."
```

You can check whether your script is uploaded correctly by downloading
it using the `GETSCRIPT` command. This command accepts the name of the
downloaded script as its only parameter:

```
GETSCRIPT "example"
{6}
keep;
OK "Getscript completed."
```

To let the Sieve plugin use your newly uploaded script, you must
activate it using the `SETACTIVE` command (only one script can be
active at any time). The active script is indicated `ACTIVE` in the
`LISTSCRIPTS` output, e.g.:

```
SETACTIVE "example"
OK "Setactive completed."
LISTSCRIPTS
"example" ACTIVE
OK "Listscripts completed.
```

The symbolic link configured with the `sieve` setting should now point
to the activated script in the sieve directory. If no script is
active, this symbolic link is absent.

#### Manual TLS Login
----------------

When TLS needs to be used during manual testing, `gnutls-cli` provides
the means to do so. This command-line utility is part of the GNUTLS
distribution and on most systems this should be easy to install. It is
used to connect to ManageSieve as follows:

```sh
gnutls-cli --starttls -p <port> <host>
```

This starts the client in plain text mode first. As shown in the
previous section, the server presents a greeting with all capabilities
of the server. If `STARTTLS` is listed, you can issue the `STARTTLS`
command as follows:

```
STARTTLS
OK "Begin TLS negotiation now."
```

If an OK response is given by the server you can press `Ctrl-D` to
make `gnutls-cli` start the TLS negotiation. Upon pressing `Ctrl-D`,
`gnutls-cli` will show information on the negotiated TLS session and
finally the first response of the server is shown:

```
"IMPLEMENTATION" "dovecot"
"SASL" "PLAIN"
"SIEVE" "comparator-i;ascii-numeric fileinto reject vacation imapflags notify include envelope body relational regex subaddress copy"
OK "TLS negotiation successful."
```

Hereafter, you can continue to authenticate and upload a script as
described in the previous section.

### Client Problems

See [[link,rawlog]] for details how to log client-server traffic.

Refer to the [client issues](#client-issues) for information on known
client problems.

### Known Server Issues and Protocol Deviations

- The ANONYMOUS authentication mechanism is currently not supported and
  explicitly denied.

## Client Issues

Although this ManageSieve server should comply with the RFC
specification of the ManageSieve protocol, quite a few clients don't.
This page lists the known client problems.

### The TLS problem

The core of the TLS problem is that a ManageSieve server is required
to send an unsolicited CAPABILITY response right after successful TLS
negotiation. Older Cyrus servers did not do this and many clients
incorporated this protocol error as the standard, meaning that these
do not expect the CAPABILITY response and thus fail with subsequent
commands. However, now that Cyrus' Timsieved has changed its
behaviour towards protocol compliance, all those clients will follow
eventually.

### Smartsieve, Websieve

These clients are specifically written for Cyrus timsieved and fail
on multiple stages of the protocol when connected to Pigeonhole
ManageSieve. See:

 - https://sourceforge.net/projects/websieve/
 - https://github.com/secnextechnologies/WebSieve
 - https://smartsieve.sourceforge.net/


### Ruby/Managesieve

Ruby command line client and library to managesieve works fine.
See https://rubygems.org/gems/ruby-managesieve/versions/0.4.0

### Ruby/Sieve-Parser

Ruby library for sieve parsing, see
https://rubygems.org/gems/sieve-parser/versions/0.0.4.
