Upgrading Dovecot v2.3.x to v2.3.14
===================================

 * IMAP metadata: Responses for both SETMETADATA and GETMETADATA commands
   changed in some situations when ACL rules are present:

   * **GETMETADATA command**

     * Users with only "l" right:

       * for non-existing mailbox command failure error changed from "Permission denied"
         to "Mailbox doesn't exist"

     * Users with "l" right and one of "s", "w", "i", and "p" rights:

       * for INBOX, command result changed from "Permission denied" failure to "OK"
       * for existing mailboxes, command result changed from "Permission denied"
         failure to "OK"
       * for non-existing mailboxes, command failure error changed from "Permission denied"
         to "Mailbox doesn't exist"
       * for autocreated mailboxes, command result changed from "Permission denied"
         failure to "OK"

     * Users with "l" right and one of "x", "c", "d", and "a" rights:

       * for non-existing mailboxes, command failure error changed from "Permission denied"
         to "Mailbox doesn't exist"

     * Users with only "r" right:

       * for INBOX, command result changed from "OK" to "Mailbox doesn't exist"
       * for existing mailboxes, command result changed from "OK" to "Mailbox doesn't exist"
       * for autocreated mailboxes, command result changed from "OK" to "Mailbox doesn't exist"

   * **SETMETADATA command**

     * Users with only "l" right:

       * for non-existing mailbox command failure error changed from "Permission denied"
         to "Mailbox doesn't exist"
