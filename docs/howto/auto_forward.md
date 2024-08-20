---
layout: doc
title: Autoforward Sender Address
---

# Configuring Autoforward Sender Address

Customer would like to have auto forwarding feature as described below:

* Scenario: `(User A -> User B (Auto forwarder) -> User C)`

1. `B@example2.com` is a user at customer.
2. An email is sent from `A@example1.com` to `B@example2.com`
3. `B@example2.com` set an auto-forward rule so emails are being forwarded to
   `C@example3.com` automatically.
4. `C@example3.com` received the forwarded mail.

* Current behavior
:   The mail received by `C@example3.com` has `mail from` header
    `A@example1.com`

    (i.e. the `mail from` is unchanged by client when forwarding to user C)

* Requested behavior
:   The mail received by `C@example3.com` has `mail from` header
    `B@example2.com`

    (i.e. the `mail from` has been changed by user B when forwarding to
    user C, so the mail looks like as if it was originally sent by user B)

* Reason for the request
:   Currently, the mails being auto forwarded  by user B are occasionally get
    failed to pass SPF check somewhere in the path, which will result that the
    mail cannot be forwarded to user C.

## Solution

The following is an example of what the Sieve config and rules could look
like:

::: code-group
```[dovecot.conf]
plugin {
  # Use editheader
  sieve_extensions = +editheader
}
```

```[Sieve Rule]
require "editheader";
require "variables";
require "envelope";

# ... Any other rules

# Obtain the user's full email address somehow
# It can be obtained from the recipient address (without full name)
# An alternative is to put the primary address into the script as a literal.
if envelope :matches "to" "*" { set "user_email" "${1}"; }

# This part of the script MUST be the final rule, otherwise other rules are
# affected since the message is modified.

# Drop the original "From:" header
deleteheader "from";

# Add a new "From:" header
addheader "From" "${user_email}";

redirect "forward@example.com";
```
:::

::: info
It is very important to make that deleteheader, addheader, redirect the last
rule in the sieve script, as this would affect other actions as well.
:::
