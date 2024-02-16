.. _authentication-static_password_database:

========================
Static Password Database
========================

Static password database is typically used only for testing, proxying setups
and perhaps some other special kind of setups. Static passdb allows all users
to log in with any username. For password you can either set
:dovecot_core:ref:`passdb_static_password` or set ``nopassword = yes`` in
:dovecot_core:ref:`passdb_fields`.

You can return any other :ref:`authentication-password_database_extra_fields`.
You can use the standard variables everywhere.

Example:

.. code-block:: none

  # Without password
  passdb static {
    fields {
      nopassword = yes
      proxy = y
      host = 127.0.0.1
    }
  }

.. code-block:: none

  # With password
  passdb static {
    password = secret
    fields {
      proxy = y
      host = 127.0.0.1
    }
  }
