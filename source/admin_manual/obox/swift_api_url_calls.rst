.. _swift_api_url_calls:

==========================
SWIFT API_URL Calls
==========================

 ======================================   ========================================================================
   URL                                                          Notes
 ======================================   ========================================================================
   GET /<container>?delimiter                  Object listing (non-Cassandra only) 
   =/&prefix=<path>&limit=10000                If single result didn't return everything (> 10,000 objects), 
                                               &marker=<marker> is added to request 

   HEAD <path>
 
   GET <path>
 
   PUT <path>
 
   DELETE <path>
 
   DELETE <container>?bulk-delete

   COPY <path> [+ destination header]           Copying (non-Cassandra only)

 ======================================   ========================================================================
