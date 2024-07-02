---
layout: doc
title: Startup Scripts
order: 5
dovecotlinks:
  startup_scripts: startup scripts
---

# Startup Scripts

## Launchd plist File

This file is for Mac OS X 10.4 and later. For 10.3 and earlier StartupItems
must be used.

Save it under `/Library/LaunchDaemons/` with `.plist` extension (e.g.
`org.dovecot.dovecot.plist`, following naming conventions of Apple and other
vendors).

Ownership should be `root:wheel`.

```xml
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
```

If Dovecot is not started as a foreground process, launchd will keep
restarting it until the "No authentication sockets found" error message
shows up in the logs and further logins are denied.

## Sample Dovecot init.d Script

This is a basic init script that should work in all operating systems.

Place it in `/etc/init.d/dovecot` and change the DAEMON path if needed.

```
### BEGIN INIT INFO
# Provides:          dovecot
# Required-Start:    $local_fs $remote_fs $network $syslog $time
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Should-Start:      postgresql mysql slapd winbind
# Should-Stop:       postgresql mysql slapd winbind
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Dovecot init script
# Description:       Init script for dovecot services
### END INIT INFO

# Example /etc/init.d/dovecot script. Change DAEMON if necessary.
# License is public domain.

DAEMON=/usr/local/sbin/dovecot

# Uncomment to allow Dovecot daemons to produce core dumps.
#ulimit -c unlimited

test -x $DAEMON || exit 1
set -e

base_dir=`$DAEMON config -h base_dir`
pidfile=$base_dir/master.pid

if test -f $pidfile; then
  running=yes
else
  running=no
fi

case "$1" in
start)
  echo -n "Starting Dovecot"
  $DAEMON
  echo "."
  ;;
stop)
  if test $running = yes; then
    echo "Stopping Dovecot"
    kill `cat $pidfile`
    echo "."
  else
    echo "Dovecot is already stopped."
  fi
  ;;
reload)
  if test $running = yes; then
    echo -n "Reloading Dovecot configuration"
    kill -HUP `cat $pidfile`
    echo "."
  else
    echo "Dovecot isn't running."
  fi
  ;;
restart|force-reload)
  echo -n "Restarting Dovecot"
  if test $running = yes; then
    kill `cat $pidfile`
    sleep 1
  fi
  $DAEMON
  echo "."
  ;;
*)
  echo "Usage: /etc/init.d/dovecot {start|stop|reload|restart|force-reload}" >&2
  exit 1
  ;;
esac

exit 0
```
