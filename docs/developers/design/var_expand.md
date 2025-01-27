---
layout: doc
title: Variable expansion design
dovecotlinks:
  var_expand: variable expansion design
---

# Variable expansion design

Dovecot comes with powerful variable expansion system, which allows constructing reusable text templates.
This has been upgraded since v2.3 to a more flexible system.

## Syntax

```
<var> ::= <expression-list>
<expression-list> ::= <expression-list> <expression>
<expression> ::= <VALUE>, "{" <filter-list> "}", "%"
<filter-list> ::= <filter-list> "|" <filter>, <filter>
<filter> ::= <func> <math-list>
<math-list> ::= <math>
<math> ::= <operator> <number>, <operator> <NAME>
<number> ::= "-" <NUMBER>, <NUMBER>
<operator> ::= "+", "-", "*", "/"
<func> ::= <NAME> <arguments>
<arguments> ::= "(" <argument-list> ")"
<argument-list> ::= <argument-list> "," <argument>
<argument> ::= <VALUE>, <NAME>, <number>, <key> "=" <number>, <key> "=" <NAME>, <key> "=" <VALUE>

NAME = string
VALUE = "string" or 'string'
NUMBER = [0-9]+
```

## Design

Internally, everything is stored in a binary-safe string container. There is no other data type internally.
This buffer can be set and unset, and the content can be tagged by filters to be binary or string.

The system uses programs to perform the actual expansion. The given input is always first parsed into a list of programs.
Input that consists from multiple expansions separated by non-expansion strings is split into multiple programs.
Once program is compiled, it can be executed multiple times with different parameters.

Program parameters consists from variable table(s), provider(s) and escape function. A program can be executed with different parameters.

## Parameters

Parameters are provided via `struct var_expand_params`. Variable mappings are provided via `struct var_expand_table` array, which is `VAR_EXPAND_TABLE_END` terminated list of
key-value mappings. Key's value can also be provided by a function.

Providers are used to handle scoped variables, such as passdb, ldap etc. There are also global providers which are always available.

Providers can be provide with `struct var_expand_provider` array which contains prefix and provider function, and is `VAR_EXPAND_TABLE_END` terminated.

It is also possible to provide escape function, which is applied to each %{pipeline} output.

Key functions and providers use the same context.

Key-value tables and providers can also be provided as arrays of arrays, which must be NULL terminated.
Contexts for these must be provided in an array that is `VAR_EXPAND_CONTEXTS_END` terminated.

When these arrays are used, first match wins.

## Filters

Filters are functions that accept input from left side and emit output to right side. They can accept positional and named parameters.
Some filters can start expressions, namely ones that do not require any input.

## Variables

Variables are always considered to be strings. NULL value is considered same as empty value. Variable names are unique, and if table contains
multiple variables with same name, the first is always used.

Variable can exist as parameter to filters or as the first token in expression.

## Output handling

If a program ends up with binary tagged output, the output is automatically hex-encoded.
If there is no key in table or provider, error will occur.
This error can be negated with `default(value)` filter, which clears error.
