.. _pigeonhole_dict:

===============================================
Pigeonhole Sieve: Dict Lookup for Sieve Scripts
===============================================

Sieve scripts can be obtained from a number of different :ref:`types of
locations <pigeonhole_configuration_script_locations>`.
This page shows how to retrieve them from a `Dovecot
dictionary <http://wiki2.dovecot.org/Dictionary>`__ (abbreviated as
'dict'), which can have either a file or database backend.

To retrieve a Sieve script from the dict database, two lookups are
performed. First, the name of the Sieve script is queried from the dict
path ``/priv/sieve/name/<name>``. If the Sieve script exists, this
yields a data ID which in turn points to the actual script text. The
script text is subsequently queried from the dict path
``/priv/sieve/data/<dict-id>``.

The second query is only necessary when no compiled binary is available
or when the script has changed and needs to be recompiled. The data ID
is used to detect changes in the dict's underlying database. Changing a
Sieve script in the database must be done by first making a new script
data item with a new data ID. Then, the mapping from name to data ID
must be changed to point to the new script text, thereby changing the
data ID returned from the name lookup, i.e. the first query mentioned
above. Script binaries compiled from Sieve scripts contained in a dict
database record the data ID. While the data ID contained in the binary
is identical to the one returned from the dict lookup, the binary is
assumed up-to-date. When the returned data ID is different, the new
script text is retrieved using the second query and compiled into a new
binary containing the updated data ID.

Note that, by default, compiled binaries are not stored at all for Sieve
scripts retrieved from a dict database. The ``;bindir=<path>`` option
needs to be specified in the :ref:`location
specification <pigeonhole_configuration_script_locations>`.

Configuration
-------------

The script location syntax is specified as follows:

::

   sieve = dict:<dict-uri>[;<option>[=<value>][;...]]

The following additional options are recognized:

user=<username>
   Overrides the user name used for the dict lookup. Normally, the name
   of the user running the Sieve interpreter is used.

If the name of the Script is left unspecified and is not otherwise
provided by the Sieve interpreter, the name defaults to \`default'.

Examples
--------

Using a flat file backend
~~~~~~~~~~~~~~~~~~~~~~~~~

Flat file example 1
^^^^^^^^^^^^^^^^^^^

To retrieve the Sieve script named "keep" from the dict file
/etc/dovecot/sieve.dict:

::

   sieve = dict:file:/etc/dovecot/sieve.dict;name=keep

The file /etc/dovecot/sieve.dict might look like this. Note that with
the above configuration, only the "keep" script will be used.

::

   priv/sieve/name/keep
   1
   priv/sieve/name/discard
   2
   priv/sieve/data/1
   keep;
   priv/sieve/data/2
   discard;

Flat file example 2
^^^^^^^^^^^^^^^^^^^

Following on from example 1, a more advanced script. This notifies an
external email address when new mail has arrived. Note that the script
all needs to be on one line.

::

   priv/sieve/name/notify
   5
   priv/sieve/data/5
   require ["enotify", "variables"]; if header :matches "From" "*" { set "from" "${1}";} notify :importance "3" :message "New email from ${from}" "mailto:other@domain.com?body=New%20email%20has%20arrived.";

Using a SQL backend
~~~~~~~~~~~~~~~~~~~

For greater flexibility, it's possible to use a SQL backend for your
dict scripts. First, set up a configuration file (such as
/etc/dovecot/dict-sieve-sql.conf) with your database configuration. This
should consist of the following parts:

.. code-block:: none

   # The database connection params
   connect = host=localhost dbname=dovecot user=dovecot password=password

   # The name mapping that yields the ID of the Sieve script
   map {
       pattern = priv/sieve/name/$script_name   # The name of the script, as per the "sieve" config parameter
       table = user_sieve_scripts               # The database table
       username_field = username                # The field in the table to query on
       value_field = id                         # The field which contains the return value of the script ID
       fields {
           script_name = $script_name           # FIXME: The other database field to query?
       }
   }

   # The name mapping that yields the script content from ID
   {
       pattern = priv/sieve/data/$id            # The ID, obtained from above
       table = user_sieve_scripts               # The database table
       username_field = username                # The field in the table to query
       value_field = script_data                # The field which contains the script
       fields {
           id = $id                             # FIXME: The other database field to query?
       }
   }

Next, create a dict proxy service. Normally in
/etc/dovecot/dovecot.conf:

::

   dict {
       sieve = pgsql:/etc/dovecot/dict-sieve-sql.conf.ext
   }

Finally, configure Sieve to check the dict (e.g. in
/etc/dovecot/conf.d/90-sieve.conf). This looks up a script called
"active" in the database.

::

   plugin {
       sieve = dict:proxy::sieve;name=active
   }

As with the flat file, the database query will need to return the Sieve
script all in one line, otherwise the subsequent lines will be ignored.

Note: you might need to `configure the proxy
permissions <https://wiki2.dovecot.org/Dict#>`__

Caching the compiled Sieve binaries
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With the configuration described above, the Sieve binaries will be
compiled each time they are called. To improve performance, it is
preferable to cache them, which can be done using the bindir parameter,
which is added to the Sieve configuration. For example:

::

   {
       sieve = dict:file:/etc/dovecot/sieve.dict;name=keep;bindir=~/.sieve-bin
   }

Or:

::

   {
       sieve = dict:file:/etc/dovecot/sieve.dict;name=keep;bindir=/var/sieve-scripts/%u
   }

**Note:** Sieve uses the ID number as its cache index and to detect the
need to compile. Therefore, if a script is changed, then its ID must
also be changed for it to be reloaded.
