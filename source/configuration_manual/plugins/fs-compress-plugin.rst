.. _fs-compress:

==================
fs-compress plugin
==================

It can be used by any of the settings using the :ref:`FS backends <fs>` (e.g.
:dovecot_plugin:ref:`obox_fs`, :dovecot_plugin:ref:`fts_dovecot_fs`, etc.)

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
    fs_driver = fscache
    fs_fscache_size = 512M
    fs_fscache_path = /var/cache/mails/%4Nu
    fs_s3_url = https://ACCESSKEY:SECRET@s3.example.com/
    fs_s3_bucket = mails
    fs_parent {
      fs_driver = compress
      fs_parent {
        fs_driver = s3
      }
    }
  }
  fts_dovecot {
    fs_driver = fscache
    fs_fscache_size = 512M
    fs_fscache_path = /var/cache/fts/%4Nu
    fs_s3_url = https://ACCESSKEY:SECRET@s3.example.com/%8Mu/%u/fts/
    fs_s3_bucket = mails
    fs_parent {
      fs_driver = compress
      fs_parent {
        fs_driver = s3
      }
    }
  }

Note that these both work and don't have any practical difference, because
fs-dictmap doesn't modify the object contents in any way:

.. code-block:: none

  # compress before dictmap
  metacache {
    fs_driver = compress
    fs_parent {
      fs_driver = dictmap
      fs_parent {
        fs_driver = sproxyd
      }
    }
  }

  # compress after dictmap
  metacache {
    fs_driver = dictmap
    fs_parent {
      fs_driver = compress
      fs_parent {
        fs_driver = sproxyd
      }
    }
  }

With encryption enabled:

.. code-block:: none

  obox {
    fs_driver = fscache
    fs_fscache_size = 512M
    fs_fscache_path = /var/cache/mails/%4Nu
    fs_s3_url = https://ACCESSKEY:SECRET@s3.example.com/
    fs_s3_bucket = mails
    fs_parent {
      fs_driver = compress
      fs_parent {
        fs_driver = crypt
	fs_parent {
          fs_driver = s3
	}
      }
    }
  }
