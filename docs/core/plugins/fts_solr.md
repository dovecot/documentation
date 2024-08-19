---
layout: doc
title: fts-solr
---

# Apache Solr FTS Plugin (`fts-solr`)

[Solr](https://solr.apache.org/) is a Lucene indexing server.
Dovecot communicates to it using HTTP/XML queries.

::: tip note
This documentation is written for Solr 7.7.0. You will need to adapt if
using a different version.

Installation and operation of a Solr system is outside the scope
of this documentation. Refer to the Solr documentation for further
information.

This documentation focuses on Dovecot-specific tasks that need to
be done to configure the system for FTS support.
:::

## Compiling

Dovecot is not compiled with Solr FTS support by default. To enable it,
you need to add the `--with-solr` parameter to your invocation of the
`configure` script. You will also need to have libexpat installed,
including development headers (typically from a separate development
package). Configuration will fail if `--with-solr` is enabled while
libexpat headers cannot be found.

## Server Setup

### Solr Installation

Using this FTS engine requires Solr to be installed. Most OS distributions
have packages for this.

To use Solr with Dovecot, it needs to configured specifically for use
with Dovecot.

```sh
sudo -u solr /opt/solr/bin/solr create -c dovecot
```

Once the instance is created, you can start the Solr service.

By default, the Solr administration page for the newly created instance
is located at https://localhost:8983/solr/#/~cores/dovecot. It
can be used to check the status of the Solr instance. Configuration
errors are often most conveniently viewed here. Solr also writes log files,
which can be used for debugging.

### Solr Configuration

There are three primary configuration files that need to be changed to
accommodate the Dovecot FTS needs: the instance configuration file
`solrconfig.xml` and the schema files `schema.xml` and
`managed-schema` used by the instance.

These files are both located in the `conf` directory of the Solr instance
(e.g., `/var/solr/data/dovecot/conf/`).

#### Remove default core configuration files

```sh
rm -f /var/solr/data/dovecot/conf/schema.xml
rm -f /var/solr/data/dovecot/conf/managed-schema
rm -f /var/solr/data/dovecot/conf/solrconfig.xml
```

#### Install schema.xml and solrconfig.xml

Copy
[`doc/solr-config-7.7.0.xml`](https://raw.githubusercontent.com/dovecot/core/main/doc/solr-config-7.7.0.xml)
and
[`doc/solr-schema-7.7.0.xml`](https://raw.githubusercontent.com/dovecot/core/main/doc/solr-schema-7.7.0.xml)
to `/var/solr/data/dovecot/conf/` as `solrconfig.xml` and `schema.xml`. The
`managed-schema` file is generated based on `schema.xml`.

## Dovecot Setup

::: tip Note
This plugin requires the [[plugin,fts]] to be activated and configured
:::

## Dovecot Settings

<SettingsComponent plugin="fts-solr" />

### `fts_solr` Configuration

[[setting,fts_solr]] setting is used to configure the Solr server details.

Format is a space separated list of options:

```
fts_solr = [option1[=value1]] [option2[=value2]] [...]
```

The following options are supported:

#### `url=<url>`

* Default: `https://localhost:8983/solr/dovecot/`
* Values: string

Required base URL for Solr.

Remember to add your core name if using solr 7+: `"/solr/dovecot/"`.

#### `debug`

* Default: no
* Values: \<existence\> (if `debug` exists, it is enabled)

Enable HTTP debugging. Writes to debug log.

#### `rawlog_dir=<directory>`

* Default: \<empty\>
* Values: string

Enable rawlog debugging. Store HTTP exchanges between Dovecot and Solr
in this directory.

#### `batch_size`

* Default: `1000`
* Values: unsigned integer

Configure the number of mails sent in single requests to Solr.

* With [[setting,fts_autoindex,yes]], each new mail gets separately indexed on
  arrival, so `batch_size` only matters when doing the initial
  indexing of a mailbox.
* With [[setting,fts_autoindex,no]], new mails don't get indexed on arrival, so
  `batch_size` is used when indexing gets triggered.

#### `soft_commit=yes|no`

* Default: `yes`
* Values: boolean

Controls whether new mails are immediately searchable via Solr.

See [soft commits](#soft-commits) for additional information.

## Example Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins fts fts_solr

plugin {
  fts = solr
  fts_solr = url=https://solr.example.org:8983/solr/ debug batch_size=1000
}
```

Important notes:

- Some mail clients will not submit any search requests for certain
  fields if they index things locally eg. Thunderbird will not send any
  requests for fields such as sender/recipients/subject when Body is
  not included as this data is contained within the local index.

## Solr Commits & Optimization

Solr indexes should be optimized once in a while to make searches faster
and to remove space used by deleted mails. Dovecot never asks Solr to
optimize, so you should do this yourself. Perhaps a cronjob that sends
the optimize-command to Solr every n hours.

Dovecot only does soft commits to the Solr index to improve
performance. You must run a hard commit once in a while or Solr will
keep increasing its transaction log sizes. For example send the commit
command to Solr every few minutes.

```sh
Optimize should be run somewhat rarely, e.g. once a day
curl https://<hostname/ip>:<port|default 8983>/solr/dovecot/update?optimize=true

# Commit should be run pretty often, e.g. every minute
curl https://<hostname/ip>:<port|default 8983>/solr/dovecot/update?commit=true
```

You may not need those if you are using a recent Solr (7+) or SolrCloud.
The default configuration of Solr is to auto-commit every once in a
while (~15sec) so commit is not necessary. Also, the default
TieredMergePolicy in Solr will automatically purge removed documents later,
so optimize is not necessary.

### Soft Commits

If soft commits are enabled, dovecot will perform a soft commit to Solr at the
end of transaction. This has the benefit that search results are immediately
available. You can also enable automatic commits in SOLR config, with

```xml
<autoSoftCommit>
  <maxTime>60000</maxTime>
</autoSoftCommit>
```

or setting it in `solrconfig.xml` with

```xml
${solr.autoSoftCommit.maxTime:60000}
```

## Re-index Mailbox

If you require Dovecot to reindex a whole mailbox, you can run
[[doveadm,fts rescan]]. This command will only take action when a search is
done and will apply to the whole mailbox.

If you want to index a single mailbox/all mailboxes you can run
[[doveadm,index]].This command will happen immediately and will block until the
indexing is completed.

## Sorting by Relevancy

Solr/Lucene supports returning a relevancy score for search results. If
you want to sort the search results by the score, use Dovecot's
non-standard X-SCORE sort key:

```
1 SORT (X-SCORE) UTF-8 <search parameters>
```

## Solr Indexes

Dovecot creates the following fields:

- id: Unique ID consisting of uid/uidv/user/box.

  - Note that your user names really shouldn't contain '/' character.

- uid: Message's IMAP UID.

- uidv: Mailbox's UIDVALIDITY. This changes if mailbox gets recreated.

- box: Mailbox name

- user: User name who owns the mailbox, or empty for public namespaces

- hdr: Indexed message headers

- body: Indexed message body

- any: "Copy field" from hdr and body, i.e. searching based on this
  will search from both headers and bodies.

Lucene/Solr does duplicate suppression based on the "id" field, so even if
Dovecot sends the same message multiple times to Solr it gets indexed
only once. This might happen currently if multiple searches are started
at the same time.

You might want to build a cronjob to go through the Solr/Lucene indexes once
in a while to delete indexed messages (or entire mailboxes) that no
longer exist on the filesystem. It shouldn't normally find any such
messages though.

## Testing

```
# telnet localhost imap
* OK [CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS MULTIAPPEND UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS STARTTLS AUTH=PLAIN AUTH=LOGIN] I am ready.
1 login username password
2 select Inbox
3 SEARCH text "test"
```

## Sharding

If you have more users than fit into a single Solr box, you can split
users off to different servers. A couple of different ways you could do
it are:

- Have some HTTP proxy redirecting the connections based on the URL

- Configure Dovecot's userdb lookup to return a different host for
  [[setting,fts_solr]] setting using [[link,userdb_extra_fields]].

  - LDAP: `user_attrs = ..., solrHost=fts_solr=url=https://%$:8983/solr/dovecot/`
  - MySQL: `user_query = SELECT concat('url=https://', solr_host, ':8983/solr/dovecot/') AS fts_solr, ...`

You can also use
[SolrCloud](https://lucene.apache.org/solr/guide/7_6/solrcloud.html),
the clustered version of Solr, that allows you to scale up, and adds
failover / high availability to your FTS system. Dovecot-solr works fine
with a SolrCloud cluster as long as the solr schema is the right one.

## External Tutorials

External sites with tutorials on using Solr under Dovecot

-  [FreeBSD](https://mor-pah.net/2016/08/15/dovecot-2-2-with-solr-6-or-5/)

-  [Substring searches with ngrams](https://dovecot.org/list/dovecot/2011-May/059338.html)

## Tips

Some additional things which might help you configuring Solr search:

- If you are using Tomcat: Set `maxHttpHeaderSize="65536"` (connector
  definition for port 8080 in `/etc/tomcat7/server.xml`) to accept
  long search query strings (iPhones tend to send multi-kilobyte-sized
  queries)

- Set `df` to `hdr` in `/etc/solr/conf/solrconfig.xml`
  (`/select` request handler) to avoid strange `undefined field text` errors.

- Please keep in mind that you will have to change the Solr URL to
  include the core name (ie: `dovecot`: `https://localhost:8939/solr/dovecot`).
