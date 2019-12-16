.. _sieve:

===========
Sieve
===========

When Sieve scripts are uploaded using the ManageSieve service, they're immediately compiled and the script upload will fail if any problems were detected. 

Not all problems can be detected at compile time however, so it's also possible that the Sieve script will fail during runtime. 

In this case the errors will be written to the ``.dovecot.sieve.log`` file (right next to the ``.dovecot.sieve`` file itself in user's home directory).

.. toctree::
   :maxdepth: 1

   configuring_auto_forward_sender_address

   sieve_and_smtp_submission

   pigeonhole_sieve_interpreter