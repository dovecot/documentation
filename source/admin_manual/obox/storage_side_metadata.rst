.. _storage_side_metadata:

============================
Storage-Side Object Metadata
============================

When saving data to object storage, Dovecot stores metadata associated with each blob for data recovery purposes.

This data is written to the HTTP endpoint by adding Dovecot metadata headers to the request. When retrieving a message from object storage, this data is returned in the received headers (only parsed by Dovecot if needed).

The header name used is specific to the obox driver:

 ==========  ===============================
 Driver       Metadata Header
 ==========  ===============================
  s3	     x-amz-meta-dovecot-<key>
  sproxyd    X-Object-meta-dovecot-<key>
 ==========  ===============================

The metacache keys available are:

 ===============  ========================================  =========================================================== ==============================  ========================================  
   Key                       Description                                Max Length (in bytes)                                    Data Type                        Other
 ===============  ========================================  =========================================================== ==============================  ========================================
  username    	     Dovecot unique username	                N/A (installation dependent)	                              email

  guid	             Message guid                              	32	                                                          email

  size	             Message size (in bytes)	                20 (in theory; rarely more than 10)	                          email

  received	         Received date (unix timestamp)          	20 (in theory; rarely more than 10)	                          email	
  
  saved	             Saved date (unix timestamp)	            20 (in theory; rarely more than 10)	                          email	
 
  pop3uidl	         POP UIDL	                                N/A (depends on source installation)	                      email	                      Only if message migrated
 
  pop3order	         POP message order	                        10	                                                          email	                      Only if needed by migration
 
  origbox            Folder guid of first folder where          32	                                                          email
                     
                     stored(copying does not update this)		
 
  fname	             Dovecot filename	                        N/A - installation dependent                                  email	                          Dictmap only
                                                                (username component)

  username	         Dovecot unique username	                N/A (installation dependent)	                              index	
  
  size	             Bundle size (in bytes)	                    20 (in theory; rarely more than 10)	                          index	
 
  fname	             Dovecot filename	                        N/A - installation dependent                                  index	                           Dictmap only
                                                                (username component)	
 
  mailbox-guid	     Mailbox guid the index refers to	         32	                                                           index    	                   Dictmap only
 
  username	         Dovecot unique username	                 N/A (installation dependent)	                               fts	
 
 fname	             Dovecot filename	                         N/A - installation dependent (username component)             fts	                           Dictmap only

 ===============  ========================================  =========================================================== ==============================  ========================================
