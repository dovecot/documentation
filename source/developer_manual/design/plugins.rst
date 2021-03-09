.. _liblib_plugins:

=======
Plugins
=======

Plugins in Dovecot are really simple. They basically have two functions:

-  ``<plugin_name>_init(module)`` is called when ``module_dir_init()`` is
   called.

-  <plugin_name>_deinit() is called when ``module_dir_deinit()`` or
   ``module_dir_unload()`` is called.

The ``<plugin_name>`` is the short version of the plugin name, based on the
filename. For example if the filename is ``lib11_imap_quota_plugin.so``,
the ``<plugin_name>`` is ``imap_quota`` and the init function to be called is
``imap_quota_plugin_init()``.

Versioning
----------

Since different Dovecot versions can have different APIs, your plugin
should usually also define ``<plugin_name>_version``, like:

::

   const char *imap_quota_plugin_version = DOVECOT_ABI_VERSION;

If the version string in plugin doesn't match the version of the running
binary, the plugin loading fails. The DOVECOT_ABI_VERSION is defined in
Dovecot's ``config.h``, which you're typically including.

Dependencies
------------

Some plugins depend on another one. In some systems (but not all) it's
possible to handle this by giving a nicer error message than "symbol xyz
not found". There are two steps for this:

First create ``<plugin_name>_dependencies`` array listing plugin names that
the plugin depends on, like:

::

   const char *imap_quota_plugin_dependencies[] = { "quota", NULL };

Then you'll also have to make the plugin .so binary link to the other
plugins:

::

   if PLUGIN_DEPS
   lib11_imap_quota_plugin_la_LIBADD = \
           ../quota/lib10_quota_plugin.la
   endif

``PLUGIN_DEPS`` is set only if plugin dependencies are actually supported.
Otherwise the build might fail or plugin loading might fail.

Once all this is done, trying to load imap_quota plugin without quota
plugin gives a nice error message:

::

   Error: Can't load plugin imap_quota_plugin: Plugin quota must be loaded also

Hooks
-----

Different kinds of plugins can also hook into various things:

 * imap: ``imap_client_created_hook_set()``
 * pop3: ``pop3_client_created_hook_set()``
 * submission: ``submission_client_created_hook_set()``
 * lmtp: ``hook_client_created``
 * lib-storage: ``mail_storage_hooks_add()``
