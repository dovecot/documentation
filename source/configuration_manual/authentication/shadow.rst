.. _authentication-shadow:

=======
Shadow
=======

.. dovecotremoved:: 2.4.0,3.0.0

.. warning:: This plugin has been removed. Use :ref:`authentication-pam` instead.

Works at least with Linux and Solaris, but nowadays :ref:`authentication-pam` is usually
preferred to this.

This uses auth-worker processes:

.. code-block:: none

  passdb shadow {
  }

By default the auth-worker processes are run as dovecot user though, which
normally doesn't have access to ``/etc/shadow``. If this is a problem, you can
fix it with:

.. code-block:: none

  service auth-worker {
    # This should be enough:
    group = shadow
    # If not, just give full root permissions:
    #user = root
  }

If there are only a few users and you're using ``/etc/shadow`` file, there's
really no need to use auth-workers. You can disable them with:

.. code-block:: none

  passdb shadow {
    args = blocking=no
  }
