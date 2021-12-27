.. _dovecot_dict_protocol:

=====================
Dovecot Dict Protocol
=====================

General
-------

Dovecot's dict protocol is a line based protocol between the dict client and
server processes. The dict server receives lines containing commands and
responds to the client with results. Each line ends with an LF character and
the maximum line the client is allowed to send a command is 65536 (64KB of data).
There is no maximum length enforced for dict server's response.

Each command is in format:

.. code-block:: none

   <command short name><parameters separated with TAB>

The command short name is a single character and the rest of the line
containing the command parameters are followed immediately without any
whitespace in between.

The commands available in dict protocol and their corresponding short name
is shown in table bellow.

+--------------------+---------------------+
| Command            | Command short name  |
+====================+=====================+
| HELLO              |  H                  |
+--------------------+---------------------+
| LOOKUP             |  L                  |
+--------------------+---------------------+
| ITERATE            |  I                  |
+--------------------+---------------------+
| BEGIN              |  B                  |
+--------------------+---------------------+
| COMMIT             |  C                  |
+--------------------+---------------------+
| COMMIT_ASYNC       |  D                  |
+--------------------+---------------------+
| ROLLBACK           |  R                  |
+--------------------+---------------------+
| SET                |  S                  |
+--------------------+---------------------+
| UNSET              |  U                  |
+--------------------+---------------------+
| ATOMIC_INC         |  A                  |
+--------------------+---------------------+
| TIMESTAMP          |  T                  |
+--------------------+---------------------+

The reply from dict server is in the same format.

.. code-block:: none

   <result short status>(<optional extra values separated with TAB>)


Result statuses relevant for each command and their corresponding short name
explained in each command section.
Command parameters and extra result values are tab-escaped using the dovecot's
generic tab-escaping. Escaping is described in more details in :ref:`dovecot_auth_protocol`.

After responses to certain commands, an execution duration summary line is also
sent to the client contatining timestamp information about how long the command
took to finish.  The commands that trigger this timestamp response are LOOKUP,
ITERATE, and COMMIT. Format of this line is as follows:

.. code-block:: none

   TAB<start sec>TAB<start usec>TAB<end sec>TAB<end usec>

Where the unix timestamp is ``<sec>.<usec>`` for each pair.

The connection starts by the client sending a ``HELLO`` message. The message
contains the initial handshake information.


.. code-block:: none

   C: H<major>TAB<minor>TAB<value type>TAB<obsolete user>TAB<dict name>

.. Note:: Prior to dovecot 2.3.17 user was included in the initial handshake
          but it's currently not used and the field is empty.

The server then checks client's protocol version and can either accept the
handshake and proceed to response with OK or reject the HELLO and close the
connection.

If the handshake is accepted by server, the optional extra values
in the response line contain server's major and minor protocol versions (tab
separated). The client also checks the protocol version and can decide to
close the connection if versions do not match.

Currently, dovecot's client and server check that they support the same major
version number. Minor version can be ignored. This document describes
protocol major version 3, minor 2 which is supported in dovecot v2.3.17+. In
earlier dovecot versions lower protocol versions are used e.g. v2.3.16 protocol
major version is 2 and minor is 2.


Other dict commands and their line format is described as follows.

.. Note:: Prior to dovecot 2.3.17 none of the following commands included the
          username for which the dict operation is performed. Instead, the
          username from the initial handshake message was used.


LOOKUP command
^^^^^^^^^^^^^^

Used to lookup a key value from dict.

.. code-block:: none

   C: L<key>TAB<user>

Possible responses include:

+--------------------+---------------------+----------------------------------+
| result status      | status short name   | meaning                          |
+====================+=====================+==================================+
| OK                 |  O                  | Lookup was performed successfully|
|                    |                     | and there was a single value for |
|                    |                     | the key. Value is then appended  |
|                    |                     | to the response line.            |
+--------------------+---------------------+----------------------------------+
| MULTI_OK           |  M                  | Lookup was performed successfully|
|                    |                     | and there were multiple values   |
|                    |                     | for the key. In this case all    |
|                    |                     | results are joined together with |
|                    |                     | a tab and then double-escaped so |
|                    |                     | the end result looks like a      |
|                    |                     | single value. Client would then  |
|                    |                     | need to unescape twice to get the|
|                    |                     | list of values separated by tabs.|
+--------------------+---------------------+----------------------------------+
| NOTFOUND           |  N                  | Lookup was performed successfully|
|                    |                     | but no value was found with this |
|                    |                     | key.                             |
+--------------------+---------------------+----------------------------------+
| FAIL               |  F                  | Lookup failed due to an error. A |
|                    |                     | tab-escaped error string is      |
|                    |                     | appended to the response line.   |
+--------------------+---------------------+----------------------------------+

ITERATE command
^^^^^^^^^^^^^^^

Used to iterate over a key path.

.. code-block:: none

   C: I<flags>TAB<max rows>TAB<path>TAB<user>

The iteration flag is a integer with following options, which can be ``OR`` ed
together.

+----------------+--------+--------------------------------------------------+
| flag           | value  | meaning                                          |
+================+========+==================================================+
| RECURSE        | 0x01   | Recurse to all the sub-hierarchies               |
+----------------+--------+--------------------------------------------------+
| SORT_BY_KEY    | 0x02   | Sort returned results by key                     |
+----------------+--------+--------------------------------------------------+
| SORT_BY_VALUE  | 0x04   | Sort returned results by value                   |
+----------------+--------+--------------------------------------------------+
| NO_VALUE       | 0x08   | Don't return values, only keys                   |
+----------------+--------+--------------------------------------------------+
| EXACT_KEY      | 0x10   | Don't recurse at all. This is basically the same |
|                |        | as LOOKUP comman dbut it will return all of the  |
|                |        | rows instead of only the first one.              |
+----------------+--------+--------------------------------------------------+
| FLAG_ASYNC     | 0x20   | Perform iteration asynchronously                 |
+----------------+--------+--------------------------------------------------+


Possible responses include:

+--------------------+---------------------+----------------------------------+
| result status      | status short name   | meaning                          |
+====================+=====================+==================================+
| OK                 |  O                  | Iteration was done successfully. |
|                    |                     | Note that for each key-value pair|
|                    |                     | A separate OK status is appended |
|                    |                     | to the response line with the key|
|                    |                     | following immediately and all    |
|                    |                     | values associated to it joined   |
|                    |                     | with tabs.                       |
+--------------------+---------------------+----------------------------------+
| FAIL               |  F                  | Iteration failed due to an error.|
|                    |                     | A tab-escaped error string is    |
|                    |                     | appended to the response line.   |
+--------------------+---------------------+----------------------------------+
| ITER_FINISHED      |  ``<empty line>``   | Iteration completed. This is sent|
|                    |                     | after all key value pairs are    |
|                    |                     | added to the response.           |
+--------------------+---------------------+----------------------------------+

BEGIN command
^^^^^^^^^^^^^

Begins a dict transaction with the given ID.

.. code-block:: none

   C: B<id>TAB<user>

Note that transactions commands don't have replies with the exception of COMMIT.
After a transaction is successfully started, transaction operations i.e.
SET, UNSET, ATOMIC_INC, and TIMESTAMP can be used.

COMMIT command
^^^^^^^^^^^^^^

Commit the transaction corresponding to the given ID.

.. code-block:: none

   C: C<transaction id>

Note that the transaction is looked up from the ID so no username is required.

Possible responses include:

+--------------------+---------------------+----------------------------------+
| result status      | status short name   | meaning                          |
+====================+=====================+==================================+
| OK                 |  O                  | Commit was done successfully and |
|                    |                     | all transaction operations       |
|                    |                     | completed.                       |
+--------------------+---------------------+----------------------------------+
| NOTFOUND           | N                   | Transaction ID specified in the  |
|                    |                     | commit was not found.            |
+--------------------+---------------------+----------------------------------+
| WRITE_UNCERTAIN    | W                   | The transaction may or may not   |
|                    |                     | have succeeded (e.g. a write     |
|                    |                     | timeout occurred or the          |
|                    |                     | connection to dict backend was   |
|                    |                     | closed by the backend server). A |
|                    |                     | tab-escaped error string is      |
|                    |                     | appended to the response line.   |
+--------------------+---------------------+----------------------------------+
| FAIL               |  F                  | Iteration failed due to an error.|
|                    |                     | A tab-escaped error string is    |
|                    |                     | appended to the response line.   |
+--------------------+---------------------+----------------------------------+

COMMIT_ASYNC command
^^^^^^^^^^^^^^^^^^^^

Obsolete command to commit the transaction. This hasn't been used by the
dict client since v2.2.24.

.. code-block:: none

   C: D<transaction id>

.. deprecated:: v2.2.24

The async commit is currently used by dovecot's dict client even though it is
supported by dict server.

ROLLBACK command
^^^^^^^^^^^^^^^^

Rollback changes made in the transaction.

.. code-block:: none

   C: R<transaction id>

SET command
^^^^^^^^^^^

Set a value for the given key.

.. code-block:: none

   C: S<transaction id>TAB<key>TAB<value>

UNSET command
^^^^^^^^^^^^^

Unset a record in the dictionary given the key.

.. code-block:: none

   C: U<transaction id>TAB<key>

ATOMIC_INC command
^^^^^^^^^^^^^^^^^^

Atomically increment numeric value of a key with the given increment value.
Note that the value is changed when transaction is being committed, so it's not
known beforehand what the value will become. The value is updated only
if it already exists.


.. code-block:: none

   C: A<transaction id>TAB<key>TAB<increment>


TIMESTAMP command
^^^^^^^^^^^^^^^^^

Set the unix timestamp for the given transaction. Note that this will set the
timestamp for the entire transaction. This must be set before any changes are
done and can't be changed afterwards. Currently only dict-sql with Cassandra
backend does anything with this.


.. code-block:: none

   C: T<transaction id>TAB<sec>TAB<nsec>

