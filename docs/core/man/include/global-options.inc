## GLOBAL OPTIONS

Global [[man,doveadm]] *options*:

**-D**
:   Enables *verbosity* and debug messages.

**-O**
:   Do not read any config file, just use defaults.

**-k**
:   Preserve entire environment for doveadm, not just
    [[setting,import_environment]].

**-v**
:   Enables verbosity, including progress counter.

**-i** *instance-name*
:   If using multiple Dovecot instances, choose the config file based on
    this instance name.

    See [[setting,instance_name]] for more information.

**-c** *config-file*
:   Read configuration from the given *config-file*. By default
    it first reads config socket, and then falls back to
    *@pkgsysconfdir@/dovecot.conf*. You can also point this to
    config socket of some instance running compatible version.

**-o** *setting*<!-- -->**=** <!-- -->*value*
:   Overrides the configuration *setting* from
    */etc/dovecot/dovecot.conf* and from the userdb with the given
    *value*. In order to override multiple settings, the **-o**
    option may be specified multiple times.
