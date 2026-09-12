 * The `listen` setting is now called [[setting,inet_listener_listen]]. The old
   name still works as an alias, so configurations don't need changes, but
   `doveconf` writes the new name outside of `inet_listener { .. }` blocks.
