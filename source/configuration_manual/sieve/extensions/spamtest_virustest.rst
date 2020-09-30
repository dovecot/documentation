.. _pigeonhole_extension_spamtest_virustest:

===================================================
Pigeonhole Sieve: Spamtest and Virustest Extensions
===================================================

Using the **spamtest** and **virustest** extensions (`RFC
5235 <http://tools.ietf.org/html/rfc5235/>`__), the Sieve language
provides a uniform and standardized command interface for evaluating
spam and virus tests performed on the message. Users no longer need to
know what headers need to be checked and how the scanner's verdict is
represented in the header field value. They only need to know how to use
the **spamtest** (**spamtestplus**) and **virustest** extensions. This
also gives GUI-based Sieve editors the means to provide a portable and
easy to install interface for spam and virus filter configuration. The
burden of specifying which headers need to be checked and how the
scanner output is represented falls onto the Sieve administrator.

Configuration
-------------

The **spamtest**, **spamtestplus** and **virustest** extensions are not
enabled by default and thus need to be enabled explicitly using the
:ref:`plugin-sieve-setting-sieve_extensions` setting.

The following settings need to be configured for using the **spamtest**
and **spamtestplus** extensions. The **virustest** extension has
identical configuration settings, but with a ``sieve_virustest_``
prefix instead of a ``sieve_spamtest_`` prefix:

:ref:`plugin-sieve-setting-sieve_spamtest_status_type` = ``"score" / "strlen" / "text"``
   This specifies the type of status result that the spam/virus scanner
   produces. This can either be a numeric score (``score``), a string of
   identical characters (``strlen``), e.g. '``*******``', or a textual
   description (``text``), e.g. ``{{{Spam}}}`` or ``Not Spam``.

:ref:`plugin-sieve-setting-sieve_spamtest_status_header` = ``<header-field> [ ":" <regexp> ]``
   This specifies the header field that contains the result information
   of the spam scanner and it may express the syntax of the content of
   the header. If no matching header is found in the message, the
   spamtest command will match against "0".

   This is a structured setting. The first part specifies the header
   field name. Optionally, a POSIX regular expression follows the header
   field name, separated by a colon. Any white space directly following
   the colon is not part of the regular expression. If the regular
   expression is omitted, any header content is accepted and the full
   header value is used. When a regular expression is used, it must
   specify one match value (inside brackets) that yields the desired
   spam scanner result. If the header does not match the regular
   expression or if no value match is found, the ``spamtest`` test will
   match against "0" during Sieve script execution.

:ref:`plugin-sieve-setting-sieve_spamtest_max_value` =
   This statically specifies the maximum value a numeric spam score can
   have.

:ref:`plugin-sieve-setting-sieve_spamtest_max_header` = ``<header-field> [ ":" <regexp> ]``
   Some spam scanners include the maximum score value in one of their
   status headers. Using this setting, this maximum can be extracted
   from the message itself in stead of specifying the maximum manually
   using the setting :ref:`plugin-sieve-setting-sieve_spamtest_max_value`  explained above. The
   syntax is identical to the :ref:`plugin-sieve-setting-sieve_spamtest_status_header`  setting.

:ref:`plugin-sieve-setting-sieve_spamtest_text_valueX` =
   When the :ref:`plugin-sieve-setting-sieve_spamtest_status_type` setting is set to ``text``,
   these settings specify that the ``spamtest`` test will match against
   the value "``X``" when the specified string is equal to the text
   (extracted) from the status header. For **spamtest** and
   **spamtestplus**, values of X between 0 and 10 are recognized, while
   **virustest** only uses values between 0 and 5.

Examples
--------

This section shows several configuration examples. Each example shows a
specimen of valid virus/spam test headers that the given configuration
will work on.

Example 1
~~~~~~~~~

Spam header: ``X-Spam-Score: No, score=-3.2``

::

   plugin {
     sieve_extensions = +spamtest +spamtestplus

     sieve_spamtest_status_type = score
     sieve_spamtest_status_header = \
       X-Spam-Score: [[:alnum:]]+, score=(-?[[:digit:]]+\.[[:digit:]])
     sieve_spamtest_max_value = 5.0
   }

Example 2
~~~~~~~~~

Spam header: ``X-Spam-Status: Yes``

::

   plugin {
     sieve_extensions = +spamtest +spamtestplus

     sieve_spamtest_status_type = text
     sieve_spamtest_status_header = X-Spam-Status
     sieve_spamtest_text_value1 = No
     sieve_spamtest_text_value10 = Yes
   }

Example 3
~~~~~~~~~

Spam header: ``X-Spam-Score: sssssss``

::

   plugin {
     sieve_extensions = +spamtest +spamtestplus

     sieve_spamtest_status_header = X-Spam-Score
     sieve_spamtest_status_type = strlen
     sieve_spamtest_max_value = 5
   }

Example 4
~~~~~~~~~

Spam header: ``X-Spam-Score: status=3.2 required=5.0``

Virus header: ``X-Virus-Scan: Found to be clean.``

::

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
