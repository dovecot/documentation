---
layout: doc
title: lib-asn1
dovecotlinks:
  lib_asn1: lib-asn1
---

# lib-asn1

lib-asn1 is a streaming encoder and decoder for ASN.1 BER and DER, built on
Dovecot's input and output streams. Its first user is an asynchronous LDAP
client, which reads LDAP messages from a nonblocking socket.

lib-asn1 depends only on `src/lib`. It does not use OpenSSL or OpenLDAP, and
all its symbols are prefixed `asn1_` / `ASN1_`, so it can be linked into the
same process with either. It is a separate `libasn1.la`, not part of
libdovecot; consumers link it directly.

The ASN.1 types (classes, universal tags) are generic; everything else is
specific to BER and its DER subset and is prefixed `asn1_ber_`.

## Encoding Rules

BER allows several encodings of the same value. DER is the subset where every
value has exactly one encoding. LDAP (RFC 4511 section 5.1) is BER with
restrictions of its own: lengths must be definite and OCTET STRINGs
primitive, but non-minimal length encodings are allowed. A strict DER decoder
would therefore reject valid LDAP traffic.

The decoder always enforces the rules that X.690 makes mandatory for every
BER encoding, such as minimal INTEGER encoding, the low-tag form for tag
numbers below 31 and the fixed primitive or constructed form of universal
types like INTEGER and SEQUENCE. The rules DER adds on top are selected with
parse flags:

| Flag | Rejects |
|---|---|
| `NO_INDEFINITE` | Indefinite length encoding |
| `NO_CONSTRUCTED_STRINGS` | Constructed (segmented) string types |
| `MINIMAL_LENGTH` | Non-minimal length octets |
| `STRICT_BOOLEAN` | BOOLEAN true encoded as anything but `0xFF` |
| `DER_BIT_STRING` | Non-zero unused bits in a BIT STRING |

Two presets combine these: `ASN1_BER_PARSE_FLAGS_BER` (none) and
`ASN1_BER_PARSE_FLAGS_DER` (all). Protocols in between, such as LDAP, pass
the flags they need.

The decoder sees only tags, not the ASN.1 types behind them, so
`NO_CONSTRUCTED_STRINGS` can only recognize universal string tags. An
implicitly tagged string is checked by asking for a primitive element when
reading it.

Segmented (constructed) strings are not supported beyond walking over them:
the typed readers refuse them and their segments are not validated. LDAP
forbids them, and DER does not allow them.

Content that is skipped is not parsed. Skipping a definite-length element
jumps over its bytes, so errors inside it are not reported.

End-of-contents octets are accepted only as exactly two zero octets, in every
mode.

SET OF ordering is not checked, even in DER mode. Checking it would require
buffering every element of the set, which contradicts streaming. The encoder
does not sort either; callers that need DER SET OF ordering produce the
elements in order.

## Decoding

`asn1_ber_istream` is a pull parser on top of an istream. The caller asks for
the next element, looks at its header (class, tag number, constructed or
primitive, length) and decides what to do with it:

- descend into a constructed element,
- read a primitive element's value, either as raw bytes or through a typed
  reader (BOOLEAN, INTEGER, OID, strings),
- skip the element, or
- ascend out of the current constructed element, abandoning whatever is left
  of it.

Reaching the end of a constructed element, by its definite length or by an
end-of-contents marker, is reported as an end element at that depth.
`asn1_ber_istream_walk()` combines these into a depth-first traversal of every
element, which is what dump tools and fuzzers use.

### Nonblocking Input

Every call returns 1 when it has a result, 0 when it needs more input and -1
on error. A 0 leaves the parser exactly where it was: calling the same
function again once more input has arrived gives the same result as if all
of the input had been there the first time, so a consumer can return to the
ioloop whenever the socket runs dry. The LDAP client works at the message
level instead: it waits for one complete message, then decodes it in one
pass from memory into structures that own copies of their values.

This works because nothing is consumed from the input until a whole element
header is buffered. A header is at most 15 bytes, so the parser simply
re-parses it from the start when more data arrives instead of remembering
partial state. Reading the current element again is idempotent until the
caller moves on.

Skipping and ascending are lazy. They only record what has to be skipped: the
absolute offset where a definite-length element ends, or the target nesting
depth when an indefinite-length element has to be scanned for its
end-of-contents marker. The bytes are discarded by the next read, a buffer's
worth at a time, so skipping a large element never waits for all of it to
arrive and never reads past what is buffered. Recording targets rather than
running counts keeps any sequence of skip and ascend calls consistent.

### Values

The parser never duplicates payload. A value's bytes are copied at most once,
straight into the storage where the consumer keeps them, or not at all when
the consumer only looks at them:

- Reading a value returns a pointer into the input stream's own buffer once
  the whole value has arrived. Typed readers such as INTEGER and OID decode
  from that view directly.
- A value that is kept is appended to the caller's buffer, a piece at a time
  as input arrives, or copied as a string into the caller's memory pool.
- A value too large to keep in memory at all, such as a large LDAP attribute
  value, is read as an istream limited to the value's length and passed on
  chunk by chunk. The parser does not move past the value until that stream
  has been read to its end, or until the caller skips the rest. A value
  stream still held after that fails cleanly instead of returning stale
  data.

Values kept in memory are limited to `max_value_size` (64 KiB by default),
checked against the declared length before anything is copied. Apart from a
small array tracking the nesting levels, the parser holds no buffers of its
own.

## Encoding

The difficulty in streaming BER output is that each element's length comes
before its content. The encoder handles this in two ways:

- By default, the content of an open constructed element is buffered and its
  header is written when the element is closed. Room for the identifier and
  a one-octet length is reserved when the element is opened, so content
  shorter than 128 bytes needs no moving; only a long-form length inserts
  its extra octets. This is simple and cheap for small messages such as LDAP
  requests.
- For large content, the caller declares the length when opening the
  element. The header is then written at once and the content streams
  straight to the output. Every primitive has a function returning its
  encoded size, so the length can be computed without encoding twice.

Indefinite length encoding is available only when the output is explicitly
BER. Patching lengths into the output afterwards is not used: sockets are not
seekable, and DER forbids the padded length fields it would need.

The encoder treats an encoding DER forbids as a caller bug: unless BER
output is enabled, a constructed string type or non-zero unused bits in a
BIT STRING trigger an assert. String content is not validated.

`asn1_ber_generator` is the low-level encoder, following lib-json's
`json_generator`: calls return 1, 0 or -1, and a 0 is resumed by calling
again. Primitive content is written straight to the output unless an
enclosing element is being buffered, so payload is never copied twice.
Content can also come from an istream: `asn1_ber_generate_octets_stream()`
only sets the element up, and `asn1_ber_generator_flush()` or the next call
writes the content as it arrives. A 0 can therefore mean either that the
output is full or that this input has no data yet.

`asn1_ber_ostream` is a convenience layer on top of it, like `json_ostream`.
Its n-functions never return 0; a failure is reported once by
`asn1_ber_ostream_nfinish()`, which must be called before the stream is
unreferenced. With a real output stream the caller then finishes that stream
itself with `o_stream_finish()`. An encoding error, such as an input stream
shorter than its declared length, is reported only through
`asn1_ber_ostream_get_error()` and leaves the output stream usable. When
pending stream content waits on its input rather than the output,
`asn1_ber_ostream` wakes the output's flush callback once that input becomes
readable.

## Limits

Input is assumed hostile. Every decoder has limits, with these defaults:

| Limit | Default |
|---|---|
| Nesting depth | 32 |
| Size of a value kept in memory | 64 KiB |
| Content length of a single element | 16 MiB |

The LDAP client sets the element length limit to its maximum message size.
In addition:

- A length field with more octets than fit in `uoff_t` is rejected. BER
  allows any number of leading zero octets, so this is a deliberate deviation
  that bounds header size.
- Tag numbers, lengths, offsets and OID arcs are checked for overflow before
  they are used.
- A child element, or even just its header, that would run past the end of
  its parent is rejected at once. Waiting for more input in that case would
  hang a request/response client waiting for bytes that never come.
- Nesting depth is enforced while skipping, not only on descend.
- Calling a reader that does not fit the element, such as reading a value
  from a constructed element, returns an error. The shape of the input is
  controlled by the peer, so it never triggers an assert.

## Debugging

`doveadm dump -t asn1 <file>` prints the structure of a BER or DER file, one
line per element, similar to `openssl asn1parse`.
