---
layout: doc
title: Plugins
---

# Plugins

Plugins in Dovecot are really simple. They basically have two functions:

- `<plugin_name>_init(module)` is called when `module_dir_init()` is called.

- `<plugin_name>_deinit()` is called when `module_dir_deinit()` or
  `module_dir_unload()` is called.

The `<plugin_name>` is the short version of the plugin name, based on the
filename. For example if the filename is `lib11_imap_quota_plugin.so`,
the `<plugin_name>` is `imap_quota` and the init function to be called is
`imap_quota_plugin_init()`.

## Versioning

Since different Dovecot versions can have different APIs, your plugin
should usually also define `<plugin_name>_version`, like:

```c
const char *imap_quota_plugin_version = DOVECOT_ABI_VERSION;
```

If the version string in plugin doesn't match the version of the running
binary, the plugin loading fails. The `DOVECOT_ABI_VERSION` is defined in
Dovecot's `config.h`, which you're typically including.

It's possible to check the Dovecot version number with a macro. This allows
either supporting different Dovecot APIs or giving a clear error message if
the API is too old to support your plugin. For example:

```
#if ! DOVECOT_PREREQ(2, 3, 18)
#  error Must have at least v2.3.18
#endif
```

## Dependencies

[[changed,plugin_dependencies_config]] Some plugins depend on another one.
The dependencies are declared with `struct setting_plugin_info`, which the
config process writes to the binary config. When loading the
[[setting,mail_plugins]], Dovecot verifies that all the required plugins are
also loaded before loading any of the plugins.

Plugins in Dovecot core declare these in their source files, which are
scanned by the config build:

```c
const struct setting_plugin_info imap_quota_plugin_info = {
	.plugin = "lib11_imap_quota_plugin",
	.required_plugins = (const char *const []) { "quota", NULL },
};
```

The `plugin` field is the plugin's filename without the `.so` suffix. The
plugin name used in [[setting,mail_plugins]] is derived from it. The info is
ignored if the plugin file doesn't exist in the module directory.

External plugins export them from their settings plugin (the plugin in the
`settings/` module directory) in a NULL-terminated
`<settings_plugin_name>_plugin_infos` array:

```c
const struct setting_plugin_info *foo_settings_plugin_infos[] = {
	&foo_plugin_info,
	NULL
};
```

Trying to load imap_quota plugin without quota plugin then gives an error:

```
Fatal: mail_plugins: Plugin imap_quota requires also plugin quota to be loaded
```

Don't link the plugin against the plugins it depends on. Linking against
loadable modules isn't portable. Instead, make sure the plugin's filename
prefix (e.g. `lib11_`) sorts after the plugins it depends on. Plugins are
loaded in that order, so the dependencies' symbols are already available
when the plugin is loaded. The config process logs a warning if a required
plugin would be loaded after the plugin requiring it.

The old `<plugin_name>_dependencies` array is still checked, but it can't
be checked before the plugin is loaded.

## Hooks

Different kinds of plugins can also hook into various things:

* imap: `imap_client_created_hook_set()`
* pop3: `pop3_client_created_hook_set()`
* submission: `submission_client_created_hook_set()`
* lmtp: `hook_client_created`
* lib-storage: `mail_storage_hooks_add()`
