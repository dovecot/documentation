.. _fs-compress:

==================
fs-compress plugin
==================

It can be used by any of the settings using the :ref:`FS backends <fs>` (e.g.
:dovecot_plugin:ref:`obox`, :dovecot_plugin:ref:`fts_dovecot`, etc.)

The exact location where to set it in the FS backend hierarchy depends on what
other FS backends are being used.

The important rules are:

 * Must be set before the final storage backend (s3, sproxyd, ...)
 * Should be set after fscache (you generally don't want fscache to be
   compressed for performance reasons).
 * Must be set before :ref:`fs-crypt`, because encrypted data compresses
   poorly.

Settings
========

.. dovecot_core:setting:: fs_compress_write_method
   :values: @string

   Which :ref:`compression method <compress_methods>` to use for writing
   new files.


.. dovecot_core:setting:: fs_compress_read_plain_fallback
   :values: @boolean
   :default: no

   By default fs-compress fails if the file wasn't compressed. If this setting
   is enabled, the file is returned as-is (i.e. allows reading plaintext files).

Example Configuration
---------------------

.. code-block:: none

  fs_compress_write_method = zstd
  obox {
    fs fscache {
      size = 512M
      path = /var/cache/mails/%4Nu
    }
    fs compress {
    }
    fs s3 {
      url = https://ACCESSKEY:SECRET@s3.example.com/
      bucket = mails
    }
  }
  fts_dovecot {
    fs fscache {
      size = 512M
      path = /var/cache/fts/%4Nu
    }
    fs compress {
    }
    fs s3 {
      url = https://ACCESSKEY:SECRET@s3.example.com/%8Mu/%u/fts/
      bucket = mails
    }
  }

Note that these both work and don't have any practical difference, because
fs-dictmap doesn't modify the object contents in any way:

.. code-block:: none

  # compress before dictmap
  metacache {
    fs compress {
    }
    fs dictmap {
    }
    fs sproxyd {
    }
  }

  # compress after dictmap
  metacache {
    fs dictmap {
    }
    fs compress {
    }
    fs sproxyd {
    }
  }

With encryption enabled:

.. code-block:: none

  obox {
    fs fscache {
      size = 512M
      path = /var/cache/mails/%4Nu
    }
    fs compress {
    }
    fs crypt {
    }
    fs s3 {
      url = https://ACCESSKEY:SECRET@s3.example.com/
      bucket = mails
    }
  }
