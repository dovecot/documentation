.. _authentication-static_password_database:

========================
Static Password Database
========================

Static password database is typically used only for testing, proxying setups
and perhaps some other special kind of setups. Static passdb allows all users
to log in with any username. For password you return either:

* password=secret: All users have ``secret`` as password.
* nopassword: Users can log in with any password.

You can return any other :ref:`authentication-password_database_extra_fields`. You can use the
standard variables everywhere.

Example:

.. code-block:: none

  passdb db1 {
    driver = static
    args = nopassword=y
    default_fields = proxy=y host=127.0.0.1
  }
