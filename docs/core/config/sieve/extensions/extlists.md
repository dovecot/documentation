---
layout: doc
title: Extlists
dovecotlinks:
  sieve_extlists: Sieve extlists extension
---

# Sieve: Extlists Extension

The extlists extension ([[rfc,6134]]) enables Sieve scripts to check membership
of a value in an external list or for redirecting messages to an external list
of recipients. An "external list" is a list whose members are stored externally
to the Sieve script. This extension adds a new ":list" match type to apply to
supported tests and it can be be used to implement email whitelisting,
blacklisting, addressbook lookups, and other sorts of list matching.

For Dovecot, the external list is always implemented using a dict lookup.
Redirecting messages to a list of recipients as described in the standard
([[rfc,6134]]) is currently not implemented in Dovecot and will always trigger
an error if used.

## Configuration

The extlists extension is not available by default and needs to be
enabled explicitly by adding it to [[setting,sieve_extensions]].

### Settings

<SettingsComponent tag="sieve-extlists" level="3" />

### Example

```
# Use extlists
sieve_extensions {
  extlists = yes
}

# No value looked up from a list may exceed 512 bytes, or it will forcibly not
# match
sieve_extlists_list_max_lookup_size = 512

# The default addressbook stored in a proxied dict
sieve_extlists_list :addrbook:default {
  dict proxy {
    name = addressbook
  }
}

sieve_extlists_list tag:example.com,2025-02-26:BadFileExts {
  dict proxy {
    name = bad_file_extensions
  }

  # Limit lookups to 10 bytes
  max_lookup_size = 10B
}

```

## Sieve Example

The following example excludes senders listed in the user's default address book
from Spam filtering. The example demonstrates the use of the
[[link,sieve_spamtest,spamtest extension]] as well.

```
require ["envelope", "extlists", "fileinto", "spamtest",
         "relational", "comparator-i;ascii-numeric"];

if allof( not envelope :list "from" ":addrbook:default",
	  spamtest :value "ge" :comparator "i;ascii-numeric" "3" ) {
  fileinto "spam";
}
```






