 * Login plugins and protocol binaries built out of tree must call
   `client_set_local_name()` or `client_set_session_id()` to change
   `local_name` or `session_id` in `struct client`, instead of assigning
   the field. The client now owns both strings on the heap and releases
   them with `i_free()`, so assigning a `p_strdup()` result still
   compiles, and the client then calls `i_free()` on pool memory.
