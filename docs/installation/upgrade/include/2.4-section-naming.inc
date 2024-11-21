#### passdb/userdb Section Naming

[[link,passdb]] and [[link,userdb]] sections now require a name, i.e.:

```
# This gives an error:
passdb {
  ...
}

# Use this instead:
passdb some_name {
}
```
