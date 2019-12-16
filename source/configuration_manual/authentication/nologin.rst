.. _authentication-nologin:

===================
Nologin extra field
===================

User isn't allowed to log in even if the password matches. Commonly used with
:ref:`authentication-proxies` and :ref:`authentication-host`, but may also be used standalone. One way to use
this would be perhaps:

* ``nologin=y``
* ``reason=System is being upgraded, please try again later``.

Unfortunately many clients don't show the reason to the user at all and just
assume that the password was given wrong, so it might not be a good idea to use
this unless the system will be down for days and you don't have a better way to
notify the users.

Note: if you want to entirely block the user from logging in (i.e. account is
suspended), with no IMAP referral information provided, you must ensure that
neither ``proxy`` nor ``host`` are defined as one of the passdb extra fields.
The order of preference is: ``proxy``, ``host``, then ``nologin``.
