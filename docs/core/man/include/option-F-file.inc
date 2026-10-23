**-F** *file*
:   Execute the *command* for all the users in the *file*. The *file*
    contains one username per line. If *file* is **-**, the usernames are
    read from stdin. This can't be used with commands that read their own
    input from stdin.

    To execute the *command* for all users, list them with
    [[man,doveadm-user]]:

    ```sh
    doveadm user '*' | doveadm command -F -
    ```

    Using this in combination with system users from
    **userdb { driver = passwd }** is not recommended, because it
    contains also users with a lower UID than the one configured with the
    `first_valid_uid` setting.

    When the SQL userdb module is used, make sure that the
    [[setting,userdb_sql_iterate_query]] setting matches your database layout.

    When using the LDAP userdb module, make sure that the [[setting,userdb_fields]]
    and [[setting,userdb_ldap_iterate_fields]] settings match your LDAP schema.
    Otherwise [[man,doveadm-user]] will be unable to iterate over all users.
