.. _pigeonhole_plugin_extdata:

===============================
Pigeonhole Sieve Extdata Plugin
===============================

The extdata plugin adds the **vnd.dovecot.extdata** extension to the
Sieve language. It allows a Sieve script to lookup information from a
datasource external to the script. This makes use of Dovecot's dict
mechanism in a read-only manner, meaning that scripts cannot update dict
data sources.

Getting the sources
-------------------

Currently, the sources of the extdata plugin are not released, but you
can get them from the their Git repository.

For Pigeonhole v0.4:

::

   git clone -b core-0.4 https://github.com/stephanbosch/sieve-extdata-plugin.git

For Pigeonhole v0.5:

::

   git clone -b core-0.5 https://github.com/stephanbosch/sieve-extdata-plugin.git

Compiling
---------

If you downloaded the sources of this plugin using Git, you will need to
execute ``./autogen.sh`` first to build the automake structure in your
source tree. This process requires autotools and libtool to be
installed.

If you installed Dovecot from sources, the plugin's configure script
should be able to find the installed ``dovecot-config`` automatically,
along with the Pigeonhole development headers:

::

   ./configure
   make
   sudo make install

If this doesn't work, you can use ``--with-dovecot=<path>`` configure
option, where the path points to a directory containing
``dovecot-config`` file. This can point to an installed file:

::

   ./configure --with-dovecot=/usr/local/lib/dovecot
   make
   sudo make install

The above example should also find the necessary Pigeonhole development
headers implicitly. You can also compile by pointing to compiled Dovecot
and Pigeonhole source trees:

::

   ./configure --with-dovecot=../dovecot-2.3.2/ --with-pigeonhole=../dovecot-2.3-pigeonhole-0.5.2
   make
   sudo make install

Configuration
-------------

This package builds and installs the sieve_extdata plugin for Pigeonhole
Sieve. The plugin is activated by adding it to the :ref:`plugin-sieve-setting-sieve_plugins` setting

::

   sieve_plugins = sieve_extdata

The following configuration settings are used:

ref:`plugin-sieve-setting-sieve_extdata_dict_uri` =
   Specifies the uri of the dict that is used for extdata lookups.

Example:

::

   plugin {

     sieve = ~/.dovecot.sieve
     sieve_plugins = sieve_extdata

     sieve_extdata_dict_uri = file:/etc/dovecot/pigeonhole-sieve.dict
   }

Usage
-----

Sieve scripts can use the new ``vnd.dovecot.extdata`` extension as
follows:

::

   require ["variables", "vacation", "vnd.dovecot.extdata"];

   vacation :days 30 :subject "${extdata.vacation_subject}" "${extdata.vacation_message}";
   keep;

where "priv/vacation_subject" & "priv/vacation_message" would be looked
up in the Dovecot dict. See below for some example dicts:

Dict with flat file backend
~~~~~~~~~~~~~~~~~~~~~~~~~~~

To use a flat file backend for the above example, create a dict file
with the following format (for example
/etc/dovecot/sieve-extdata-lookup.dict):

::

   priv/vacation_message
   Sorry I am out of the office

Dict with a SQL backend
~~~~~~~~~~~~~~~~~~~~~~~

To use a SQL backend for the above example, first set up a dict proxy.
In /etc/dovecot.conf:

::

   dict {
       sieve = mysql:/etc/dovecot/pigeonhole-sieve.dict
   }

And in /etc/dovecot/pigeonhole-sieve.dict:

::

   connect = host=localhost dbname=dovecot user=dovecot password=password

   map {
     pattern = priv/vacation_message   # The dict value to lookup
     table = virtual_users             # The SQL table to perform the lookup in
     username_field = email            # The username field to search on in the table
     value_field = vacation_msg        # The database value to return
   }

Finally configure extdata to use the proxy:

::

   sieve_extdata_dict_uri = proxy::sieve

Read the (preliminary)
`specification <https://github.com/stephanbosch/sieve-extdata-plugin/blob/core-0.5/doc/rfc/spec-bosch-sieve-external-data.txt>`__
for more information.
