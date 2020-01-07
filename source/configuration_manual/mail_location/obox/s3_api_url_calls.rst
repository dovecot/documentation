.. _s3_api_url_calls:

=======================
S3 API_URL Calls
=======================



 ========================================================================================================   ========================================================================   
                          URL                                                                                            Notes
 ========================================================================================================   ========================================================================  
 GET /bucket?prefix=<path>                                                                                         Object listing (non-Cassandra only) 
                                                                                                                   If single result didn't return everything, 
                                                                                                                   &marker=<marker> is added to request

  GET /bucket?prefix=<path>&delimiter=/                                                                            Object listing #2 (non-Cassandra only) 
                                                                                                                   Used rarely only with index rebuilding
   
  HEAD <path>
 
  GET <path>
 
  PUT <path>
 
  DELETE <path>
 
  PUT <new path> Header (x-amz-copy-source: <source path>) Header (x-amz-metadata-directive: REPLACE)              Copying/moving (non-Cassandra only)

  POST /?delete                                                                                                    Delete up to 1000 Objects per request

 ========================================================================================================   ========================================================================