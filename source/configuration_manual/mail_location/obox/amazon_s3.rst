.. _amazon_s3:

================
Amazon S3
================

This document covers configuration specific to the Amazon Web Services S3
(Simple Storage Service). See also the base S3 configuration in
:ref:`s3_storages`.

.. code-block:: none

   plugin {
     # Basic configuration (v2.3.10+):
     obox_fs = aws-s3:https://BUCKETNAME.s3.REGION.amazonaws.com/?auth_role=s3access&region=REGION&parameters

     # Basic configuration (old versions):
     #obox_fs = s3:https://ACCESSKEY:SECRET@BUCKETNAME.s3.REGION.amazonaws.com/?region=REGION&parameters
   }

+-------------------------+----------------------------------------------------+
| Parameter               | Description                                        |
+=========================+====================================================+
| See :ref:`s3_storages` for all S3 parameters.                                |
+-------------------------+----------------------------------------------------+


IAM authentication
------------------

.. versionadded:: 2.3.10

Dovecot supports AWS Identity and Access Management (IAM) for authenticating
requests to AWS S3 using the AWS EC2 Instance Metadata Service (IMDS), solely
version 2 of IMDS (IMDSv2) is supported.

Using IAM allows running Dovecot with S3 Storage while not keeping the
credentials in the configuration.

A requirement for using IMDSv2 is that Dovecot is running on an AWS EC2
instance, otherwise the IMDS will not be reachable. Additionally an IAM role
must be configured which allows trusted entities, EC2 in this case, to
assume that role. The role (for example ``s3access``) that will be assumed must
have the ``AmazonS3FullAccess`` policy attached.

The ``auth_role`` can be configured as a URL parameter which specifies the IAM
role to be assumed. If no ``auth_role`` is configured, no IAM lookup will be
done.

.. code-block:: none

  plugin {
    obox_fs = aws-s3:https://bucket-name.s3.region.amazonaws.com/?auth_role=s3access&region=region
  }

When using IAM you must ensure that the ``fs-auth`` service has proper
permissions/owner. Configure the user for the fs-auth listener to be the same
as for :dovecot_core:ref:`mail_uid`.

.. code-block:: none

   mail_uid = vmail
   service fs-auth {
     unix_listener fs-auth {
       user = vmail
     }
   }

For more information about IAM roles for EC2 please refer to:
`IAM roles for Amazon EC2 <https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html>`_

For general information about IAM:
`IAM UserGuide <https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html>`_


Manual authentication
---------------------

Get ACCESSKEY and SECRET from `www.aws.amazon.com <https://aws.amazon.com/>`_
-> My account -> Security credentials -> Access credentials. Create the
``BUCKETNAME`` from AWS Management Console -> S3 -> Create Bucket.

If the ``ACCESSKEY`` or ``SECRET`` contains any special characters, they can be
%hex-encoded.

.. Note::

  ``dovecot.conf`` handles %variable expansion internally as well, so % needs
  to be escaped as %% and ':' needs to be escaped as %%3A. For example if the
  SECRET is "foo:bar" this would be encoded as
  ``https://ACCESSKEY:foo%%3Abar:s3.example.com/``. This double-%% escaping is
  needed only when the string is read from ``dovecot.conf`` - it doesn't apply
  for example if the string comes from a userdb lookup.

Dispersion prefix
-----------------

.. code-block:: none

   mail_location = obox:%8Mu/%u:INDEX=~/:CONTROL=~/

As also explained in :ref:`s3_storages`, AWS can internally shard data much more
efficiently by including a dispersion prefix in all S3 paths. Without this the
S3 bucket may not scale above a certain limit in the number of S3
requests/second.

We recommend implementing the dispersion prefix by using the first 8 characters
of the hex representation of the MD5 hash of the username at the beginning of
each object path.

When a S3 bucket is created, AWS creates a single shared partition for the
bucket with a default limit of 3,500 requests/second for PUTs/DELETEs/POSTs
and 5500 requests/second for GETs (see
`Best Practices Design Patterns: Optimizing Amazon S3 Performance <https://docs.aws.amazon.com/AmazonS3/latest/dev/optimizing-performance.html>`_).

This 3,500 TPS limit is generally too small and quickly surpassed by Dovecot
which results in a spike of ``503: Slow Down`` log events. It is strongly
recommended to contact AWS to request they manually set up at least 1 layer of
hex partitioning (``0-9a-f``), to create 16 dedicated partitions for your
bucket. This "1 hex" layer of partitioning means a theoretical capacity of
56,000 PUTs/DELETEs/POSTs and 88,000 GETs per second.

Per AWS, you can go pretty deep in the number of layers, but most customers
do not need more than 2 layers of partitioning, (2 layers = 16x16 = 256
partitions = this would theoretically provide you up to ~896,000
PUT/DELETE/POST TPS and 1,408,000 GET TPS if requests are distributed evenly
across the partitions).

DNS
---

AWS instances are known to react badly when high packets per second network
traffic is generated by e.g. DNS lookups. Please see
:ref:`os_configuration_dns_lookups`.

AWS Signature version
---------------------

S3 driver uses the AWS signature version 2 method by default, but version 4
can be used by adding the region parameter to the S3 URL:

.. code-block:: none

  plugin {
    obox_index_fs = https://ACCESSKEY:SECRET@BUCKETNAME.s3.eu-central-1.amazonaws.com/?region=eu-central-1
  }

aws-s3 scheme
-------------

.. versionadded:: 2.3.10

Using the ``aws-s3`` scheme is a simpler way to configure the S3 driver for
AWS. Currently it's the same as using the ``s3`` scheme with the following
URL parameters (see :ref:`http_storages`):

 * ``addhdrvar=x-amz-security-token:%{auth:token}`` - Enable using security
   token if returned by IAM lookup.
 * ``loghdr=x-amz-request-id`` and ``loghdr=x-amz-id-2`` - Include the these
   headers' values in all log messages related to the request. This additional
   information helps when Troubleshooting Amazon S3 See
   https://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html

Example debug log message, which shows how the x-amz-\* headers are included:

.. code-block:: none

   Debug: http-client: conn 1.2.3.4:443 [1]: Got 200 response for request [Req1: GET https://test-mails.s3-service.com/?prefix=user%2Fidx%2F]: OK (x-amz-request-id:AABBCC22BB7798869, x-amz-id-2:DeadBeefanXBapRucWGAD1+aWwYMfwmXydlI0mHSuh4ic/j8Ji7gicTsP7xpMQz1IR9eydzeVI=) (took 63 ms + 140 ms in queue)

Example configuration
---------------------

With IAM:

.. code-block:: none

   mail_location = obox:%8Mu/%u:INDEX=~/:CONTROL=~/
   plugin {
     obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:zstd:3:aws-s3:https://bucket-name.s3.region.amazonaws.com/?region=region&auth_role=s3access
     obox_index_fs = compress:zstd:3:aws-s3:https://bucket-name.s3.region.amazonaws.com/?region=region&auth_role=s3access
     fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:zstd:3:aws-s3:https://bucket-name.s3.region.amazonaws.com/%8Mu/%u/fts/?region=region&auth_role=s3access
     obox_max_parallel_deletes = 1000
   }
   mail_uid = vmail
   service fs-auth {
     unix_listener fs-auth {
       user = vmail
     }
   }

Without IAM:

.. code-block:: none

   mail_location = obox:%8Mu/%u:INDEX=~/:CONTROL=~/
   plugin {
     obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:zstd:3:aws-s3:https://ACCESSKEY:SECRET@bucket-name.s3.region.amazonaws.com/?region=region&auth_role=s3access
     obox_index_fs = compress:zstd:3:aws-s3:https://ACCESSKEY:SECRET@bucket-name.s3.region.amazonaws.com/?region=region&auth_role=s3access
     fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:zstd:3:aws-s3:https://ACCESSKEY:SECRET@bucket-name.s3.region.amazonaws.com/%8Mu/%u/fts/?region=region&auth_role=s3access
     obox_max_parallel_deletes = 1000
   }
