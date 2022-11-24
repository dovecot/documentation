.. _admin-doveadm-http-api:

################
Doveadm HTTP API
################

.. contents::


*************
Configuration
*************

To be able to use doveadm HTTP API it's mandatory to configure either
:dovecot_core:ref:`password <doveadm_password>` for doveadm or an
:dovecot_core:ref:`api key <doveadm_api_key>`.

To configure password for doveadm service in `/etc/dovecot/dovecot.conf`: ::

  doveadm_password = secretpassword


Or if preferred to use separate key for doveadm http api then it can be enabled by defining key in config: ::

  doveadm_api_key = key


And to enable the doveadm http listener::

   service doveadm {
      unix_listener doveadm-server {
         user = vmail
      }
      inet_listener {
          port = 2425
      }
      inet_listener http {
          port = 8080
          #ssl = yes # uncomment to enable https
      }
   }


*****
Usage
*****

Connecting to the endpoint can be done by using standard http protocol and authentication headers.
To get list the commands supported by the endpoint, the following example commands can be used:

X-Dovecot-API auth usage::

  curl -H "Authorization: X-Dovecot-API <base64 dovecot_api_key>" http://host:port/doveadm/v1

Basic auth usage::

  curl -H "Authorization: Basic <base64 doveadm:doveadm_password>" http://host:port/doveadm/v1
  curl –u doveadm:password http://host:port/doveadm/v1

There is also https://github.com/dovecot/doveadm-http-cli that can be used for accessing the API.


************
API overview
************

All commands sent to the API needs to be posted in json format using ``Content-Type: application/json`` in headers for the request type and the json content as payload in format::

   [
       [
           "command1",
           {
               "parameter1": "value",
               "parameter2": "value",
               "parameter3": "value"
           },
           "tag1"
       ]
   ]


Multiple commands can be submitted in one json payload::

   [
       [
           "command1",
           {
               "parameter1": "value",
               "parameter2": "value"
           },
           "tag1"
       ],
       [
              "command2",
           {
               "parameter1": "value",
               "parameter2": "value"
           },
           "tag2"
       ]
   ]

.. warning::

  For now it is safest not to send multiple commands in one json payload, as some commands may kill the server in certain error conditions and leaving you without any response.
  Also it is not guaranteed that the commands will be processed in order.


.. note::

  All commands are case sensitive.

Example session
===============


In the example we ask dovecot to reload configuration using following JSON payload::

   [
       [
           "reload",
           {},
           "tag1"
       ]
   ]


Then we execute it with curl::

   curl -v -u doveadm:secretpassword -X POST http://localhost:8080/doveadm/v1 -H "Content-Type: application/json" -d '[["reload",{},"tag1"]]'

This is equivalent to the command ``doveadm reload``.

Successful Response::

   [
       [
           "doveadmResponse",
           [],
           "tag1"
       ]
   ]


Failure Response::

   [
       [
           "error",
           {
               "exitCode": 68,
               "type": "exitCode"
           },
           "tag1"
       ]
   ]

Failure codes
=============

+-------+-----------------------------------------------+
| 2     | Success but mailbox changed during operation  |
+-------+-----------------------------------------------+
| 64    | Invalid parameters                            |
+-------+-----------------------------------------------+
| 65    | Data error                                    |
+-------+-----------------------------------------------+
| 67    | User does not exist                           |
+-------+-----------------------------------------------+
| 68    | User does not have session                    |
+-------+-----------------------------------------------+
| 73    | User quota is full                            |
+-------+-----------------------------------------------+
| 75    | Temporary error                               |
+-------+-----------------------------------------------+
| 77    | No permission                                 |
+-------+-----------------------------------------------+
| 78    | Invalid configuration                         |
+-------+-----------------------------------------------+

***********
API methods
***********


doveadm altmove
===============

Move mails between primary and alternative mailbox storage locations. Applicable to mdbox and sdbox mailbox formats only.

parameters::

    {
        "command": "altmove",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "reverse",
                "type": "boolean"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to apply move             |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| reverse    | Boolean      | do a reverse move                     |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query to apply to mail move    |                                 |
+------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "altmove",
            {
                "query": [
                    "mailbox",
                    "INBOX/myfoldertoo",
                    "savedbefore",
                    "since",
                    "30d"
                ],
                "reverse": false,
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" \
      -d '[["altmove",{"user":"samik","reverse":false,"query":["mailbox","INBOX/myfoldertoo","savedbefore","since","30d"]},"tag1"]] ' \
      http://localhost:8080/doveadm/v1


doveadm auth cache flush
========================


Flush authentication cache for one user or all users.

parameters::

    {
        "command": "authCacheFlush",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "array"
            }
        ]
    } 


+------------+--------------+---------------------------------+---------------------------------+
| Parameter  | Type         | Description                     | example                         |
+============+==============+=================================+=================================+
| socketPath | String       | Path to doveadm socket          | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------+---------------------------------+
| user       | String array | optional list of users to flush | ["samik","samitest"]            |
+------------+--------------+---------------------------------+---------------------------------+


example::

    [
        [
            "authCacheFlush",
            {
                "user": [
                    "samik"
                ]
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["authCacheFlush",{"user":["samik"]},"tag1"]] ' http://localhost:8080/doveadm/v1

.. code::

    response:

    [
        [
            "doveadmResponse",
            [
                {
                    "entries": "0"
                }
            ],
            "tag1"
        ]
    ]


doveadm copy
============

Copy messages matching the given search query into another mailbox.

parameters::

    {
        "command": "copy",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "destinationMailbox",
                "type": "string"
            },
            {
                "name": "sourceType",
                "type": "string"
            },
            {
                "name": "sourceUser",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm deduplicate
===================

This command is used to expunge duplicated messages in mailboxes.

parameters::

    {
        "command": "deduplicate",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "byMsgid",
                "type": "boolean"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to deduplicate            |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| byMsgId    | Boolean      | deduplicate by Message-ID instead of  |                                 |
|            |              | guid                                  |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query to apply to deduplicate  |                                 |
+------------+--------------+---------------------------------------+---------------------------------+

doveadm dict get
================

Get key value from configured dictionary.

parameters::

   {
      "command" : "dictGet",
      "parameters" : [
         {
            "type" : "string",
            "name" : "user"
         },
         {
            "type" : "string",
            "name" : "dictUri"
            },
         {
            "name" : "key",
            "type" : "string"
         }
      ]
   }


+------------+--------+--------------------------------------+---------------------------------+
| Parameter  | Type   | Description                          | example                         |
+============+========+======================================+=================================+
| socketPath | String | Path to doveadm socket               | /var/run/dovecot/doveadm-server |
+------------+--------+--------------------------------------+---------------------------------+
| user       | String | uid of user to query                 | samik                           |
+------------+--------+--------------------------------------+---------------------------------+
| dictUri    | String | optional URI for dictionary to query |                                 |
+------------+--------+--------------------------------------+---------------------------------+
| key        | String | key to query                         |                                 |
+------------+--------+--------------------------------------+---------------------------------+


doveadm dict inc
================

Increase key value in dictionary.

parameters::

    {
        "command": "dictInc",
        "parameters": [
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "dictUri",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            },
            {
                "name": "difference",
                "type": "integer"
            }
        ]
    }

+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid of user to modify dictionary key  |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| dictUri    | String  | optional URI for dictionary to modify |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| key        | String  | dictionary key to increase            |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| difference | Integer | increment value                       |                                 |
+------------+---------+---------------------------------------+---------------------------------+


doveadm dict iter
=================

List keys in dictionary.

.. code::

    {
        "command": "dictIter",
        "parameters": [
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "exact",
                "type": "boolean"
            },
            {
                "name": "recurse",
                "type": "boolean"
            },
            {
                "name": "noValue",
                "type": "boolean"
            },
            {
                "name": "dictUri",
                "type": "string"
            },
            {
                "name": "prefix",
                "type": "string"
            }
        ]
    }

+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid of user to modify dictionary key  |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| dictUri    | String  | optional URI for dictionary to modify |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| exact      | Boolean | list only exact matches               |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| recurse    | Boolean | do recursive search                   |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| noValue    | Boolean | list also keys that have no value set |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| prefix     | String  | search only keys with given prefix    |                                 |
+------------+---------+---------------------------------------+---------------------------------+


doveadm dict set
================

Set key value in configured dictionary.

.. code::

    {
        "command": "dictSet",
        "parameters": [
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "dictUri",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            },
            {
                "name": "value",
                "type": "string"
            }
        ]
    }


+------------+--------+---------------------------------------+---------------------------------+
| Parameter  | Type   | Description                           | example                         |
+============+========+=======================================+=================================+
| socketPath | String | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------+---------------------------------------+---------------------------------+
| user       | String | uid of user to modify dictionary key  | samik                           |
+------------+--------+---------------------------------------+---------------------------------+
| dictUri    | String | optional URI for dictionary to modify |                                 |
+------------+--------+---------------------------------------+---------------------------------+
| key        | String | dictionary key to modify              |                                 |
+------------+--------+---------------------------------------+---------------------------------+
| value      | String | value to set                          |                                 |
+------------+--------+---------------------------------------+---------------------------------+


doveadm dict unset
==================

Unset key value in configured dictionary

parameters::

    {
        "command": "dictUnset",
        "parameters": [
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "dictUri",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            }
        ]
    } 


+------------+--------+---------------------------------------+---------------------------------+
| Parameter  | Type   | Description                           | example                         |
+============+========+=======================================+=================================+
| socketPath | String | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------+---------------------------------------+---------------------------------+
| user       | String | uid of user to modify dictionary key  |                                 |
+------------+--------+---------------------------------------+---------------------------------+
| dictUri    | String | optional URI for dictionary to modify |                                 |
+------------+--------+---------------------------------------+---------------------------------+
| key        | String | dictionary key to unset               |                                 |
+------------+--------+---------------------------------------+---------------------------------+


doveadm expunge
===============

Expunge messages matching given search query.

parameters::

    {
        "command": "expunge",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "deleteEmptyMailbox",
                "type": "boolean"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+--------------------+--------------+-----------------------------------------+---------------------------------+
| Parameter          | Type         | Description                             | example                         |
+====================+==============+=========================================+=================================+
| socketPath         | String       | Path to doveadm socket                  | /var/run/dovecot/doveadm-server |
+--------------------+--------------+-----------------------------------------+---------------------------------+
| allUsers           | Boolean      | apply operation to all users            |                                 |
+--------------------+--------------+-----------------------------------------+---------------------------------+
| user               | String       | uid of user to expunge                  |                                 |
+--------------------+--------------+-----------------------------------------+---------------------------------+
| userFile           | String       | optionally fetch usernames from file.   |                                 |
|                    |              | One username per line                   |                                 |
+--------------------+--------------+-----------------------------------------+---------------------------------+
| deleteEmptyMailbox | Boolean      | delete also mailbox if it's empty after |                                 |
|                    |              | expunge has been applied                |                                 |
+--------------------+--------------+-----------------------------------------+---------------------------------+
| query              | String array | search query to apply to expunge        |                                 |
+--------------------+--------------+-----------------------------------------+---------------------------------+


doveadm fetch
=============

Fetch mail data from user mailbox.

parameters::

    {
        "command": "fetch",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "field",
                "type": "array"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }

+------------+--------------+-----------------------------------------+---------------------------------+
| Parameter  | Type         | Description                             | example                         |
+============+==============+=========================================+=================================+
| socketPath | String       | Path to doveadm socket                  | /var/run/dovecot/doveadm-server |
+------------+--------------+-----------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users            |                                 |
+------------+--------------+-----------------------------------------+---------------------------------+
| user       | String       | uid of user to fetch data               |                                 |
+------------+--------------+-----------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file.   |                                 |
|            |              | One username per line                   |                                 |
+------------+--------------+-----------------------------------------+---------------------------------+
| field      | String array | fields to fetch. Supported fields as of |                                 |
|            |              | dovecot 2.2.26: hdr.<name>body.<section>|                                 |
|            |              | binary.<section> user mailbox mailbox-  |                                 |
|            |              | guid seq uid guid flagsmodseq hdr body  |                                 |
|            |              | body.snippet text text.utf8             |                                 |
|            |              | size.physical size.virtualdate.received |                                 |
|            |              | date.sent date.saved                    |                                 |
|            |              | date.received.unixtime                  |                                 |
|            |              | date.sent.unixtimedate.saved.unixtime   |                                 |
|            |              | imap.envelope imap.body                 |                                 |
|            |              | imap.bodystructure pop3.uidlpop3.order  |                                 |
|            |              | refcount storageid                      |                                 |
+------------+--------------+-----------------------------------------+---------------------------------+
| query      | String array | search query to user                    |                                 |
+------------+--------------+-----------------------------------------+---------------------------------+


example::

    [
        [
            "fetch",
            {
                "field": [
                    "text"
                ],
                "query": [
                    "mailbox",
                    "INBOX/myfoldertoo"
                ],
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["fetch",{"user":"samik","field":["text"],"query":["mailbox","INBOX/myfoldertoo"]},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "text": "From: Joulu Pukki <joulu.pukki@korvatunturi.fi>\nSubject: plaa\n\nmail body\n"
                }
            ],
            "tag1"
        ]
    ]


doveadm flags add
=================

Add flag to a message(s).

parameters::

    {
        "command": "flagsAdd",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "flag",
                "type": "array"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to add flags              |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| flag       | String array | list of flags to add                  |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query to apply to flag add     |                                 |
+------------+--------------+---------------------------------------+---------------------------------+


doveadm flags remove
====================

Remove flags from message(s).

parameters::

    {
        "command": "flagsRemove",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "flag",
                "type": "array"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to add flags              |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| flag       | String array | list of flags to remove               |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query to apply to flag remove  |                                 |
+------------+--------------+---------------------------------------+---------------------------------+


doveadm flags replace
=====================

Replace flags with another flag in message or messages. Replaces all current
flags with the ones in the parameter list

parameters::

    {
        "command": "flagsReplace",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "flag",
                "type": "array"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to replace flags          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| flag       | String array | list of flags to replace with         |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query to apply to flag replace |                                 |
+------------+--------------+---------------------------------------+---------------------------------+


doveadm force-resync
====================

Under certain circumstances it may happen, that Dovecot is unable to automatically solve problems with mailboxes.
In such situations the **force-resync** command may be helpful.
It tries to fix all problems.
For sdbox and mdbox mailboxes the storage files will be also checked.

parameters::

    {
        "command": "forceResync",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailboxMask",
                "type": "string"
            }
        ]
    }


+-------------+---------+----------------------------------------+---------------------------------+
| Parameter   | Type    | Description                            | example                         |
+=============+=========+========================================+=================================+
| socketPath  | String  | Path to doveadm socket                 | /var/run/dovecot/doveadm-server |
+-------------+---------+----------------------------------------+---------------------------------+
| allUsers    | Boolean | apply operation to all users           |                                 |
+-------------+---------+----------------------------------------+---------------------------------+
| userFile    | String  | optionally fetch usernames from file.  |                                 |
|             |         | One username per line                  |                                 |
+-------------+---------+----------------------------------------+---------------------------------+
| user        | String  | uid of user to apply resync            |                                 |
+-------------+---------+----------------------------------------+---------------------------------+
| mailboxMask | String  | apply forced resync on given mailboxes | INBOX                           |
+-------------+---------+----------------------------------------+---------------------------------+


example::

    [
        [
            "forceResync",
            {
                "mailboxMask": "INBOX*",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["forceResync",{"user":"samik","mailboxMask":"INBOX*"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm fs copy
===============

Copy object in storage.

parameters::

    {
        "command": "fsCopy",
        "parameters": [
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "sourcePath",
                "type": "string"
            },
            {
                "name": "destinationPath",
                "type": "string"
            }
        ]
    }


+------------------+--------+---------------------------------------+---------------------------------+
| Parameter        | Type   | Description                           | example                         |
+==================+========+=======================================+=================================+
| socketPath       | String | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------------+--------+---------------------------------------+---------------------------------+
| fsDriver         | String | filesystem driver to use              |                                 |
+------------------+--------+---------------------------------------+---------------------------------+
| fsArgs           | String | filesystem driver arguments to use    |                                 |
+------------------+--------+---------------------------------------+---------------------------------+
| sourcePath       | String | source object path                    |                                 |
+------------------+--------+---------------------------------------+---------------------------------+
| Destination path | String | destination object path in filesystem |                                 |
+------------------+--------+---------------------------------------+---------------------------------+


doveadm fs delete
=================

Delete object from storage

parameters::

    {
        "command": "fsDelete",
        "parameters": [
            {
                "name": "recursive",
                "type": "boolean"
            },
            {
                "name": "maxParallel",
                "type": "integer"
            },
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "path",
                "type": "array"
            }
        ]
    }


+-------------+---------+-------------------------------------+---------------------------------+
| Parameter   | Type    | Description                         | example                         |
+=============+=========+=====================================+=================================+
| socketPath  | String  | Path to doveadm socket              | /var/run/dovecot/doveadm-server |
+-------------+---------+-------------------------------------+---------------------------------+
| fsDriver    | String  | filesystem driver to use            |                                 |
+-------------+---------+-------------------------------------+---------------------------------+
| fsArgs      | String  | filesystem driver arguments to use  |                                 |
+-------------+---------+-------------------------------------+---------------------------------+
| path        | String  | object path in filesystem to delete |                                 |
+-------------+---------+-------------------------------------+---------------------------------+
| recursive   | Boolean | do a recursive delete of a path     |                                 |
+-------------+---------+-------------------------------------+---------------------------------+
| maxParallel | Integer | max number of parallel workers      |                                 |
+-------------+---------+-------------------------------------+---------------------------------+


doveadm fs get
==============

Get object from storage

parameters::

    {
        "command": "fsGet",
        "parameters": [
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "path",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------------------+---------------------------------+
| Parameter  | Type   | Description                        | example                         |
+============+========+====================================+=================================+
| socketPath | String | Path to doveadm socket             | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------------------+---------------------------------+
| fsDriver   | String | filesystem driver to use           |                                 |
+------------+--------+------------------------------------+---------------------------------+
| fsArgs     | String | filesystem driver arguments to use |                                 |
+------------+--------+------------------------------------+---------------------------------+
| path       | String | object path in filesystem to fetch |                                 |
+------------+--------+------------------------------------+---------------------------------+


doveadm fs iter
===============

List objects in given fs path

parameters::

    {
        "command": "fsIter",
        "parameters": [
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "path",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------------------+---------------------------------+
| Parameter  | Type   | Description                        | example                         |
+============+========+====================================+=================================+
| socketPath | String | Path to doveadm socket             | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------------------+---------------------------------+
| fsDriver   | String | filesystem driver to use           |                                 |
+------------+--------+------------------------------------+---------------------------------+
| fsArgs     | String | filesystem driver arguments to use |                                 |
+------------+--------+------------------------------------+---------------------------------+
| path       | String | path in filesystem to list         |                                 |
+------------+--------+------------------------------------+---------------------------------+


doveadm fs iter-dirs
====================

List folders in given path

parameters::

    {
        "command": "fsIterDirs",
        "parameters": [
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "path",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------------------+---------------------------------+
| Parameter  | Type   | Description                        | example                         |
+============+========+====================================+=================================+
| socketPath | String | Path to doveadm socket             | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------------------+---------------------------------+
| fsDriver   | String | filesystem driver to use           |                                 |
+------------+--------+------------------------------------+---------------------------------+
| fsArgs     | String | filesystem driver arguments to use |                                 |
+------------+--------+------------------------------------+---------------------------------+
| path       | String | path in filesystem to list for     |                                 |
|            |        | subfolders                         |                                 |
+------------+--------+------------------------------------+---------------------------------+


doveadm fs put
==============

Put object to storage

parameters::

    {
        "command": "fsPut",
        "parameters": [
            {
                "name": "hash",
                "type": "string"
            },
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "inputPath",
                "type": "string"
            },
            {
                "name": "path",
                "type": "string"
            }
        ]
    }

+------------+--------+----------------------------------------+---------------------------------+
| Parameter  | Type   | Description                            | example                         |
+============+========+========================================+=================================+
| socketPath | String | Path to doveadm socket                 | /var/run/dovecot/doveadm-server |
+------------+--------+----------------------------------------+---------------------------------+
| hash       | String |                                        |                                 |
+------------+--------+----------------------------------------+---------------------------------+
| fsDriver   | String | filesystem driver to use               |                                 |
+------------+--------+----------------------------------------+---------------------------------+
| fsArgs     | String | filesystem driver arguments to use     |                                 |
+------------+--------+----------------------------------------+---------------------------------+
| inputPath  | String | source object path in local filesystem |                                 |
+------------+--------+----------------------------------------+---------------------------------+
| path       | String | object path in filesystem to put       |                                 |
+------------+--------+----------------------------------------+---------------------------------+


doveadm fs stat
===============

Stat object in storage.

parameters::

    {
        "command": "fsStat",
        "parameters": [
            {
                "name": "fsDriver",
                "type": "string"
            },
            {
                "name": "fsArgs",
                "type": "string"
            },
            {
                "name": "path",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------------------+---------------------------------+
| Parameter  | Type   | Description                        | example                         |
+============+========+====================================+=================================+
| socketPath | String | Path to doveadm socket             | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------------------+---------------------------------+
| fsDriver   | String | filesystem driver to use           |                                 |
+------------+--------+------------------------------------+---------------------------------+
| fsArgs     | String | filesystem driver arguments to use |                                 |
+------------+--------+------------------------------------+---------------------------------+
| path       | String | object path in filesystem fetch    |                                 |
|            |        | statistics for                     |                                 |
+------------+--------+------------------------------------+---------------------------------+


doveadm fscache rescan
======================

Force fscache rescan

parameters::

    {
        "command": "fscacheRescan",
        "parameters": [
            {
                "name": "path",
                "type": "string"
            },
            {
                "name": "maxAge",
                "type": "integer"
            }
        ]
    }

+------------+---------+------------------------+---------------------------------+
| Parameter  | Type    | Description            | example                         |
+============+=========+========================+=================================+
| socketPath | String  | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+---------+------------------------+---------------------------------+
| maxAge     | Integer | Maximum age            |                                 |
+------------+---------+------------------------+---------------------------------+


doveadm fts expand
==================

Expand query using FTS.

parameters::

    {
        "command": "ftsExpand",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| allUsers   | Boolean| Expand with every user | true                            |
+------------+--------+------------------------+---------------------------------+
| user       | String | Username               | samik                           |
+------------+--------+------------------------+---------------------------------+
| userFile   | String | Filename containing    |                                 |
|            |        | usernames              |                                 |
+------------+--------+------------------------+---------------------------------+
| query      | Array  | Search Query           | ['text','foobar']               |
+------------+--------+------------------------+---------------------------------+


doveadm fts lookup
==================

Search mail with FTS plugin.

parameters::

    {
        "command": "ftsLookup",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| allUsers   | Boolean| Expand with every user | true                            |
+------------+--------+------------------------+---------------------------------+
| user       | String | Username               | samik                           |
+------------+--------+------------------------+---------------------------------+
| userFile   | String | Filename containing    |                                 |
|            |        | usernames              |                                 |
+------------+--------+------------------------+---------------------------------+
| query      | Array  | Search Query           | ['text','foobar']               |
+------------+--------+------------------------+---------------------------------+


doveadm fts optimize
====================

Optimize FTS data.

parameters::

    {
        "command": "ftsOptimize",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "namespace",
                "type": "string"
            }
        ]
    } 


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| allUsers   | Boolean| Expand with every user | true                            |
+------------+--------+------------------------+---------------------------------+
| user       | String | Username               | samik                           |
+------------+--------+------------------------+---------------------------------+
| userFile   | String | Filename containing    |                                 |
|            |        | usernames              |                                 |
+------------+--------+------------------------+---------------------------------+
| namespace  | String | Namespace to optimize  |                                 |
+------------+--------+------------------------+---------------------------------+


doveadm fts rescan
==================

Rebuild FTS indexes. For some drivers, this will just remove the indexes.
Operator is expected to run doveadm index after this to ensure indexes are built.

parameters::

    {
        "command": "ftsRescan",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "namespace",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| allUsers   | Boolean| Expand with every user | true                            |
+------------+--------+------------------------+---------------------------------+
| user       | String | Username               | samik                           |
+------------+--------+------------------------+---------------------------------+
| userFile   | String | Filename containing    |                                 |
|            |        | usernames              |                                 |
+------------+--------+------------------------+---------------------------------+
| namespace  | String | Namespace to optimize  |                                 |
+------------+--------+------------------------+---------------------------------+


doveadm fts tokenize
====================

Tokenize string using FTS tokenizers.

parameters::

    {
        "command": "ftsTokenize",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "language",
                "type": "string"
            },
            {
                "name": "text",
                "type": "array"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| allUsers   | Boolean| Expand with every user | true                            |
+------------+--------+------------------------+---------------------------------+
| user       | String | Username               | samik                           |
+------------+--------+------------------------+---------------------------------+
| userFile   | String | Filename containing    |                                 |
|            |        | usernames              |                                 |
+------------+--------+------------------------+---------------------------------+
| text       | String | String to tokenize     | c'est la vie                    |
+------------+--------+------------------------+---------------------------------+


doveadm import
==============

Import messages matching given search query

parameters::

    {
        "command": "import",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "subscribe",
                "type": "boolean"
            },
            {
                "name": "sourceLocation",
                "type": "string"
            },
            {
                "name": "destParentMailbox",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }

+-------------------+--------------+---------------------------------------+---------------------------------+
| Parameter         | Type         | Description                           | example                         |
+===================+==============+=======================================+=================================+
| socketPath        | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+-------------------+--------------+---------------------------------------+---------------------------------+
| allUsers          | Boolean      | apply operation to all users          |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| user              | String       | uid of user to apply import           |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| userFile          | String       | optionally fetch usernames from file. |                                 |
|                   |              | One username per line                 |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| subscribe         | Boolean      | when enabled possible newly created   |                                 |
|                   |              | folders are also subscribed           |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| sourceLocation    | String       | location of source mailboxes          |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| destParentMailbox | String       | destination parent mailbox where to   |                                 |
|                   |              | import                                |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+
| query             | String array | search query for messages to import   |                                 |
+-------------------+--------------+---------------------------------------+---------------------------------+


doveadm index
=============

Index user mailbox folder or folders.

parameters::

    {
        "command": "index",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "queue",
                "type": "boolean"
            },
            {
                "name": "maxRecent",
                "type": "string"
            },
            {
                "name": "mailboxMask",
                "type": "string"
            }
        ]
    }


+-------------+---------+---------------------------------------+---------------------------------+
| Parameter   | Type    | Description                           | example                         |
+=============+=========+=======================================+=================================+
| socketPath  | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+-------------+---------+---------------------------------------+---------------------------------+
| allUsers    | Boolean | apply operation to all users          |                                 |
+-------------+---------+---------------------------------------+---------------------------------+
| user        | String  | uid of user to index                  |                                 |
+-------------+---------+---------------------------------------+---------------------------------+
| userFile    | String  | optionally fetch usernames from file. |                                 |
|             |         | One username per line                 |                                 |
+-------------+---------+---------------------------------------+---------------------------------+
| queue       | Boolean | queue index operation for later       |                                 |
|             |         | execution                             |                                 |
+-------------+---------+---------------------------------------+---------------------------------+
| maxRecent   | String  | max number of recent mails to index   |                                 |
+-------------+---------+---------------------------------------+---------------------------------+
| mailboxMask | String  | mailbox search mask to apply indexing |                                 |
|             |         | into                                  |                                 |
+-------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "index",
            {
                "mailboxMask": "INBOX*",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["index",{"user":"samik","mailboxMask":"INBOX*"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm kick
============

Kick user from dovecot. Applicable to session in dovecot backend only.

parameters::

    {
        "command": "kick",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "force",
                "type": "boolean"
            },
            {
                "name": "mask",
                "type": "array"
            }
        ]
    }


+------------+---------+------------------------+---------------------------------+
| Parameter  | Type    | Description            | example                         |
+============+=========+========================+=================================+
| socketPath | String  | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+---------+------------------------+---------------------------------+
| force      | Boolean | Do a forced kick?      | false                           |
+------------+---------+------------------------+---------------------------------+
| mask       | String  | Uid mask               | testuser001                     |
+------------+---------+------------------------+---------------------------------+


example::

    [
        [
            "kick",
            {
                "force": false,
                "mask": "testuser001"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["kick", {"mask":"testuser001"}, "tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "result": "testuser001"
                }
            ],
            "tag1"
        ]
    ]


response::

    [
        [
            "error",
            {
                "exitCode": 68,
                "type": "exitCode"
            },
            "tag1"
        ]
    ]


doveadm log errors
==================

Fetch error log(s)

parameters::

    {
        "command": "logErrors",
        "parameters": [
            {
                "name": "since",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| since      | String | Datetime of earliest   | 2019-01-01 00:00:00             |
|            |        | log lines to fetch     |                                 |
+------------+--------+------------------------+---------------------------------+

example::

    [
        [
            "logErrors",
            {},
            "tag1"
        ]
    ]

.. code::

    curl -v -u doveadm:secretpassword -X POST -H "Content-Type: application/json" -d '[["logErrors",{},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

     [
        [
            "doveadmResponse",
            [
                {
                    "prefix": "stats",
                    "text": "Stats client input error: Invalid level",
                    "timestamp": "Dec 09 16:24:00",
                    "type": "Error"
                },
                {
                    "prefix": "doveadm(127.0.0.1)",
                    "text": "read(/var/run/dovecot/stats) unexpectedly disconnected",
                    "timestamp": "Dec 09 16:24:00",
                    "type": "Fatal"
                },
                {
                    "prefix": "stats",
                    "text": "Stats client input error: Invalid level",
                    "timestamp": "Dec 09 16:24:22",
                    "type": "Error"
                },
                {
                    "prefix": "stats",
                    "text": "Stats client input error: Invalid level",
                    "timestamp": "Dec 09 16:27:48",
                    "type": "Error"
                }
            ],
            "tag1"
        ]
     ]


doveadm mailbox create
======================

Create mailbox folder for user.

parameters::

    {
        "command": "mailboxCreate",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "subscriptions",
                "type": "boolean"
            },
            {
                "name": "guid",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "array"
            }
        ]
    }


+---------------+--------------+---------------------------------------+---------------------------------+
| Parameter     | Type         | Description                           | example                         |
+===============+==============+=======================================+=================================+
| socketPath    | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+---------------+--------------+---------------------------------------+---------------------------------+
| allUsers      | Boolean      | apply operation to all users          |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| user          | String       | uid to apply mailbox create           |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| userFile      | String       | optionally fetch usernames from file. |                                 |
|               |              | One username per line                 |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| subscriptions | Boolean      |                                       |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| mailbox       | String array | list of mailbox folders to create     |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxCreate",
            {
                "mailbox": [
                    "INBOX/myfolder"
                ],
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxCreate",{"user":"samik","mailbox":["INBOX/myfolder"]},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox delete
======================

Delete user mailbox folder.

parameters::

    {
        "command": "mailboxDelete",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "requireEmpty",
                "type": "boolean"
            },
            {
                "name": "subscriptions",
                "type": "boolean"
            },
            {
                "name": "recursive",
                "type": "boolean"
            },
            {
                "name": "unsafe",
                "type": "boolean"
            },
            {
                "name": "mailbox",
                "type": "array"
            }
        ]
    }

+---------------+--------------+---------------------------------------+---------------------------------+
| Parameter     | Type         | Description                           | example                         |
+===============+==============+=======================================+=================================+
| socketPath    | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+---------------+--------------+---------------------------------------+---------------------------------+
| allUsers      | Boolean      | apply operation to all users          |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| user          | String       | uid to apply delete                   |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| userFile      | String       | optionally fetch usernames from file. |                                 |
|               |              | One username per line                 |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| requireEmpty  | Boolean      | only delete if folder is empty        |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| subscriptions | Boolean      |                                       |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| recursive     | Boolean      | delete also subfolders                |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| unsafe        | Boolean      |                                       |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+
| mailbox       | String array | list of mailbox folders to create     |                                 |
+---------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxDelete",
            {
                "mailbox": [
                    "INBOX/myfolder"
                ],
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxDelete",{"user":"samik","mailbox":["INBOX/myfolder"]},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox list
====================

Fetch user mailbox folder list.

parameters::

    {
        "command": "mailboxList",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mutf7",
                "type": "boolean"
            },
            {
                "name": "utf8",
                "type": "boolean"
            },
            {
                "name": "subscriptions",
                "type": "boolean"
            },
            {
                "name": "mailboxMask",
                "type": "array"
            }
        ]
    }

+---------------+--------------+------------------------------------------+---------------------------------+
| Parameter     | Type         | Description                              | example                         |
+===============+==============+==========================================+=================================+
| socketPath    | String       | Path to doveadm socket                   | /var/run/dovecot/doveadm-server |
+---------------+--------------+------------------------------------------+---------------------------------+
| allUsers      | Boolean      | apply operation to all users             |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| user          | String       | uid to apply mailbox list                |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| userFile      | String       | optionally fetch usernames from file.    |                                 |
|               |              | One username per line                    |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| mutf7         | Boolean      |                                          |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| utf8          | Boolean      | fetch only certain fields instead of all |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| subscriptions | Boolean      |                                          |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+
| mailboxMask   | String array | fetch list of given mailboxes            |                                 |
+---------------+--------------+------------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxList",
            {
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxList",{"user":"samik"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "mailbox": "Junk"
                },
                {
                    "mailbox": "INBOX"
                }
            ],
            "tag1"
        ]
    ]


doveadm mailbox metadata get
============================

Get user mailbox metadata.

parameters::

    {
        "command": "mailboxMetadataGet",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            }
        ]
    }

+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid to apply metadata get             |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| key        | String  | metadata key to get                   |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxMetadataGet",
            {
                "key": "/private/comment",
                "mailbox": "INBOX",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxMetadataGet",{"user":"samik","mailbox":"INBOX","key":"/private/comment"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "value": "plaa"
                }
            ],
            "tag1"
        ]
    ]


doveadm mailbox metadata list
=============================

List user mailbox metadata.

parameters::

    {
        "command": "mailboxMetadataList",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "keyPrefix",
                "type": "string"
            },
            {
                "name": "prepend-prefix",
                "type": "boolean"
            }
        ]
    }


+----------------+---------+---------------------------------------+---------------------------------+
| Parameter      | Type    | Description                           | example                         |
+================+=========+=======================================+=================================+
| socketPath     | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+----------------+---------+---------------------------------------+---------------------------------+
| allUsers       | Boolean | apply operation to all users          |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| user           | String  | uid to apply metadata get             |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| userFile       | String  | optionally fetch usernames from file. |                                 |
|                |         | One username per line                 |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| key            | String  | metadata key to get                   |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| keyPrefix      | String  | search prefix for keys                |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| mailbox        | String  | mailbox to fetch metadata from        |                                 |
+----------------+---------+---------------------------------------+---------------------------------+
| prepend-prefix | Boolean | Prepend metadata type prefix          |                                 |
|                |         | ("/shared" or "/private") to name     |                                 |
|                |         |                                       |                                 |
|                |         | .. versionadded:: v2.3.14             |                                 |
+----------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxMetadataList",
            {
                "mailbox": "INBOX",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxMetadataList",{"user":"samik","mailbox":"INBOX"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "key": "comment"
                },
                {
                    "key": "specialuse"
                }
            ],
            "tag1"
        ]
    ]


doveadm mailbox metadata set
============================

Set user mailbox metadata.

.. code::

    {
        "command": "mailboxMetadataSet",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            },
            {
                "name": "value",
                "type": "string"
            }
        ]
    }


+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid to apply metadata set             |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| key        | String  | metadata key to set                   |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| value      | String  | metadata value to set                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxMetadataSet",
            {
                "key": "/private/comment",
                "mailbox": "INBOX",
                "user": "samik",
                "value": "test"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxMetadataSet",{"user":"samik","mailbox":"INBOX","key":"/private/comment","value":"test"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox metadata unset
==============================

Unset user mailbox metadata.

parameters::

    {
        "command": "mailboxMetadataUnset",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "key",
                "type": "string"
            }
        ]
    }


+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid to apply metadata unset           |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| key        | String  | metadata key to unset                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxMetadataUnset",
            {
                "key": "/private/comment",
                "mailbox": "INBOX",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxMetadataUnset",{"user":"samik","mailbox":"INBOX","key":"/private/comment"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox rename
======================

Rename user mailbox folder

parameters::

    {
        "command": "mailboxRename",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "subscriptions",
                "type": "boolean"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "newName",
                "type": "string"
            }
        ]
    }


+---------------+---------+---------------------------------------+---------------------------------+
| Parameter     | Type    | Description                           | example                         |
+===============+=========+=======================================+=================================+
| socketPath    | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+---------------+---------+---------------------------------------+---------------------------------+
| allUsers      | Boolean | apply operation to all users          |                                 |
+---------------+---------+---------------------------------------+---------------------------------+
| user          | String  | uid to apply mailbox rename           |                                 |
+---------------+---------+---------------------------------------+---------------------------------+
| userFile      | String  | optionally fetch usernames from file. |                                 |
|               |         | One username per line                 |                                 |
+---------------+---------+---------------------------------------+---------------------------------+
| subscriptions | Boolean |                                       |                                 |
+---------------+---------+---------------------------------------+---------------------------------+
| newName       | String  | mailbox new name                      |                                 |
+---------------+---------+---------------------------------------+---------------------------------+
| mailbox       | String  | mailbox to rename                     |                                 |
+---------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxRename",
            {
                "mailbox": "INBOX/myfolder",
                "newName": "INBOX/myfoldertoo",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxRename",{"user":"samik","mailbox":"INBOX/myfolder","newName":"INBOX/myfoldertoo"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox save
====================

Save mail into users mailbox

parameters::

    {
        "command": "save",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            },
            {
                "name": "file",
                "type": "string"
            }
        ]
    }


+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid of user to save mail into         |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| mailbox    | String  | mailbox to unsubscribe                |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| file       | String  | mail to inject                        |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "save",
            {
                "file": "From: Joulu Pukki <joulu.pukki@korvatunturi.fi>\nSubject: plaa\n\nmail body\n",
                "mailbox": "INBOX/myfoldertoo",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["save",{"user":"samik","mailbox":"INBOX/myfoldertoo","file":"From: Joulu Pukki <joulu.pukki@korvatunturi.fi>\nSubject: plaa\n\nmail body\n"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox status
======================

Fetch user mailbox status items

.. code::

    {
        "command": "mailboxStatus",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "totalSum",
                "type": "boolean"
            },
            {
                "name": "field",
                "type": "array"
            },
            {
                "name": "mailboxMask",
                "type": "array"
            }
        ]
    }

+-------------+--------------+---------------------------------------+---------------------------------+
| Parameter   | Type         | Description                           | example                         |
+=============+==============+=======================================+=================================+
| socketPath  | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+-------------+--------------+---------------------------------------+---------------------------------+
| allUsers    | Boolean      | apply operation to all users          |                                 |
+-------------+--------------+---------------------------------------+---------------------------------+
| user        | String       | uid to apply status fetch             |                                 |
+-------------+--------------+---------------------------------------+---------------------------------+
| userFile    | String       | optionally fetch usernames from file. |                                 |
|             |              | One username per line                 |                                 |
+-------------+--------------+---------------------------------------+---------------------------------+
| totalSum    | Boolean      |                                       |                                 |
+-------------+--------------+---------------------------------------+---------------------------------+
| field       | String array | fields to fetch                       | all                             |
+-------------+--------------+---------------------------------------+---------------------------------+
| mailboxMask | String array | fetch status on given mailboxes       |                                 |
+-------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxStatus",
            {
                "field": [
                    "all"
                ],
                "mailboxMask": [
                    "INBOX",
                    "INBOX/*",
                    "*"
                ],
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxStatus",{"user":"samik","field":["all"],"mailboxMask":["INBOX","INBOX/*","*"]},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "guid": "21b588150b156558eb3500007afd792c",
                    "highestmodseq": "5",
                    "mailbox": "Junk",
                    "messages": "0",
                    "recent": "0",
                    "uidnext": "1",
                    "uidvalidity": "1483019529",
                    "unseen": "0",
                    "vsize": "0"
                },
                {
                    "guid": "21b588150b156558eb3500007afd792c",
                    "highestmodseq": "5",
                    "mailbox": "INBOX",
                    "messages": "0",
                    "recent": "0",
                    "uidnext": "1",
                    "uidvalidity": "1483019529",
                    "unseen": "0",
                    "vsize": "0"
                }
            ],
            "tag1"
        ]
    ]


doveadm mailbox subscribe
=========================

Subscribe user to a mailbox.

parameters::

    {
        "command": "mailboxSubscribe",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "array"
            }
        ]
    }

+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid to apply subscribe                |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| mailbox    | String  | mailbox to subscribe                  |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxSubscribe",
            {
                "mailbox": "INBOX/myfoldertoo",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxSubscribe",{"user":"samik","mailbox":"INBOX/myfoldertoo"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox unsubscribe
===========================

Unsubscribe user from a folder.

parameters::

    {
        "command": "mailboxUnsubscribe",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "array"
            }
        ]
    }


+------------+---------+---------------------------------------+---------------------------------+
| Parameter  | Type    | Description                           | example                         |
+============+=========+=======================================+=================================+
| socketPath | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+---------+---------------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users          |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| user       | String  | uid to apply unsubscribe              |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| userFile   | String  | optionally fetch usernames from file. |                                 |
|            |         | One username per line                 |                                 |
+------------+---------+---------------------------------------+---------------------------------+
| mailbox    | String  | mailbox to unsubscribe                |                                 |
+------------+---------+---------------------------------------+---------------------------------+


example::

    [
        [
            "mailboxUnsubscribe",
            {
                "mailbox": "INBOX/myfoldertoo",
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["mailboxUnsubscribe",{"user":"samik","mailbox":"INBOX/myfoldertoo"},"tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]


doveadm mailbox update
======================

Set user mailbox information

parameters::

    {
        "command": "mailboxUpdate",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "mailboxGuid",
                "type": "string"
            },
            {
                "name": "uidValidity",
                "type": "string"
            },
            {
                "name": "minNextUid",
                "type": "string"
            },
            {
                "name": "minFirstRecentUid",
                "type": "string"
            },
            {
                "name": "minHighestModseq",
                "type": "string"
            },
            {
                "name": "minHighestPvtModseq",
                "type": "string"
            },
            {
                "name": "mailbox",
                "type": "string"
            }
        ]
    }

+---------------------+---------+---------------------------------------+---------------------------------+
| Parameter           | Type    | Description                           | example                         |
+=====================+=========+=======================================+=================================+
| socketPath          | String  | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+---------------------+---------+---------------------------------------+---------------------------------+
| allUsers            | Boolean | apply operation to all users          |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| user                | String  | uid to apply update                   |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| userFile            | String  | optionally fetch usernames from file. |                                 |
|                     |         | One username per line                 |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| mailbox             | String  | mailbox to unsubscribe                |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| mailboxGuid         | String  | set mailbox guid                      |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| uidValidity         | String  | set mailbox uidvalidity               |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| minNextUid          | String  | set mailbox minimum next uid          |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| minFirstRecentuid   | String  | set mailbox minimum recent uid        |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| minHighestModseq    | String  | set minimum highest modification seq  |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+
| minHighestPvtModseq | String  | set minimum highest private           |                                 |
|                     |         | modification seq                      |                                 |
+---------------------+---------+---------------------------------------+---------------------------------+


doveadm metacache clean
=======================

Clean metacache content for given user or all users

parameters::

    {
        "command": "metacacheClean",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "days",
                "type": "integer"
            },
            {
                "name": "namespace",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm metacache flush
=======================

Flush metacache contents to storage for given user or all users

parameters::

        "command": "metacacheFlush",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "namespace",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm metacache flushall
==========================

Flush metacache to storage for all users

parameters::

    {
        "command": "metacacheFlushall",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm metacache list
======================

List local metacache contents

parameters::

    {
        "command": "metacacheList",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm metacache remove
========================

Remove metacache for given mask

parameters::

    {
        "command": "metacacheRemove",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "mask",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm metacache unpack
========================

Unpack metacache index bundle to target directory

parameters::

    {
        "command": "metacacheUnpack",
        "parameters": [
            {
                "name": "bundleName",
                "type": "string"
            },
            {
                "name": "bundle",
                "type": "string"
            },
            {
                "name": "destinationDirectory",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm move
============

Move messages matching the given search query into another mailbox

parameters::

    {
        "command": "move",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "destinationMailbox",
                "type": "string"
            },
            {
                "name": "sourceType",
                "type": "string"
            },
            {
                "name": "sourceUser",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm obox user delete
========================

Delete user data from storage, Cassandra and local caches (metacache and
fscache).

parameters::

    {
        "command": "oboxUserDelete",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


example::

    [
        [
            "oboxUserDelete",
            {
                "allUsers": false,
                "socketPath": "",
                "user": "testuser003",
                "userFile": ""
            },
            "tag1"
        ]
    ]

.. code::

    curl -v -u doveadm:secretpassword -X POST -H "Content-Type: application/json" -d '[["oboxUserDelete", {"allUsers":false,"user":"testuser003"}, "tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [],
            "tag1"
        ]
    ]

.. note::

   .. versionadded:: v2.3.12.1 This command returns a specific exit code (65)
        in the failure response, if the deletion is not possible as the index
        is still open in another process.


doveadm penalty
===============

Show current login penalties

parameters::

    {
        "command": "penalty",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "netmask",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------------------------+---------------------------------+
| Parameter  | Type   | Description                              | example                         |
+============+========+==========================================+=================================+
| socketPath | String | Path to doveadm socket                   | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------------------------+---------------------------------+
| netmask    | String | To reduce/filter the output supply an IP | 10.0.0.0/24                     |
|            |        | address or a network range in            |                                 |
|            |        | CIDRnotation (ip/mask)                   |                                 |
+------------+--------+------------------------------------------+---------------------------------+


example::

    [
        [
            "penalty",
            {},
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["penalty",{},"tag1"]] ' http://localhost:8080/doveadm/v1


doveadm proxy kick
==================

Kick user session from proxy. applicable to imap/pop3/managesieve sessions

parameters::

    {
        "command": "proxyKick",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| user       | String | userid to kick         | samik                           |
+------------+--------+------------------------+---------------------------------+


example::

    [
        [
            "proxyKick",
            {
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["proxyKick",{"user":"samik"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [
                {
                    "count": "1"
                }
            ],
            "tag1"
        ]
    ]


doveadm proxy list
==================

List active connections in the dovecot proxy

parameters::

    {
        "command": "proxyList",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


example::

    [
        [
            "proxyList",
            {},
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["proxyList",{},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [
                {
                    "dest-ip": "127.0.0.1",
                    "dest-port": "1143",
                    "service": "imap",
                    "src-ip": "10.0.0.153",
                    "username": "samik"
                }
            ],
            "tag1"
        ]
    ]


doveadm purge
=============

Remove messages with refcount=0 from mdbox files

parameters::

    {
        "command": "purge",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            }
        ]
    }


+------------+---------+------------------------------+---------------------------------+
| Parameter  | Type    | Description                  | example                         |
+============+=========+==============================+=================================+
| socketPath | String  | Path to doveadm socket       | /var/run/dovecot/doveadm-server |
+------------+---------+------------------------------+---------------------------------+
| allUsers   | Boolean | apply operation to all users |                                 |
+------------+---------+------------------------------+---------------------------------+
| user       | String  | uid of user to apply purge   |                                 |
+------------+---------+------------------------------+---------------------------------+


doveadm reload
==============

Reload dovecot configuration


parameters::

    {
        "command": "reload",
        "parameters": []
    }


example::

    [
        [
            "reload",
            {},
            "tag1"
        ]
    ]

.. code::

 curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["reload",{},"tag1"]]' http://localhost:8080/doveadm/v1


doveadm search
==============

Show a list of mailbox GUIDs and message UIDs matching given search query

parameters::

    {
        "command": "search",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "query",
                "type": "array"
            }
        ]
    }

+------------+--------------+---------------------------------------+---------------------------------+
| Parameter  | Type         | Description                           | example                         |
+============+==============+=======================================+=================================+
| socketPath | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+------------+--------------+---------------------------------------+---------------------------------+
| allUsers   | Boolean      | apply operation to all users          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| userFile   | String       | optionally fetch usernames from file. |                                 |
|            |              | One username per line                 |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| user       | String       | uid of user to apply purge            |                                 |
+------------+--------------+---------------------------------------+---------------------------------+
| query      | String array | search query                          |                                 |
+------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "search",
            {
                "query": [
                    "mailbox",
                    "INBOX*",
                    "all"
                ],
                "user": "samik"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["search",{"user":"samik","query":["mailbox","INBOX*","all"]},"tag1"]] ' http://localhost:8080/doveadm/v1 


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "mailbox-guid": "cf497f128caf7c58612200007afd792c",
                    "uid": "1"
                }
            ],
            "tag1"
        ]
    ]


doveadm service stop
====================

Stop one or more dovecot services on target host

.. code::

    {
        "command": "serviceStop",
        "parameters": [
            {
                "name": "service",
                "type": "array"
            }
        ]
    }

+-----------+--------------+-------------------------+---------------------------+
| Parameter | Type         | Description             | example                   |
+===========+==============+=========================+===========================+
| service   | String array | Name of service to stop | ["imap","imap-hibernate"] |
+-----------+--------------+-------------------------+---------------------------+


example::

    [
        [
            "serviceStop",
            {
                "service": [
                    "imap",
                    "imap-hibernate"
                ]
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["serviceStop",{"service":["imap","imap-hibernate"]},"tag1"]] ' http://localhost:8080/doveadm/v1


doveadm sieve activate
======================
Activate user sieve script

parameters::

    {
        "command": "sieveActivate",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "scriptname",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve deactivate
========================

Deactivate user sieve

parameters::

    {
        "command": "sieveDeactivate",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve delete
====================

Delete user sieve script

parameters::

    {
        "command": "sieveDelete",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "ignoreActive",
                "type": "boolean"
            },
            {
                "name": "scriptname",
                "type": "array"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve get
=================

Get user sieve script

parameters::

    {
        "command": "sieveGet",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "scriptname",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve list
==================

List user sieve scripts

parameters::

    {
        "command": "sieveList",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve put
=================

Upload sieve script to user. Existing script is overwritten.

parameters::

    {
        "command": "sievePut",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "activate",
                "type": "boolean"
            },
            {
                "name": "scriptname",
                "type": "string"
            },
            {
                "name": "file",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm sieve rename
====================

Rename user sieve script

parameters::

    {
        "command": "sieveRename",
        "parameters": [
            {
                "name": "allUsers",
                "type": "boolean"
            },
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "user",
                "type": "string"
            },
            {
                "name": "userFile",
                "type": "string"
            },
            {
                "name": "oldname",
                "type": "string"
            },
            {
                "name": "newname",
                "type": "string"
            }
        ]
    }

+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


doveadm oldstats dump
=====================

Dump collected dovecot statistics

.. code::

      {
         "command": "oldStatsDump",
         "parameters": [
             {
                 "name": "socketPath",
                 "type": "string"
             },
             {
                 "name": "type",
                 "type": "string"
             },
             {
                 "name": "filter",
                 "type": "string"
             }
         ]
     }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+
| type       | String | Type of stats to dump  | global                          |
+------------+--------+------------------------+---------------------------------+
| filter     | String | Dump filter            | last_update 1483101542          |
+------------+--------+------------------------+---------------------------------+


example::

    [
        [
            "oldStatsDump",
            {
                "type": "global"
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["oldStatsDump",{"type":"global"},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            [
                {
                    "auth_cache_hits": "0",
                    "auth_cache_misses": "0",
                    "auth_db_tempfails": "0",
                    "auth_failures": "0",
                    "auth_master_successes": "0",
                    "auth_successes": "0",
                    "clock_time": "0.0",
                    "disk_input": "0",
                    "disk_output": "0",
                    "fscache_read": "0",
                    "fscache_stat": "0",
                    "fscache_write": "0",
                    "fts_read": "0",
                    "fts_write": "0",
                    "fts_iter": "0",
                    "fts_cached_read": "0",
                    "fts_wbytes": "0",
                    "idx_del": "0",
                    "idx_iter": "0",
                    "idx_read": "0",
                    "idx_read_usecs": "0",
                    "idx_wbytes": "0",
                    "idx_write": "0",
                    "idx_write_usecs": "0",
                    "invol_cs": "0",
                    "last_update": "0.000000",
                    "mail_cache_hits": "0",
                    "mail_lookup_attr": "0",
                    "mail_lookup_path": "0",
                    "mail_read_bytes": "0",
                    "mail_read_count": "0",
                    "maj_faults": "0",
                    "min_faults": "0",
                    "num_cmds": "0",
                    "num_connected_sessions": "0",
                    "num_logins": "0",
                    "obox_copy": "0",
                    "obox_del": "0",
                    "obox_iter": "0",
                    "obox_read": "0",
                    "obox_read_usecs": "0",
                    "obox_stat": "0",
                    "obox_wbytes": "0",
                    "obox_write": "0",
                    "obox_write_usecs": "0",
                    "read_bytes": "0",
                    "read_count": "0",
                    "reset_timestamp": "1483104199",
                    "sys_cpu": "0.0",
                    "user_cpu": "0.0",
                    "vol_cs": "0",
                    "write_bytes": "0",
                    "write_count": "0"
                }
            ],
            "tag1"
        ]
    ]


doveadm oldstats reset
======================

Reset dovecot statistics counters

parameters::

    {
        "command": "oldStatsReset",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            }
        ]
    }


+------------+--------+------------------------+---------------------------------+
| Parameter  | Type   | Description            | example                         |
+============+========+========================+=================================+
| socketPath | String | Path to doveadm socket | /var/run/dovecot/doveadm-server |
+------------+--------+------------------------+---------------------------------+


example::

    [
        [
            "oldStatsReset",
            {},
            "tag1"
        ]
    ]

.. code::

    curl -v -u doveadm:secretpassword -X POST http://localhost:8080/doveadm/v1 -H "Content-Type: application/json" -d '[["oldStatsReset",{},"tag1"]] ' http://localhost:8080/doveadm/v1


doveadm stop
============

Shutdown dovecot.

.. code::

    {
        "command": "stop",
        "parameters": []
    }

example::

    [
        [
            "stop",
            {},
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["stop",{},"tag1"]] ' http://localhost:8080/doveadm/v1


doveadm user
============

Do a userdb lookup for an user

parameters::

    {
        "command": "user",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "authInfo",
                "type": "array"
            },
            {
                "name": "field",
                "type": "string"
            },
            {
                "name": "expandField",
                "type": "string"
            },
            {
                "name": "userdbOnly",
                "type": "boolean"
            },
            {
                "name": "userMask",
                "type": "array"
            }
        ]
    }


+-------------+--------------+-----------------------------------------+---------------------------------+
| Parameter   | Type         | Description                             | example                         |
+=============+==============+=========================================+=================================+
| socketPath  | String       | Path to doveadm socket                  | /var/run/dovecot/doveadm-server |
+-------------+--------------+-----------------------------------------+---------------------------------+
| authInfo    | String array | ``auth_info``  specifies additional     | [service=imap]                  |
|             |              | conditions for the user command.        |                                 |
|             |              | The ``auth_info`` option string has to  |                                 |
|             |              | be given as ``name = value`` pair.      |                                 |
|             |              | times. Possible names for the value are:|                                 |
|             |              |                                         |                                 |
|             |              | service                                 |                                 |
|             |              |    The service for which the            |                                 |
|             |              |    userdb        should be tested. The  |                                 |
|             |              |    value may be the name of a service,  |                                 |
|             |              |    commonly used with Dovecot. For      |                                 |
|             |              |    example: imap , pop3 or smtp.        |                                 |
|             |              | lip                                     |                                 |
|             |              |    The local IP address (server) for the|                                 |
|             |              |    test.                                |                                 |
|             |              | rip                                     |                                 |
|             |              |    The remote IP address (client) for   |                                 |
|             |              |    the test.                            |                                 |
|             |              | lport                                   |                                 |
|             |              |    The local port, e.g. 143             |                                 |
|             |              | rport                                   |                                 |
|             |              |    The remote port, e.g. 24567          |                                 |
+-------------+--------------+-----------------------------------------+---------------------------------+
| field       | String       | fetch only one specified field instead  |                                 |
|             |              | of all                                  |                                 |
+-------------+--------------+-----------------------------------------+---------------------------------+
| expandField | String       | expand configuration variable with user |                                 |
|             |              | specific values                         |                                 |
+-------------+--------------+-----------------------------------------+---------------------------------+
| userdbOnly  | Boolean      | only fetch from userdb lookup and don't |                                 |
|             |              | process passdb                          |                                 |
+-------------+--------------+-----------------------------------------+---------------------------------+
| userMask    | String array | search filter                           |                                 |
+-------------+--------------+-----------------------------------------+---------------------------------+


example::

    [
        [
            "user",
            {
                "userMask": [
                    "samik"
                ]
            },
            "tag1"
        ]
    ]

.. code::

    curl  -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '[["user",{"userMask":["samik"]},"tag1"]] ' http://localhost:8080/doveadm/v1

response::

    [
        [
            "doveadmResponse",
            {
                "samik": {
                    "gid": "1000",
                    "home": "/var/vmail/samik",
                    "junkflag": "0",
                    "mail": "Maildir:/mails/mails/samik/Maildir",
                    "namespace/Junk/hidden": "no",
                    "namespace/Junk/list": "yes",
                    "uid": "1000"
                }
            },
            "tag1"
        ]
    ]


doveadm who
===========

List active dovecot sessions.

parameters::

    {
        "command": "who",
        "parameters": [
            {
                "name": "socketPath",
                "type": "string"
            },
            {
                "name": "separateConnections",
                "type": "boolean"
            },
            {
                "name": "mask",
                "type": "array"
            }
        ]
    }

+---------------------+--------------+---------------------------------------+---------------------------------+
| Parameter           | Type         | Description                           | example                         |
+=====================+==============+=======================================+=================================+
| socketPath          | String       | Path to doveadm socket                | /var/run/dovecot/doveadm-server |
+---------------------+--------------+---------------------------------------+---------------------------------+
| separateConnections | Boolean      | Show each user connection in separate | false                           |
|                     |              | entries                               |                                 |
+---------------------+--------------+---------------------------------------+---------------------------------+
| mask                | String array | Uid mask                              | testuser001                     |
+---------------------+--------------+---------------------------------------+---------------------------------+


example::

    [
        [
            "who",
            {
                "mask": "",
                "separateConnections": false,
                "socketPath": ""
            },
            "tag1"
        ]
    ]

.. code::

    curl  -v -u doveadm:secretpassword -X POST -H "Content-Type: application/json" -d '[["who", {}, "tag1"]] ' http://localhost:8080/doveadm/v1


response::

    [
        [
            "doveadmResponse",
            [
                {
                    "connections": "1",
                    "ips": "(127.0.0.1)",
                    "pids": "(4999)",
                    "service": "imap",
                    "username": "testuser001"
                }
            ],
            "tag1"
        ]
    ]

