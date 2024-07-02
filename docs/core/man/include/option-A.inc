**-A**
:   If the **-A** option is present, the *command* will be performed for
    all users. Using this option in combination with system users from
    **userdb { driver = passwd }** is not recommended, because it
    contains also users with a lower UID than the one configured with the
    `first_valid_uid` setting.

    When the SQL userdb module is used make sure that the *iterate_query*
    setting in */etc/dovecot/dovecot-sql.conf.ext* matches your database
    layout. When using the LDAP userdb module, make sure that the
    *iterate_attrs* and *iterate_filter* settings in
    */etc/dovecot/dovecot-ldap.conf.ext* match your LDAP schema.
    Otherwise [[man,doveadm]] will be unable to iterate over all users.
