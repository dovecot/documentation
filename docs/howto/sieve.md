---
layout: doc
title: Sieve Examples
---

# Sieve Examples

Below are some simple Sieve code examples, more can be found at
http://sieve.info/examplescripts.

## Mail Filtering by Various Headers

### Use if/elsif/else to store messages into various folders/subfolders

```
require ["fileinto", "envelope"];
if address :is "to" "dovecot@dovecot.org" {
    fileinto "Dovecot-list";
} elsif envelope :is "from" "owner-cipe-l@inka.de" {
    fileinto "lists.cipe";
} elsif anyof (header :contains "X-listname" "lugog@cip.rz.fh-offenburg.de",
               header :contains "List-Id" "Linux User Group Offenburg") {
    fileinto "ml.lugog";
} else {
    # The rest goes into INBOX
    # default is "implicit keep", we do it explicitly here
    keep;
}
```

"anyof" means logical OR, "allof" is AND.

### Forward mails with "order" or "buy" in their subject to another address

```
if header :contains "subject" ["order", "buy"] {
    redirect "orders@company.dom";
}
```

Message-ID and recipient of forwarded message are stored in a
`.dovecot.lda-dupes` at users home directory to prevent mail loops.

## Flagging or Highlighting your Mail

Some mail readers use these flags:

```
require "imap4flags";
require "regex";
if anyof (exists "X-Cron-Env",
          header :regex    ["subject"] [".* security run output",
                                        ".* monthly run output",
                                        ".* daily run output",
                                        ".* weekly run output"]) {
    addflag "$label1"; # ie 'Important'/red label within Thunderbird

# Other flags:
# addflag "$label1";  # Important: #ff0000 => red
# addflag "$label2";  # Work:      #ff9900 => orange
# addflag "$label3";  # personal:  #009900 => green
# addflag "$label4";  # todo:      #3333ff => blue
# addflag "$label5";  # later:     #993399 => violet
#
}
```

Local copy of your emails:

```
require ["envelope", "imap4flags"];
if envelope "from" "my_address@my_domain.com" {
    setflag "\\seen";
}
```

Useful, when you want sieve to manage your incoming **and** outgoing
email (you must ask your mail reader to Bcc your mail to your dovecot in
this case).

## Spam/Virus Rules

Most spam and virus scanners add a special header to mail messages, so
that users can apply filtering accordingly. Depending on how the Sieve
interpreter is configured, filtering can either be performed by
evaluating these headers directly, or using the spamtest and virustest
extensions.

### Direct filtering using message header

Evaluating the headers directly is always possible as long as the
headers are actually added to the messages by the scanner software. For
example, to file SpamAssassin-tagged mails into a folder called "Spam":

```
require "fileinto";
if header :contains "X-Spam-Flag" "YES" {
    fileinto "Spam";
}
```

The following example discards SpamAssassin-tagged mails with level
higher than or equal to 10:

```
if header :contains "X-Spam-Level" "**********" {
    discard;
    stop;
}
```

Some spam scanners only produce a numeric score in a header. Then, the
test becomes more involved:

```
require ["comparator-i;ascii-numeric","relational"];

if allof ( not header :matches "x-spam-score" "-*",
           header :value "ge" :comparator "i;ascii-numeric" "x-spam-score" "10" ) {
    discard;
    stop;
}
```

::: info
Be very careful when matching against spam score headers using
the relational extension and the i;ascii-numeric comparator. This
comparator can only be used to match unsigned integers. Strings that do
not begin with a digit character represent positive infinity and will
therefore always be larger than any score mentioned in your rule! That
is why the above example first checks the minus sign explicitly.
:::

### Filtering using the spamtest and virustest extensions

When the [[link,sieve_spamtest]] and [[link,sieve_virustest]] extensions are
configured on the server, users (and GUIs) can have a much easier way
to filter spam and virus messages respectively. To filter spam, the spamtest
extension can for example be used as follows:

```
require "spamtestplus";
require "fileinto";
require "relational";
require "comparator-i;ascii-numeric";

/* If the spamtest fails for some reason, e.g. spam header is missing, file
 * file it in a special folder. */
if spamtest :value "eq" :comparator "i;ascii-numeric" "0" {
    fileinto "Unclassified";

/* If the spamtest score (in the range 1-10) is larger than or equal to 3,
 * file it into the spam folder: */
} elsif spamtest :value "ge" :comparator "i;ascii-numeric" "3" {
    fileinto "Spam";

/* For more fine-grained score evaluation, the :percent tag can be used. The
 * following rule discards all messages with a percent score
 * (relative to maximum) of more than 85 %: */
} elsif spamtest :value "gt" :comparator "i;ascii-numeric" :percent "85" {
    discard;
}

/* Other messages get filed into INBOX */
```

The virustest extension can be used in a similar manner:

```
require "virustest";
require "fileinto";
require "relational";
require "comparator-i;ascii-numeric";

/* Not scanned ? */
if virustest :value "eq" :comparator "i;ascii-numeric" "0" {
    fileinto "Unscanned";

/* Infected with high probability (value range in 1-5) */
} elsif virustest :value "eq" :comparator "i;ascii-numeric" "4" {
    /* Quarantine it in special folder (still somewhat dangerous) */
    fileinto "Quarantine";

/* Definitely infected */
} elsif virustest :value "eq" :comparator "i;ascii-numeric" "5" {
    /* Just get rid of it */
    discard;
}
```

## Plus Addressed Mail Filtering

Using the subaddress ([[rfc,5233]]) extension, it is possible to match
against the 'detail' part of an e-mail address, e.g. a `+tag` suffix to the
local part of the address.

This is for example useful when you don't want just any +tag to
create a directory, but you want to use tagged addresses such as with
amavisd-new.

This example would place email addressed to user+spam@example.com into
user's Spam folder.

```
require ["fileinto", "envelope", "subaddress"];
if envelope :detail "to" "spam"{
    fileinto "Spam";
}
```

The following more advanced example uses the subaddress extension to handle
recipient addresses structured as `sales+<name>@company.com` in a
special way. The `<name>` part is extracted from the address using
[[link,sieve_variables]] extension, transformed into a format with the
first letter in upper case and subsequently used to create the folder
name where the message is stored.

The folder name is structured as `users/<name>`. If the `+<name>`
detail is omitted from the recipient address, the message is filed in
the `sales` folder.

```
require ["variables", "envelope", "fileinto", "subaddress"];

if envelope :is :user "to" "sales" {
    if envelope :matches :detail "to" "*" {
        /* Save name in ${name} in all lowercase except for the first letter.
         * Joe, joe, jOe thus all become 'Joe'. */
        set :lower :upperfirst "name" "${1}";
    }

    if string :is "${name}" "" {
        /* Default case if no detail is specified */
        fileinto "sales";
    } else {
        /* For sales+joe@ this will become users/Joe */
        fileinto "users/${name}";
    }
}
```

To work with Postfix, this requires that the envelope "to" still
contains the full address, so pass it with the -a flag.

```
dovecot unix    -       n       n       -       -      pipe
    flags=DRhu user=mail:mail argv=/usr/local/libexec/dovecot/dovecot-lda
    -f ${sender} -d ${user}@${nexthop} -a ${original_recipient}
```

or

```
mailbox_command = /usr/lib/dovecot/dovecot-lda -a "$RECIPIENT"
```

## Vacation auto-reply

Auto-responder functionality is implemented using the [[link,sieve_vacation]]
extension. The following script sends out-of-office replies when the message
is not spam:

```
require ["fileinto", "vacation"];

# Move spam to spam folder
if header :contains "X-Spam-Flag" "YES" {
    fileinto "spam";
    # Stop here so that we do not reply on spams
    stop;
}

vacation
    # Reply at most once a day to a same sender
    :days 1
    :subject "Out of office reply"
    # List of additional recipient addresses which are included in the auto replying.
    # If a mail's recipient is not the envelope recipient and it's not on this list,
    # no vacation reply is sent for it.
    :addresses ["j.doe@company.dom", "john.doe@company.dom"]
    "I'm out of office, please contact Joan Doe instead.
    Best regards
    John Doe";
```

It's also possible to include the original subject using the
[[link,sieve_variables]] extension:

```
require ["variables", "vacation"];

# Store old Subject line so it can be used in vacation message
if header :matches "Subject" "*" {
    set "subjwas" ": ${1}";
}

vacation
    :days 1
    :subject "Out of office reply${subjwas}"
    :addresses ["j.doe@company.dom", "john.doe@company.dom"]
    "I'm out of office, please contact Joan Doe instead.
    Best regards
    John Doe";
```

## Include scripts

It's possible to [[link,sieve_include,include]] other Sieve scripts in your
script:

```
require ["include"];
include :global "global-spam";
include :personal "my-own-spam";
```

The lookup directories can be specified with:

```[dovecot.conf]
sieve_script personal {
  type = personal
  # Directory where the sieve include plugin retrieves :personal scripts from.
  path = ~/sieve
  active_path = ~/.dovecot.sieve
}

# Storage for :global include scripts. If no type=global storage is configured,
# any :global include fails.
sieve_script global1 {
  type = global
  path = /etc/dovecot/sieve/
}
```

Settings for both [[link,sieve_storage_type_personal,personal]] and
[[link,sieve_storage_type_global,global]] Sieve script storage types may also be
overridden by [[link,userdb_extra_fields]].

It's not currently possible to use subdirectories for the scripts.
Having a '/' character in the script name always fails the include. This
is just an extra check to avoid potential problems with including
scripts within mail directories.

## Archiving a Mailinglist by Date

You can archive messages from mailing lists in a date-structured folder
tree as follows:

```
require ["variables","date","fileinto","mailbox"];

# Extract date info
if currentdate :matches "year" "*" { set "year" "${1}"; }
if currentdate :matches "month" "*" { set "month" "${1}"; }

# Archive Dovecot mailing list items by year and month.
# Create folder when it does not exist.
if header :is "list-id" "dovecot.dovecot.org" {
    fileinto :create "INBOX.Lists.${year}.${month}.dovecot";
}
```

For example, in March 2013 this puts messages from the Dovecot mailing
list in a folder called `INBOX.Lists.2013.03.dovecot`.

It combines the date and variables extensions to extract the required date
strings.

Using the `:create` argument for the `fileinto` command, the indicated
folder is created automatically if it doesn't exist. The `:create`
argument is provided by the mailbox extension.

## Emulating `lmtp_save_to_detail_mailbox=yes`

If you can't turn this option on, you can emulate the behaviour to some
extent with following code.

```
require ["variables", "fileinto", "envelope", "subaddress", "mailbox"];

if envelope :matches :detail "to" "*" {
    # you can prefix with INBOX/ or INBOX. if necessary
    # remove :create if you want to permit only existing mailboxes
    fileinto :create "${1}";
}
```

## Translation from Procmail

There exists a script which attempts to translate simple Procmail rules
into Sieve rules: https://dovecot.org/tools/procmail2sieve.pl.

Here's the original post announcing it:
https://dovecot.org/list/dovecot/2007-March/020895.html.
