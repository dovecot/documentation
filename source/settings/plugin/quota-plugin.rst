.. _plugin-quota:

============
quota-plugin
============

.. seealso:: See :ref:`quota` for an overview of the quota system.

Settings
========

.. dovecot_plugin:setting:: quota
   :plugin: quota
   :values: @string

Quota root configuration has the following syntax:

.. code-block:: none

  quota = <backend>[:<quota root name>[:<backend args>]]

The quota root name is just an arbitrary string that is sent to IMAP clients,
which in turn may show it to the user. The name has no meaning. By default, an
empty string is used, but you may want to change that since some clients
(Apple Mail) break and don't show quota at all then.

You can define multiple quota roots by appending an increasing number to the
setting label:

.. code-block:: none

  plugin {
    quota = maildir:User quota
    quota2 = fs:Disk quota
    #quota3 = ...
  }

Globally available arguments for ``<backend args>`` parameter:

=============== ================================================================
Name            Description
=============== ================================================================
``noenforcing`` Don't try to enforce quotas by calculating if saving would get
                user over quota. Only handle write failures.
``ns=<prefix>`` A separate namespace-specific quota that's shared between all
                users.
=============== ================================================================

If you want to specify multiple backend arguments, separate them with ':'
(e.g. ``noenforcing:ns=Public/:foo:bar``).

See :ref:`quota_configuration_root` for additional configuration information.


.. dovecot_plugin:setting:: quota_exceeded_message
   :plugin: quota
   :values: @string

The message specified here is passed on to a user who goes over quota.

The value is either the message or the path to a file (prefixed with a ``<``)
that will be used as the message data.

Example Setting:

.. code-block:: none

  plugin {
    quota_exceeded_message = Quota exceeded.

    # Read message from a file
    #quota_exceeded_message = </path/to/quota_exceeded_message.txt
  }


.. dovecot_plugin:setting:: quota_grace
   :default: 10%%
   :plugin: quota
   :values: @string, @size

If set, allows message deliveries to exceed quota by this value.

See :ref:`quota_configuration_grace` for additional configuration information.


.. dovecot_plugin:setting:: quota_max_mail_size
   :added: v2.2.29
   :default: 0
   :plugin: quota
   :values: @uint

The maximum message size that is allowed to be saved (e.g. by LMTP, IMAP
APPEND or doveadm save).

``0`` means unlimited.

See :ref:`quota_configuration_max_mail_size` for additional configuration
information.


.. dovecot_plugin:setting:: quota_over_flag
   :added: v2.2.16
   :plugin: quota
   :values: @string

An identifier that indicates whether the overquota-flag is active for a user.

This identifier is compared against
:dovecot_plugin:ref:`quota_over_flag_value` to determine if the overquota-flag
should be determine to be set for the user.

Usually, this value will be loaded via userdb.

See :ref:`quota_configuration_overquota_flag` for additional configuration
information.


.. dovecot_plugin:setting:: quota_over_flag_lazy_check
   :added: v2.2.25
   :default: no
   :plugin: quota
   :values: @boolean

If enabled, overquota-flag is checked only when current quota usage is going
to already be checked.

Can be used to optimize the overquota-flag check in case it is running too
slowly.


.. dovecot_plugin:setting:: quota_over_flag_value
   :added: v2.2.16
   :plugin: quota
   :values: @string

The search string to match against :dovecot_plugin:ref:`quota_over_flag` to
determine if the overquota-flag is set for the user.

Wildcards can be used in a generic way, e.g. ``*yes`` or ``*TRUE*``

See :ref:`quota_configuration_overquota_flag` for additional configuration
information.


.. dovecot_plugin:setting:: quota_over_script
   :added: v2.2.16
   :plugin: quota
   :values: @string

The service script to execute if overquota-flag is wrong. Configured the same
as :dovecot_plugin:ref:`quota_warning` scripts.

The current :dovecot_plugin:ref:`quota_over_flag` value is appended as the
last parameter.

Example:

.. code-block:: none

  plugin {
    quota_over_script = quota-warning mismatch %u
  }

.. IMPORTANT::

  obox installations using ``quota_over_script`` must currently also have
  :dovecot_plugin:ref:`quota_over_flag_lazy_check` enabled. Otherwise the
  ``quota_over_flag`` checking may cause a race condition with metacache
  cleaning, which may end up losing folder names or mail flags within folders.


.. dovecot_plugin:setting:: quota_rule
   :plugin: quota
   :values: @string

Quota rule configuration has the following syntax:

.. code-block:: none

  quota_rule = <mailbox name>:<limit configuration>

You can define multiple quota rules by appending an increasing number to the
setting label.

``*`` as the mailbox name configures the default limit, which is applied on
top of a mailbox-specific limit if found.

``?`` as the mailbox name works almost like ``*``. The difference is that
``?`` is used only if quota backend doesn't override the limit.

``*`` and ``?`` wildcards can be used as a generic wildcard in mailbox
names, so for example ``box*`` matches ``boxes``.

The following limit names are supported:

============ ===================================================================
Name         Description
============ ===================================================================
``backend``  Quota backend-specific limit configuration.
``bytes``    Quota limit (without suffix: in bytes). 0 means unlimited.
``ignore``   Don't include the specified mailbox in quota at all.
``messages`` Quota limit in number of messages. 0 means unlimited.
``storage``  Quota limit (without suffix: in kilobytes). 0 means unlimited.
============ ===================================================================

Settings with a limit value support the :ref:`size` syntax as a suffix.

Settings also support ``%`` as a suffix. Percents are relative to the default
rule. For example:

.. code-block:: none

  plugin {
    quota = maildir:User quota
    quota_rule = *:storage=1GB
    # 10% of 1GB = 100MB
    quota_rule2 = Trash:storage=+10%%
    # 20% of 1GB = 200MB
    quota_rule3 = Spam:storage=+20%%
  }

Note that ``%`` is written twice to escape it, because :ref:`config_variables`
are expanded in plugin section. :ref:`authentication-user_database`
configuration may or may not require this escaping.

Backend-specific configuration currently is used only with ``Maildir++`` quota
backend. It means you can have the quota in Maildir++ format (e.g.
``10000000S``).

See :ref:`quota_configuration_root` for additional configuration information.


.. dovecot_plugin:setting:: quota_set
   :plugin: quota
   :values: @string

A dictionary string where your quota limit exists and can be modified.

See :ref:`quota_configuration_admin` for additional configuration information.


.. dovecot_plugin:setting:: quota_vsizes
   :added: v2.2.19
   :default: no
   :plugin: quota
   :values: @boolean

With this setting, virtual sizes rather than physical sizes are used for
quota-related calculations.


.. dovecot_plugin:setting:: quota_warning
   :plugin: quota
   :values: @string

You can configure Dovecot to run an external command when user's quota exceeds
a specified limit. Note that the warning is ONLY executed at the exact time
when the limit is being crossed, so when you're testing you have to do it by
crossing the limit by saving a new mail. If something else besides Dovecot
updates quota so that the limit is crossed, the warning is never executed.

Quota warning configuration has the following syntax::

  quota_warning = <limit configuration> <quota-warning socket name> <parameters>

``limit_configuration`` is almost exactly same as for
:dovecot_plugin:ref:`quota`, with the exception of adding ``-`` before
the value for "reverse" warnings where the script is called when quota drops
below the value. Usually you want to use percents instead of absolute limits.

Only the command for the first exceeded limit is executed, so configure the
highest limit first. The actual commands that are run need to be created as
services (create a named Dovecot service and use the service name
as the ``quota-warning socket name`` argument).

.. note::

  The percent sign (``%``) needs to be written as ``%%`` to avoid
  :ref:`variable expansion <config_variables>`.

You can define multiple quota rules by appending an increasing number to the
setting label.

See :ref:`quota_configuration_warning_scripts` for additional configuration
information.
