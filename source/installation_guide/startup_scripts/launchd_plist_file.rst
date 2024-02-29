.. _launchd_plist_file:

==================
Launchd plist File
==================

This file is for Mac OS X 10.4 and later. For 10.3 and earlier StartupItems must be used.

Save it under ``/Library/LaunchDaemons/`` with ``.plist`` extension (e.g. ``org.dovecot.dovecot.plist``, following naming conventions of Apple and other vendors).

Ownership should be ``root:wheel``.

.. code-block:: none

   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
        <key>Label</key>
        <string>org.dovecot</string>
        <key>OnDemand</key>
        <false/>
        <key>ProgramArguments</key>
        <array>
                <string>/usr/local/sbin/dovecot</string>
                <string>-F</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>ServiceDescription</key>
        <string>Dovecot mail server</string>
   </dict>
   </plist>

If Dovecot is not started as a foreground process, launchd will keep restarting it until the "No authentication sockets found" error message shows up in the logs and further logins are denied.
