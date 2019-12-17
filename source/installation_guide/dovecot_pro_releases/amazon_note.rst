Repository configuration for Amazon Linux 2
===========================================
OX Dovecot Pro supports Amazon Linux 2. Support was added with the v2.3.3 release of OX Dovecot Pro. Earlier versions of Amazon Linux are not supported.

Amazon Linux 2 offers some of the libraries packaged in the Dovecot 3rd party repository. Only the versions distributed via OX repositories are routinely tested with OX Dovecot Pro, so using them is advisable. 

In case a newer version is available via the distribution, that can also be considered, but an older version than the one distributed by OX, should not be used. If yum priorities plugin is enabled make sure 3rd party priority is lower than core repositories by adding ``priority=N``, where N is lower than the priority for Amazon Linux 2 packages (10 at the time of writing).
