===================================
OpenMetrics exporter for statistics
===================================

.. versionadded:: 2.3.11

Basic configuration
===================

Dovecot has support for `OpenMetrics <https://openmetrics.io/>`_ exposition format for statistics.
This can be enabled by adding following configuration::

  service stats {
    inet_listener http {
      port = 9900
    }
  }

This will enable Dovecot to expose all configured metrics in OpenMetrics format on ``http://host:9900/metrics`` using `text-based format <https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format>`_ .

Statistics format
=================

By default, Dovecot exposes all configured metrics.
If the metric name does not conform with OpenMetrics requirements, it is not exported.
All metric names are prefixed with ``dovecot_`` and each metric is exported as ``dovecot_<metric_name>_count`` and ``dovecot_<metric_name>_duration_usecs_sum``.
Filters are added as labels for the metric, such as ``{success="yes"}``.

Dynamically generated statistics with :ref:`group_by <statistics_group_by>` will be exported too.
The name of the base metric is used as above, and any dynamically generated sub-metrics are exported using labels.
Quantized sub-metrics are exported as histograms.

Dovecot will also export version and uptime as special metrics even if nothing is configured.
These are called ``dovecot_stats_uptime_seconds`` and ``dovecot_build_info``.

Example
=======

::

  # HELP dovecot_stats_uptime_seconds Dovecot stats service uptime
  # TYPE dovecot_stats_uptime_seconds counter
  dovecot_stats_uptime_seconds 2 1587736228592

  # HELP dovecot_build_info Dovecot build information
  # TYPE dovecot_build_info untyped
  dovecot_build_info{version="2.4.devel",revision="72d000b2f"} 1 1587736228592

  # HELP dovecot_client_connections_count Total number
  # TYPE dovecot_client_connections_count counter
  dovecot_client_connections_count 0 1587736228592

  # HELP dovecot_client_connections_duration_usecs_sum Duration
  # TYPE dovecot_client_connections_duration_usecs_sum counter
  dovecot_client_connections_duration_usecs_sum 0 1587736228592

  # HELP dovecot_auth_success_count Total number
  # TYPE dovecot_auth_success_count counter
  dovecot_auth_success_count{success="yes"} 451 1587736228592

  # HELP dovecot_auth_success_duration_usecs_sum Duration
  # TYPE dovecot_auth_success_duration_usecs_sum counter
  dovecot_auth_success_duration_usecs_sum{success="yes"} 48726 1587736228592

  # HELP dovecot_imap_command_count Total number
  # TYPE dovecot_imap_command_count counter
  dovecot_imap_command_count{cmd_name="LIST"} 242 1587736228592
  dovecot_imap_command_count{cmd_name="LIST",tagged_reply_state="OK"} 242 1587736228592
  dovecot_imap_command_count{cmd_name="SELECT"} 450 1587736228592
  dovecot_imap_command_count{cmd_name="SELECT",tagged_reply_state="OK"} 450 1587736228592
  dovecot_imap_command_count{cmd_name="STATUS"} 208 1587736228592
  dovecot_imap_command_count{cmd_name="STATUS",tagged_reply_state="OK"} 208 1587736228592
  dovecot_imap_command_count{cmd_name="APPEND"} 240 1587736228592
  dovecot_imap_command_count{cmd_name="APPEND",tagged_reply_state="OK"} 240 1587736228592
  dovecot_imap_command_count{cmd_name="LOGOUT"} 451 1587736228592
  dovecot_imap_command_count{cmd_name="LOGOUT",tagged_reply_state="OK"} 451 1587736228592
  dovecot_imap_command_count{cmd_name="UID FETCH"} 447 1587736228592
  dovecot_imap_command_count{cmd_name="UID FETCH",tagged_reply_state="OK"} 447 1587736228592
  dovecot_imap_command_count{cmd_name="FETCH"} 1088 1587736228592
  dovecot_imap_command_count{cmd_name="FETCH",tagged_reply_state="OK"} 1088 1587736228592
  dovecot_imap_command_count{cmd_name="EXPUNGE"} 447 1587736228592
  dovecot_imap_command_count{cmd_name="EXPUNGE",tagged_reply_state="OK"} 447 1587736228592
  dovecot_imap_command_count{cmd_name="STORE"} 409 1587736228592
  dovecot_imap_command_count{cmd_name="STORE",tagged_reply_state="OK"} 409 1587736228592

  # HELP dovecot_imap_command_duration_usecs_sum Duration
  # TYPE dovecot_imap_command_duration_usecs_sum counter
  dovecot_imap_command_duration_usecs_sum{cmd_name="LIST"} 102977 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="LIST",tagged_reply_state="OK"} 102977 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="SELECT"} 208810 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="SELECT",tagged_reply_state="OK"} 208810 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="STATUS"} 131472 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="STATUS",tagged_reply_state="OK"} 131472 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="APPEND"} 285793 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="APPEND",tagged_reply_state="OK"} 285793 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="LOGOUT"} 22966 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="LOGOUT",tagged_reply_state="OK"} 22966 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="UID FETCH"} 178660 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="UID FETCH",tagged_reply_state="OK"} 178660 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="FETCH"} 1209618 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="FETCH",tagged_reply_state="OK"} 1209618 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="EXPUNGE"} 256421 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="EXPUNGE",tagged_reply_state="OK"} 256421 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="STORE"} 382000 1587736228592
  dovecot_imap_command_duration_usecs_sum{cmd_name="STORE",tagged_reply_state="OK"} 382000 1587736228592

  # HELP dovecot_smtp_command_count Total number
  # TYPE dovecot_smtp_command_count counter
  dovecot_smtp_command_count{cmd_name="LHLO"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="LHLO",status_code="250"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="MAIL"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="MAIL",status_code="250"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="RCPT"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="RCPT",status_code="250"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="DATA"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="DATA",status_code="250"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="QUIT"} 1 1587736228592
  dovecot_smtp_command_count{cmd_name="QUIT",status_code="221"} 1 1587736228592

  # HELP dovecot_smtp_command_duration_usecs_sum Duration
  # TYPE dovecot_smtp_command_duration_usecs_sum counter
  dovecot_smtp_command_duration_usecs_sum{cmd_name="LHLO"} 70 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="LHLO",status_code="250"} 70 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="MAIL"} 55 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="MAIL",status_code="250"} 55 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="RCPT"} 327 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="RCPT",status_code="250"} 327 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="DATA"} 2371 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="DATA",status_code="250"} 2371 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="QUIT"} 22 1587736228592
  dovecot_smtp_command_duration_usecs_sum{cmd_name="QUIT",status_code="221"} 22 1587736228592

  # HELP dovecot_smtp_command_histogram Histogram
  # TYPE dovecot_smtp_command_histogram histogram
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="10"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="100"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="1000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="10000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="100000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="LHLO",status_code="250",le="+Inf"} 1 1587736228592
  dovecot_smtp_command_histogram_sum{cmd_name="LHLO",status_code="250"} 70 1587736228592
  dovecot_smtp_command_histogram_count{cmd_name="LHLO",status_code="250"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="10"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="100"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="1000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="10000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="100000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="MAIL",status_code="250",le="+Inf"} 1 1587736228592
  dovecot_smtp_command_histogram_sum{cmd_name="MAIL",status_code="250"} 55 1587736228592
  dovecot_smtp_command_histogram_count{cmd_name="MAIL",status_code="250"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="10"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="100"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="1000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="10000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="100000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="RCPT",status_code="250",le="+Inf"} 1 1587736228592
  dovecot_smtp_command_histogram_sum{cmd_name="RCPT",status_code="250"} 327 1587736228592
  dovecot_smtp_command_histogram_count{cmd_name="RCPT",status_code="250"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="10"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="100"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="1000"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="10000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="100000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="DATA",status_code="250",le="+Inf"} 1 1587736228592
  dovecot_smtp_command_histogram_sum{cmd_name="DATA",status_code="250"} 2371 1587736228592
  dovecot_smtp_command_histogram_count{cmd_name="DATA",status_code="250"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="10"} 0 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="100"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="1000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="10000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="100000"} 1 1587736228592
  dovecot_smtp_command_histogram_bucket{cmd_name="QUIT",status_code="221",le="+Inf"} 1 1587736228592
  dovecot_smtp_command_histogram_sum{cmd_name="QUIT",status_code="221"} 22 1587736228592
  dovecot_smtp_command_histogram_count{cmd_name="QUIT",status_code="221"} 1 1587736228592

