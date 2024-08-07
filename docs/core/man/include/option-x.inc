**-x** *auth_info*
:   *auth_info* specifies additional conditions for the **user**
    command. The *auth_info* option string has to be given as
    *name* **=** *value* pair. For multiple conditions the **-x**
    option could be supplied multiple times.

    Possible names for the *auth_info* are:

    **service**
    :   The service for which the userdb lookup should be tested. The
        value may be the name of a service, commonly used with Dovecot.
        For example: **imap**, **pop3** or **smtp**.

    **session**
    :   Session identifier.

    **lip**
    :   The local IP address (server) for the test.

    **rip**
    :   The remote IP address (client) for the test.

    **lport**
    :   The local port, e.g. 143

    **rport**
    :   The remote port, e.g. 24567

    **real_lip**
    :   The local IP to which the client connected on this host.

    **real_rip**
    :   The remote IP where client connected from to this host.

    **real_lport**
    :   The local port to which client connected to to this host.

    **real_rport**
    :   The remote port from where the client connected from to this host.

    **forward_\<field\>**
    :   Field to forward as %{forward:field} to auth process.
