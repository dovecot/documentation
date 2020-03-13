.. _plugin-fts-parser-tika:

==========================
fts parser tika plugin
==========================

``fts-parser-tika-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-parser-tika-setting_fts_tika:

``fts_tika``
---------------
.. versionadded:: 2.2.13

``http://tikahost:9998/tika/``: This URL needs to be running Apache Tika server
(e.g. started with java -jar tika-server/target/tika-server-1.5.jar)

URL for TIKA decoder for attachments.


``fts-parser-script-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-parser-tika-setting_fts_decoder:

``fts_decoder``
---------------

New in version 2.1.

Decode attachments to plaintext using this service and index the resulting
plaintext. See the decode2text.sh script included in Dovecot for how to use
this.

Example on both:

.. code-block:: none

  plugin {
    fts_decoder = decode2text
    fts_tika = http://tikahost:9998/tika/
  }

  service decode2text {
    executable = script /usr/lib/dovecot/decode2text.sh
    user = vmail
    unix_listener decode2text {
      mode = 0666
    }
  }
