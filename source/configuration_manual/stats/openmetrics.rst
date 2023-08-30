===================================
OpenMetrics exporter for statistics
===================================

.. dovecotadded:: 2.3.11

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
All metric names are prefixed with ``dovecot_`` and each non-histogram metric is exported as ``dovecot_<metric_name>_total`` and ``dovecot_<metric_name>_duration_seconds_total``.

.. dovecotchanged:: 2.3.14 Automatically generated ``dovecot_<metric_name>_count`` and ``dovecot_<metric_name>_duration_usecs_sum`` metrics renamed to the format above.

Dynamically generated statistics with :ref:`group_by <statistics_group_by>` will be exported too.
The name of the base metric is used as above, and any dynamically generated sub-metrics are exported using labels.
Quantized sub-metrics are exported as histograms.
Histograms are exported as ``dovecot_<metric_name>_bucket`` with corresponding labels. Each histogram will have
an automatically generated ``_sum`` (specifying sum of all values in quantiles) and ``_count`` (total number of samples in the quantiles) metrics.

.. dovecotchanged:: 2.3.14 Histogram metrics will no longer have "histogram" in their name added by dovecot.
.. dovecotchanged:: 2.3.14 The separate metrics of type counter for total number and total duration (previously ``dovecot_<metric_name>_count`` and ``dovecot_<metric_name>_duration_usecs_sum``) are no longer exported for histograms.

Dovecot will also export version information and startup time as special metrics even if nothing is configured.
These are called ``dovecot_build_info`` and ``process_start_time_seconds``.

.. dovecotchanged:: 2.3.14 Uptime metric (``dovecot_stats_uptime_seconds``) is dropped, dovecot exports timestamp of service start in ``process_start_time_seconds``.

.. dovecotchanged:: 2.3.14 Metric timestamps are dropped.

.. dovecotchanged:: 2.3.21 All fields listed in ``fields`` are exported too.

Example
=======

Bellow is an excerpt of an example dovecot configuration file that defines
a set of metrics.

::

  metric auth_success {
    filter = (event=auth_request_finished AND success=yes)
  }

  metric imap_command {
    filter = event=imap_command_finished
    group_by = cmd_name tagged_reply_state
  }

  metric smtp_command {
    filter = event=smtp_server_command_finished
    group_by = cmd_name status_code duration:exponential:1:5:10
  }

  metric mail_delivery {
    filter = event=mail_delivery_finished
    group_by = duration:exponential:1:5:10
  }


And the following is a sample exported data with such metrics configuration:

::

  # HELP process_start_time_seconds Timestamp of service start
  # TYPE process_start_time_seconds gauge
  process_start_time_seconds 1606393397
  # HELP dovecot_build Dovecot build information
  # TYPE dovecot_build info
  dovecot_build_info{version="2.4.devel",revision="38ecc424a"} 1
  # HELP dovecot_auth_success Total number of all events of this kind
  # TYPE dovecot_auth_success counter
  dovecot_auth_success_total 892
  # HELP dovecot_auth_success_duration_seconds Total duration of all events of this kind
  # TYPE dovecot_auth_success_duration_seconds counter
  dovecot_auth_success_duration_seconds_total 0.085479
  # HELP dovecot_imap_command Total number of all events of this kind
  # TYPE dovecot_imap_command counter
  dovecot_imap_command_total{cmd_name="LIST"} 423
  dovecot_imap_command_total{cmd_name="LIST",tagged_reply_state="OK"} 423
  dovecot_imap_command_total{cmd_name="STATUS"} 468
  dovecot_imap_command_total{cmd_name="STATUS",tagged_reply_state="OK"} 468
  dovecot_imap_command_total{cmd_name="SELECT"} 890
  dovecot_imap_command_total{cmd_name="SELECT",tagged_reply_state="OK"} 890
  dovecot_imap_command_total{cmd_name="APPEND"} 449
  dovecot_imap_command_total{cmd_name="APPEND",tagged_reply_state="OK"} 449
  dovecot_imap_command_total{cmd_name="LOGOUT"} 892
  dovecot_imap_command_total{cmd_name="LOGOUT",tagged_reply_state="OK"} 892
  dovecot_imap_command_total{cmd_name="UID FETCH"} 888
  dovecot_imap_command_total{cmd_name="UID FETCH",tagged_reply_state="OK"} 888
  dovecot_imap_command_total{cmd_name="FETCH"} 2148
  dovecot_imap_command_total{cmd_name="FETCH",tagged_reply_state="OK"} 2148
  dovecot_imap_command_total{cmd_name="STORE"} 794
  dovecot_imap_command_total{cmd_name="STORE",tagged_reply_state="OK"} 794
  dovecot_imap_command_total{cmd_name="EXPUNGE"} 888
  dovecot_imap_command_total{cmd_name="EXPUNGE",tagged_reply_state="OK"} 888
  dovecot_imap_command_count 7840
  # HELP dovecot_imap_command_duration_seconds Total duration of all events of this kind
  # TYPE dovecot_imap_command_duration_seconds counter
  dovecot_imap_command_duration_seconds_total{cmd_name="LIST"} 0.099115
  dovecot_imap_command_duration_seconds_total{cmd_name="LIST",tagged_reply_state="OK"} 0.099115
  dovecot_imap_command_duration_seconds_total{cmd_name="STATUS"} 0.161195
  dovecot_imap_command_duration_seconds_total{cmd_name="STATUS",tagged_reply_state="OK"} 0.161195
  dovecot_imap_command_duration_seconds_total{cmd_name="SELECT"} 0.184907
  dovecot_imap_command_duration_seconds_total{cmd_name="SELECT",tagged_reply_state="OK"} 0.184907
  dovecot_imap_command_duration_seconds_total{cmd_name="APPEND"} 0.273893
  dovecot_imap_command_duration_seconds_total{cmd_name="APPEND",tagged_reply_state="OK"} 0.273893
  dovecot_imap_command_duration_seconds_total{cmd_name="LOGOUT"} 0.033494
  dovecot_imap_command_duration_seconds_total{cmd_name="LOGOUT",tagged_reply_state="OK"} 0.033494
  dovecot_imap_command_duration_seconds_total{cmd_name="UID FETCH"} 0.181319
  dovecot_imap_command_duration_seconds_total{cmd_name="UID FETCH",tagged_reply_state="OK"} 0.181319
  dovecot_imap_command_duration_seconds_total{cmd_name="FETCH"} 1.169456
  dovecot_imap_command_duration_seconds_total{cmd_name="FETCH",tagged_reply_state="OK"} 1.169456
  dovecot_imap_command_duration_seconds_total{cmd_name="STORE"} 0.368621
  dovecot_imap_command_duration_seconds_total{cmd_name="STORE",tagged_reply_state="OK"} 0.368621
  dovecot_imap_command_duration_seconds_total{cmd_name="EXPUNGE"} 0.247657
  dovecot_imap_command_duration_seconds_total{cmd_name="EXPUNGE",tagged_reply_state="OK"} 0.247657
  dovecot_imap_command_duration_seconds_sum 2.719657
  # HELP dovecot_smtp_command Histogram
  # TYPE dovecot_smtp_command histogram
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="10"} 0
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="100"} 1
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="1000"} 1
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="10000"} 1
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="100000"} 1
  dovecot_smtp_command_bucket{cmd_name="LHLO",status_code="250",le="+Inf"} 1
  dovecot_smtp_command_sum{cmd_name="LHLO",status_code="250"} 0.000020
  dovecot_smtp_command_count{cmd_name="LHLO",status_code="250"} 1
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="10"} 0
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="100"} 1
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="1000"} 1
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="10000"} 1
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="100000"} 1
  dovecot_smtp_command_bucket{cmd_name="MAIL",status_code="250",le="+Inf"} 1
  dovecot_smtp_command_sum{cmd_name="MAIL",status_code="250"} 0.000021
  dovecot_smtp_command_count{cmd_name="MAIL",status_code="250"} 1
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="10"} 0
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="100"} 0
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="1000"} 1
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="10000"} 1
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="100000"} 1
  dovecot_smtp_command_bucket{cmd_name="RCPT",status_code="250",le="+Inf"} 1
  dovecot_smtp_command_sum{cmd_name="RCPT",status_code="250"} 0.000195
  dovecot_smtp_command_count{cmd_name="RCPT",status_code="250"} 1
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="10"} 0
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="100"} 0
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="1000"} 0
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="10000"} 1
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="100000"} 1
  dovecot_smtp_command_bucket{cmd_name="DATA",status_code="250",le="+Inf"} 1
  dovecot_smtp_command_sum{cmd_name="DATA",status_code="250"} 0.001249
  dovecot_smtp_command_count{cmd_name="DATA",status_code="250"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="10"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="100"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="1000"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="10000"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="100000"} 1
  dovecot_smtp_command_bucket{cmd_name="QUIT",status_code="221",le="+Inf"} 1
  dovecot_smtp_command_sum{cmd_name="QUIT",status_code="221"} 0.000010
  dovecot_smtp_command_count{cmd_name="QUIT",status_code="221"} 1
  # HELP dovecot_mail_delivery Histogram
  # TYPE dovecot_mail_delivery histogram
  dovecot_mail_delivery_bucket{le="10"} 0
  dovecot_mail_delivery_bucket{le="100"} 0
  dovecot_mail_delivery_bucket{le="1000"} 1
  dovecot_mail_delivery_bucket{le="10000"} 1
  dovecot_mail_delivery_bucket{le="100000"} 1
  dovecot_mail_delivery_bucket{le="+Inf"} 1
  dovecot_mail_delivery_sum 0.000656
  dovecot_mail_delivery_count 1
  # EOF

