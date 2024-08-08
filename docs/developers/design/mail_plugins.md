---
layout: doc
title: Mail Plugins
---

# Mail Plugins

Typically plugins add hooks in their init() function by calling
`mail_storage_hooks_add()`, and remove the hooks at deinit() with
`mail_storage_hooks_remove()`.

## Supported Hooks

### `mail_user_created`

A new mail user was created. It doesn't yet have any namespaces.

### `mail_storage_created`

A new mail storage was created. It's not connected to any namespaces/mailbox
lists yet.

### `mailbox_list_created`

A new mailbox list was created. It's not connected to any storages yet.
Because of this, some internal virtual methods haven't been overridden by
the storage yet, so plugins rarely want to use this hook. Instead they
should use `mail_namespace_storage_added`.

### `mail_namespace_storage_added`

Storage was connected to its first mailbox list. This hook should usually be
used if plugin wants to override mailbox_list's methods.

### `mail_namespaces_created`

User's all namespaces have been created.

This hook is called only per user at startup. More internal
namespaces may be created later when using shared mailboxes.

### `mail_namespaces_added`

More namespaces were added to the user's namespaces. At initialization this
is called before `mail_namespaces_created`. Afterwards it's mainly called
when shared mailboxes are accessed, which trigger shared namespace creation.

### `mailbox_allocated`

`mailbox_alloc()` was called.

### `mailbox_opened`

Mailbox (and its index) was actually opened, either explicitly with
`mailbox_open()` or implicitly by some other function.

### `mail_allocated`

Mail was allocated with `mail_alloc()`.

## Overriding Methods

When the hook gets called, you usually want to override some method of
the created object. This is the easy part, for example:

```c
static void plugin_mailbox_allocated(struct mailbox *box)

/* ... */

box->v.transaction_begin = plugin_transaction_begin;
```

The problem is that once `plugin_transaction_begin()` is called, it
should call the original `transaction_begin()`. There may also be
multiple plugins that want to override the same method, so the idea is
to just have each plugin call the previous `transaction_begin()`.

The next problem is where do you save the previous value? Most objects have
a `module_contexts` array for storing per-plugin pointers for this
purpose. There are several helper functions to make setting and
accessing them in a quite safe way.

Easiest way to set up the module context is to just copy&paste code from
an existing plugin that sets the same context. Here's some documentation
about it anyway:

First you start by creating a register for the plugin. There are different
registers for different types of objects:

- `mail_user_module_register`: For `struct mail_user`.
- `mailbox_list_module_register`: For `struct mailbox_list`.
- `mail_storage_module_register`: For `struct mail_storage`,
  `struct mailbox`, `struct mailbox_transaction_context` and
  `struct mail_search_context`.
- `mail_module_register`: For `struct mail`.

We'll assume you want to use `mail_storage_module_register`:

```c
static MODULE_CONTEXT_DEFINE_INIT(plugin_storage_module, &mail_storage_module_register);
```

If you need to make it external, use:

```c
extern MODULE_CONTEXT_DEFINE(plugin_storage_module, &mail_storage_module_register);
struct plugin_storage_module plugin_storage_module =
    MODULE_CONTEXT_INIT(&mail_storage_module_register);
```

Next you'll need to allocate memory for the structure you want to place
in the context. If you only want to override some methods, you can use:

```c
union mailbox_module_context *mbox;
struct mailbox_vfuncs *v = box->vlast;

mbox = p_new(box->pool, union mailbox_module_context, 1);
mbox->super = *v;
box->vlast = &mbox->super;

v->transaction_begin = plugin_transaction_begin;
MODULE_CONTEXT_SET_SELF(box, plugin_storage_module, mbox);
```

If you want to store some more plugin-specific data to the object
instead of just the super methods, you can do:

```c
struct plugin_mailbox {
    /* must be called module_ctx */
    union mailbox_module_context module_ctx;
};

/* ... */

struct plugin_mailbox *mbox;
struct mailbox_vfuncs *v = box->vlast;

mbox = p_new(box->pool, struct plugin_mailbox, 1);
mbox->module_ctx.super = *v;
box->vlast = &mbox->super;

v->transaction_begin = plugin_transaction_begin;
MODULE_CONTEXT_SET(box, plugin_storage_module, mbox);
```

Note that when using union directly you use
`MODULE_CONTEXT_SET_SELF()`, while when it's inside a struct you use
`MODULE_CONTEXT_SET()`.

Once all this initialization is done, you can look up the module context
with:

```c
#define PLUGIN_CONTEXT(obj) MODULE_CONTEXT(obj, plugin_storage_module)

/* ... */

struct plugin_mailbox *mbox = PLUGIN_CONTEXT(box);
```
