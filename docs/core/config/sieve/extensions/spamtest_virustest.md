---
layout: doc
title: Spamtest/Virustest
dovecotlinks:
  sieve_spamtest: Sieve spamtest extension
  sieve_virustest: Sieve virustest extension
---

# Sieve: Spamtest and Virustest Extensions

Using the spamtest and virustest extensions ([[rfc,5235]]), the Sieve language
provides a uniform and standardized command interface for evaluating
spam and virus tests performed on the message. Users no longer need to
know what headers need to be checked and how the scanner's verdict is
represented in the header field value. They only need to know how to use
the spamtest (spamtestplus) and virustest extensions.

This also gives GUI-based Sieve editors the means to provide a portable and
easy to install interface for spam and virus filter configuration.

The burden of specifying which headers need to be checked and how the
scanner output is represented falls onto the Sieve administrator.

## Configuration

The spamtest, spamtestplus, and virustest extensions are not
enabled by default and thus need to be enabled explicitly using
[[setting,sieve_extensions]].

### Settings: Spamtest

<SettingsComponent tag="sieve-spamtest" level="3" />

### Settings: Virustest

<SettingsComponent tag="sieve-virustest" level="3" />

### Examples

This section shows several configuration examples. Each example shows a
specimen of valid virus/spam test headers that the given configuration
will work on.

::: code-group
```[Spam Header]
X-Spam-Score: No, score=-3.2
```

```[dovecot.conf]
plugin {
  sieve_extensions = +spamtest +spamtestplus

  sieve_spamtest_status_type = score
  sieve_spamtest_status_header = \
      X-Spam-Score: [[:alnum:]]+, score=(-?[[:digit:]]+\.[[:digit:]])
  sieve_spamtest_max_value = 5.0
}
```
:::

::: code-group
```[Spam Header]
X-Spam-Status: Yes
```

```[dovecot.conf]
plugin {
  sieve_extensions = +spamtest +spamtestplus

  sieve_spamtest_status_type = text
  sieve_spamtest_status_header = X-Spam-Status
  sieve_spamtest_text_value1 = No
  sieve_spamtest_text_value10 = Yes
}
```
:::

::: code-group
```[Spam Header]
X-Spam-Score: sssssss
```

```[dovecot.conf]
plugin {
  sieve_extensions = +spamtest +spamtestplus

  sieve_spamtest_status_header = X-Spam-Score
  sieve_spamtest_status_type = strlen
  sieve_spamtest_max_value = 5
}
```

::: code-group
```[Spam Header]
X-Spam-Score: status=3.2 required=5.0
```

```[Virus Header]
X-Virus-Scan: Found to be clean.
```

```[dovecot.conf]
plugin {
  sieve_extensions = +spamtest +spamtestplus +virustest

  sieve_spamtest_status_type = score
  sieve_spamtest_status_header = \
      X-Spam-Score: score=(-?[[:digit:]]+\.[[:digit:]]).*
  sieve_spamtest_max_header = \
      X-Spam-Score: score=-?[[:digit:]]+\.[[:digit:]] required=([[:digit:]]+\.[[:digit:]])

  sieve_virustest_status_type = text
  sieve_virustest_status_header = X-Virus-Scan: Found to be (.+)\.
  sieve_virustest_text_value1 = clean
  sieve_virustest_text_value5 = infected
}
```
:::
