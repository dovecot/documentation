Dovecot supports moving connections that have issued IDLE to a special holding
process, called `imap-hibernate`. This process is responsible for holding the
idling connections until they issue some command that requires them to be
thawed back into a (new) imap process. This way, memory and CPU resources
are saved, since there is only one hibernation process.
