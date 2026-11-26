 * A `local_name` filter nested inside another `local_name` filter must now
   be a hostname that matches the outer filter's name, the same way as a
   nested `local` or `remote` network must be inside the outer network. For
   example `local_name *.example.com { local_name imap.example.com { .. } }`
   is allowed, but `local_name *.example.com { local_name imap.example.org
   { .. } }` or an inner name with a wildcard now fails the config parsing.
   Previously such blocks were accepted, but their settings applied only to
   connections matching both names, which was usually nothing. See
   [[link,settings_connection_filters]].
